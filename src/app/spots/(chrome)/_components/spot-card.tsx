import { Icon } from "@/app/_components/Icon";
import { buttonClassName } from "@/app/_components/button-variants";
import Image from "next/image";
import Link from "next/link";

type SpotCardProps = {
  slug: string;
  name: string;
  address: string;
  qrCodeLocation: string;
  imageUrl: string | null;
};

export function SpotCard({
  slug,
  name,
  address,
  qrCodeLocation,
  imageUrl,
}: SpotCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border-3 border-spot bg-neutral-0 shadow-yellow">
      {/* サムネイル */}
      <div className="relative aspect-video w-full bg-neutral-100">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-neutral-300"
            aria-hidden="true"
          >
            <Icon name="location-on-outline" width={48} height={48} />
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="px-5 py-6">
        <h3 className="text-xl font-bold leading-snug text-balance text-secondary-500">
          {name}
        </h3>
        <p className="mt-2 flex items-center gap-1 text-sm text-arcana-orange-secondary">
          <Icon name="location-on-outline" width={14} height={14} />
          {address}
        </p>
        <p className="mt-3 text-base leading-relaxed text-neutral-600">
          {qrCodeLocation}
        </p>

        <div className="mt-5">
          <Link
            href={`/spots/${slug}`}
            className={buttonClassName("outline", "w-full px-6 py-3")}
          >
            詳しく見る
          </Link>
        </div>
      </div>
    </article>
  );
}
