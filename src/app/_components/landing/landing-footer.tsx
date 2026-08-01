import { env } from "@/env";
import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  const contactEmail = env.CONTACT_EMAIL;
  return (
    <footer
      className="w-full bg-[var(--color-arcana-mute)]"
      aria-label="フッター"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-8">
        {/* ロゴ */}
        <div className="mb-6 flex items-center lg:mb-0">
          <Image
            src="/assets/logo.svg"
            alt="よっとこ！新庄村"
            width={185}
            height={36}
            className="h-10 w-auto"
          />
        </div>

        {/* 提供者情報・問い合わせ */}
        <div className="flex flex-col gap-2 text-[var(--color-neutral-0)]">
          <p className="text-base leading-relaxed">
            提供：岡山県真庭郡新庄村 × 株式会社WESEEK
          </p>
          <p className="text-base leading-relaxed">
            お問い合わせ:{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neutral-0)] focus-visible:ring-offset-2"
            >
              {contactEmail}
            </a>
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/terms"
              className="text-base underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neutral-0)] focus-visible:ring-offset-2"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-base underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neutral-0)] focus-visible:ring-offset-2"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/credits"
              className="text-base underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neutral-0)] focus-visible:ring-offset-2"
            >
              クレジット
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
