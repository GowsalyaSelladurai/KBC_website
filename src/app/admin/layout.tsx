
import type { ReactNode } from "react";
import AdminLayout from "@/components/AdminLayout";
import KbcAIAssistant from "@/components/KbcAIAssistant";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminLayout>
      <div className="kbc-admin-pages-theme min-h-screen bg-[#FAF5ED] text-[#242424]">
        {children}
      </div>

      <KbcAIAssistant />
    </AdminLayout>
  );
}
