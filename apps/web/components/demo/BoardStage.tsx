"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AGENTS,
  BOOKS,
  FEATURE_DIFF,
  FILTERS,
  ROOMS,
  SEATS,
  blocker,
  currentStep,
  freshWorld,
  goTo,
  markTodo,
  missionGate,
  reduce,
  visibleMissions,
  type Action,
  type Mission,
  type PersonId,
  type TabId,
  type World,
} from "./board-model";

function NineDots() {
  return (
    <span className="inline-grid grid-cols-3 gap-[2px]" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="agent-dot h-[3px] w-[3px] rounded-full bg-current"
          style={{ animationDelay: `${(i % 3) * 70 + Math.floor(i / 3) * 110}ms` }}
        />
      ))}
    </span>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS: Record<TabId, string> = {
  playbook: "M8 6h8M8 12h8M8 18h5",
  files: "M7 3h7l5 5v13H7zM14 3v5h5",
  desktop: "M4 5h16v10H4zM8 19h8",
  changes: "M12 4v16M7 9l5-5 5 5",
  terminal: "M5 7l5 5-5 5M12 17h7",
};

const TAB_LABEL: Record<TabId, string> = {
  playbook: "Playbook",
  files: "Files",
  desktop: "Desktop",
  changes: "Changes",
  terminal: "Terminal",
};

function personName(id: PersonId) {
  return SEATS.find((seat) => seat.id === id)?.name ?? id;
}

function agentName(id: string | null) {
  return AGENTS.find((agent) => agent.id === id)?.name ?? "";
}

export function BoardStage() {
  const [world, setWorld] = useState<World>(freshWorld);
  const [runId, setRunId] = useState(0);
  const worldRef = useRef(world);
  worldRef.current = world;

  const dispatch = useCallback((action: Action) => {
    setWorld((current) => reduce(current, action));
  }, []);

  const playing = runId > 0;

  useEffect(() => {
    if (!runId) return;
    let cancel = false;
    const dead = () => cancel;
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

    const type = async (person: PersonId, text: string) => {
      let acc = "";
      for (const ch of text) {
        if (dead()) return;
        acc += ch;
        dispatch({ type: "draft", person, text: acc });
        await wait(26);
      }
    };

    const patch = (missionId: string, fn: (mission: Mission) => Mission) => {
      dispatch({ type: "mission", missionId, patch: fn });
    };

    (async () => {
      dispatch({ type: "reset" });
      await wait(500);
      if (dead()) return;
      dispatch({ type: "open", person: "tereza", missionId: "feature" });
      dispatch({ type: "tab", person: "tereza", tab: "desktop" });
      await wait(700);
      if (dead()) return;
      await type("tereza", "Rok. Měsíc necháme jako druhý řádek.");
      if (dead()) return;
      dispatch({ type: "send", person: "tereza" });
      patch("feature", (mission) =>
        markTodo(
          {
            ...goTo(mission, "spec"),
            desktop: 1,
            cursor: "button",
            artifacts: [
              ...mission.artifacts,
              {
                id: "decision",
                kind: "Decision",
                title: "Default column",
                body: "Next. Now only by drag.",
              },
            ],
          },
          "column",
          true,
        ),
      );
      dispatch({ type: "file", id: "decision" });
      await wait(1100);
      if (dead()) return;
      patch("feature", (mission) =>
        markTodo(
          {
            ...goTo(mission, "implement"),
            desktop: 2,
            cursor: "card",
            artifacts: [
              ...mission.artifacts,
              {
                id: "spec",
                kind: "Spec",
                title: "POST /features",
                body: "insightId, column next. Card stores quote and insightId. Now stays empty.",
              },
            ],
          },
          "quote",
          true,
        ),
      );
      dispatch({ type: "file", id: "spec" });
      await wait(1200);
      if (dead()) return;
      dispatch({ type: "tab", person: "tereza", tab: "files" });
      await wait(800);
      if (dead()) return;
      patch("feature", (mission) => ({
        ...mission,
        agentId: null,
        cursor: null,
        waits: { tereza: "stake", owen: "dq" },
        threads: {
          ...mission.threads,
          owen: [
            {
              id: "ask-owen",
              from: "agent",
              text: "Card lands in Next, quote on the card. Wire POST /features with insightId and column next. Now stays empty unless someone drags it.",
            },
          ],
        },
      }));
      dispatch({ type: "filter", person: "owen", filter: "dq" });
      await wait(700);
      if (dead()) return;
      dispatch({ type: "open", person: "owen", missionId: "feature" });
      dispatch({ type: "thread", person: "owen", thread: "tereza" });
      await wait(1100);
      if (dead()) return;
      dispatch({ type: "thread", person: "owen", thread: "owen" });
      await type(
        "owen",
        "Column stays next on create. Copy quote when it exists. Still write the link when the quote is empty. Drag is the only way into Now.",
      );
      if (dead()) return;
      dispatch({ type: "send", person: "owen" });
      patch("theme", (mission) => ({ ...mission, agentId: null, terminal: [...mission.terminal, "  paused"] }));
      patch("feature", (mission) =>
        markTodo(
          {
            ...mission,
            agentId: "kit",
            cursor: "card",
            diff: FEATURE_DIFF,
            terminal: ["pnpm test board/feature-from-insight", "  ✓ lands in next", "  ✓ now stays empty"],
          },
          "link",
          true,
        ),
      );
      dispatch({ type: "tab", person: "owen", tab: "terminal" });
      await wait(900);
      if (dead()) return;
      dispatch({ type: "tab", person: "owen", tab: "changes" });
      dispatch({ type: "tab", person: "tereza", tab: "playbook" });
      await wait(600);
      if (dead()) return;
      dispatch({ type: "add-step", missionId: "feature", label: "Empty insight" });
      await wait(900);
      if (dead()) return;
      patch("feature", (mission) => ({
        ...goTo(mission, "accept"),
        desktop: 3,
        cursor: null,
        agentId: "ada",
        waits: { tereza: "qq", owen: "stake" },
        terminal: [...mission.terminal, "  ✓ empty insight still links"],
        artifacts: [
          ...mission.artifacts,
          {
            id: "check",
            kind: "Check",
            title: "feature-from-insight",
            body: "lands in next · now stays empty · empty insight still links",
          },
        ],
        typing: "tereza",
      }));
      dispatch({ type: "ping", person: "tereza", on: true });
      dispatch({ type: "file", id: "check" });
      await wait(700);
      if (dead()) return;
      patch("feature", (mission) => ({
        ...mission,
        typing: null,
        threads: {
          ...mission.threads,
          tereza: [
            ...mission.threads.tereza,
            { id: "q2", from: "agent", text: "Karta sedí v Next. Bereme?" },
          ],
        },
      }));
      await wait(900);
      if (dead()) return;
      dispatch({ type: "ping", person: "tereza", on: false });
      dispatch({ type: "close", missionId: "feature", tone: "done" });
      setRunId(0);
    })();

    return () => {
      cancel = true;
    };
  }, [runId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
      <div className="flex items-center justify-end gap-2 py-2">
        <button
          type="button"
          onClick={() => {
            if (playing) setRunId(0);
            else setRunId((value) => value + 1);
          }}
          className="rounded-full bg-white/10 px-3 py-1 text-[12px] text-[var(--stage-fg)]"
        >
          {playing ? "Stop" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRunId(0);
            dispatch({ type: "reset" });
          }}
          className="rounded-full px-3 py-1 text-[12px] text-[var(--stage-muted)]"
        >
          Reset
        </button>
      </div>
      <div className="grid min-h-[640px] min-w-[1440px] flex-1 grid-cols-2 gap-3">
        {SEATS.map((seat) => (
          <Window key={seat.id} world={world} person={seat.id} dispatch={dispatch} />
        ))}
      </div>
    </div>
  );
}

function Window({
  world,
  person,
  dispatch,
}: {
  world: World;
  person: PersonId;
  dispatch: (action: Action) => void;
}) {
  const meta = SEATS.find((seat) => seat.id === person)!;
  const seat = world.seats[person];
  const mission = world.missions.find((item) => item.id === seat.missionId) ?? null;
  const rows = visibleMissions(world, person);

  return (
    <section
      className={[
        "relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border bg-[#f5f5f4] text-[#1c1c1c] shadow-[0_24px_60px_rgba(0,0,0,0.28)]",
        seat.ping ? "border-[#16a34a]" : "border-white/10",
      ].join(" ")}
    >
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[200px] shrink-0 flex-col border-r border-black/10 bg-[#f3f3f1]">
          <div className="flex items-baseline justify-between px-3 pt-3">
            <div>
              <div className="text-[13px] font-semibold">{meta.name}</div>
              <div className="text-[11px] text-[#6b6b66]">{meta.role}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "create", person, open: true })}
            className="mx-2 mt-3 flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-black/5"
          >
            <span className="text-[16px] leading-none text-[#3f3f3a]">+</span>
            Mission
          </button>
          <div className="mt-2 flex flex-wrap gap-1 px-2">
            {FILTERS.map((filter) => {
              const count = world.missions.filter(
                (item) => item.status === "open" && item.waits[person] === filter.id,
              ).length;
              const on = seat.filter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => dispatch({ type: "filter", person, filter: filter.id })}
                  className={[
                    "rounded-md px-1.5 py-1 text-[10px] font-medium",
                    on ? "bg-[#1c1c1c] text-white" : "text-[#5c5c57] hover:bg-black/5",
                  ].join(" ")}
                >
                  {filter.label}
                  <span className="ml-1 tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {ROOMS.map((room) => {
              const inRoom = rows.filter((item) => item.roomId === room.id);
              if (inRoom.length === 0) return null;
              return (
                <div key={room.id} className="mb-3">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "room", person, roomId: room.id })}
                    className="px-1.5 text-[11px] font-medium text-[#6d6d68] hover:text-[#1c1c1c]"
                  >
                    {room.name}
                  </button>
                  <ul className="mt-1 space-y-0.5">
                    {inRoom.map((item) => {
                      const on = seat.screen === "mission" && seat.missionId === item.id;
                      const wait = item.waits[person];
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => dispatch({ type: "open", person, missionId: item.id })}
                            className={[
                              "flex w-full items-start gap-2 rounded-lg px-1.5 py-1.5 text-left",
                              on ? "bg-white shadow-sm" : "hover:bg-black/5",
                              wait === "qq" ? "qq-row" : "",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                                wait === "qq" ? "bg-[#15803d]" : "",
                                wait === "dq" ? "bg-[#d97706]" : "",
                                wait === "stake" ? "bg-[#c4c4be]" : "",
                              ].join(" ")}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px]">{item.title}</span>
                              <span className="block truncate text-[11px] text-[#6d6d68]">
                                {missionGate(item)}
                              </span>
                            </span>
                            {item.agentId ? (
                              <span className="mt-0.5 text-[#1c1c1c]">
                                <NineDots />
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          {seat.screen === "room" && seat.roomId ? (
            <RoomCenter
              world={world}
              roomId={seat.roomId}
              onOpen={(missionId) => dispatch({ type: "open", person, missionId })}
              onHome={() => dispatch({ type: "home", person })}
            />
          ) : mission && seat.screen === "mission" ? (
            <MissionCenter world={world} person={person} mission={mission} dispatch={dispatch} />
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {seat.panel ? (
          <aside className="flex w-[220px] shrink-0 flex-col border-l border-black/10 bg-[#fafaf9]">
            {seat.screen === "room" && seat.roomId ? (
              <PoolPanel world={world} roomId={seat.roomId} />
            ) : mission ? (
              <SidePanel world={world} mission={mission} tab={seat.tab} dispatch={dispatch} />
            ) : (
              <div className="flex-1" />
            )}
          </aside>
        ) : null}

        <nav className="flex w-11 shrink-0 flex-col items-center gap-1 border-l border-black/8 bg-[#f7f7f5] py-2">
          {meta.tabs.map((tab) => {
            const on = seat.tab === tab && seat.panel && seat.screen !== "room";
            return (
              <button
                key={tab}
                type="button"
                title={TAB_LABEL[tab]}
                onClick={() => dispatch({ type: "tab", person, tab })}
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  on ? "bg-black/8 text-[#1c1c1c]" : "text-[#6b6b66] hover:bg-black/5",
                ].join(" ")}
              >
                <Icon d={ICONS[tab]} />
              </button>
            );
          })}
        </nav>
      </div>

      {seat.create ? (
        <CreateDialog person={person} world={world} dispatch={dispatch} />
      ) : null}
    </section>
  );
}

function RoomCenter({
  world,
  roomId,
  onOpen,
  onHome,
}: {
  world: World;
  roomId: string;
  onOpen: (missionId: string) => void;
  onHome: () => void;
}) {
  const room = ROOMS.find((item) => item.id === roomId);
  const missions = world.missions.filter((mission) => mission.roomId === roomId);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-black/8 px-3 py-2">
        <button type="button" onClick={onHome} className="text-[16px] text-[#6b6b66]">
          ‹
        </button>
        <div className="text-[14px] font-semibold">{room?.name}</div>
      </header>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {missions.map((mission) => {
          const who = blocker(mission);
          return (
            <li key={mission.id}>
              <button
                type="button"
                onClick={() => onOpen(mission.id)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/5"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px]">{mission.title}</span>
                  <span className="block text-[11px] text-[#6d6d68]">{missionGate(mission)}</span>
                </span>
                {mission.agentId ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#1c1c1c]">
                    <NineDots />
                    {agentName(mission.agentId)}
                  </span>
                ) : who ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eceae4] text-[10px] font-semibold">
                    {personName(who).slice(0, 1)}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PoolPanel({ world, roomId }: { world: World; roomId: string }) {
  const roomMissions = world.missions.filter((mission) => mission.roomId === roomId);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3">
      <div className="text-[11px] font-medium text-[#6d6d68]">Stakeholders</div>
      <ul className="mt-2 space-y-1.5">
        {SEATS.map((seat) => (
          <li key={seat.id} className="flex items-center gap-2 text-[13px]">
            <span className="agent-free h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
            <span>{seat.name}</span>
            <span className="text-[11px] text-[#8a8a84]">{seat.role}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-[11px] font-medium text-[#6d6d68]">Agents</div>
      <ul className="mt-2 space-y-2">
        {AGENTS.map((agent) => {
          const on = roomMissions.find((mission) => mission.agentId === agent.id && mission.status === "open");
          return (
            <li key={agent.id} className="flex items-center gap-2">
              {on ? (
                <span className="text-[#1c1c1c]">
                  <NineDots />
                </span>
              ) : (
                <span className="agent-free h-2 w-2 rounded-full bg-[#a3a39c]" />
              )}
              <span className="min-w-0">
                <span className="block text-[13px]">{agent.name}</span>
                <span className="block truncate text-[11px] text-[#6d6d68]">{on ? on.title : "Free"}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MissionCenter({
  world,
  person,
  mission,
  dispatch,
}: {
  world: World;
  person: PersonId;
  mission: Mission;
  dispatch: (action: Action) => void;
}) {
  const seat = world.seats[person];
  const room = ROOMS.find((item) => item.id === mission.roomId);
  const mine = seat.thread === person;
  const lines = mission.threads[seat.thread];
  const canClose =
    mission.status === "open" && mission.waits[person] === "qq" && currentStep(mission)?.id === "accept";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-black/8 px-3 py-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "home", person })}
          className="text-[16px] text-[#6b6b66]"
        >
          ‹
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold">{mission.title}</div>
          <button
            type="button"
            onClick={() => dispatch({ type: "room", person, roomId: mission.roomId })}
            className="text-[11px] text-[#6d6d68] hover:text-[#1c1c1c]"
          >
            In {room?.name}
          </button>
        </div>
        <div className="flex items-center gap-1">
          {SEATS.map((item) => (
            <span
              key={item.id}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eceae4] text-[10px] font-semibold"
              title={item.name}
            >
              {item.name.slice(0, 1)}
            </span>
          ))}
          {mission.agentId ? (
            <span className="ml-1 text-[#1c1c1c]">
              <NineDots />
            </span>
          ) : null}
        </div>
      </header>
      <div className="flex gap-1 border-b border-black/8 px-3">
        {SEATS.map((item) => {
          const on = seat.thread === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => dispatch({ type: "thread", person, thread: item.id })}
              className={[
                "border-b-2 px-2 py-1.5 text-[12px]",
                on ? "border-[#1c1c1c] font-medium" : "border-transparent text-[#6d6d68]",
              ].join(" ")}
            >
              {item.name}
            </button>
          );
        })}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {lines.map((line) => (
          <p
            key={line.id}
            className={[
              "max-w-[92%] rounded-2xl px-3 py-2 text-[13px] leading-snug",
              line.from === "agent" ? "bg-[#f4f4f1] text-[#1c1c1c]" : "ml-auto bg-[#1c1c1c] text-white",
            ].join(" ")}
          >
            {line.text}
          </p>
        ))}
        {mission.typing === seat.thread ? (
          <p className="inline-flex rounded-2xl bg-[#f4f4f1] px-3 py-2 text-[#1c1c1c]">
            <NineDots />
          </p>
        ) : null}
      </div>
      {canClose ? (
        <div className="flex justify-end gap-2 px-3 pb-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "close", missionId: mission.id, tone: "done" })}
            className="rounded-full bg-[#14532d] px-3 py-1 text-[12px] font-medium text-white"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "close", missionId: mission.id, tone: "garbage" })}
            className="rounded-full bg-[#9f1239] px-3 py-1 text-[12px] font-medium text-white"
          >
            Garbage
          </button>
        </div>
      ) : null}
      {mine && mission.status === "open" ? (
        <form
          className="border-t border-black/8 p-2"
          onSubmit={(event) => {
            event.preventDefault();
            dispatch({ type: "send", person });
          }}
        >
          <div className="flex items-end gap-2 rounded-xl border border-black/10 bg-[#fafaf9] px-2 py-1.5">
            <textarea
              value={seat.draft}
              onChange={(event) => dispatch({ type: "draft", person, text: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  dispatch({ type: "send", person });
                }
              }}
              rows={1}
              className="max-h-24 min-h-6 flex-1 resize-none bg-transparent text-[13px] outline-none"
            />
            <button
              type="submit"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1c1c1c] text-[12px] text-white"
            >
              ↑
            </button>
          </div>
        </form>
      ) : (
        <div className="h-2" />
      )}
    </div>
  );
}

function SidePanel({
  world,
  mission,
  tab,
  dispatch,
}: {
  world: World;
  mission: Mission;
  tab: TabId;
  dispatch: (action: Action) => void;
}) {
  if (tab === "playbook") return <Playbook mission={mission} dispatch={dispatch} />;
  if (tab === "files") return <Files world={world} mission={mission} dispatch={dispatch} />;
  if (tab === "desktop") return <Desktop mission={mission} />;
  if (tab === "changes") return <Changes mission={mission} />;
  return <Terminal mission={mission} />;
}

function Playbook({ mission, dispatch }: { mission: Mission; dispatch: (action: Action) => void }) {
  const [label, setLabel] = useState("");
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3">
      <div className="text-[11px] font-medium text-[#6d6d68]">Playbook</div>
      <ol className="relative mt-2 space-y-1">
        <span className="absolute bottom-2 left-[7px] top-2 w-px bg-[#e4e4e0]" />
        {mission.steps.map((step) => (
          <li key={step.id} className={["relative flex items-center gap-2 rounded-md px-0.5 py-1", step.fresh ? "bg-[#fff7ed]" : ""].join(" ")}>
            <span
              className={[
                "relative z-10 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#fafaf9]",
                step.state === "done" ? "bg-[#15803d]" : "",
                step.state === "now" ? "bg-[#1c1c1c]" : "",
                step.state === "next" ? "bg-[#d6d6d1]" : "",
              ].join(" ")}
            />
            <span className={["text-[13px]", step.state === "next" ? "text-[#8a8a84]" : ""].join(" ")}>
              {step.label}
            </span>
          </li>
        ))}
      </ol>
      {mission.status === "open" ? (
        <form
          className="mt-2 flex gap-1"
          onSubmit={(event) => {
            event.preventDefault();
            dispatch({ type: "add-step", missionId: mission.id, label });
            setLabel("");
          }}
        >
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="min-w-0 flex-1 rounded-md border border-black/10 bg-white px-2 py-1 text-[12px] outline-none"
          />
          <button type="submit" className="rounded-md bg-[#1c1c1c] px-2 text-[12px] text-white">
            +
          </button>
        </form>
      ) : null}
      <div className="mt-4 text-[11px] font-medium text-[#6d6d68]">Todos</div>
      <ul className="mt-1 space-y-1">
        {mission.todos.map((todo) => (
          <li key={todo.id}>
            <button
              type="button"
              onClick={() => dispatch({ type: "toggle-todo", missionId: mission.id, todoId: todo.id })}
              className="flex w-full items-center gap-2 rounded-md px-0.5 py-1 text-left text-[13px] hover:bg-black/5"
            >
              <span
                className={[
                  "flex h-3.5 w-3.5 items-center justify-center rounded border text-[9px]",
                  todo.done ? "border-[#15803d] bg-[#15803d] text-white" : "border-[#c8c8c2]",
                ].join(" ")}
              >
                {todo.done ? "✓" : ""}
              </span>
              <span className={todo.done ? "text-[#8a8a84] line-through" : ""}>{todo.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Files({
  world,
  mission,
  dispatch,
}: {
  world: World;
  mission: Mission;
  dispatch: (action: Action) => void;
}) {
  const open = mission.artifacts.find((artifact) => artifact.id === world.fileId) ?? mission.artifacts.at(-1);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {mission.artifacts.map((artifact) => {
          const on = open?.id === artifact.id;
          return (
            <li key={artifact.id}>
              <button
                type="button"
                onClick={() => dispatch({ type: "file", id: artifact.id })}
                className={[
                  "flex w-full flex-col rounded-lg px-2 py-1.5 text-left",
                  on ? "bg-white shadow-sm" : "hover:bg-black/4",
                ].join(" ")}
              >
                <span className="text-[10px] font-medium uppercase tracking-wide text-[#8a8a84]">
                  {artifact.kind}
                </span>
                <span className="text-[13px]">{artifact.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {open ? (
        <p className="border-t border-black/8 px-3 py-2 text-[12px] leading-snug text-[#3f3f3a]">{open.body}</p>
      ) : null}
    </div>
  );
}

function Desktop({ mission }: { mission: Mission }) {
  const phase = mission.desktop;
  const cursor =
    mission.cursor === "button" ? { left: "38%", top: "46%" } : mission.cursor === "card" ? { left: "70%", top: "28%" } : null;
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-[#f4f1ea] p-3">
      <div className="grid h-full grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr] gap-1.5 text-[10px]">
        <div className="rounded-lg bg-white p-1.5">
          <div className="mb-1 font-medium text-[#6d6d68]">Insights</div>
          <div className="rounded-md border border-black/8 p-1.5">
            <div className="font-medium text-[#1c1c1c]">Acme</div>
            <div className="text-[#6d6d68]">Export dies after 200 rows</div>
            {phase >= 1 ? (
              <div className="mt-1 inline-flex rounded bg-[#1c1c1c] px-1.5 py-0.5 text-white">New feature</div>
            ) : null}
          </div>
          <div className="mt-1 rounded-md border border-black/8 p-1.5">
            <div className="font-medium text-[#1c1c1c]">North</div>
            <div className="text-[#a3a39c]">—</div>
          </div>
        </div>
        {["Now", "Next", "Later"].map((column) => (
          <div key={column} className="rounded-lg bg-white/70 p-1.5">
            <div className="mb-1 font-medium text-[#6d6d68]">{column}</div>
            {column === "Next" && phase >= 2 ? (
              <div className="rounded-md bg-white p-1.5 shadow-sm">
                <div className="font-medium">Export limit</div>
                <div className="text-[#6d6d68]">Export dies after 200 rows</div>
              </div>
            ) : null}
            {column === "Next" && phase >= 3 ? (
              <div className="mt-1 rounded-md border border-dashed border-[#d6d6d1] bg-white p-1.5">
                <div className="font-medium">North</div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {cursor && mission.agentId ? (
        <span
          className="pointer-events-none absolute text-[#1c1c1c] transition-all duration-700 ease-out"
          style={cursor}
        >
          <NineDots />
        </span>
      ) : null}
    </div>
  );
}

function Changes({ mission }: { mission: Mission }) {
  if (!mission.diff) return <div className="flex-1" />;
  return (
    <pre className="min-h-0 flex-1 overflow-auto p-3 text-[11px] leading-relaxed text-[#14532d]">{mission.diff}</pre>
  );
}

function Terminal({ mission }: { mission: Mission }) {
  return (
    <pre className="min-h-0 flex-1 overflow-auto bg-[#1e1e1e] p-3 text-[11px] leading-relaxed text-[#86efac]">
      {mission.terminal.join("\n")}
    </pre>
  );
}

function CreateDialog({
  person,
  world,
  dispatch,
}: {
  person: PersonId;
  world: World;
  dispatch: (action: Action) => void;
}) {
  const form = world.seats[person].form;
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center bg-black/25 pt-16">
      <form
        className="w-[320px] rounded-xl bg-white p-3 shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: "submit-create", person });
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[14px] font-semibold">Mission</div>
          <button type="button" onClick={() => dispatch({ type: "create", person, open: false })} className="text-[#6b6b66]">
            ×
          </button>
        </div>
        <label className="mt-2 block text-[11px] text-[#6d6d68]">Room</label>
        <select
          value={form.roomId}
          onChange={(event) => dispatch({ type: "form", person, patch: { roomId: event.target.value } })}
          className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-[13px]"
        >
          {ROOMS.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        <label className="mt-2 block text-[11px] text-[#6d6d68]">Summary</label>
        <input
          value={form.title}
          onChange={(event) => dispatch({ type: "form", person, patch: { title: event.target.value } })}
          className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-[13px] outline-none"
          autoFocus
        />
        <label className="mt-2 block text-[11px] text-[#6d6d68]">Playbook</label>
        <select
          value={form.bookId}
          onChange={(event) => dispatch({ type: "form", person, patch: { bookId: event.target.value } })}
          className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-[13px]"
        >
          {BOOKS.map((book) => (
            <option key={book.id} value={book.id}>
              {book.name}
            </option>
          ))}
        </select>
        <button type="submit" className="mt-3 w-full rounded-lg bg-[#1c1c1c] py-1.5 text-[13px] font-medium text-white">
          Create
        </button>
      </form>
    </div>
  );
}
