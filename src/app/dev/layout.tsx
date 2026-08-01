import { env } from "@/env";
import { notFound } from "next/navigation";

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (env.APP_ENV === "production") notFound();
  return <>{children}</>;
}
