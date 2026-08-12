"use client";

type EmailPayload = {
  mode: "inbox" | "compose";
  from?: string;
  to?: string;
  subject: string;
  preview?: string;
  body: string[];
  attachment?: string;
};

type EmailSceneProps = {
  payload: EmailPayload;
  onOpen?: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
};

export function EmailScene({
  payload,
  onOpen,
  primaryLabel,
  onPrimary,
}: EmailSceneProps) {
  if (payload.mode === "compose") {
    return (
      <div className="flex h-full flex-col bg-[#f4f1ec]">
        <header className="border-b border-black/10 px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-[#6b645c]">
            New message
          </div>
          <div className="mt-1 text-sm font-semibold text-[#1c1917]">
            {payload.subject}
          </div>
          <div className="mt-1 text-xs text-[#6b645c]">To: {payload.to}</div>
        </header>
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-[13px] leading-relaxed text-[#292524]">
          {payload.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {payload.attachment ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#d6d3d1] bg-white px-3 py-2 text-xs text-[#44403c]">
              <span className="h-6 w-6 rounded bg-[#0f766e]/15 text-center text-[10px] leading-6 text-[#0f766e]">
                DOC
              </span>
              {payload.attachment}
            </div>
          ) : null}
        </div>
        {primaryLabel && onPrimary ? (
          <div className="border-t border-black/10 p-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrimary();
              }}
              className="w-full rounded-lg bg-[#0f766e] py-2.5 text-sm font-semibold text-white active:scale-[0.98]"
            >
              {primaryLabel}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#f4f1ec] text-left">
      <header className="border-b border-black/10 px-4 py-3">
        <div className="font-[family-name:var(--font-display)] text-base font-semibold text-[#1c1917]">
          Mail
        </div>
      </header>
      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        className="border-b border-black/5 px-4 py-3 text-left transition-colors hover:bg-black/[0.03] disabled:hover:bg-transparent"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold text-[#1c1917]">{payload.from}</div>
          <div className="text-[10px] text-[#78716c]">Just now</div>
        </div>
        <div className="mt-0.5 text-[13px] font-medium text-[#292524]">
          {payload.subject}
        </div>
        <div className="mt-1 line-clamp-2 text-xs text-[#78716c]">
          {payload.preview}
        </div>
        {payload.attachment ? (
          <div className="mt-2 text-[11px] text-[#0f766e]">📎 {payload.attachment}</div>
        ) : null}
      </button>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-[13px] leading-relaxed text-[#44403c]">
        {payload.body.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      {primaryLabel && onPrimary ? (
        <div className="border-t border-black/10 p-3">
          <button
            type="button"
            onClick={onPrimary}
            className="block w-full rounded-lg bg-[#0f766e] py-2.5 text-center text-sm font-semibold text-white active:scale-[0.98]"
          >
            {primaryLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
