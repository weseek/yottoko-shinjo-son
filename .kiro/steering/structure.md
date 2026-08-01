# プロジェクト構造

## 構成方針

Next.js App Router の規約に従い、`src/` 配下にアプリケーションコードを集約する。

## ディレクトリパターン

### アプリケーションルーティング
**場所**: `src/app/`
**目的**: Next.js App Router のページ・レイアウト・API Routes
**規約**: ディレクトリベースルーティング（`page.tsx`, `layout.tsx`, `route.ts`）

### 自動生成コード
**場所**: `src/generated/`
**目的**: Prisma Client など自動生成されるコード
**注意**: 手動編集禁止。`prisma generate` で再生成。

### 共有ライブラリ
**場所**: `src/lib/`
**目的**: Prisma Client シングルトンなど、アプリ全体で共有するユーティリティ

### 管理画面
**場所**: `src/app/admin/`
**目的**: next-admin による管理画面。キャッチオールルート `[[...nextadmin]]/page.tsx` と設定ファイル `options.ts` で構成
**規約**: モデル追加時は `options.ts` の `model` と `sidebar.groups` に追加

### 管理画面 API
**場所**: `src/app/api/admin/`
**目的**: next-admin の API Route Handler。`[[...nextadmin]]/route.ts` で CRUD 操作を処理

### データベーススキーマ
**場所**: `prisma/`
**目的**: Prisma スキーマ定義（`prisma db push` で反映、マイグレーションファイルは不使用）

## 命名規約

- **ファイル**: kebab-case（例: `user-profile.tsx`）
- **コンポーネント**: PascalCase（例: `UserProfile`）
- **関数・変数**: camelCase

## インポート規約

```typescript
// パスエイリアス
import { Something } from '@/path'  // src/ にマッピング
```

**パスエイリアス**:
- `@/` → `src/`

## コード構成原則

- `src/app/` は Next.js 規約に従い、ルーティングとページ表示に専念
- ビジネスロジックは適切なレイヤーに分離（プロジェクト成長時に構造を拡張）
- 自動生成ファイルはバージョン管理に含めない

---
_新しいディレクトリパターンが確立されたら更新してください_
