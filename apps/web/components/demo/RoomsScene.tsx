"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Choice } from "@demo/runtime";

type FilterId = "all" | "qq" | "dq" | "play";

type ListRow = {
  id: string;
  filter: "qq" | "dq" | "play";
  room: string;
  title: string;
  detail: string;
};

type Person = {
  id: string;
  name: string;
  role: string;
  lang: string;
  line: string;
  agent: string;
};

type Agent = { name: string; state: "free" | "busy"; on?: string };

type StepState = { label: string; state: "done" | "now" | "next" };

type RoomOpt = { id: string; name: string; context: string };
type BookOpt = { id: string; name: string; steps: string[]; artifact: string };

type RoomsPayload = {
  mode: "list" | "qq" | "dq" | "watch" | "create" | "boot" | "checkpoint" | "end" | "result";
  you?: string;
  role?: string;
  rooms?: string[] | RoomOpt[];
  rows?: ListRow[];
  room?: string;
  mission?: string;
  lang?: string;
  agent?: string;
  prompt?: string;
  poolNote?: string;
  slot?: string;
  with?: string;
  ask?: string;
  context?: string;
  youId?: string;
  steps?: StepState[] | string[];
  artifacts?: string[];
  agents?: Agent[];
  people?: Person[];
  books?: BookOpt[];
  playbook?: string;
  artifact?: string;
  insert?: string;
  tone?: "done" | "garbage";
  headline?: string;
  detail?: string;
};

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "qq", label: "QQ" },
  { id: "dq", label: "DQ" },
  { id: "play", label: "In play" },
];

function pickChoice(choices: Choice[] | undefined, id: string) {
  return choices?.find((choice) => choice.id === id);
}

function kindStyle(filter: ListRow["filter"]) {
  if (filter === "qq") return "bg-[#d1fae5] text-[#065f46]";
  if (filter === "dq") return "bg-[#fef3c7] text-[#92400e]";
  return "bg-[#e2e8f0] text-[#334155]";
}

function kindLabel(filter: ListRow["filter"]) {
  if (filter === "qq") return "QQ";
  if (filter === "dq") return "DQ";
  return "In play";
}

function Pool({
  agents,
  note,
}: {
  agents: Agent[];
  note?: string;
}) {
  return (
    <div className="rounded-lg bg-[#f4f7f5] px-2.5 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
        Agent pool
      </div>
      <ul className="mt-1 space-y-1">
        {agents.map((agent) => (
          <li key={agent.name} className="flex items-center gap-1.5 text-[11px] text-[#1f2937]">
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                agent.state === "busy" ? "animate-soft-pulse bg-[#059669]" : "bg-[#9ca3af]",
              ].join(" ")}
            />
            <span className="font-medium">{agent.name}</span>
            <span className="text-[#6b7280]">
              {agent.state === "busy" ? `on ${agent.on}` : "free"}
            </span>
          </li>
        ))}
      </ul>
      {note ? <p className="mt-1 text-[10px] text-[#6b7280]">{note}</p> : null}
    </div>
  );
}

function StepRail({ labels, active }: { labels: string[]; active?: string }) {
  return (
    <ol className="flex flex-wrap gap-1">
      {labels.map((label) => {
        const on = label === active;
        return (
          <li
            key={label}
            className={[
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              on ? "bg-[#065f46] text-white" : "bg-[#ecfdf5] text-[#065f46]",
            ].join(" ")}
          >
            {label}
          </li>
        );
      })}
    </ol>
  );
}

function Screen({
  kicker,
  title,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col bg-[#f7f6f3] text-[#1c1917]">
      <header className="shrink-0 border-b border-black/5 px-3 pb-2 pt-1">
        <div className="text-[10px] font-medium uppercase tracking-wider text-[#78716c]">
          {kicker}
        </div>
        <div className="text-[15px] font-semibold leading-tight">{title}</div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">{children}</div>
      {footer ? <div className="shrink-0 border-t border-black/5 px-3 py-2">{footer}</div> : null}
    </div>
  );
}

function PrimaryButton({
  label,
  onClick,
  tone = "primary",
}: {
  label: string;
  onClick: () => void;
  tone?: "primary" | "danger" | "ghost";
}) {
  const cls =
    tone === "danger"
      ? "bg-[#b91c1c] text-white"
      : tone === "ghost"
        ? "bg-white text-[#44403c] ring-1 ring-black/10"
        : "bg-[#065f46] text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={["w-full rounded-lg px-3 py-2 text-[13px] font-semibold active:scale-[0.99]", cls].join(
        " ",
      )}
    >
      {label}
    </button>
  );
}

export function RoomsScene({
  payload,
  choices,
  onChoice,
  onAdvance,
  onGo,
}: {
  payload: RoomsPayload;
  choices?: Choice[];
  onChoice: (choice: Choice) => void;
  onAdvance?: () => void;
  onGo: (id: string) => void;
}) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [personId, setPersonId] = useState(payload.you ?? "jordan");
  const [roomId, setRoomId] = useState("helios");
  const [bookId, setBookId] = useState("redline");
  const [added, setAdded] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (payload.mode !== "boot") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const jump = window.setTimeout(() => setPhase(4), 0);
      return () => window.clearTimeout(jump);
    }
    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      setPhase(current);
      if (current >= 4) window.clearInterval(timer);
    }, 650);
    return () => window.clearInterval(timer);
  }, [payload.mode]);

  if (payload.mode === "list" && payload.rows) {
    const roomNames = (payload.rooms as string[]) ?? [];
    const visible = payload.rows.filter((row) => filter === "all" || row.filter === filter);
    const start = pickChoice(choices, "new");
    return (
      <Screen
        kicker={`${payload.you} · ${payload.role}`}
        title="My list"
        footer={
          start ? (
            <PrimaryButton label="New mission" onClick={() => onChoice(start)} />
          ) : null
        }
      >
        <p className="text-[11px] leading-snug text-[#78716c]">{roomNames.join(" · ")}</p>
        <div className="mt-2 flex gap-1">
          {FILTERS.map((item) => {
            const on = filter === item.id;
            const count =
              item.id === "all"
                ? payload.rows!.length
                : payload.rows!.filter((row) => row.filter === item.id).length;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={[
                  "rounded-full px-2 py-1 text-[10px] font-semibold",
                  on ? "bg-[#1c1917] text-white" : "bg-white text-[#57534e] ring-1 ring-black/10",
                ].join(" ")}
              >
                {item.label} {count}
              </button>
            );
          })}
        </div>
        <ul className="mt-2 space-y-1.5">
          {visible.map((row) => {
            const choice = pickChoice(choices, row.id);
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => choice && onChoice(choice)}
                  className="flex w-full flex-col rounded-lg bg-white px-2.5 py-2 text-left ring-1 ring-black/5 active:bg-[#fafaf9]"
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={[
                        "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                        kindStyle(row.filter),
                      ].join(" ")}
                    >
                      {kindLabel(row.filter)}
                    </span>
                    <span className="text-[10px] text-[#78716c]">{row.room}</span>
                  </span>
                  <span className="mt-1 text-[13px] font-semibold">{row.title}</span>
                  <span className="text-[11px] text-[#78716c]">{row.detail}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Screen>
    );
  }

  if (payload.mode === "qq") {
    const answer = pickChoice(choices, "answer");
    return (
      <Screen
        kicker={`${payload.room} · ${payload.lang}`}
        title={payload.mission ?? "QQ"}
        footer={
          answer ? (
            <PrimaryButton label={answer.label} onClick={() => onChoice(answer)} />
          ) : null
        }
      >
        <div className="animate-banner-in rounded-lg bg-[#065f46] px-2.5 py-2 text-white">
          <div className="text-[10px] font-bold uppercase tracking-wider">QQ · answer now</div>
          <p className="mt-1 text-[12px] leading-snug">{payload.prompt}</p>
        </div>
        <p className="mt-2 text-[11px] text-[#78716c]">
          Private thread · {payload.you}. Klára and Marek do not see this.
        </p>
        <div className="mt-2">
          <Pool
            agents={[{ name: payload.agent ?? "Ada", state: "busy", on: payload.mission }]}
            note={payload.poolNote}
          />
        </div>
      </Screen>
    );
  }

  if (payload.mode === "dq") {
    const slot = pickChoice(choices, "slot");
    return (
      <Screen
        kicker={payload.room ?? "Room"}
        title={payload.mission ?? "DQ"}
        footer={
          slot ? <PrimaryButton label={slot.label} onClick={() => onChoice(slot)} /> : null
        }
      >
        <div className="rounded-lg bg-[#fffbeb] px-2.5 py-2 ring-1 ring-[#fcd34d]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#92400e]">
            DQ · slot {payload.slot}
          </div>
          <p className="mt-1 text-[12px] font-medium text-[#78350f]">With {payload.with}</p>
          <p className="mt-1 text-[12px] leading-snug text-[#44403c]">{payload.ask}</p>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-[#78716c]">
          This does not ping you. It waits on the slot.
        </p>
        <div className="mt-2">
          <Pool agents={[{ name: "Ada", state: "free" }]} note={payload.poolNote} />
        </div>
      </Screen>
    );
  }

  if (payload.mode === "watch" && payload.people && payload.steps && payload.agents) {
    const people = payload.people;
    const selected = people.find((person) => person.id === personId) ?? people[0];
    const labels = (payload.steps as StepState[]).map((step) => step.label);
    const now = (payload.steps as StepState[]).find((step) => step.state === "now")?.label;
    const start = pickChoice(choices, "new");
    return (
      <Screen
        kicker={payload.room ?? "Room"}
        title={payload.mission ?? "Mission"}
        footer={
          start ? <PrimaryButton label={start.label} onClick={() => onChoice(start)} /> : null
        }
      >
        <p className="text-[11px] text-[#78716c]">{payload.context}</p>
        <div className="mt-2">
          <StepRail labels={labels} active={now} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {(payload.artifacts ?? []).map((artifact) => (
            <span
              key={artifact}
              className="rounded bg-white px-1.5 py-0.5 text-[10px] text-[#44403c] ring-1 ring-black/10"
            >
              {artifact}
            </span>
          ))}
        </div>
        <div className="mt-2">
          <Pool agents={payload.agents} />
        </div>
        <div className="mt-2 flex gap-1">
          {people.map((person) => {
            const on = person.id === selected.id;
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => setPersonId(person.id)}
                className={[
                  "flex-1 rounded-lg px-1 py-1 text-center ring-1",
                  on ? "bg-[#ecfdf5] ring-[#065f46]" : "bg-white ring-black/10",
                ].join(" ")}
              >
                <span className="block text-[11px] font-semibold">{person.name}</span>
                <span className="block text-[9px] uppercase text-[#78716c]">
                  {person.lang} · {person.role}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 space-y-1.5">
          <div className="rounded-lg bg-white px-2.5 py-2 ring-1 ring-black/5">
            <div className="text-[10px] font-semibold text-[#065f46]">
              {selected.name} · private · {selected.lang}
            </div>
            <p className="mt-1 text-[12px] leading-snug">{selected.line}</p>
          </div>
          <div className="rounded-lg bg-[#ecfdf5] px-2.5 py-2">
            <div className="text-[10px] font-semibold text-[#065f46]">Ada · {selected.lang}</div>
            <p className="mt-1 text-[12px] leading-snug">{selected.agent}</p>
          </div>
          <p className="text-[10px] text-[#78716c]">
            Only {selected.name} sees this thread. The others keep their own.
          </p>
        </div>
      </Screen>
    );
  }

  if (payload.mode === "create" && payload.rooms && payload.books && payload.mission) {
    const roomOpts = payload.rooms as RoomOpt[];
    const bookOpts = payload.books;
    const room = roomOpts.find((item) => item.id === roomId) ?? roomOpts[0];
    const book = bookOpts.find((item) => item.id === bookId) ?? bookOpts[0];
    return (
      <Screen
        kicker="New mission"
        title={payload.mission}
        footer={
          <PrimaryButton
            label={`Start · ${room.name}`}
            onClick={() => onGo(`s6-boot-${room.id}-${book.id}`)}
          />
        }
      >
        <div className="text-[10px] font-medium uppercase tracking-wider text-[#78716c]">Room</div>
        <div className="mt-1 space-y-1">
          {roomOpts.map((item) => {
            const on = item.id === room.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setRoomId(item.id)}
                className={[
                  "block w-full rounded-lg px-2.5 py-1.5 text-left ring-1",
                  on ? "bg-[#ecfdf5] ring-[#065f46]" : "bg-white ring-black/10",
                ].join(" ")}
              >
                <span className="block text-[12px] font-semibold">{item.name}</span>
                <span className="block text-[10px] leading-snug text-[#78716c]">{item.context}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-[10px] font-medium uppercase tracking-wider text-[#78716c]">
          Playbook
        </div>
        <div className="mt-1 flex flex-col gap-1">
          {bookOpts.map((item) => {
            const on = item.id === book.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setBookId(item.id)}
                className={[
                  "rounded-lg px-2.5 py-1.5 text-left text-[12px] font-semibold ring-1",
                  on ? "bg-[#1c1917] text-white ring-[#1c1917]" : "bg-white text-[#1c1917] ring-black/10",
                ].join(" ")}
              >
                {item.name}
                <span className={["mt-0.5 block text-[10px] font-normal", on ? "text-white/70" : "text-[#78716c]"].join(" ")}>
                  {item.steps.join(" → ")}
                </span>
              </button>
            );
          })}
        </div>
      </Screen>
    );
  }

  if (payload.mode === "boot") {
    const steps = (payload.steps as string[]) ?? [];
    const showSteps = phase >= 1;
    const showAgent = phase >= 2;
    const showArtifact = phase >= 3;
    return (
      <Screen
        kicker={payload.room ?? "Room"}
        title={payload.mission ?? "Mission"}
        footer={
          phase >= 4 && onAdvance ? (
            <PrimaryButton label="Open the playbook" onClick={onAdvance} />
          ) : (
            <p className="text-center text-[11px] text-[#78716c]">Starting…</p>
          )
        }
      >
        <p className="text-[11px] text-[#78716c]">{payload.playbook}</p>
        <div className="mt-3 space-y-2">
          {showSteps ? (
            <div className="animate-pop-in">
              <StepRail labels={steps} active={steps[0]} />
            </div>
          ) : (
            <div className="h-6" />
          )}
          {showAgent ? (
            <div className="animate-pop-in">
              <Pool
                agents={[
                  { name: "Ada", state: "busy", on: payload.mission },
                  { name: "Noa", state: "free" },
                ]}
                note="Ada left the pool for this mission. Noa stays free."
              />
            </div>
          ) : (
            <Pool
              agents={[
                { name: "Ada", state: "free" },
                { name: "Noa", state: "free" },
              ]}
            />
          )}
          {showArtifact ? (
            <div className="animate-slide-up rounded-lg bg-white px-2.5 py-2 ring-1 ring-[#065f46]/30">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#065f46]">
                Artifact
              </div>
              <p className="mt-1 text-[12px]">{payload.artifact}</p>
            </div>
          ) : null}
        </div>
      </Screen>
    );
  }

  if (payload.mode === "checkpoint") {
    const base = (payload.steps as string[]) ?? [];
    const insert = payload.insert ?? "Local counsel";
    const labels = added ? [...base.slice(0, -1), insert, base[base.length - 1]] : base;
    const finish = pickChoice(choices, "finish");
    return (
      <Screen
        kicker={`${payload.room} · ${payload.playbook}`}
        title={payload.mission ?? "Playbook"}
        footer={
          <div className="space-y-1.5">
            <PrimaryButton
              label={added ? `${insert} added` : `Add “${insert}”`}
              tone={added ? "ghost" : "primary"}
              onClick={() => setAdded(true)}
            />
            {finish ? (
              <PrimaryButton label={finish.label} tone="ghost" onClick={() => onChoice(finish)} />
            ) : null}
          </div>
        }
      >
        <ol className="space-y-1.5">
          {labels.map((label) => {
            const fresh = added && label === insert;
            return (
              <li
                key={label}
                className={[
                  "rounded-lg px-2.5 py-2 text-[13px] font-medium ring-1",
                  fresh
                    ? "animate-pop-in bg-[#ecfdf5] text-[#065f46] ring-[#065f46]"
                    : "bg-white text-[#1c1917] ring-black/10",
                ].join(" ")}
              >
                {label}
              </li>
            );
          })}
        </ol>
      </Screen>
    );
  }

  if (payload.mode === "end") {
    const done = pickChoice(choices, "done");
    const garbage = pickChoice(choices, "garbage");
    return (
      <Screen kicker={payload.room ?? "Mission"} title={payload.mission ?? "Close"}>
        <p className="text-[12px] leading-snug text-[#57534e]">
          No owner left on the loop. Close it. The artifacts stay either way.
        </p>
        <div className="mt-3 space-y-1.5">
          {done ? <PrimaryButton label={done.label} onClick={() => onChoice(done)} /> : null}
          {garbage ? (
            <PrimaryButton label={garbage.label} tone="danger" onClick={() => onChoice(garbage)} />
          ) : null}
        </div>
      </Screen>
    );
  }

  if (payload.mode === "result") {
    const garbage = payload.tone === "garbage";
    return (
      <Screen
        kicker="Mission"
        title={payload.headline ?? "Closed"}
        footer={
          onAdvance ? <PrimaryButton label="Replay" tone="ghost" onClick={onAdvance} /> : null
        }
      >
        <div
          className={[
            "rounded-lg px-2.5 py-3 text-[13px] leading-snug",
            garbage ? "bg-[#fef2f2] text-[#7f1d1d]" : "bg-[#ecfdf5] text-[#064e3b]",
          ].join(" ")}
        >
          {payload.detail}
        </div>
      </Screen>
    );
  }

  return null;
}
