"use server";

import { EntryStatus } from "@/generated/prisma/client";
import { notifyCancelEntry } from "@/lib/email/notify-cancel";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function cancelEntry(cancelToken: string): Promise<void> {
  // キャンセル前にデータを取得（status 更新後は findFirst で取得できなくなるため）
  const entry = await prisma.entry.findFirst({
    where: { cancelToken, status: { notIn: [EntryStatus.CANCELLED] } },
    select: {
      activityId: true,
      name: true,
      activity: { select: { title: true } },
    },
  });

  if (!entry) {
    redirect(`/entries/${cancelToken}/cancel?notfound=1`);
  }

  const result = await prisma.entry.updateMany({
    where: { cancelToken, status: { notIn: [EntryStatus.CANCELLED] } },
    data: { status: EntryStatus.CANCELLED },
  });

  if (result.count === 0) {
    redirect(`/entries/${cancelToken}/cancel?notfound=1`);
  }

  // 通知メール送信（失敗してもキャンセル処理は成立済み）
  await notifyCancelEntry({
    activityTitle: entry.activity.title,
    entryName: entry.name,
  });

  redirect(
    `/entries/${cancelToken}/cancel/complete?activityId=${entry.activityId}&name=${encodeURIComponent(entry.name)}`,
  );
}
