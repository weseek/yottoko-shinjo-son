# 技術スタック

## アーキテクチャ

Next.js App Router ベースのフルスタック構成。フロントエンドとバックエンド（API Routes）を単一プロジェクトで管理する。

## コア技術

- **言語**: TypeScript 5（strict モード）
- **フレームワーク**: Next.js 15（App Router）
- **UI**: React 19
- **ランタイム**: Node.js
- **ORM**: Prisma 7
- **データベース**: PostgreSQL

## 主要ライブラリ

- **Prisma** — データベースアクセス・スキーマ管理（`@prisma/adapter-pg` でドライバー接続）
- **next-admin** (`@premieroctet/next-admin`) — Prisma モデルベースの管理画面自動生成
- **TailwindCSS v3** — next-admin のスタイリング基盤（`@premieroctet/next-admin/preset` 使用）
- **Biome** — リンター兼フォーマッター（ESLint/Prettier の代替）

## 開発規約

### コード品質
- Biome によるフォーマットとリント統一
- TypeScript strict モード準拠

### テスト
_テスト戦略は仕様策定フェーズで決定予定_

## 開発環境

### 必須ツール
- Docker / Docker Compose（Dev Container）
- pnpm 9

### 主要コマンド
```bash
# 開発: pnpm dev
# ビルド: pnpm build
# リント: pnpm lint
# Prisma生成: pnpm prisma generate
```

## 技術的判断

- **Biome 採用**: ESLint + Prettier の代わりに Biome を使用。設定の簡素化と高速な実行が理由。
- **Prisma 7**: 最新バージョンを採用。`src/generated/` に型安全なクライアントを自動生成。`@prisma/adapter-pg` によるドライバー接続が必須。
- **pnpm**: npm/yarn より高速かつディスク効率の良いパッケージマネージャー。
- **next-admin 採用**: 管理画面を Prisma スキーマから自動生成。CRUD・検索・フィルタ・ページネーションが組み込みで提供される。モデル追加時は `prisma/schema.prisma` と `src/app/admin/options.ts` のみ変更すれば良い。
- **マイグレーション不使用**: 開発中は `prisma db push` のみでスキーマを反映。マイグレーションファイルは生成しない。
- **Server Component + Prisma 直接呼び出し**: 訪問者向けページは API ルートを介さず、Server Component 内で Prisma を直接呼び出す。
- **公開ステータスフィルター**: コンテンツモデル（Activity, Spot）は DRAFT/PUBLISHED/CLOSED の3状態を持つ。訪問者向けページでは必ず `status: "PUBLISHED"` でフィルターし、下書きコンテンツの露出を防ぐ。

---
_技術スタックの変更時にこのファイルを更新してください_
