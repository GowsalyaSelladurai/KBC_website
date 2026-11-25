import Sidebar from "@/components/admin/Sidebar";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (<div className="min-h-screen md:grid md:grid-cols-[230px_1fr]"><Sidebar /><main className="min-w-0 p-5 md:p-8">{children}</main></div>);
}
