"use server";

import { notifyNewEntry } from "@/lib/email/notify-entry";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type EntryFormState = {
  errors: {
    name?: string;
    server?: string;
  };
};

export async function createEntry(
  activityId: number,
  _prevState: EntryFormState,
  formData: FormData,
): Promise<EntryFormState> {
  const name = formData.get("name");
  const message = formData.get("message");

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return {
      errors: { name: "お名前を入力してください" },
    };
  }

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, status: "PUBLISHED" },
  });

  if (!activity) {
    return {
      errors: { server: "このアクティビティは現在申込を受け付けていません" },
    };
  }

  const trimmedName = name.trim();
  const trimmedMessage =
    typeof message === "string" && message.trim().length > 0
      ? message.trim()
      : null;

  let cancelToken: string;
  try {
    const entry = await prisma.entry.create({
      data: {
        name: trimmedName,
        message: trimmedMessage,
        activityId,
      },
      select: { cancelToken: true },
    });
    cancelToken = entry.cancelToken;
  } catch {
    return {
      errors: {
        server: "申込の保存中にエラーが発生しました。もう一度お試しください。",
      },
    };
  }

  // メール通知 (失敗しても申込自体は成功扱い)。
  // await しないと Cloud Run では redirect 後にレスポンスが返り、CPU 割り当てが
  // 切れて送信処理 (resend の動的 import・API 呼び出し) が完走しないため必ず await する。
  await notifyNewEntry({
    activityTitle: activity.title,
    entryName: trimmedName,
    entryMessage: trimmedMessage,
  });

  redirect(`/entries/${cancelToken}/complete`);
}
