interface StepListProps {
  steps: string[];
  ariaLabel?: string;
}

export function StepList({ steps, ariaLabel }: StepListProps) {
  return (
    <ol className="flex flex-col gap-3" aria-label={ariaLabel}>
      {steps.map((step, i) => (
        <li
          key={step}
          className="flex items-center gap-4 rounded-2xl bg-white px-2 py-2 shadow-[var(--shadow-sm)]"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-arcana-limegreen text-base font-bold text-white"
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <p className="min-w-0 flex-1 whitespace-pre-line leading-[1.6] text-body-blue">
            {step}
          </p>
        </li>
      ))}
    </ol>
  );
}
