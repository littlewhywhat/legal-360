"use client";

import type { Choice } from "@demo/runtime";

type City = {
  id: string;
  name: string;
  oval: number;
  cloud: number;
  dark: boolean;
  you?: boolean;
  favorite?: boolean;
  best?: boolean;
  x?: number;
  y?: number;
};

type AuroraPayload = {
  mode: "lock" | "list" | "detail" | "map" | "finale";
  time?: string;
  appName?: string;
  title?: string;
  body?: string;
  heading?: string;
  sub?: string;
  cities?: City[];
  city?: City;
  verdict?: string;
  spots?: City[];
  headline?: string;
  detail?: string;
  footnote?: string;
};

function pSee(city: City): number {
  return Math.round(city.oval * (1 - city.cloud / 100) * (city.dark ? 1 : 0));
}

function tone(p: number): string {
  if (p >= 50) return "#34d399";
  if (p >= 25) return "#fbbf24";
  return "#fb7185";
}

function Factor({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
      <span className="text-[12px] text-[#94a3b8]">{label}</span>
      <span
        className="text-[13px] font-semibold tabular-nums"
        style={{ color: good ? "#34d399" : "#fb7185" }}
      >
        {value}
      </span>
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
}) {
  const primary = choices?.find((c) => c.variant === "primary");

  if (payload.mode === "lock") {
    return (
      <button
        type="button"
        onClick={onAdvance}
        className="relative flex h-full w-full flex-col justify-end overflow-hidden px-4 pb-8 text-left"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 60% 18%, rgba(52,211,153,0.4), transparent 62%), radial-gradient(ellipse 60% 40% at 20% 8%, rgba(167,139,250,0.28), transparent 55%), linear-gradient(#050814, #0b1b24 55%, #071018)",
        }}
      >
        <div className="animate-slide-up w-full rounded-2xl bg-[#121826]/90 p-3 ring-1 ring-white/10 backdrop-blur">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#94a3b8]">
            <span>{payload.appName}</span>
            <span>{payload.time}</span>
          </div>
          <div className="mt-1 text-[15px] font-semibold text-[#f8fafc]">
            {payload.title}
          </div>
          <p className="mt-1 text-[13px] leading-snug text-[#cbd5e1]">
            {payload.body}
          </p>
        </div>
      </button>
    );
  }

  if (payload.mode === "list" && payload.cities) {
    return (
      <div className="flex h-full w-full flex-col bg-[#070b14] px-4 pt-1 text-left">
        <header className="pb-3">
          <div className="text-xl font-semibold text-[#f8fafc]">
            {payload.heading}
          </div>
          <p className="mt-0.5 text-[11px] text-[#64748b]">{payload.sub}</p>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-4">
          {payload.cities.map((city) => {
            const p = pSee(city);
            const clickable = city.you && onAdvance;
            const inner = (
              <>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-[#f1f5f9]">
                    {city.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#64748b]">
                    {city.you ? "ты" : city.favorite ? "избранное" : "город"}
                    {" · "}облака {city.cloud}%
                  </div>
                </div>
                <div
                  className="text-[22px] font-semibold tabular-nums"
                  style={{ color: tone(p) }}
                >
                  {p}%
                </div>
              </>
            );
            if (clickable) {
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={onAdvance}
                  className="flex w-full items-center justify-between rounded-xl bg-[#34d399]/10 px-3 py-2.5 ring-1 ring-[#34d399]/35"
                >
                  {inner}
                </button>
              );
            }
            return (
              <div
                key={city.id}
                className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (payload.mode === "detail" && payload.city) {
    const city = payload.city;
    const p = pSee(city);
    return (
      <div className="flex h-full w-full flex-col bg-[#070b14] px-4 pt-1 text-left">
        <div className="text-[11px] uppercase tracking-wider text-[#64748b]">
          {city.you ? "твоя точка" : city.name}
        </div>
        <div className="mt-1 text-xl font-semibold text-[#f8fafc]">
          {city.name}
        </div>
        <div
          className="mt-3 text-5xl font-semibold tabular-nums"
          style={{ color: tone(p) }}
        >
          {p}%
        </div>
        <p className="mt-1 text-[12px] text-[#94a3b8]">вероятность увидеть</p>
        <div className="mt-4 space-y-2">
          <Factor label="Овал" value={`${city.oval}%`} good={city.oval >= 50} />
          <Factor
            label="Облака"
            value={`${city.cloud}%`}
            good={city.cloud < 30}
          />
          <Factor
            label="Темнота"
            value={city.dark ? "да" : "нет"}
            good={city.dark}
          />
        </div>
        {payload.verdict ? (
          <p className="mt-4 text-[13px] leading-snug text-[#cbd5e1]">
            {payload.verdict}
          </p>
        ) : null}
        {primary ? (
          <button
            type="button"
            onClick={() => onChoice(primary)}
            className="mt-auto mb-4 w-full rounded-xl bg-[#34d399] py-2.5 text-sm font-semibold text-[#052e1c] active:scale-[0.98]"
          >
            {primary.label}
          </button>
        ) : null}
      </div>
    );
  }

  if (payload.mode === "map" && payload.spots) {
    return (
      <div className="flex h-full w-full flex-col bg-[#070b14] text-left">
        <header className="px-4 pb-2 pt-1">
          <div className="text-lg font-semibold text-[#f8fafc]">
            {payload.heading}
          </div>
          <p className="text-[11px] text-[#64748b]">цвет = P_see, не сырой овал</p>
        </header>
        <div
          className="relative mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded-2xl ring-1 ring-white/10"
          style={{
            background:
              "radial-gradient(ellipse 70% 42% at 58% 32%, rgba(52,211,153,0.38), transparent 68%), radial-gradient(ellipse 40% 28% at 30% 22%, rgba(167,139,250,0.22), transparent 60%), #0a1220",
          }}
        >
          {payload.spots.map((spot) => {
            const p = pSee(spot);
            const clickable = spot.best && onAdvance;
            const flip = (spot.x ?? 0) > 55;
            const pos = {
              left: `${spot.x ?? 50}%`,
              top: `${spot.y ?? 50}%`,
            };
            const cls = [
              "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1",
              flip ? "flex-row-reverse" : "",
              clickable ? "z-10" : "",
            ].join(" ");
            const pin = (
              <>
                <span
                  className={
                    spot.best
                      ? "h-3 w-3 rounded-full ring-2 ring-[#f8fafc]"
                      : "h-2.5 w-2.5 rounded-full ring-2 ring-[#070b14]"
                  }
                  style={{ background: tone(p) }}
                />
                <span className="max-w-[7.5rem] rounded-md bg-[#070b14]/80 px-1.5 py-0.5 text-[10px] font-medium text-[#e2e8f0]">
                  {spot.name} {p}%
                </span>
              </>
            );
            if (clickable) {
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={onAdvance}
                  className={cls}
                  style={pos}
                >
                  {pin}
                </button>
              );
            }
            return (
              <div key={spot.id} className={cls} style={pos}>
                {pin}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdvance}
      className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#070b14] px-6 text-center"
    >
      <div className="text-2xl font-semibold tracking-tight text-[#ecfdf5]">
        {payload.headline}
      </div>
      {payload.detail ? (
        <p className="text-sm text-[#6ee7b7]">{payload.detail}</p>
      ) : null}
      {payload.footnote ? (
        <p className="text-[12px] text-[#64748b]">{payload.footnote}</p>
      ) : null}
      <span className="mt-2 text-xs text-[#6ee7b7]/80">Replay</span>
    </button>
  );
}
