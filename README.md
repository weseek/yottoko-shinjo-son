# よっとこ！新庄村

Next.js 15 + React 19 + Prisma 7 + PostgreSQL によるフルスタック Web アプリケーション。

## 必要なもの

- [Docker](https://www.docker.com/) / Docker Compose
- [VS Code](https://code.visualstudio.com/) + [Dev Containers 拡張](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## 起動方法

1. リポジトリをクローン

   ```bash
   git clone <repository-url>
   cd arcana
   ```

2. VS Code でプロジェクトを開く

   ```bash
   code .
   ```

3. Dev Container を起動

   コマンドパレット (`Ctrl+Shift+P` / `Cmd+Shift+P`) から **Dev Containers: Reopen in Container** を選択。

   初回起動時に以下が自動実行されます:
   - `pnpm install` — 依存パッケージのインストール
   - `pnpm prisma generate` — Prisma Client の生成
   - `pnpm prisma db push` — データベーススキーマの反映

4. 開発サーバーを起動

   ```bash
   pnpm dev
   ```

   http://localhost:3005 でアクセスできます。

## AR モデルの配置

AR 撮影で表示するキャラクターの 3D モデル（`.glb`）は、**本リポジトリに含めていません**。
このモデルは新庄村のキャラクター「ひめっこ」を原作とする派生物で、原作の権利は新庄村に
帰属します（モデル自体のライセンス表記はアプリ内の `/credits` ページを参照）。
公開リポジトリで配布するには権利者の確認が必要なため、リポジトリには置かず、
デプロイ時に配置先を与える形にしています。

モデルの配置先は環境変数 `AR_MODEL_URL` で与えます。相対パスでも絶対 URL でも構いません。

- **ローカル開発**: `.glb` を `public/assets/` に置き、`.env` などで
  `AR_MODEL_URL="/assets/your-model.glb"` を指定する。
- **本番 (Cloud Run)**: 公開読み取り可能な GCS バケットへ `.glb` を置き、Cloud Build
  トリガーの代入変数 `_AR_MODEL_URL` にその公開 URL を指定する。

スポットごとに別のモデルを使う場合は、管理画面のスポット編集から個別に URL を設定できます
（個別設定があればそちらが `AR_MODEL_URL` より優先されます）。

`AR_MODEL_URL` が未設定でもアプリは起動し、AR 撮影のページのみ「現在ご利用いただけません」
という案内に切り替わります。

## 主要コマンド

| コマンド | 説明 |
|---|---|
| `pnpm dev` | 開発サーバー起動 (port 3005) |
| `pnpm build` | プロダクションビルド |
| `pnpm start` | プロダクションサーバー起動 |
| `pnpm lint` | Biome によるリント |
| `pnpm format` | Biome によるフォーマット |
| `pnpm check:sanitize` | 公開前の無害化チェック（社内情報の残留を検出。CI でも自動実行される） |
| `pnpm prisma generate` | Prisma Client 再生成 |
| `pnpm prisma db push` | スキーマをDBに反映 |
| `pnpm prisma migrate dev` | マイグレーション作成・適用 |

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **UI**: React 19
- **言語**: TypeScript 5
- **ORM**: Prisma 7
- **DB**: PostgreSQL 18
- **リンター/フォーマッター**: Biome
- **パッケージマネージャー**: pnpm 9

## デプロイ設定 (Google Cloud Build)

`cloudbuild.yaml` は Cloud Build の [substitutions（代入変数）](https://cloud.google.com/build/docs/configuring-builds/substitute-variable-values) 機能を使い、環境固有の値をリポジトリに含めない構成になっています。

Cloud Build トリガーの「代入変数」欄（または手動実行時の `--substitutions` フラグ）で以下を設定してください。

### 必須（`cloudbuild.yaml` に既定値を置いていない）

設定を忘れるとビルドが失敗します。それらしい既定値を置いてしまうと、設定漏れに気付かないままプレースホルダーが本番に出てしまうため、あえて既定値を持たせていません。

| 変数名 | 説明 | 例 | 誤ると起きること |
|---|---|---|---|
| `_SERVICE_NAME` | Cloud Run サービス名 | `my-app` | 別名だと既存サービスが更新されず新規作成される |
| `_AR_REGISTRY` | Artifact Registry イメージパス (`$PROJECT_ID` は自動展開) | `asia-northeast1-docker.pkg.dev/$PROJECT_ID/my-app/app` | push に失敗する |
| `_EMAIL_FROM` | 送信元メールアドレス (Resend) | `"My App <noreply@example.com>"` | メール送信が通らない |
| `_GCS_BUCKET` | 画像アップロード用 GCS バケット名 | `my-app-uploads` | アップロードと画像最適化が失敗する |
| `_BETTER_AUTH_URL` | 本番アプリの URL (認証用) | `https://example.com` | 管理画面にログインできない |
| `_CONTACT_EMAIL` | お問い合わせ窓口メールアドレス | `contact@example.com` | プライバシーポリシー・利用規約に誤った窓口が載る |
| `_INITIAL_ADMIN_EMAIL` | 初期管理者アカウントのメールアドレス | `admin@example.com` | 既存の管理者と違う値だと管理者が二重に作られる |

### 任意（未設定なら該当機能を無効にして動く）

| 変数名 | 説明 | 未設定時の挙動 |
|---|---|---|
| `_AR_MODEL_URL` | AR モデル (`.glb`) の公開 URL（「AR モデルの配置」参照） | AR 撮影ページが案内表示になる |
| `_UMAMI_SCRIPT_URL` | Umami アクセス解析スクリプトの URL | 計測タグを出力しない |
| `_UMAMI_WEBSITE_ID` | Umami ウェブサイト ID | 計測タグを出力しない |

### 既定値のあるもの

| 変数名 | 既定値 |
|---|---|
| `_REGION` | `asia-northeast1` |
| `_INITIAL_ADMIN_NAME` | `管理者` |

### シークレット

`DATABASE_URL`, `RESEND_API_KEY`, `BETTER_AUTH_SECRET`, `GOOGLE_GEOCODING_API_KEY`, `GOOGLE_MAPS_BROWSER_KEY`, `NOTIFICATION_RECIPIENTS`, `INITIAL_ADMIN_PASSWORD` は Secret Manager で管理し、Cloud Build から自動注入されます。代入変数として渡さないでください。

> 代入変数の値にカンマは使えません。`--set-env-vars` がカンマ区切りのため、値に含めると壊れます。

## ライセンス

本リポジトリの**ソースコード**は [Apache License 2.0](LICENSE) の下で公開しています。

ただし、以下は Apache License 2.0 の対象**外**です。再利用にはそれぞれの権利者の許諾が必要です。

| 対象 | 権利者 | 備考 |
|---|---|---|
| キャラクター「ひめっこ」の 3D モデル (`.glb`) | 原作 &copy; 新庄村 / 立体化部分は CC BY 4.0（Meshy AI 生成・Blender 改変） | 本リポジトリには**含めていない**（「AR モデルの配置」参照）。表記の詳細はアプリ内 `/credits` |
| キャラクターのイラスト・キャラクターが写った画像（`public/assets/` 配下） | 岡山県真庭郡新庄村 またはその正当な権利者 | 本アプリの画面表示に必要な範囲で同梱している |
| 村の活動風景・関係者の写真（`public/assets/` 配下） | 撮影者および被写体 | 同上 |
| ロゴ (`public/assets/logo.svg`) | 株式会社 WESEEK / 新庄村 | サービスの識別標として使用 |

同梱している第三者由来の開発ツールについては [NOTICE](NOTICE) を参照してください。
