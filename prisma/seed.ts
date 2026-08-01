import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const email = process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.com";
const password = process.env.INITIAL_ADMIN_PASSWORD ?? "changeme";
const name = process.env.INITIAL_ADMIN_NAME ?? "Admin";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

async function main() {
  const hashedPassword = await hashPassword(password);
  const now = new Date();

  // upsert user (idempotent: skip if email already exists)
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      id: randomUUID(),
      name,
      email,
      emailVerified: false,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    },
  });

  // upsert account (credential) for the user
  const existingAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: "credential",
    },
  });

  if (!existingAccount) {
    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: email,
        providerId: "credential",
        userId: user.id,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    });
    console.log(`✓ 管理者アカウントを作成しました: ${email}`);
  } else {
    console.log(`✓ 管理者アカウントは既に存在します（スキップ）: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
