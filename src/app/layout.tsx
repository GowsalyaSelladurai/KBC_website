import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
export const metadata: Metadata = { title: "KBC Saloon Academy", description: "Online beauty & makeover classes by Kavyas Beauty Centre" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={`${sans.variable} ${serif.variable}`}><body>{children}</body></html>);
}
