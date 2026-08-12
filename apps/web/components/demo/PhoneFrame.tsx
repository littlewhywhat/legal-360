"use client";

import type { ReactNode } from "react";

type PhoneFrameProps = {
  deviceLabel: string;
  children: ReactNode;
};

export function PhoneFrame({ deviceLabel, children }: PhoneFrameProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--stage-muted)]">
        {deviceLabel}
      </div>
      <div className="phone-bezel relative w-[min(100%,320px)] overflow-hidden rounded-[2rem] border border-[var(--phone-edge)] bg-[var(--phone-shell)] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[var(--phone-notch)]" />
        <div className="phone-screen relative flex h-[560px] flex-col overflow-hidden rounded-[1.5rem] bg-[var(--screen-bg)] text-[var(--screen-fg)]">
          <div className="flex shrink-0 items-center justify-between px-5 pb-1 pt-3 text-[10px] font-medium text-[var(--screen-muted)]">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-3 rounded-sm bg-current opacity-70" />
              <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}
