import Link from "next/link";

/**
 * AR モデル（GLB）の配置先が決まっていないときに、AR 撮影の代わりに表示する案内。
 *
 * キャラクターの 3D モデルは第三者に権利があり本リポジトリに同梱していないため、
 * 環境変数 AR_MODEL_URL（または管理画面のスポット個別設定）でモデルの配置先を
 * 与えるまで AR 撮影は利用できない。アプリの他の機能は影響を受けない。
 */
export function ArModelUnavailable() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <h1 className="text-2xl font-bold leading-[1.5] text-neutral-900">
        AR 撮影は現在ご利用いただけません
      </h1>
      <p className="text-base leading-relaxed text-neutral-700">
        3D モデルが設定されていないため、AR 撮影を開始できません。
        時間をおいて再度お試しください。
      </p>
      <p className="text-sm leading-relaxed text-neutral-500">
        このアプリを自身で動かしている場合は、環境変数{" "}
        <code className="rounded bg-neutral-100 px-1">AR_MODEL_URL</code>{" "}
        にモデル（.glb）の配置先を設定してください。詳しくは README の「AR
        モデルの配置」を参照してください。
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center justify-center rounded-full bg-arcana-primary-green px-6 py-3 text-base font-bold leading-[1.5] text-white no-underline transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcana-primary-green"
      >
        トップへ戻る
      </Link>
    </main>
  );
}
