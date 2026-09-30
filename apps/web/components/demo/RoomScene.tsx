"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Choice } from "@demo/runtime";
import type {
  AgentSpot,
  ArtifactKind,
  RoomPayload,
  Stakeholder,
} from "@cases/room-mission";

const PEOPLE: { id: Stakeholder; label: string }[] = [
  { id: "po", label: "PO" },
  { id: "ux", label: "UX" },
  { id: "dev", label: "Dev" },
];

const KIND: Record<ArtifactKind, { label: string; chip: string }> = {
  decision: { label: "Decision", chip: "bg-amber-100 text-amber-950" },
  spec: { label: "Spec", chip: "bg-sky-100 text-sky-950" },
  design: { label: "Design", chip: "bg-violet-100 text-violet-950" },
  diff: { label: "Diff", chip: "bg-stone-200 text-stone-800" },
  verification: { label: "Check", chip: "bg-emerald-100 text-emerald-950" },
  copy: { label: "Copy", chip: "bg-orange-100 text-orange-950" },
};

function centerOf(board: HTMLElement, name: string) {
  const el = board.querySelector(`[data-spot="${name}"]`);
  if (!el) return null;
  const b = board.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
}

function useAgentFlight(agent: AgentSpot, motion: RoomPayload["agentMotion"]) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [glide, setGlide] = useState(false);

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const sequence: AgentSpot[] =
      motion === "arrive"
        ? ["pool", agent]
        : motion === "leave"
          ? ["pricing", "pool"]
          : motion === "glance"
            ? ["pool", "hero", "pool"]
            : [agent];

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const last = sequence[sequence.length - 1];
    let cancelled = false;
    const timers: number[] = [];

    const apply = (name: AgentSpot, withGlide: boolean) => {
      const next = boardRef.current && centerOf(boardRef.current, name);
      if (!next || cancelled) return;
      setGlide(withGlide);
      setPos(next);
    };

    const frame = window.requestAnimationFrame(() => {
      if (reduced || sequence.length === 1) {
        apply(last, false);
        return;
      }
      apply(sequence[0], false);
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        sequence.slice(1).forEach((name, index) => {
          timers.push(window.setTimeout(() => apply(name, true), 80 + index * 1280));
        });
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [agent, motion]);

  return { boardRef, pos, glide };
}

export function RoomScene({
  payload,
  choices,
  onChoice,
  onAdvance,
}: {
  payload: RoomPayload;
  choices?: Choice[];
  onChoice: (choice: Choice) => void;
  onAdvance?: () => void;
}) {
  const { boardRef, pos, glide } = useAgentFlight(payload.agent, payload.agentMotion);
  const missionFocus = payload.view === "mission";

  return (
    <div
      ref={boardRef}
      className="relative flex min-h-[560px] w-full max-w-[1080px] flex-col rounded-[28px] border border-white/10 bg-[#f6f4ef] text-stone-900 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    >
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-stone-200/80 px-4">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg leading-none">Prague</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-stone-500">Room · shared context</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-stone-500">
          <span>{payload.poolLabel}</span>
          <span
            data-spot="pool"
            className="block h-8 w-8 rounded-full border border-dashed border-stone-300 bg-stone-100"
          />
        </div>
      </header>

      <div className="grid grid-cols-[220px_minmax(0,1fr)_280px]">
        <section className={["flex flex-col border-r border-stone-200/80 p-3 transition-opacity duration-500", missionFocus ? "opacity-75" : "opacity-100"].join(" ")}>
          <p className="px-1 text-[11px] uppercase tracking-[0.14em] text-stone-500">Missions</p>
          <ul className="mt-2 space-y-2">
            {payload.missions.map((row) => {
              const selected = row.id === payload.openId;
              const openable = payload.view === "room" && row.id === "pricing" && !!onAdvance;
              const body = (
                <>
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{row.title}</span>
                    <span className="text-[10px] uppercase tracking-wide text-stone-500">{row.tone}</span>
                  </span>
                  <span className="mt-1 block text-[12px] text-stone-600">Gate · {row.gate}</span>
                  {row.note ? (
                    <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-950">
                      {row.note}
                    </span>
                  ) : null}
                </>
              );
              const className = [
                "block w-full rounded-2xl border px-3 py-2.5 text-left transition-colors",
                row.tone === "queued" ? "border-amber-400/70 bg-amber-50" : "",
                row.tone === "active" ? "border-emerald-700/30 bg-white" : "",
                row.tone === "done" ? "border-emerald-800/20 bg-emerald-50" : "",
                row.tone === "garbage" ? "border-rose-400/70 bg-rose-50" : "",
                selected ? "ring-2 ring-stone-900/80" : "",
              ].join(" ");
              if (openable) {
                return (
                  <li key={row.id}>
                    <button type="button" onClick={onAdvance} className={className}>
                      {body}
                    </button>
                  </li>
                );
              }
              return (
                <li key={row.id} className={["relative", className].join(" ")}>
                  {row.id === "hero" ? <span data-spot="hero" className="absolute right-2 top-2 h-3 w-3" /> : null}
                  {body}
                </li>
              );
            })}
          </ul>
        </section>

        <section className={["relative flex min-w-0 flex-col border-r border-stone-200/80 p-3 transition-opacity duration-500", missionFocus ? "opacity-100" : "opacity-60"].join(" ")}>
          <span data-spot="pricing" className="pointer-events-none absolute right-14 top-20 h-4 w-4" />
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Mission · playbook</p>
          </div>
          <ol className="relative mt-3 space-y-1">
            <span className="absolute bottom-2 left-[9px] top-2 w-px bg-stone-200" />
            {payload.steps.map((step) => (
              <li
                key={step.id}
                className={[
                  "relative flex items-center gap-2 rounded-xl px-1 py-1",
                  step.state === "added" ? "room-insert bg-orange-50" : "",
                  step.state === "current" ? "bg-white" : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "relative z-10 h-[18px] w-[18px] shrink-0 rounded-full border-2 border-[#f6f4ef]",
                    step.state === "done" ? "bg-emerald-700" : "",
                    step.state === "current" ? "room-pulse bg-emerald-600" : "",
                    step.state === "upcoming" ? "bg-stone-300" : "",
                    step.state === "added" ? "bg-orange-500" : "",
                  ].join(" ")}
                />
                <span className={["text-[13px]", step.state === "upcoming" ? "text-stone-400" : "text-stone-800"].join(" ")}>
                  {step.label}
                </span>
                {step.state === "added" ? (
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-orange-700">new</span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-4 px-1 text-[11px] uppercase tracking-[0.14em] text-stone-500">Artifacts</p>
          {payload.artifacts.length === 0 ? (
            <p className="mt-2 rounded-2xl border border-dashed border-stone-300 px-3 py-4 text-[13px] text-stone-500">
              Public trail. Nothing buried in a thread.
            </p>
          ) : (
            <ul className="mt-2 grid grid-cols-2 gap-2">
              {payload.artifacts.map((artifact) => (
                <li
                  key={artifact.id}
                  className="room-pop rounded-2xl border border-stone-200 bg-white px-2.5 py-2"
                  style={{ animationDelay: `${artifact.delay ?? 0}ms` }}
                >
                  <span className={["inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium", KIND[artifact.kind].chip].join(" ")}>
                    {KIND[artifact.kind].label}
                  </span>
                  <p className="mt-1 text-[13px] font-medium leading-tight">{artifact.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-stone-500">{artifact.detail}</p>
                </li>
              ))}
            </ul>
          )}
          {payload.stamp ? (
            <div
              className={[
                "room-stamp pointer-events-none absolute left-1/2 top-1/2 z-20 rounded-2xl border-4 px-5 py-2 font-[family-name:var(--font-display)] text-5xl uppercase tracking-wide",
                payload.stamp === "done"
                  ? "border-emerald-700 text-emerald-800"
                  : "border-rose-600 text-rose-700",
              ].join(" ")}
            >
              {payload.stamp}
            </div>
          ) : null}
        </section>

        <section className={["flex flex-col p-3 transition-opacity duration-500", missionFocus ? "opacity-100" : "opacity-60"].join(" ")}>
          <div key={payload.who} className="room-pop flex flex-col">
            <p className="px-1 text-[11px] uppercase tracking-[0.14em] text-stone-500">Private thread</p>
            <div className="mt-2 flex gap-1">
              {PEOPLE.map((person) => {
                const live = person.id === payload.who;
                return (
                  <span
                    key={person.id}
                    className={[
                      "rounded-full px-2 py-1 text-[11px] font-medium",
                      live ? "bg-stone-900 text-white" : "bg-stone-200/70 text-stone-400",
                    ].join(" ")}
                  >
                    {person.label}
                    {live ? "" : " · locked"}
                  </span>
                );
              })}
            </div>
            {payload.signal === "qq" ? (
              <p className="room-push mt-3 rounded-xl bg-emerald-800 px-3 py-2 text-[12px] font-medium text-white">
                QQ · answer now
              </p>
            ) : null}
            {payload.signal === "dq" ? (
              <p className="mt-3 rounded-xl bg-amber-100 px-3 py-2 text-[12px] font-medium text-amber-950">
                DQ · queued, agent released
              </p>
            ) : null}
            <div className="mt-3 flex flex-col gap-2">
              {payload.thread.length === 0 ? (
                <p className="rounded-2xl bg-stone-100 px-3 py-3 text-[13px] text-stone-500">
                  No shared chat. Each person talks to the agent alone.
                </p>
              ) : (
                payload.thread.map((line) => (
                  <p
                    key={line.id}
                    className={[
                      "room-pop max-w-[95%] rounded-2xl px-3 py-2 text-[13px] leading-snug",
                      line.from === "agent" ? "self-start bg-white text-stone-800 ring-1 ring-stone-200" : "self-end bg-stone-900 text-white",
                    ].join(" ")}
                    style={{ animationDelay: `${line.delay ?? 0}ms` }}
                  >
                    {line.tag ? (
                      <span className="mb-0.5 block text-[10px] uppercase tracking-[0.12em] opacity-70">{line.tag}</span>
                    ) : null}
                    {line.text}
                  </p>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {payload.callout ? (
        <p
          className="room-pop pointer-events-none absolute left-1/2 top-[4.5rem] z-30 -translate-x-1/2 rounded-full bg-stone-900 px-3 py-1.5 text-[12px] text-white shadow-lg"
          style={{ animationDelay: "760ms" }}
        >
          {payload.callout}
        </p>
      ) : null}

      {pos ? (
        <div
          className="pointer-events-none absolute z-40"
          style={{
            left: pos.x,
            top: pos.y,
            transform: "translate(-50%, -50%)",
            transition: glide
              ? "left 0.85s cubic-bezier(0.22, 1, 0.36, 1), top 0.85s cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
          }}
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-[11px] font-semibold text-white shadow-[0_10px_24px_rgba(6,78,59,0.35)]">
            <span className="room-pulse absolute inset-0 rounded-full" />
            Ai
          </span>
        </div>
      ) : null}

      {choices && choices.length > 0 ? (
        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-stone-200/80 px-3 py-2.5">
          {choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => onChoice(choice)}
              className={[
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium",
                choice.variant === "danger"
                  ? "bg-rose-700 text-white"
                  : "bg-emerald-800 text-white",
              ].join(" ")}
            >
              {choice.label}
            </button>
          ))}
        </footer>
      ) : onAdvance ? (
        <footer className="flex shrink-0 items-center justify-end border-t border-stone-200/80 px-3 py-2.5">
          <button
            type="button"
            onClick={onAdvance}
            className="rounded-full bg-stone-900 px-3.5 py-1.5 text-[13px] font-medium text-white"
          >
            {payload.continueLabel ?? "Continue"}
          </button>
        </footer>
      ) : (
        <footer className="h-2 shrink-0" />
      )}
    </div>
  );
}
