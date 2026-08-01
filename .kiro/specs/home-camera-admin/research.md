# ギャップ分析: home-camera-admin

## 対象要件
`.kiro/specs/home-camera-admin/requirements.md` の要件1〜5

---

## 1. 現状調査

### 既存アセット（再利用可能）

| アセット | パス | 状態 |
|---------|------|------|
| Spot ARフィールド定義 | `prisma/schema.prisma` (Spot モデル) | ✅ arAssetUrl / mindFileUrl / markerImageUrl が既存 |
| next-admin Spot 設定 | `src/app/admin/options.tsx` | ✅ ARフィールドのUI設定パターン完成 |
| ImageUploadInput | `src/app/admin/_components/image-upload-input.tsx` | ✅ 変更なしで再利用可 |
| MindFileUploadInput | `src/app/admin/_components/mind-file-upload-input.tsx` | ✅ 変更なしで再利用可 |
| 画像アップロードAPI | `src/app/api/admin/upload/route.ts` | ✅ `{ url: string }` を返す |
| .mindアップロードAPI | `src/app/api/admin/upload-mind/route.ts` | ✅ `{ url: string }` を返す |
| storage.ts | `src/lib/storage.ts` | ✅ uploadImage / uploadMind 関数完備 |
| Spot カメラ DB参照パターン | `src/app/spots/[slug]/camera/page.tsx` | ✅ findUnique + フォールバック実装済み |

### ギャップ（不足しているもの）

| ギャップ | 分類 |
|---------|------|
| `HomeCameraConfig` Prisma モデルが存在しない | **Missing** |
| next-admin options に「自宅でひめっこ撮影」エントリがない | **Missing** |
| `camera/page.tsx` がハードコード定数のみ（DB参照なし） | **Missing** |
| シングルトンモデルの既存パターンなし | **Constraint** |

### 現在のハードコード定数（置き換え対象）

```typescript
// src/app/camera/page.tsx
const HOME_MODEL: ModelConfig = {
  url: "/assets/himekko.glb",   // → arAssetUrl
  label: "ヒメッコ",             // → label
  scale: 0.5,                   // → scale
};
const HOME_TARGET: TargetConfig = {
  mindFileUrl: "/assets/targets/demo.mind",  // → mindFileUrl
  targetIndex: 0,
};
const HOME_MARKER_IMAGE_URL = "/assets/targets/demo-marker.png";  // → markerImageUrl
```

---

## 2. 要件別実装技術ニーズ

| 要件 | 必要なもの | 現状 |
|------|-----------|------|
| 要件1: admin設定エントリ追加 | Prismaモデル + options.tsx への追加 | ❌ モデルなし |
| 要件2: GLBファイルURL設定 | `arAssetUrl String?` フィールド | ❌ |
| 要件3: .mindファイル・マーカー画像設定 | `mindFileUrl String?` / `markerImageUrl String?` | ❌ |
| 要件4: ファイルアップロードUI | ImageUploadInput / MindFileUploadInput | ✅ 既存コンポーネント再利用 |
| 要件5: 自宅撮影ページへの反映 | `camera/page.tsx` の動的取得 + フォールバック | ❌ 現在静的定数のみ |

### シングルトン設定の技術的考慮

自宅撮影ページは1つ（`/camera`）しか存在しないため、`HomeCameraConfig` は **シングルトン設定** として扱う。

- next-admin は複数レコード想定の CRUD UI だが、シングルトンとして運用するには「レコード数を1に制限」か「最初の1件のみ使用」のどちらかを選択する
- `NotificationRecipient` は類似パターン（設定的用途）だが、複数レコード許容設計
- **シングルトン実装方針の選択肢**:
  - A. `findFirst()` で最初の1件取得（DB制約なし、シンプル）
  - B. `findFirst()` + admin UI での「1件のみ作成可能」バリデーション（HookError使用）
  - C. `upsert` でid=1に固定（next-admin との相性に要検討）

---

## 3. 実装アプローチ評価

### オプションA: 新規 `HomeCameraConfig` モデル + findFirst パターン

**方針**: Prisma に新モデルを追加し、`camera/page.tsx` で `findFirst()` 取得。admin UIはSpotと同パターンで構築。

**変更ファイル**:
1. `prisma/schema.prisma` — `HomeCameraConfig` モデル追加
2. `src/app/admin/options.tsx` — `HomeCameraConfig` エントリ追加
3. `src/app/camera/page.tsx` — `prisma.homeCameraConfig.findFirst()` + フォールバック

**trade-offs**:
- ✅ 既存パターン（Spot + SpotカメラのDB参照）をそのまま踏襲
- ✅ 変更ファイル数が最小（3ファイル + Prismaスキーマ）
- ✅ アップロードコンポーネント・APIは無変更で再利用
- ✅ `prisma db push` のみでスキーマ反映可能
- ⚠️ 管理者が誤って複数レコードを作成できる（最初の1件のみ有効）

### オプションB: オプションA + beforeDb フック による1件制限

**方針**: オプションAに加え、`options.tsx` の `beforeDb` フックで2件目の作成をブロック。

**追加変更**:
- `options.tsx` の `HomeCameraConfig.edit.hooks.beforeDb` で既存レコード数チェック → 1件超で `HookError`

**trade-offs**:
- ✅ シングルトン保証がUI上で明示的
- ✅ `Activity.edit.hooks.beforeDb` に同パターンあり（日付バリデーション）
- ❌ サーバーサイドでの件数チェックが必要（軽微な追加実装）

### オプションC: ハードコード定数を環境変数化（DB不使用）

**方針**: DB/adminを使わず `.env` で管理（スコープ外のため参考のみ）。

- ❌ 要件「デプロイなしで反映」を満たせないため不採用

---

## 4. 推奨アプローチと設計フェーズへの引き継ぎ

### 推奨: **オプションB**（findFirst + 1件制限フック）

理由:
- 既存の `Spot` / `Activity` パターンと完全整合
- 変更対象ファイルが3つ（+スキーマ）と最小
- beforeDb フックによる1件制限でシングルトン性を保証
- アップロード系コンポーネント・APIは無変更再利用

### 設計フェーズへの引き継ぎ事項

1. **`HomeCameraConfig` モデルのフィールド確定**: `label String?` / `scale Float?` / `arAssetUrl String?` / `mindFileUrl String?` / `markerImageUrl String?` — すべて Optional で、未設定時はページ側でフォールバック
2. **`camera/page.tsx` の Server Component化**: 現在は純粋なサーバーコンポーネント（Client Componentではない）— Prisma直接呼び出しが可能
3. **next-admin の `HomeCameraConfig` 表示名**: サイドバー表示は「自宅でひめっこ撮影」
4. **`scale` の型**: `Float?` (Prisma) → TypeScript `number | null` → 未設定時は `0.5` フォールバック

---

## 5. 実装複雑度・リスク評価

| 指標 | 評価 | 根拠 |
|------|------|------|
| **工数** | S（1〜3日） | 既存Spot/SpotCameraパターンの直接踏襲、変更ファイル最小 |
| **リスク** | Low | 既存コンポーネント・API無変更再利用、フォールバックにより既存訪問者体験への影響なし |
