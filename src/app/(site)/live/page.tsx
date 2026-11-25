import LiveList from "@/components/LiveList";
import { listLive } from "@/lib/queries";
export default async function Live() {
  return (<div className="wrap py-12"><h1 className="text-4xl font-bold">Live <span className="text-gold">classes</span></h1><p className="mb-5 mt-2 text-mute">Weekly or monthly sessions with the academy team.</p><LiveList items={await listLive()} /></div>);
}
