import { env } from "@/env";
import Link from "next/link";

export default function AppFooter() {
  const contactEmail = env.CONTACT_EMAIL;
  return (
    <footer className="py-8 text-center">
      <a
        href={`mailto:${contactEmail}`}
        className="mb-2 block text-sm leading-[1.5] text-arcana-orange-secondary underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcana-orange-secondary"
      >
        お問い合わせ
      </a>
      <div className="mb-2 flex items-center justify-center gap-4">
        <Link
          href="/terms"
          className="text-sm leading-[1.5] text-arcana-orange-secondary underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcana-orange-secondary"
        >
          利用規約
        </Link>
        <Link
          href="/privacy"
          className="text-sm leading-[1.5] text-arcana-orange-secondary underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcana-orange-secondary"
        >
          プライバシーポリシー
        </Link>
      </div>
      <p className="text-sm leading-[1.5] text-arcana-orange-secondary">
        &copy; 2026 岡山県真庭郡新庄村 × 株式会社WESEEK
      </p>
    </footer>
  );
}
