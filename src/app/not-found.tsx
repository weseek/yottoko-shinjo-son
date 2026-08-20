import AppHeader from "@/app/_components/AppHeader";
import CharacterContainer from "@/app/_components/CharacterContainer";
import NotFoundBackLink from "@/app/_components/NotFoundBackLink";
import { env } from "@/env";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ページが見つかりません | よっとこ！新庄村",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ヘッダー */}
      <AppHeader maxWidth="max-w-3xl" />

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        {/* 猫イラスト */}
        <div className="mb-6">
          <CharacterContainer
            leftSrc="/assets/character/siro-ojigi.png"
            rightSrc="/assets/character/kuro-ojigi.png"
            gapClassName="gap-8"
          />
        </div>

        {/* 404見出し・説明文 */}
        <h1 className="text-4xl font-bold leading-[1.5] text-balance text-arcana-green">
          404
        </h1>
        <p className="mt-4 text-base font-bold leading-[1.5] text-pretty text-arcana-green">
          お探しのページは見つかりませんでした
        </p>

        {/* 戻り先リンク */}
        <div className="mt-8">
          <NotFoundBackLink />
        </div>
      </main>

      {/* 簡略フッター（お問い合わせ導線と著作権表示のみ） */}
      <footer className="py-8 text-center">
        <a
          href={`mailto:${env.CONTACT_EMAIL}`}
          className="mb-2 block text-sm leading-[1.5] text-arcana-orange-secondary underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcana-orange-secondary"
        >
          お問い合わせ
        </a>
        <p className="text-sm leading-[1.5] text-arcana-orange-secondary">
          &copy; 2026 岡山県真庭郡新庄村 × 株式会社WESEEK
        </p>
      </footer>
    </div>
  );
}
