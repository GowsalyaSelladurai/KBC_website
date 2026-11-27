import Link from "next/link";

export type PublicCourse = {
  id: string;
  courseCode: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  duration: string | null;
  price: number;
  lessonCount: number;
};

export default function CourseCard({ c }: { c: PublicCourse }) {
  return (
    <div className="card flex flex-col gap-2 transition hover:-translate-y-1 hover:border-gold">
      <div className="h-32 overflow-hidden rounded-xl border border-line bg-gradient-to-br from-[#262a2a] to-ink">
        {c.imageUrl ? (
          <img
            src={c.imageUrl}
            alt={c.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-4xl text-gold/40">
            ✦
          </div>
        )}
      </div>
      <span className="tag w-fit">{c.duration || "Self-paced"}</span>
      <h3 className="text-lg">{c.title}</h3>
      <p className="text-sm text-mute">
        {c.lessonCount} {c.lessonCount === 1 ? "lesson" : "lessons"}
      </p>
      <div className="mt-auto flex items-center justify-between pt-2">
        <b className="text-gold">₹{c.price.toLocaleString("en-IN")}</b>
        <Link href={`/courses/${c.id}`} className="btn btn-sm">
          View course
        </Link>
      </div>
    </div>
  );
}
