import CourseBrowser from "@/components/CourseBrowser";
export default function Courses() {
  return (<div className="wrap py-12"><h1 className="mb-5 text-4xl font-bold">All <span className="text-gold">courses</span></h1><CourseBrowser search /></div>);
}
