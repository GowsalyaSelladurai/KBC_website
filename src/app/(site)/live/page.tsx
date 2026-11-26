import LiveList from "@/components/LiveList";
export default function Live() {
  return (<div className="wrap py-12"><h1 className="text-4xl font-bold">Live <span className="text-gold">classes</span></h1><p className="mb-5 mt-2 text-mute">Weekly or monthly sessions. Recordings can be added to courses by the academy.</p><LiveList /></div>);
}
