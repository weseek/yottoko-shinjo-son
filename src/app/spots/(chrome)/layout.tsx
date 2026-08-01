import AppFooter from "@/app/_components/AppFooter";
import AppHeader from "@/app/_components/AppHeader";
import CharacterContainer from "@/app/_components/CharacterContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "スポット | よっとこ！新庄村",
  description: "新庄村のスポット一覧 — AR記念撮影スポット",
};

export default function SpotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-neutral-50)]">
      {/* ヘッダー */}
      <AppHeader maxWidth="max-w-3xl" />

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-3xl px-4 py-10 text-[18px] leading-[1.6] sm:px-6">
        {children}
      </main>

      <CharacterContainer
        leftSrc="/assets/character/siro-egao.png"
        rightSrc="/assets/character/kuro-egao.png"
      />
      <AppFooter />
    </div>
  );
}
