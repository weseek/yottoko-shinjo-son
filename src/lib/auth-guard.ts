import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * API ルートハンドラーで管理者セッションを検証する共通ガード。
 *
 * Edge Runtime では node:crypto が使えないため、セッション検証は
 * Node.js 環境のルートハンドラー内でのみ実行する。
 *
 * @returns セッションが有効なら { session, error: null }
 *          無効または未認証なら { session: null, error: 401 Response }
 */
export async function requireAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }
  return { session, error: null } as const;
}
