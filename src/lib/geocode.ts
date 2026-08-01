import { env } from "@/env";

export type LatLng = { lat: number; lng: number };

/**
 * 住所文字列を緯度・経度へ変換する (Google Geocoding API)。
 *
 * - サーバ専用。`GOOGLE_GEOCODING_API_KEY` が未設定なら何もせず null を返す。
 * - 失敗時 (キー未設定 / API エラー / ZERO_RESULTS / 例外) はすべて null を返す。
 *   呼び出し側は null を「座標なし＝地図にピンを出さない」状態として扱う。
 * - 日本の住所精度を上げるため language=ja / region=jp を指定する。
 */
export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const key = env.GOOGLE_GEOCODING_API_KEY;
  if (!key) return null;

  const trimmed = address.trim();
  if (!trimmed) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", trimmed);
  url.searchParams.set("key", key);
  url.searchParams.set("language", "ja");
  url.searchParams.set("region", "jp");

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      status: string;
      results?: { geometry: { location: { lat: number; lng: number } } }[];
    };

    const location = data.results?.[0]?.geometry.location;
    if (data.status !== "OK" || !location) return null;

    return { lat: location.lat, lng: location.lng };
  } catch {
    return null;
  }
}
