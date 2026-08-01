import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Better Auth クライアント（クライアントサイド専用）
 *
 * サーバーサイドの auth.ts とは独立して宣言する。
 * baseURL を省略することで、ブラウザのオリジンが自動的に使用される。
 */
export const authClient = createAuthClient({
  plugins: [adminClient()],
});
