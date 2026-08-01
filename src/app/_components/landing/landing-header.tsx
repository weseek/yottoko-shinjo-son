import { buttonClassName } from "@/app/_components/button-variants";
import Image from "next/image";
import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[color-mix(in_srgb,var(--color-neutral-50)_82%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* ロゴ */}
        <Link href="/" className="flex items-center no-underline">
          <Image
            src="/assets/logo.svg"
            alt="よっとこ！新庄村"
            height={36}
            width={185}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* PC ナビゲーション */}
        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="メインナビゲーション"
        >
          <Link
            href="#feature-activity"
            className="text-base text-[var(--color-neutral-700)] no-underline hover:text-[var(--color-arcana-green)] transition-colors"
          >
            体験・手伝い
          </Link>
          <Link
            href="#feature-ar"
            className="text-base text-[var(--color-neutral-700)] no-underline hover:text-[var(--color-arcana-green)] transition-colors"
          >
            ARフォト
          </Link>
          <Link
            href="#background"
            className="text-base text-[var(--color-neutral-700)] no-underline hover:text-[var(--color-arcana-green)] transition-colors"
          >
            このサービスについて
          </Link>
          <Link
            href="/activities"
            className={buttonClassName("standard", "px-6 py-2")}
          >
            使ってみる
          </Link>
        </nav>
      </div>
    </header>
  );
}
