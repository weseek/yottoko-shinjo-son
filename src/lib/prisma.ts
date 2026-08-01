import { env } from "@/env";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const SOFT_DELETABLE_MODELS: ReadonlySet<string> = new Set([
  "Activity",
  "Entry",
]);

function createPrismaClient() {
  const baseClient = new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });

  return baseClient.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (SOFT_DELETABLE_MODELS.has(model)) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (SOFT_DELETABLE_MODELS.has(model)) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          const result = await query(args);
          if (
            SOFT_DELETABLE_MODELS.has(model) &&
            result &&
            (result as Record<string, unknown>).deletedAt != null
          ) {
            return null;
          }
          return result;
        },
        async count({ model, args, query }) {
          if (SOFT_DELETABLE_MODELS.has(model)) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
      },
      activity: {
        async delete({ args }) {
          return baseClient.activity.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ args }) {
          return baseClient.activity.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
      entry: {
        async delete({ args }) {
          return baseClient.entry.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany({ args }) {
          return baseClient.entry.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
  rawPrisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Better Auth 専用: $extends を適用しない PrismaClient インスタンス
// Better Auth の prismaAdapter は PrismaClient 型を期待するため、
// $extends で型が変わる既存の prisma singleton は使用できない
export const rawPrisma: PrismaClient =
  globalForPrisma.rawPrisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });

if (env.NODE_ENV !== "production") globalForPrisma.rawPrisma = rawPrisma;
