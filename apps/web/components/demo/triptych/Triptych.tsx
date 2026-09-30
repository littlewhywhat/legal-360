"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BOOKS,
  FILTERS,
  PEOPLE,
  ROOMS,
  addCheckpoint,
  advanceBoot,
  backFromRoom,
  blocker,
  bucket,
  clearPush,
  closeCreate,
  closeMission,
  commitAgentLine,
  countFilter,
  createMission,
  createWorld,
  currentStep,
  finishAsk,
  missionById,
  openCreate,
  openMission,
  openRoom,
  personById,
  postChat,
  roomById,
  setAdding,
  setAgentDraft,
  setChatTab,
  setCheckpoint,
  setDraft,
  setFilter,
  setForm,
  showList,
  toggleTodo,
  visibleMissions,
  type Agent,
  type ArtifactKind,
  type Mission,
  type PersonId,
  type World,
} from "./model";
import { tr } from "./copy";
import { runPlay, sleep } from "./play";

const KIND: Record<ArtifactKind, { label: string; chip: string }> = {
  decision: { label: "Decision", chip: "bg-amber-100 text-amber-950" },
  spec: { label: "Spec", chip: "bg-sky-100 text-sky-950" },
  design: { label: "Design", chip: "bg-violet-100 text-violet-950" },
  diff: { label: "Diff", chip: "bg-stone-200 text-stone-800" },
  verification: { label: "Check", chip: "bg-emerald-100 text-emerald-950" },
  copy: { label: "Copy", chip: "bg-orange-100 text-orange-950" },
};

const FACE: Record<PersonId, string> = {
  mira: "bg-emerald-800",
  lea: "bg-violet-700",
};

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Face({ id, ring }: { id: PersonId; ring?: boolean }) {
  const person = personById(id);
  return (
    <span
      className={[
        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white",
        FACE[id],
        ring ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-[#f6f4ef]" : "",
      ].join(" ")}
    >
      {person.name.slice(0, 1)}
    </span>
  );
}

function Bolt() {
  return (
    <svg viewBox="0 0 16 16" className="room-pulse h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden>
      <path fill="currentColor" d="M9.2 1.2 3.4 9h3.6l-.8 5.8 6.2-8.2H8.6l.6-5.4Z" />
    </svg>
  );
}

function Clock() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden>
      <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.8V8l2.2 1.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function AgentMark({ agent, compact }: { agent: Agent; compact?: boolean }) {
  const letter = agent.name.slice(0, 2);
  if (agent.mode === "offline") {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-full bg-stone-300 text-[10px] font-semibold text-stone-600">
        {letter}
      </span>
    );
  }
  if (agent.mode === "busy") {
    return (
      <span className={["relative grid place-items-center", compact ? "h-7 w-7" : "h-9 w-9"].join(" ")}>
        <span className="agent-spin absolute inset-0 rounded-full border-2 border-emerald-200 border-t-emerald-700" />
        <span className="text-[10px] font-semibold text-emerald-900">{letter}</span>
      </span>
    );
  }
  return (
    <span className="agent-breathe grid h-9 w-9 place-items-center rounded-full bg-emerald-800 text-[10px] font-semibold text-white">
      {letter}
    </span>
  );
}

function ChatThread({
  mission,
  owner,
  me,
  draft,
  onDraft,
  onSend,
  canClose,
  onClose,
}: {
  mission: Mission;
  owner: PersonId;
  me: PersonId;
  draft: string;
  onDraft: (value: string) => void;
  onSend: () => void;
  canClose: boolean;
  onClose: (tone: "done" | "garbage") => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const lines = mission.chats[owner];
  const draftBubble = mission.agentDraft?.person === owner ? mission.agentDraft : null;
  const mine = owner === me;

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [lines.length, draftBubble?.text, draft]);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div ref={scroller} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {lines.map((line) => {
          const human = line.from !== "agent";
          return (
            <p
              key={line.id}
              className={[
                "room-pop min-w-0 max-w-full break-words rounded-2xl px-2.5 py-1.5 text-[12px] leading-snug",
                human ? "self-end bg-stone-900 text-white" : "self-start bg-white text-stone-800 ring-1 ring-stone-200",
                line.tag === "qq" ? "room-push" : "",
              ].join(" ")}
            >
              {line.tag === "qq" ? <Bolt /> : null}
              {line.tag === "dq" ? <Clock /> : null}
              {line.tag ? <span className="sr-only">{line.tag}</span> : null}{" "}
              {line.text}
            </p>
          );
        })}
        {draftBubble ? (
          <p className="min-w-0 max-w-full break-words self-start rounded-2xl bg-white px-2.5 py-1.5 text-[12px] leading-snug text-stone-800 ring-1 ring-stone-200">
            {draftBubble.tag === "qq" ? <Bolt /> : null}
            {draftBubble.tag === "dq" ? <Clock /> : null}{" "}
            {draftBubble.text}
            <span className="desk-caret" />
          </p>
        ) : null}
      </div>
      {mine ? (
        <form
          className="mt-1.5 flex flex-col gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
        >
          <input
            data-composer={me}
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            className="w-full rounded-xl bg-white px-2.5 py-1.5 text-[12px] text-stone-900 ring-1 ring-stone-300 outline-none focus:ring-stone-900"
          />
          {canClose ? (
            <div className="flex justify-end gap-1.5">
              <button type="button" onClick={() => onClose("done")} className="rounded-full bg-emerald-800 px-3 py-1 text-[12px] font-medium text-white">
                {tr(me, "Accept")}
              </button>
              <button type="button" onClick={() => onClose("garbage")} className="rounded-full bg-rose-700 px-3 py-1 text-[12px] font-medium text-white">
                {tr(me, "Garbage")}
              </button>
            </div>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}

function CreateModal({
  person,
  world,
  commit,
}: {
  person: PersonId;
  world: World;
  commit: (recipe: (world: World) => World) => void;
}) {
  const form = world.columns[person].form;
  return (
    <div className="absolute inset-0 z-30 flex items-start justify-center bg-stone-900/30 p-3 pt-10">
      <form
        className="room-pop w-full max-w-sm rounded-2xl bg-[#f6f4ef] p-3 shadow-xl ring-1 ring-stone-300"
        onSubmit={(event) => {
          event.preventDefault();
          const opening =
            person === "lea"
              ? `První krok u „${form.title || "mise"}“. Co je hlavní?`
              : `First call on “${form.title || "this mission"}”. What do we ship?`;
          commit((current) =>
            createMission(current, person, {
              title: form.title,
              description: form.description,
              roomId: form.roomId,
              bookId: form.bookId,
              opening,
            }),
          );
        }}
      >
        <div className="font-[family-name:var(--font-display)] text-lg leading-none">{tr(person, "Create mission")}</div>
        <label className="mt-3 block text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
          {tr(person, "Summary")}
          <input
            data-field={`${person}-title`}
            value={form.title}
            onChange={(event) => commit((current) => setForm(current, person, { title: event.target.value }))}
            className="mt-1 w-full rounded-lg bg-white px-2.5 py-1.5 text-[13px] font-normal normal-case tracking-normal text-stone-900 ring-1 ring-stone-300 outline-none focus:ring-stone-900"
          />
        </label>
        <label className="mt-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
          {tr(person, "Room")}
          <select
            value={form.roomId}
            onChange={(event) => commit((current) => setForm(current, person, { roomId: event.target.value }))}
            className="mt-1 w-full rounded-lg bg-white px-2 py-1.5 text-[13px] font-normal normal-case tracking-normal text-stone-900 ring-1 ring-stone-300 outline-none"
          >
            {ROOMS.map((room) => (
              <option key={room.id} value={room.id}>
                {tr(person, room.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
          {tr(person, "Playbook")}
          <select
            value={form.bookId}
            onChange={(event) =>
              commit((current) => setForm(current, person, { bookId: event.target.value as (typeof BOOKS)[number]["id"] }))
            }
            className="mt-1 w-full rounded-lg bg-white px-2 py-1.5 text-[13px] font-normal normal-case tracking-normal text-stone-900 ring-1 ring-stone-300 outline-none"
          >
            {BOOKS.map((book) => (
              <option key={book.id} value={book.id}>
                {tr(person, book.name)} · {book.steps.map((step) => tr(person, step)).join(" → ")}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
          {tr(person, "Description")}
          <textarea
            data-field={`${person}-description`}
            value={form.description}
            rows={2}
            onChange={(event) => commit((current) => setForm(current, person, { description: event.target.value }))}
            className="mt-1 w-full resize-none rounded-lg bg-white px-2.5 py-1.5 text-[13px] font-normal normal-case tracking-normal text-stone-900 ring-1 ring-stone-300 outline-none focus:ring-stone-900"
          />
        </label>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => commit((current) => closeCreate(current, person))}
            className="rounded-full px-3 py-1.5 text-[12px] font-medium text-stone-600 ring-1 ring-stone-300"
          >
            {tr(person, "Cancel")}
          </button>
          <button type="submit" className="rounded-full bg-stone-900 px-3 py-1.5 text-[12px] font-medium text-white">
            {tr(person, "Create")}
          </button>
        </div>
      </form>
    </div>
  );
}

function ListScreen({
  person,
  world,
  commit,
}: {
  person: PersonId;
  world: World;
  commit: (recipe: (world: World) => World) => void;
}) {
  const who = personById(person);
  const column = world.columns[person];
  const rows = visibleMissions(world, person);
  return (
    <>
      <header className="flex items-center justify-between border-b border-stone-200/80 px-3 py-2.5">
        <div>
          <div className="font-[family-name:var(--font-display)] text-lg leading-none">{who.name}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">
            {tr(person, who.role)} · {tr(person, who.lang)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => commit((current) => openCreate(current, person))}
          className="rounded-full bg-stone-900 px-3 py-1.5 text-[12px] font-medium text-white"
        >
          {tr(person, "Create")}
        </button>
      </header>
      <div className="flex gap-1 px-3 pt-2">
        {FILTERS.map((filter) => {
          const on = column.filter === filter.id;
          const count = countFilter(world, person, filter.id);
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => commit((current) => setFilter(current, person, filter.id))}
              className={[
                "rounded-full px-2 py-1 text-[10px] font-semibold",
                on ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200",
              ].join(" ")}
            >
              {tr(person, filter.label)} {count}
            </button>
          );
        })}
      </div>
      <ul className="desk-scroll mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-3">
        {rows.map((row) => {
          const kind = bucket(row, person);
          const gate = currentStep(row)?.label ?? "";
          const agent = world.agents.find((item) => item.id === row.agentId);
          const pushed = column.pushedId === row.id && kind === "qq";
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => commit((current) => openMission(current, person, row.id))}
                className={[
                  "block w-full rounded-2xl bg-white px-3 py-2 text-left ring-1 ring-stone-200",
                  kind === "qq" ? "ring-emerald-700/30" : "",
                  kind === "dq" ? "bg-amber-50 ring-amber-300" : "",
                  pushed ? "room-push" : "",
                ].join(" ")}
              >
                <span className="flex items-center gap-1.5">
                  {kind === "qq" ? <Bolt /> : null}
                  {kind === "dq" ? <Clock /> : null}
                  <span className="truncate text-[13px] font-medium">{tr(person, row.title)}</span>
                  {row.closed ? (
                    <span
                      className={[
                        "ml-auto text-[10px] uppercase tracking-wide",
                        row.closed === "done" ? "text-emerald-800" : "text-rose-700",
                      ].join(" ")}
                    >
                      {tr(person, row.closed)}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
                  <span>{tr(person, roomById(row.roomId).name)}</span>
                  <span>·</span>
                  <span>{tr(person, gate)}</span>
                  {agent && agent.mode === "busy" ? (
                    <span className="ml-auto font-medium text-emerald-800">{agent.name}</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function MissionScreen({
  person,
  mission,
  world,
  commit,
}: {
  person: PersonId;
  mission: Mission;
  world: World;
  commit: (recipe: (world: World) => World) => void;
}) {
  const column = world.columns[person];
  const room = roomById(mission.roomId);
  const agent = world.agents.find((item) => item.id === mission.agentId);
  const step = mission.steps.find((item) => item.state === "current");
  const canClose = Boolean(step && step.label === "Accept" && mission.waits[person] === "qq" && !mission.closed);
  const tab = column.chatTab;

  return (
    <>
      <header className="flex items-center gap-2 border-b border-stone-200/80 px-3 py-2">
        <button
          type="button"
          aria-label={tr(person, "Back")}
          onClick={() => commit((current) => showList(current, person))}
          className="grid h-7 w-7 place-items-center rounded-full text-stone-600 ring-1 ring-stone-200"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-[14px] font-semibold leading-tight">{tr(person, mission.title)}</div>
          <button
            type="button"
            onClick={() => commit((current) => openRoom(current, person, mission.roomId))}
            className="text-[12px] font-medium text-emerald-800"
          >
            {tr(person, room.name)}
          </button>
        </div>
        {mission.closed ? (
          <span
            className={[
              "room-stamp-corner rounded-md border-2 px-1.5 py-0.5 font-[family-name:var(--font-display)] text-[13px] uppercase tracking-wide",
              mission.closed === "done" ? "border-emerald-700 text-emerald-800" : "border-rose-600 text-rose-700",
            ].join(" ")}
          >
            {tr(person, mission.closed)}
          </span>
        ) : null}
        <div className="flex -space-x-1">
          {PEOPLE.map((who) => (
            <Face key={who.id} id={who.id} ring={mission.waits[who.id] === "qq" || mission.waits[who.id] === "dq"} />
          ))}
        </div>
      </header>
      <div className="grid shrink-0 grid-cols-2 border-b border-stone-200/80">
        <div className="desk-scroll max-h-52 overflow-y-auto border-r border-stone-200/80 px-3 py-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">{tr(person, "Playbook")}</div>
          <ol className="mt-1.5 space-y-1">
            {mission.steps.map((item) => (
              <li key={item.id} className={["flex items-center gap-1.5", item.fresh ? "room-insert" : ""].join(" ")}>
                <span
                  className={[
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    item.state === "done" ? "bg-emerald-700" : "",
                    item.state === "current" ? "room-pulse bg-emerald-600" : "",
                    item.state === "upcoming" && !item.fresh ? "bg-stone-300" : "",
                    item.fresh ? "bg-orange-500" : "",
                  ].join(" ")}
                />
                <span
                  className={[
                    "min-w-0 truncate text-[12px] leading-tight",
                    item.state === "upcoming" && !item.fresh ? "text-stone-400" : "text-stone-800",
                    item.state === "current" ? "font-medium" : "",
                    item.fresh ? "font-semibold text-orange-700" : "",
                  ].join(" ")}
                >
                  {tr(person, item.label)}
                </span>
                {agent && item.state === "current" && !mission.closed ? (
                  <span className="agent-breathe ml-auto grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-800 text-[8px] font-semibold text-white">
                    Ai
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <div className="mt-2">
            {column.adding ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  commit((current) => addCheckpoint(current, mission.id, column.checkpoint));
                  commit((current) => setAdding(current, person, false));
                }}
              >
                <input
                  data-field={`${person}-checkpoint`}
                  autoFocus
                  value={column.checkpoint}
                  onChange={(event) => commit((current) => setCheckpoint(current, person, event.target.value))}
                  className="w-full rounded-full bg-white px-2 py-0.5 text-[12px] ring-1 ring-orange-300 outline-none"
                />
              </form>
            ) : (
              <button
                type="button"
                aria-label={tr(person, "Add checkpoint")}
                onClick={() => commit((current) => setAdding(current, person, true))}
                className="grid h-5 w-5 place-items-center rounded-full bg-stone-900 text-[12px] leading-none text-white"
              >
                +
              </button>
            )}
          </div>
        </div>
        <div className="desk-scroll max-h-52 overflow-y-auto px-3 py-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">{tr(person, "Todos")}</div>
          <ul className="mt-1.5 space-y-1">
            {mission.todos.map((todo) => (
              <li key={todo.id}>
                <button
                  type="button"
                  onClick={() => commit((current) => toggleTodo(current, mission.id, todo.id))}
                  className="flex w-full items-start gap-1.5 text-left text-[12px] text-stone-700"
                >
                  <span
                    className={[
                      "mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[3px] border text-[9px]",
                      todo.done ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-300",
                    ].join(" ")}
                  >
                    {todo.done ? "✓" : ""}
                  </span>
                  <span className={todo.done ? "text-stone-400 line-through" : ""}>{tr(person, todo.text)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_168px]">
        <div className="flex min-h-0 min-w-0 flex-col border-r border-stone-200/80">
          <div className="flex shrink-0 border-b border-stone-200/80">
            {PEOPLE.map((who) => {
              const on = tab === who.id;
              const wait = mission.waits[who.id];
              return (
                <button
                  key={who.id}
                  type="button"
                  onClick={() => commit((current) => setChatTab(current, person, who.id))}
                  className={[
                    "flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 text-[12px]",
                    on ? "border-b-2 border-stone-900 font-medium text-stone-900" : "text-stone-500",
                  ].join(" ")}
                >
                  <Face id={who.id} ring={wait === "qq"} />
                  <span>{who.name}</span>
                  {wait === "qq" ? <Bolt /> : null}
                  {wait === "dq" ? <Clock /> : null}
                </button>
              );
            })}
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-2">
            <ChatThread
              mission={mission}
              owner={tab}
              me={person}
              draft={column.draft}
              onDraft={(value) => commit((current) => setDraft(current, person, value))}
              onSend={() => commit((current) => postChat(current, person, current.columns[person].draft))}
              canClose={canClose && tab === person}
              onClose={(tone) => commit((current) => closeMission(current, mission.id, tone, person))}
            />
          </div>
        </div>
        <aside className="desk-scroll min-h-0 overflow-y-auto p-2">
          <ul className="space-y-1.5">
            {mission.artifacts.map((artifact) => (
              <li key={artifact.id} className="room-pop rounded-xl bg-white px-2 py-1.5 ring-1 ring-stone-200">
                <span className={["inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium", KIND[artifact.kind].chip].join(" ")}>
                  {tr(person, KIND[artifact.kind].label)}
                </span>
                <p className="mt-1 text-[11px] font-medium leading-tight">{tr(person, artifact.title)}</p>
                <p className="text-[10px] leading-snug text-stone-500">{tr(person, artifact.detail)}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}

function RoomScreen({
  person,
  world,
  commit,
}: {
  person: PersonId;
  world: World;
  commit: (recipe: (world: World) => World) => void;
}) {
  const roomId = world.columns[person].roomId ?? "product";
  const room = roomById(roomId);
  const agents = world.agents.filter((agent) => agent.roomId === roomId);
  const missions = world.missions.filter((mission) => mission.roomId === roomId);
  return (
    <>
      <header className="flex items-center gap-2 border-b border-stone-200/80 px-3 py-2.5">
        <button
          type="button"
          aria-label={tr(person, "Back")}
          onClick={() => commit((current) => backFromRoom(current, person))}
          className="grid h-7 w-7 place-items-center rounded-full text-stone-600 ring-1 ring-stone-200"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <div className="font-[family-name:var(--font-display)] text-lg leading-none">{tr(person, room.name)}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">{tr(person, room.context)}</div>
        </div>
        <button
          type="button"
          onClick={() => commit((current) => openCreate(current, person, roomId))}
          className="rounded-full bg-stone-900 px-3 py-1.5 text-[12px] font-medium text-white"
        >
          {tr(person, "Create")}
        </button>
      </header>
      <div className="desk-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="flex gap-3">
          {PEOPLE.map((who) => (
            <div key={who.id} className="flex items-center gap-1.5">
              <span className="relative">
                <Face id={who.id} />
                <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#f6f4ef]" />
              </span>
              <span className="text-[12px] font-medium">{who.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {agents.map((agent) => {
            const on = world.missions.find((mission) => mission.id === agent.missionId);
            return (
              <div key={agent.id} className="w-[108px] rounded-2xl bg-white px-2 py-2 text-center ring-1 ring-stone-200">
                <div className="flex justify-center">
                  <AgentMark agent={agent} />
                </div>
                <div className="mt-1 text-[12px] font-medium">{agent.name}</div>
                {agent.mode === "busy" && on ? (
                  <div className="line-clamp-2 text-[10px] leading-tight text-emerald-800">{tr(person, on.title)}</div>
                ) : null}
              </div>
            );
          })}
        </div>
        <ul className="mt-4 space-y-1.5">
          {missions.map((mission) => {
            const held = blocker(mission);
            const agent = world.agents.find((item) => item.id === mission.agentId && item.mode === "busy");
            const gate = currentStep(mission)?.label ?? mission.closed ?? "";
            return (
              <li key={mission.id}>
                <button
                  type="button"
                  onClick={() => commit((current) => openMission(current, person, mission.id))}
                  className="flex w-full items-center gap-2 rounded-2xl bg-white px-3 py-2 text-left ring-1 ring-stone-200"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{tr(person, mission.title)}</span>
                    <span className="text-[11px] text-stone-500">{tr(person, gate)}</span>
                  </span>
                  {held ? <Face id={held} ring={mission.waits[held] === "qq"} /> : null}
                  {agent ? <AgentMark agent={agent} compact /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

function Desk({
  person,
  world,
  commit,
  live,
}: {
  person: PersonId;
  world: World;
  commit: (recipe: (world: World) => World) => void;
  live: boolean;
}) {
  const column = world.columns[person];
  const mission = column.screen === "mission" ? missionById(world, column.missionId) : undefined;
  return (
    <article
      className={[
        "relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[24px] bg-[#f6f4ef] text-stone-900 shadow-[0_24px_60px_rgba(0,0,0,0.28)] transition-shadow",
        live ? "ring-2 ring-emerald-400/80" : "ring-1 ring-white/10",
      ].join(" ")}
    >
      {column.screen === "list" ? <ListScreen person={person} world={world} commit={commit} /> : null}
      {column.screen === "mission" && mission ? (
        <MissionScreen person={person} mission={mission} world={world} commit={commit} />
      ) : null}
      {column.screen === "room" ? <RoomScreen person={person} world={world} commit={commit} /> : null}
      {column.modal ? <CreateModal person={person} world={world} commit={commit} /> : null}
    </article>
  );
}

export function Triptych() {
  const worldRef = useRef<World>(createWorld());
  const [world, setWorld] = useState(worldRef.current);
  const [playing, setPlaying] = useState(false);
  const gen = useRef(0);
  const bootLock = useRef<string | null>(null);

  const commit = useCallback((recipe: (current: World) => World) => {
    const next = recipe(worldRef.current);
    worldRef.current = next;
    setWorld(next);
  }, []);

  const cancelled = useCallback(() => false, []);

  const typeAgent = useCallback(
    async (missionId: string, person: PersonId, text: string, tag?: "qq" | "dq", isCancelled?: () => boolean) => {
      const stop = isCancelled ?? cancelled;
      const frames = reduceMotion() ? [text.length] : Array.from({ length: text.length }, (_, i) => i + 1);
      for (const size of frames) {
        if (stop()) return false;
        commit((current) => setAgentDraft(current, missionId, person, text.slice(0, size), tag));
        if (!reduceMotion()) await sleep(44);
      }
      if (stop()) return false;
      commit((current) => commitAgentLine(current, missionId, person, text, tag));
      return true;
    },
    [cancelled, commit],
  );

  const bootSig = world.missions.map((mission) => `${mission.id}:${mission.boot ?? ""}`).join("|");
  const pushSig = PEOPLE.map((person) => world.columns[person.id].pushedId ?? "").join("|");

  useEffect(() => {
    const mission = worldRef.current.missions.find((item) => item.boot);
    if (!mission?.boot) return;
    const key = `${mission.id}:${mission.boot}`;
    if (bootLock.current === key) return;
    bootLock.current = key;
    let cancel = false;
    const stop = () => cancel;
    (async () => {
      if (mission.boot === "ask") {
        const ok = await typeAgent(mission.id, mission.creatorId, mission.opening, "qq", stop);
        if (!ok || cancel) return;
        commit((current) => finishAsk(current, mission.id));
        return;
      }
      await sleep(reduceMotion() ? 0 : 1200);
      if (cancel) return;
      commit(advanceBoot);
    })();
    return () => {
      cancel = true;
      if (bootLock.current === key) bootLock.current = null;
    };
  }, [bootSig, commit, typeAgent]);

  useEffect(() => {
    const person = PEOPLE.find((item) => world.columns[item.id].pushedId);
    if (!person) return;
    const timer = window.setTimeout(() => commit((current) => clearPush(current, person.id)), 1600);
    return () => window.clearTimeout(timer);
  }, [commit, pushSig]);

  const focusField = (selector: string) => {
    const node = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
    if (!node) return;
    node.focus();
    const end = node.value.length;
    node.setSelectionRange(end, end);
  };

  const play = async () => {
    if (playing) return;
    const token = ++gen.current;
    bootLock.current = null;
    const fresh = createWorld();
    worldRef.current = fresh;
    setWorld(fresh);
    setPlaying(true);
    const stop = () => gen.current !== token;
    const typeDraft = async (person: PersonId, text: string) => {
      const frames = reduceMotion() ? [text.length] : Array.from({ length: text.length }, (_, i) => i + 1);
      for (const size of frames) {
        if (stop()) return false;
        commit((current) => setDraft(current, person, text.slice(0, size)));
        await sleep(reduceMotion() ? 0 : 48);
        focusField(`[data-composer="${person}"]`);
      }
      return !stop();
    };
    const typeField = async (person: PersonId, field: "title" | "description", text: string) => {
      const frames = reduceMotion() ? [text.length] : Array.from({ length: text.length }, (_, i) => i + 1);
      for (const size of frames) {
        if (stop()) return false;
        commit((current) => setForm(current, person, { [field]: text.slice(0, size) }));
        await sleep(reduceMotion() ? 0 : 52);
        focusField(`[data-field="${person}-${field}"]`);
      }
      return !stop();
    };
    const typeCheckpoint = async (person: PersonId, text: string) => {
      const frames = reduceMotion() ? [text.length] : Array.from({ length: text.length }, (_, i) => i + 1);
      for (const size of frames) {
        if (stop()) return false;
        commit((current) => setCheckpoint(current, person, text.slice(0, size)));
        await sleep(reduceMotion() ? 0 : 56);
        focusField(`[data-field="${person}-checkpoint"]`);
      }
      return !stop();
    };
    await runPlay({
      getWorld: () => worldRef.current,
      commit,
      cancelled: stop,
      typeDraft,
      typeAgent: (missionId, person, text, tag) => typeAgent(missionId, person, text, tag, stop),
      typeField,
      typeCheckpoint,
    });
    if (!stop()) setPlaying(false);
  };

  const reset = () => {
    gen.current += 1;
    bootLock.current = null;
    const fresh = createWorld();
    worldRef.current = fresh;
    setWorld(fresh);
    setPlaying(false);
  };

  return (
    <div className={["flex min-h-0 flex-1 flex-col", playing ? "pointer-events-none" : ""].join(" ")}>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        {PEOPLE.map((person) => (
          <Desk key={person.id} person={person.id} world={world} commit={commit} live={world.spot === person.id} />
        ))}
      </div>
      <div className="pointer-events-auto mt-3 flex shrink-0 items-center justify-center gap-2">
        <button
          type="button"
          onClick={play}
          disabled={playing}
          className="rounded-full bg-emerald-800 px-4 py-1.5 text-[13px] font-medium text-white disabled:opacity-60"
        >
          {playing ? "Playing" : "Play"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-medium text-[var(--stage-fg)] ring-1 ring-white/15"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
