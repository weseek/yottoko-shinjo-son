# Research & Design Decisions

## Summary
- **Feature**: activity-admin
- **Discovery Scope**: Simple Addition（CRUD 管理画面、next-admin による自動生成）
- **Key Findings**:
  - next-admin v8 は Prisma スキーマから CRUD UI を自動生成し、Next.js App Router に対応済み
  - `prisma-json-schema-generator` と TailwindCSS が next-admin の必須依存
  - 自前コンポーネント（テーブル・フォーム・検索・ページネーション）は不要となり、`NextAdminOptions` による宣言的カスタマイズで要件を充足可能

## Research Log

### next-admin アーキテクチャと統合方式
- **Context**: 管理画面を自前構築する代わりに next-admin を採用する方針に変更
- **Sources Consulted**: next-admin.js.org/v4/docs/getting-started, next-admin.js.org/docs/api/model-configuration, npmjs.com/@premieroctet/next-admin
- **Findings**:
  - next-admin は `@premieroctet/next-admin` パッケージとして提供（v8.4.2 確認済み）
  - App Router では `app/admin/[[...nextadmin]]/page.tsx` にキャッチオールルートを配置
  - `getPropsFromParams()` で Prisma + JSON Schema 情報からページ props を生成
  - Server Actions（`submitForm`, `deleteResourceItems`, `searchPaginatedResource`）が内部で CRUD を処理
  - `NextAdminOptions` でモデルごとの一覧表示・編集・検索・フィルタをカスタマイズ可能
  - 一覧のデフォルトページサイズは 10 件（`defaultListSize` で変更可能→要件では 20 件）
  - `list.search` で検索対象フィールド、`list.filters` で Prisma where 句ベースのフィルタを定義
  - `list.defaultSort` でデフォルトソートを指定可能
  - `edit.fields` でフィールドごとの required, validate, tooltip 等を設定可能
  - `edit.hooks.beforeDb` / `afterDb` でカスタムバリデーション・後処理が可能
  - `translations` prop で UI テキストの日本語化に対応
- **Implications**:
  - 自前の ActivityTable, ActivitySearchFilter, Pagination, ActivityForm 等のコンポーネントは不要
  - Server Actions も next-admin が提供するものをラップするだけで済む
  - カスタマイズは `NextAdminOptions` のモデルオプションで宣言的に行う

### next-admin の必須依存
- **Context**: next-admin 導入に伴う追加依存の調査
- **Sources Consulted**: next-admin.js.org/v4/docs/getting-started
- **Findings**:
  - `@premieroctet/next-admin`: コアパッケージ
  - `prisma-json-schema-generator`: Prisma スキーマから JSON Schema を生成（next-admin が UI 生成に使用）
  - TailwindCSS: next-admin のスタイリングに必須（`@premieroctet/next-admin/dist/preset` を preset として使用、`darkMode: "class"`）
  - SuperJSON: Server/Client 間のシリアライゼーション（SWC plugin `next-superjson-plugin` を使用）
- **Implications**:
  - package.json に `@premieroctet/next-admin`, `prisma-json-schema-generator`, `tailwindcss` 等を追加
  - `tailwind.config.js` を新規作成し、next-admin の content パスと preset を含める
  - `prisma/schema.prisma` に `prisma-json-schema-generator` ジェネレータを追加
  - `next.config.js` に SWC SuperJSON plugin を設定

### id を autoincrement に変更
- **Context**: CUID よりもシンプルな連番 ID が望ましいとの要請
- **Findings**:
  - next-admin は `String @id` と `Int @id` の両方をサポート
  - autoincrement の方が URL パスで視認性が高い（`/admin/activities/1` vs `/admin/activities/clxxxxxx`）
  - next-admin の `deleteResourceItems` は `string[] | number[]` を受け付けるため互換性に問題なし
- **Implications**: Prisma スキーマで `Int @id @default(autoincrement())` を使用

### description 必須化
- **Context**: requirements の AC 2.2 で description を必須に変更
- **Findings**:
  - next-admin は Prisma スキーマの `String`（non-nullable、default なし）フィールドを自動的に必須として扱う
  - 追加で `edit.fields.description.required: true` を明示することも可能
- **Implications**: Prisma スキーマで `description String`（@default なし）とし、next-admin が自動的に必須フィールドとして扱う

### ステータス管理
- **Context**: アクティビティのステータス（下書き・公開中・終了）の型安全な管理
- **Findings**:
  - PostgreSQL Enum + Prisma Enum で型安全なステータス定義が可能
  - next-admin は Enum フィールドをセレクトボックスとして自動描画
  - `list.filters` で Prisma where 句によるステータスフィルタを定義可能
- **Implications**: `ActivityStatus` enum を定義し、next-admin のフィルタオプションでステータス別の絞り込みを提供

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| next-admin 自動生成 | Prisma スキーマから CRUD UI を自動生成 | 最小コード量、一覧・検索・フィルタ・ページネーション組み込み済み | カスタム UI の柔軟性に制限あり | 管理画面用途に最適 |
| 自前 Server Components + Server Actions | フルスクラッチで CRUD UI を構築 | 完全なカスタマイズ性 | コード量が大きく、開発工数がかかる | 要件が単純な CRUD なのでオーバーキル |

## Design Decisions

### Decision: next-admin 採用
- **Context**: アクティビティの CRUD 管理画面を効率的に構築したい
- **Alternatives Considered**:
  1. 自前 Server Components + Server Actions — フルカスタム UI
  2. next-admin — Prisma ベースの自動生成管理画面
- **Selected Approach**: next-admin を採用し、`NextAdminOptions` でカスタマイズ
- **Rationale**: 要件が標準的な CRUD + 検索/フィルタ/ページネーションであり、next-admin の組み込み機能で十分カバーできる
- **Trade-offs**: カスタム UI の自由度は下がるが、開発速度と保守性が大幅に向上
- **Follow-up**: next-admin のバリデーションメッセージの日本語化対応を確認

### Decision: id を Integer autoincrement に変更
- **Context**: CUID よりもシンプルな連番 ID が望ましいとの要請
- **Selected Approach**: `Int @id @default(autoincrement())`
- **Rationale**: 管理画面の URL が読みやすくなり、next-admin との互換性も問題なし

### Decision: ステータス管理に PostgreSQL Enum を使用
- **Context**: アクティビティのステータス（下書き・公開中・終了）の型安全な管理
- **Selected Approach**: PostgreSQL Enum + Prisma Enum
- **Rationale**: ステータスの種類が固定的で、DB レベルの制約により不正値を防止できる
- **Trade-offs**: Enum の追加・削除にはマイグレーションが必要

## Risks & Mitigations
- next-admin の日本語ローカライズが不完全な場合 — `translations` prop でカスタム翻訳を提供
- next-admin のバリデーションが Prisma スキーマベースで細かい制御が難しい場合 — `edit.hooks.beforeDb` でカスタムバリデーションを追加
- TailwindCSS 新規導入による既存スタイルへの影響 — 既存ページは最小限のため影響は軽微

## References
- [next-admin Getting Started](https://next-admin.js.org/v4/docs/getting-started)
- [next-admin Model Configuration](https://next-admin.js.org/docs/api/model-configuration)
- [next-admin NextAdmin Component](https://next-admin.js.org/v4/docs/api/next-admin-component)
- [next-admin GitHub](https://github.com/premieroctet/next-admin)
- [Prisma Next.js Guide](https://www.prisma.io/docs/guides/nextjs)
