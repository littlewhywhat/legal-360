"use client";

import type { Choice } from "@demo/runtime";
import type { Kind, Night, Origin, Place, Stay, Way } from "@cases/aurora";

type AuroraPayload = {
  mode: "lock" | "home" | "place" | "analysis" | "geo" | "from" | "trip";
  time?: string;
  date?: string;
  appName?: string;
  place?: Place;
  nearest?: Place;
  probable?: Place;
  spots?: Place[];
  origin?: Origin;
  night?: Night | null;
  suggestion?: string;
  dates?: string;
};

function pSee(v: { oval: number; cloud: number; dark: boolean }): number {
  return Math.round(v.oval * (1 - v.cloud / 100) * (v.dark ? 1 : 0));
}

function tone(p: number): string {
  if (p >= 50) return "#6ee7b7";
  if (p >= 25) return "#fbbf24";
  return "#f9a8d4";
}

function Photo({ kind, className }: { kind: Kind; className?: string }) {
  const sky: Record<Kind, string> = {
    shore:
      "radial-gradient(ellipse 90% 55% at 58% 12%, rgba(110,231,183,0.9), transparent 58%), radial-gradient(ellipse 50% 35% at 28% 22%, rgba(52,211,153,0.55), transparent 70%), linear-gradient(#16324a 0%, #1c5a48 40%, #143830 62%, #0c241c 100%)",
    plateau:
      "radial-gradient(ellipse 100% 40% at 50% 18%, rgba(167,243,208,0.7), transparent 62%), linear-gradient(#14283c, #245060 48%, #2a3d34 70%, #1b2a22)",
    lake:
      "radial-gradient(ellipse 70% 45% at 50% 16%, rgba(74,222,128,0.75), transparent 60%), linear-gradient(#122438, #1a4850 50%, #123438 78%, #0b221c)",
    hill:
      "radial-gradient(ellipse 80% 50% at 62% 8%, rgba(110,231,183,0.7), transparent 58%), linear-gradient(#182438, #243848 40%, #1a2420 100%)",
  };
  return (
    <div className={["relative overflow-hidden", className].join(" ")} style={{ background: sky[kind] }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(#fff 0.6px, transparent 0.7px), radial-gradient(#fff 0.45px, transparent 0.6px)",
          backgroundPosition: "12px 18px, 40px 36px",
          backgroundSize: "72px 72px, 46px 46px",
        }}
      />
      {kind === "shore" ? (
        <>
          <div className="absolute inset-x-0 bottom-[18%] h-[22%] bg-gradient-to-b from-transparent to-[#0a1f1c]" />
          <div className="absolute inset-x-0 bottom-0 h-[28%] bg-[#071410]/90" />
          <div className="absolute bottom-[26%] left-[8%] h-8 w-16 rounded-t-full bg-[#0d1c16]" />
        </>
      ) : null}
      {kind === "plateau" ? (
        <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[#24352c]" />
      ) : null}
      {kind === "lake" ? (
        <div className="absolute bottom-[8%] left-1/2 h-[38%] w-[70%] -translate-x-1/2 rounded-[50%] bg-[#0a2428] ring-1 ring-[#6ee7b7]/20" />
      ) : null}
      {kind === "hill" ? (
        <div
          className="absolute bottom-0 left-1/2 h-[46%] w-[80%] -translate-x-1/2 bg-[#12181c]"
          style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
        />
      ) : null}
    </div>
  );
}

function MiniMap({
  origin,
  place,
  spots,
  track,
}: {
  origin?: Origin;
  place?: Place;
  spots?: Place[];
  track?: boolean;
}) {
  const surface = {
    background:
      "radial-gradient(ellipse 70% 50% at 60% 30%, rgba(110,231,183,0.22), transparent 62%), linear-gradient(#1c2a24, #141c18)",
  };
  return (
    <div className="relative h-full w-full overflow-hidden" style={surface}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[12%] top-[18%] h-[1px] w-[70%] rotate-12 bg-white/10" />
        <div className="absolute left-[8%] top-[58%] h-[1px] w-[80%] -rotate-6 bg-white/10" />
      </div>
      {track && origin && place ? (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d={`M ${origin.x} ${origin.y} Q ${(origin.x + place.x) / 2 - 8} ${(origin.y + place.y) / 2 + 6} ${place.x} ${place.y}`}
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="1.4"
            strokeDasharray="3 2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
      {spots?.map((spot) => (
        <span
          key={spot.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: spot.best ? 9 : 6,
            height: spot.best ? 9 : 6,
            background: tone(pSee(spot)),
            boxShadow: spot.id === place?.id ? `0 0 10px ${tone(pSee(spot))}` : undefined,
          }}
        />
      ))}
      {place && !spots?.some((s) => s.id === place.id) ? (
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${place.x}%`,
            top: `${place.y}%`,
            width: 9,
            height: 9,
            background: tone(pSee(place)),
            boxShadow: `0 0 10px ${tone(pSee(place))}`,
          }}
        />
      ) : null}
      {origin ? (
        <span
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${origin.x}%`, top: `${origin.y}%` }}
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#7dd3fc] opacity-50" />
            <span className="relative m-auto block h-3 w-3 rounded-full bg-[#38bdf8] ring-2 ring-white" />
          </span>
        </span>
      ) : null}
    </div>
  );
}

function ScoreMark({ n }: { n: number }) {
  return (
    <>
      <span className="text-[0.72em] font-semibold opacity-70">P</span>
      {n}%
    </>
  );
}

function Badge({ n, onClick }: { n: number; onClick?: () => void }) {
  const cls =
    "inline-flex items-baseline gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums text-[#052e1c]";
  const style = { background: tone(n) };
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} style={style}>
        <ScoreMark n={n} />
      </button>
    );
  }
  return (
    <span className={cls} style={style}>
      <ScoreMark n={n} />
    </span>
  );
}

function Factor({ label, value, bar }: { label: string; value: string; bar: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12px]">
        <span className="text-[#9aa89f]">{label}</span>
        <span className="tabular-nums text-[#e8eee9]">{value}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#6ee7b7]" style={{ width: `${Math.max(6, Math.min(100, bar))}%` }} />
      </div>
    </div>
  );
}

function Row({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1">
      <span className="text-[13px] text-[#f3f6f4]">{title}</span>
      <span className="shrink-0 text-[11px] tabular-nums text-[#9aa89f]">{meta}</span>
    </div>
  );
}

const ICONS: { label: string; bg: string }[] = [
  { label: "Фото", bg: "#f59e0b" },
  { label: "Карты", bg: "#34d399" },
  { label: "Погода", bg: "#38bdf8" },
  { label: "Календарь", bg: "#f87171" },
  { label: "Почта", bg: "#60a5fa" },
  { label: "Заметки", bg: "#fbbf24" },
  { label: "Камера", bg: "#94a3b8" },
  { label: "Часы", bg: "#1e293b" },
  { label: "Музыка", bg: "#fb7185" },
  { label: "Книги", bg: "#fb923c" },
  { label: "Настройки", bg: "#64748b" },
  { label: "Файлы", bg: "#818cf8" },
];

const DOCK: { label: string; bg: string }[] = [
  { label: "Телефон", bg: "#22c55e" },
  { label: "Safari", bg: "#3b82f6" },
  { label: "Сообщения", bg: "#4ade80" },
  { label: "Музыка", bg: "#fb7185" },
];

export function AuroraScene({
  payload,
  choices,
  onChoice,
  onAdvance,
  onGo,
  onBack,
}: {
  payload: AuroraPayload;
  choices?: Choice[];
  onChoice: (choice: Choice) => void;
  onAdvance?: () => void;
  onGo?: (id: string) => void;
  onBack?: () => void;
}) {
  if (payload.mode === "lock" && payload.place) {
    const p = pSee(payload.place);
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 62% 8%, rgba(110,231,183,0.95), transparent 55%), radial-gradient(ellipse 70% 50% at 18% 28%, rgba(52,211,153,0.55), transparent 62%), radial-gradient(ellipse 50% 40% at 80% 45%, rgba(167,243,208,0.35), transparent 70%), linear-gradient(#12344a 0%, #1a5c4c 38%, #102830 70%, #0a1814 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(#fff 0.7px, transparent 0.8px), radial-gradient(#fff 0.45px, transparent 0.6px)",
            backgroundPosition: "14px 20px, 40px 36px",
            backgroundSize: "68px 68px, 44px 44px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative flex h-full flex-col px-3 pb-8 pt-8">
          <button
            type="button"
            onClick={onAdvance}
            className="animate-banner-in w-full rounded-[1.15rem] bg-white/22 px-3 py-2.5 text-left shadow-[0_8px_24px_rgba(0,0,0,0.28)] ring-1 ring-white/30 backdrop-blur-md"
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[0.7rem] bg-[#6ee7b7] text-[11px] font-bold text-[#052e1c]">
                С
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white">{payload.appName}</span>
                  <span className="text-[10px] text-white/70">сейчас</span>
                </div>
                <div className="mt-0.5 text-[13px] font-semibold text-white">
                  {payload.place.name} · {p}
                </div>
                <div className="text-[11px] text-white/80">Ясно и темно. Можно ехать.</div>
              </div>
            </div>
          </button>
          <div className="mt-4 grid grid-cols-4 gap-x-3 gap-y-3 px-1">
            {ICONS.map((icon) => (
              <div key={icon.label} className="flex flex-col items-center gap-1">
                <span className="h-10 w-10 rounded-[0.85rem] shadow-sm" style={{ background: icon.bg }} />
                <span className="text-[8px] text-white/90">{icon.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex justify-center gap-3 rounded-[1.4rem] bg-black/25 px-3 py-2.5 backdrop-blur">
            {DOCK.map((icon) => (
              <span key={icon.label} className="h-10 w-10 rounded-[0.85rem]" style={{ background: icon.bg }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (payload.mode === "home") {
    const nearest = payload.nearest;
    const probable = payload.probable;
    return (
      <div className="flex h-full w-full flex-col bg-[#121816]">
        <div className="grid grid-cols-2 gap-px bg-white/10">
          {nearest ? (
            <button
              type="button"
              onClick={() => onGo?.(`s3-${nearest.id}`)}
              className="bg-[#15201c] px-3 py-1.5 text-left"
            >
              <div className="text-[9px] uppercase tracking-[0.14em] text-[#9aa89f]">ближайшее</div>
              <div className="mt-0.5 flex items-baseline justify-between gap-1">
                <span className="text-[13px] font-semibold text-[#f3f6f4]">{nearest.name}</span>
                <span className="text-[11px] tabular-nums text-[#9aa89f]">{nearest.km} км</span>
              </div>
              <div
                className="flex items-baseline gap-0.5 text-[15px] font-semibold tabular-nums"
                style={{ color: tone(pSee(nearest)) }}
              >
                <ScoreMark n={pSee(nearest)} />
              </div>
            </button>
          ) : null}
          {probable ? (
            <button
              type="button"
              onClick={() => onGo?.(`s3-${probable.id}`)}
              className="bg-[#15201c] px-3 py-1.5 text-left"
            >
              <div className="text-[9px] uppercase tracking-[0.14em] text-[#9aa89f]">вероятнее</div>
              <div className="mt-0.5 flex items-baseline justify-between gap-1">
                <span className="text-[13px] font-semibold text-[#f3f6f4]">{probable.name}</span>
                <span className="text-[11px] tabular-nums text-[#9aa89f]">{probable.km} км</span>
              </div>
              <div
                className="flex items-baseline gap-0.5 text-[15px] font-semibold tabular-nums"
                style={{ color: tone(pSee(probable)) }}
              >
                <ScoreMark n={pSee(probable)} />
              </div>
            </button>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2">
          {payload.spots?.map((spot) => {
            const n = pSee(spot);
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => onGo?.(`s3-${spot.id}`)}
                className="relative block w-full overflow-hidden rounded-[1.1rem] text-left ring-1 ring-white/10"
              >
                <Photo kind={spot.kind} className="h-[92px] w-full" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8">
                  <span className="text-[16px] font-semibold text-white">{spot.name}</span>
                  <span className="text-[11px] tabular-nums text-white/80">{spot.km} км</span>
                </div>
                <span className="absolute right-2 top-2">
                  <Badge n={n} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (payload.mode === "place" && payload.place) {
    const place = payload.place;
    const n = pSee(place);
    return (
      <div className="flex h-full w-full flex-col bg-[#121816]">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Photo kind={place.kind} className="h-28 w-full" />
          <div className="px-3 pb-3 pt-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-[22px] font-semibold leading-none text-[#f3f6f4]">{place.name}</h1>
                <p className="mt-1 text-[12px] tabular-nums text-[#9aa89f]">{place.km} км</p>
              </div>
              <Badge n={n} onClick={() => onGo?.(`s4-${place.id}`)} />
            </div>
            <div className="mt-3 text-[9px] uppercase tracking-[0.14em] text-[#9aa89f]">последние разы</div>
            <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
              {place.nights.map((night) => {
                const seen = pSee(night);
                return (
                  <button
                    key={night.id}
                    type="button"
                    onClick={() => onGo?.(`s4-${place.id}-${night.id}`)}
                    className="shrink-0 rounded-[0.85rem] bg-[#24302c] px-2.5 py-1.5 text-left ring-1 ring-white/10"
                  >
                    <div className="text-[11px] text-[#e8eee9]">{night.label}</div>
                    <div
                      className="mt-0.5 flex items-baseline gap-0.5 text-[11px] font-semibold tabular-nums"
                      style={{ color: tone(seen) }}
                    >
                      <ScoreMark n={seen} />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 h-[92px] overflow-hidden rounded-[1.1rem] ring-1 ring-white/10">
              <MiniMap origin={payload.origin} place={place} />
            </div>
            <div className="mt-3">
              <div className="text-[9px] uppercase tracking-[0.14em] text-[#9aa89f]">отзывы</div>
              {place.reviews.map((review) => (
                <p key={review.who} className="mt-1.5 text-[12px] leading-snug text-[#c5d0c8]">
                  <span className="text-[#9fe1c3]">{review.who}.</span> {review.text}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="shrink-0 px-3 pb-3 pt-1">
          <button
            type="button"
            onClick={() => onGo?.(`s5-${place.id}`)}
            className="w-full rounded-full bg-[#e8eee9] py-2.5 text-[13px] font-semibold text-[#15201c]"
          >
            Маршрут
          </button>
        </div>
      </div>
    );
  }

  if (payload.mode === "analysis" && payload.place) {
    const src = payload.night ?? payload.place;
    const n = pSee(src);
    const clear = 100 - src.cloud;
    return (
      <div className="flex h-full w-full flex-col bg-[#121816] px-3 pb-3 pt-2">
        <button type="button" onClick={onBack ?? onAdvance} className="self-start text-[12px] text-[#9fe1c3]">
          ← {payload.place.name}
        </button>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="text-[11px] text-[#9aa89f]">
              {payload.night ? payload.night.label : "ближайшая ночь"}
            </div>
            <div className="text-[20px] font-semibold text-[#f3f6f4]">P-score</div>
          </div>
          <div
            className="flex items-baseline gap-0.5 text-[40px] font-semibold leading-none tabular-nums"
            style={{ color: tone(n) }}
          >
            <ScoreMark n={n} />
          </div>
        </div>
        <p className="mt-2 text-[12px] text-[#c5d0c8]">овал × ясность × темнота</p>
        <div className="mt-4 space-y-3">
          <Factor label="Овал NOAA/OVATION" value={`${src.oval}`} bar={src.oval} />
          <Factor label="Ясность" value={`${clear}%`} bar={clear} />
          <Factor label="Темнота" value={src.dark ? "ночь" : "светло"} bar={src.dark ? 100 : 8} />
          <Factor label="История" value={`${payload.place.nights.length} ночи видели`} bar={58} />
        </div>
        <p className="mt-4 text-[11px] leading-snug text-[#9aa89f]">
          Скрипт: овал накрывает место, нет низкой облачности, уже темно. Не Kp и не Bz.
        </p>
      </div>
    );
  }

  if ((payload.mode === "geo" || payload.mode === "from") && payload.place) {
    const share = choices?.find((c) => c.variant === "primary");
    const deny = choices?.find((c) => c.variant === "ghost");
    const fromMode = payload.mode === "from";
    return (
      <div className="flex h-full w-full flex-col bg-[#121816] px-3 pb-3 pt-3">
        <h1 className="text-[20px] font-semibold leading-tight text-[#f3f6f4]">Откуда ехать</h1>
        <p className="mt-1 text-[12px] text-[#9aa89f]">
          Гео только для маршрута. Отказ — точка вручную. Дальше всё от неё.
        </p>
        {!fromMode && share ? (
          <button
            type="button"
            onClick={() => onChoice(share)}
            className="mt-5 w-full rounded-full bg-[#e8eee9] py-2.5 text-[13px] font-semibold text-[#15201c]"
          >
            {share.label} гео
          </button>
        ) : null}
        {!fromMode && deny ? (
          <button
            type="button"
            onClick={() => onChoice(deny)}
            className="mt-2 w-full rounded-full bg-[#24302c] py-2.5 text-[13px] text-[#e8eee9]"
          >
            {deny.label}
          </button>
        ) : null}
        {fromMode ? (
          <button type="button" onClick={onAdvance} className="mt-5 w-full text-left">
            <div className="rounded-[1.1rem] bg-[#24302c] px-3 py-3 ring-1 ring-[#6ee7b7]/40">
              <div className="text-[9px] uppercase tracking-[0.14em] text-[#9aa89f]">откуда</div>
              <div className="mt-1 text-[16px] text-[#f3f6f4]">{payload.suggestion}</div>
            </div>
            <div className="mt-3 w-full rounded-full bg-[#e8eee9] py-2.5 text-center text-[13px] font-semibold text-[#15201c]">
              Дальше
            </div>
          </button>
        ) : null}
      </div>
    );
  }

  const place = payload.place;
  const origin = payload.origin;
  if (!place || !origin) return null;
  const ways: Way[] = origin.id === "spb" ? place.waysSpb : place.waysHere;
  const stays: Stay[] = place.hotels;
  return (
    <button type="button" onClick={onAdvance} className="flex h-full w-full flex-col bg-[#121816] text-left">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-2">
        <div className="text-[11px] text-[#9aa89f]">как оказаться</div>
        <h1 className="text-[20px] font-semibold text-[#f3f6f4]">{place.name}</h1>
        <div className="mt-1 text-[12px] text-[#c5d0c8]">
          {origin.name} → {place.name} · {payload.dates}
        </div>
        <div className="mt-3 h-[100px] overflow-hidden rounded-[1.1rem] ring-1 ring-white/10">
          <MiniMap origin={origin} place={place} track />
        </div>
        <div className="mt-3 text-[9px] uppercase tracking-[0.14em] text-[#9aa89f]">способы</div>
        {ways.map((way) => (
          <div key={way.title} className="py-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] text-[#f3f6f4]">{way.title}</span>
              <span className="shrink-0 text-[11px] tabular-nums text-[#9aa89f]">{way.duration}</span>
            </div>
            <div className="text-[11px] text-[#9aa89f]">{way.detail}</div>
          </div>
        ))}
        <div className="mt-2 text-[9px] uppercase tracking-[0.14em] text-[#9aa89f]">отели рядом</div>
        {stays.map((stay) => (
          <Row key={stay.name} title={stay.name} meta={stay.meta} />
        ))}
        <div className="mt-2 text-[9px] uppercase tracking-[0.14em] text-[#9aa89f]">еда рядом</div>
        {place.food.map((item) => (
          <Row key={item.name} title={item.name} meta={item.meta} />
        ))}
      </div>
    </button>
  );
}
