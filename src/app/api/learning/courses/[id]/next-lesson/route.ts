import { NextRequest, NextResponse } from "next/server";
import { verifyCourseLearningAccess } from "@/lib/learning/accessBoundary";
import {
  getCourseProgression,
  LearningRuleError,
} from "@/lib/learning/progression";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const studentKey = request.nextUrl.searchParams.get("studentKey");
    const access = await verifyCourseLearningAccess({
      studentKey,
      courseId: params.id,
    });

    if (access.allowed === false) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status },
      );
    }

    const progression = await getCourseProgression({
      studentKey: access.studentKey,
      courseId: access.courseId,
    });

    return NextResponse.json({
      courseId: progression.courseId,
      courseTitle: progression.courseTitle,
      studentKey: progression.studentKey,
      nextLesson: progression.currentUnlockableLesson,
      summary: progression.summary,
      accessMode: access.mode,
    });
  } catch (err) {
    if (err instanceof LearningRuleError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Failed to fetch next unlockable lesson:", err);
    return NextResponse.json(
      { error: "Unable to determine next unlockable lesson." },
      { status: 500 },
    );
  }
}
