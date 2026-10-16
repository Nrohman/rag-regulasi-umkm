import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UMKM Law AI Assistant",
  description: "RAG-Based Legal Navigator untuk Regulasi dan Perizinan UMKM di Indonesia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
