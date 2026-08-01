import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";

import { env } from "@/env";
import { rawPrisma } from "@/lib/prisma";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(rawPrisma, {
    provider: "postgresql",
  }),
  session: {
    // 絶対上限: 最後のログインから 8 時間でセッション失効
    expiresIn: 60 * 60 * 8,
    // スライディングウィンドウ: 15 分操作がなければセッション失効
    // （リクエストのたびに有効期限が expiresIn ぶん延長される）
    updateAge: 60 * 15,
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [admin()],
  databaseHooks: {
    user: {
      delete: {
        /**
         * 管理者ユーザーが1名のみの場合は削除を拒否する。
         * これにより、管理者不在の状態を防ぐ。
         */
        before: async (user) => {
          const userWithRole = user as typeof user & { role?: string | null };
          if (userWithRole.role === "admin") {
            const adminCount = await rawPrisma.user.count({
              where: { role: "admin" },
            });
            if (adminCount <= 1) {
              throw new Error(
                "最後の管理者ユーザーは削除できません。先に別の管理者ユーザーを追加してください。",
              );
            }
          }
        },
      },
    },
  },
});
