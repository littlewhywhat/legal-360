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
};

type StepItem = {
  id: string;
  label: string;
  done?: boolean;
};

type WeekChip = {
  id: string;
  label: string;
  active?: boolean;
};

type Peek = {
  action: string;
  goal: string;
  task: string;
  when: string;
  session: string;
};

type SquaresPayload = {
  mode:
    | "home"
    | "quiz-goal"
    | "quiz-task"
    | "quiz-steps"
    | "focus"
    | "summary"
    | "history"
    | "insights";
  weekCount?: number;
  goals?: GoalCard[];
  historyEnabled?: boolean;
  startEnabled?: boolean;
  question?: string;
  options?: { id: string; label: string; detail?: string }[];
  goalName?: string;
  taskName?: string;
  steps?: StepItem[];
  timer?: string;
  finishTo?: string;
  added?: number;
  duration?: string;
  progressBefore?: string;
  progressAfter?: string;
  completed?: string[];
  weeks?: WeekChip[];
  days?: string[];
  heatmap?: number[][];
  peek?: Peek;
  homeScene?: string;
  lines?: string[];
};

const TONE: Record<Tone, string> = {
  teal: "#5eead4",
  violet: "#c4b5fd",
  amber: "#fbbf24",
};

const HEAT = ["#2a2a32", "#5eead4", "#c4b5fd", "#fbbf24"];

function SquareGrid({
  done,
  total,
  tone,
  size = "sm",
}: {
  done: number;
  total: number;
  tone: Tone;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "h-4 w-4" : "h-2.5 w-2.5";
  return (
    <div className="flex flex-wrap gap-0.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`${dim} rounded-[2px] transition-colors duration-300`}
          style={{ background: i < done ? TONE[tone] : "#2a2a32" }}
        />
      ))}
    </div>
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
    return (
      <Shell
        footer={
          <TabBar
            active="home"
            onHistory={
              payload.historyEnabled && onAdvance ? onAdvance : undefined
            }
          />
        }
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
        <div className="mt-3 space-y-2">
          {payload.goals?.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl bg-[#1c1c21] px-3 py-2.5 ring-1 ring-white/5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[13px] font-medium leading-snug">{g.name}</p>
                <p className="shrink-0 text-[10px] tabular-nums text-[#9aa0a6]">
                  {g.done}/{g.total}
                </p>
              </div>
              <div className="mt-2">
                <SquareGrid done={g.done} total={g.total} tone={g.tone} />
              </div>
            </div>
          ))}
        </div>
        {payload.startEnabled === false ? null : (
          <button
            type="button"
            onClick={onAdvance}
            className="mt-3 w-full rounded-xl bg-[#5eead4] py-2.5 text-[13px] font-semibold text-[#042f2e] active:scale-[0.98]"
          >
            Start Focus
          </button>
        )}
      </Shell>
    );
  }

  if (
    payload.mode === "quiz-goal" ||
    payload.mode === "quiz-task" ||
    payload.mode === "quiz-steps"
  ) {
    return (
      <Shell>
        <p className="pt-1 text-[11px] uppercase tracking-[0.16em] text-[#5eead4]">
          Focus
        </p>
        <p className="mt-2 text-[17px] font-semibold leading-snug tracking-tight">
          {payload.question}
        </p>
        {payload.goalName ? (
          <p className="mt-1 text-[11px] text-[#9aa0a6]">{payload.goalName}</p>
        ) : null}
        {payload.taskName ? (
          <p className="text-[11px] text-[#9aa0a6]">{payload.taskName}</p>
        ) : null}
        <div className="mt-4 space-y-2">
          {payload.options?.map((opt) => {
            const choice = choices?.find((c) => c.id === opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                disabled={!choice}
                onClick={() => choice && onChoice(choice)}
                className={[
                  "w-full rounded-2xl px-3 py-3 text-left ring-1",
                  choice
                    ? "bg-[#1c1c21] ring-[#5eead4]/40"
                    : "bg-[#16161a] ring-white/5 opacity-50",
                ].join(" ")}
              >
                <p className="text-[13px] font-medium">{opt.label}</p>
                {opt.detail ? (
                  <p className="mt-0.5 text-[11px] text-[#9aa0a6]">{opt.detail}</p>
                ) : null}
              </button>
            );
          })}
          {payload.steps ? (
            <div className="rounded-2xl bg-[#1c1c21] px-3 py-3 ring-1 ring-white/5">
              <div className="mb-3">
                <SquareGrid
                  done={0}
                  total={payload.steps.length}
                  tone="teal"
                  size="md"
                />
              </div>
              <ul className="space-y-2">
                {payload.steps.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-[13px]">
                    <span className="inline-block h-3.5 w-3.5 rounded-[3px] ring-1 ring-[#5eead4]/50" />
                    {s.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        {payload.mode === "quiz-steps" && primary ? (
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
      <Shell>
        <p className="pt-2 text-[11px] uppercase tracking-[0.16em] text-[#5eead4]">
          Session
        </p>
        <p className="mt-2 text-[22px] font-semibold tracking-tight">
          You moved forward
        </p>
        <p className="mt-3 font-[family-name:var(--font-display)] text-[40px] leading-none tabular-nums text-[#5eead4]">
          +{payload.added}
        </p>
        <p className="mt-1 text-[12px] text-[#9aa0a6]">squares</p>
        <div className="mt-4 rounded-2xl bg-[#1c1c21] px-3 py-3 text-[12px] ring-1 ring-white/5">
          <p className="font-medium">{payload.goalName}</p>
          <p className="mt-1 tabular-nums text-[#9aa0a6]">
            {payload.progressBefore} → {payload.progressAfter}
            <span className="mx-1.5">·</span>
            {payload.duration}
          </p>
          <ul className="mt-3 space-y-1.5 text-[#ececec]">
            {payload.completed?.map((line) => (
              <li key={line} className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-[2px]"
                  style={{ background: TONE.teal }}
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
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

  if (payload.mode === "history") {
    return (
      <HistoryView
        payload={payload}
        onHome={payload.homeScene ? () => onGo(payload.homeScene!) : undefined}
        onInsights={onAdvance}
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

function FocusMode({
  payload,
  onFinish,
}: {
  payload: SquaresPayload;
  onFinish: () => void;
}) {
  const steps = payload.steps ?? [];
  const [filled, setFilled] = useState<Record<string, boolean>>({});
  const filledCount = steps.filter((s) => filled[s.id]).length;
  const current = steps.find((s) => !filled[s.id]);

  return (
    <Shell>
      <div className="flex items-baseline justify-between pt-1">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#5eead4]">
          Focus
        </p>
        <p className="text-[11px] text-[#9aa0a6]">{payload.taskName}</p>
      </div>
      <p className="mt-6 text-center font-[family-name:var(--font-display)] text-[52px] leading-none tabular-nums tracking-tight">
        {payload.timer}
      </p>
      <p className="mt-2 text-center text-[12px] text-[#9aa0a6]">
        Timer ≠ a square
      </p>
      <p className="mt-6 text-center text-[14px] font-medium">
        {current ? current.label : "All four filled"}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        {steps.map((s) => {
          const on = !!filled[s.id];
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilled((prev) => ({ ...prev, [s.id]: true }))}
              className="h-9 w-9 rounded-md transition-transform active:scale-95"
              style={{ background: on ? TONE.teal : "#2a2a32" }}
              aria-label={s.label}
            />
          );
        })}
      </div>
      <p className="mt-2 text-center text-[11px] tabular-nums text-[#9aa0a6]">
        {filledCount}/{steps.length}
      </p>
      {filledCount === steps.length ? (
        <button
          type="button"
          onClick={onFinish}
          className="mt-6 w-full rounded-xl bg-[#5eead4] py-2.5 text-[13px] font-semibold text-[#042f2e] active:scale-[0.98]"
        >
          End session
        </button>
      ) : (
        <p className="mt-6 text-center text-[11px] text-[#6b7280]">
          Fill the squares as you go
        </p>
      )}
    </Shell>
  );
}

function HistoryView({
  payload,
  onHome,
  onInsights,
}: {
  payload: SquaresPayload;
  onHome?: () => void;
  onInsights?: () => void;
}) {
  const [peekOn, setPeekOn] = useState(false);
  const rows = payload.heatmap ?? [];
  const days = payload.days ?? [];

  return (
    <Shell
      footer={<TabBar active="history" onHome={onHome} />}
    >
      <p className="pt-1 text-[15px] font-semibold tracking-tight">History</p>
      <p className="mt-1 text-[11px] text-[#9aa0a6]">15-min squares · W37</p>
      <div className="mt-3 flex gap-1.5">
        {payload.weeks?.map((w) => (
          <span
            key={w.id}
            className={[
              "rounded-full px-2.5 py-1 text-[11px] font-medium",
              w.active
                ? "bg-[#5eead4] text-[#042f2e]"
                : "bg-[#1c1c21] text-[#9aa0a6] ring-1 ring-white/5",
            ].join(" ")}
          >
            {w.label}
          </span>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-[#1c1c21] px-2.5 py-3 ring-1 ring-white/5">
        <div className="mb-1.5 grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            <span
              key={`${d}-${i}`}
              className="text-center text-[9px] text-[#6b7280]"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {rows.flatMap((row, r) =>
            row.map((cell, c) => {
              const peekCell = r === 3 && c === 3 && cell > 0;
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  disabled={!peekCell}
                  onClick={() => peekCell && setPeekOn(true)}
                  className="aspect-square w-full rounded-[2px]"
                  style={{ background: HEAT[cell] ?? HEAT[0] }}
                />
              );
            }),
          )}
        </div>
      </div>
      {peekOn && payload.peek ? (
        <div className="mt-3 rounded-2xl bg-[#1c1c21] px-3 py-3 text-[12px] ring-1 ring-[#5eead4]/30">
          <p className="text-[13px] font-medium">{payload.peek.action}</p>
          <p className="mt-1 text-[#9aa0a6]">{payload.peek.goal}</p>
          <p className="text-[#9aa0a6]">{payload.peek.task}</p>
          <p className="mt-2 text-[#9aa0a6]">
            {payload.peek.when}
            <span className="mx-1.5">·</span>
            {payload.peek.session}
          </p>
        </div>
      ) : null}
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
