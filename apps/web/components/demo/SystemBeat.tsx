"use client";

type SystemPayload = {
  mode: "ask" | "finale";
  headline: string;
  question?: string;
  detail?: string;
};

export function SystemBeat({
  payload,
  primaryLabel,
  onPrimary,
  onAdvance,
}: {
  payload: SystemPayload;
  primaryLabel?: string;
  onPrimary?: () => void;
  onAdvance?: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#0e1512] px-6 text-center">
      <div className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[#ecfdf5]">
        {payload.headline}
      </div>
      {payload.question ? (
        <p className="text-sm text-[#a7f3d0]">{payload.question}</p>
      ) : null}
      {payload.detail ? (
        <p className="text-sm leading-relaxed text-[#6ee7b7]/90">{payload.detail}</p>
      ) : null}
      {primaryLabel && onPrimary ? (
        <button
          type="button"
          onClick={onPrimary}
          className="mt-2 inline-flex rounded-lg bg-[#2bac76] px-5 py-2.5 text-sm font-semibold text-[#052e1c] active:scale-[0.98]"
        >
          {primaryLabel}
        </button>
      ) : null}
      {payload.mode === "finale" && onAdvance ? (
        <button
          type="button"
          onClick={onAdvance}
          className="text-xs text-[#6ee7b7]/80 underline-offset-2 hover:underline"
        >
          Replay
        </button>
      ) : null}
    </div>
  );
}
