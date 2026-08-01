import { Icon } from "@/app/_components/Icon";
import { buttonClassName } from "@/app/_components/button-variants";
import Image from "next/image";
import Link from "next/link";

export function FeatureActivitySection() {
  return (
    <section
      id="feature-activity"
      className="w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to right, var(--color-arcana-cream) 50%, var(--color-secondary-50) 50%)",
      }}
      aria-label="機能その1 体験・手伝いに参加するセクション"
    >
      {/* PC（lg:）: テキスト左（白）・カード右（薄緑）の2カラム / スマホ: flex-col（order-first を有効化） */}
      <div className="mx-auto max-w-7xl flex flex-col lg:grid lg:grid-cols-2 lg:items-stretch">
        {/* テキストエリア（左カラム、白背景） */}
        <div className="flex flex-col bg-[var(--color-arcana-cream)] px-4 py-12 max-lg:pb-[72px] sm:px-12 lg:py-20 lg:pl-8 lg:pr-16">
          {/* 機能ラベル */}
          <span className="text-sm font-bold leading-relaxed text-[var(--color-arcana-orange)]">
            機能 その 1
          </span>

          {/* セクション見出し h2 */}
          <h2 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight text-[var(--color-secondary-500)]">
            体験・手伝いに参加する
          </h2>

          {/* 説明文 */}
          <p className="mt-6 text-base leading-relaxed text-[var(--color-arcana-body-blue)] sm:text-lg">
            ちょっとしたお手伝いや地域の行事・交流など、村の人が用意したメニューを一覧で見ることができます。
            <br />
            <br />
            参加したいものが見つかったら、そのまま申し込みができます。
          </p>

          {/* 記念品注記 */}
          <div className="mt-12 flex items-center justify-center gap-3 rounded-xl bg-[var(--color-arcana-green-light)] px-4 py-3 lg:self-start">
            <p className="text-base font-bold leading-relaxed text-[var(--color-arcana-green)]">
              参加者にはちょっとした記念品を贈呈
            </p>
            <Image
              src="/assets/exclamation-mark.svg"
              alt="！"
              width={13}
              height={24}
              className="h-[1.5em] w-auto flex-none"
            />
          </div>

          {/* CTA ボタン */}
          <div className="mt-12 flex justify-center lg:justify-start">
            <Link
              href="/activities"
              className={buttonClassName(
                "outline",
                "w-full px-6 py-3 sm:w-auto",
              )}
            >
              体験・手伝いを見てみる
              <Icon name="chevron-right" width={16} height={16} />
            </Link>
          </div>
        </div>

        {/* カードビジュアルエリア（右カラム、薄緑背景）/ モバイルでは最上部に表示
            モバイル: 段違い・両端クリップ（注記を下に表示）
            PC（lg:）: 下寄せ（justify-end）でカードを底に。注記はカード下に表示 */}
        <div className="order-first flex flex-col overflow-hidden bg-[var(--color-secondary-50)] pt-10 pb-5 lg:order-last lg:justify-center lg:px-8 lg:pt-20 lg:pb-[60px]">
          <div className="flex items-start justify-center gap-6 lg:items-end">
            <Image
              src="/assets/landing/activity-card-1.png"
              alt="体験・手伝いカード例1"
              width={300}
              height={420}
              className="mt-12 w-[58vw] max-w-[234px] flex-none rounded-2xl object-cover lg:mt-0 lg:w-auto lg:max-w-[220px]"
            />
            <Image
              src="/assets/landing/activity-card-2.png"
              alt="体験・手伝いカード例2"
              width={300}
              height={420}
              className="w-[58vw] max-w-[234px] flex-none rounded-2xl object-cover lg:mt-0 lg:mb-20 lg:w-auto lg:max-w-[220px]"
            />
          </div>
          {/* 注記（全幅・右下） */}
          <p className="mt-1 pr-4 text-right text-xs text-[var(--color-neutral-400)]">
            内容はイメージです
          </p>
        </div>
      </div>
    </section>
  );
}
