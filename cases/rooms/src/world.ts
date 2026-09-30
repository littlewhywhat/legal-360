export type PersonId = "tereza" | "owen";
export type Board = "idle" | "placed" | "empty";
export type FilterId = "qq" | "dq" | "stake";
export type RightTab = "playbook" | "files" | "changes" | "terminal" | "browser";

export type Gate =
  | { kind: "agent" }
  | { kind: "qq" | "dq"; person: PersonId };

export type Step = {
  id: string;
  label: string;
  state: "done" | "now" | "next";
  gate: Gate;
  fresh?: boolean;
};

export type ChatLine = {
  id: string;
  from: "agent" | PersonId;
  text: string;
  fresh?: boolean;
  agentName?: string;
};

export type Artifact = {
  id: string;
  kind: "decision" | "spec" | "design" | "diff" | "check" | "copy" | "note";
  title: string;
  detail: string;
};

export type Mission = {
  id: string;
  roomId: string;
  title: string;
  playbook: string;
  status: "open" | "done" | "garbage";
  steps: Step[];
  todos: { id: string; text: string; done: boolean }[];
  wait: Partial<Record<PersonId, "qq" | "dq">>;
  blockedBy?: PersonId;
  agentId?: string;
  running?: boolean;
  artifacts: Artifact[];
  diff: string;
  terminal: string;
  chats: Record<PersonId, ChatLine[]>;
  drafts: Partial<Record<PersonId, string>>;
  board: Board;
};

export type Room = { id: string; name: string; context: string };
export type Agent = {
  id: string;
  name: string;
  roomId: string;
  status: "free" | "busy";
  missionId?: string;
};

export type World = {
  rooms: Room[];
  agents: Agent[];
  missions: Mission[];
};

export const PEOPLE: { id: PersonId; name: string; role: string }[] = [
  { id: "tereza", name: "Tereza", role: "Product" },
  { id: "owen", name: "Owen", role: "Engineering" },
];

export const RIGHT_TABS: Record<PersonId, RightTab[]> = {
  tereza: ["playbook", "files", "browser"],
  owen: ["playbook", "files", "changes", "terminal", "browser"],
};

export const BOOKS: { id: string; name: string; steps: string[] }[] = [
  {
    id: "ship",
    name: "Ship",
    steps: ["Frame", "Decide", "Spec", "Design", "Implement", "Verify", "Accept"],
  },
  { id: "decide", name: "Decide", steps: ["Frame", "Options", "Decide", "Record"] },
  { id: "build", name: "Build", steps: ["Spec", "Implement", "Verify"] },
];

const EMPTY_CHATS = (): Record<PersonId, ChatLine[]> => ({ tereza: [], owen: [] });

function step(id: string, label: string, state: Step["state"], gate: Gate): Step {
  return { id, label, state, gate };
}

function line(id: string, from: ChatLine["from"], text: string): ChatLine {
  return { id, from, text };
}

export function createWorld(): World {
  return worldAt(0);
}

function say(
  mission: Mission,
  person: PersonId,
  from: ChatLine["from"],
  text: string,
  fresh = false,
  agentName?: string,
): ChatLine {
  const item: ChatLine = {
    id: `${mission.id}-${person}-${mission.chats[person].length}-${text.slice(0, 8)}`,
    from,
    text,
    fresh,
    agentName,
  };
  mission.chats[person].push(item);
  return item;
}

function insightSteps(doneThrough: string, now?: string): Step[] {
  const labels: { id: string; label: string; gate: Gate }[] = [
    { id: "decide", label: "Decide", gate: { kind: "qq", person: "tereza" } },
    { id: "spec", label: "Spec", gate: { kind: "agent" } },
    { id: "implement", label: "Implement", gate: { kind: "dq", person: "owen" } },
    { id: "verify", label: "Verify", gate: { kind: "agent" } },
    { id: "accept", label: "Accept", gate: { kind: "qq", person: "tereza" } },
  ];
  const order = labels.map((item) => item.id);
  const doneIndex = order.indexOf(doneThrough);
  const nowIndex = now ? order.indexOf(now) : doneIndex + 1;
  return labels.map((item, index) =>
    step(
      item.id,
      item.label,
      index <= doneIndex ? "done" : index === nowIndex ? "now" : "next",
      item.gate,
    ),
  );
}

function baseWorld(): World {
  const insight: Mission = {
    id: "insight",
    roomId: "portal",
    title: "Insight column",
    playbook: "Ship",
    status: "open",
    steps: insightSteps("", "decide"),
    todos: [
      { id: "t1", text: "Column for the new card", done: false },
      { id: "t2", text: "Keep the quote on the card", done: false },
    ],
    wait: { tereza: "qq" },
    blockedBy: "tereza",
    artifacts: [],
    diff: "",
    terminal: "",
    chats: {
      tereza: [],
      owen: [],
    },
    drafts: { tereza: "Do Next. Now jen přetažením." },
    board: "idle",
  };
  say(
    insight,
    "tereza",
    "agent",
    "Nová karta z insightu — do kterého sloupce?",
    true,
    "Ada",
  );
  return {
    rooms: [{ id: "portal", name: "Portal", context: "Feature board" }],
    agents: [
      { id: "ada", name: "Ada", roomId: "portal", status: "free" },
      { id: "kit", name: "Kit", roomId: "portal", status: "busy", missionId: "theme" },
    ],
    missions: [
      insight,
      {
        id: "theme",
        roomId: "portal",
        title: "Portal theme",
        playbook: "Build",
        status: "open",
        steps: [
          step("spec", "Spec", "done", { kind: "agent" }),
          step("implement", "Implement", "now", { kind: "agent" }),
          step("verify", "Verify", "next", { kind: "agent" }),
        ],
        todos: [{ id: "t1", text: "Theme tokens", done: false }],
        wait: {},
        agentId: "kit",
        artifacts: [{ id: "theme-spec", kind: "spec", title: "Theme spec", detail: "Portal colors" }],
        diff: "",
        terminal: "",
        chats: {
          tereza: [{ id: "th-t", from: "agent", text: "Kit je na motivu.", agentName: "Kit" }],
          owen: [{ id: "th-o", from: "agent", text: "Theme build is in progress.", agentName: "Kit" }],
        },
        drafts: {},
        board: "idle",
      },
    ],
  };
}

function mark(mission: Mission, id: string, fresh = false) {
  for (const item of mission.steps) {
    if (item.id === id) {
      item.state = "now";
      item.fresh = fresh;
    } else if (item.state === "now") {
      item.state = "done";
    }
  }
}

export const LAST_BEAT = 8;

export type DeskFocus = {
  filter: FilterId;
  missionId: string;
  thread: PersonId;
  tab: RightTab;
};

export function focusAt(beat: number): Record<PersonId, DeskFocus> {
  const insight = "insight";
  const tereza = (filter: FilterId, tab: RightTab, thread: PersonId = "tereza"): DeskFocus => ({
    filter,
    missionId: insight,
    thread,
    tab,
  });
  const owen = (filter: FilterId, tab: RightTab, thread: PersonId = "owen"): DeskFocus => ({
    filter,
    missionId: insight,
    thread,
    tab,
  });
  if (beat <= 0) return { tereza: tereza("qq", "playbook"), owen: owen("stake", "playbook") };
  if (beat === 1) return { tereza: tereza("qq", "files"), owen: owen("stake", "playbook") };
  if (beat === 2) return { tereza: tereza("stake", "browser"), owen: owen("stake", "browser") };
  if (beat === 3) return { tereza: tereza("stake", "files"), owen: owen("dq", "playbook", "tereza") };
  if (beat === 4) return { tereza: tereza("stake", "files"), owen: owen("dq", "playbook") };
  if (beat === 5) return { tereza: tereza("stake", "files"), owen: owen("stake", "terminal") };
  if (beat === 6) return { tereza: tereza("stake", "playbook"), owen: owen("stake", "playbook") };
  if (beat === 7) return { tereza: tereza("qq", "browser"), owen: owen("stake", "changes") };
  return { tereza: tereza("stake", "playbook"), owen: owen("stake", "playbook") };
}

export function worldAt(beat: number): World {
  const world = baseWorld();
  const insight = world.missions[0];
  const theme = world.missions[1];
  const ada = world.agents[0];
  const kit = world.agents[1];
  const stepIndex = Math.max(0, Math.min(beat, LAST_BEAT));
  if (stepIndex === 0) return world;

  insight.chats.tereza[0].fresh = false;
  insight.drafts = {};
  say(insight, "tereza", "tereza", "Do Next. Now jen přetažením.");
  insight.artifacts.push({
    id: "decision",
    kind: "decision",
    title: "Decision",
    detail: "Do Next. Now jen přetažením.",
  });
  insight.steps = insightSteps("decide", "spec");
  insight.wait = {};
  insight.blockedBy = undefined;
  if (stepIndex === 1) return world;

  ada.status = "busy";
  ada.missionId = "insight";
  insight.agentId = "ada";
  insight.board = "placed";
  insight.artifacts.push({
    id: "spec",
    kind: "spec",
    title: "Spec",
    detail: "Card lands in Next with the quote",
  });
  if (stepIndex === 2) return world;

  ada.status = "free";
  ada.missionId = undefined;
  insight.agentId = undefined;
  insight.steps = insightSteps("spec", "implement");
  insight.wait = { owen: "dq" };
  insight.blockedBy = "owen";
  if (stepIndex === 3) return world;

  say(
    insight,
    "owen",
    "owen",
    "POST /features with insightId and column: next. Card keeps quote. Now stays empty unless someone drags it.",
    stepIndex === 4,
  );
  if (stepIndex === 4) return world;

  insight.wait = {};
  insight.blockedBy = undefined;
  insight.steps = insightSteps("implement", "verify");
  kit.missionId = "insight";
  theme.agentId = undefined;
  insight.agentId = "kit";
  insight.diff = "features/route.ts\n+ POST /features\n+ { insightId, column: \"next\" }";
  insight.terminal = "$ pnpm test insight-column\n✓ column: next\n✓ Now stays empty";
  insight.artifacts.push({
    id: "diff",
    kind: "diff",
    title: "features/route.ts",
    detail: "column: next",
  });
  if (stepIndex === 5) return world;

  insight.steps = [
    ...insight.steps.slice(0, 4),
    { ...step("empty", "Empty insight", "next", { kind: "agent" }), fresh: true },
    insight.steps[4],
  ];
  if (stepIndex === 6) return world;

  insight.steps = insight.steps.map((item) => {
    if (item.id === "verify" || item.id === "empty") return { ...item, state: "done", fresh: false };
    if (item.id === "accept") return { ...item, state: "now" };
    return item;
  });
  insight.board = "empty";
  insight.wait = { tereza: "qq" };
  insight.blockedBy = "tereza";
  say(insight, "tereza", "agent", "Karta sedí v Next. Bereme?", true, "Ada");
  insight.artifacts.push({
    id: "empty-card",
    kind: "design",
    title: "Empty insight",
    detail: "Card without a quote. Link stays.",
  });
  if (stepIndex === 7) return world;

  insight.status = "done";
  insight.wait = {};
  insight.blockedBy = undefined;
  insight.agentId = undefined;
  kit.status = "free";
  kit.missionId = undefined;
  insight.chats.tereza = insight.chats.tereza.map((item) => ({ ...item, fresh: false }));
  insight.steps = insight.steps.map((item) => ({ ...item, state: "done", fresh: false }));
  return world;
}

function clone(world: World): World {
  return structuredClone(world);
}

function missionOf(world: World, id: string) {
  const mission = world.missions.find((item) => item.id === id);
  if (!mission) throw new Error(`missing mission ${id}`);
  return mission;
}

function release(world: World, missionId: string) {
  for (const agent of world.agents) {
    if (agent.missionId === missionId) {
      agent.status = "free";
      agent.missionId = undefined;
    }
  }
  const mission = world.missions.find((item) => item.id === missionId);
  if (mission) mission.agentId = undefined;
}

function takeAgent(world: World, mission: Mission) {
  const current = world.agents.find((agent) => agent.missionId === mission.id);
  const free = world.agents.find(
    (agent) => agent.roomId === mission.roomId && agent.status === "free",
  );
  const agent = current ?? free;
  if (!agent) return;
  agent.status = "busy";
  agent.missionId = mission.id;
  mission.agentId = agent.id;
}

function promptFor(mission: Mission, step: Step, person: PersonId): string {
  const seeded: Record<string, string> = {
    annual: "Default on the pricing page — month or year?",
    hierarchy: "Roční karta nahoře, měsíční tišeji. Bereš?",
    empty: "Když cena ještě není, co ukážeme?",
    rounding: "Дробные центы: до дня или до цента?",
    flags: "Флаг на 10%. Глянь край месяца.",
    trial: "Mobile trial is 7 days. Keep it, or match desktop at 14?",
  };
  if (seeded[mission.id] && mission.chats[person].length === 0) return seeded[mission.id];
  if (step.label === "Accept") return "Checks are green. Accept this mission?";
  if (person === "tereza") return `${step.label}. Sedí ti to?`;
  return `${step.label}. Your call?`;
}

function artifactFor(step: Step, text: string): Artifact {
  const kind =
    step.label === "Design"
      ? "design"
      : step.label === "Spec"
        ? "spec"
        : step.label === "Implement"
          ? "diff"
          : step.label === "Verify"
            ? "check"
            : step.label === "Decide" || step.label === "Accept" || step.label === "Options"
              ? "decision"
              : "note";
  return {
    id: `${step.id}-${Date.now()}`,
    kind,
    title: step.label,
    detail: text,
  };
}

function enter(world: World, mission: Mission, next: Step | undefined, fromText: string) {
  if (!next) {
    for (const item of mission.steps) {
      if (item.state === "now") item.state = "done";
    }
    mission.running = false;
    release(world, mission.id);
    return;
  }
  for (const item of mission.steps) {
    if (item.state === "now") item.state = "done";
  }
  next.state = "now";
  next.fresh = true;
  if (next.gate.kind === "agent") {
    mission.wait = {};
    mission.blockedBy = undefined;
    mission.running = true;
    takeAgent(world, mission);
    return;
  }
  mission.running = false;
  release(world, mission.id);
  const person = next.gate.person;
  mission.wait = { [person]: next.gate.kind };
  mission.blockedBy = person;
  const text = fromText || promptFor(mission, next, person);
  mission.chats[person].push({
    id: `${mission.id}-${person}-${mission.chats[person].length}`,
    from: "agent",
    text,
    fresh: true,
  });
}

export function reply(world: World, missionId: string, person: PersonId, text: string): World {
  const nextWorld = clone(world);
  const mission = missionOf(nextWorld, missionId);
  const body = text.trim();
  if (!body || mission.status !== "open") return world;
  mission.chats[person].push({
    id: `${mission.id}-${person}-r-${mission.chats[person].length}`,
    from: person,
    text: body,
  });
  const waiting = mission.wait[person];
  if (!waiting) return nextWorld;
  const now = mission.steps.find((item) => item.state === "now");
  if (!now) return nextWorld;
  mission.artifacts.push(artifactFor(now, body));
  if (now.label === "Implement" || now.label === "Verify") {
    mission.diff = mission.diff || `notes/${mission.id}.md\n+ ${body}`;
  }
  const index = mission.steps.findIndex((item) => item.id === now.id);
  enter(nextWorld, mission, mission.steps[index + 1], "");
  return nextWorld;
}

export function stepRunning(world: World): World {
  const nextWorld = clone(world);
  let moved = false;
  for (const mission of nextWorld.missions) {
    if (!mission.running || mission.status !== "open") continue;
    const now = mission.steps.find((item) => item.state === "now");
    if (!now || now.gate.kind !== "agent") {
      mission.running = false;
      continue;
    }
    moved = true;
    const detail =
      now.label === "Spec"
        ? "Draft is on the mission"
        : now.label === "Implement"
          ? "Diff is on the mission"
          : now.label === "Verify"
            ? "Checks are green"
            : `${now.label} landed`;
    mission.artifacts.push(artifactFor(now, detail));
    if (now.label === "Implement") {
      mission.diff = `${mission.title.toLowerCase().replace(/\s+/g, "-")}.ts\n+ ${detail}`;
    }
    if (now.label === "Verify") {
      mission.terminal = `$ pnpm test ${mission.id}\n✓ ${detail}`;
    }
    const index = mission.steps.findIndex((item) => item.id === now.id);
    enter(nextWorld, mission, mission.steps[index + 1], "");
  }
  return moved ? nextWorld : world;
}

function gateFor(label: string): Gate {
  if (label === "Decide" || label === "Accept") return { kind: "qq", person: "tereza" };
  if (label === "Options" || label === "Implement") return { kind: "dq", person: "owen" };
  return { kind: "agent" };
}

export function createMission(
  world: World,
  roomId: string,
  title: string,
  playbookId: string,
): World {
  const book = BOOKS.find((item) => item.id === playbookId) ?? BOOKS[0];
  const summary = title.trim();
  if (!summary) return world;
  const nextWorld = clone(world);
  const id = `m-${Date.now()}`;
  const mission: Mission = {
    id,
    roomId,
    title: summary,
    playbook: book.name,
    status: "open",
    steps: book.steps.map((label, index) =>
      step(label.toLowerCase(), label, index === 0 ? "now" : "next", gateFor(label)),
    ),
    todos: [],
    wait: {},
    artifacts: [],
    diff: "",
    terminal: "",
    chats: EMPTY_CHATS(),
    drafts: {},
    running: false,
    board: "idle",
  };
  nextWorld.missions.unshift(mission);
  const first = mission.steps[0];
  if (first.gate.kind === "agent") {
    mission.running = true;
    takeAgent(nextWorld, mission);
  } else {
    enter(nextWorld, mission, first, "");
    first.state = "now";
  }
  return nextWorld;
}

export function addCheckpoint(world: World, missionId: string, label: string): World {
  const name = label.trim();
  if (!name) return world;
  const nextWorld = clone(world);
  const mission = missionOf(nextWorld, missionId);
  const extra: Step = {
    id: `extra-${Date.now()}`,
    label: name,
    state: "next",
    gate: { kind: "dq", person: "tereza" },
    fresh: true,
  };
  const accept = mission.steps.findIndex((item) => item.label === "Accept");
  if (accept >= 0) mission.steps.splice(accept, 0, extra);
  else mission.steps.push(extra);
  return nextWorld;
}

export function toggleTodo(world: World, missionId: string, todoId: string): World {
  const nextWorld = clone(world);
  const mission = missionOf(nextWorld, missionId);
  const todo = mission.todos.find((item) => item.id === todoId);
  if (todo) todo.done = !todo.done;
  return nextWorld;
}

export function addTodo(world: World, missionId: string, text: string): World {
  const name = text.trim();
  if (!name) return world;
  const nextWorld = clone(world);
  const mission = missionOf(nextWorld, missionId);
  mission.todos.push({ id: `todo-${Date.now()}`, text: name, done: false });
  return nextWorld;
}

export function closeMission(
  world: World,
  missionId: string,
  status: "done" | "garbage",
): World {
  const nextWorld = clone(world);
  const mission = missionOf(nextWorld, missionId);
  mission.status = status;
  mission.running = false;
  mission.wait = {};
  mission.blockedBy = undefined;
  release(nextWorld, mission.id);
  return nextWorld;
}

export function bucket(mission: Mission, person: PersonId): FilterId {
  const wait = mission.wait[person];
  if (wait === "qq") return "qq";
  if (wait === "dq") return "dq";
  return "stake";
}

export function openingLine(mission: Mission, person: PersonId): string | null {
  if (mission.wait[person] !== "qq" && mission.wait[person] !== "dq") return null;
  if (mission.chats[person].some((item) => item.from === "agent")) return null;
  const now = mission.steps.find((item) => item.state === "now");
  if (!now) return null;
  return promptFor(mission, now, person);
}
