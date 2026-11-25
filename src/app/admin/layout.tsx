import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0a08]">
      <div className="hidden w-[220px] shrink-0 md:block">
        <div className="fixed inset-y-0 left-0 z-30 w-[220px]">
          <Sidebar />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 px-5 pb-8 pt-4 md:px-8">{children}</main>
      </div>
    </div>
  );
}
