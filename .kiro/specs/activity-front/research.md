# Research & Design Decisions: activity-front

## Summary
- **Feature**: `activity-front`
- **Discovery Scope**: Extension（既存 Activity モデル + next-admin 管理画面への新規フロントエンド追加）
- **Key Findings**:
  - Activity モデルに画像フィールドなし → ActivityImage リレーションテーブルの新規追加が必要
  - 訪問者向けページ・コンポーネントはゼロ → すべて新規構築
  - Server Component + Prisma 直接取得で追加ライブラリ不要

## Research Log

### ActivityImage データモデル設計
- **Context**: 要件で Activity に複数画像を関連付ける必要がある
- **Sources Consulted**: Prisma 7 公式ドキュメント、既存 schema.prisma
- **Findings**:
  - 1:N リレーション（Activity has many ActivityImage）が最適
  - `order` フィールドで表示順序を管理（先頭画像をサムネイルに使用）
  - α版では画像は URL 直接入力（管理画面で URL 文字列を入力）
  - next-admin はリレーション先モデルの CRUD を自動サポート
- **Implications**: スキーマ変更 + `prisma db push` が必要。マイグレーション不使用の方針に沿う

### next/image の利用
- **Context**: 画像表示の最適化
- **Sources Consulted**: Next.js 15 公式ドキュメント
- **Findings**:
  - `next/image` は外部画像に `remotePatterns` 設定が必要
  - α版では画像 URL のドメインが不定のため、`unoptimized` プロパティか `remotePatterns` のワイルドカード設定が選択肢
  - 通常の `<img>` タグでも機能上は問題なし
- **Implications**: next.config.ts に `images.remotePatterns` 設定追加が必要な場合あり

### 訪問者向けレイアウト構成
- **Context**: 管理画面とは独立した訪問者向けの UI レイアウトが必要
- **Sources Consulted**: 既存 `src/app/layout.tsx`、Next.js App Router ドキュメント
- **Findings**:
  - 既存 RootLayout はシンプル（メタデータ + `<html><body>`のみ）
  - `src/app/(public)/` Route Group で訪問者向けレイアウトを分離可能
  - ただし現時点で管理画面は `src/app/admin/` 配下にあり、ルートレイアウトは共有で問題なし
  - 訪問者向け専用レイアウト（ヘッダー等）は `src/app/activities/layout.tsx` で十分
- **Implications**: Route Group は過剰。activities 配下の layout.tsx で対応

### 既存コードパターン分析
- **Context**: 新規コードが既存パターンに準拠する必要がある
- **Sources Consulted**: `src/app/admin/` 配下の実装、steering documents
- **Findings**:
  - Server Component デフォルト、`"use client"` は必要時のみ
  - Prisma Client は `@/lib/prisma` からインポート
  - ファイル命名: kebab-case
  - パスエイリアス: `@/` → `src/`
  - TypeScript strict モード
- **Implications**: 新規ページも同じパターンに従う

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Server Components 直接取得 | ページコンポーネント内で Prisma 直接呼び出し | シンプル、追加レイヤー不要、既存パターン一致 | ロジック再利用が限定的 | 採用 |
| API Route + fetch | REST API 経由でデータ取得 | API 再利用性 | 過剰抽象化、既存パターン不一致 | 不採用 |

## Design Decisions

### Decision: ActivityImage リレーションテーブル
- **Context**: Activity に複数画像を関連付ける必要がある
- **Alternatives Considered**:
  1. Activity に `imageUrls String[]` 配列フィールド追加 — シンプルだが順序管理・個別操作が困難
  2. ActivityImage 別テーブル（1:N リレーション）— 柔軟だがスキーマが増える
- **Selected Approach**: ActivityImage 別テーブル
- **Rationale**: 画像ごとの順序管理（`order` フィールド）が可能。将来的に画像メタデータ（alt テキスト等）の拡張も容易
- **Trade-offs**: テーブル増加だが、管理画面で next-admin のリレーション UI が使える
- **Follow-up**: next-admin でリレーション先モデルの表示設定を確認

### Decision: 画像ストレージ戦略（α版）
- **Context**: 画像の保存方法を決定する必要がある
- **Alternatives Considered**:
  1. ファイルアップロード基盤構築 — 本格的だがα版にはオーバー
  2. URL 直接入力 — 管理画面で URL 文字列を入力
- **Selected Approach**: URL 直接入力
- **Rationale**: α版スコープに合致。管理者が外部ホスティング済み画像の URL を入力するだけで済む
- **Trade-offs**: 管理者に URL 準備の負担。将来的にアップロード機能への移行が必要になる可能性
- **Follow-up**: なし（α版スコープ）

### Decision: 訪問者向けレイアウト
- **Context**: 管理画面と訪問者向けで異なるレイアウトが必要
- **Selected Approach**: `src/app/activities/layout.tsx` にシンプルなレイアウト配置
- **Rationale**: Route Group `(public)` は現時点では過剰。activities 配下のレイアウトで十分

## Risks & Mitigations
- next/image の外部画像ドメイン制限 → `remotePatterns` 設定 or `unoptimized` 使用で対応
- next-admin の ActivityImage リレーション表示 → 管理画面の options.ts 更新が必要（本 spec のスコープ外だが連携が必要）

## References
- Next.js 15 App Router: https://nextjs.org/docs/app
- Prisma 7 Relations: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
- next/image: https://nextjs.org/docs/app/api-reference/components/image
