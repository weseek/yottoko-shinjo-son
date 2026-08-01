import Image from "next/image";
import Link from "next/link";

interface AppHeaderProps {
  /** ロゴクリック時の遷移先（デフォルト: ルートページ "/"） */
  homeHref?: string;
  /** ヘッダー内側コンテナの最大幅（Tailwindクラスをそのまま指定） */
  maxWidth?: string;
}

export default function AppHeader({
  homeHref = "/",
  maxWidth = "max-w-3xl",
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-b-neutral-200 bg-neutral-0 shadow-[var(--shadow-sm)]">
      <div
        className={`mx-auto flex ${maxWidth} items-center px-4 py-3 sm:px-6`}
      >
        <Link href={homeHref} className="flex items-center gap-3 no-underline">
          <Image
            src="/assets/logo.svg"
            alt="よっとこ！新庄村"
            width={185}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>
      </div>
    </header>
  );
}
