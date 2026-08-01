// Material Symbols のアイコンデータを使用分だけ抽出して
// src/app/_components/icons/material-symbols.generated.ts を生成する。
//
// 使い方:
//   1. 下の NAMES に Iconify の material-symbols 名を追加する
//      (例: "home-outline"。Figma のアイコン名と対応させる)
//   2. `node scripts/gen-icons.mjs` を実行
//
// ランタイムは @iconify/react のみに依存し、外部 CDN へはアクセスしない。
// @iconify-json/material-symbols は devDependencies（生成時のみ使用）。
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const NAMES = [
  "chevron-left",
  "chevron-right",
  "cancel-outline",
  "image-outline",
  "group-outline",
  "upload",
  "download",
  "open-in-new",
  "check",
  "location-on-outline",
  "photo-camera-outline",
  "no-photography-outline",
  "share",
  "error-outline",
  "rotate-left",
  "rotate-right",
  "open-with",
  "pinch-outline",
  "toggle-on",
  "toggle-off",
];

const SRC = "node_modules/@iconify-json/material-symbols/icons.json";
const OUT = "src/app/_components/icons/material-symbols.generated.ts";

const data = JSON.parse(readFileSync(SRC, "utf8"));
const W = data.width || 24;
const H = data.height || 24;
const resolve = (n) =>
  data.icons[n] ||
  (data.aliases?.[n] && data.icons[data.aliases[n].parent]) ||
  null;

const out = {};
for (const n of NAMES) {
  const ic = resolve(n);
  if (!ic) throw new Error(`icon not found: ${n}`);
  out[n] = { body: ic.body, width: ic.width || W, height: ic.height || H };
}

const header = `// このファイルは scripts/gen-icons.mjs で @iconify-json/material-symbols から生成。
// 使用アイコンを追加したら scripts/gen-icons.mjs の NAMES を更新して再生成すること。直接編集しない。
import type { IconifyIcon } from "@iconify/react";

`;
const body = `export const iconData = ${JSON.stringify(out, null, 2)} satisfies Record<string, IconifyIcon>;

export type IconName = keyof typeof iconData;
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, header + body);
console.log(`generated ${Object.keys(out).length} icons -> ${OUT}`);
