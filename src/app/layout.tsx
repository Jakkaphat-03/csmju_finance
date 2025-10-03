import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบรายรับ-รายจ่าย",
  description: "โปรเจ็กต์ทดสอบด้วย Next.js + Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen w-full bg-black text-white">
        {children}
      </body>
      
    </html>
  ); 
}
