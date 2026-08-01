import { options } from "@/app/admin/options";
import { requireAdminSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@premieroctet/next-admin";
import { createHandler } from "@premieroctet/next-admin/appHandler";

const { run } = createHandler({
  apiBasePath: "/api/admin",
  prisma: prisma as unknown as PrismaClient,
  options,
});

// Next.js 15 wraps params in a Promise, but next-admin expects unwrapped params.
// Wrap the handler to bridge the type mismatch.
const handler = async (
  req: Request,
  context: { params: Promise<{ nextadmin?: string[] }> },
) => {
  const { error } = await requireAdminSession();
  if (error) return error;

  return run(req, {
    params: context.params as Promise<{ nextadmin: string[] }>,
  });
};

export { handler as DELETE, handler as GET, handler as POST };
