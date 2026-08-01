import AppFooter from "@/app/_components/AppFooter";
import AppHeader from "@/app/_components/AppHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "よっとこ！新庄村",
};

export default function EntriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ヘッダー (申込フォーム等と共通の AppHeader を使用) */}
      <AppHeader maxWidth="max-w-3xl" />

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-3xl px-6 py-14 text-lg leading-relaxed">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}
