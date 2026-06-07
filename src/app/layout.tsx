import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "@/components/toast-container";
import { QueryProvider } from "@/components/query-provider";
import { SentryInit } from "@/components/sentry-init";
import { NetworkStatus } from "@/components/network-status";
import { ErrorFilter } from "@/components/error-filter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Douying—AI screenwriting",
  description: "多模态剧本创作工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // 抑制 Next.js RSC hydration 导致的 ERR_ABORTED 控制台错误
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <SentryInit />
        <ErrorFilter />
        <QueryProvider>
          <ToastContainer />
          {children}
          <NetworkStatus />
        </QueryProvider>
      </body>
    </html>
  );
}
