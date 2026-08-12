"use client";

type StepStripProps = {
  step: number;
  total: number;
  title: string;
};

export function StepStrip({ step, total, title }: StepStripProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2 px-4">
      <div className="flex items-baseline gap-2 font-[family-name:var(--font-display)] text-sm text-[var(--stage-fg)]">
        <span className="tabular-nums text-[var(--stage-accent)]">
          {step}/{total}
        </span>
        <span className="text-[var(--stage-muted)]">·</span>
        <span>{title}</span>
      </div>
      <div className="flex w-full gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n < step;
          return (
            <div
              key={n}
              className={[
                "h-1 flex-1 rounded-full transition-colors duration-300",
                active
                  ? "bg-[var(--stage-accent)]"
                  : done
                    ? "bg-[var(--stage-accent)]/45"
                    : "bg-[var(--stage-bar)]",
              ].join(" ")}
            />
          );
        })}
      </div>
    </div>
  );
}
