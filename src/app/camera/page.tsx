import { ArModelUnavailable } from "@/app/_components/ar-model-unavailable";
import { env } from "@/env";
import type { ModelConfig } from "@/lib/ar/types";
import { prisma } from "@/lib/prisma";
import HomeArExperience from "./_components/HomeArExperience";

const DEFAULT_LABEL = "ヒメッコ";
const DEFAULT_SCALE = 0.5;

export default async function CameraPage(): Promise<React.ReactElement> {
  const config = await prisma.homeCameraConfig.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  // モデルの配置先は 管理画面の設定 → 環境変数 の順に探す。どちらも無ければ
  // 表示するモデルが無いので、AR 撮影の代わりに案内を出す（README「AR モデルの配置」）。
  const url = config?.arAssetUrl || env.AR_MODEL_URL;
  if (!url) {
    return <ArModelUnavailable />;
  }

  const model: ModelConfig = {
    url,
    label: config?.label || DEFAULT_LABEL,
    scale: config?.scale ?? DEFAULT_SCALE,
  };

  return <HomeArExperience model={model} />;
}
