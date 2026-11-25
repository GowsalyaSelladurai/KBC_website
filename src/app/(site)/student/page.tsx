import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { myEnrollments, listLive, myRecordings } from "@/lib/queries";
import StudentTabs from "@/components/StudentTabs";
export default async function Student() {
  const u = await getUser(); if (!u || u.role !== "student") redirect("/login");
  return <StudentTabs name={u.name.split(" ")[0]} enrollments={await myEnrollments(u.id)} live={await listLive()} recordings={await myRecordings(u.id)} />;
}
