
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ------------------------------------------
// TYPES
// ------------------------------------------

type Frequency = "ONE_TIME" | "WEEKLY" | "MONTHLY_TWICE";

type ScheduleInput = {
  title: string;
  description?: string;
  frequency: Frequency;
  startDate: string;
  endDate?: string;
  startTime: string;
  duration: number;
  weeklyDay?: number;
  firstDay?: number;
  secondDay?: number;
  selectedCourse?: string | number | null;
};

// ------------------------------------------
// DATE HELPERS
// ------------------------------------------

function indiaDateTime(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number
) {
  return new Date(
    Date.UTC(year, month - 1, day, hours - 5, minutes - 30)
  );
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error("Invalid date format.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Invalid calendar date.");
  }

  return { year, month, day };
}

function parseTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    throw new Error("Invalid start time.");
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return {
    hours,
    minutes,
    totalMinutes: hours * 60 + minutes,
  };
}

// ------------------------------------------
// SESSION GENERATOR
// ------------------------------------------

function generateSessions(input: ScheduleInput) {
  const start = parseDate(input.startDate);
  const time = parseTime(input.startTime);

  const startBoundary = Date.UTC(
    start.year,
    start.month - 1,
    start.day
  );

  let endBoundary: number;

  if (input.endDate) {
    const end = parseDate(input.endDate);

    endBoundary = Date.UTC(
      end.year,
      end.month - 1,
      end.day
    );

    if (endBoundary < startBoundary) {
      throw new Error("End date cannot be before start date.");
    }
  } else if (input.frequency === "ONE_TIME") {
    endBoundary = startBoundary;
  } else {
    // Generate the next 90 days when no end date is provided.
    endBoundary = startBoundary + 90 * 24 * 60 * 60 * 1000;
  }

  const sessions: {
    scheduledAt: Date;
    title: string;
    durationMinutes: number;
    roomName: string;
  }[] = [];

  function addSession(year: number, month: number, day: number) {
    const scheduledAt = indiaDateTime(
      year,
      month,
      day,
      time.hours,
      time.minutes
    );

    sessions.push({
      title: input.title,
      scheduledAt,
      durationMinutes: input.duration,
      roomName: `kbc-${randomUUID()}`,
    });
  }

  // ONE TIME
  if (input.frequency === "ONE_TIME") {
    addSession(start.year, start.month, start.day);
  }

  // WEEKLY
  else if (input.frequency === "WEEKLY") {
    if (
      input.weeklyDay === undefined ||
      !Number.isInteger(input.weeklyDay) ||
      input.weeklyDay < 0 ||
      input.weeklyDay > 6
    ) {
      throw new Error("Please select a valid weekday.");
    }

    for (
      let current = startBoundary;
      current <= endBoundary;
      current += 24 * 60 * 60 * 1000
    ) {
      const date = new Date(current);

      if (date.getUTCDay() === input.weeklyDay) {
        addSession(
          date.getUTCFullYear(),
          date.getUTCMonth() + 1,
          date.getUTCDate()
        );
      }
    }
  }

  // MONTHLY TWICE
  else if (input.frequency === "MONTHLY_TWICE") {
    const first = input.firstDay;
    const second = input.secondDay;

    if (
      first === undefined ||
      second === undefined ||
      !Number.isInteger(first) ||
      !Number.isInteger(second) ||
      first < 1 ||
      first > 31 ||
      second < 1 ||
      second > 31 ||
      first === second
    ) {
      throw new Error("Please select two different valid monthly dates.");
    }

    let year = start.year;
    let month = start.month;

    while (Date.UTC(year, month - 1, 1) <= endBoundary) {
      for (const day of [first, second]) {
        const candidate = new Date(
          Date.UTC(year, month - 1, day)
        );

        // Skip dates that do not exist in this month.
        if (
          candidate.getUTCMonth() !== month - 1 ||
          candidate.getUTCFullYear() !== year
        ) {
          continue;
        }

        const candidateBoundary = candidate.getTime();

        if (
          candidateBoundary >= startBoundary &&
          candidateBoundary <= endBoundary
        ) {
          addSession(year, month, day);
        }
      }

      month++;

      if (month > 12) {
        month = 1;
        year++;
      }
    }
  }

  if (sessions.length === 0) {
    throw new Error("No sessions could be generated for this schedule.");
  }

  if (sessions.length > 500) {
    throw new Error("Too many sessions. Please reduce the schedule range.");
  }

  return sessions;
}

// ==========================================
// GET - FETCH ALL LIVE CLASSES
// ==========================================

export async function GET() {
  try {
    const liveClasses = await prisma.liveClassSeries.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        course: true,
        sessions: {
          orderBy: {
            scheduledAt: "asc",
          },
          include: {
            recordings: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: liveClasses,
    });
  } catch (error) {
    console.error("Fetch live classes error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch live classes.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// POST - CREATE LIVE CLASS
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ScheduleInput;

    const {
      title,
      description,
      frequency,
      startDate,
      endDate,
      startTime,
      duration,
      weeklyDay,
      firstDay,
      secondDay,
      selectedCourse,
    } = body;

    // --------------------------------------
    // BASIC VALIDATION
    // --------------------------------------

    if (
      typeof title !== "string" ||
      !title.trim() ||
      !frequency ||
      !startDate ||
      !startTime ||
      duration === undefined ||
      duration === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all required fields.",
        },
        { status: 400 }
      );
    }

    if (
      !["ONE_TIME", "WEEKLY", "MONTHLY_TWICE"].includes(frequency)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid class frequency.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 600
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration must be between 1 and 600 minutes.",
        },
        { status: 400 }
      );
    }

    if (
      typeof description !== "undefined" &&
      description !== null &&
      typeof description !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid description.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------
    // VALIDATE DATE AND TIME
    // --------------------------------------

    const time = parseTime(startTime);
    const start = parseDate(startDate);

    const sessions = generateSessions({
      title: title.trim(),
      description: description ?? undefined,
      frequency,
      startDate,
      endDate,
      startTime,
      duration,
      weeklyDay,
      firstDay,
      secondDay,
      selectedCourse,
    });

    const startsOn = indiaDateTime(
      start.year,
      start.month,
      start.day,
      time.hours,
      time.minutes
    );

    const endsOn = endDate
      ? (() => {
          const end = parseDate(endDate);

          return indiaDateTime(
            end.year,
            end.month,
            end.day,
            23,
            59
          );
        })()
      : null;

    // --------------------------------------
    // VALIDATE SELECTED COURSE
    // --------------------------------------

    const courseId =
      selectedCourse !== undefined &&
      selectedCourse !== null &&
      selectedCourse !== ""
        ? Number(selectedCourse)
        : null;

    if (
      courseId !== null &&
      (!Number.isInteger(courseId) || courseId <= 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid course selection.",
        },
        { status: 400 }
      );
    }

    // Confirm that the selected course exists in the database.
    if (courseId !== null) {
      const course = await prisma.course.findUnique({
        where: {
          id: courseId,
        },
        select: {
          id: true,
        },
      });

      if (!course) {
        return NextResponse.json(
          {
            success: false,
            message: `Selected course ID ${courseId} does not exist. Please refresh the course list and select a valid course.`,
          },
          { status: 400 }
        );
      }
    }

    // --------------------------------------
    // CREATE SERIES AND SESSIONS
    // --------------------------------------

    const result = await prisma.$transaction(async (tx) => {
      const series = await tx.liveClassSeries.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          frequency,
          startsOn,
          endsOn,
          startTimeMinutes: time.totalMinutes,
          durationMinutes: duration,
          weeklyDayOfWeek:
            frequency === "WEEKLY" ? weeklyDay : null,
          monthlyFirstDay:
            frequency === "MONTHLY_TWICE" ? firstDay : null,
          monthlySecondDay:
            frequency === "MONTHLY_TWICE" ? secondDay : null,
          timezone: "Asia/Kolkata",
          courseId,
        },
      });

      await tx.liveSession.createMany({
        data: sessions.map((session) => ({
          ...session,
          seriesId: series.id,
          status: "SCHEDULED",
        })),
      });

      return tx.liveClassSeries.findUnique({
        where: {
          id: series.id,
        },
        include: {
          course: true,
          sessions: {
            orderBy: {
              scheduledAt: "asc",
            },
            include: {
              recordings: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Live class scheduled successfully.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create live class error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to schedule live class.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
