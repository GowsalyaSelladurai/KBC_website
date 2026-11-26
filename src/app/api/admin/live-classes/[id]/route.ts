import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// ==========================================
// GET - FETCH ONE LIVE CLASS
// ==========================================

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const seriesId = Number(id);

    if (!Number.isInteger(seriesId) || seriesId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid class ID." },
        { status: 400 }
      );
    }

    const liveClass = await prisma.liveClassSeries.findUnique({
      where: { id: seriesId },
      include: {
        course: true,
        sessions: {
          orderBy: { scheduledAt: "asc" },
          include: {
            recordings: {
              include: {
                course: true,
              },
            },
            attendance: true,
          },
        },
      },
    });

    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: "Live class not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: liveClass,
    });
  } catch (error) {
    console.error("Fetch live class error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch live class." },
      { status: 500 }
    );
  }
}

// ==========================================
// PATCH - UPDATE OR CANCEL LIVE CLASS
// ==========================================

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const seriesId = Number(id);

    if (!Number.isInteger(seriesId) || seriesId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid class ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existing = await prisma.liveClassSeries.findUnique({
      where: { id: seriesId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Live class not found." },
        { status: 404 }
      );
    }

    // --------------------------------------
    // CANCEL CLASS
    // --------------------------------------

    if (body.action === "CANCEL") {
      if (!existing.isActive) {
        return NextResponse.json(
          {
            success: false,
            message: "This class is already cancelled.",
          },
          { status: 400 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedSeries = await tx.liveClassSeries.update({
          where: { id: seriesId },
          data: { isActive: false },
        });

        await tx.liveSession.updateMany({
          where: {
            seriesId,
            status: "SCHEDULED",
          },
          data: {
            status: "CANCELLED",
          },
        });

        return updatedSeries;
      });

      return NextResponse.json({
        success: true,
        message: "Live class cancelled successfully.",
        data: result,
      });
    }

    // --------------------------------------
    // UPDATE CLASS DETAILS
    // --------------------------------------

    const updateData: {
      title?: string;
      description?: string | null;
      courseId?: number | null;
    } = {};

    // UPDATE TITLE

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim()
      ) {
        return NextResponse.json(
          { success: false, message: "Class title is required." },
          { status: 400 }
        );
      }

      updateData.title = body.title.trim();
    }

    // UPDATE DESCRIPTION

    if (body.description !== undefined) {
      if (
        body.description !== null &&
        typeof body.description !== "string"
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid description." },
          { status: 400 }
        );
      }

      updateData.description =
        body.description?.trim() || null;
    }

    // UPDATE COURSE

    if (body.courseId !== undefined) {
      if (
        body.courseId === null ||
        body.courseId === ""
      ) {
        updateData.courseId = null;
      } else {
        const courseId = Number(body.courseId);

        if (!Number.isInteger(courseId) || courseId <= 0) {
          return NextResponse.json(
            { success: false, message: "Invalid course ID." },
            { status: 400 }
          );
        }

        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { id: true },
        });

        if (!course) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Selected course does not exist. Please refresh the course list.",
            },
            { status: 400 }
          );
        }

        updateData.courseId = courseId;
      }
    }

    // CHECK WHETHER ANYTHING WAS UPDATED

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid changes provided.",
        },
        { status: 400 }
      );
    }

    // SAVE UPDATED CLASS

    const updatedClass = await prisma.liveClassSeries.update({
      where: { id: seriesId },
      data: updateData,
      include: {
        course: true,
        sessions: {
          orderBy: { scheduledAt: "asc" },
          include: {
            recordings: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Live class updated successfully.",
      data: updatedClass,
    });
  } catch (error) {
    console.error("Update live class error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update live class.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE - PERMANENTLY DELETE CANCELLED CLASS
// ==========================================

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const seriesId = Number(id);

    if (!Number.isInteger(seriesId) || seriesId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid class ID." },
        { status: 400 }
      );
    }

    // FIND CLASS AND RELATED RECORDS

    const existing = await prisma.liveClassSeries.findUnique({
      where: { id: seriesId },
      include: {
        sessions: {
          select: {
            id: true,
            recordings: {
              select: {
                id: true,
              },
            },
            attendance: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Live class not found." },
        { status: 404 }
      );
    }

    // ONLY CANCELLED CLASSES CAN BE DELETED

    if (existing.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please cancel this class before deleting it.",
        },
        { status: 400 }
      );
    }

    // PROTECT RECORDINGS

    const hasRecordings = existing.sessions.some(
      (session) => session.recordings.length > 0
    );

    if (hasRecordings) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This class contains recordings. Please handle the recordings before deleting this class.",
        },
        { status: 409 }
      );
    }

    // PROTECT ATTENDANCE RECORDS

    const hasAttendance = existing.sessions.some(
      (session) => session.attendance.length > 0
    );

    if (hasAttendance) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This class contains attendance records and cannot be deleted.",
        },
        { status: 409 }
      );
    }

    // DELETE SESSIONS AND SERIES IN ONE TRANSACTION

    await prisma.$transaction(async (tx) => {
      await tx.liveSession.deleteMany({
        where: {
          seriesId,
        },
      });

      await tx.liveClassSeries.delete({
        where: {
          id: seriesId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Cancelled live class deleted successfully.",
    });
  } catch (error) {
    console.error("Delete live class error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete this live class. Please try again.",
      },
      { status: 500 }
    );
  }
}