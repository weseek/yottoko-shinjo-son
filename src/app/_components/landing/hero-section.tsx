import { Icon } from "@/app/_components/Icon";
import { buttonClassName } from "@/app/_components/button-variants";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      className="w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to right, var(--color-neutral-50) 50%, var(--color-secondary-50) 50%)",
      }}
      aria-label="ヒーローセクション"
    >
      {/* PC（lg:）: Grid 2カラム（左=オフホワイト、右=薄緑） / スマホ: flex-col（order-first を有効化） */}
      <div className="mx-auto max-w-7xl flex flex-col lg:grid lg:grid-cols-2 lg:items-stretch">
        {/* テキストエリア（左カラム / オフホワイト背景） */}
        <div className="flex flex-col justify-center bg-[var(--color-neutral-50)] px-4 py-12 sm:px-8 md:px-24 lg:px-8 lg:py-20">
          <p className="text-lg leading-relaxed text-[var(--color-arcana-orange)]">
            岡山県 真庭郡 新庄村
          </p>

          <h1 className="md:mt-6 mt-4 text-5xl font-bold leading-[1.4] tracking-tight sm:text-6xl sm:leading-[1.4] lg:text-7xl lg:leading-[1.4]">
            <span className="text-[var(--color-arcana-body-blue)]">
              よっとこ！
            </span>
            <br />
            <span className="whitespace-nowrap">
              <span className="text-[var(--color-arcana-primary-green)]">
                村の暮らし
              </span>
              <span className="text-[var(--color-arcana-body-blue)]">へ。</span>
            </span>
          </h1>

          <p className="mt-6 lg:mt-12 text-base leading-loose text-[var(--color-arcana-body-blue)] sm:text-lg">
            新庄村の体験や人と、気軽につながり、
            <br className="hidden sm:inline" />
            「ちょっとうれしい交流のきっかけ」を作るサービスです。
          </p>

          <div className="mt-6 lg:mt-12 mx-auto grid w-fit grid-cols-1 gap-4 sm:mx-0 sm:flex sm:w-auto sm:flex-row sm:gap-4">
            <Link
              href="/activities"
              className={buttonClassName("standard", "px-6 py-3 sm:w-auto")}
            >
              体験・手伝いを見てみる
            </Link>

            {/* セカンダリ CTA: スポット一覧 */}
            <Link
              href="/spots"
              className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-6 py-3 text-base font-bold text-[var(--color-arcana-green)] no-underline transition-colors hover:bg-[var(--color-arcana-green-light)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
            >
              スポット一覧
              <Icon name="chevron-right" width={16} height={16} />
            </Link>
          </div>
        </div>

        {/* ビジュアルエリア（右カラム / 薄緑背景）
            モバイル: 固定高さで電話下部をクリップ、猫は左右端
            PC（lg:）: 通常フローで横並び・中央寄せ・底揃え */}
        <div className="order-first bg-[var(--color-secondary-50)] lg:order-last">
          <div className="relative mx-auto flex max-w-sm items-end justify-between overflow-hidden h-[300px] px-4 md:max-w-lg lg:max-w-none lg:h-auto lg:justify-center lg:gap-4 lg:overflow-visible lg:px-8 lg:py-20">
            {/* 白猫: モバイルは左端・底揃え / PCは中央寄せの左 */}
            <Image
              src="/assets/character/siro-egao.png"
              alt="よっとこ！の白猫マスコット"
              width={96}
              height={128}
              className="relative z-10 h-28 w-auto flex-none object-contain md:h-40 lg:mb-16 lg:h-[200px]"
            />
            {/* スマホ: モバイルはabsoluteで下部クリップ / PCは通常フローでフル表示 */}
            <Image
              src="/assets/landing/device-mock.png"
              alt="よっとこ！アプリのスマートフォン画面"
              width={256}
              height={480}
              className="absolute top-6 left-1/2 -translate-x-1/2 h-[360px] w-auto object-contain lg:static lg:translate-x-0 lg:h-[480px] lg:flex-none"
              priority
            />
            {/* 黒猫: モバイルは右端・底揃え / PCは中央寄せの右 */}
            <Image
              src="/assets/character/kuro-egao.png"
              alt="よっとこ！の黒猫マスコット"
              width={112}
              height={128}
              className="relative z-10 h-28 w-auto flex-none object-contain md:h-40 lg:mb-16 lg:h-[200px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
