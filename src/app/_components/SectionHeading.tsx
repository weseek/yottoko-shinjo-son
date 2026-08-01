import Image from "next/image";

interface SectionHeadingProps {
  children: React.ReactNode;
  /** 見出しのタグレベル（デフォルト h2） */
  as?: "h1" | "h2";
  id?: string;
  /** exclamation-mark.svg を表示するか（デフォルト true） */
  mark?: boolean;
  /** 見出しテキストのスタイル（サイズ・太さ・色など） */
  className?: string;
  /** 破線の色（デフォルト text-spot） */
  lineClassName?: string;
  /** 外側コンテナのスタイル（余白調整など） */
  containerClassName?: string;
}

export default function SectionHeading({
  children,
  as: Tag = "h2",
  id,
  mark = true,
  className = "",
  lineClassName = "text-spot",
  containerClassName = "",
}: SectionHeadingProps) {
  return (
    <div className={`relative mx-auto w-fit pb-[18px] ${containerClassName}`}>
      <Tag
        id={id}
        className={`flex items-center justify-center gap-3 ${className}`}
      >
        {children}
        {mark && (
          <Image
            src="/assets/exclamation-mark.svg"
            alt="！"
            width={13}
            height={24}
            className="h-[1em] w-auto"
          />
        )}
      </Tag>
      {/* テキスト幅に追従する破線。SVG を absolute にして w-fit の幅計算から除外している */}
      <svg
        width="100%"
        height="6"
        aria-hidden="true"
        className={`absolute bottom-0 left-0 ${lineClassName}`}
      >
        <line
          x1="3"
          y1="3"
          x2="100%"
          y2="3"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="14 9"
        />
      </svg>
    </div>
  );
}
