# ギャップ分析レポート — spot-detail-page

## 要件→既存アセット マッピング

| 要件 | 既存アセット | ギャップ種別 |
|------|------------|------------|
| Spotに`address`フィールド | `Spot`モデルに該当フィールドなし | **Missing** |
| Spotに`qrCodeLocation`フィールド | `Spot`モデルに該当フィールドなし | **Missing** |
| 管理画面に`address`入力欄 | `options.tsx` Spot.edit に存在しない | **Missing** |
| 管理画面に`qrCodeLocation`入力欄 | `options.tsx` Spot.edit に存在しない | **Missing** |
| カード型レイアウト（バッジ付き） | 現ページはカードなし・バッジなし | **Missing** |
| 住所表示（マップアイコン付き） | 現ページに住所表示なし | **Missing** |
| 「スポットの説明」セクション見出し | 現ページは `description` を生テキストで表示 | **Missing** |
| 「QRコードの場所」セクション見出し | 現ページに該当セクションなし | **Missing** |
| 未入力時の非表示制御 | `imageUrl` でパターン実装済み → 横展開可能 | **Constraint** |

## 既存コードベース調査

### Spotモデル（`prisma/schema.prisma`）
```prisma
model Spot {
  id             Int        @id @default(autoincrement())
  slug           String     @unique
  name           String
  description    String        // 必須・既存データあり
  status         SpotStatus @default(DRAFT)
  imageUrl       String?
  arAssetUrl     String?
  markerImageUrl String?
  mindFileUrl    String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  @@map("spots")
}
```

追加が必要なフィールド：
- `address      String?` — 住所（任意）
- `qrCodeLocation String?` — QRコードの場所（任意）

### 管理画面 `options.tsx`（Spotセクション）

現在の `edit.display` には `address`, `qrCodeLocation` が存在しない。
`aliases` に `description: "説明"` はあるが `address`, `qrCodeLocation` の日本語エイリアスもない。

追加必要な変更：
- `aliases` に `address: "住所"`, `qrCodeLocation: "QRコードの場所"` を追加
- `edit.display` に基本情報セクション内 or 新セクションとして両フィールドを追加
- `description` の `required: true` は維持（既存データ保護）
- `qrCodeLocation` は任意（`helperText` のみ設定）

### スポット詳細ページ（`src/app/spots/(chrome)/[slug]/page.tsx`）

現状：
- カードなし（素の `<article>`）
- バッジなし
- 住所表示なし
- `description` を生テキストで表示
- ボタン2つは実装済み

Activityページ（参照）の構造パターン：
- `overflow-hidden rounded-3xl bg-white shadow-yellow` カードラッパー（枠線なし）
- バッジを `absolute left-1/2 top-0 z-10 -translate-x-1/2` で上辺中央配置
- カード内に タイトル → サブ情報 → 画像 → セクション本文 の順
- Activity は黄色系テーマ（`text-secondary-500`、枠線なし・`shadow-yellow`）
- Spot デザインはグリーン系（`--color-secondary-*` 変数を使用）

### CSS変数・カラートークン

グリーン系（スポット用）:
- `--color-secondary-100`: `#d5f0d8`
- `--color-secondary-200`: `#a8deb0`
- `--color-secondary-300`: `#6bc278`
- `--color-secondary-400`: `#4aa85a`
- `--color-secondary-500`: `#357a40`

住所のオレンジ（デザインPNGより）:
- `text-arcana-orange-secondary`（`var(--color-arcana-orange-secondary)` = `#f0863e`）— ブランド色。Activity 日程表示など各カードのオレンジ文字も同色に統一

## 実装アプローチ評価

### Option A: 既存ファイルの拡張（推奨）

**変更対象ファイル（3つのみ）**:
1. `prisma/schema.prisma` — `address String?`, `qrCodeLocation String?` を追加
2. `src/app/admin/options.tsx` — `aliases` + `edit.display` + `edit.fields` を更新
3. `src/app/spots/(chrome)/[slug]/page.tsx` — UIを全面更新（カード型に）

**実行手順**:
1. `prisma/schema.prisma` 更新
2. `pnpm prisma db push` でスキーマ反映（マイグレーション不使用）
3. `pnpm prisma generate` で型生成
4. `options.tsx` 更新
5. ページUIを更新

**トレードオフ**:
- ✅ 新ファイル不要、最小変更
- ✅ 既存パターン（Activity詳細）をそのまま参照可能
- ✅ `prisma db push` のみでOK（マイグレーションファイル不使用）
- ✅ `description` は必須のまま維持→既存データへの影響なし

### Option B: 新コンポーネント分離

`SpotCard`, `SpotSection` など専用コンポーネントを作成する案。

**トレードオフ**:
- ✅ 再利用性向上（スポット一覧カードとの共用が将来可能）
- ❌ 現時点では再利用先がないため過剰
- ❌ 新ファイルが増えるほど変更範囲が広がる

### 推奨

**Option A** を推奨。スコープが明確で既存パターンが揃っており、変更ファイルも3つと最小。Activity詳細ページのカード構造をグリーン系テーマで転用するだけで要件を満たせる。

## 複雑度・リスク評価

| 項目 | 評価 | 根拠 |
|------|------|------|
| 複雑度 | **S**（1〜3日） | 確立済みパターンの拡張、新技術なし |
| リスク | **Low** | スコープ明確、DBはpushのみ、既存データ影響なし |

## 設計フェーズへの申し送り事項

1. **推奨アプローチ**: Option A（既存ファイル拡張）
2. **DB反映手順**: `prisma db push` → `prisma generate`（マイグレーション不使用）
3. **グリーンテーマ**: `--color-secondary-*` 変数を使用（Activity黄色系に対してSpotは緑系）
4. **description必須維持**: `required: true` はそのまま、`qrCodeLocation` は任意
5. **参照すべき既存実装**: `src/app/activities/[id]/page.tsx`（カードレイアウト構造）
