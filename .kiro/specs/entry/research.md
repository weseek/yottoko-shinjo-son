# Research & Design Decisions

## Summary
- **Feature**: `entry`
- **Discovery Scope**: Extension（既存の Activity システムに申込機能 + 論理削除を追加）
- **Key Findings**:
  - Server Actions で申込フォーム送信を処理可能（API Route 不要）
  - Prisma 7 client extensions で論理削除をモデル単位で透過的に実装可能
  - next-admin は Prisma Client インスタンスを受け取るため、extensions 適用済みインスタンスをそのまま渡せる

## Research Log

### Next.js Server Actions によるフォーム処理
- **Context**: 申込フォームは名前（必須）+ メッセージ（任意）の 2 フィールドのみ。専用 API Route が必要かを検討。
- **Findings**:
  - Next.js 15 App Router では Server Actions が安定機能として提供されている
  - `"use server"` ディレクティブで定義し、`<form action={serverAction}>` で呼び出し可能
  - バリデーション失敗時は `useActionState` でエラーを返却しフォームに表示
  - 成功時は `redirect()` で完了ページに遷移
- **Implications**: API Route を別途作成する必要がなく、型安全なフォーム処理が可能

### Prisma 7 での論理削除実装
- **Context**: Activity と Entry の両モデルで論理削除を導入する必要がある。Prisma 7 での推奨パターンを調査。
- **Findings**:
  - Prisma 7 では `$extends()` による client extensions が推奨（旧 middleware は非推奨）
  - `query` 拡張で `delete` → `update(deletedAt)` 変換、`findMany/findFirst` → `deletedAt: null` フィルタ自動付与が可能
  - 拡張は `$allModels` にも特定モデルにも適用可能
  - 拡張後の型は元の `PrismaClient` と互換性が薄いが、既存コードが `as unknown as PrismaClient` キャストを使用しているため影響なし
- **Implications**: `prisma.ts` で拡張を適用すれば、アプリ全体（next-admin 含む）で透過的に論理削除が機能する

### next-admin での Entry モデル管理
- **Context**: Activity と同様に next-admin で Entry の CRUD・ステータス管理を行えるかを確認。
- **Findings**:
  - next-admin は Prisma スキーマからモデルを自動検出し CRUD UI を生成
  - `options.ts` の `model` に `Entry` を追加し、`sidebar.groups` にモデルを登録するだけで一覧・詳細・編集画面が提供される
  - `list.filters` でステータスフィルタ、`list.fields.formatter` でステータス表示のカスタマイズが可能
  - Activity の既存パターン（aliases, filters, formatters, hooks）をそのまま踏襲可能
- **Implications**: 管理画面の実装コストは最小限（`options.ts` への設定追加のみ）

### 既存コードの申込導線
- **Context**: 現在 `/activities/[id]/apply/page.tsx` にプレースホルダーページが存在。
- **Findings**:
  - 詳細ページ (`[id]/page.tsx`) に「参加してみる」ボタンがあり、`/activities/${id}/apply` へリンク
  - 現在の apply ページは「準備中です」のスタティック表示のみ
  - レイアウトは `activities/layout.tsx` が共通で適用される
- **Implications**: 既存のルーティング構造・レイアウトを維持し、apply ページの中身を差し替えるだけで実装可能

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Server Actions + Server Components | フォーム送信を Server Action で処理、ページは RSC | API Route 不要、型安全、シンプル | クライアント状態管理が限定的 | 2 フィールドの軽量フォームに最適 |
| API Route + Client Component | 専用 API Route を作成し fetch で送信 | クライアント側の柔軟性が高い | オーバーエンジニアリング | フィールド数が多い場合に検討 |

## Design Decisions

### Decision: Server Actions によるフォーム処理
- **Context**: 申込フォームは 2 フィールドのみで軽量
- **Alternatives Considered**:
  1. Server Actions — `"use server"` + `useActionState`
  2. API Route — `/api/entries` POST エンドポイント
- **Selected Approach**: Server Actions
- **Rationale**: フィールド数が少なく、API Route を作成するオーバーヘッドが不要。Next.js の推奨パターンに沿う。
- **Trade-offs**: クライアント側のリッチなインタラクションは制限されるが、今回のフォームには不要
- **Follow-up**: フォームが複雑化した場合は API Route への移行を検討

### Decision: Prisma Client Extensions による論理削除
- **Context**: Activity と Entry の両方で論理削除が必要
- **Alternatives Considered**:
  1. Prisma Client Extensions — `$extends()` でクエリ層を透過的に変換
  2. アプリケーション層での手動フィルタ — 各クエリで `deletedAt: null` を明示
  3. DB View — 未削除レコードのみの View を作成
- **Selected Approach**: Prisma Client Extensions
- **Rationale**: 一元管理でフィルタ漏れを防止。既存コード・next-admin にも透過的に適用される。
- **Trade-offs**: 全クエリに暗黙のフィルタが適用されるため、削除済みレコードを意図的に取得する場合は別手段が必要
- **Follow-up**: 削除済みレコードの参照が必要になった場合、raw query または拡張なしの別クライアントインスタンスを用意

### Decision: 完了ページの独立ルート
- **Context**: 申込完了後の表示方法を決定
- **Alternatives Considered**:
  1. `/activities/[id]/apply/complete` — 独立ルート
  2. apply ページ内での状態切り替え — クライアント状態で表示切替
- **Selected Approach**: 独立ルート
- **Rationale**: Server Component として実装でき、ブラウザの戻るボタンでフォーム再送信を防止。URL を共有可能。
- **Trade-offs**: ルートが 1 つ増えるが、シンプルさを維持
- **Follow-up**: なし

---

## ギャップ分析：キャンセルフロー（Requirement 9）

### 分析サマリー

- **スコープ**: キャンセル確認ページ（デザイン更新）・`cancelEntry` Action（バグ修正＋リダイレクト変更）・キャンセル完了ページ（新規作成）
- **重大な技術的制約**: `prisma` シングルトンの論理削除 Extension が `findFirst/findMany` に `deletedAt: null` を自動付与するため、キャンセル後の Entry を `prisma` で取得できない（後述）
- **既存バグ**: 現在の `cancelEntry` は削除後に `prisma.entry.findFirst` で Entry を取得しようとするが、Extension により常に `null` が返り `/activities/` へリダイレクトされるバグがある
- **推奨アプローチ**: キャンセル前に必要データを取得しリダイレクト URL に埋め込む（`rawPrisma` バイパス不要）
- **実装規模**: S（既存パターンの踏襲のみ、新規技術不要）

---

### 現状調査

#### 既実装ファイル

| ファイル | 状態 | 備考 |
|---|---|---|
| `src/app/entries/[cancelToken]/cancel/page.tsx` | 実装済み・デザイン不一致 | タイトル・ボタン色・カードレイアウト・猫画像が仕様と異なる |
| `src/app/entries/[cancelToken]/cancel/actions.ts` | 実装済み・バグあり | リダイレクト先が誤り + 削除後クエリバグ |
| `src/app/entries/[cancelToken]/cancel/complete/page.tsx` | **存在しない** | 新規作成が必要 |

#### 技術的制約：論理削除 Extension の影響

`src/lib/prisma.ts` の `$extends()` は `SOFT_DELETABLE_MODELS`（Activity, Entry）の `findFirst` / `findMany` / `findUnique` / `count` クエリに自動で `deletedAt: null` を付与する。

**バグの再現**:
```ts
// cancelEntry action 内（actions.ts L17-22）
// cancelToken で updateMany 実行後、Entry の deletedAt は設定済み
const entry = await prisma.entry.findFirst({
  where: { cancelToken },   // Extension が deletedAt: null を自動付与
  // → キャンセル済みのため常に null が返る
});
redirect(`/activities/${entry?.activityId ?? ""}`);
// → /activities/ へリダイレクト（空文字 = 壊れたURL）
```

同様に、キャンセル完了ページで `prisma.entry.findFirst({ where: { cancelToken } })` を使うと常に `null` になる。

---

### 要件 → 技術要素マッピング

| 要件 | 技術要素 | 状態 |
|---|---|---|
| 9.1 キャンセル確認ページ表示 | `cancel/page.tsx` デザイン更新 | **Missing（デザイン不一致）** |
| 9.2 `magao_cats.png` 表示 | 画像ファイル存在確認済み | **Missing（未実装）** |
| 9.3 既キャンセル済みエラー | `page.tsx` の既存 not-found 分岐 | 実装済み（流用可） |
| 9.4 論理削除実行 | `cancelEntry` の `updateMany` | 実装済み |
| 9.5 `/cancel/complete` へリダイレクト | `actions.ts` のリダイレクト先変更 | **Missing（バグあり）** |
| 9.6 `ozigi_cats.png` + メッセージ表示 | `cancel/complete/page.tsx` 新規作成 | **Missing** |
| 9.7 キャンセル済み申込内容表示 | 上記、論理削除後のデータ取得方法の解決が必要 | **Constraint** |
| 9.8 一覧への導線 | `/activities` へのリンク | **Missing** |

---

### 実装アプローチ評価

#### 論理削除後のデータ取得（Constraint 解決）

**Option A: リダイレクト URL にデータを埋め込む（推奨）**

`cancelEntry` Action でキャンセル前（`updateMany` 実行前）に Entry の `activityId` と `name` を取得し、完了ページの URL にクエリパラメータとして渡す。

```ts
// actions.ts（修正案）
const entry = await prisma.entry.findFirst({
  where: { cancelToken, deletedAt: null },  // キャンセル前なので正常に取得可
  select: { activityId: true, name: true },
});
if (!entry) { redirect(`/entries/${cancelToken}/cancel?notfound=1`); }

await prisma.entry.updateMany({ where: { cancelToken, deletedAt: null }, data: { deletedAt: new Date() } });

redirect(`/entries/${cancelToken}/cancel/complete?activityId=${entry.activityId}&name=${encodeURIComponent(entry.name)}`);
```

完了ページは `searchParams` から `activityId` と `name` を読み取り、Activity（削除されていない）を `prisma.activity.findFirst` で取得する。

- ✅ `rawPrisma` バイパス不要
- ✅ 完了ページは Activity（非削除）のみ参照すればよい
- ✅ 既存パターンを踏襲
- ❌ URL にユーザー名が含まれる（URLエンコード必須、許容範囲内）

**Option B: `rawPrisma` を使用**

`rawPrisma`（Extension なしの PrismaClient）で削除済み Entry を直接取得する。`rawPrisma` は既にエクスポート済み。

- ✅ 完了ページから直接クエリ可能
- ❌ `rawPrisma` は現在「Better Auth 専用」と明記されており、用途の拡大が混乱を招く

**Option C: 専用バイパス関数を `prisma.ts` に追加**

`baseClient.entry.findFirst(...)` をラップした `findDeletedEntry` 関数をエクスポートする。

- ✅ 意図が明示的
- ❌ 完了ページという限定用途のために prisma.ts を変更するのは過剰

**→ 推奨: Option A**（URL クエリパラメータ経由）。既存パターンを逸脱せず、最もシンプル。

#### ページ実装アプローチ

| タスク | アプローチ | 選択理由 |
|---|---|---|
| 5.1 キャンセル確認ページ デザイン更新 | Option A（既存ファイル更新） | データ取得ロジックは変更不要、JSX のみ差し替え |
| 5.2 `cancelEntry` Action 修正 | Option A（既存ファイル更新） | バグ修正 + リダイレクト先変更のみ |
| 5.3 キャンセル完了ページ 新規作成 | Option B（新規ファイル作成） | 既存ルートに存在しない独立したページ |

---

### 実装複雑度・リスク評価

- **実装規模**: S（1〜2日）
  - 既存パターン（Server Component + Prisma 直接呼び出し、デザイントークン）をすべて踏襲
  - 新規ライブラリ・DBマイグレーション不要
- **リスク**: Low
  - 論理削除の制約は Option A で回避可能（既存の研究結果の延長）
  - 唯一の注意点は `cancelEntry` のデータ取得順序（削除前に取得）

---

### 設計フェーズへの引き継ぎ事項

1. **`cancelEntry` のデータ取得順序の変更**: `updateMany` より前に `findFirst` で entry を取得する
2. **完了ページの `searchParams` 型定義**: `activityId`（数値）と `name`（文字列）を受け取る
3. **完了ページの Activity 取得**: キャンセル後もアクティビティ詳細（タイトル・実施日時）は取得可能

## Risks & Mitigations
- **next-admin と論理削除の互換性**: Prisma extensions が next-admin の内部クエリにも適用されるか → 既存の prisma インスタンスを共有しているため問題なし。ただし、next-admin の delete 操作が extensions 経由で soft delete に変換されることを実装時にテストで確認する
- **二重送信**: ユーザーが送信ボタンを連打した場合 → Server Action 実行中のボタン無効化 (`useFormStatus`) で対策
- **論理削除後の外部キー整合性**: Activity が論理削除されても Entry の `activityId` は維持されるため整合性は保たれる
