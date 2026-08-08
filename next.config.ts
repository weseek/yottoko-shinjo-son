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
    // バケット名が無い場合は何も許可しない（fail-closed）。ここを storage.googleapis.com
    // 全体へのフォールバックにすると、build 引数の渡し忘れに誰も気づかないまま
    // /_next/image が任意の GCS バケットを配信するオープンプロキシになるため。
    // GCS の画像を表示するには GCS_BUCKET を build 時に渡すこと（Dockerfile の
    // ARG GCS_BUCKET / ローカルは .env.development）。
    remotePatterns: gcsBucket
      ? [
          {
            protocol: "https",
            hostname: "storage.googleapis.com",
            pathname: `/${gcsBucket}/**`,
          },
        ]
      : [],
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
