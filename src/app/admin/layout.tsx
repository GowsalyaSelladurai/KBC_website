
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
      {children}
      <KbcAIAssistant />
    </AdminLayout>
  );
}
