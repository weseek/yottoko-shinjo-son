"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BackLinkRule {
  prefix: string;
  href: string;
  label: string;
}

const BACK_LINK_RULES: readonly BackLinkRule[] = [
  {
    prefix: "/activities",
    href: "/activities",
    label: "一覧に戻る",
  },
  { prefix: "/spots", href: "/spots", label: "一覧に戻る" },
];

const DEFAULT_BACK_LINK: Omit<BackLinkRule, "prefix"> = {
  href: "/",
  label: "トップページに戻る",
};

export default function NotFoundBackLink() {
  const pathname = usePathname();

  const matchedRule = BACK_LINK_RULES.find((rule) =>
    pathname.startsWith(rule.prefix),
  );
  const { href, label } = matchedRule ?? DEFAULT_BACK_LINK;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-lg font-bold text-arcana-primary-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcana-primary-green"
    >
      ‹ {label}
    </Link>
  );
}
