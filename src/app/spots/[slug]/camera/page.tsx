import AppFooter from "@/app/_components/AppFooter";
import { ArModelUnavailable } from "@/app/_components/ar-model-unavailable";
import { env } from "@/env";
import type { ModelConfig } from "@/lib/ar/types";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SpotArExperience from "./_components/SpotArExperience";

const DEFAULT_LABEL = "ヒメッコ";
const DEFAULT_SCALE = 0.5;

async function getSpotBySlug(slug: string) {
  return prisma.spot.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
}

export default async function CameraPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);

  if (!spot) {
    notFound();
  }

  // スポットに 3D モデル（GLB）が登録されていればそれを使い、未登録なら
  // 環境変数で与えられた既定のモデルにフォールバックする。どちらも無ければ
  // 表示するモデルが無いので、AR 撮影の代わりに案内を出す（README「AR モデルの配置」）。
  const url = spot.arAssetUrl || env.AR_MODEL_URL;
  if (!url) {
    return <ArModelUnavailable />;
  }

  const model: ModelConfig = {
    url,
    label: DEFAULT_LABEL,
    scale: DEFAULT_SCALE,
  };

  return (
    <SpotArExperience
      spot={{
        slug: spot.slug,
        name: spot.name,
        description: spot.description,
        himekkoDescription: spot.himekkoDescription,
        arAssetUrl: model.url,
      }}
      model={model}
      footer={<AppFooter />}
    />
  );
}
