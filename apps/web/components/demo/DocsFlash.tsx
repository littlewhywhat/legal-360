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
    <button
      type="button"
      onClick={onAdvance}
      className="flex h-full w-full flex-col bg-[#fbfbfd] text-left"
    >
      <header className="border-b border-black/10 px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-[#5f6368]">
          Google Docs
        </div>
        <div className="mt-0.5 text-sm font-semibold text-[#202124]">
          {payload.docTitle}
        </div>
      </header>
      <div className="relative flex-1 px-4 py-6">
        <div className="space-y-2 font-[family-name:var(--font-doc)] text-[13px] leading-relaxed text-[#3c4043]">
          <p className="text-[#80868b]">§7 Indemnification …</p>
          <p className="rounded bg-[#fef9c3]/80 px-1 py-0.5 text-[#1c1917]">
            §8 Limitation of Liability
          </p>
          <p className="text-[#80868b]">§9 Governing Law …</p>
        </div>
        <div className="animate-slide-up absolute bottom-6 left-3 right-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3 shadow-md">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#a16207]">
            Suggestion
          </div>
          <p className="mt-1 text-[12px] leading-snug text-[#422006]">
            {payload.suggestion}
          </p>
          <div className="mt-2 text-[11px] text-[#0f766e]">{payload.status}</div>
        </div>
      </div>
    </button>
  );
}
