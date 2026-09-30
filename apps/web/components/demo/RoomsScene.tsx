"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Choice } from "@demo/runtime";

type FilterId = "all" | "qq" | "dq" | "play";
type Who = { kind: "bot" | "human"; name: string; when?: string };
type Agent = { name: string; state: "free" | "busy"; on?: string };
type Cast = { id: string; name: string; role: string; lang: string };
type Talk = Cast & { line: string; agent: string };
type StepState = { label: string; state: "done" | "now" | "next" };
type RoomMission = {
  title: string;
  book: string;
  step: string;
  who: Who;
  scene: string;
};
type ListRow = {
  id: string;
  filter: "qq" | "dq" | "play";
  room: string;
  roomScene: string;
  title: string;
  who: Who;
};
type RoomOpt = { id: string; name: string; context: string };
type BookOpt = { id: string; name: string; steps: string[]; artifact: string };
type Incoming = { title: string; book: string; step: string; agent: string };

type RoomsPayload = {
  mode: "list" | "qq" | "dq" | "room" | "thread" | "create" | "checkpoint" | "result";
  nav?: string;
  rows?: ListRow[];
  room?: string;
  mission?: string;
  from?: { name: string; lang: string; text: string };
  reply?: string;
  speaker?: { name: string; lang: string };
  who?: string;
  when?: string;
  text?: string;
  artifact?: string;
  name?: string;
  context?: string;
  people?: Cast[] | Talk[];
  agents?: Agent[];
  missions?: RoomMission[];
  incoming?: Incoming;
  book?: string;
  steps?: StepState[] | string[];
  artifacts?: string[];
  youId?: string;
  prompt?: string;
  rooms?: RoomOpt[];
  books?: BookOpt[];
  insert?: string;
  tone?: "done" | "garbage";
};

const NAV = [
  { id: "list", label: "My list", scene: "s1-list" },
  { id: "checkout", label: "Checkout", scene: "s-room-checkout" },
  { id: "onboarding", label: "Onboarding", scene: "s-room-onboarding" },
  { id: "billing", label: "Billing", scene: "s-room-billing" },
];

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "qq", label: "QQ" },
  { id: "dq", label: "DQ" },
  { id: "play", label: "In play" },
];

function pickChoice(choices: Choice[] | undefined, id: string) {
  return choices?.find((choice) => choice.id === id);
}

function useTypewriter(text: string) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const jump = window.setTimeout(() => setN(text.length), 0);
      return () => window.clearTimeout(jump);
    }
    const timer = window.setInterval(() => {
      i += 1;
      setN(Math.min(i, text.length));
      if (i >= text.length) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [text]);
  return { shown: text.slice(0, n), done: text.length > 0 && n >= text.length };
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

function WhoMark({ who }: { who: Who }) {
  const live = who.kind === "bot";
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#44403c]">
      <span
        className={[
          "h-2 w-2 rounded-full",
          live ? "animate-soft-pulse bg-[#059669]" : "bg-[#d97706]",
        ].join(" ")}
      />
      <span>{who.name}</span>
      {who.when ? <span className="text-[#78716c]">{who.when}</span> : null}
    </span>
  );
}

function Pool({ agents }: { agents: Agent[] }) {
  return (
    <section className="rounded-xl bg-white p-4 ring-1 ring-black/5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#78716c]">
        Agent pool
      </h2>
      <ul className="mt-3 space-y-2.5">
        {agents.map((agent) => {
          const busy = agent.state === "busy";
          return (
            <li key={agent.name} className="flex items-center gap-2 text-[14px]">
              <span
                className={[
                  "h-2.5 w-2.5 rounded-full",
                  busy
                    ? "animate-soft-pulse bg-[#059669]"
                    : "animate-idle bg-[#6ee7b7]",
                ].join(" ")}
              />
              <span className="font-medium">{agent.name}</span>
              <span className="text-[#78716c]">{busy ? agent.on : "free"}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PromptBox({
  text,
  action,
  onAction,
}: {
  text: string;
  action: string;
  onAction: () => void;
}) {
  const typed = useTypewriter(text);
  return (
    <div>
      <div className="min-h-[72px] rounded-lg bg-white px-3 py-2 text-[14px] leading-relaxed ring-1 ring-black/10">
        <span>{typed.shown}</span>
        {typed.done ? null : (
          <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-soft-pulse bg-[#1c1917]" />
        )}
      </div>
      <button
        type="button"
        disabled={!typed.done}
        onClick={onAction}
        className="mt-2 rounded-lg bg-[#065f46] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-40"
      >
        {action}
      </button>
    </div>
  );
}

function Sidebar({
  nav,
  onGo,
}: {
  nav?: string;
  onGo: (id: string) => void;
}) {
  return (
    <aside className="flex w-[200px] shrink-0 flex-col border-r border-black/5 bg-white">
      <div className="px-4 py-4 text-[15px] font-semibold">Rooms</div>
      <nav className="flex flex-col gap-0.5 px-2">
        {NAV.map((item, index) => {
          const on = nav === item.id;
          return (
            <div key={item.id}>
              {index === 1 ? (
                <div className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a8a29e]">
                  Rooms
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => onGo(item.scene)}
                className={[
                  "w-full rounded-lg px-2.5 py-2 text-left text-[13px]",
                  on ? "bg-[#ecfdf5] font-semibold text-[#065f46]" : "text-[#44403c] hover:bg-[#f5f5f4]",
                ].join(" ")}
              >
                {item.label}
              </button>
            </div>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-black/5 px-4 py-3 text-[12px] text-[#78716c]">
        Jordan · en
      </div>
    </aside>
  );
}

function Shell({
  nav,
  onGo,
  title,
  extra,
  children,
}: {
  nav?: string;
  onGo: (id: string) => void;
  title: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  const showNew = title !== "Trial expiry email";
  return (
    <div className="flex h-full bg-[#f4f3ef] text-[#1c1917]">
      <Sidebar nav={nav} onGo={onGo} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-black/5 px-6 py-3">
          <h1 className="text-[18px] font-semibold">{title}</h1>
          <div className="flex items-center gap-2">
            {extra}
            {showNew ? (
              <button
                type="button"
                onClick={() => onGo("s6-create")}
                className="rounded-lg bg-[#1c1917] px-3 py-1.5 text-[13px] font-semibold text-white"
              >
                New mission
              </button>
            ) : null}
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Composer({ person }: { person: Talk }) {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className="rounded-xl bg-[#ecfdf5] px-3 py-2">
        <div className="text-[11px] font-semibold text-[#065f46]">
          {person.name} · {person.lang}
        </div>
        <p className="mt-1 text-[14px] leading-relaxed">{person.line}</p>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold text-[#065f46]">
        {person.name} · {person.lang}
      </div>
      <PromptBox text={person.line} action="Send" onAction={() => setSent(true)} />
    </div>
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
  const [roomId, setRoomId] = useState("checkout");
  const [bookId, setBookId] = useState("decide");
  const [added, setAdded] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (payload.mode !== "room" || !payload.incoming) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const jump = window.setTimeout(() => setPhase(2), 0);
      return () => window.clearTimeout(jump);
    }
    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      setPhase(current);
      if (current >= 2) window.clearInterval(timer);
    }, 700);
    return () => window.clearInterval(timer);
  }, [payload.mode, payload.incoming]);

  if (payload.mode === "list" && payload.rows) {
    const visible = payload.rows.filter((row) => filter === "all" || row.filter === filter);
    return (
      <Shell nav={payload.nav} onGo={onGo} title="My list">
        <div className="px-6 py-4">
          <div className="flex gap-1.5">
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
                    "rounded-full px-3 py-1 text-[12px] font-semibold",
                    on ? "bg-[#1c1917] text-white" : "bg-white text-[#57534e] ring-1 ring-black/10",
                  ].join(" ")}
                >
                  {item.label} {count}
                </button>
              );
            })}
          </div>
          <ul className="mt-4 overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
            {visible.map((row) => {
              const choice = pickChoice(choices, row.id);
              return (
                <li key={row.id} className="flex items-center gap-3 border-b border-black/5 px-4 py-3 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => choice && onChoice(choice)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className={[
                        "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        kindStyle(row.filter),
                      ].join(" ")}
                    >
                      {kindLabel(row.filter)}
                    </span>
                    <span className="text-[15px] font-medium">{row.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onGo(row.roomScene)}
                    className="text-[13px] text-[#0f766e] underline-offset-2 hover:underline"
                  >
                    {row.room}
                  </button>
                  <WhoMark who={row.who} />
                </li>
              );
            })}
          </ul>
        </div>
      </Shell>
    );
  }

  if (payload.mode === "qq" && payload.from && payload.reply && payload.speaker) {
    const send = pickChoice(choices, "send");
    return (
      <Shell nav={payload.nav} onGo={onGo} title={payload.mission ?? "QQ"}>
        <div className="mx-auto flex max-w-xl flex-col gap-3 px-6 py-6">
          <div className="text-[12px] text-[#78716c]">{payload.room}</div>
          <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
            <div className="text-[11px] font-semibold text-[#065f46]">
              {payload.from.name} · {payload.from.lang}
            </div>
            <p className="mt-1 text-[14px]">{payload.from.text}</p>
          </div>
          <div>
            <div className="mb-1 text-[11px] font-semibold text-[#065f46]">
              {payload.speaker.name} · {payload.speaker.lang}
            </div>
            {send ? (
              <PromptBox text={payload.reply} action={send.label} onAction={() => onChoice(send)} />
            ) : null}
          </div>
        </div>
      </Shell>
    );
  }

  if (payload.mode === "dq") {
    const slot = pickChoice(choices, "slot");
    return (
      <Shell nav={payload.nav} onGo={onGo} title={payload.mission ?? "DQ"}>
        <div className="px-6 py-6">
          <button
            type="button"
            onClick={() => slot && onChoice(slot)}
            className="flex w-full max-w-3xl overflow-hidden rounded-xl bg-white text-left ring-1 ring-[#fcd34d]"
          >
            <div className="flex w-36 shrink-0 flex-col justify-center bg-[#fffbeb] px-4 py-5">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-[#92400e]">DQ</div>
              <div className="mt-1 text-[18px] font-semibold text-[#78350f]">{payload.when}</div>
              <div className="mt-1 text-[13px] text-[#92400e]">{payload.who}</div>
            </div>
            <div className="px-5 py-5">
              <div className="text-[12px] text-[#78716c]">{payload.room}</div>
              <p className="mt-1 text-[16px]">{payload.text}</p>
              {payload.artifact ? (
                <span className="mt-3 inline-block rounded bg-[#f5f5f4] px-2 py-1 text-[12px] text-[#44403c]">
                  {payload.artifact}
                </span>
              ) : null}
            </div>
          </button>
        </div>
      </Shell>
    );
  }

  if (payload.mode === "room" && payload.agents && payload.missions && payload.people) {
    const incoming = payload.incoming;
    const showRow = !!incoming && phase >= 1;
    const agents = payload.agents.map((agent) => {
      if (incoming && phase >= 2 && agent.name === incoming.agent) {
        return { ...agent, state: "busy" as const, on: incoming.title };
      }
      return agent;
    });
    const people = payload.people as Cast[];
    return (
      <Shell nav={payload.nav} onGo={onGo} title={payload.name ?? "Room"}>
        <div className="px-6 py-5">
          <p className="text-[13px] text-[#78716c]">{payload.context}</p>
          <ul className="mt-3 flex gap-2">
            {people.map((person) => (
              <li
                key={person.id}
                className="rounded-lg bg-white px-3 py-2 ring-1 ring-black/5"
              >
                <div className="text-[13px] font-semibold">{person.name}</div>
                <div className="text-[11px] uppercase tracking-wide text-[#78716c]">
                  {person.role} · {person.lang}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-[240px_minmax(0,1fr)] gap-4">
            <Pool agents={agents} />
            <ul className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
              {payload.missions.map((mission) => (
                <li key={mission.title} className="border-b border-black/5 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => onGo(mission.scene)}
                    className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-[#fafaf9]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium">{mission.title}</span>
                      <span className="text-[12px] text-[#78716c]">
                        {mission.book} · {mission.step}
                      </span>
                    </span>
                    <WhoMark who={mission.who} />
                  </button>
                </li>
              ))}
              {showRow && incoming ? (
                <li className="animate-pop-in border-t border-black/5">
                  <button
                    type="button"
                    onClick={onAdvance}
                    className="flex w-full items-center gap-4 bg-[#ecfdf5] px-4 py-3 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium">{incoming.title}</span>
                      <span className="text-[12px] text-[#78716c]">
                        {incoming.book} · {incoming.step}
                      </span>
                    </span>
                    <WhoMark who={{ kind: "bot", name: incoming.agent }} />
                  </button>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </Shell>
    );
  }

  if (payload.mode === "thread" && payload.people && payload.steps) {
    return (
      <ThreadScreen payload={payload} onGo={onGo} />
    );
  }

  if (payload.mode === "create" && payload.rooms && payload.books && payload.prompt && payload.mission) {
    const roomOpts = payload.rooms;
    const bookOpts = payload.books;
    const room = roomOpts.find((item) => item.id === roomId) ?? roomOpts[0];
    const book = bookOpts.find((item) => item.id === bookId) ?? bookOpts[0];
    return (
      <Shell nav={payload.nav} onGo={onGo} title={payload.mission}>
        <CreateBody
          prompt={payload.prompt}
          roomOpts={roomOpts}
          bookOpts={bookOpts}
          room={room}
          book={book}
          onRoom={setRoomId}
          onBook={setBookId}
          onStart={() => onGo(`s7-boot-${room.id}-${book.id}`)}
        />
      </Shell>
    );
  }

  if (payload.mode === "checkpoint") {
    const base = (payload.steps as string[]) ?? [];
    const insert = payload.insert ?? "Design review";
    const labels = added ? [...base.slice(0, -1), insert, base[base.length - 1] ?? insert] : base;
    const done = pickChoice(choices, "done");
    const garbage = pickChoice(choices, "garbage");
    return (
      <Shell nav={payload.nav} onGo={onGo} title={payload.mission ?? "Playbook"}>
        <div className="mx-auto max-w-lg px-6 py-6">
          <div className="text-[13px] text-[#78716c]">
            {payload.room} · {payload.book}
          </div>
          {payload.artifact ? (
            <span className="mt-3 inline-block rounded bg-white px-2 py-1 text-[12px] ring-1 ring-black/10">
              {payload.artifact}
            </span>
          ) : null}
          <ol className="mt-4 space-y-2">
            {labels.map((label) => {
              const fresh = added && label === insert;
              return (
                <li
                  key={label}
                  className={[
                    "rounded-lg px-3 py-2 text-[14px] font-medium ring-1",
                    fresh
                      ? "animate-pop-in bg-[#ecfdf5] text-[#065f46] ring-[#065f46]"
                      : "bg-white ring-black/10",
                  ].join(" ")}
                >
                  {label}
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setAdded(true)}
              className="rounded-lg bg-[#065f46] px-3 py-2 text-[13px] font-semibold text-white"
            >
              {insert}
            </button>
            {added && done ? (
              <button
                type="button"
                onClick={() => onChoice(done)}
                className="rounded-lg bg-[#1c1917] px-3 py-2 text-[13px] font-semibold text-white"
              >
                {done.label}
              </button>
            ) : null}
            {added && garbage ? (
              <button
                type="button"
                onClick={() => onChoice(garbage)}
                className="rounded-lg bg-[#b91c1c] px-3 py-2 text-[13px] font-semibold text-white"
              >
                {garbage.label}
              </button>
            ) : null}
          </div>
        </div>
      </Shell>
    );
  }

  if (payload.mode === "result") {
    const garbage = payload.tone === "garbage";
    return (
      <Shell nav={payload.nav} onGo={onGo} title={payload.mission ?? "Mission"}>
        <div className="px-6 py-8">
          <div
            className={[
              "inline-block rounded-lg px-3 py-1 text-[13px] font-semibold",
              garbage ? "bg-[#fef2f2] text-[#7f1d1d]" : "bg-[#ecfdf5] text-[#065f46]",
            ].join(" ")}
          >
            {garbage ? "Garbage" : "Done"}
          </div>
          {payload.artifact ? (
            <div className="mt-4 inline-block rounded bg-white px-2 py-1 text-[13px] ring-1 ring-black/10">
              {payload.artifact}
            </div>
          ) : null}
          {onAdvance ? (
            <div className="mt-6">
              <button
                type="button"
                onClick={onAdvance}
                className="rounded-lg bg-white px-3 py-2 text-[13px] font-semibold ring-1 ring-black/10"
              >
                Replay
              </button>
            </div>
          ) : null}
        </div>
      </Shell>
    );
  }

  return null;
}

function ThreadScreen({
  payload,
  onGo,
}: {
  payload: RoomsPayload;
  onGo: (id: string) => void;
}) {
  const people = (payload.people as Talk[]) ?? [];
  const [personId, setPersonId] = useState(payload.youId ?? "jordan");
  const selected = people.find((person) => person.id === personId) ?? people[0];
  const steps = (payload.steps as StepState[]) ?? [];
  return (
    <Shell nav={payload.nav} onGo={onGo} title={payload.mission ?? "Mission"}>
      <div className="grid h-full grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-r border-black/5 px-4 py-4">
          <div className="text-[12px] text-[#78716c]">
            {payload.room} · {payload.book}
          </div>
          <ol className="mt-3 space-y-1.5">
            {steps.map((step) => (
              <li
                key={step.label}
                className={[
                  "rounded-lg px-2.5 py-1.5 text-[13px]",
                  step.state === "now"
                    ? "bg-[#065f46] font-semibold text-white"
                    : step.state === "done"
                      ? "bg-[#ecfdf5] text-[#065f46]"
                      : "bg-white text-[#44403c] ring-1 ring-black/10",
                ].join(" ")}
              >
                {step.label}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-col gap-1.5">
            {(payload.artifacts ?? []).map((artifact) => (
              <span
                key={artifact}
                className="rounded bg-white px-2 py-1 text-[12px] ring-1 ring-black/10"
              >
                {artifact}
              </span>
            ))}
          </div>
        </aside>
        <section className="px-6 py-4">
          <div className="flex gap-2">
            {people.map((person) => {
              const on = person.id === selected?.id;
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setPersonId(person.id)}
                  className={[
                    "rounded-lg px-3 py-2 text-left ring-1",
                    on ? "bg-[#ecfdf5] ring-[#065f46]" : "bg-white ring-black/10",
                  ].join(" ")}
                >
                  <span className="block text-[13px] font-semibold">{person.name}</span>
                  <span className="block text-[10px] uppercase tracking-wide text-[#78716c]">
                    {person.role} · {person.lang}
                  </span>
                </button>
              );
            })}
          </div>
          {selected ? (
            <div key={selected.id} className="mt-4 max-w-xl space-y-3">
              <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold text-[#065f46]">
                  Ada · {selected.lang}
                </div>
                <p className="mt-1 text-[14px] leading-relaxed">{selected.agent}</p>
              </div>
              <Composer person={selected} />
            </div>
          ) : null}
        </section>
      </div>
    </Shell>
  );
}

function CreateBody({
  prompt,
  roomOpts,
  bookOpts,
  room,
  book,
  onRoom,
  onBook,
  onStart,
}: {
  prompt: string;
  roomOpts: RoomOpt[];
  bookOpts: BookOpt[];
  room: RoomOpt;
  book: BookOpt;
  onRoom: (id: string) => void;
  onBook: (id: string) => void;
  onStart: () => void;
}) {
  const typed = useTypewriter(prompt);
  return (
    <div className="grid gap-6 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#78716c]">
          Prompt
        </div>
        <div className="mt-2 min-h-[88px] rounded-xl bg-white px-3 py-3 text-[15px] leading-relaxed ring-1 ring-black/10">
          <span>{typed.shown}</span>
          {typed.done ? null : (
            <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-soft-pulse bg-[#1c1917]" />
          )}
        </div>
        <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#78716c]">
          Playbook
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {bookOpts.map((item) => {
            const on = item.id === book.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onBook(item.id)}
                className={[
                  "rounded-xl px-3 py-2 text-left ring-1",
                  on ? "bg-[#1c1917] text-white ring-[#1c1917]" : "bg-white ring-black/10",
                ].join(" ")}
              >
                <span className="block text-[14px] font-semibold">{item.name}</span>
                <span className={["text-[12px]", on ? "text-white/70" : "text-[#78716c]"].join(" ")}>
                  {item.steps.join(" → ")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#78716c]">
          Room
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {roomOpts.map((item) => {
            const on = item.id === room.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onRoom(item.id)}
                className={[
                  "rounded-xl px-3 py-2 text-left ring-1",
                  on ? "bg-[#ecfdf5] ring-[#065f46]" : "bg-white ring-black/10",
                ].join(" ")}
              >
                <span className="block text-[14px] font-semibold">{item.name}</span>
                <span className="text-[12px] text-[#78716c]">{item.context}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={!typed.done}
          onClick={onStart}
          className="mt-4 w-full rounded-lg bg-[#065f46] px-3 py-2.5 text-[14px] font-semibold text-white disabled:opacity-40"
        >
          Start · {room.name}
        </button>
      </div>
    </div>
  );
}
