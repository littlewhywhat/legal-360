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

type Tabs = { list: string; map: string; active: "list" | "map" };

type AuroraPayload = {
  mode: "lock" | "list" | "detail" | "map" | "finale";
  time?: string;
  date?: string;
  appName?: string;
  place?: Place | string;
  p?: number;
  km?: number;
  here?: Place;
  places?: Place[];
  vsHere?: number;
  spots?: Place[];
  sheet?: Place;
  eta?: string;
  tabs?: Tabs;
};

function pSee(place: Place): number {
  return Math.round(place.oval * (1 - place.cloud / 100) * (place.dark ? 1 : 0));
}

function tone(p: number): string {
  if (p >= 50) return "#34d399";
  if (p >= 25) return "#fbbf24";
  return "#fb7185";
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
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-3.5 w-3.5"} fill="currentColor">
      <path d="M7 18h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.5A3.5 3.5 0 0 0 7 18Z" />
    </svg>
  );
}

function StarIcon({ on }: { on?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={on ? "#34d399" : "none"} stroke={on ? "#34d399" : "#64748b"} strokeWidth="1.8">
      <path d="m12 4 2.2 5.3L20 10l-4 3.6.9 5.4L12 16.5 7.1 19l.9-5.4L4 10l5.8-.7L12 4Z" />
    </svg>
  );
}

function Ring({ p, size = 88 }: { p: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone(p)}
          strokeWidth="7"
          strokeDasharray={`${(p / 100) * c} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-semibold tabular-nums"
        style={{ color: tone(p), fontSize: size >= 100 ? 22 : size >= 80 ? 18 : 12 }}
      >
        {p}
      </div>
    </div>
  );
}

function Meter({ icon, value, invert }: { icon: "oval" | "cloud" | "dark"; value: number; invert?: boolean }) {
  const good = invert ? value < 30 : value >= 50;
  const fill = invert ? Math.max(6, 100 - value) : value;
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-[#94a3b8]">
        {icon === "cloud" ? (
          <CloudIcon />
        ) : icon === "dark" ? (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M15 3a9 9 0 1 0 6 15 8 8 0 0 1-6-15Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <ellipse cx="12" cy="12" rx="9" ry="5" />
          </svg>
        )}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{ width: `${fill}%`, background: good ? "#34d399" : "#fb7185" }}
        />
      </div>
    </div>
  );
}

function TabsBar({ tabs, onGo }: { tabs: Tabs; onGo: (id: string) => void }) {
  return (
    <nav className="grid grid-cols-2 border-t border-white/10 bg-[#0b1220] px-6 py-2">
      <button
        type="button"
        onClick={() => onGo(tabs.list)}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${tabs.active === "list" ? "text-[#34d399]" : "text-[#64748b]"}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 7h12M8 12h12M8 17h12" />
          <circle cx="4" cy="7" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="4" cy="17" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onGo(tabs.map)}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${tabs.active === "map" ? "text-[#34d399]" : "text-[#64748b]"}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m3 7 6-3 6 3 6-3v13l-6 3-6-3-6 3V7Z" />
          <path d="M9 4v13M15 7v13" />
        </svg>
      </button>
    </nav>
  );
}

function PlaceCard({
  place,
  active,
  onClick,
}: {
  place: Place;
  active?: boolean;
  onClick?: () => void;
}) {
  const p = pSee(place);
  const cls = [
    "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left",
    active ? "bg-[#34d399]/12 ring-1 ring-[#34d399]/40" : "bg-white/5",
  ].join(" ");
  const inner = (
    <>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#e2e8f0]"
        style={{
          background: `linear-gradient(160deg, ${tone(p)}55, #0f172a)`,
        }}
      >
        <Icon kind={place.kind} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[14px] font-semibold text-[#f8fafc]">{place.name}</span>
          <StarIcon on={place.favorite} />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[11px] tabular-nums text-[#64748b]">{place.km} км</span>
          <span className="flex items-center gap-0.5 text-[#94a3b8]">
            <CloudIcon className="h-3 w-3" />
            <span
              className="h-1 w-10 overflow-hidden rounded-full bg-white/10"
            >
              <span
                className="block h-full"
                style={{
                  width: `${100 - place.cloud}%`,
                  background: place.cloud < 30 ? "#34d399" : "#fb7185",
                }}
              />
            </span>
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[22px] font-semibold leading-none tabular-nums" style={{ color: tone(p) }}>
          {p}
        </div>
      </div>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function AuroraScene({
  payload,
  choices,
  onChoice,
  onAdvance,
  onGo,
}: {
  payload: AuroraPayload;
  choices?: Choice[];
  onChoice: (choice: Choice) => void;
  onAdvance?: () => void;
  onGo?: (id: string) => void;
}) {
  const primary = choices?.find((c) => c.variant === "primary");
  const goTab = (id: string) => onGo?.(id);

  if (payload.mode === "lock") {
    return (
      <button
        type="button"
        onClick={onAdvance}
        className="relative flex h-full w-full flex-col overflow-hidden px-4 pb-7 pt-8 text-left"
        style={{
          background:
            "radial-gradient(ellipse 90% 48% at 62% 16%, rgba(52,211,153,0.5), transparent 60%), radial-gradient(ellipse 55% 36% at 18% 10%, rgba(167,139,250,0.32), transparent 55%), linear-gradient(#04060f, #0b1b24 58%, #071018)",
        }}
      >
        <div className="text-center text-[#e2e8f0]">
          <div className="text-[52px] font-semibold leading-none tracking-tight tabular-nums">{payload.time}</div>
          <div className="mt-1 text-[12px] text-[#94a3b8]">{payload.date}</div>
        </div>
        <div className="mt-auto animate-slide-up flex items-center gap-3 rounded-2xl bg-[#121826]/92 p-2.5 ring-1 ring-white/10 backdrop-blur">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#34d399]/20 text-[#34d399]">
            <Icon kind="shore" className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-[#94a3b8]">{payload.appName}</div>
            <div className="text-[14px] font-semibold text-[#f8fafc]">{payload.place as string}</div>
          </div>
          <div className="text-right">
            <div className="text-[20px] font-semibold tabular-nums text-[#34d399]">{payload.p}</div>
            <div className="text-[10px] tabular-nums text-[#64748b]">{payload.km} км</div>
          </div>
        </div>
      </button>
    );
  }

  if (payload.mode === "list" && payload.places && payload.here) {
    const hereP = pSee(payload.here);
    return (
      <div className="flex h-full w-full flex-col bg-[#070b14]">
        <div className="flex min-h-0 flex-1 flex-col px-3 pt-1">
          <div className="mb-2 flex items-center gap-3 rounded-2xl bg-[#0f172a] px-3 py-2 ring-1 ring-white/10">
            <Ring p={hereP} size={52} />
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#f8fafc]">
                <Icon kind="here" className="h-3.5 w-3.5 text-[#38bdf8]" />
                {payload.here.name}
              </div>
              <div className="mt-1.5">
                <Meter icon="cloud" value={payload.here.cloud} invert />
              </div>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2">
            {payload.places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                active={place.best}
                onClick={place.best ? onAdvance : undefined}
              />
            ))}
          </div>
        </div>
        {payload.tabs && onGo ? <TabsBar tabs={payload.tabs} onGo={goTab} /> : null}
      </div>
    );
  }

  if (payload.mode === "detail" && payload.place && typeof payload.place !== "string") {
    const place = payload.place;
    const p = pSee(place);
    return (
      <div className="flex h-full w-full flex-col bg-[#070b14]">
        <div
          className="relative flex min-h-0 flex-1 flex-col px-4 pt-2"
          style={{
            background: `radial-gradient(ellipse 80% 45% at 50% 0%, ${tone(p)}33, transparent 70%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => onGo?.(payload.tabs?.list ?? "")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#e2e8f0]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m14 6-6 6 6 6" />
              </svg>
            </button>
            <StarIcon on={place.favorite} />
          </div>
          <div className="mt-2 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#f8fafc]">
              <Icon kind={place.kind} className="h-6 w-6" />
            </div>
            <div className="mt-2 text-[18px] font-semibold text-[#f8fafc]">{place.name}</div>
            <div className="mt-3">
              <Ring p={p} size={108} />
            </div>
          </div>
          <div className="mt-4 space-y-2.5 rounded-2xl bg-white/5 p-3">
            <Meter icon="oval" value={place.oval} />
            <Meter icon="cloud" value={place.cloud} invert />
            <Meter icon="dark" value={place.dark ? 100 : 0} />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] tabular-nums text-[#cbd5e1]">
              {place.km} км
            </span>
            {payload.vsHere != null ? (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] tabular-nums text-[#94a3b8]">
                здесь {payload.vsHere}
              </span>
            ) : null}
          </div>
          {primary ? (
            <button
              type="button"
              onClick={() => onChoice(primary)}
              className="mt-auto mb-3 flex items-center justify-center gap-2 rounded-2xl bg-[#34d399] py-3 text-sm font-semibold text-[#052e1c] active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 7 6-3 6 3 6-3v13l-6 3-6-3-6 3V7Z" />
              </svg>
              {primary.label}
            </button>
          ) : null}
        </div>
        {payload.tabs && onGo ? <TabsBar tabs={payload.tabs} onGo={goTab} /> : null}
      </div>
    );
  }

  if (payload.mode === "map" && payload.spots) {
    const sheet = payload.sheet;
    const sheetP = sheet ? pSee(sheet) : 0;
    return (
      <div className="flex h-full w-full flex-col bg-[#070b14]">
        <div
          className="relative min-h-0 flex-1"
          style={{
            background:
              "radial-gradient(ellipse 70% 42% at 62% 28%, rgba(52,211,153,0.4), transparent 68%), radial-gradient(ellipse 40% 28% at 28% 20%, rgba(167,139,250,0.22), transparent 60%), #0a1220",
          }}
        >
          {payload.here ? (
            <div
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${payload.here.x}%`, top: `${payload.here.y}%` }}
            >
              <span className="block h-3 w-3 rounded-full bg-[#38bdf8] ring-4 ring-[#38bdf8]/30" />
            </div>
          ) : null}
          {payload.spots.map((spot) => {
            const p = pSee(spot);
            const clickable = spot.best && onAdvance;
            const pos = { left: `${spot.x ?? 50}%`, top: `${spot.y ?? 50}%` };
            const pin = (
              <span
                className="flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums text-[#052e1c]"
                style={{ background: tone(p) }}
              >
                {p}
              </span>
            );
            if (clickable) {
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={onAdvance}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={pos}
                >
                  {pin}
                </button>
              );
            }
            return (
              <div key={spot.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={pos}>
                {pin}
              </div>
            );
          })}
          {sheet ? (
            <button
              type="button"
              onClick={onAdvance}
              className="absolute inset-x-3 bottom-3 z-30 flex items-center gap-3 rounded-2xl bg-[#121826]/95 p-2.5 text-left ring-1 ring-white/10 backdrop-blur"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[#f8fafc]"
                style={{ background: `linear-gradient(160deg, ${tone(sheetP)}66, #0f172a)` }}
              >
                <Icon kind={sheet.kind} className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-[#f8fafc]">{sheet.name}</div>
                <div className="mt-1.5">
                  <Meter icon="cloud" value={sheet.cloud} invert />
                </div>
              </div>
              <div className="text-[22px] font-semibold tabular-nums" style={{ color: tone(sheetP) }}>
                {sheetP}
              </div>
            </button>
          ) : null}
        </div>
        {payload.tabs && onGo ? <TabsBar tabs={payload.tabs} onGo={goTab} /> : null}
      </div>
    );
  }

  const finale = payload.place && typeof payload.place !== "string" ? payload.place : null;
  const finaleP = finale ? pSee(finale) : payload.p ?? 0;
  return (
    <button
      type="button"
      onClick={onAdvance}
      className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#070b14] px-6"
      style={{
        background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${tone(finaleP)}33, #070b14 70%)`,
      }}
    >
      {finale ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#f8fafc]">
          <Icon kind={finale.kind} className="h-7 w-7" />
        </div>
      ) : null}
      <Ring p={finaleP} size={120} />
      <div className="text-[20px] font-semibold text-[#f8fafc]">{finale?.name}</div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#34d399] px-3 py-1.5 text-[12px] font-semibold text-[#052e1c]">
          {payload.eta}
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] tabular-nums text-[#cbd5e1]">
          {finale?.km} км
        </span>
      </div>
    </button>
  );
}
