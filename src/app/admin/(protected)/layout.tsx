import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/login");

  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <Sidebar />
      <main className="min-w-0 p-5 md:p-8">{children}</main>
    </div>
  );
}
