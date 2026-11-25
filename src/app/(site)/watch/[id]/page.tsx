import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getCourse } from "@/lib/queries";
import { q } from "@/lib/db";
import VideoPlayer from "@/components/VideoPlayer";
export default async function Watch({ params }: { params: { id: string } }) {
  const u = await getUser(); if (!u) redirect("/login");
  const c = await getCourse(Number(params.id)); if (!c) notFound();
  const [a] = await q("select 1 from enrollments where user_id=$1 and course_id=$2 and expires_at>now() and payment_status='paid'", [u.id, c.id]);
  if (!a && u.role !== "admin") return (<div className="wrap py-16"><div className="card max-w-md"><h1 className="text-2xl font-bold">Access expired</h1><p className="my-3 text-mute">Your access to {c.name} has ended.</p><Link href={`/courses/${c.id}`} className="btn">Re-enroll</Link></div></div>);
  const done = await q("select p.video_id from video_progress p join videos v on v.id=p.video_id where p.user_id=$1 and v.course_id=$2 and p.completed", [u.id, c.id]);
  return (<div className="wrap py-8"><Link href="/student" className="text-sm text-mute">← My learning</Link><h1 className="mb-4 mt-2 text-3xl font-bold">{c.name}</h1>
    <VideoPlayer videos={c.videos} doneIds={done.map((d: any) => d.video_id)} watermark={`${u.email}${u.phone ? " · " + u.phone : ""}`} /></div>);
}
