"use client";

import type { ReactNode } from "react";

type PhoneFrameProps = {
  deviceLabel: string;
  children: ReactNode;
  chrome?: "light" | "dark" | "overlay";
  clock?: string;
  onBack?: () => void;
};

export function PhoneFrame({
  deviceLabel,
  children,
  chrome = "light",
  clock = "9:41",
  onBack,
}: PhoneFrameProps) {
  const overlay = chrome === "overlay";
  const dark = chrome === "dark" || overlay;
  const bar = dark ? "text-[#9aa89f]" : "text-[var(--screen-muted)]";
  return (
    <div className="flex w-full max-w-[320px] flex-col items-center gap-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--stage-muted)]">
        {deviceLabel}
      </div>
      <div className="phone-bezel relative w-full overflow-hidden rounded-[2rem] border border-[var(--phone-edge)] bg-[var(--phone-shell)] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[var(--phone-notch)]" />
        <div
          className={[
            "phone-screen relative flex h-[560px] w-full min-w-0 flex-col overflow-hidden rounded-[1.5rem]",
            overlay
              ? "bg-black text-white"
              : dark
                ? "bg-[#121816] text-[#e8eee9]"
                : "bg-[var(--screen-bg)] text-[var(--screen-fg)]",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center justify-between px-5 pb-1 pt-3 text-[10px] font-medium",
              overlay
                ? "pointer-events-none absolute inset-x-0 top-0 z-10 text-white"
                : `shrink-0 ${bar}`,
            ].join(" ")}
          >
            <span>{clock}</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-3 rounded-sm bg-current opacity-70" />
              <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
            </span>
          </div>
          <div className="min-h-0 w-full min-w-0 flex-1 overflow-hidden">
            {children}
          </div>
          <div
            className={[
              "flex h-7 shrink-0 items-center px-2",
              overlay ? "absolute inset-x-0 bottom-0 z-10 text-white" : bar,
            ].join(" ")}
          >
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className="flex h-7 w-8 items-center justify-center text-[22px] leading-none"
              >
                ‹
              </button>
            ) : (
              <span className="w-8" />
            )}
            <span className="mx-auto h-1 w-[108px] rounded-full bg-current opacity-30" />
            <span className="w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
