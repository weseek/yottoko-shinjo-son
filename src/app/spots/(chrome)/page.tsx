import { Icon } from "@/app/_components/Icon";
import SectionHeading from "@/app/_components/SectionHeading";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SpotCard } from "./_components/spot-card";
import { type SpotPin, SpotsMap } from "./_components/spots-map";

// ピンが 0 件 / 1 件のときの地図中心 (新庄村役場付近)
const SHINJO_VILLAGE_CENTER = { lat: 35.1146, lng: 133.5386 };

async function getSpots() {
  return prisma.spot.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });
}

export default async function SpotsPage() {
  const spots = await getSpots();

  if (spots.length === 0) {
    return (
      <div className="py-16 text-center">
        <Icon
          name="location-on-outline"
          className="mx-auto mb-4 text-neutral-300"
          width={64}
          height={64}
        />
        <p className="text-lg text-neutral-500">
          スポットはまだ登録されていません
        </p>
        <Link
          href="/activities"
          className="mt-6 inline-flex items-center gap-1 text-base no-underline text-secondary-500"
        >
          <Icon name="chevron-left" width={20} height={20} />
          交流を探す
        </Link>
      </div>
    );
  }

  // 座標が取得済みのスポットだけを地図のピンに変換する
  const pins: SpotPin[] = spots.flatMap((spot) =>
    spot.latitude != null && spot.longitude != null
      ? [
          {
            slug: spot.slug,
            name: spot.name,
            address: spot.address,
            lat: spot.latitude,
            lng: spot.longitude,
          },
        ]
      : [],
  );

  return (
    <section>
      {/* パンくず */}
      <div className="mb-6">
        <Link
          href="/activities"
          className="inline-flex items-center gap-1 text-base no-underline text-secondary-500"
        >
          <Icon name="chevron-left" width={20} height={20} />
          交流を探す
        </Link>
      </div>

      {/* タイトル */}
      <div className="mb-8 text-center">
        <SectionHeading className="text-4xl font-bold text-secondary-500 text-balance">
          スポット一覧
        </SectionHeading>
        <p className="mt-8 text-base text-body-blue">
          各スポットのQRコードを読み込むと、そのスポット限定のひめっ子が登場します。
        </p>
        <Link
          href="/camera"
          className="mt-6 inline-flex items-center gap-1 text-base no-underline text-secondary-500"
        >
          撮影についての詳細はこちら
          <Icon name="chevron-right" width={16} height={16} />
        </Link>
      </div>

      {/* Google Map (住所からジオコーディング済みのスポットをピン表示) */}
      {env.GOOGLE_MAPS_BROWSER_KEY && pins.length > 0 && (
        <div className="mb-8">
          <SpotsMap
            apiKey={env.GOOGLE_MAPS_BROWSER_KEY}
            pins={pins}
            fallbackCenter={SHINJO_VILLAGE_CENTER}
          />
        </div>
      )}

      {/* スポット数 */}
      <p className="mb-8 text-base text-arcana-green">
        {spots.length} スポット
      </p>

      {/* カードリスト */}
      <div className="grid gap-8">
        {spots.map((spot) => (
          <SpotCard
            key={spot.id}
            slug={spot.slug}
            name={spot.name}
            address={spot.address}
            qrCodeLocation={spot.qrCodeLocation}
            imageUrl={spot.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}
