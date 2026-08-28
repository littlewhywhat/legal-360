"use client";

type TelegramPayload = {
  mode: "notification";
  bot: string;
  text: string;
  time?: string;
};

export function TelegramScene({
  payload,
  onAdvance,
}: {
  payload: TelegramPayload;
  onAdvance?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdvance}
      className="flex h-full w-full flex-col bg-[#17212b] px-3 pt-2 text-left text-white"
    >
      <div className="mb-3 text-sm font-semibold tracking-wide text-[#e4ecf2]">
        Telegram
      </div>
      <div className="animate-slide-up rounded-xl bg-[#242f3d] p-3 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6ab3f3] text-[11px] font-bold text-[#0e1621]">
              OS
            </span>
            <div>
              <div className="text-[13px] font-semibold text-[#e4ecf2]">
                {payload.bot}
              </div>
              <div className="text-[10px] text-[#7d8b99]">private · bot</div>
            </div>
          </div>
          <div className="text-[10px] text-[#7d8b99]">{payload.time ?? "now"}</div>
        </div>
        <p className="mt-2 text-[13px] leading-snug text-[#dbe4ec]">{payload.text}</p>
      </div>
    </button>
  );
}
