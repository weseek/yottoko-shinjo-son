"use client";

import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  async function handleLogout() {
    await authClient.signOut();
    // router.push ではレイアウトが再レンダリングされないため、
    // フルページリロードでセッション状態を確実に反映させる
    window.location.href = "/admin/login";
  }

  return (
    <button type="button" onClick={handleLogout}>
      ログアウト
    </button>
  );
}
