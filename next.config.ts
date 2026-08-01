import path from "node:path";
import type { NextConfig } from "next";

// 許可する GCS バケット名。remotePatterns は build 時に確定するため runtime env では
// 差し替えられず、Dockerfile の ARG GCS_BUCKET から build 時に渡している。
const gcsBucket = process.env.GCS_BUCKET;

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-auth"],
  images: {
    // GCS 公開バケットの画像を <Image> で最適化できるよう許可する。
    // バケット名が分からない場合のみ storage.googleapis.com 配下全体を許可する
    // (絞り込めるほうが望ましいので、デプロイ時は GCS_BUCKET を渡すこと)。
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: gcsBucket ? `/${gcsBucket}/**` : "/**",
      },
    ],
  },
  webpack: (config) => {
    // next-admin references @prisma/client/runtime/library which was renamed
    // to @prisma/client/runtime/client in Prisma 7
    config.resolve.alias["@prisma/client/runtime/library"] = path.resolve(
      "./node_modules/@prisma/client/runtime/client.js",
    );

    return config;
  },
};

export default nextConfig;
