import { env } from "@/env";
import { render } from "@react-email/components";
import type { ReactElement } from "react";

type SendEmailOptions = {
  to: string[];
  subject: string;
  react: ReactElement;
};

/**
 * RESEND_API_KEY が未設定: メール HTML をファイルに保存して /admin/emails で閲覧可能にする
 * RESEND_API_KEY が設定済み: Resend API 経由で送信（開発環境・本番環境問わず）
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (options.to.length === 0) return;

  if (!env.RESEND_API_KEY) {
    await sendViaDev(options);
  } else {
    await sendViaResend(options);
  }
}

// ---------------------------------------------------------------------------
// Dev: ファイルに保存して /dev/emails で閲覧可能にする
// ---------------------------------------------------------------------------
async function sendViaDev(options: SendEmailOptions): Promise<void> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const html = await render(options.react);
  const dir = path.join(process.cwd(), "tmp", "emails");
  await fs.mkdir(dir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${timestamp}.json`;
  const filepath = path.join(dir, filename);

  const payload = {
    to: options.to,
    from: env.EMAIL_FROM,
    subject: options.subject,
    html,
    sentAt: new Date().toISOString(),
  };

  await fs.writeFile(filepath, JSON.stringify(payload, null, 2), "utf-8");

  console.info(`[Email] 開発メール保存: ${filepath}`);
  console.info(`[Email] 件名: ${options.subject}`);
  console.info(`[Email] 宛先: ${options.to.join(", ")}`);
  console.info("[Email] /dev/emails で確認できます");
}

// ---------------------------------------------------------------------------
// Prod: Resend API
// ---------------------------------------------------------------------------
async function sendViaResend(options: SendEmailOptions): Promise<void> {
  const { Resend } = await import("resend");
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    react: options.react,
  });

  if (error) {
    console.error("[Email] Resend送信エラー:", error);
    throw new Error(`メール送信に失敗しました: ${error.message}`);
  }
}
