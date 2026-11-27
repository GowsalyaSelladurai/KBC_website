"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CourseEditorForm, {
  type InitialCourseData,
} from "@/components/admin/courses/CourseEditorForm";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<InitialCourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load course.");
        }
        setCourse(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load course.",
        );
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-[#aaa59a]">
        Loading course details...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <p className="text-sm text-rose-300">{error || "Course not found."}</p>
        <button
          type="button"
          onClick={() => router.push("/admin/courses")}
          className="mt-4 rounded-xl border border-[#c9a66a]/40 px-4 py-2 text-xs text-[#d8b16d]"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return <CourseEditorForm mode="edit" initialCourse={course} />;
}
