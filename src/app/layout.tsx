import type { Metadata } from "next";
import { ToastContainer } from "@/components/toast-container";
import { QueryProvider } from "@/components/query-provider";
import { SentryInit } from "@/components/sentry-init";
import { NetworkStatus } from "@/components/network-status";
import { ErrorFilter } from "@/components/error-filter";
import "./globals.css";

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
      className="h-full antialiased"
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
