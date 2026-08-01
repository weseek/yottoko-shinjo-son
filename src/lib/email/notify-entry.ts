import { env } from "@/env";
import { sendEmail } from "@/lib/email/send";
import { EntryNotificationEmail } from "@/lib/email/templates/entry-notification";
import { formatJstDateTime } from "@/lib/format-date";

type NotifyEntryParams = {
  activityTitle: string;
  entryName: string;
  entryMessage: string | null;
};

/**
 * 申込完了時に、環境変数で固定された通知先全員にメールを送信する。
 * 送信失敗は握りつぶしてログだけ出す (申込自体の成功を妨げないため)。
 */
export async function notifyNewEntry(params: NotifyEntryParams): Promise<void> {
  try {
    const entryDate = formatJstDateTime(new Date());

    await sendEmail({
      to: env.NOTIFICATION_RECIPIENTS,
      subject: `【よっとこ！新庄村】新しい申込: ${params.activityTitle}`,
      react: EntryNotificationEmail({
        activityTitle: params.activityTitle,
        entryName: params.entryName,
        entryMessage: params.entryMessage,
        entryDate,
      }),
    });
  } catch (error) {
    console.error("[Email] 通知メール送信失敗:", error);
  }
}
