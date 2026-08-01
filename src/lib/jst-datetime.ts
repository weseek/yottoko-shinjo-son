/**
 * 日本標準時 (JST) は UTC+9 固定（夏時間なし）。
 */
const JST_OFFSET_MINUTES = 9 * 60;

const DATETIME_LOCAL_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

/**
 * admin フォーム (next-admin の datetime-local 入力) が送る、タイムゾーン情報を
 * 持たない JST の壁時計時刻文字列 (例: "2026-06-23T00:00") を、正しい UTC 時刻の
 * ISO 文字列 (例: "2026-06-22T15:00:00.000Z") に変換する。
 *
 * 後段の next-admin (submitResource) が `new Date()` で解釈する際に、ランタイムの
 * タイムゾーンへ依存せず常に正しい instant となるよう、明示的に `Z` 付き UTC で返す。
 * タイムゾーン情報を含む値や想定外の形式は、誤変換を避けるためそのまま返す。
 */
export function jstDateTimeLocalToUtcIso(value: string): string {
  const match = value.match(DATETIME_LOCAL_PATTERN);
  if (!match) {
    return value;
  }
  const [, year, month, day, hour, minute, second] = match;
  const utcMs =
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      second ? Number(second) : 0,
    ) -
    JST_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMs).toISOString();
}
