import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * 既存スポットの住所を一括ジオコーディングして latitude/longitude を埋める一回限りのスクリプト。
 *
 * 使い方:
 *   DATABASE_URL=... GOOGLE_GEOCODING_API_KEY=... \
 *     node_modules/.bin/tsx prisma/backfill-spot-coordinates.ts
 *
 * - 既に座標が入っているスポットはスキップ（冪等）。
 * - Geocoding API のレート制限に配慮して 1 件ごとに 200ms 空ける。
 * - 取得に失敗したスポットは座標 null のまま残す（地図ではピンなし）。
 */

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY;
if (!GEOCODING_API_KEY) {
  throw new Error("GOOGLE_GEOCODING_API_KEY environment variable is required");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocode(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address.trim());
  url.searchParams.set("key", GEOCODING_API_KEY as string);
  url.searchParams.set("language", "ja");
  url.searchParams.set("region", "jp");

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    status: string;
    results?: { geometry: { location: { lat: number; lng: number } } }[];
  };
  const location = data.results?.[0]?.geometry.location;
  if (data.status !== "OK" || !location) return null;
  return { lat: location.lat, lng: location.lng };
}

async function main() {
  const spots = await prisma.spot.findMany({
    where: { latitude: null, longitude: null },
    select: { id: true, name: true, address: true },
  });

  console.log(`座標未設定のスポット: ${spots.length} 件`);

  let ok = 0;
  let failed = 0;
  for (const spot of spots) {
    if (!spot.address?.trim()) {
      console.warn(`- [skip] 住所が空: #${spot.id} ${spot.name}`);
      failed++;
      continue;
    }

    const coords = await geocode(spot.address);
    if (!coords) {
      console.warn(`- [fail] ジオコーディング失敗: #${spot.id} ${spot.name}`);
      failed++;
    } else {
      await prisma.spot.update({
        where: { id: spot.id },
        data: { latitude: coords.lat, longitude: coords.lng },
      });
      console.log(
        `- [ok] #${spot.id} ${spot.name} -> ${coords.lat}, ${coords.lng}`,
      );
      ok++;
    }

    await sleep(200);
  }

  console.log(`完了: 成功 ${ok} 件 / 失敗・スキップ ${failed} 件`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
