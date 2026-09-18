"use client";

import type { Choice } from "@demo/runtime";

type Kind = "here" | "shore" | "plateau" | "lake" | "hill";

type Place = {
  id: string;
  name: string;
  kind: Kind;
  oval: number;
  cloud: number;
  dark: boolean;
  km?: number;
  favorite?: boolean;
  you?: boolean;
  best?: boolean;
  x?: number;
  y?: number;
};

type Hour = { t: string; cloud: number };

type AuroraPayload = {
  mode: "lock" | "brief" | "map" | "finale";
  time?: string;
  date?: string;
  appName?: string;
  headline?: string;
  kicker?: string;
  here?: Place;
  spots?: Place[];
  hourly?: Hour[];
  best?: Place;
  sheet?: Place;
  place?: Place;
  eta?: string;
};

function pSee(place: Place): number {
  return Math.round(place.oval * (1 - place.cloud / 100) * (place.dark ? 1 : 0));
}

function tone(p: number): string {
  if (p >= 50) return "#6ee7b7";
  if (p >= 25) return "#fbbf24";
  return "#f9a8d4";
}

function Icon({ kind, className }: { kind: Kind; className?: string }) {
  const common = className ?? "h-4 w-4";
  if (kind === "shore") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 16c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 7 0" />
        <path d="M3 20c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 7 0" />
        <path d="M12 4v8" />
      </svg>
    );
  }
  if (kind === "plateau") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 20 9 8l4 7 3-4 5 9H3Z" />
      </svg>
    );
  }
  if (kind === "lake") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 4c4 4 6 7 6 10a6 6 0 1 1-12 0c0-3 2-6 6-10Z" />
      </svg>
    );
  }
  if (kind === "hill") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m4 18 8-12 8 12H4Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="currentColor">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function SkyIcon({ cloud }: { cloud: number }) {
  if (cloud >= 45) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#cbd5e1]" fill="currentColor">
        <path d="M7 18h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.5A3.5 3.5 0 0 0 7 18Z" />
      </svg>
    );
  }
  if (cloud >= 25) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#e2e8f0]" fill="currentColor">
        <path d="M15 5a6 6 0 1 0-1 11.9A4.5 4.5 0 1 0 16 9a5.8 5.8 0 0 0-1-4Z" />
        <path d="M8 18h9a3.5 3.5 0 0 0 0-7 4.8 4.8 0 0 0-7.2-2.2A3.2 3.2 0 0 0 8 18Z" opacity=".85" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#6ee7b7]" fill="currentColor">
      <path d="M12 3 13.5 8 19 8.2 14.8 11.5 16.5 17 12 13.8 7.5 17 9.2 11.5 5 8.2 10.5 8Z" />
    </svg>
  );
}

function YouPin() {
  return (
    <span className="relative flex h-3.5 w-3.5">
      <span className="absolute inset-0 animate-ping rounded-full bg-[#7dd3fc] opacity-50" />
      <span className="relative m-auto block h-3.5 w-3.5 rounded-full bg-[#38bdf8] ring-2 ring-white" />
    </span>
  );
}

function MiniMap({
  here,
  spots,
  onClick,
}: {
  here?: Place;
  spots?: Place[];
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[12%] top-[18%] h-[1px] w-[70%] rotate-12 bg-white/10" />
        <div className="absolute left-[8%] top-[58%] h-[1px] w-[80%] -rotate-6 bg-white/10" />
        <div className="absolute left-[40%] top-[8%] h-[70%] w-[1px] bg-white/10" />
      </div>
      {spots?.map((spot) => {
        const p = pSee(spot);
        return (
          <span
            key={spot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              width: spot.best ? 10 : 7,
              height: spot.best ? 10 : 7,
              background: tone(p),
              boxShadow: spot.best ? `0 0 12px ${tone(p)}` : undefined,
            }}
          />
        );
      })}
      {here ? (
        <span
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${here.x}%`, top: `${here.y}%` }}
        >
          <YouPin />
        </span>
      ) : null}
    </>
  );
  const surface = {
    background:
      "radial-gradient(ellipse 70% 50% at 60% 30%, rgba(110,231,183,0.28), transparent 62%), linear-gradient(#1c2a24, #141c18)",
  };
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="relative h-full w-full overflow-hidden" style={surface}>
        {inner}
      </button>
    );
  }
  return (
    <div className="relative h-full w-full overflow-hidden" style={surface}>
      {inner}
    </div>
  );
}

export function AuroraScene({
  payload,
  choices,
  onChoice,
  onAdvance,
}: {
  payload: AuroraPayload;
  choices?: Choice[];
  onChoice: (choice: Choice) => void;
  onAdvance?: () => void;
  onGo?: (id: string) => void;
}) {
  const primary = choices?.find((c) => c.variant === "primary");
  const ghost = choices?.find((c) => c.variant === "ghost");

  if (payload.mode === "lock" && payload.place) {
    const p = pSee(payload.place);
    return (
      <button
        type="button"
        onClick={onAdvance}
        className="relative flex h-full w-full flex-col overflow-hidden px-4 pb-6 pt-6 text-left"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 70% 0%, rgba(110,231,183,0.22), transparent 55%), linear-gradient(#1a2420, #121816)",
        }}
      >
        <div className="text-center">
          <div className="text-[56px] font-semibold leading-none tracking-tight tabular-nums text-[#f3f6f4]">
            {payload.time}
          </div>
          <div className="mt-1 text-[13px] text-[#9aa89f]">{payload.date}</div>
        </div>
        <div className="mt-auto flex items-center gap-3 rounded-[1.4rem] bg-[#2a322e]/90 p-2.5 ring-1 ring-white/10">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6ee7b7]/15 text-[#6ee7b7]">
            <Icon kind={payload.place.kind} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-[#9aa89f]">{payload.appName}</div>
            <div className="text-[15px] font-semibold text-[#f3f6f4]">{payload.place.name}</div>
          </div>
          <div className="text-right">
            <div className="text-[22px] font-semibold tabular-nums" style={{ color: tone(p) }}>
              {p}
            </div>
            <div className="text-[10px] tabular-nums text-[#9aa89f]">{payload.place.km} км</div>
          </div>
        </div>
      </button>
    );
  }

  if (payload.mode === "brief") {
    const hereP = payload.here ? pSee(payload.here) : 0;
    const bestP = payload.best ? pSee(payload.best) : 0;
    return (
      <div
        className="flex h-full w-full flex-col overflow-y-auto px-4 pb-3 pt-1"
        style={{
          background:
            "radial-gradient(ellipse 90% 40% at 50% -10%, #2a3d34, transparent 60%), #15201c",
        }}
      >
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-[#f3f6f4]">
          {payload.headline}
        </h1>
        <p className="mt-1 text-[14px] text-[#c5d0c8]">{payload.kicker}</p>
        <p className="mt-3 text-[13px] text-[#c5d0c8]">
          Сейчас <span className="text-[#9fe1c3]">{hereP}</span>
          {" · "}ясно на{" "}
          <span className="text-[#9fe1c3]">{payload.best?.name}</span>
        </p>

        <button
          type="button"
          onClick={onAdvance}
          className="relative mt-3 h-[148px] overflow-hidden rounded-[1.6rem] text-left ring-1 ring-white/10"
        >
          <MiniMap here={payload.here} spots={payload.spots} />
          <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2 py-0.5 text-[11px] text-[#e8eee9] backdrop-blur">
            ты
          </span>
          <span
            className="absolute bottom-3 right-3 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#052e1c]"
            style={{ background: tone(hereP) }}
          >
            {hereP}
          </span>
        </button>

        <div className="mt-3 rounded-[1.6rem] bg-[#5c5878] px-3 pb-3 pt-2.5">
          <div className="flex justify-between">
            {payload.hourly?.map((h) => (
              <div key={h.t} className="flex w-9 flex-col items-center gap-1">
                <span className="text-[9px] text-[#d6d3ea]">{h.t}:00</span>
                <SkyIcon cloud={h.cloud} />
                <span className="text-[11px] font-semibold tabular-nums text-white">
                  {100 - h.cloud}
                </span>
              </div>
            ))}
          </div>
        </div>

        {payload.best ? (
          <div className="mt-3 rounded-[1.6rem] bg-[#24302c] p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6ee7b7]/15 text-[#6ee7b7]">
                <Icon kind={payload.best.kind} className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-semibold text-[#f3f6f4]">{payload.best.name}</div>
                <div className="mt-0.5 text-[12px] tabular-nums text-[#9aa89f]">
                  {payload.eta}
                  {" · "}
                  {payload.best.km} км
                </div>
              </div>
              <div className="text-[28px] font-semibold tabular-nums" style={{ color: tone(bestP) }}>
                {bestP}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {ghost ? (
                <button
                  type="button"
                  onClick={() => onChoice(ghost)}
                  className="rounded-full bg-[#3a4540] py-2.5 text-[13px] font-medium text-[#e8eee9]"
                >
                  {ghost.label}
                </button>
              ) : null}
              {primary ? (
                <button
                  type="button"
                  onClick={() => onChoice(primary)}
                  className="rounded-full bg-[#e8eee9] py-2.5 text-[13px] font-semibold text-[#15201c]"
                >
                  {primary.label}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (payload.mode === "map") {
    const sheet = payload.sheet;
    const sheetP = sheet ? pSee(sheet) : 0;
    return (
      <div className="relative h-full w-full bg-[#141c18]">
        <MiniMap here={payload.here} spots={payload.spots} />
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-black/40 px-2 py-1 text-[11px] text-[#e8eee9] backdrop-blur">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#38bdf8]" />
            ты
          </span>
        </div>
        {payload.spots?.map((spot) => {
          if (!spot.best) return null;
          const p = pSee(spot);
          return (
            <button
              key={spot.id}
              type="button"
              onClick={onAdvance}
              className="absolute z-20 -translate-x-1/2 -translate-y-[120%] rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums text-[#052e1c]"
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                background: tone(p),
              }}
            >
              {spot.name} {p}
            </button>
          );
        })}
        {sheet ? (
          <button
            type="button"
            onClick={onAdvance}
            className="absolute inset-x-3 bottom-3 z-30 flex items-center gap-3 rounded-[1.4rem] bg-[#24302c]/95 p-3 text-left ring-1 ring-white/10"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6ee7b7]/15 text-[#6ee7b7]">
              <Icon kind={sheet.kind} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-[#f3f6f4]">{sheet.name}</div>
              <div className="text-[11px] tabular-nums text-[#9aa89f]">
                {payload.eta} · {sheet.km} км
              </div>
            </div>
            <div className="text-[24px] font-semibold tabular-nums" style={{ color: tone(sheetP) }}>
              {sheetP}
            </div>
          </button>
        ) : null}
      </div>
    );
  }

  const finale = payload.place;
  const finaleP = finale ? pSee(finale) : 0;
  return (
    <button
      type="button"
      onClick={onAdvance}
      className="flex h-full w-full flex-col justify-end px-4 pb-8 text-left"
      style={{
        background: `radial-gradient(ellipse 80% 50% at 50% 20%, ${tone(finaleP)}33, #15201c 70%)`,
      }}
    >
      <div className="rounded-[1.6rem] bg-[#24302c] p-4 ring-1 ring-white/10">
        {finale ? (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6ee7b7]/15 text-[#6ee7b7]">
              <Icon kind={finale.kind} className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[18px] font-semibold text-[#f3f6f4]">{finale.name}</div>
              <div className="text-[12px] tabular-nums text-[#9aa89f]">{payload.eta}</div>
            </div>
            <div className="text-[32px] font-semibold tabular-nums" style={{ color: tone(finaleP) }}>
              {finaleP}
            </div>
          </div>
        ) : null}
        <div className="mt-4 rounded-full bg-[#e8eee9] py-2.5 text-center text-[13px] font-semibold text-[#15201c]">
          Маршрут
        </div>
      </div>
    </button>
  );
}
