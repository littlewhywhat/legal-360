export type PersonId = "mira" | "lea";
export type FilterId = "qq" | "dq" | "stakeholder";
export type Wait = "qq" | "dq";
export type ArtifactKind = "decision" | "spec" | "design" | "diff" | "verification" | "copy";
export type StepState = "done" | "current" | "upcoming";
export type AgentMode = "free" | "busy" | "offline";
export type BookId = "ship" | "decide" | "build";

export type Person = {
  id: PersonId;
  name: string;
  role: string;
  lang: string;
};

export type Step = {
  id: string;
  label: string;
  state: StepState;
  fresh?: boolean;
};

export type Todo = { id: string; text: string; done: boolean };

export type Artifact = {
  id: string;
  kind: ArtifactKind;
  title: string;
  detail: string;
};

export type ChatLine = {
  id: string;
  from: "agent" | PersonId;
  text: string;
  tag?: Wait;
};

export type Mission = {
  id: string;
  roomId: string;
  title: string;
  description: string;
  steps: Step[];
  todos: Todo[];
  artifacts: Artifact[];
  chats: Record<PersonId, ChatLine[]>;
  waits: Partial<Record<PersonId, Wait>>;
  agentId: string | null;
  creatorId: PersonId;
  opening: string;
  boot: "agent" | "ask" | null;
  agentDraft: { person: PersonId; text: string; tag?: Wait } | null;
  closed: "done" | "garbage" | null;
};

export type Agent = {
  id: string;
  name: string;
  roomId: string;
  mode: AgentMode;
  missionId?: string;
};

export type Room = {
  id: string;
  name: string;
  context: string;
};

export type Book = { id: BookId; name: string; steps: string[] };

export type CreateForm = {
  title: string;
  description: string;
  roomId: string;
  bookId: BookId;
};

export type Column = {
  screen: "list" | "mission" | "room";
  filter: FilterId;
  missionId: string | null;
  roomId: string | null;
  draft: string;
  modal: boolean;
  form: CreateForm;
  pushedId: string | null;
  adding: boolean;
  checkpoint: string;
  chatTab: PersonId;
};

export type World = {
  missions: Mission[];
  agents: Agent[];
  columns: Record<PersonId, Column>;
  spot: PersonId | null;
};

export const PEOPLE: Person[] = [
  { id: "mira", name: "Mira", role: "Product owner", lang: "en" },
  { id: "lea", name: "Lea", role: "UX designer", lang: "cs" },
];

export const ROOMS: Room[] = [
  { id: "product", name: "Product", context: "Pricing and checkout" },
  { id: "activation", name: "Activation", context: "First session" },
];

export const BOOKS: Book[] = [
  {
    id: "ship",
    name: "Ship",
    steps: ["Frame", "Decide", "Spec", "Design", "Implement", "Verify", "Accept"],
  },
  { id: "decide", name: "Decide", steps: ["Frame", "Options", "Decide", "Record"] },
  { id: "build", name: "Build", steps: ["Spec", "Implement", "Verify"] },
];

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: "qq", label: "QQ" },
  { id: "dq", label: "DQ" },
  { id: "stakeholder", label: "Stakeholder" },
];

const EMPTY_CHATS = (): Record<PersonId, ChatLine[]> => ({ mira: [], lea: [] });

let seq = 1;
export function uid(prefix: string) {
  seq += 1;
  return `${prefix}-${seq}`;
}

function stepsFrom(labels: string[], current: string): Step[] {
  const idx = labels.indexOf(current);
  return labels.map((label, i) => ({
    id: label.toLowerCase(),
    label,
    state: i < idx ? "done" : i === idx ? "current" : "upcoming",
  }));
}

function column(person: PersonId, filter: FilterId): Column {
  return {
    screen: "list",
    filter,
    missionId: null,
    roomId: null,
    draft: "",
    modal: false,
    form: { title: "", description: "", roomId: "product", bookId: "ship" },
    pushedId: null,
    adding: false,
    checkpoint: "",
    chatTab: person,
  };
}

function mission(
  partial: Omit<Mission, "chats" | "agentDraft" | "closed" | "boot" | "opening" | "creatorId" | "description"> &
    Partial<Pick<Mission, "chats" | "opening" | "creatorId" | "description">>,
): Mission {
  return {
    description: "",
    agentDraft: null,
    closed: null,
    boot: null,
    opening: "",
    creatorId: "mira",
    ...partial,
    chats: partial.chats ?? EMPTY_CHATS(),
  };
}

export function createWorld(): World {
  return {
    spot: null,
    agents: [
      { id: "nova", name: "Nova", roomId: "product", mode: "free" },
      { id: "kit", name: "Kit", roomId: "product", mode: "busy", missionId: "prorate" },
      { id: "lumen", name: "Lumen", roomId: "product", mode: "free" },
      { id: "io", name: "Io", roomId: "activation", mode: "busy", missionId: "empty" },
      { id: "nia", name: "Nia", roomId: "activation", mode: "offline" },
    ],
    columns: {
      mira: column("mira", "dq"),
      lea: column("lea", "qq"),
    },
    missions: [
      mission({
        id: "hierarchy",
        roomId: "product",
        title: "Pricing page hierarchy",
        creatorId: "lea",
        steps: stepsFrom(["Research", "Design", "Review", "Handoff"], "Review"),
        todos: [
          { id: "h1", text: "Annual card leads", done: true },
          { id: "h2", text: "Month as a quiet second line", done: false },
        ],
        artifacts: [{ id: "h-spec", kind: "spec", title: "Hierarchy spec", detail: "Annual card first" }],
        waits: { lea: "dq" },
        agentId: null,
        chats: {
          ...EMPTY_CHATS(),
          mira: [{ id: "h-m", from: "mira", text: "Annual card leads. Month can stay, smaller." }],
          lea: [{ id: "h-l", from: "agent", text: "Rozvržení ceny je ve tvém slotu.", tag: "dq" }],
        },
      }),
      mission({
        id: "prorate",
        roomId: "product",
        title: "Prorate plan changes",
        creatorId: "mira",
        steps: stepsFrom(["Spec", "Implement", "Verify"], "Implement"),
        todos: [
          { id: "p1", text: "Upgrade mid-cycle", done: false },
          { id: "p2", text: "Credit unused days", done: false },
        ],
        artifacts: [{ id: "p-spec", kind: "spec", title: "Proration note", detail: "Per day, not per cent" }],
        waits: {},
        agentId: "kit",
        chats: {
          mira: [{ id: "p-m", from: "mira", text: "Ship proration with the pricing change." }],
          lea: [{ id: "p-l", from: "lea", text: "Částku ukaž až v souhrnu objednávky." }],
        },
      }),
      mission({
        id: "freetier",
        roomId: "activation",
        title: "Free tier limits",
        creatorId: "mira",
        steps: stepsFrom(["Frame", "Decide", "Record"], "Decide"),
        todos: [{ id: "ft1", text: "Pick the event cap", done: false }],
        artifacts: [{ id: "ft-spec", kind: "spec", title: "Limit options", detail: "100 or 1,000 events" }],
        waits: { mira: "dq" },
        agentId: null,
        chats: {
          ...EMPTY_CHATS(),
          mira: [{ id: "ft-m", from: "agent", text: "Free cap — 100 events a month, or 1,000?", tag: "dq" }],
        },
      }),
      mission({
        id: "empty",
        roomId: "activation",
        title: "Pricing empty state",
        creatorId: "lea",
        steps: stepsFrom(["Frame", "Design", "Handoff"], "Frame"),
        todos: [],
        artifacts: [],
        waits: { lea: "qq" },
        agentId: "io",
        chats: {
          ...EMPTY_CHATS(),
          lea: [{ id: "e-l", from: "agent", text: "Prázdný stav — ilustrace, nebo jen text?", tag: "qq" }],
        },
      }),
      mission({
        id: "checklist",
        roomId: "activation",
        title: "Onboarding checklist",
        creatorId: "lea",
        steps: stepsFrom(["Draft", "Review", "Ship"], "Review"),
        todos: [{ id: "c1", text: "First-run steps", done: false }],
        artifacts: [],
        waits: {},
        agentId: null,
        chats: {
          mira: [{ id: "c-m", from: "mira", text: "Three steps is enough for the first run." }],
          lea: [{ id: "c-l", from: "lea", text: "Tři kroky. Ikona u každého." }],
        },
      }),
    ],
  };
}

export function personById(id: PersonId) {
  return PEOPLE.find((person) => person.id === id) ?? PEOPLE[0];
}

export function roomById(id: string) {
  return ROOMS.find((room) => room.id === id) ?? ROOMS[0];
}

export function bookById(id: BookId) {
  return BOOKS.find((book) => book.id === id) ?? BOOKS[0];
}

export function missionById(world: World, id: string | null) {
  if (!id) return undefined;
  return world.missions.find((mission) => mission.id === id);
}

export function currentStep(mission: Mission) {
  return mission.steps.find((step) => step.state === "current");
}

export function bucket(mission: Mission, person: PersonId): FilterId | null {
  if (mission.closed) return "stakeholder";
  const wait = mission.waits[person];
  if (wait === "qq" || wait === "dq") return wait;
  return "stakeholder";
}

export function visibleMissions(world: World, person: PersonId) {
  return world.missions.filter((mission) => bucket(mission, person) === world.columns[person].filter);
}

export function countFilter(world: World, person: PersonId, filter: FilterId) {
  return world.missions.filter((mission) => bucket(mission, person) === filter).length;
}

export function blocker(mission: Mission): PersonId | null {
  const people = PEOPLE.map((person) => person.id);
  return people.find((id) => mission.waits[id] === "qq") ?? people.find((id) => mission.waits[id] === "dq") ?? null;
}

function mapMission(world: World, id: string, fn: (mission: Mission) => Mission): World {
  return {
    ...world,
    missions: world.missions.map((mission) => (mission.id === id ? fn(mission) : mission)),
  };
}

function patchColumn(world: World, person: PersonId, patch: Partial<Column>): World {
  return {
    ...world,
    columns: {
      ...world.columns,
      [person]: { ...world.columns[person], ...patch },
    },
  };
}

export function setChatTab(world: World, person: PersonId, chatTab: PersonId): World {
  return patchColumn(world, person, { chatTab });
}

export function setFilter(world: World, person: PersonId, filter: FilterId): World {
  return patchColumn(world, person, { filter });
}

export function openMission(world: World, person: PersonId, missionId: string): World {
  return {
    ...patchColumn(world, person, { screen: "mission", missionId, modal: false, adding: false, chatTab: person }),
    spot: person,
  };
}

export function showList(world: World, person: PersonId): World {
  return { ...patchColumn(world, person, { screen: "list", modal: false, adding: false }), spot: person };
}

export function openRoom(world: World, person: PersonId, roomId: string): World {
  return {
    ...patchColumn(world, person, { screen: "room", roomId, modal: false }),
    spot: person,
  };
}

export function backFromRoom(world: World, person: PersonId): World {
  const columnState = world.columns[person];
  if (columnState.missionId) return openMission(world, person, columnState.missionId);
  return showList(world, person);
}

export function openCreate(world: World, person: PersonId, roomId?: string): World {
  const form = world.columns[person].form;
  return patchColumn(world, person, {
    modal: true,
    form: {
      ...form,
      title: "",
      description: "",
      roomId: roomId ?? form.roomId,
    },
  });
}

export function closeCreate(world: World, person: PersonId): World {
  return patchColumn(world, person, { modal: false });
}

export function setForm(world: World, person: PersonId, patch: Partial<CreateForm>): World {
  return patchColumn(world, person, { form: { ...world.columns[person].form, ...patch } });
}

export function setDraft(world: World, person: PersonId, draft: string): World {
  return patchColumn(world, person, { draft });
}

export function setCheckpoint(world: World, person: PersonId, checkpoint: string): World {
  return patchColumn(world, person, { checkpoint, adding: true });
}

export function setAdding(world: World, person: PersonId, adding: boolean): World {
  return patchColumn(world, person, { adding, checkpoint: adding ? world.columns[person].checkpoint : "" });
}

export function clearPush(world: World, person: PersonId): World {
  return patchColumn(world, person, { pushedId: null });
}

export function setSpot(world: World, person: PersonId | null): World {
  return { ...world, spot: person };
}

function blankSteps(labels: string[]): Step[] {
  return labels.map((label, i) => ({
    id: label.toLowerCase(),
    label,
    state: i === 0 ? "current" : "upcoming",
  }));
}

export function createMission(
  world: World,
  person: PersonId,
  input: { id?: string; title: string; description: string; roomId: string; bookId: BookId; opening: string },
): World {
  const book = bookById(input.bookId);
  const id = input.id ?? uid("mission");
  const created: Mission = {
    id,
    roomId: input.roomId,
    title: input.title.trim() || "Untitled",
    description: input.description.trim(),
    steps: blankSteps(book.steps),
    todos: input.bookId === "ship" ? [{ id: uid("todo"), text: "Write the decision", done: false }] : [],
    artifacts: [],
    chats: EMPTY_CHATS(),
    waits: {},
    agentId: null,
    creatorId: person,
    opening: input.opening,
    boot: "agent",
    agentDraft: null,
    closed: null,
  };
  return {
    ...patchColumn(world, person, {
      modal: false,
      screen: "mission",
      missionId: id,
      draft: "",
      form: { title: "", description: "", roomId: input.roomId, bookId: input.bookId },
    }),
    spot: person,
    missions: [created, ...world.missions],
  };
}

export function advanceBoot(world: World): World {
  const mission = world.missions.find((item) => item.boot === "agent");
  if (!mission) return world;
  const agent = world.agents.find((item) => item.roomId === mission.roomId && item.mode === "free");
  return {
    ...world,
    agents: agent
      ? world.agents.map((item) =>
          item.id === agent.id ? { ...item, mode: "busy", missionId: mission.id } : item,
        )
      : world.agents,
    missions: world.missions.map((item) =>
      item.id === mission.id ? { ...item, boot: "ask", agentId: agent?.id ?? null } : item,
    ),
  };
}

export function setAgentDraft(
  world: World,
  missionId: string,
  person: PersonId,
  text: string,
  tag?: Wait,
): World {
  return mapMission(world, missionId, (mission) => ({
    ...mission,
    agentDraft: { person, text, tag },
  }));
}

export function commitAgentLine(
  world: World,
  missionId: string,
  person: PersonId,
  text: string,
  tag?: Wait,
): World {
  return mapMission(world, missionId, (mission) => ({
    ...mission,
    agentDraft: null,
    chats: {
      ...mission.chats,
      [person]: [...mission.chats[person], { id: uid("line"), from: "agent", text, tag }],
    },
  }));
}

export function finishAsk(world: World, missionId: string): World {
  const mission = missionById(world, missionId);
  if (!mission || mission.boot !== "ask") return world;
  const person = mission.creatorId;
  return {
    ...mapMission(world, missionId, (item) => ({
      ...item,
      boot: null,
      waits: { ...item.waits, [person]: "qq" },
    })),
    spot: person,
    columns: {
      ...world.columns,
      [person]: { ...world.columns[person], pushedId: missionId },
    },
  };
}

export function postChat(world: World, person: PersonId, text: string): World {
  const missionId = world.columns[person].missionId;
  const mission = missionById(world, missionId);
  if (!mission || !text.trim()) return world;
  const waits = { ...mission.waits };
  delete waits[person];
  return {
    ...mapMission(world, mission.id, (item) => ({
      ...item,
      waits,
      chats: {
        ...item.chats,
        [person]: [...item.chats[person], { id: uid("line"), from: person, text: text.trim() }],
      },
    })),
    columns: {
      ...world.columns,
      [person]: { ...world.columns[person], draft: "" },
    },
  };
}

export function goToStep(world: World, missionId: string, label: string): World {
  return mapMission(world, missionId, (mission) => {
    const idx = mission.steps.findIndex((step) => step.label === label);
    if (idx < 0) return mission;
    return {
      ...mission,
      steps: mission.steps.map((step, i) => ({
        ...step,
        state: i < idx ? "done" : i === idx ? "current" : "upcoming",
        fresh: Boolean(step.fresh && i > idx),
      })),
    };
  });
}

export function pushArtifact(world: World, missionId: string, artifact: Artifact): World {
  return mapMission(world, missionId, (mission) => ({
    ...mission,
    artifacts: [...mission.artifacts, artifact],
  }));
}

export function markTodo(world: World, missionId: string, text: string): World {
  return mapMission(world, missionId, (mission) => ({
    ...mission,
    todos: mission.todos.map((todo) => (todo.text === text ? { ...todo, done: true } : todo)),
  }));
}

export function toggleTodo(world: World, missionId: string, todoId: string): World {
  return mapMission(world, missionId, (mission) => ({
    ...mission,
    todos: mission.todos.map((todo) => (todo.id === todoId ? { ...todo, done: !todo.done } : todo)),
  }));
}

export function releaseAgent(world: World, missionId: string): World {
  const mission = missionById(world, missionId);
  if (!mission?.agentId) return world;
  const agentId = mission.agentId;
  return {
    ...mapMission(world, missionId, (item) => ({ ...item, agentId: null })),
    agents: world.agents.map((agent) =>
      agent.id === agentId ? { ...agent, mode: "free", missionId: undefined } : agent,
    ),
  };
}

export function assignFreeAgent(world: World, missionId: string): World {
  const mission = missionById(world, missionId);
  if (!mission || mission.agentId) return world;
  const agent = world.agents.find((item) => item.roomId === mission.roomId && item.mode === "free");
  if (!agent) return world;
  return {
    ...mapMission(world, missionId, (item) => ({ ...item, agentId: agent.id })),
    agents: world.agents.map((item) =>
      item.id === agent.id ? { ...item, mode: "busy", missionId } : item,
    ),
  };
}

export function setWait(world: World, missionId: string, person: PersonId, wait: Wait | null): World {
  return mapMission(world, missionId, (mission) => {
    const waits = { ...mission.waits };
    if (wait) waits[person] = wait;
    else delete waits[person];
    return { ...mission, waits };
  });
}

export function addCheckpoint(world: World, missionId: string, label: string): World {
  const name = label.trim();
  if (!name) return world;
  return mapMission(world, missionId, (mission) => {
    if (mission.steps.some((step) => step.label === name)) return mission;
    const steps = [...mission.steps];
    const accept = steps.findIndex((step) => step.label === "Accept");
    const step: Step = { id: uid("step"), label: name, state: "upcoming", fresh: true };
    if (accept >= 0) steps.splice(accept, 0, step);
    else steps.push(step);
    return { ...mission, steps };
  });
}

export function closeMission(world: World, missionId: string, tone: "done" | "garbage", person: PersonId): World {
  const text = tone === "done" ? "Accept." : "Garbage.";
  let next = postChat(world, person, text);
  const mission = missionById(next, missionId);
  if (!mission) return world;
  next = mapMission(next, missionId, (item) => ({
    ...item,
    closed: tone,
    waits: {},
    boot: null,
    steps: item.steps.map((step) => ({ ...step, state: "done", fresh: false })),
  }));
  return releaseAgent(next, missionId);
}
