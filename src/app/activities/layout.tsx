import AppFooter from "@/app/_components/AppFooter";
import AppHeader from "@/app/_components/AppHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "交流コンテンツ | よっとこ！新庄村",
  description: "新庄村の交流コンテンツ（体験メニュー）一覧",
};

export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ヘッダー */}
      <AppHeader maxWidth="max-w-3xl" />

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-3xl px-6 py-14 text-lg leading-relaxed">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}
