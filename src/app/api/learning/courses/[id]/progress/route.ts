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
      ...progression,
      accessMode: access.mode,
    });
  } catch (err) {
    if (err instanceof LearningRuleError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Failed to fetch course progression:", err);
    return NextResponse.json(
      { error: "Unable to load course progression." },
      { status: 500 },
    );
  }
}
