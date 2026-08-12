"use client";

type DocsPayload = {
  docTitle: string;
  suggestion: string;
  status: string;
};

export function DocsFlash({
  payload,
  onAdvance,
}: {
  payload: DocsPayload;
  onAdvance?: () => void;
}) {
  return (
    <div
      role={onAdvance ? "button" : undefined}
      tabIndex={onAdvance ? 0 : undefined}
      onClick={onAdvance}
      onKeyDown={
        onAdvance
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onAdvance();
              }
            }
          : undefined
      }
      className="flex h-full w-full flex-col bg-[#fbfbfd] text-left"
    >
      <header className="shrink-0 border-b border-black/10 px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-[#5f6368]">
          Google Docs
        </div>
        <div className="mt-0.5 text-sm font-semibold text-[#202124]">
          {payload.docTitle}
        </div>
      </header>
      <div className="flex min-h-0 w-full flex-1 flex-col px-3 pt-4">
        <div className="w-full flex-1 space-y-2 font-[family-name:var(--font-doc)] text-[13px] leading-relaxed text-[#3c4043]">
          <p className="text-[#80868b]">§7 Indemnification …</p>
          <p className="w-full rounded bg-[#fef9c3]/80 px-1.5 py-1 text-[#1c1917]">
            §8 Limitation of Liability
          </p>
          <p className="text-[#80868b]">§9 Governing Law …</p>
        </div>
        <div className="animate-slide-up mb-3 w-full rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3 shadow-md">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#a16207]">
            Suggestion
          </div>
          <p className="mt-1 text-[12px] leading-snug text-[#422006]">
            {payload.suggestion}
          </p>
          <div className="mt-2 text-[11px] text-[#0f766e]">{payload.status}</div>
        </div>
      </div>
    </div>
  );
}
