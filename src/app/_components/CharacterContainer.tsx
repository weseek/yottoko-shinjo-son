import Image from "next/image";

interface CharacterContainerProps {
  leftSrc: string;
  rightSrc: string;
  /** 左右イラスト間のスペーシング（Tailwind の gap クラス。デフォルト gap-20） */
  gapClassName?: string;
}

const COLOR_LABEL: Record<string, string> = {
  siro: "白猫",
  kuro: "黒猫",
};

const POSE_PREFIX: Record<string, string> = {
  default: "",
  egao: "笑顔の",
  maneki: "招く",
  ojigi: "お辞儀する",
};

function resolveAlt(src: string): string {
  const stem =
    src
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "") ?? "";
  const [color, pose] = stem.split("-");
  const colorLabel = COLOR_LABEL[color] ?? "";
  const posePrefix = POSE_PREFIX[pose] ?? "";
  return `${posePrefix}${colorLabel}のイラスト`;
}

export default function CharacterContainer({
  leftSrc,
  rightSrc,
  gapClassName = "gap-20",
}: CharacterContainerProps) {
  return (
    <div className={`flex items-end justify-center ${gapClassName} px-4 pb-2`}>
      <Image
        src={leftSrc}
        alt={resolveAlt(leftSrc)}
        width={120}
        height={160}
        className="h-28 w-auto object-contain"
      />
      <Image
        src={rightSrc}
        alt={resolveAlt(rightSrc)}
        width={120}
        height={160}
        className="h-28 w-auto object-contain"
      />
    </div>
  );
}
