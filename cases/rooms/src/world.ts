export type PersonId = "po" | "ux" | "dev";
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
  { id: "po", name: "Mira", role: "Product" },
  { id: "ux", name: "Lea", role: "Design" },
  { id: "dev", name: "Adam", role: "Engineering" },
];

export const RIGHT_TABS: Record<PersonId, RightTab[]> = {
  po: ["playbook", "files", "browser"],
  ux: ["playbook", "files", "browser"],
  dev: ["playbook", "files", "changes", "terminal", "browser"],
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

const EMPTY_CHATS = (): Record<PersonId, ChatLine[]> => ({ po: [], ux: [], dev: [] });

function step(id: string, label: string, state: Step["state"], gate: Gate): Step {
  return { id, label, state, gate };
}

function line(id: string, from: ChatLine["from"], text: string): ChatLine {
  return { id, from, text };
}

export function createWorld(): World {
  return {
    rooms: [
      { id: "product", name: "Product", context: "Pricing and checkout" },
      { id: "activation", name: "Activation", context: "Trial and first run" },
    ],
    agents: [
      { id: "nova", name: "Nova", roomId: "product", status: "busy", missionId: "rounding" },
      { id: "kit", name: "Kit", roomId: "product", status: "busy", missionId: "prorate" },
      { id: "nia", name: "Nia", roomId: "product", status: "busy", missionId: "empty" },
      { id: "wren", name: "Wren", roomId: "product", status: "busy", missionId: "annual" },
      { id: "ash", name: "Ash", roomId: "product", status: "free" },
      { id: "io", name: "Io", roomId: "activation", status: "busy", missionId: "checklist" },
      { id: "sol", name: "Sol", roomId: "activation", status: "free" },
    ],
    missions: [
      {
        id: "annual",
        roomId: "product",
        title: "Annual as default",
        playbook: "Ship",
        status: "open",
        steps: [
          step("frame", "Frame", "done", { kind: "agent" }),
          step("decide", "Decide", "now", { kind: "qq", person: "po" }),
          step("spec", "Spec", "next", { kind: "agent" }),
          step("design", "Design", "next", { kind: "dq", person: "ux" }),
          step("implement", "Implement", "next", { kind: "agent" }),
          step("verify", "Verify", "next", { kind: "agent" }),
          step("accept", "Accept", "next", { kind: "qq", person: "po" }),
        ],
        todos: [
          { id: "t1", text: "Name the default period", done: false },
          { id: "t2", text: "Keep month as the second line", done: false },
        ],
        wait: { po: "qq" },
        blockedBy: "po",
        agentId: "wren",
        artifacts: [],
        diff: "",
        terminal: "",
        chats: {
          po: [],
          ux: [line("a-ux-1", "agent", "Cena se teprve rozhoduje.")],
          dev: [line("a-dev-1", "agent", "Жду решение, флаг не трогаю.")],
        },
        drafts: { po: "Annual. Month stays on the second line." },
      },
      {
        id: "hierarchy",
        roomId: "product",
        title: "Pricing page hierarchy",
        playbook: "Ship",
        status: "open",
        steps: [
          step("frame", "Frame", "done", { kind: "agent" }),
          step("decide", "Decide", "done", { kind: "qq", person: "po" }),
          step("spec", "Spec", "done", { kind: "agent" }),
          step("design", "Design", "now", { kind: "dq", person: "ux" }),
          step("implement", "Implement", "next", { kind: "agent" }),
          step("verify", "Verify", "next", { kind: "agent" }),
          step("accept", "Accept", "next", { kind: "qq", person: "po" }),
        ],
        todos: [
          { id: "t1", text: "Annual card is primary", done: true },
          { id: "t2", text: "Monthly line stays quiet", done: false },
        ],
        wait: { ux: "dq" },
        blockedBy: "ux",
        artifacts: [
          {
            id: "spec-1",
            kind: "spec",
            title: "Pricing spec",
            detail: "Annual first, month secondary",
          },
        ],
        diff: "",
        terminal: "",
        chats: {
          po: [line("h-po", "po", "Annual is the default.")],
          ux: [],
          dev: [line("h-dev", "agent", "Вёрстку не начинаю, пока нет макета.")],
        },
        drafts: { ux: "Roční karta nahoře. Měsíční jako druhý řádek." },
      },
      {
        id: "prorate",
        roomId: "product",
        title: "Prorate plan changes",
        playbook: "Build",
        status: "open",
        steps: [
          step("spec", "Spec", "done", { kind: "agent" }),
          step("implement", "Implement", "now", { kind: "agent" }),
          step("verify", "Verify", "next", { kind: "agent" }),
        ],
        todos: [
          { id: "t1", text: "Credit leftover days", done: false },
          { id: "t2", text: "Round to the day", done: false },
        ],
        wait: {},
        agentId: "kit",
        artifacts: [
          { id: "pr-spec", kind: "spec", title: "Proration note", detail: "Mid-cycle upgrades" },
        ],
        diff: "checkout/prorate.ts\n- return roundCents(leftover)\n+ return roundToDay(leftover)",
        terminal: "$ pnpm test prorate\n✓ mid-cycle upgrade\n✓ leftover credit",
        chats: {
          po: [line("p-po", "agent", "Implementation is in progress.")],
          ux: [line("p-ux", "agent", "Na vzhled to teď nesahá.")],
          dev: [line("p-dev", "agent", "Считаю остаток в середине цикла.")],
        },
        drafts: {},
      },
      {
        id: "empty",
        roomId: "product",
        title: "Empty price state",
        playbook: "Ship",
        status: "open",
        steps: [
          step("frame", "Frame", "done", { kind: "agent" }),
          step("design", "Design", "now", { kind: "qq", person: "ux" }),
          step("accept", "Accept", "next", { kind: "qq", person: "po" }),
        ],
        todos: [{ id: "t1", text: "What shows before the price loads", done: false }],
        wait: { ux: "qq" },
        blockedBy: "ux",
        agentId: "nia",
        artifacts: [],
        diff: "",
        terminal: "",
        chats: {
          po: [],
          ux: [],
          dev: [],
        },
        drafts: { ux: "Tiché prázdno. Cena až po výpočtu." },
      },
      {
        id: "rounding",
        roomId: "product",
        title: "Rounding rule",
        playbook: "Decide",
        status: "open",
        steps: [
          step("frame", "Frame", "done", { kind: "agent" }),
          step("decide", "Decide", "now", { kind: "qq", person: "dev" }),
          step("record", "Record", "next", { kind: "agent" }),
        ],
        todos: [{ id: "t1", text: "Pick day or cent", done: false }],
        wait: { dev: "qq" },
        blockedBy: "dev",
        agentId: "nova",
        artifacts: [],
        diff: "",
        terminal: "",
        chats: { po: [], ux: [], dev: [] },
        drafts: { dev: "До дня, не half-up по центам." },
      },
      {
        id: "flags",
        roomId: "product",
        title: "Checkout flag rollout",
        playbook: "Build",
        status: "open",
        steps: [
          step("spec", "Spec", "done", { kind: "agent" }),
          step("implement", "Implement", "done", { kind: "agent" }),
          step("verify", "Verify", "now", { kind: "dq", person: "dev" }),
        ],
        todos: [{ id: "t1", text: "Look at month boundary", done: false }],
        wait: { dev: "dq" },
        blockedBy: "dev",
        artifacts: [
          { id: "fl-diff", kind: "diff", title: "pricing.annual_default", detail: "10% rollout" },
          { id: "fl-check", kind: "check", title: "Checks", detail: "Green on mid-cycle" },
        ],
        diff: "flags/pricing.ts\n+ annual_default: { percent: 10 }",
        terminal: "$ pnpm test flags\n✓ month boundary\n✓ annual default on",
        chats: {
          po: [line("f-po", "agent", "Rollout is at 10%.")],
          ux: [],
          dev: [],
        },
        drafts: { dev: "До дня. Катим дальше на 10%." },
      },
      {
        id: "trial",
        roomId: "activation",
        title: "Trial on mobile web",
        playbook: "Decide",
        status: "open",
        steps: [
          step("frame", "Frame", "done", { kind: "agent" }),
          step("options", "Options", "now", { kind: "dq", person: "po" }),
          step("decide", "Decide", "next", { kind: "qq", person: "po" }),
          step("record", "Record", "next", { kind: "agent" }),
        ],
        todos: [{ id: "t1", text: "Match or keep 7 days", done: false }],
        wait: { po: "dq" },
        blockedBy: "po",
        artifacts: [],
        diff: "",
        terminal: "",
        chats: {
          po: [],
          ux: [line("tr-ux", "agent", "Mobilní trial zatím neřeším.")],
          dev: [line("tr-dev", "agent", "Жду решение по длине trial.")],
        },
        drafts: { po: "Match desktop. 14 days." },
      },
      {
        id: "checklist",
        roomId: "activation",
        title: "Onboarding checklist",
        playbook: "Build",
        status: "open",
        steps: [
          step("spec", "Spec", "done", { kind: "agent" }),
          step("implement", "Implement", "now", { kind: "agent" }),
          step("verify", "Verify", "next", { kind: "agent" }),
        ],
        todos: [{ id: "t1", text: "First-run steps", done: false }],
        wait: {},
        agentId: "io",
        artifacts: [
          { id: "ob-spec", kind: "spec", title: "Checklist spec", detail: "Four steps, skippable" },
        ],
        diff: "",
        terminal: "",
        chats: {
          po: [line("c-po", "agent", "Checklist is being built.")],
          ux: [line("c-ux", "agent", "Pořadí kroků je v artefaktu.")],
          dev: [line("c-dev", "agent", "Собираю четыре шага, skip остаётся.")],
        },
        drafts: {},
      },
    ],
  };
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
  if (person === "ux") return `${step.label}. Sedí ti to?`;
  if (person === "dev") return `${step.label}. Глянешь?`;
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
  if (label === "Decide" || label === "Accept") return { kind: "qq", person: "po" };
  if (label === "Options") return { kind: "dq", person: "po" };
  if (label === "Design") return { kind: "dq", person: "ux" };
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
    gate: { kind: "dq", person: "po" },
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
