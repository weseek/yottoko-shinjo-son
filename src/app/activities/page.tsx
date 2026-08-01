import CharacterContainer from "@/app/_components/CharacterContainer";
import { Icon } from "@/app/_components/Icon";
import SectionHeading from "@/app/_components/SectionHeading";
import { prisma } from "@/lib/prisma";
import { ActivityFilterClient } from "./_components/activity-filter-client";
import { HowToParticipate } from "./_components/how-to-participate";

async function getPublishedActivities() {
  return prisma.activity.findMany({
    where: {
      status: { in: ["PUBLISHED", "CLOSED"] },
    },
    orderBy: { startDate: "desc" },
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
    },
  });
}

export default async function ActivitiesPage() {
  const activities = await getPublishedActivities();

  if (activities.length === 0) {
    return (
      <div className="py-16 text-center">
        <Icon
          name="group-outline"
          className="mx-auto mb-4 text-neutral-300"
          width={64}
          height={64}
        />
        <p className="text-lg text-neutral-500">
          現在公開中の体験メニューはありません
        </p>
      </div>
    );
  }

  const serialized = activities.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    status: a.status,
    startDate: a.startDate.toISOString(),
    endDate: a.endDate?.toISOString() ?? null,
    thumbnailUrl: a.images[0]?.url ?? null,
  }));

  return (
    <section>
      <div className="mb-8 text-center">
        <SectionHeading className="text-4xl font-bold text-secondary-500">
          交流する
        </SectionHeading>
        <p className="mt-8 text-base text-neutral-600">
          以下の募集中の体験に参加できます
        </p>
      </div>
      <ActivityFilterClient activities={serialized} />
      <HowToParticipate />

      <div className="mt-8">
        <CharacterContainer
          leftSrc="/assets/character/siro-default.png"
          rightSrc="/assets/character/kuro-default.png"
        />
      </div>
    </section>
  );
}
