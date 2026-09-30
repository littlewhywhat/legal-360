"use client";

import { useEffect, useState } from "react";
import {
  BOOKS,
  PEOPLE,
  RIGHT_TABS,
  addCheckpoint,
  addTodo,
  bucket,
  closeMission,
  createMission,
  createWorld,
  openingLine,
  reply,
  stepRunning,
  toggleTodo,
  type Artifact,
  type FilterId,
  type Mission,
  type PersonId,
  type RightTab,
  type World,
} from "@cases/rooms";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "qq", label: "QQ" },
  { id: "dq", label: "DQ" },
  { id: "stake", label: "Stakeholder" },
];

const TAB_LABEL: Record<RightTab, string> = {
  playbook: "Playbook",
  files: "Files",
  changes: "Changes",
  terminal: "Terminal",
  browser: "Browser",
};

type Pane = {
  filter: FilterId;
  missionId: string | null;
  thread: PersonId;
  tab: RightTab;
  view: "threads" | "room";
  roomId: string | null;
  creating: boolean;
};

function blankPane(person: PersonId): Pane {
  return {
    filter: "qq",
    missionId: null,
    thread: person,
    tab: "playbook",
    view: "threads",
    roomId: null,
    creating: false,
  };
}

function personById(id: PersonId) {
  return PEOPLE.find((person) => person.id === id) ?? PEOPLE[0];
}

function DotCursor({ roam = false }: { roam?: boolean }) {
  return (
    <span className={roam ? "dotcursor roam" : "dotcursor"} aria-hidden>
      {Array.from({ length: 9 }, (_, index) => (
        <i key={index} style={{ animationDelay: `${index * 0.11}s` }} />
      ))}
    </span>
  );
}

function Typed({ text, live }: { text: string; live?: boolean }) {
  const [count, setCount] = useState(live ? 0 : text.length);

  useEffect(() => {
    if (!live) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const timer = window.setInterval(() => {
      setCount((value) => {
        if (value >= text.length) {
          window.clearInterval(timer);
          return value;
        }
        return value + 1;
      });
    }, 26);
    return () => window.clearInterval(timer);
  }, [live, text]);

  const done = count >= text.length;
  return (
    <>
      {text.slice(0, count)}
      {live && !done ? <span className="caret" /> : null}
    </>
  );
}

function Composer({
  script,
  onSend,
}: {
  script?: string;
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!script || touched) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(script);
      return;
    }
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setValue(script.slice(0, count));
      if (count >= script.length) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [script, touched]);

  return (
    <form
      className="flex items-end gap-2 border-t border-[#ececec] px-2 py-2"
      onSubmit={(event) => {
        event.preventDefault();
        const text = value.trim();
        if (!text) return;
        onSend(text);
        setValue("");
        setTouched(true);
      }}
    >
      <textarea
        value={value}
        rows={2}
        onChange={(event) => {
          setTouched(true);
          setValue(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        className="max-h-24 min-h-9 flex-1 resize-none bg-transparent text-[12px] leading-snug outline-none"
      />
      <button
        type="submit"
        className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1c1c1c] text-white"
        aria-label="Send"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 10V2M6 2L2.5 5.5M6 2l3.5 3.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
    </form>
  );
}

function CreateDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (roomId: string, title: string, bookId: string) => void;
}) {
  const [roomId, setRoomId] = useState("product");
  const [title, setTitle] = useState("");
  const [bookId, setBookId] = useState(BOOKS[0].id);

  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center bg-black/25 px-3 pt-10">
      <form
        className="w-full max-w-sm rounded-xl bg-white p-3 shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          onCreate(roomId, title, bookId);
        }}
      >
        <div className="text-[13px] font-semibold">Create mission</div>
        <label className="mt-3 block text-[10px] font-medium uppercase tracking-wide text-[#6b6b6b]">
          Room
          <select
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            className="mt-1 w-full rounded-md border border-[#e4e4e4] bg-white px-2 py-1.5 text-[12px] normal-case tracking-normal text-[#1c1c1c]"
          >
            <option value="product">Product</option>
            <option value="activation">Activation</option>
          </select>
        </label>
        <label className="mt-2 block text-[10px] font-medium uppercase tracking-wide text-[#6b6b6b]">
          Summary
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-md border border-[#e4e4e4] px-2 py-1.5 text-[12px] normal-case tracking-normal outline-none"
            autoFocus
          />
        </label>
        <label className="mt-2 block text-[10px] font-medium uppercase tracking-wide text-[#6b6b6b]">
          Playbook
          <select
            value={bookId}
            onChange={(event) => setBookId(event.target.value)}
            className="mt-1 w-full rounded-md border border-[#e4e4e4] bg-white px-2 py-1.5 text-[12px] normal-case tracking-normal text-[#1c1c1c]"
          >
            {BOOKS.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-[12px] text-[#555]">
            Cancel
          </button>
          <button type="submit" className="rounded-md bg-[#1c1c1c] px-2.5 py-1 text-[12px] text-white">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  return (
    <li className="rounded-md border border-[#ececec] bg-white px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-[#888]">{artifact.kind}</div>
      <div className="text-[12px] font-medium leading-tight">{artifact.title}</div>
      <div className="text-[11px] leading-snug text-[#666]">{artifact.detail}</div>
    </li>
  );
}

export function AgentDesk() {
  const [world, setWorld] = useState<World>(() => createWorld());
  const [panes, setPanes] = useState<Record<PersonId, Pane>>({
    po: blankPane("po"),
    ux: blankPane("ux"),
    dev: blankPane("dev"),
  });

  const runningKey = world.missions
    .filter((mission) => mission.running)
    .map((mission) => {
      const now = mission.steps.find((step) => step.state === "now");
      return `${mission.id}:${now?.id ?? ""}`;
    })
    .join("|");

  useEffect(() => {
    if (!runningKey) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setWorld((current) => stepRunning(current)), reduced ? 0 : 2600);
    return () => window.clearTimeout(timer);
  }, [runningKey]);

  const patch = (person: PersonId, partial: Partial<Pane>) => {
    setPanes((current) => ({ ...current, [person]: { ...current[person], ...partial } }));
  };

  const openMission = (person: PersonId, missionId: string) => {
    setWorld((current) => {
      const mission = current.missions.find((item) => item.id === missionId);
      if (!mission) return current;
      const text = openingLine(mission, person);
      if (!text) return current;
      const next = structuredClone(current);
      const target = next.missions.find((item) => item.id === missionId);
      if (!target) return current;
      target.chats[person].push({
        id: `${missionId}-open-${person}`,
        from: "agent",
        text,
        fresh: true,
      });
      return next;
    });
    patch(person, { missionId, view: "threads", thread: person, tab: "playbook" });
  };

  return (
    <div className="grid min-h-0 w-full min-w-[1100px] flex-1 grid-cols-3 gap-2">
      {PEOPLE.map((person) => (
        <Window
          key={person.id}
          person={person.id}
          world={world}
          pane={panes[person.id]}
          onPatch={(partial) => patch(person.id, partial)}
          onOpen={(missionId) => openMission(person.id, missionId)}
          onReply={(missionId, text) => setWorld((current) => reply(current, missionId, person.id, text))}
          onCreate={(roomId, title, bookId) => {
            setWorld((current) => createMission(current, roomId, title, bookId));
            patch(person.id, { creating: false, filter: "stake" });
          }}
          onCheckpoint={(missionId, label) => setWorld((current) => addCheckpoint(current, missionId, label))}
          onToggleTodo={(missionId, todoId) => setWorld((current) => toggleTodo(current, missionId, todoId))}
          onAddTodo={(missionId, text) => setWorld((current) => addTodo(current, missionId, text))}
          onClose={(missionId, status) => setWorld((current) => closeMission(current, missionId, status))}
        />
      ))}
    </div>
  );
}

function Window({
  person,
  world,
  pane,
  onPatch,
  onOpen,
  onReply,
  onCreate,
  onCheckpoint,
  onToggleTodo,
  onAddTodo,
  onClose,
}: {
  person: PersonId;
  world: World;
  pane: Pane;
  onPatch: (partial: Partial<Pane>) => void;
  onOpen: (missionId: string) => void;
  onReply: (missionId: string, text: string) => void;
  onCreate: (roomId: string, title: string, bookId: string) => void;
  onCheckpoint: (missionId: string, label: string) => void;
  onToggleTodo: (missionId: string, todoId: string) => void;
  onAddTodo: (missionId: string, text: string) => void;
  onClose: (missionId: string, status: "done" | "garbage") => void;
}) {
  const who = personById(person);
  const mission = world.missions.find((item) => item.id === pane.missionId) ?? null;
  const room = world.rooms.find((item) => item.id === (pane.view === "room" ? pane.roomId : mission?.roomId));
  const rows = world.missions.filter((item) => bucket(item, person) === pane.filter);

  return (
    <section className="relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-black/10 bg-white text-[#1c1c1c] shadow-[0_16px_50px_rgba(0,0,0,0.28)]">
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-[#ececec] px-2.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1c1c1c] text-[9px] font-semibold text-white">
            {who.name.slice(0, 1)}
          </span>
          <span className="text-[12px] font-semibold">{who.name}</span>
          <span className="text-[11px] text-[#888]">{who.role}</span>
        </div>
        {room ? (
          <button
            type="button"
            onClick={() => onPatch({ view: "room", roomId: room.id })}
            className="rounded-full bg-[#f3f3f3] px-2 py-0.5 text-[11px] text-[#333]"
          >
            {room.name}
          </button>
        ) : null}
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[138px] shrink-0 flex-col border-r border-[#ececec] bg-[#f6f6f6]">
          <button
            type="button"
            onClick={() => onPatch({ creating: true })}
            className="mx-1.5 mt-1.5 flex items-center gap-1 rounded-md px-1.5 py-1 text-left text-[12px] hover:bg-white"
          >
            <span className="text-[14px] leading-none">+</span>
            New mission
          </button>
          <div className="mt-1 flex flex-col px-1.5">
            {FILTERS.map((filter) => {
              const count = world.missions.filter((item) => bucket(item, person) === filter.id).length;
              const on = pane.filter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onPatch({ filter: filter.id })}
                  className={[
                    "flex items-center justify-between rounded-md px-1.5 py-1 text-[11px]",
                    on ? "bg-white font-medium shadow-sm" : "text-[#555]",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-1">
                    {filter.id === "qq" && count > 0 ? <span className="qq-dot h-1.5 w-1.5 rounded-full bg-[#15934a]" /> : null}
                    {filter.id === "dq" && count > 0 ? <span className="h-1.5 w-1.5 rounded-full bg-[#d97706]" /> : null}
                    {filter.label}
                  </span>
                  <span className="text-[#999]">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-1 min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
            {world.rooms.map((item) => {
              const mine = rows.filter((row) => row.roomId === item.id);
              if (mine.length === 0) return null;
              return (
                <div key={item.id} className="mt-2">
                  <button
                    type="button"
                    onClick={() => onPatch({ view: "room", roomId: item.id })}
                    className="px-1 text-[10px] font-medium uppercase tracking-wide text-[#8a8a8a]"
                  >
                    {item.name}
                  </button>
                  <ul className="mt-0.5 space-y-0.5">
                    {mine.map((row) => (
                      <li key={row.id}>
                        <MissionRow
                          mission={row}
                          signal={pane.filter}
                          selected={row.id === mission?.id && pane.view === "threads"}
                          onClick={() => onOpen(row.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>
        {pane.view === "room" && pane.roomId ? (
          <RoomBody
            world={world}
            roomId={pane.roomId}
            onOpen={onOpen}
          />
        ) : (
          <MissionBody
            person={person}
            mission={mission}
            tab={pane.tab}
            thread={pane.thread}
            onThread={(thread) => onPatch({ thread })}
            onTab={(tab) => onPatch({ tab })}
            onReply={(text) => mission && onReply(mission.id, text)}
            onCheckpoint={(label) => mission && onCheckpoint(mission.id, label)}
            onToggleTodo={(todoId) => mission && onToggleTodo(mission.id, todoId)}
            onAddTodo={(text) => mission && onAddTodo(mission.id, text)}
            onClose={(status) => mission && onClose(mission.id, status)}
          />
        )}
      </div>
      {pane.creating ? (
        <CreateDialog onClose={() => onPatch({ creating: false })} onCreate={onCreate} />
      ) : null}
    </section>
  );
}

function MissionRow({
  mission,
  signal,
  selected,
  onClick,
}: {
  mission: Mission;
  signal: FilterId;
  selected: boolean;
  onClick: () => void;
}) {
  const now = mission.steps.find((step) => step.state === "now");
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-start gap-1 rounded-md px-1 py-1 text-left",
        selected ? "bg-white shadow-sm" : "hover:bg-white/70",
        mission.status !== "open" ? "opacity-50" : "",
      ].join(" ")}
    >
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        {mission.agentId ? (
          <DotCursor />
        ) : (
          <WaitPip kind={signal === "stake" ? undefined : signal} />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-medium leading-tight">{mission.title}</span>
        <span className="block truncate text-[10px] text-[#888]">{now?.label}</span>
      </span>
    </button>
  );
}

function WaitPip({ kind }: { kind?: "qq" | "dq" }) {
  if (kind === "qq") return <span className="qq-dot h-1.5 w-1.5 rounded-full bg-[#15934a]" />;
  if (kind === "dq") return <span className="h-1.5 w-1.5 rounded-full bg-[#d97706]" />;
  return <span className="h-1.5 w-1.5 rounded-full bg-[#ccc]" />;
}

function RoomBody({
  world,
  roomId,
  onOpen,
}: {
  world: World;
  roomId: string;
  onOpen: (missionId: string) => void;
}) {
  const room = world.rooms.find((item) => item.id === roomId);
  const missions = world.missions.filter((item) => item.roomId === roomId);
  const agents = world.agents.filter((item) => item.roomId === roomId);
  if (!room) return null;

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-[#ececec] px-3 py-2">
          <div className="text-[13px] font-semibold">{room.name}</div>
          <div className="text-[11px] text-[#777]">{room.context}</div>
        </div>
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {missions.map((mission) => {
            const agent = world.agents.find((item) => item.id === mission.agentId);
            const blocker = mission.blockedBy ? personById(mission.blockedBy) : null;
            return (
              <li key={mission.id}>
                <button
                  type="button"
                  onClick={() => onOpen(mission.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-[#f6f6f6]"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {agent ? <DotCursor /> : blocker ? (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1c1c1c] text-[8px] text-white">
                        {blocker.name.slice(0, 1)}
                      </span>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ccc]" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px]">{mission.title}</span>
                  <span className="shrink-0 text-[10px] text-[#888]">
                    {agent ? agent.name : blocker ? blocker.role : mission.status}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <aside className="flex w-[148px] shrink-0 flex-col border-l border-[#ececec] bg-[#fafafa]">
        <div className="px-2 py-2 text-[10px] font-medium uppercase tracking-wide text-[#8a8a8a]">People</div>
        <ul className="space-y-1 px-2">
          {PEOPLE.map((person) => (
            <li key={person.id} className="flex items-center gap-1.5 text-[12px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#15934a]" />
              {person.name}
              <span className="text-[10px] text-[#999]">{person.role}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 px-2 text-[10px] font-medium uppercase tracking-wide text-[#8a8a8a]">Pool</div>
        <ul className="mt-1 space-y-1.5 px-2">
          {agents.map((agent) => (
            <li key={agent.id} className="flex items-center gap-1.5 text-[12px]">
              {agent.status === "busy" ? <DotCursor /> : <span className="free-dot h-2 w-2 rounded-full bg-[#9a9a9a]" />}
              <span>{agent.name}</span>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}

function MissionBody({
  person,
  mission,
  tab,
  thread,
  onThread,
  onTab,
  onReply,
  onCheckpoint,
  onToggleTodo,
  onAddTodo,
  onClose,
}: {
  person: PersonId;
  mission: Mission | null;
  tab: RightTab;
  thread: PersonId;
  onThread: (thread: PersonId) => void;
  onTab: (tab: RightTab) => void;
  onReply: (text: string) => void;
  onCheckpoint: (label: string) => void;
  onToggleTodo: (todoId: string) => void;
  onAddTodo: (text: string) => void;
  onClose: (status: "done" | "garbage") => void;
}) {
  const tabs = RIGHT_TABS[person];
  const active = tabs.includes(tab) ? tab : tabs[0];
  const order: PersonId[] = [person, ...PEOPLE.map((item) => item.id).filter((id) => id !== person)];
  const now = mission?.steps.find((step) => step.state === "now");
  const canClose = !!mission && !!now && now.label === "Accept" && mission.wait[person] === "qq";

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex gap-1 border-b border-[#ececec] px-2 py-1">
          {order.map((id) => {
            const who = personById(id);
            const on = thread === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onThread(id)}
                className={[
                  "rounded-md px-2 py-1 text-[11px]",
                  on ? "bg-[#1c1c1c] text-white" : "text-[#666] hover:bg-[#f3f3f3]",
                ].join(" ")}
              >
                {who.name}
              </button>
            );
          })}
        </div>
        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2.5 py-2">
          {mission?.chats[thread].map((line) => (
            <p
              key={line.id}
              className={[
                "max-w-[95%] rounded-lg px-2 py-1.5 text-[12px] leading-snug",
                line.from === "agent" ? "bg-[#f4f4f4] text-[#222]" : "ml-auto bg-[#1c1c1c] text-white",
              ].join(" ")}
            >
              <Typed text={line.text} live={line.fresh} />
            </p>
          ))}
        </div>
        {canClose ? (
          <div className="flex justify-end gap-1.5 px-2 pb-1">
            <button
              type="button"
              onClick={() => onClose("done")}
              className="rounded-md bg-[#1c1c1c] px-2 py-1 text-[11px] text-white"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => onClose("garbage")}
              className="rounded-md bg-[#9f1239] px-2 py-1 text-[11px] text-white"
            >
              Garbage
            </button>
          </div>
        ) : null}
        {mission && thread === person ? (
          <Composer
            key={`${mission.id}-${person}`}
            script={mission.drafts[person]}
            onSend={onReply}
          />
        ) : (
          <div className="h-2" />
        )}
      </div>
      <aside className="flex w-[156px] shrink-0 flex-col border-l border-[#ececec] bg-[#fafafa]">
        <div className="flex flex-wrap gap-0.5 border-b border-[#ececec] px-1 py-1">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onTab(item)}
              className={[
                "rounded px-1.5 py-0.5 text-[10px]",
                active === item ? "bg-white font-medium shadow-sm" : "text-[#777]",
              ].join(" ")}
            >
              {TAB_LABEL[item]}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {mission ? (
            <RightPane
              mission={mission}
              tab={active}
              onCheckpoint={onCheckpoint}
              onToggleTodo={onToggleTodo}
              onAddTodo={onAddTodo}
            />
          ) : null}
        </div>
      </aside>
    </>
  );
}

function RightPane({
  mission,
  tab,
  onCheckpoint,
  onToggleTodo,
  onAddTodo,
}: {
  mission: Mission;
  tab: RightTab;
  onCheckpoint: (label: string) => void;
  onToggleTodo: (todoId: string) => void;
  onAddTodo: (text: string) => void;
}) {
  const [checkpoint, setCheckpoint] = useState("");
  const [todo, setTodo] = useState("");

  if (tab === "playbook") {
    return (
      <div>
        <div className="text-[10px] uppercase tracking-wide text-[#999]">{mission.playbook}</div>
        <ol className="relative mt-2 space-y-1">
          <span className="absolute bottom-1 left-[5px] top-1 w-px bg-[#e4e4e4]" />
          {mission.steps.map((step) => (
            <li key={step.id} className="relative flex items-center gap-1.5">
              {step.state === "now" && mission.agentId ? (
                <DotCursor />
              ) : (
                <span
                  className={[
                    "relative z-10 h-[11px] w-[11px] shrink-0 rounded-full",
                    step.fresh
                      ? "bg-[#ea580c]"
                      : step.state === "done"
                        ? "bg-[#1c1c1c]"
                        : step.state === "now"
                          ? "bg-[#15934a]"
                          : "bg-[#d4d4d4]",
                  ].join(" ")}
                />
              )}
              <span className={["text-[11px]", step.state === "next" ? "text-[#999]" : ""].join(" ")}>
                {step.label}
              </span>
            </li>
          ))}
        </ol>
        <form
          className="mt-2 flex gap-1"
          onSubmit={(event) => {
            event.preventDefault();
            onCheckpoint(checkpoint);
            setCheckpoint("");
          }}
        >
          <input
            value={checkpoint}
            onChange={(event) => setCheckpoint(event.target.value)}
            placeholder="Checkpoint"
            className="w-full rounded border border-[#e4e4e4] bg-white px-1.5 py-1 text-[11px] outline-none"
          />
        </form>
        <div className="mt-3 text-[10px] uppercase tracking-wide text-[#999]">Todos</div>
        <ul className="mt-1 space-y-1">
          {mission.todos.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => onToggleTodo(item.id)} className="flex items-start gap-1 text-left text-[11px]">
                <span className={["mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm border", item.done ? "border-[#1c1c1c] bg-[#1c1c1c]" : "border-[#bbb]"].join(" ")} />
                <span className={item.done ? "text-[#999] line-through" : ""}>{item.text}</span>
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-1"
          onSubmit={(event) => {
            event.preventDefault();
            onAddTodo(todo);
            setTodo("");
          }}
        >
          <input
            value={todo}
            onChange={(event) => setTodo(event.target.value)}
            placeholder="Todo"
            className="w-full rounded border border-[#e4e4e4] bg-white px-1.5 py-1 text-[11px] outline-none"
          />
        </form>
      </div>
    );
  }

  if (tab === "files") {
    return (
      <ul className="space-y-1.5">
        {mission.artifacts.map((artifact) => (
          <ArtifactCard key={artifact.id} artifact={artifact} />
        ))}
      </ul>
    );
  }

  if (tab === "changes") {
    return <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-[#333]">{mission.diff}</pre>;
  }

  if (tab === "terminal") {
    return <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-[#333]">{mission.terminal}</pre>;
  }

  return (
    <div className="relative h-full min-h-36 rounded-md border border-[#ececec] bg-white p-2">
      <div className="text-[10px] text-[#999]">pricing</div>
      <div className="mt-2 rounded-md border border-[#1c1c1c] px-2 py-2">
        <div className="text-[10px] uppercase text-[#888]">Annual</div>
        <div className="text-[13px] font-semibold">$96</div>
      </div>
      <div className="mt-1.5 rounded-md border border-[#e4e4e4] px-2 py-2">
        <div className="text-[10px] uppercase text-[#aaa]">Month</div>
        <div className="text-[12px] text-[#666]">$12</div>
      </div>
      {mission.agentId ? <DotCursor roam /> : null}
    </div>
  );
}
