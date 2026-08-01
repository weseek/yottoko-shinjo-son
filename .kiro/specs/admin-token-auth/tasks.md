# Implementation Plan

- [ ] 1. 依存関係と環境変数の整備
- [x] 1.1 Better Auth パッケージをインストールし環境変数スキーマを拡張する
  - `better-auth` v1.6 を `pnpm add better-auth` でインストールする
  - `src/env.ts` のサーバースキーマに `BETTER_AUTH_SECRET`（必須、文字列）と `BETTER_AUTH_URL`（必須、URL）を追加する
  - `.env.example` に両環境変数のキーとサンプル値（`BETTER_AUTH_SECRET=your-secret-here`、`BETTER_AUTH_URL=http://localhost:3000`）を追記する
  - `pnpm build` がエラーなく完了し、型付きの環境変数として参照できることを確認できる
  - _Requirements: 1.2, 2.3_

- [ ] 2. 認証用データモデルの整備
- [x] 2.1 (P) Prisma スキーマに Better Auth の認証モデルを追加する
  - `prisma/schema.prisma` に `User`、`Session`、`Account`、`Verification` モデルを追加する
  - `User` モデルには admin plugin 必須フィールド（`role`、`banned`、`banReason`、`banExpires`）を含める
  - `Session` モデルに `impersonatedBy` フィールドを含める
  - `Account` モデルの `password` フィールドが scrypt ハッシュ格納先になる
  - `pnpm prisma db push` で各テーブルがデータベースに作成され、`pnpm prisma generate` でクライアントが再生成されることを確認できる
  - _Requirements: 1.4, 2.3_
  - _Boundary: データ層 (schema.prisma)_

- [x] 2.2 (P) ソフトデリート拡張なしの Prisma インスタンスを Better Auth 専用に追加する
  - `src/lib/prisma.ts` に `$extends` を適用しない `rawPrisma` を新たに `export` する
  - `rawPrisma` は既存プロジェクト依存の `@prisma/adapter-pg`（追加インストール不要）を使用し、Better Auth の `prismaAdapter` が期待する `PrismaClient` 型と互換を保つ
  - 既存の `prisma` export（ソフトデリート拡張付き）は変更しない
  - TypeScript のビルドが通ることで、`rawPrisma` が `PrismaClient` 型として型安全に参照できることを確認できる
  - _Requirements: 1.4, 2.3_
  - _Boundary: データ層 (src/lib/prisma.ts)_

- [ ] 3. Better Auth 認証基盤の実装
- [x] 3.1 (P) サーバーサイドの認証設定を実装する
  - `src/lib/auth.ts` を新規作成し、`rawPrisma` + `prismaAdapter()`（provider: "postgresql"）+ `emailAndPassword`（disableSignUp: true）+ `admin()` プラグインを組み合わせた `betterAuth()` 設定を実装する
  - `before:remove-user` フックで管理者ユーザー（`role === "admin"`）が1名のみのとき削除を拒否し、エラーを throw するロジックを組み込む
  - `BETTER_AUTH_SECRET` を `env.ts` 経由で取得して設定する
  - `auth` が export されており、`auth.api.getSession`、`auth.api.signOut`、`auth.api.createUser`（admin plugin）などのメソッドが利用可能であることを確認できる
  - _Requirements: 1.4, 2.3, 4.5_
  - _Depends: 2.2_
  - _Boundary: lib/auth.ts_

- [x] 3.2 (P) クライアントサイドの認証クライアントを実装する
  - `src/lib/auth-client.ts` を新規作成し、`createAuthClient()` に `adminClient()` プラグインを組み込んで `authClient` を export する
  - `baseURL` には `BETTER_AUTH_URL` を設定する（クライアントからのフェッチ先）
  - `auth-client.ts` は `auth.ts` をインポートしない（プラグインを独立して宣言）ため、3.1 と並列実行が安全である
  - `authClient.signIn.email()`、`authClient.signOut()`、`authClient.admin.createUser()`、`authClient.admin.listUsers()`、`authClient.admin.removeUser()` が型付きで利用可能であることを確認できる
  - _Requirements: 1.2, 5.1, 4.1, 4.2, 4.3_
  - _Boundary: lib/auth-client.ts_

- [x] 3.3 Better Auth の API エンドポイントを Route Handler として公開する
  - `src/app/api/auth/[...all]/route.ts` を新規作成し、`toNextJsHandler(auth)` でサインイン・サインアウト・セッション・admin 操作の各エンドポイントを公開する
  - `POST /api/auth/sign-in/email` に正しい認証情報を送ると Set-Cookie ヘッダー付きのレスポンスが返ることを確認できる
  - _Requirements: 1.2, 2.1, 4.1, 4.2, 4.3, 5.1_
  - _Depends: 3.1_

- [ ] 4. 管理画面への認証ゲート実装
- [x] 4.1 Middleware で管理画面と管理 API を認証保護する
  - `middleware.ts` を新規作成し、`/admin/((?!login).*)` と `/api/admin/:path*` を `config.matcher` に設定する
  - `auth.api.getSession({ headers: request.headers })` でセッションを検証する
  - 未認証のページリクエスト（`/admin/*`）は `/admin/login?callbackUrl=<元のパス>` へ 302 リダイレクトする
  - 未認証の API リクエスト（`/api/admin/*`）は `{ "error": "Unauthorized" }` を持つ 401 JSON レスポンスを返す
  - `/admin/login` への直接アクセスは middleware を通過し、ログインページが表示されることを確認できる
  - _Requirements: 1.1, 2.2, 3.1, 3.2, 3.3_
  - _Depends: 3.1_

- [ ] 5. ログイン・ログアウト UI の実装
- [x] 5.1 (P) ログインページを実装する
  - `src/app/admin/login/page.tsx` を `"use client"` の Client Component として新規作成する
  - メールアドレスとパスワードの入力フォームを実装し、送信時に `authClient.signIn.email()` を呼び出す
  - ログイン失敗時はフォーム内に「メールアドレスまたはパスワードが正しくありません」エラーメッセージを表示する
  - ログイン成功時は `callbackUrl` クエリパラメータが指定されている場合はそのページへ、なければ `/admin` へ `router.push()` で遷移する
  - フォームの下部に「初回セットアップの場合は `pnpm prisma db seed` を実行してください」という静的な案内メッセージを常時表示する（Req 6.2: 未認証コンテキストから admin 数を動的取得せず、静的ヒストで要件を充足する）
  - 正しい認証情報でログインすると管理画面に到達することを確認できる
  - _Requirements: 1.2, 1.3, 6.2_
  - _Boundary: admin/login/page.tsx_

- [x] 5.2 (P) 管理画面共通レイアウトとログアウトボタンを実装する
  - `src/app/admin/_components/logout-button.tsx` を `"use client"` の Client Component として新規作成し、クリック時に `authClient.signOut()` を呼び出してから `/admin/login` へリダイレクトする
  - `src/app/admin/layout.tsx` を新規作成し、全 `/admin/*` ページの上部にログアウトボタンを配置するシンプルなヘッダーバーを実装する
  - ログアウトボタンをクリックするとセッションが無効化され、ログインページへリダイレクトされることを確認できる
  - _Requirements: 5.1_
  - _Boundary: admin/layout.tsx, admin/_components/logout-button.tsx_

- [ ] 6. ユーザー管理機能の実装
- [x] 6.1 管理画面からユーザーの一覧・作成・削除ができるページを実装する
  - `src/app/admin/users/page.tsx` を `"use client"` の Client Component として新規作成する
  - ページマウント時に `authClient.admin.listUsers()` で登録済みユーザーの一覧を取得・表示する
  - メールアドレス・パスワード・名前の入力フォームから `authClient.admin.createUser()` で新しいユーザーを作成し、作成後は一覧を再取得して更新する
  - 重複メールアドレスでの作成試行時（409 エラー）はフォーム内にエラーメッセージを表示する
  - 各ユーザー行に削除ボタンを設け、`authClient.admin.removeUser()` でユーザーを削除して一覧を更新する
  - 一覧のユーザーが1名のみのとき削除ボタンを無効化し、「最後の管理者アカウントは削除できません」のメッセージを表示する
  - ユーザーを作成すると一覧に新しいユーザーが即時反映されることを確認できる
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - _Depends: 3.2_

- [ ] 7. 初期管理者アカウントのセットアップ手段
- [x] 7.1 シードスクリプトで初期管理者アカウントを作成できるようにする
  - `prisma/seed.ts` を新規作成し、環境変数（`INITIAL_ADMIN_EMAIL`、`INITIAL_ADMIN_PASSWORD`、`INITIAL_ADMIN_NAME`）から初期管理者情報を取得するスクリプトを実装する
  - `better-auth/crypto` の `hashPassword`（scrypt）でパスワードをハッシュ化し、`user` テーブルと `account` テーブル（`providerId: "credential"`、`accountId: email`）の両方に直接 insert する
  - 同じメールアドレスのユーザーが既に存在する場合は upsert でスキップし、冪等に動作させる
  - `package.json` の `prisma.seed` フィールドにスクリプトのパスを設定する
  - `pnpm prisma db seed` 実行後、シードしたメールアドレスとパスワードでログインページからログインできることを確認できる
  - _Requirements: 6.1_

- [x] 7.2 本番デプロイで初期管理者シードを自動実行する（Cloud Build seed ステップ）
  - `cloudbuild.yaml` に `deps`（`pnpm install --frozen-lockfile` を `/workspace` に対して 1 回実行）→ `migrate`（`prisma migrate deploy`）→ `seed`（`prisma generate --generator client` + `tsx prisma/seed.ts`）の順でステップを追加する。`/workspace` は Cloud Build 全ステップで共有されるため `migrate` / `seed` は `deps` の `node_modules` をそのまま使う
  - `INITIAL_ADMIN_PASSWORD` を Secret Manager（`availableSecrets` → `secretEnv`）経由で注入し、`INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_NAME` は Cloud Build substitution（`_INITIAL_ADMIN_EMAIL` / `_INITIAL_ADMIN_NAME`）で渡す
  - `BETTER_AUTH_SECRET` を Secret Manager に作成し、`deploy` ステップの `--set-secrets` 経由で Cloud Run runtime に注入する。`BETTER_AUTH_URL` は Cloud Run service URL を `--set-env-vars` で渡す。`next build` 時の env 検証で BETTER_AUTH_* を要求して落ちないよう、Dockerfile builder stage で `ENV SKIP_ENV_VALIDATION=1` を設定する（runtime で再検証される）
  - GCP プロジェクト `<GCP_PROJECT_ID>` に `INITIAL_ADMIN_PASSWORD` / `BETTER_AUTH_SECRET` secret（いずれもランダム値）を作成し、Cloud Build 実行 SA（`<PROJECT_NUMBER>-compute@developer.gserviceaccount.com`）に `roles/secretmanager.secretAccessor` を付与する
  - cloudbuild.yaml に deps / seed ステップが追加され、Secret Manager に `INITIAL_ADMIN_PASSWORD` / `BETTER_AUTH_SECRET` が登録・権限付与されており、本番ビルドで build → migrate → seed → deploy が全て成功して `/admin` にログインできることを確認できる
  - _Requirements: 6.1, 6.3, 6.4_
  - _Depends: 7.1_

- [ ] 8. 認証フロー全体の統合確認
- [ ] 8.1 ログイン・セッション・ログアウトの E2E フローを確認する
  - 未認証状態で `/admin` にアクセスするとログインページへリダイレクトされることを確認する（Req 1.1）
  - 正しい認証情報でログインすると管理画面（`/admin`）へ遷移することを確認する（Req 1.2）
  - 誤った認証情報でログインするとエラーメッセージが表示されることを確認する（Req 1.3）
  - ログイン済みセッションは管理画面を継続利用できることを確認する（Req 2.1）
  - サーバーを再起動（`pnpm dev` 再実行）した後もログイン済みセッションが維持されることを確認する（Req 2.3）
  - DB のセッションレコードを手動で削除またはexpiry を過去日に書き換えた後、該当ページへアクセスするとログインページへリダイレクトされることを確認する（Req 2.2）
  - ログアウト後に管理画面へのアクセスがブロックされてログインページへリダイレクトされることを確認する（Req 5.1）
  - 全認証フローが正常に動作し、認証なしでは管理画面にアクセスできないことを確認できる
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 5.1_

- [ ] 8.2 API 保護とユーザー管理操作を確認する
  - 未認証状態で `/api/admin/entries` などの `/api/admin/*` へリクエストすると 401 レスポンスが返ることを確認する（Req 3.2, 3.3）
  - 未認証状態で `/admin/entries` などの `/admin/*`（`/admin/login` 除く）へアクセスするとリダイレクトされることを確認する（Req 3.1）
  - ユーザー管理画面でユーザーの作成・一覧表示・削除が正常に動作することを確認する（Req 4.1–4.3）
  - 重複メールアドレスでのユーザー作成がエラーメッセージを表示することを確認する（Req 4.4）
  - ユーザーが1名のみの状態で削除を試みると UI 側でボタンが無効化され、サーバー側でも `before:remove-user` hook が拒否することを確認する（Req 4.5）
  - 管理 API への認証なしのアクセスが 401 で遮断されることを確認できる
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5_
