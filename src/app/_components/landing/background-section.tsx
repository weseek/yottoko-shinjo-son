import Image from "next/image";

export function BackgroundSection() {
  return (
    <section
      id="background"
      className="w-full overflow-hidden bg-[var(--color-arcana-green)]"
      aria-label="BACKGROUNDセクション"
    >
      {/* コンテナレベルの横パディングを廃止し、列ごとに管理することで
          写真列を右端まで届かせる */}
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-12">
        {/* テキストエリア（左カラム）- 左右パディングあり */}
        <div className="flex flex-col px-4 pt-16 pb-12 sm:px-6 lg:px-8 lg:py-20">
          {/* ラベル */}
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-arcana-orange)]">
            BACKGROUND
          </p>

          {/* セクション見出し h2 */}
          <h2 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight text-[var(--color-neutral-0)]">
            このサービスについて
          </h2>

          {/* 背景説明テキスト */}
          <p className="mt-6 text-base leading-relaxed text-[var(--color-neutral-0)] sm:text-lg">
            このサービスは、2026年3月に開催されたハッカソンから生まれました。
            <br />
            「新庄村の農業と観光客のつながりをつくる」をテーマに、学生エンジニアを含む19名が3泊4日で開発に挑戦。
            <br />
            そこで生まれたプロトタイプをもとに、村の人と旅人がゆるやかに交わる体験を届けたいという思いから、岡山県真庭郡新庄村と株式会社WESEEKが共同で継続開発し、実証実験として提供しています。
          </p>
        </div>

        {/* チーム写真エリア（モバイル: 左端は本文と揃え・右端は画面端まで / PC: 右カラム・ビューポート右端クリップ） */}
        <div className="overflow-hidden pb-16 pl-4 sm:pl-6 lg:min-w-0 lg:overflow-visible lg:py-16 lg:pl-0">
          <Image
            src="/assets/landing/hackathon-2026.png"
            alt="ハッカソン開発チームの集合写真"
            width={1334}
            height={644}
            className="w-full rounded-l-[80px] object-cover shadow-[var(--shadow-lg)] sm:ml-auto sm:w-[65vw] lg:ml-0 lg:w-[60vw] lg:max-w-[960px]"
          />
        </div>
      </div>
    </section>
  );
}
