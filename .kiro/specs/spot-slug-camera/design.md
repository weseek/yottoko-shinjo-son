# 技術設計書 — spot-slug-camera

## 概要

スポット限定「ひめっこと撮影」ランディングページのデザイン実装、および管理画面・データモデル拡張。

## アーキテクチャ

### データフロー

```
prisma.spot.findUnique({ slug, status: "PUBLISHED" })
  ↓ arAssetUrl, himekkoDescription, name
spots/[slug]/camera/page.tsx (Server Component)
  ↓ props
SpotArExperience (Client Component)
  ↓ view === "landing"
ArLanding (Client Component) → 新デザイン実装
```

### ファイル変更一覧

| ファイル | 変更種別 | 概要 |
|---|---|---|
| `prisma/schema.prisma` | 変更 | `Spot` モデルに `himekkoDescription String?` 追加 |
| `prisma/migrations/...` | 新規 | DB マイグレーション |
| `src/app/admin/options.tsx` | 変更 | `himekkoDescription` フィールド追加（ARセクション下部） |
| `src/app/spots/[slug]/camera/_components/ArLanding.tsx` | 変更 | 新デザインへ全面リニューアル |
| `src/app/spots/[slug]/camera/_components/SpotArExperience.tsx` | 変更 | `himekkoDescription`, `arAssetUrl` を props に追加 |
| `src/app/spots/[slug]/camera/page.tsx` | 変更 | 新 props を SpotArExperience へ渡す |

## コンポーネント設計

### ArLanding（全面リニューアル）

ページ全体を担当するフルページコンポーネント。ヘッダー・フッターを内包。

```
ArLanding
  ├── <header>  logo (共通 AppHeader。クリックでルートページ / へ)
  ├── <nav>     < スポット一覧に戻る
  ├── タイトルセクション
  │     ├── "\ スポット限定 /"（orange）
  │     └── "ひめっこと撮影！"（大見出し、緑点線下線）
  ├── カード（白背景、緑の 3px 実線ボーダー `border-3`）
  │     ├── 「スポット設置」バッジ（上部中央、緑）
  │     ├── スポット名
  │     ├── ModelViewer（arAssetUrl → GLB 3Dプレビュー）
  │     ├── himekkoDescription（任意）
  │     ├── 「AR で撮影する」ボタン（緑、カメラアイコン付き）
  │     └── ※カメラ許可の注意書き
  ├── 「撮影についての詳細はこちら ›」リンク
  └── <AppFooter>
```

### props 型変更

```ts
// SpotArExperience
spot: {
  id: number;
  slug: string;
  name: string;
  description: string;
  himekkoDescription: string | null;  // 追加
  arAssetUrl: string | null;          // 追加
}

// ArLanding
spot: {
  id: string;
  name: string;
  description: string;
  himekkoDescription?: string | null; // 追加
  arAssetUrl?: string | null;         // 追加
}
```

## デザイン仕様

### カラー

| 要素 | カラー変数 |
|---|---|
| ページ背景 | `--color-arcana-bg` (#FAF8F4) |
| 「スポット限定」テキスト | `--color-arcana-orange` (#f0863e) |
| タイトル「ひめっこと撮影！」 | `--color-arcana-green` (#089400) |
| タイトル下線（点線） | `--color-arcana-limegreen` (#65DA48) |
| カードボーダー（`border-3` 実線・3px） | `--color-arcana-limegreen` (#65DA48) |
| 「スポット設置」バッジ背景 | `--color-spot` (#65DA48) |
| 「ARで撮影する」ボタン | `--color-spot-action` (#089400) |
| 3Dモデル背景 | `--color-camera-bg` (#f5edd6) |

### アクセシビリティ

- インタラクティブ要素 min 48×48px タップ領域
- フォントサイズ最小 14px、line-height 1.5+
- コントラスト比 4.5:1 以上（WCAG AA）
- `<img>` / ModelViewer に適切な alt テキスト

## データモデル変更

```prisma
model Spot {
  // ... 既存フィールド
  himekkoDescription String?  // 追加：スポット限定ひめっこ説明文
}
```

## 管理画面変更

`options.tsx` の Spot.edit.display に追加：
- セクション「スポット限定ひめっこ説明文」を ARマーカー（.mind）セクションの下に追加
- フィールド: `himekkoDescription`（TextareaInput、任意入力）
- helperText: 「スポット限定ひめっこの説明文（カメラページに表示）」
