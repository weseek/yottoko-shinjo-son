import { Icon as IconifyIcon } from "@iconify/react";
import type { CSSProperties } from "react";
import { type IconName, iconData } from "./icons/material-symbols.generated";

export type { IconName };

type IconProps = {
  /** Material Symbols 名（Figma のアイコン名と対応） */
  name: IconName;
  /**
   * アクセシブルな名前。
   * - 省略時: 装飾として `aria-hidden` で隠す（隣接テキストや親 button の aria-label が意味を担う場合）
   * - 指定時: `role="img"` + `aria-label` で独立した画像として公開する
   */
  label?: string;
  className?: string;
  /** ピクセルサイズ。未指定時は className（h-* w-*）または親の font-size(1em) に従う */
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
};

/**
 * Material Symbols (Outlined) をインライン SVG として描画する共通アイコン。
 * 外部 CDN へはアクセスせず、material-symbols.generated.ts に同梱した分のみを使う。
 */
export function Icon({
  name,
  label,
  className,
  width,
  height,
  style,
}: IconProps) {
  return (
    <IconifyIcon
      icon={iconData[name]}
      className={className}
      width={width}
      height={height}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
