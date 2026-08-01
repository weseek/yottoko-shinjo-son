# リサーチ・設計決定ログ

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

---

## Summary

- **Feature**: `activity-image-upload`
- **Discovery Scope**: Extension（既存システムへの機能追加）
- **Key Findings**:
  - `ActivityImage` モデルはPrismaスキーマに既定義。スキーマ変更不要。
  - ユーザー向けの一覧・詳細ページは `images` リレーションを既にクエリ・描画済み。フロントエンド変更不要。
  - admin画面の Activity 編集フォームに画像管理UIが存在しない点が唯一の実装ギャップ。
  - `@premieroctet/next-admin ^8.4.2` の `CustomInputProps` を使ったカスタム入力コンポーネント（参考: `ImageUploadInput`）により実装可能。

---

## Research Log

### next-admin カスタム入力の仕組み調査

- **Context**: Activity の `images` フィールドに対してカスタム画像管理UIを差し込む方法を確認
- **Sources Consulted**: `src/app/admin/_components/image-upload-input.tsx`, `src/app/admin/option.tsx`（Spot の imageUrl 設定）
- **Findings**:
  - `fields.<fieldName>.input: <ReactComponent />` でフィールドのUI全体を差し替えられる
  - `CustomInputProps` は `{ value, onChange, disabled, required, name }` を提供
  - `ImageUploadInput` は単一URL文字列に対応するが、`ActivityImage[]` (1:many) には直接使えない
  - `value` / `onChange` を利用せず、コンポーネント自体がAPIを直叩きするパターンも可能（自立型コンポーネント）
- **Implications**:
  - `ActivityImagesInput` は next-admin の form lifecycle に依存せず、独自APIエンドポイントで即時永続化する設計が最もシンプル

### activityId の取得方法

- **Context**: カスタム input コンポーネントが現在編集中の Activity ID を知る必要がある
- **Sources Consulted**: next-admin ドキュメント、`CustomInputProps` 型定義
- **Findings**:
  - `CustomInputProps` には record ID のプロパティが含まれない
  - next-admin の編集URLパターン: `/admin/Activity/[id]` (編集), `/admin/Activity` (新規)
  - ブラウザの `window.location.pathname` から正規表現で抽出可能 `/Activity\/(\d+)/`
  - 新規作成時（IDなし）はコンポーネントが非活性状態を表示する
- **Implications**:
  - URL から activityId を抽出する方法を採用する（シンプルかつ next-admin の内部実装に依存しない）

### 既存ストレージ実装調査

- **Context**: 画像保存先とアップロードAPIの確認
- **Sources Consulted**: `src/lib/storage.ts`, `src/app/api/admin/upload/route.ts`
- **Findings**:
  - `public/uploads/` へのローカルファイル保存
  - JPEG・PNG・WebP・GIF 対応、5MB上限
  - `uploadImage(file)` は URL文字列 (`/uploads/<filename>`) を返す
  - 既存エンドポイント `POST /api/admin/upload` を再利用可能
- **Implications**:
  - アップロードAPIの変更不要。`ActivityImagesInput` は既存エンドポイントを呼ぶだけでよい

### ユーザー向けページの実装状況確認

- **Context**: 要件3・4（ユーザー向け画像表示）が実装済みかどうかの確認
- **Sources Consulted**: `src/app/activities/page.tsx`, `src/app/activities/[id]/page.tsx`, `src/app/activities/_components/activity-card.tsx`
- **Findings**:
  - `activities/page.tsx`: `images: { take: 1, orderBy: { order: 'asc' } }` で取得し `thumbnailUrl` としてカードに渡している
  - `activities/[id]/page.tsx`: `images: { orderBy: { order: 'asc' } }` で全画像取得・描画済み
  - 画像なしの場合のプレースホルダーも実装済み
- **Implications**:
  - ユーザー向けページへの実装は不要。adminから画像を登録するだけで反映される

---

## Architecture Pattern Evaluation

| Option | 説明 | 強み | リスク・制限 | 備考 |
|--------|------|------|-------------|------|
| A: 自立型カスタムコンポーネント | `ActivityImagesInput` が独自APIを直接呼び、即時永続化 | next-admin の form lifecycle に依存しない。シンプル | next-admin 非対応の副作用UIに見える | **採用** |
| B: next-admin の ActivityImage モデル管理 | `ActivityImage` を独立したadminモデルとして設定 | 追加APIが不要 | UX が悪い（別画面での管理）。ActivityとImageの紐付けが見えにくい | 不採用 |
| C: next-admin relation field の標準UI | `images` フィールドをそのままnext-adminに任せる | 実装コスト最小 | ファイルアップロードUIにならない（ID選択UI）。要件を満たせない | 不採用 |

---

## Design Decisions

### Decision: 自立型コンポーネントパターン（immediate-persist）

- **Context**: `ActivityImage` は1:many リレーションで、next-admin の標準 CustomInputProps（単一値）と相性が悪い
- **Alternatives Considered**:
  1. next-admin の onChange に全画像URLの配列を渡す → next-admin の relation保存フローと競合する可能性
  2. 自立型コンポーネントとして APIを直叩き → form lifecycle に依存しない
- **Selected Approach**: コンポーネントが独自API (`/api/admin/activity-images/`) を呼び、各操作（追加・削除・並び替え）を即座にDBへ反映する
- **Rationale**: `ImageUploadInput` も即時アップロードパターンを採用している。一貫性があり、シンプル。
- **Trade-offs**: 画像追加後に Activity 保存をキャンセルしても画像レコードが残る（孤立レコード）可能性があるが、Activity 削除時は `onDelete: Cascade` が設定済みのため問題なし
- **Follow-up**: 新規作成フローでの孤立レコード対策は V2 以降で検討

### Decision: 新規作成時は画像アップロード非活性

- **Context**: 新規 Activity 作成時は activityId が存在しない
- **Alternatives Considered**:
  1. 一時IDを割り当てて後からactivityIdを紐付ける → 複雑
  2. 作成フローで画像アップロードを無効化し、保存後に追加を促す → シンプル
- **Selected Approach**: 新規作成画面では「保存後に画像を追加できます」メッセージを表示し、アップロードUIを非活性化
- **Rationale**: α版スコープではシンプルさを優先。管理者は手順（先に保存→編集で画像追加）を理解できる

### Decision: 並び替えは上下ボタン方式

- **Context**: `ActivityImage.order` による並び順管理が要件
- **Alternatives Considered**:
  1. ドラッグ&ドロップ（@dnd-kit等）→ ライブラリ追加が必要、複雑
  2. 上下ボタン → 追加ライブラリなし、シンプル
- **Selected Approach**: 画像横に「↑ / ↓」ボタンを配置し、クリックで `order` を入れ替え
- **Rationale**: α版では機能性より実装シンプルさを優先。ドラッグ&ドロップは V2 以降

---

## Risks & Mitigations

- **孤立した ActivityImage レコード**: 新規Activity作成中断時に残る可能性 → ActivityImage は `onDelete: Cascade` 設定済みで Activity削除時に消える。影響軽微
- **URLベースのactivityId取得**: next-admin のルーティング変更に脆弱 — next-admin v8系での `/admin/Activity/[id]` パターンは安定しており、短期リスクは低い
- **ローカルストレージへの依存**: `public/uploads/` はサーバー再起動や複数インスタンスで消失する可能性 → 既存のSpot画像と同様の前提。本番移行時にS3等への変更が必要だが、スコープ外

---

## References

- `src/app/admin/_components/image-upload-input.tsx` — 既存の単一画像アップロードコンポーネント（参考実装）
- `src/lib/storage.ts` — ファイル保存・バリデーション処理
- `prisma/schema.prisma` lines 64-73 — ActivityImage モデル定義
