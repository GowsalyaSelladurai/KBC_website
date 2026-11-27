import { NextRequest, NextResponse } from "next/server";
import {
  validateIdentifier,
  verifyCourseLearningAccess,
} from "@/lib/learning/accessBoundary";
import {
  getLessonPlaybackForStudent,
  LearningRuleError,
} from "@/lib/learning/progression";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } },
) {
  try {
    const lessonCheck = validateIdentifier(params.lessonId, "lessonId");
    if (lessonCheck.valid === false) {
      return NextResponse.json(
        { error: lessonCheck.error },
        { status: lessonCheck.status },
      );
    }

    const studentKey = request.nextUrl.searchParams.get("studentKey");
    const access = await verifyCourseLearningAccess({
      studentKey,
      courseId: params.id,
    });

    if (access.allowed === false) {
      return NextResponse.json(
        { error: access.error, reason: access.reason },
        { status: access.status },
      );
    }

    const result = await getLessonPlaybackForStudent({
      studentKey: access.studentKey,
      courseId: access.courseId,
      lessonId: lessonCheck.value,
    });

    return NextResponse.json({
      ...result,
      accessMode: access.mode,
    });
  } catch (err) {
    if (err instanceof LearningRuleError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Failed to authorize lesson playback:", err);
    return NextResponse.json(
      { error: "Unable to load lesson playback." },
      { status: 500 },
    );
  }
}
