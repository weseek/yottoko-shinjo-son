# ギャップ分析レポート: admin-token-auth

## 1. 現状調査

### 認証関連の現状
- **認証機能**: 完全に未実装。`/admin` 配下のすべてのページが認証なしで公開されている
- **ミドルウェア**: `middleware.ts` が存在しない
- **ユーザーモデル**: Prisma スキーマに User/Session/Account/Verification モデルが一切ない
- **認証ライブラリ**: NextAuth, Better Auth, Lucia いずれも未導入

### 既存コードの関連資産
| 資産 | 場所 | 備考 |
|------|------|------|
| Prisma Client シングルトン | `src/lib/prisma.ts` | soft delete 拡張付き、`@prisma/adapter-pg` 使用 |
| Prisma 生成パス | `src/generated/` | Prisma 7 でカスタム output パス必須 → `@prisma/client` ではなく `@/generated/prisma/client` からインポート |
| 環境変数管理 | `@t3-oss/env-nextjs` + Zod | `src/env.ts`（推定）で型付き env 管理 |
| メール送信 | `src/lib/email/send.ts` | Resend API 使用済み。初期管理者通知に流用可能 |
| next-admin | `src/app/admin/[[...nextadmin]]` | キャッチオールルートでCRUD管理画面を構築 |

---

## 2. 要件 vs 資産マップ

| 要件 | 既存資産 | ギャップ種別 |
|------|----------|------------|
| Req 1: ログイン | なし | **Missing** — ログインページ、auth API route、emailAndPassword 設定 |
| Req 2: セッション管理 | なし | **Missing** — Session モデル、DB セッション永続化 |
| Req 3: /admin + /api/admin 保護 | なし | **Missing** — `middleware.ts` の新規作成 |
| Req 4: ユーザー管理 | なし | **Missing** — User モデル、admin plugin、管理 UI |
| Req 5: ログアウト | なし | **Missing** — ログアウトアクション |
| Req 6: 初期管理者 | なし | **Missing** — seed スクリプトまたは env 初期化手段 |

---

## 3. 技術的制約と統合上の注意点

### Prisma 7 + adapter-pg の制約
- Prisma 7 は生成パスが `src/generated/` に固定されており、`@prisma/client` からのインポートは不可
- `src/lib/prisma.ts` では既に `@prisma/adapter-pg` を使っている
- Better Auth の Prisma adapter は既存の `PrismaClient` インスタンスをそのまま受け取る設計のため、既存 `prisma.ts` の singleton を渡せる可能性が高いが、adapter-pg との二重ラップが問題ないか要検証 (**Research Needed**)

### soft delete 拡張との共存
- 既存の `prisma.ts` には soft delete 拡張（`deletedAt` セット）が組み込まれている
- Better Auth が内部で Prisma を操作する際、この拡張が意図せず影響を与えないか確認が必要 (**Research Needed**)
- 対策候補: Better Auth 用に拡張なしの `rawPrisma` インスタンスを分離して渡す

### middleware のパスマッチング
- next-admin のキャッチオールルートは `/admin/[[...nextadmin]]` → `/admin/login` のようなログインページを next-admin の外に配置する必要がある
- middleware で `/admin/login` だけ除外するか、ログインページを `/login` など `/admin` 外に置くか設計が必要

### env 管理
- `@t3-oss/env-nextjs` + Zod で厳密な型付き env 管理が行われているため、`BETTER_AUTH_SECRET`・`BETTER_AUTH_URL` の追加は env スキーマファイルへの変更も必要

---

## 4. 実装アプローチ

### Option A: Better Auth + admin plugin（推奨）
**概要**: `better-auth` 本体 + `@better-auth/admin` プラグインを導入し、admin plugin の User 管理 API を活用

- `src/lib/auth.ts` に `betterAuth()` + `prismaAdapter()` + `admin()` プラグインを設定
- `src/app/api/auth/[...all]/route.ts` で Better Auth ハンドラーを公開
- `middleware.ts` で `/admin` と `/api/admin` を保護（`/admin/login` または `/login` は除外）
- ログインページを独立したページコンポーネントとして作成
- ユーザー管理画面は next-admin のカスタムページとして組み込む（または独立した `/admin/users` ページ）

**Trade-offs**:
- ✅ admin plugin によりユーザー作成・削除・一覧の API が即時利用可能
- ✅ emailAndPassword が第一級市民として設計されており、Req 1〜6 が最小実装で達成可能
- ✅ Prisma adapter が公式サポート
- ❌ 新しいライブラリで日本語情報が少ない
- ❌ Prisma 7 + adapter-pg の組み合わせは事前検証が必要

### Option B: Better Auth（admin plugin なし）+ 手動ユーザー管理
**概要**: auth 本体のみ導入し、ユーザー管理は独自 API Route で実装

- Option A から admin plugin を除外
- `/api/admin/users` として手動でユーザー CRUD API を実装

**Trade-offs**:
- ✅ シンプルで依存が少ない
- ❌ ユーザー管理 API・UI を全部自前実装する工数増
- ❌ Option A に比べてメリットが少ない

### Option C: Hybrid（Better Auth 基盤 + next-admin の User モデル管理）
**概要**: Better Auth でセッション/認証を担当し、`User` モデルを Prisma スキーマに追加して next-admin の管理対象に含める

- Better Auth が生成する User モデルを next-admin の `options.tsx` に追加
- ユーザー管理 UI は next-admin の自動生成 CRUD を流用

**Trade-offs**:
- ✅ ユーザー管理 UI を新規作成せず next-admin で賄える
- ❌ Better Auth の User モデルを next-admin に公開すると、パスワードハッシュなど機微フィールドが見えるリスク
- ❌ next-admin 経由の削除が Better Auth のセッション無効化をバイパスする可能性
- ❌ 「最後の1名削除不可」ルールを next-admin 側で制御するのが困難

---

## 5. 実装複雑度・リスク評価

| 観点 | 評価 | 理由 |
|------|------|------|
| **実装工数** | M（3〜7日） | 新パターン（Better Auth）の導入、Prisma スキーマ変更、middleware・ログインページ・ユーザー管理 UI の新規作成が必要 |
| **リスク** | Medium | Prisma 7 + adapter-pg の組み合わせ検証が必要。Better Auth 自体は Next.js 15 対応済みで安定 |

---

## 6. 設計フェーズへの引継ぎ事項

### 決定が必要な設計上の判断
1. **ログインページの場所**: `/login`（admin 外）vs `/admin/login`（admin 内、middleware で除外）
2. **ユーザー管理 UI の方式**: next-admin カスタムページ vs 独立した `/admin/users` ページ（Option A vs C）
3. **初期管理者の作成方法**: seed スクリプト（`prisma/seed.ts`）vs 環境変数での初回起動時自動作成

### Research Needed（設計フェーズで検証）
- **[RN-1]** Better Auth の prismaAdapter が `@prisma/adapter-pg` で初期化済みの PrismaClient インスタンスをそのまま受け取れるか
- **[RN-2]** soft delete 拡張（prisma.$extends）が Better Auth の内部クエリに影響しないか
- **[RN-3]** `npx auth generate` コマンドが Prisma 7 のカスタム output パスに対応しているか、または手動スキーマ追記が必要か
