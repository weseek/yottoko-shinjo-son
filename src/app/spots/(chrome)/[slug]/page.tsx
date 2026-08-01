import { Icon } from "@/app/_components/Icon";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getSpotBySlug(slug: string) {
  return prisma.spot.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);

  if (!spot) {
    notFound();
  }

  return (
    <article>
      {/* パンくず */}
      <nav aria-label="パンくず" className="mb-16">
        <Link
          href="/spots"
          className="inline-flex items-center gap-1 text-base no-underline text-[var(--color-secondary-500)] [transition:var(--transition-fast)]"
        >
          <Icon name="chevron-left" width={20} height={20} />
          スポット一覧に戻る
        </Link>
      </nav>

      {/* カードラッパー */}
      <div className="relative mt-6">
        {/* スポットカテゴリバッジ — activity詳細ページの Badge と同じ配置手法 */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
          <span className="inline-flex items-center gap-2 rounded-b-lg bg-[#65DA48] px-5 py-3 text-[15px] font-bold leading-none text-white">
            <Icon name="location-on-outline" width={16} height={16} />
            スポット
          </span>
        </div>

        {/* カード本体 */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-yellow">
          {/* タイトル・住所 */}
          <div className="px-6 pt-10 text-center mt-8">
            <h1 className="text-2xl font-bold leading-[1.3] text-[var(--color-secondary-500)] text-balance">
              {spot.name}
            </h1>
            <p className="mt-8 inline-flex items-center justify-center gap-1 text-arcana-orange-secondary">
              <Icon name="location-on-outline" width={16} height={16} />
              {spot.address}
            </p>
          </div>

          {/* 画像 */}
          <div className="px-4 mt-8">
            {spot.imageUrl ? (
              <img
                src={spot.imageUrl}
                alt={spot.name}
                className="w-full rounded-2xl object-cover max-h-[400px]"
              />
            ) : (
              <div
                className="flex aspect-video w-full items-center justify-center rounded-2xl bg-[var(--color-neutral-100)] text-[var(--color-neutral-300)]"
                aria-hidden="true"
              >
                <Icon name="location-on-outline" width={64} height={64} />
              </div>
            )}
          </div>

          {/* 説明・ボタン */}
          <div className="px-6 pb-8">
            {/* スポットの説明 */}
            <section aria-labelledby="spot-desc-heading" className="mt-8">
              <h2
                id="spot-desc-heading"
                className="flex items-center gap-2 text-xl font-bold text-[var(--color-secondary-500)]"
              >
                <Icon name="location-on-outline" width={18} height={18} />
                スポットの説明
              </h2>
              <p className="mt-3 whitespace-pre-wrap leading-[1.8] text-body-blue">
                {spot.description}
              </p>
            </section>

            {/* QRコードの場所 */}
            <section aria-labelledby="spot-qr-heading" className="mt-8">
              <h2
                id="spot-qr-heading"
                className="flex items-center gap-2 text-xl font-bold text-[var(--color-secondary-500)]"
              >
                <Icon name="photo-camera-outline" width={18} height={18} />
                QRコードの場所
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-base leading-[1.8] text-body-blue">
                {spot.qrCodeLocation}
              </p>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
