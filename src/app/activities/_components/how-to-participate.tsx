import { StepList } from "@/app/_components/StepList";
import { env } from "@/env";

const PARTICIPATE_STEPS = [
  "参加したい交流の内容や日時を確認",
  "「参加してみる」ボタンをクリックして申し込みをする",
  "申込内容を保存して当日まで待つ",
  "時間を合わせて交流に参加する",
];

export function HowToParticipate() {
  const contactEmail = env.CONTACT_EMAIL;
  return (
    <section aria-labelledby="howto-participate-heading" className="mt-20">
      <h2
        id="howto-participate-heading"
        className="mb-6 text-center text-2xl font-bold text-arcana-green text-balance"
      >
        参加の仕方
      </h2>
      <StepList steps={PARTICIPATE_STEPS} ariaLabel="交流に参加する手順" />
      <div className="mt-3 flex items-start gap-4 rounded-2xl bg-[var(--color-arcana-pale-orange)] px-4 py-4">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-400 text-base font-bold text-white"
          aria-hidden="true"
        >
          i
        </span>
        <p className="min-w-0 flex-1 leading-[1.6] text-body-blue">
          参加できなくなった場合は、
          <span className="text-arcana-orange-secondary">
            キャンセルフォーム
          </span>
          か
          <a
            href={`mailto:${contactEmail}`}
            className="text-arcana-orange-secondary underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcana-orange-secondary"
          >
            お問い合わせ
          </a>
          からご連絡ください
        </p>
      </div>
    </section>
  );
}
