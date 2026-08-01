// 日付・時刻の表示は常に日本標準時 (JST) で行う。
// timeZone を各呼び出しで指定し忘れるとサーバ (UTC) 基準で日付・時刻がずれるため、
// JST を焼き込んだこれらのヘルパーを必ず経由すること。
const JST_LOCALE = "ja-JP";
const JST_TIME_ZONE = "Asia/Tokyo";

export type DateInput = Date | string | number;

/** 年月日（例: 2026年6月24日）。JST 固定。 */
export function formatJstDate(
  value: DateInput,
  options?: { month?: "long" | "short" },
): string {
  return new Date(value).toLocaleDateString(JST_LOCALE, {
    year: "numeric",
    month: options?.month ?? "long",
    day: "numeric",
    timeZone: JST_TIME_ZONE,
  });
}

/** 時刻（例: 09:00）。JST 固定。 */
export function formatJstTime(value: DateInput): string {
  return new Date(value).toLocaleTimeString(JST_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: JST_TIME_ZONE,
  });
}

/** 年月日 時:分（例: 2026年6月24日 09:00）。JST 固定。 */
export function formatJstDateTime(value: DateInput): string {
  return `${formatJstDate(value)} ${formatJstTime(value)}`;
}

/** 同日判定に使う JST の年月日キー。 */
function jstDayKey(value: DateInput): string {
  return new Date(value).toLocaleDateString(JST_LOCALE, {
    timeZone: JST_TIME_ZONE,
  });
}

/**
 * 開始〜終了の範囲表示。終了が開始と別日の場合は終了側にも日付を表示する。
 * すべて JST 固定。
 */
export function formatDateRange(
  startDate: DateInput,
  endDate: DateInput | null,
): string {
  const startPart = `${formatJstDate(startDate)} ${formatJstTime(startDate)}`;
  if (!endDate) return startPart;

  const endTime = formatJstTime(endDate);
  if (jstDayKey(startDate) !== jstDayKey(endDate)) {
    return `${startPart} – ${formatJstDate(endDate)} ${endTime}`;
  }
  return `${startPart} – ${endTime}`;
}
