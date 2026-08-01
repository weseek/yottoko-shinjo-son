import AppFooter from "@/app/_components/AppFooter";
import AppHeader from "@/app/_components/AppHeader";
import CharacterContainer from "@/app/_components/CharacterContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ひめっこと撮影 | よっとこ！新庄村",
  description: "新庄村のキャラクター「ひめっこ」とAR記念撮影を楽しもう",
};

export default function CameraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-arcana-bg">
      {/* ヘッダー */}
      <AppHeader maxWidth="max-w-lg" />

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-lg">{children}</main>

      <CharacterContainer
        leftSrc="/assets/character/siro-egao.png"
        rightSrc="/assets/character/kuro-egao.png"
      />
      <AppFooter />
    </div>
  );
}
