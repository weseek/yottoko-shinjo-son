import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    APP_ENV: z.enum(["development", "production"]).default("development"),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("よっとこ！新庄村 <noreply@example.com>"),
    // 申込・キャンセル通知メールの送信先（固定）。カンマ区切りで複数指定可。
    // admin では設定させず、production では SecretManager から注入した値で固定する。
    // production 以外では実際にメール送信しないため未設定でよい（空配列 = 送信スキップ）。
    NOTIFICATION_RECIPIENTS: z
      .string()
      .optional()
      .default("")
      .transform((v) =>
        v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      )
      .pipe(
        z
          .array(z.string().email())
          .min(process.env.APP_ENV === "production" ? 1 : 0),
      ),
    // お問い合わせ窓口メールアドレス（フッター・プライバシーポリシー・利用規約等に表示）。
    // production では必須。既定値を許すと、実在しないアドレスがプライバシーポリシー・
    // 利用規約の窓口として公開されてしまうため、未設定なら起動時に落とす。
    CONTACT_EMAIL:
      process.env.APP_ENV === "production"
        ? z.string().email()
        : z.string().email().default("contact@example.com"),
    // 既定の AR モデル（GLB）の配置先。相対パス（例 /assets/himekko.glb）でも
    // 絶対 URL（例 https://storage.googleapis.com/<bucket>/ar-models/x.glb）でもよい。
    // キャラクターモデルは第三者に権利があり本リポジトリに同梱しないため、
    // デプロイ時に配置先を与える。未設定でもアプリ全体は動き、AR 撮影のみ無効になる。
    AR_MODEL_URL: z.string().optional(),
    GCS_BUCKET: z.string().optional(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string().url(),
    // スポット住所のジオコーディング (サーバ専用, Geocoding API)
    GOOGLE_GEOCODING_API_KEY: z.string().optional(),
    // スポット地図描画用 (Maps JavaScript API)。ブラウザに露出する公開キーだが、
    // NEXT_PUBLIC_ にすると build 時にバンドルへ焼き込まれてしまうため、
    // サーバ側で読み取り Server Component から Client Component へ prop で渡す。
    // (Cloud Run の runtime env 注入で完結し、キー差し替え時の再ビルドが不要になる)
    GOOGLE_MAPS_BROWSER_KEY: z.string().optional(),
    // Umami アクセス解析。両方揃ったときだけ計測タグを出力する（＝本番のみ設定）。
    // 値は公開情報（ページに露出する）。サブドメイン化時は URL を差し替えるだけ。
    //
    // Cloud Build の代入変数は「渡さない」ことができず空文字で届くため、
    // 空文字は「アクセス解析を使わない」として扱う（url() は空文字を弾くので変換が必要）。
    UMAMI_SCRIPT_URL: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.string().url().optional(),
    ),
    UMAMI_WEBSITE_ID: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_ENV: z
      .enum(["development", "production"])
      .default("development"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    APP_ENV: process.env.APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NOTIFICATION_RECIPIENTS: process.env.NOTIFICATION_RECIPIENTS,
    GCS_BUCKET: process.env.GCS_BUCKET,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    AR_MODEL_URL: process.env.AR_MODEL_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_GEOCODING_API_KEY: process.env.GOOGLE_GEOCODING_API_KEY,
    GOOGLE_MAPS_BROWSER_KEY: process.env.GOOGLE_MAPS_BROWSER_KEY,
    UMAMI_SCRIPT_URL: process.env.UMAMI_SCRIPT_URL,
    UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
