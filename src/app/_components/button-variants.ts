/**
 * ボタンスタイルの単一情報源（Single Source of Truth）。
 *
 * プライマリ／標準／アウトラインの3バリアントについて、背景色・ボーダー色・
 * 文字色・文字サイズ・hover/focus時の視覚変化を定義し、className文字列を
 * 生成する純粋関数を提供する。
 *
 * DOM要素の種類（<button>/<a>/<Link>）や状態管理（pending, disabled, active）
 * には関与しない。パディング・min-height・width等のレイアウト値も含まないため、
 * 呼び出し元が `className` 引数で追加すること。
 */

export type ButtonVariant = "primary" | "standard" | "outline";

/**
 * 3バリアント共通の構造的な基礎クラス（レイアウト用のpadding/min-height/widthは含まない）。
 */
const BASE_CLASS =
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full no-underline transition-opacity";

/**
 * 3バリアント共通の文字スタイル（18px・太字）。
 * Tailwind標準スケール（text-lg）を使用し、任意値（text-[18px]）は用いない。
 */
const TEXT_CLASS = "text-lg font-bold";

/**
 * 3バリアント共通のhover時の視覚変化（半透明化）。
 */
const HOVER_CLASS = "hover:opacity-90";

/**
 * 3バリアント共通のfocus時の視覚変化（フォーカスリング）。
 */
const FOCUS_CLASS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-arcana-primary-green focus-visible:ring-offset-2";

/**
 * バリアントごとの背景色・ボーダー色・文字色。
 */
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "border-2 border-arcana-green bg-arcana-primary-green text-white",
  standard: "border-2 border-transparent bg-arcana-primary-green text-white",
  outline:
    "border-2 border-arcana-primary-green bg-white text-arcana-primary-green",
};

/**
 * 指定したバリアントに対応する完全なTailwind className文字列を返す。
 *
 * @param variant - "primary" | "standard" | "outline" のいずれか
 * @param className - 呼び出し元が追加したいレイアウト用クラス（padding, min-height, width等）
 * @returns 基礎クラス・バリアントクラス・文字クラス・hover/focusクラス・追加クラスを連結したclassName文字列
 *
 * @example
 * buttonClassName("primary", "min-h-[52px] w-full px-8")
 */
export function buttonClassName(
  variant: ButtonVariant,
  className?: string,
): string {
  const classes = [
    BASE_CLASS,
    VARIANT_CLASS[variant],
    TEXT_CLASS,
    HOVER_CLASS,
    FOCUS_CLASS,
  ];

  if (className) {
    classes.push(className);
  }

  return classes.join(" ");
}
