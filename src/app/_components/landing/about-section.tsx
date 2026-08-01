import Image from "next/image";

export function AboutSection() {
  return (
    <section
      className="w-full bg-[var(--color-neutral-0)]"
      aria-label="ABOUTセクション"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-12 lg:px-8 lg:py-24">
        {/* PC（lg:）: 見出し左・説明文右を中央寄せで横並び / スマホ: シングルカラム縦積み */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-14">
          {/* 左カラム: ラベル + 見出し */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-arcana-orange)]">
              ABOUT
            </p>
            <h2 className="text-[2rem] font-bold leading-snug text-[var(--color-arcana-forest)]">
              <Image
                src="/assets/logo.svg"
                alt="よっとこ！新庄村"
                width={245}
                height={47}
                className="mb-1 mr-3 inline-block h-auto w-auto max-w-[370px] object-contain align-bottom lg:inline lg:mr-4 lg:max-w-[503px]"
              />
              とは？
            </h2>
          </div>

          {/* 右カラム: 説明文 + バナー */}
          <div className="flex flex-col gap-6">
            <p className="text-base leading-relaxed text-[var(--color-arcana-body-blue)] sm:text-lg">
              新庄村を訪れた人が、村の体験・手伝いに参加申し込みをしたり、
              <br />
              村内スポットの QR コードから AR フォトを撮れるウェブサービスです。
            </p>

            {/* 登録不要バナー */}
            <div
              className="rounded-lg bg-[var(--color-arcana-pale-orange)] px-5 py-4 lg:w-fit"
              role="note"
              aria-label="利用開始のご案内"
            >
              <p className="text-base leading-relaxed sm:text-lg">
                <span className="font-bold text-[var(--color-arcana-orange)]">
                  登録不要。
                </span>
                <br className="lg:hidden" />
                <span className="font-bold text-[var(--color-arcana-green)]">
                  スマートフォンのブラウザからすぐ使えます。
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
