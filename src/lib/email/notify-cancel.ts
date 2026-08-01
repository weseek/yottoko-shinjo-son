import { env } from "@/env";
import { sendEmail } from "@/lib/email/send";
import { CancelNotificationEmail } from "@/lib/email/templates/cancel-notification";
import { formatJstDateTime } from "@/lib/format-date";

type NotifyCancelParams = {
  activityTitle: string;
  entryName: string;
};

/**
 * キャンセル時に、環境変数で固定された通知先全員にメールを送信する。
 * 送信失敗は握りつぶしてログだけ出す (キャンセル処理自体の成功を妨げないため)。
 */
export async function notifyCancelEntry(
  params: NotifyCancelParams,
): Promise<void> {
  try {
    const cancelDate = formatJstDateTime(new Date());

    await sendEmail({
      to: env.NOTIFICATION_RECIPIENTS,
      subject: `【よっとこ！新庄村】キャンセル通知: ${params.activityTitle}`,
      react: CancelNotificationEmail({
        activityTitle: params.activityTitle,
        entryName: params.entryName,
        cancelDate,
      }),
    });
  } catch (error) {
    console.error("[Email] キャンセル通知メール送信失敗:", error);
  }
}
