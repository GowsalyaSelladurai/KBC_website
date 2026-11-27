import LiveManager from "@/components/admin/LiveManager";
import { q } from "@/lib/db";
export default async function Page() { return <LiveManager items={await q("select id,title,starts_at,frequency,meeting_url from live_classes order by starts_at desc")} />; }
