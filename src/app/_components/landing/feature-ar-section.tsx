import { Icon } from "@/app/_components/Icon";
import { JoinButton } from "@/app/_components/join-button";
import Image from "next/image";

export function FeatureArSection() {
  return (
    <section
      id="feature-ar"
      className="w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to right, var(--color-accent-peach) 50%, var(--color-neutral-50) 50%)",
      }}
      aria-label="ARフォトセクション"
    >
      {/* PC（lg:）: モックアップ左・テキスト右の2カラム / スマホ: flex-col（order-first を有効化） */}
      <div className="mx-auto max-w-7xl flex flex-col lg:grid lg:grid-cols-2 lg:items-stretch">
        {/* ビジュアル（モバイル上 / PC左）: ARフォトのモック + ひめっ子吹き出し
            出し分けなし: スマホ画像に対し吹き出しを % で重ねてスケール追従させる */}
        <div
          className="relative flex items-end justify-center bg-[var(--color-accent-peach)] px-4 pr-[22%] pt-8 md:pr-4 lg:items-center lg:py-20"
          aria-hidden="true"
        >
          <div className="relative w-[58%] max-w-[230px] lg:w-[80%] lg:max-w-[300px]">
            {/* スマホ（ARカメラ画面）: モバイルは下2割を底辺でクリップ / PCは全体表示 */}
            <div className="aspect-[422/688] overflow-hidden lg:aspect-auto lg:overflow-visible">
              <Image
                src="/assets/landing/ar-photo-image.png"
                alt="ARカメラにひめっ子が出現した画面イメージ"
                width={422}
                height={860}
                className="block h-auto w-full"
              />
            </div>
            {/* 吹き出し: スマホ右側に重ねる（% 指定で比例追従） */}
            <Image
              src="/assets/landing/appear-himekko.svg"
              alt="スマホのカメラ画面にひめっ子が出現！"
              width={212}
              height={210}
              className="absolute left-[72%] top-[44%] w-[70%] -translate-y-1/2"
            />
          </div>
          {/* 注記 */}
          <p className="absolute bottom-3 right-4 text-xs text-[var(--color-neutral-400)] mb-3 lg:mb-8">
            画面はイメージです
          </p>
        </div>

        {/* 右エリア: テキスト（背景: white） */}
        <div className="flex flex-col justify-center bg-[var(--color-neutral-50)] px-4 py-16 max-lg:pb-[88px] sm:px-12 lg:py-24 lg:pl-16 lg:pr-8">
          {/* ラベル群 */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold tracking-widest text-[var(--color-arcana-orange)]">
              機能 その 2
            </p>
          </div>

          {/* 見出し h2 */}
          <h2 className="mt-2 text-[2rem] font-bold leading-snug tracking-tight text-[var(--color-arcana-green)]">
            ARフォトを撮る
          </h2>

          {/* 説明文 */}
          <p className="mt-6 text-base leading-relaxed text-[var(--color-arcana-body-blue)] sm:text-lg">
            村内の道の駅などに設置されたQRコードをスキャンすると、キャラクター「ひめっ子」が画面上に現れます。
            <br />
            一緒に写真を撮って、SNSでシェアしたり保存したりできます。
          </p>

          {/* CTA ボタン群 */}
          <div className="mt-12 flex w-fit flex-col mx-auto lg:mx-0 lg:w-auto lg:flex-row lg:flex-wrap lg:items-end lg:gap-4">
            {/* 標準 CTA: スポット一覧 */}
            <JoinButton
              variant="standard"
              href="/spots"
              className="w-full gap-1 lg:w-auto"
            >
              スポット一覧を見る
              <Icon name="chevron-right" width={16} height={16} />
            </JoinButton>

            {/* 標準 CTA: ARカメラ（おためし） */}
            <div className="relative mt-3 w-full pt-3 lg:mt-0 lg:w-auto">
              <span className="absolute left-3 top-0 z-10 rounded-full bg-[var(--color-arcana-orange)] px-3 py-1 text-xs font-bold text-white">
                おためし
              </span>
              <JoinButton
                variant="standard"
                href="/camera"
                className="w-full gap-1 lg:w-auto"
              >
                ひめっ子と写真を撮ってみる
                <Icon name="chevron-right" width={16} height={16} />
              </JoinButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
