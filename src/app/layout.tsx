import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "影展地图 | 探索世界的每一帧",
  description: "一个以地图为导航的摄影作品展览平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
