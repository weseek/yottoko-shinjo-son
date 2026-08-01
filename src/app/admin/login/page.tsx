"use client";

import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

/**
 * useSearchParams() は Next.js 15 で Suspense バウンダリが必要。
 * LoginForm をラップして Suspense 境界を設ける。
 */
function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }

    // router.push ではレイアウトが再レンダリングされないため、
    // フルページリロードでセッション状態を確実に反映させる
    const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
    window.location.href = callbackUrl;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="font-medium">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="font-medium">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white rounded px-4 py-2 text-base font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {loading ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-sm flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold">管理画面ログイン</h1>
        <Suspense fallback={<div>読み込み中...</div>}>
          <LoginForm />
        </Suspense>
        <p className="text-sm text-gray-600 text-center">
          初回セットアップの場合は{" "}
          <code className="bg-gray-100 px-1 rounded text-xs">
            pnpm prisma db seed
          </code>{" "}
          を実行してください
        </p>
      </div>
    </div>
  );
}
