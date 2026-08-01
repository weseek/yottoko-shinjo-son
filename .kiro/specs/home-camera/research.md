# ギャップ分析: home-camera

## 対象要件
`.kiro/specs/home-camera/requirements.md` 参照

---

## 1. 現状調査

### 既存ARコンポーネントの再利用可能性

| コンポーネント | パス | スポット依存 | 再利用可否 |
|---|---|---|---|
| `ArScene` | `spots/[slug]/camera/_components/ArScene.tsx` | なし | ✅ そのまま再利用可 |
| `PhotoPreview` | `spots/[slug]/camera/_components/PhotoPreview.tsx` | なし | ✅ そのまま再利用可 |
| `ArLanding` | `spots/[slug]/camera/_components/ArLanding.tsx` | 弱い（`DemoSpotData`型: id/name/description） | ⚠️ props型を抽象化すれば再利用可 |
| `SpotArExperience` | `spots/[slug]/camera/_components/SpotArExperience.tsx` | **あり**（`spot.slug`でバック遷移先を決定） | ⚠️ 改修または代替が必要 |

**SpotArExperience の依存箇所:**
```typescript
// 戻るボタンのナビゲーション（slug依存）
const backToSpot = useCallback(() => {
  router.push(`/spots/${spot.slug}`);
}, [router, spot.slug]);
```
この1箇所のみがスポット固有。`backHref` propを追加すれば解消可能。

### AR型・ユーティリティ（lib/ar/）

| 型/関数 | 内容 | home-camera での利用 |
|---|---|---|
| `TargetConfig` | `{ mindFileUrl: string; targetIndex?: number }` | ✅ そのまま使用 |
| `ModelConfig` | `{ url: string; label: string; scale?: number; rotation? }` | ✅ そのまま使用 |
| `CaptureResult` | `{ dataUrl: string; capturedAt: Date }` | ✅ そのまま使用 |
| `ArSceneState` | 8フェーズのUnion型 | ✅ そのまま使用 |
| `getStatusMessage` | フェーズ→日本語メッセージ | ✅ そのまま使用 |
| `checkBrowserCompatibility` | WebGL + getUserMedia検証 | ✅ そのまま使用 |

### 既存パブリックアセット

```
/public/assets/himekko.glb          ← デフォルトヒメッコ3Dモデル
/public/assets/targets/demo.mind    ← デフォルトマーカーファイル
/public/assets/targets/demo-marker.png
```

→ **α版はこれらをデフォルト値として流用可能**（追加アセット不要）

### データモデル（Prisma）

- **グローバルアプリ設定モデルなし**: `HomePhotoConfig` 相当のモデルは存在しない
- 既存モデル: `Activity`, `Entry`, `ActivityImage`, `Spot`, `NotificationRecipient`
- 将来のadmin設定（Requirement 6）には新しいPrismaモデルが必要

### Admin機能

- `MindFileUploadInput` コンポーネント（`admin/_components/mind-file-upload-input.tsx`）が既存 → 将来のヒメッコGLBアップロードに流用可能
- `ImageUploadInput` も存在 → GLBファイルのアップロードUI参考にできる
- `options.tsx` パターン（カスタムフィールド・beforeDb/afterDbフック）を踏襲すれば追加が容易

### ルーティング

候補パス: `/src/app/camera/page.tsx`（スポットと完全独立）

---

## 2. 要件→実装資産マッピング

| 要件 | 既存資産 | ギャップ | 難易度 |
|---|---|---|---|
| 1. 専用URLへのアクセス | なし | `/camera` ルート新規作成が必要 | 低 |
| 2. ランディング画面 | `ArLanding`（再利用可） | スポット情報なし → タイトル/説明を静的テキストに変更 | 低 |
| 2.3 ブラウザ互換チェック | `checkBrowserCompatibility` | なし（既存をそのまま使用） | 低 |
| 2.5 トップへ戻るリンク | `SpotArExperience`の戻るボタン | バック先が`/spots/[slug]`固定 → 変更必要 | 低 |
| 3. AR撮影画面 | `ArScene`（完全再利用可） | なし | 低 |
| 3.3 自宅用ヒメッコ表示 | `ModelConfig` + `himekko.glb` | 自宅用専用GLBがなければ既存を流用 | 低 |
| 4. プレビュー画面 | `PhotoPreview`（完全再利用可） | なし | 低 |
| 5.1 スポットと独立したヒメッコ設定 | なし（現在ハードコード） | ページ内でデフォルト定数として分離定義 | 低 |
| 5.2 デフォルトモデル使用 | `FALLBACK_MODEL`, `DEFAULT_TARGET` | home-camera用に別定数として定義 | 低 |
| 6. Admin設定（将来） | `MindFileUploadInput`, `ImageUploadInput` | 新Prismaモデル + admin optionsへの追加 | 中 |

**Requirement 3.4（スキャン状態表示）補足:**
現行のARはMindARのマーカーベース追跡。`demo.mind`はデモ用マーカー画像で動作するが、自宅ユーザーが同マーカーを持っていない可能性がある。デザイン段階でマーカー提供方法（印刷用QR埋め込み等）の検討が必要。

---

## 3. 実装アプローチ案

### Option A: SpotArExperienceを最小改修（推奨 α版）

**変更内容:**
1. `SpotArExperience` に `backHref?: string` propを追加
2. `backToSpot` 関数を `backHref ?? /spots/${spot.slug}` に変更
3. `spot` propの `id`/`slug` をオプショナル化（ランディング表示用の `name`/`description` のみ使用）
4. `/src/app/camera/page.tsx` を新規作成し、デフォルト定数（model/target）を定義

**長所:** 既存コードへの影響最小、再利用最大
**短所:** `SpotArExperience` がスポット文脈と自宅文脈の両方を持つ

**ファイル変更数:** 2ファイル変更 + 1ファイル新規

---

### Option B: HomeArExperienceを新規作成（変更リスク最小）

**変更内容:**
1. `SpotArExperience` は一切変更しない
2. `HomeArExperience` を `/src/app/camera/_components/HomeArExperience.tsx` に新規作成
3. `ArScene`, `PhotoPreview`, `ArLanding`（props調整）を組み合わせる
4. `/src/app/camera/page.tsx` を新規作成

**長所:** 既存コードへの変更ゼロ、ロールバック容易
**短所:** `SpotArExperience` とのロジック重複（ステート管理・エラーハンドリング）

**ファイル変更数:** 0ファイル変更 + 2ファイル新規

---

### Option C: ハイブリッド（共通基盤抽出）

**変更内容:**
1. `ArExperience`（基底コンポーネント）を抽出
2. `SpotArExperience` / `HomeArExperience` がそれを使用
3. `ArLanding` の props を汎用化（`context: { title, description }`）

**長所:** 長期的な保守性が高い
**短所:** リファクタリング量が多い、α版には過剰

**ファイル変更数:** 3ファイル変更 + 2ファイル新規

---

## 4. 工数・リスク評価

| 観点 | 評価 | 根拠 |
|---|---|---|
| **工数** | **S（1〜3日）** | コンポーネントが高度に再利用可能。DB変更なし（α版）。新規実装はページとデフォルト定数のみ |
| **リスク** | **低** | 既存ARロジックに変更なし（OptionB）またはpropの最小追加のみ（OptionA）。既存スポット機能への影響が限定的 |

---

## 5. デザイン段階への引き継ぎ事項

**推奨アプローチ:** Option A（最小改修）をα版として採用し、将来のadmin設定追加時にOption Cへ移行する段階的戦略

**設計フェーズで決定が必要な事項:**
1. **マーカー提供方法**: `demo.mind`マーカー画像をユーザーにどう提供するか（ランディング画面への印刷用QR/画像表示、またはマーカーレスAR検討）
2. **ルートパス**: `/camera` vs `/home-camera` の選択
3. **ArLanding props の汎用化方法**: `DemoSpotData`型を継続使用するか、汎用`title/description`に変更するか
4. **将来admin設定用Prismaモデル設計**: `HomePhotoConfig`（単一レコード）vs `AppSetting`（key-value汎用）の選択
5. **自宅用ヒメッコの初期アセット**: `himekko.glb` / `demo.mind` を流用するか、専用アセットを用意するか

---

## デザインフェーズ: 合成・設計決定

### 合成結果

**Generalization（汎化）**
- `ArScene` / `PhotoPreview` はそのまま再利用（スポット非依存が確認済み）
- ランディングについては `ArLanding`（`DemoSpotData`型に依存）を再利用せず、`HomeArExperience` 内にホーム専用ランディングを内包する選択を取った。理由: マーカー参照画像の表示が必要であり、`ArLanding` を改修するよりインライン化の方がシンプル

**Build vs Adopt**
- MindAR + Three.js: 既存使用中、変更なし
- 新規npm依存: なし

**Simplification（単純化）**
- `SpotArExperience` の改修（`backHref` prop追加案）は採用しない。既存コードへの変更リスクゼロを優先しOption B（`HomeArExperience`新設）を選択
- α版は Prisma モデル追加なし。将来の admin 設定は仕様から明示的に切り離した
- `ArLanding` コンポーネントの汎用化は行わない（投機的抽象のため）

### マーカー提供方法の決定
自宅ARはMindARのマーカーベースで継続。`demo-marker.png`（既存アセット）をランディング画面に表示し、ユーザーが別デバイス画面や印刷物としてマーカーを用意できるようにする。

### 設計選択: HomeArExperience 新設（Option B）
- 理由: 既存 SpotArExperience への変更リスクゼロ。コードの若干の重複よりも安全性を優先
- 重複するロジック: ビュー状態管理（~50行）、ARステータス表示（~30行）
- 許容判断: 自宅撮影は機能上スポット撮影と独立しており、将来の発散も想定される
