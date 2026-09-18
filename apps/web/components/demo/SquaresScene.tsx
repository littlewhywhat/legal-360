"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Choice } from "@demo/runtime";

type Tone = "teal" | "violet" | "amber";

type GoalCard = {
  id: string;
  name: string;
  done: number;
  total: number;
  tone: Tone;
  nextScene?: string;
};

type StepItem = {
  id: string;
  label: string;
  done?: boolean;
  tooBig?: boolean;
  splitInto?: StepItem[];
};

type DayGroup = {
  goal: string;
  items: string[];
  tone: Tone;
};

type CalendarDay = {
  id: string;
  label: string;
  name: string;
  count: number;
  detail?: {
    title: string;
    count: number;
    groups: DayGroup[];
  };
};

type CalendarWeek = {
  id: string;
  month: string;
  days: CalendarDay[];
};

type SquaresPayload = {
  mode:
    | "home"
    | "pick-steps"
    | "ready"
    | "focus"
    | "summary"
    | "history"
    | "insights";
  weekCount?: number;
  goals?: GoalCard[];
  last7?: CalendarDay[];
  historyScene?: string;
  goalName?: string;
  steps?: StepItem[];
  timer?: string;
  finishTo?: string;
  duration?: string;
  calendarWeeks?: CalendarWeek[];
  homeScene?: string;
  insightsScene?: string;
  lines?: string[];
};

const TONE: Record<Tone, string> = {
  teal: "#5eead4",
  violet: "#c4b5fd",
  amber: "#fbbf24",
};

const GH = ["#212226", "#1b3f39", "#2a6f62", "#3d9e88", "#5eead4"];

function ghLevel(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

function SquareGrid({
  done,
  total,
  tone,
  size = "sm",
  cols,
}: {
  done: number;
  total: number;
  tone: Tone;
  size?: "sm" | "md";
  cols?: number;
}) {
  const dim = size === "md" ? "h-3.5 w-3.5" : "h-1.5 w-1.5";
  const cells = Array.from({ length: total }, (_, i) => (
    <span
      key={i}
      className={`${dim} rounded-[1px] transition-colors duration-300`}
      style={{
        background: i < done ? TONE[tone] : "#3a3a44",
      }}
    />
  ));
  if (cols) {
    return (
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${cols}, 7px)` }}
      >
        {cells}
      </div>
    );
  }
  return <div className="flex flex-wrap gap-px">{cells}</div>;
}

function GhCell({
  count,
  label,
  onClick,
  size = "sm",
}: {
  count: number;
  label: string;
  onClick?: () => void;
  size?: "sm" | "md";
}) {
  const box = size === "md" ? "h-4 w-4 rounded-[3px]" : "h-3 w-3 rounded-[2px]";
  const cls = `${box} ${onClick ? "" : "pointer-events-none"}`;
  const style = { background: GH[ghLevel(count)] };
  if (!onClick) {
    return <span className={cls} style={style} />;
  }
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cls}
      style={style}
    />
  );
}

function WeekStrip({
  days,
  onOpen,
}: {
  days: CalendarDay[];
  onOpen?: () => void;
}) {
  const activeDays = days.filter((d) => d.count > 0).length;
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!onOpen}
      className="mt-3 w-full rounded-2xl bg-[#1c1c21] px-3 py-2.5 text-left ring-1 ring-white/5 disabled:opacity-50"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] font-medium">Last 7 days</p>
        <p className="text-[10px] tabular-nums text-[#9aa0a6]">
          {activeDays} days
        </p>
      </div>
      <div className="mt-2 flex items-end justify-between gap-1">
        {days.map((d) => (
          <div key={d.id} className="flex flex-1 flex-col items-center gap-1">
            <GhCell count={d.count} label={d.name} size="md" />
            <span className="text-[9px] text-[#6b7280]">{d.label}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

function TabBar({
  active,
  onHome,
  onHistory,
}: {
  active: "home" | "history";
  onHome?: () => void;
  onHistory?: () => void;
}) {
  return (
    <div className="mt-auto flex shrink-0 border-t border-white/5 bg-[#16161a]">
      {(
        [
          ["home", "Home", onHome],
          ["history", "History", onHistory],
        ] as const
      ).map(([id, label, handler]) => {
        const on = active === id;
        return (
          <button
            key={id}
            type="button"
            disabled={!on && !handler}
            onClick={handler}
            className={[
              "flex-1 py-2.5 text-[11px] font-medium tracking-wide",
              on ? "text-[#5eead4]" : "text-[#6b7280]",
              !on && !handler ? "opacity-40" : "",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Shell({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col bg-[#111113] text-[#ececec]">
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 pt-1">{children}</div>
      {footer}
    </div>
  );
}

export function SquaresScene({
  payload,
  choices,
  onChoice,
  onAdvance,
  onGo,
}: {
  payload: SquaresPayload;
  choices?: Choice[];
  onChoice: (choice: Choice) => void;
  onAdvance?: () => void;
  onGo: (id: string) => void;
}) {
  const primary = useMemo(
    () => choices?.find((c) => c.variant === "primary") ?? choices?.[0],
    [choices],
  );

  if (payload.mode === "home") {
    const goHistory = payload.historyScene
      ? () => onGo(payload.historyScene!)
      : undefined;
    return (
      <Shell
        footer={<TabBar active="home" onHistory={goHistory} />}
      >
        <div className="flex items-baseline justify-between pt-1">
          <p className="text-[15px] font-semibold tracking-tight">Squares</p>
          <p className="text-[11px] text-[#9aa0a6]">
            {payload.weekCount} this week
          </p>
        </div>
        <p className="mt-1 text-[11px] text-[#9aa0a6]">
          You moved forward. No streaks.
        </p>
        {payload.last7 ? (
          <WeekStrip days={payload.last7} onOpen={goHistory} />
        ) : null}
        <div className="mt-3 space-y-2">
          {payload.goals?.map((g) => {
            const open = g.nextScene ? () => onGo(g.nextScene!) : undefined;
            const body = (
              <>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[13px] font-medium leading-snug">{g.name}</p>
                  <p className="shrink-0 text-[10px] tabular-nums text-[#9aa0a6]">
                    {g.done}/{g.total}
                  </p>
                </div>
                <div className="mt-2">
                  <SquareGrid
                    done={g.done}
                    total={g.total}
                    tone={g.tone}
                    cols={8}
                  />
                </div>
              </>
            );
            const cls =
              "w-full rounded-2xl bg-[#1c1c21] px-3 py-2.5 text-left ring-1 ring-white/5";
            if (open) {
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={open}
                  className={`${cls} active:scale-[0.99]`}
                >
                  {body}
                </button>
              );
            }
            return (
              <div key={g.id} className={cls}>
                {body}
              </div>
            );
          })}
        </div>
      </Shell>
    );
  }

  if (payload.mode === "pick-steps") {
    return (
      <PickSteps payload={payload} primary={primary} onChoice={onChoice} />
    );
  }

  if (payload.mode === "ready") {
    return (
      <ReadyTimer payload={payload} primary={primary} onChoice={onChoice} />
    );
  }

  if (payload.mode === "focus") {
    return (
      <FocusMode
        payload={payload}
        onFinish={() => payload.finishTo && onGo(payload.finishTo)}
      />
    );
  }

  if (payload.mode === "summary") {
    return (
      <ConfirmSession payload={payload} primary={primary} onChoice={onChoice} />
    );
  }

  if (payload.mode === "history") {
    return (
      <HistoryView
        payload={payload}
        onHome={payload.homeScene ? () => onGo(payload.homeScene!) : undefined}
        onInsights={
          payload.insightsScene
            ? () => onGo(payload.insightsScene!)
            : undefined
        }
      />
    );
  }

  if (payload.mode === "insights") {
    return (
      <Shell
        footer={
          <TabBar
            active="history"
            onHome={payload.homeScene ? () => onGo(payload.homeScene!) : undefined}
          />
        }
      >
        <p className="pt-1 text-[15px] font-semibold tracking-tight">Insights</p>
        <p className="mt-1 text-[11px] text-[#9aa0a6]">From your squares</p>
        <div className="mt-3 space-y-2">
          {payload.lines?.map((line) => (
            <div
              key={line}
              className="rounded-2xl bg-[#1c1c21] px-3 py-3 text-[13px] leading-snug ring-1 ring-white/5"
            >
              {line}
            </div>
          ))}
        </div>
        {onAdvance ? (
          <button
            type="button"
            onClick={onAdvance}
            className="mt-4 w-full rounded-xl bg-[#1c1c21] py-2.5 text-[13px] font-medium text-[#5eead4] ring-1 ring-[#5eead4]/30"
          >
            Replay
          </button>
        ) : null}
      </Shell>
    );
  }

  return null;
}

function PickSteps({
  payload,
  primary,
  onChoice,
}: {
  payload: SquaresPayload;
  primary?: Choice;
  onChoice: (choice: Choice) => void;
}) {
  const steps = payload.steps ?? [];
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(steps.map((s) => [s.id, true])),
  );
  const picked = steps.filter((s) => on[s.id]).length;

  return (
    <Shell>
      <p className="pt-1 text-[11px] uppercase tracking-[0.16em] text-[#5eead4]">
        Focus
      </p>
      <p className="mt-2 text-[17px] font-semibold leading-snug tracking-tight">
        Choose squares
      </p>
      {payload.goalName ? (
        <p className="mt-1 text-[11px] text-[#9aa0a6]">{payload.goalName}</p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {steps.map((s) => {
          const checked = !!on[s.id];
          return (
            <li key={s.id}>
              <button
                type="button"
                aria-pressed={checked}
                onClick={() =>
                  setOn((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
                }
                className="flex w-full items-center gap-2 rounded-2xl bg-[#1c1c21] px-3 py-3 text-left ring-1 ring-white/5"
              >
                <span
                  className="inline-block h-4 w-4 shrink-0 rounded-[3px] ring-1"
                  style={{
                    background: checked ? TONE.teal : "transparent",
                    boxShadow: `inset 0 0 0 1px ${checked ? TONE.teal : "#5eead4"}`,
                  }}
                />
                <span className="min-w-0 flex-1 text-[13px] leading-snug">
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-center text-[11px] tabular-nums text-[#9aa0a6]">
        {picked}/{steps.length} this session
      </p>
      {primary ? (
        <button
          type="button"
          disabled={picked === 0}
          onClick={() => onChoice(primary)}
          className={[
            "mt-3 w-full rounded-xl py-2.5 text-[13px] font-semibold active:scale-[0.98]",
            picked > 0
              ? "bg-[#5eead4] text-[#042f2e]"
              : "bg-[#1c1c21] text-[#6b7280]",
          ].join(" ")}
        >
          {primary.label}
        </button>
      ) : null}
    </Shell>
  );
}

function ReadyTimer({
  payload,
  primary,
  onChoice,
}: {
  payload: SquaresPayload;
  primary?: Choice;
  onChoice: (choice: Choice) => void;
}) {
  const steps = payload.steps ?? [];
  return (
    <Shell>
      <p className="pt-1 text-[11px] uppercase tracking-[0.16em] text-[#5eead4]">
        Ready
      </p>
      <p className="mt-2 text-center text-[13px] font-medium">
        {payload.goalName}
      </p>
      <p className="mt-8 text-center font-[family-name:var(--font-display)] text-[48px] leading-none tabular-nums tracking-tight">
        {payload.timer}
      </p>
      <ul className="mt-6 space-y-1.5">
        {steps.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-[13px]">
            <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-[3px] ring-1 ring-[#5eead4]/50" />
            <span className="min-w-0 flex-1 leading-snug">{s.label}</span>
          </li>
        ))}
      </ul>
      {primary ? (
        <button
          type="button"
          onClick={() => onChoice(primary)}
          className="mt-4 w-full rounded-xl bg-[#5eead4] py-2.5 text-[13px] font-semibold text-[#042f2e] active:scale-[0.98]"
        >
          {primary.label}
        </button>
      ) : null}
    </Shell>
  );
}

function ConfirmSession({
  payload,
  primary,
  onChoice,
}: {
  payload: SquaresPayload;
  primary?: Choice;
  onChoice: (choice: Choice) => void;
}) {
  const steps = payload.steps ?? [];
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(steps.map((s) => [s.id, !!s.done])),
  );
  const doneCount = steps.filter((s) => on[s.id]).length;

  return (
    <Shell>
      <p className="pt-2 text-[11px] uppercase tracking-[0.16em] text-[#5eead4]">
        Session
      </p>
      <p className="mt-2 text-[22px] font-semibold tracking-tight">
        What did you finish?
      </p>
      {payload.goalName ? (
        <p className="mt-1 text-[11px] text-[#9aa0a6]">{payload.goalName}</p>
      ) : null}
      {payload.duration ? (
        <p className="text-[11px] tabular-nums text-[#9aa0a6]">
          {payload.duration}
        </p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {steps.map((s) => {
          const checked = !!on[s.id];
          return (
            <li key={s.id}>
              <button
                type="button"
                aria-pressed={checked}
                onClick={() =>
                  setOn((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
                }
                className="flex w-full items-center gap-2 rounded-2xl bg-[#1c1c21] px-3 py-3 text-left ring-1 ring-white/5"
              >
                <span
                  className="inline-block h-4 w-4 shrink-0 rounded-[3px]"
                  style={{
                    background: checked ? TONE.teal : "transparent",
                    boxShadow: `inset 0 0 0 1px ${checked ? TONE.teal : "rgba(94,234,212,0.5)"}`,
                  }}
                />
                <span
                  className={[
                    "min-w-0 flex-1 text-[13px] leading-snug",
                    checked ? "" : "text-[#9aa0a6]",
                  ].join(" ")}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-center font-[family-name:var(--font-display)] text-[32px] leading-none tabular-nums text-[#5eead4]">
        +{doneCount}
      </p>
      <p className="mt-1 text-center text-[12px] text-[#9aa0a6]">squares</p>
      {primary ? (
        <button
          type="button"
          onClick={() => onChoice(primary)}
          className="mt-4 w-full rounded-xl bg-[#5eead4] py-2.5 text-[13px] font-semibold text-[#042f2e] active:scale-[0.98]"
        >
          {primary.label}
        </button>
      ) : null}
    </Shell>
  );
}

function FocusMode({
  payload,
  onFinish,
}: {
  payload: SquaresPayload;
  onFinish: () => void;
}) {
  const [steps, setSteps] = useState<StepItem[]>(() => payload.steps ?? []);
  const [filled, setFilled] = useState<Record<string, boolean>>({});
  const filledCount = steps.filter((s) => filled[s.id]).length;
  const remaining = steps.length - filledCount;

  return (
    <Shell>
      <div className="flex items-baseline justify-between pt-1">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#5eead4]">
          Focus
        </p>
        <p className="truncate pl-2 text-[11px] text-[#9aa0a6]">
          {payload.goalName}
        </p>
      </div>
      <p className="mt-3 text-center font-[family-name:var(--font-display)] text-[40px] leading-none tabular-nums tracking-tight">
        {payload.timer}
      </p>
      <ul className="mt-3 space-y-1.5">
        {steps.map((s) => {
          const on = !!filled[s.id];
          return (
            <li
              key={s.id}
              className="rounded-xl bg-[#1c1c21] ring-1 ring-white/5"
            >
              <div className="flex items-center gap-2 px-2.5 py-2">
                <button
                  type="button"
                  onClick={() =>
                    setFilled((prev) => ({ ...prev, [s.id]: true }))
                  }
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-label={s.label}
                >
                  <span
                    className="inline-block h-4 w-4 shrink-0 rounded-[3px] transition-colors"
                    style={{ background: on ? TONE.teal : "#2a2a32" }}
                  />
                  <span
                    className={[
                      "min-w-0 text-[13px] leading-snug",
                      on ? "text-[#9aa0a6] line-through" : "",
                    ].join(" ")}
                  >
                    {s.label}
                  </span>
                </button>
                {s.tooBig && !on ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = s.splitInto ?? [];
                      if (next.length === 0) return;
                      setSteps((prev) =>
                        prev.flatMap((row) => (row.id === s.id ? next : [row])),
                      );
                      setFilled((prev) => {
                        const copy = { ...prev };
                        delete copy[s.id];
                        return copy;
                      });
                    }}
                    className="shrink-0 rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[#fbbf24] ring-1 ring-[#fbbf24]/40"
                  >
                    Split
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-center text-[11px] tabular-nums text-[#9aa0a6]">
        {filledCount}/{steps.length}
        {remaining > 0 ? ` · ${remaining} open` : " · session squares done"}
      </p>
      <button
        type="button"
        onClick={onFinish}
        className={[
          "mt-3 w-full rounded-xl py-2.5 text-[13px] font-semibold active:scale-[0.98]",
          filledCount > 0
            ? "bg-[#5eead4] text-[#042f2e]"
            : "bg-[#1c1c21] text-[#9aa0a6] ring-1 ring-white/10",
        ].join(" ")}
      >
        End session
      </button>
    </Shell>
  );
}

const DAY_ROWS = ["S", "M", "T", "W", "T", "F", "S"];

function HistoryView({
  payload,
  onHome,
  onInsights,
}: {
  payload: SquaresPayload;
  onHome?: () => void;
  onInsights?: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const weeks = payload.calendarWeeks ?? [];
  const days = weeks.flatMap((w) => w.days);
  const open = days.find((d) => d.id === openId);
  const daysOn = days.filter((d) => d.count > 0).length;

  if (open) {
    const groups = open.detail?.groups ?? [];
    return (
      <Shell footer={<TabBar active="history" onHome={onHome} />}>
        <button
          type="button"
          onClick={() => setOpenId(null)}
          className="pt-1 text-[11px] text-[#5eead4]"
        >
          Back
        </button>
        <p className="mt-2 text-[18px] font-semibold tracking-tight">
          {open.detail?.title ?? open.name}
        </p>
        <p className="mt-1 text-[12px] tabular-nums text-[#9aa0a6]">
          {open.count} {open.count === 1 ? "square" : "squares"}
        </p>
        {groups.length > 0 ? (
          <div className="mt-3 space-y-2.5">
            {groups.map((g) => (
              <div
                key={g.goal}
                className="rounded-2xl bg-[#1c1c21] px-3 py-3 ring-1 ring-white/5"
              >
                <p className="text-[11px] text-[#9aa0a6]">
                  {g.goal}
                  <span className="mx-1">·</span>
                  {g.items.length}
                </p>
                <ul className="mt-1.5 space-y-1 text-[12px]">
                  {g.items.map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-[1px]"
                        style={{ background: TONE[g.tone] }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-[12px] text-[#6b7280]">
            {open.count > 0
              ? "You showed up this day."
              : "No squares this day."}
          </p>
        )}
      </Shell>
    );
  }

  return (
    <Shell footer={<TabBar active="history" onHome={onHome} />}>
      <p className="pt-1 text-[15px] font-semibold tracking-tight">History</p>
      <p className="mt-1 text-[11px] text-[#9aa0a6]">
        {daysOn} days with squares · tap a day
      </p>
      <div className="mt-4 rounded-2xl bg-[#1c1c21] px-3 py-3 ring-1 ring-white/5">
        <div className="mb-2 flex gap-1.5 pl-5">
          {weeks.map((w, i) => {
            const show = i === 0 || w.month !== weeks[i - 1]?.month;
            return (
              <span
                key={w.id}
                className="w-3 text-center text-[8px] text-[#6b7280]"
              >
                {show ? w.month : ""}
              </span>
            );
          })}
        </div>
        <div className="flex flex-col gap-1">
          {DAY_ROWS.map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-1.5">
              <span className="w-3.5 text-[8px] text-[#6b7280]">
                {rowIdx === 1 || rowIdx === 3 || rowIdx === 5
                  ? DAY_ROWS[rowIdx]
                  : ""}
              </span>
              {weeks.map((w) => {
                const day = w.days[rowIdx];
                return (
                  <GhCell
                    key={`${w.id}-${day.id}`}
                    count={day.count}
                    label={`${day.name}, ${day.count} squares`}
                    onClick={() => setOpenId(day.id)}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1 text-[9px] text-[#6b7280]">
          Less
          {GH.map((c, i) => (
            <span
              key={c}
              className="h-2.5 w-2.5 rounded-[2px]"
              style={{ background: GH[i] }}
            />
          ))}
          More
        </div>
      </div>
      {onInsights ? (
        <button
          type="button"
          onClick={onInsights}
          className="mt-3 w-full rounded-xl bg-[#1c1c21] py-2.5 text-[13px] font-medium text-[#5eead4] ring-1 ring-[#5eead4]/30"
        >
          Insights
        </button>
      ) : null}
    </Shell>
  );
}
