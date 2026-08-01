import { env } from "@/env";
import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-maru-gothic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "よっとこ！新庄村",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={zenMaruGothic.variable}>
        {children}
        {/* Umami アクセス解析 (Cookieless)。env が両方揃う本番のみ出力 */}
        {env.UMAMI_SCRIPT_URL && env.UMAMI_WEBSITE_ID && (
          <Script
            src={env.UMAMI_SCRIPT_URL}
            data-website-id={env.UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
