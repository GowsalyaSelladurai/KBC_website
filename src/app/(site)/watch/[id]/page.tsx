import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse } from "@/data/mock";
import VideoPlayer from "@/components/VideoPlayer";
export default function Watch({ params, searchParams }: { params: { id: string }; searchParams: { done?: string } }) {
  const c = getCourse(Number(params.id)); if (!c) notFound();
  return (<div className="wrap py-8"><Link href="/student" className="text-sm text-mute">← My learning</Link><h1 className="mb-4 mt-2 text-3xl font-bold">{c.name}</h1><VideoPlayer course={c} startDone={Number(searchParams.done) || 0} /></div>);
}
