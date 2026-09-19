"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Choice } from "@demo/runtime";

type Tone = "teal" | "violet" | "amber";

type GoalCard = {
  id: string;
  name: string;
  done: number;
  total: number;
  tone: Tone;
  items?: OutlineItem[];
  startScene?: string;
  openScene?: string;
};

type OutlineItem = {
  id: string;
  label: string;
  depth: number;
  done?: boolean;
  added?: boolean;
};

type StepItem = {
  id: string;
  label: string;
  depth?: number;
  done?: boolean;
  added?: boolean;
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
    | "goal"
    | "ready"
    | "focus"
    | "summary"
    | "history";
  weekCount?: number;
  goals?: GoalCard[];
  last7?: CalendarDay[];
  historyScene?: string;
  goalName?: string;
  outline?: OutlineItem[];
  steps?: StepItem[];
  timer?: string;
  finishTo?: string;
  duration?: string;
  animateAdded?: boolean;
  calendarWeeks?: CalendarWeek[];
  homeScene?: string;
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
  fill = false,
}: {
  count: number;
  label: string;
  onClick?: () => void;
  size?: "sm" | "md";
  fill?: boolean;
}) {
  const box = fill
    ? "w-full aspect-square min-h-0 min-w-0 rounded-[2px]"
    : size === "md"
      ? "h-4 w-4 rounded-[3px]"
      : "h-3 w-3 rounded-[2px]";
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

function BackToGoals({ onClick }: { onClick?: () => void }) {
  if (!onClick) return <span />;
  return (
    <button
      type="button"
      onClick={onClick}
      className="pt-1 text-[11px] text-[#5eead4]"
    >
      Back to goals
    </button>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full w-full min-w-0 flex-col bg-[#111113] text-[#ececec]">
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 pt-1">{children}</div>
    </div>
  );
}

export function SquaresScene({
  payload,
  choices,
  onChoice,
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
    return <HomeView payload={payload} onGo={onGo} />;
  }

  if (payload.mode === "goal") {
    return (
      <GoalOutline
        title={payload.goalName ?? ""}
        items={payload.outline ?? []}
        onBack={payload.homeScene ? () => onGo(payload.homeScene!) : undefined}
        onStart={primary ? () => onChoice(primary) : undefined}
        animateAdded={payload.animateAdded}
      />
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
      <ConfirmSession
        payload={payload}
        primary={primary}
        onChoice={onChoice}
      />
    );
  }

  if (payload.mode === "history") {
    return (
      <HistoryView
        payload={payload}
        onHome={payload.homeScene ? () => onGo(payload.homeScene!) : undefined}
      />
    );
  }

  return null;
}

function HomeView({
  payload,
  onGo,
}: {
  payload: SquaresPayload;
  onGo: (id: string) => void;
}) {
  const [goals, setGoals] = useState<GoalCard[]>(() => payload.goals ?? []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const goHistory = payload.historyScene
    ? () => onGo(payload.historyScene!)
    : undefined;
  const open = goals.find((g) => g.id === openId);

  if (open) {
    return (
      <GoalOutline
        title={open.name}
        items={open.items ?? []}
        onBack={() => setOpenId(null)}
        onStart={open.startScene ? () => onGo(open.startScene!) : undefined}
        onItems={(items) =>
          setGoals((prev) =>
            prev.map((g) => (g.id === open.id ? { ...g, items } : g)),
          )
        }
      />
    );
  }

  function addGoal() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `g-${Date.now()}`;
    const goal: GoalCard = {
      id,
      name: trimmed,
      done: 0,
      total: 8,
      tone: "teal",
      items: [],
      startScene: "s3-ready",
    };
    setGoals((prev) => [goal, ...prev]);
    setName("");
    setModal(false);
    setOpenId(id);
  }

  return (
    <Shell>
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
        {goals.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() =>
              g.openScene ? onGo(g.openScene) : setOpenId(g.id)
            }
            className="w-full rounded-2xl bg-[#1c1c21] px-3 py-2.5 text-left ring-1 ring-white/5 active:scale-[0.99]"
          >
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
          </button>
        ))}
        <button
          type="button"
          aria-label="New goal"
          onClick={() => setModal(true)}
          className="flex w-full items-center justify-center rounded-2xl py-3.5 border border-dashed border-[#5eead4]/40"
        >
          <span className="text-[22px] leading-none text-[#5eead4]">+</span>
        </button>
      </div>
      {modal ? (
        <div className="absolute inset-0 z-30 flex items-end bg-black/55">
          <form
            className="w-full rounded-t-2xl bg-[#1c1c21] px-4 pb-5 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              addGoal();
            }}
          >
            <p className="text-[13px] font-medium">New goal</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="mt-3 w-full rounded-xl bg-[#111113] px-3 py-2.5 text-[13px] outline-none ring-1 ring-white/10 placeholder:text-[#6b7280]"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setModal(false);
                  setName("");
                }}
                className="flex-1 rounded-xl py-2.5 text-[13px] text-[#9aa0a6] ring-1 ring-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 rounded-xl bg-[#5eead4] py-2.5 text-[13px] font-semibold text-[#042f2e] disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </Shell>
  );
}

function PickTasks({
  title,
  items,
  selected,
  hideDone,
  onToggleHide,
  onToggle,
  onBack,
  onConfirm,
}: {
  title: string;
  items: OutlineItem[];
  selected: Record<string, boolean>;
  hideDone: boolean;
  onToggleHide: () => void;
  onToggle: (id: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const visible = hideDone ? items.filter((i) => !i.done) : items;
  const picked = items.filter((i) => selected[i.id] && !i.done).length;

  return (
    <Shell>
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] text-[#5eead4]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onToggleHide}
          className="text-[11px] text-[#9aa0a6]"
        >
          {hideDone ? "Show completed" : "Hide completed"}
        </button>
      </div>
      <p className="mt-2 text-[17px] font-semibold leading-snug tracking-tight">
        {title}
      </p>
      <p className="mt-1 text-[11px] text-[#9aa0a6]">Tap tasks for this session</p>
      <ul className="mt-3">
        {visible.map((s) => {
          const on = !!selected[s.id];
          const done = !!s.done;
          return (
            <li key={s.id} className="border-b border-white/5">
              <button
                type="button"
                disabled={done}
                aria-pressed={on}
                onClick={() => onToggle(s.id)}
                className={[
                  "-mx-3.5 flex w-[calc(100%+1.75rem)] items-center py-2.5 pr-3.5 text-left text-[13px] leading-snug",
                  on && !done ? "bg-[#5eead4]/15 text-[#5eead4]" : "",
                  done ? "text-[#6b7280] line-through" : "",
                ].join(" ")}
                style={{ paddingLeft: 14 + s.depth * 16 }}
              >
                {s.label}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        disabled={picked === 0}
        onClick={onConfirm}
        className={[
          "mt-2 w-full rounded-xl py-2.5 text-[13px] font-semibold active:scale-[0.98]",
          picked > 0
            ? "bg-[#5eead4] text-[#042f2e]"
            : "bg-[#1c1c21] text-[#6b7280]",
        ].join(" ")}
      >
        Next
      </button>
    </Shell>
  );
}

function GoalOutline({
  title,
  items: initial,
  onBack,
  onStart,
  onItems,
  animateAdded = false,
}: {
  title: string;
  items: OutlineItem[];
  onBack?: () => void;
  onStart?: () => void;
  onItems?: (items: OutlineItem[]) => void;
  animateAdded?: boolean;
}) {
  const [items, setItems] = useState<OutlineItem[]>(initial);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [hideDone, setHideDone] = useState(!animateAdded);
  const [picking, setPicking] = useState(false);
  const [phase, setPhase] = useState<"in" | "flash" | "done">(
    animateAdded ? "in" : "done",
  );
  const visible = hideDone ? items.filter((i) => !i.done) : items;
  const canPick = items.some((i) => !i.done);

  useEffect(() => {
    if (!animateAdded) return;
    const flash = window.setTimeout(() => setPhase("flash"), 30);
    const done = window.setTimeout(() => setPhase("done"), 700);
    return () => {
      window.clearTimeout(flash);
      window.clearTimeout(done);
    };
  }, [animateAdded]);

  function seedTasks() {
    if (items.length > 0) return;
    const next = [
      { id: "seed-1", label: "Task one", depth: 0 },
      { id: "seed-2", label: "Subtask A", depth: 1 },
      { id: "seed-3", label: "Subtask B", depth: 1 },
      { id: "seed-4", label: "Task two", depth: 0 },
    ];
    setItems(next);
    onItems?.(next);
  }

  function addRow() {
    if (items.length === 0) {
      seedTasks();
      return;
    }
    const next = [
      ...items,
      { id: `new-${items.length}`, label: "New task", depth: 0 },
    ];
    setItems(next);
    onItems?.(next);
  }

  if (picking) {
    return (
      <PickTasks
        title={title}
        items={items}
        selected={selected}
        hideDone={hideDone}
        onToggleHide={() => setHideDone((v) => !v)}
        onToggle={(id) =>
          setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
        }
        onBack={() => {
          setPicking(false);
          setSelected({});
        }}
        onConfirm={() => onStart?.()}
      />
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between gap-2 pt-1">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-[11px] text-[#5eead4]"
          >
            Back to goals
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setHideDone((v) => !v)}
          className="text-[11px] text-[#9aa0a6]"
        >
          {hideDone ? "Show completed" : "Hide completed"}
        </button>
      </div>
      <p className="mt-2 text-[17px] font-semibold leading-snug tracking-tight">
        {title}
      </p>
      <ul className="mt-3">
        {visible.map((s) => {
          const done = !!s.done;
          const added = animateAdded && !!s.added;
          return (
            <li key={s.id} className="border-b border-white/5">
              <div
                className={[
                  "-mx-3.5 flex items-center gap-2 py-2 pr-3.5 transition duration-500",
                  added && phase === "in" ? "translate-y-1 opacity-0" : "",
                  added && phase === "flash" ? "bg-[#5eead4]/15" : "",
                ].join(" ")}
                style={{ paddingLeft: 14 + s.depth * 16 }}
              >
                <button
                  type="button"
                  aria-label={done ? `Reopen ${s.label}` : `Complete ${s.label}`}
                  aria-pressed={done}
                  onClick={() => {
                    const next = items.map((i) =>
                      i.id === s.id ? { ...i, done: !i.done } : i,
                    );
                    setItems(next);
                    onItems?.(next);
                  }}
                  className="shrink-0"
                >
                  <span
                    className="inline-block h-4 w-4 rounded-[3px]"
                    style={{
                      background: done ? TONE.teal : "transparent",
                      boxShadow: `inset 0 0 0 1px ${done ? TONE.teal : "rgba(94,234,212,0.5)"}`,
                    }}
                  />
                </button>
                <input
                  value={s.label}
                  disabled={done}
                  aria-label={`Edit ${s.label}`}
                  onChange={(e) => {
                    const v = e.target.value;
                    const next = items.map((i) =>
                      i.id === s.id ? { ...i, label: v } : i,
                    );
                    setItems(next);
                    onItems?.(next);
                  }}
                  className={[
                    "min-w-0 flex-1 bg-transparent py-0.5 text-[13px] leading-snug outline-none",
                    done ? "text-[#6b7280] line-through" : "",
                  ].join(" ")}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={addRow}
        className="w-full px-2 py-2.5 text-left text-[13px] text-[#6b7280]"
      >
        List item
      </button>
      <button
        type="button"
        disabled={!canPick}
        onClick={() => {
          setSelected({});
          setPicking(true);
        }}
        className={[
          "mt-2 w-full rounded-xl py-2.5 text-[13px] font-semibold active:scale-[0.98]",
          canPick
            ? "bg-[#5eead4] text-[#042f2e]"
            : "bg-[#1c1c21] text-[#6b7280]",
        ].join(" ")}
      >
        Select for session
      </button>
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
  const initial = Number.parseInt(payload.timer ?? "20", 10) || 20;
  const [mins, setMins] = useState(initial);
  const presets = [15, 20, 25, 30];

  return (
    <Shell>
      <p className="pt-1 text-[11px] uppercase tracking-[0.16em] text-[#5eead4]">
        Ready
      </p>
      <p className="mt-2 text-center text-[13px] font-medium">
        {payload.goalName}
      </p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Minus 5 minutes"
          onClick={() => setMins((m) => Math.max(5, m - 5))}
          className="h-9 w-9 rounded-full text-[18px] text-[#9aa0a6] ring-1 ring-white/10"
        >
          −
        </button>
        <p className="font-[family-name:var(--font-display)] text-[48px] leading-none tabular-nums tracking-tight">
          {String(mins).padStart(2, "0")}:00
        </p>
        <button
          type="button"
          aria-label="Plus 5 minutes"
          onClick={() => setMins((m) => Math.min(60, m + 5))}
          className="h-9 w-9 rounded-full text-[18px] text-[#9aa0a6] ring-1 ring-white/10"
        >
          +
        </button>
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setMins(p)}
            className={[
              "rounded-full px-2.5 py-1 text-[11px]",
              mins === p
                ? "bg-[#5eead4] text-[#042f2e]"
                : "text-[#9aa0a6] ring-1 ring-white/10",
            ].join(" ")}
          >
            {p}m
          </button>
        ))}
      </div>
      <ul className="mt-6 space-y-1.5">
        {steps.map((s) => (
          <li
            key={s.id}
            className="text-[13px] leading-snug"
            style={{ paddingLeft: (s.depth ?? 0) * 16 }}
          >
            {s.label}
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
  const planned = steps.filter((s) => !s.added);
  const added = steps.filter((s) => s.added);
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(steps.map((s) => [s.id, !!s.done])),
  );
  const doneCount = steps.filter((s) => on[s.id]).length;

  function row(s: StepItem) {
    const checked = !!on[s.id];
    return (
      <li key={s.id}>
        <button
          type="button"
          aria-pressed={checked}
          onClick={() => setOn((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
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
  }

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
      <ul className="mt-4 space-y-2">{planned.map(row)}</ul>
      {added.length > 0 ? (
        <>
          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[#9aa0a6]">
            Added in session
          </p>
          <ul className="mt-2 space-y-2">{added.map(row)}</ul>
        </>
      ) : null}
      <p className="mt-3 text-center font-[family-name:var(--font-display)] text-[32px] leading-none tabular-nums text-[#5eead4]">
        +{doneCount}
      </p>
      <p className="mt-1 text-center text-[12px] text-[#9aa0a6]">squares</p>
      <button
        type="button"
        onClick={() => primary && onChoice(primary)}
        className="mt-4 w-full rounded-xl bg-[#5eead4] py-2.5 text-[13px] font-semibold text-[#042f2e] active:scale-[0.98]"
      >
        {primary?.label ?? "Confirm"}
      </button>
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
  const extras = ["Check breakpoints", "Fix nav wrap"];
  const outline = payload.outline ?? [];
  const [steps, setSteps] = useState<StepItem[]>(() => payload.steps ?? []);
  const [filled, setFilled] = useState<Record<string, boolean>>({});
  const [adjusting, setAdjusting] = useState(false);
  const [hideDone, setHideDone] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const extraIdx = steps.filter((s) => s.added).length;

  if (adjusting) {
    return (
      <PickTasks
        title={payload.goalName ?? ""}
        items={outline}
        selected={selected}
        hideDone={hideDone}
        onToggleHide={() => setHideDone((v) => !v)}
        onToggle={(id) =>
          setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
        }
        onBack={() => setAdjusting(false)}
        onConfirm={() => {
          const picked = outline
            .filter((i) => selected[i.id] && !i.done)
            .map((i) => ({
              id: i.id,
              label: i.label,
              depth: i.depth,
            }));
          const extraRows = steps.filter((s) => s.added);
          setSteps([...picked, ...extraRows]);
          setAdjusting(false);
        }}
      />
    );
  }

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
      <button
        type="button"
        aria-label="Timer done"
        onClick={onFinish}
        className="mt-3 w-full text-center font-[family-name:var(--font-display)] text-[40px] leading-none tabular-nums tracking-tight"
      >
        {payload.timer}
      </button>
      <ul className="mt-3 space-y-1.5">
        {steps.map((s) => {
          const on = !!filled[s.id];
          return (
            <li
              key={s.id}
              className={[
                "rounded-xl bg-[#1c1c21] ring-1",
                s.added ? "ring-[#5eead4]/35" : "ring-white/5",
              ].join(" ")}
              style={{ marginLeft: (s.depth ?? 0) * 12 }}
            >
              <div className="flex items-center gap-2 px-2.5 py-2">
                <button
                  type="button"
                  aria-label={s.label}
                  onClick={() =>
                    setFilled((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
                  }
                  className="shrink-0"
                >
                  <span
                    className="inline-block h-4 w-4 rounded-[3px] transition-colors"
                    style={{ background: on ? TONE.teal : "#2a2a32" }}
                  />
                </button>
                <input
                  value={s.label}
                  aria-label={`Rename ${s.label}`}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSteps((prev) =>
                      prev.map((row) =>
                        row.id === s.id ? { ...row, label: v } : row,
                      ),
                    );
                  }}
                  className={[
                    "min-w-0 flex-1 bg-transparent text-[13px] leading-snug outline-none",
                    on ? "text-[#9aa0a6] line-through" : "",
                  ].join(" ")}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {extraIdx < extras.length ? (
        <button
          type="button"
          onClick={() => {
            const label = extras[extraIdx];
            setSteps((prev) => [
              ...prev,
              { id: `add-${extraIdx}`, label, added: true, depth: 1 },
            ]);
          }}
          className="mt-1 w-full px-2.5 py-2.5 text-left text-[13px] text-[#6b7280]"
        >
          List item
        </button>
      ) : (
        <p className="mt-1 px-2.5 py-2.5 text-[13px] text-[#6b7280]">List item</p>
      )}
      {outline.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            setSelected(
              Object.fromEntries(
                steps.filter((s) => !s.added).map((s) => [s.id, true]),
              ),
            );
            setAdjusting(true);
          }}
          className="mt-1 w-full py-2 text-[12px] text-[#5eead4]"
        >
          Change selection
        </button>
      ) : null}
      <button
        type="button"
        onClick={onFinish}
        className="mt-3 w-full rounded-xl bg-[#1c1c21] py-2.5 text-[13px] font-semibold text-[#ececec] ring-1 ring-white/10 active:scale-[0.98]"
      >
        End early
      </button>
    </Shell>
  );
}

const DAY_ROWS = ["S", "M", "T", "W", "T", "F", "S"];

function HistoryView({
  payload,
  onHome,
}: {
  payload: SquaresPayload;
  onHome?: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const weeks = payload.calendarWeeks ?? [];
  const days = weeks.flatMap((w) => w.days);
  const open = days.find((d) => d.id === openId);
  const daysOn = days.filter((d) => d.count > 0).length;
  const cols = {
    gridTemplateColumns: `12px repeat(${weeks.length}, minmax(0, 1fr))`,
    gap: "3px",
  };

  if (open) {
    const groups = open.detail?.groups ?? [];
    return (
      <Shell>
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
    <Shell>
      <BackToGoals onClick={onHome} />
      <p className="mt-2 text-[15px] font-semibold tracking-tight">History</p>
      <p className="mt-1 text-[11px] text-[#9aa0a6]">
        {daysOn} days with squares · tap a day
      </p>
      <div className="mt-4 rounded-2xl bg-[#1c1c21] px-3 py-3 ring-1 ring-white/5">
        <div className="mb-2 grid items-end" style={cols}>
          <span />
          {weeks.map((w, i) => {
            const show = i === 0 || w.month !== weeks[i - 1]?.month;
            return (
              <span
                key={w.id}
                className="overflow-visible whitespace-nowrap text-left text-[8px] leading-none text-[#6b7280]"
              >
                {show ? w.month : ""}
              </span>
            );
          })}
        </div>
        <div className="flex flex-col gap-[3px]">
          {DAY_ROWS.map((_, rowIdx) => (
            <div key={rowIdx} className="grid items-center" style={cols}>
              <span className="text-[8px] text-[#6b7280]">
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
                    fill
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
    </Shell>
  );
}
