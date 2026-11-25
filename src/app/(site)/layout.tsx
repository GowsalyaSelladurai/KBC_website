import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export const dynamic = "force-dynamic";
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (<><Navbar /><main>{children}</main><Footer /></>);
}
