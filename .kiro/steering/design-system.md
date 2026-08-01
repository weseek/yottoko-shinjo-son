# デザインシステム

municipal アプリの UI 一貫性を保つためのデザイントークン規約。個別 spec に散らばりやすい「色・枠線・影・フォント」の判断をここに集約する。

**定義元（Single Source of Truth）**:
- カラー / 影の CSS 変数: `src/app/globals.css`（`:root` の `--color-*` / `--shadow-*`）
- Tailwind への公開: `tailwind.config.mjs`（`theme.extend` の `colors` / `boxShadow` / `borderWidth`）

新しい色・影・幅を足すときは、まず上記2ファイルにトークンとして定義し、コンポーネントではトークン名で参照する（ハードコード値を直書きしない）。

## カラー

- ブランドカラーは Tailwind カスタムカラー（例: `text-secondary-500` `bg-arcana-primary-green`）、未登録のものは `text-[var(--color-...)]` で参照する。
- **オレンジ系のアクセント文字は `text-arcana-orange-secondary`（`#f0863e`）に統一**する。Tailwind 標準の `text-orange-500` / `orange-700` は使わない（日付・住所・強調ラベル等はすべてこのブランドオレンジ）。

## ボタン

- ボタンの配色・文字サイズは `src/app/_components/button-variants.ts` の `buttonClassName(variant, className?)` に集約している（Single Source of Truth）。新しくボタンを追加・変更するときは色をハードコードせず、必ずこの関数経由でクラスを組み立てる。

| variant | 用途例 | 背景 | ボーダー | 文字色 |
|---|---|---|---|---|
| `primary` | 参加してみる／申し込む／キャンセルする 等（主要な意思表示CTA） | `arcana-primary-green`（`#089400`） | `border-2` `arcana-green`（`#397754`） | 白 |
| `standard` | AR で撮影する／スポット一覧を見る 等（気軽に進められる操作） | `arcana-primary-green`（`#089400`） | なし | 白 |
| `outline` | 詳しく見る 等（補助的な操作） | 白 | `border-2` `arcana-primary-green`（`#089400`） | `arcana-primary-green`（`#089400`） |

- 3バリアント共通でラベル文字は `text-lg font-bold`（18px・太字）に固定。背景と文字の組み合わせのコントラスト比は約4.0:1で通常文字の基準（4.5:1、下記「アクセシビリティ」節参照）には届かないが、18px太字により「大きな文字」の3:1基準を満たす。文字サイズを18px未満に下げない。
- AR/カメラ撮影フローのうち `OperationGuide.tsx`「はじめる」と `CapturedPhotoPreview.tsx`「保存」「シェア」「撮り直す」はこの3バリアントに移行済み。
- **対象外**: `HomeArFallbackExperience.tsx`「再試行」「戻る」、`HomeArFallbackScene.tsx` のシャッター等の残りのピンク系ボタンはこの3バリアントに未移行（デザイナー確認待ち）。

## 枠線（border width）

| 用途 | クラス | 幅 |
|---|---|---|
| **カード**（リスト・申込・AR・ホームのパネル） | `border-3` | 3px |
| ボタン・リンクボタン・チップ・入力欄など | `border-2` | 2px |

- `border-3`（3px）は Tailwind v3 のデフォルトに無いため `tailwind.config.mjs` の `borderWidth: { 3: "3px" }` で定義済み。
- **例外**: 詳細ページのカード（アクティビティ詳細・スポット詳細）は **枠線なし＋ `shadow-yellow` のみ**で縁取る（意図的。リストカードとの視覚的差別化）。

## 影（shadow）

- カードの黄色い影は共通トークン **`shadow-yellow`**（`--shadow-yellow` = `2px 3px 0 rgba(255, 218, 72, 0.5)`、`boxShadow.yellow` として公開）を使う。
- `shadow-[0_4px_20px_rgba(...)]` のような**ハードコードの任意値影は使わない**。既存トークン（`shadow-sm/md/lg/xl/yellow`）で表現できないときのみトークンを追加する。

## フォント

- **フォントファミリは `body`（globals.css）で Zen Maru Gothic をアプリ全体に適用済み**。コンポーネント側で `font-[family-name:var(--font-zen-maru-gothic)]` を個別指定しない（冗長）。
- **フォントサイズは Tailwind スケール（`text-sm` / `text-base` / `text-xl` / `text-2xl` …）を優先**し、`text-[16px]` のような任意値は避ける。
- **最小フォントサイズは 14px（`text-sm`）**、行間 1.5 以上。要素ごとに 14px より大きい下限を設けるのは可（例: CTA ボタンは `text-base` 以上）。
- **読込ウェイトは medium(500)・bold(700) の2種のみ**（`layout.tsx` の `Zen_Maru_Gothic` 設定）。本文の既定は `globals.css` の `body` に `font-weight: 500;` を明示指定しており、ウェイトクラス無指定のテキストはこの medium で描画される。
- **強調は `font-bold` に統一**する。`font-normal` / `font-semibold` / `font-extrabold` / `font-black`、および インライン `style={{ fontWeight: ... }}` は使わない（500/700 以外は読み込んでいないため、指定してもブラウザ合成のフェイクボールドになる）。`font-medium` は既定(500)と重複するため冗長だが、祖先要素が `font-bold` で意図せず太字を継承してしまう箇所に限り、明示的な上書きとして残してよい。
  - 理由: Figmaデザインとのウェイト整合、読込ウェイト数削減によるフォント表示パフォーマンス向上、ユーティリティ選択を単純化してメンテナンスコストを下げるため（`reduce-font-weight` spec）。

## スタイルの書き方

- インライン `style={{ ... }}` ではなく **Tailwind ユーティリティ**で記述する（色・余白・角丸・影すべて）。動的な値などやむを得ない場合のみ `style` を使う。

## アクセシビリティ（CLAUDE.md UI 実装ルールと連携）

- WCAG AA 準拠。コントラスト比は原則 **4.5:1 以上**。
- **ブランドカラー例外**: `text-arcana-orange-secondary`（白背景で約 2.57:1）は、**装飾・補助テキストに限り** AA 未達でも許容する。条件は (1) 色以外の手がかり（アイコン・位置・隣接テキスト）がある、(2) 該当 spec の `design.md` にコントラスト値と AA 免除の旨を記録する、(3) 本文・エラー・ラベル・リンク等の重要要素には**適用しない**。詳細は `CLAUDE.md` の UI Implementation Rules を参照。

---
_デザイントークン（色・枠線・影・フォント方針）を変更したら、まず globals.css / tailwind.config.mjs を更新し、このファイルにも反映してください_
