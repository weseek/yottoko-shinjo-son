# ギャップ分析: sns-share

## 調査サマリー

- **スコープ**: 変更箇所は極めて小さい。シェアテキスト・URLの文言変更のみで要件1は達成可能
- **最重要発見**: `PhotoPreview.tsx` にはシェアテキスト・URLがすでにハードコードで実装済み（内容の更新のみ必要）
- **要件2は実質達成済み**: `SpotArExperience.tsx` はデフォルトでプレビュー表示から始まる。`page.tsx`（軸①）にはすでに `/spots/[slug]/camera` へのリンクが存在する
- **実装アプローチ**: Option A（直接編集）または Option B（定数ファイル抽出）の2択。どちらもリスクは極めて低い
- **工数**: XS（半日以下）

---

## 1. 現状調査

### 関連ファイル

| ファイル | 役割 | 状態 |
|----------|------|------|
| `src/app/spots/[slug]/camera/_components/PhotoPreview.tsx` | 撮影後プレビュー・シェアUI | シェアテキスト・URL実装済み（内容変更のみ必要） |
| `src/app/spots/[slug]/camera/_components/SpotArExperience.tsx` | AR体験全体の状態管理 | デフォルトがpreviewビューで1×1透過PNGを表示 |
| `src/app/page.tsx` | 軸①開発用ポータル（非本番のみ） | `/spots/[slug]/camera` リンクがFlowStepとPageLinkに既存 |
| `src/lib/ar/utils.ts` | Web Share APIサポート判定 | `navigator.share` の存在確認のみ |

### 既存の実装詳細

**PhotoPreview.tsx の handleShare（現状）**:
```typescript
await navigator.share({
  title: "AR記念撮影 - Arcana",
  files: [file],
  text: "新庄村に来てひめっ子とAR撮影してきました📸\nあなたも一緒に撮影してみよう",  // ← 要変更
  url: "https://example.com/",  // ← 要変更（/ja/ を追加）
});
```

**SpotArExperience.tsx のデフォルト状態（現状）**:
```typescript
const [view, setView] = useState<View>({
  kind: "preview",  // ← デフォルトがpreview！
  captureResult: {
    dataUrl: "data:image/png;base64,iVBOR...",  // 1×1透過PNG
    capturedAt: new Date(),
  },
});
```
→ `/spots/[slug]/camera` にアクセスすると**即座にプレビュー画面が表示される**

**page.tsx の既存リンク（軸①の FlowSection と PageLink）**:
```tsx
// FlowSection 軸①（ステップ2）
href={`/spots/${sampleSpot.slug}/camera`}

// ページ一覧 → 来村者向け AR記念撮影
href={`/spots/${sampleSpot.slug}/camera`}  // label="AR撮影"
```
→ 開発ポータルから `/spots/[slug]/camera` へのリンクが**すでに存在する**

### canShare ユーティリティの制約

```typescript
export function canShare(nav: { share?: unknown }): boolean {
  return typeof nav.share === "function";
}
```

- `navigator.share` の存在のみを確認し、ファイル共有サポート（`navigator.canShare({ files })`）を確認していない
- `handleShare` はファイル付きで `navigator.share()` を呼ぶが、エラーは try/catch で無視される
- 既存動作として許容範囲内。ただし設計フェーズで改善を検討できる

---

## 2. 要件実現可能性分析

### 要件1: SNSシェアコンテンツの提供

| 技術的ニーズ | 現状 | ギャップ |
|-------------|------|---------|
| 撮影済み画像のシェア | ✅ 実装済み（PNG Blob変換・files配列） | なし |
| テキストメッセージのシェア | ✅ 実装済み（ただし内容が異なる） | 文言を変更（1行） |
| URLのシェア | ✅ 実装済み（ただしパスが異なる） | `/` → `/ja/`（1行） |
| 非対応ブラウザでボタン非表示 | ✅ 実装済み（shareSupported） | なし |
| キャンセル・失敗時の無視 | ✅ 実装済み（try/catch） | なし |

**実際のギャップ**: テキスト内容とURL末尾パスの2行変更のみ

### 要件2: 開発用プレビューアクセス

| 技術的ニーズ | 現状 | ギャップ |
|-------------|------|---------|
| 開発環境からプレビュー画面へのリンク | ✅ page.tsx にリンク存在 | なし（すでに達成済み） |
| サンプル画像でのプレビュー表示 | ✅ SpotArExperience デフォルトがpreview | なし（すでに達成済み） |

**実際のギャップ**: なし。ただし、ユーザーが気づいていない可能性があるため、既存リンクの存在を設計ドキュメントに記載する

---

## 3. 実装アプローチの選択肢

### Option A: PhotoPreview.tsx を直接編集（最小変更）

**変更対象**: `PhotoPreview.tsx` の `text` と `url` の2行のみ

```typescript
// 変更前
text: "新庄村に来てひめっ子とAR撮影してきました📸\nあなたも一緒に撮影してみよう",
url: "https://example.com/",

// 変更後
text: "新庄村に遊びにきたよ！あなたも自宅でひめっ子と撮影してみよう",
url: "https://example.com/",
```

**工数**: XS（15分）  
**リスク**: 極低  
**トレードオフ**:
- ✅ 変更箇所が最小
- ✅ 既存パターンに沿っている
- ❌ URLや文言の将来的な変更時に実装ファイルを直接触る必要がある

### Option B: シェア設定を定数ファイルに抽出（推奨）

**変更対象**:
1. `src/lib/ar/share-config.ts` を新規作成（シェアテキスト・URL定数）
2. `PhotoPreview.tsx` から import

```typescript
// src/lib/ar/share-config.ts
export const SHARE_TEXT = "新庄村に遊びにきたよ！あなたも自宅でひめっ子と撮影してみよう";
export const SHARE_URL = "https://example.com/";
```

**工数**: XS（30分）  
**リスク**: 極低  
**トレードオフ**:
- ✅ 文言・URL変更時の発見性が高い（1ファイルを見ればわかる）
- ✅ 将来的な環境別URL切り替えにも対応しやすい
- ❌ ファイルが1つ増える

---

## 4. 工数・リスク評価

| 項目 | 評価 | 根拠 |
|------|------|------|
| 工数 | **XS** (半日以下) | 実質2行の文言変更。要件2はすでに実装済み |
| リスク | **極低** | 既存の try/catch でエラー処理済み。既存テストへの影響なし |

---

## 5. 設計フェーズへの推奨事項

1. **優先アプローチ**: Option B（定数ファイル抽出）— 変更コストはほぼ同じで将来の保守性が向上する
2. **要件2の扱い**: 実装不要。設計ドキュメントで既存の実現方法を明記し、今後URLを変えたい場合の手順（`page.tsx` の `getSampleSpot()` ロジック参照）を記載する
3. **canShare の改善**（任意）: `handleShare` 内でもファイル共有サポートを確認するよう `canShare` を拡張することを設計で検討できる。ただし優先度は低い
