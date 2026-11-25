import Link from "next/link";
export default function Footer() {
  return (<footer className="mt-12 border-t border-line py-8 text-sm text-mute"><div className="wrap flex flex-wrap justify-between gap-3"><span>© 2026 KBC Saloon Academy (Kavyas Beauty Centre)</span><Link href="/admin" className="hover:text-gold">Admin portal</Link></div></footer>);
}
