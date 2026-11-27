import { NextRequest, NextResponse } from "next/server";
import {
  validateIdentifier,
  verifyCourseLearningAccess,
} from "@/lib/learning/accessBoundary";
import {
  completeLessonForStudent,
  LearningRuleError,
} from "@/lib/learning/progression";

export const dynamic = "force-dynamic";

export async function POST(
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 },
      );
    }

    const { studentKey } = body as { studentKey?: unknown };

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

    const result = await completeLessonForStudent({
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
    console.error("Failed to complete lesson:", err);
    return NextResponse.json(
      { error: "Unable to complete lesson." },
      { status: 500 },
    );
  }
}
