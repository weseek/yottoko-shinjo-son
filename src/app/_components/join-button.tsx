import type { ButtonVariant } from "@/app/_components/button-variants";
import { buttonClassName } from "@/app/_components/button-variants";
import Link from "next/link";

type JoinButtonProps = {
  variant: ButtonVariant;
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function JoinButton({
  variant,
  href,
  children,
  className = "",
}: JoinButtonProps) {
  return (
    <Link
      href={href}
      className={buttonClassName(variant, `px-4 py-3 sm:px-6 ${className}`)}
    >
      {children}
    </Link>
  );
}
