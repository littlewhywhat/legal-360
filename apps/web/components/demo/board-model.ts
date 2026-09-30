export type PersonId = "tereza" | "owen";
export type FilterId = "qq" | "dq" | "stake";
export type TabId = "playbook" | "files" | "desktop" | "changes" | "terminal";
export type Wait = "qq" | "dq" | "stake";

export type Step = { id: string; label: string; state: "done" | "now" | "next"; fresh?: boolean };
export type Todo = { id: string; label: string; done: boolean };
export type Artifact = { id: string; kind: string; title: string; body: string };
export type Line = { id: string; from: "agent" | PersonId; text: string };

export type Mission = {
  id: string;
  roomId: string;
  title: string;
  steps: Step[];
  todos: Todo[];
  artifacts: Artifact[];
  diff: string | null;
  terminal: string[];
  desktop: 0 | 1 | 2 | 3;
  cursor: "button" | "card" | null;
  agentId: string | null;
  waits: Partial<Record<PersonId, Wait>>;
  threads: Record<PersonId, Line[]>;
  typing: PersonId | null;
  status: "open" | "done" | "garbage";
};

export type Seat = {
  filter: FilterId;
  screen: "home" | "mission" | "room";
  missionId: string | null;
  roomId: string | null;
  thread: PersonId;
  tab: TabId;
  panel: boolean;
  draft: string;
  create: boolean;
  form: { roomId: string; title: string; bookId: string };
  ping: boolean;
};

export type World = {
  missions: Mission[];
  seats: Record<PersonId, Seat>;
  fileId: string | null;
};

export const ROOMS = [
  { id: "board", name: "Board" },
  { id: "portal", name: "Portal" },
] as const;

export const AGENTS = [
  { id: "ada", name: "Ada" },
  { id: "kit", name: "Kit" },
  { id: "noa", name: "Noa" },
] as const;

export const BOOKS = [
  { id: "ship", name: "Ship", steps: ["Frame", "Decide", "Spec", "Implement", "Verify", "Accept"] },
  { id: "explore", name: "Explore", steps: ["Frame", "Options", "Decide"] },
] as const;

export const SEATS: { id: PersonId; name: string; role: string; tabs: TabId[] }[] = [
  { id: "tereza", name: "Tereza", role: "PO", tabs: ["playbook", "files", "desktop"] },
  { id: "owen", name: "Owen", role: "Dev", tabs: ["playbook", "files", "changes", "terminal", "desktop"] },
];

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: "qq", label: "QQ" },
  { id: "dq", label: "DQ" },
  { id: "stake", label: "Stakeholder" },
];

const DIFF = `export async function createFeature(insightId: string) {
  const insight = await db.insight.find(insightId);
  return db.feature.create({
    column: "next",
    quote: insight.quote ?? null,
    insightId,
  });
}`;

function seat(partial: Pick<Seat, "filter">): Seat {
  return {
    filter: partial.filter,
    screen: "home",
    missionId: null,
    roomId: null,
    thread: "tereza",
    tab: "files",
    panel: true,
    draft: "",
    create: false,
    form: { roomId: "board", title: "", bookId: "ship" },
    ping: false,
  };
}

function feature(): Mission {
  return {
    id: "feature",
    roomId: "board",
    title: "Feature from insight",
    steps: [
      { id: "frame", label: "Frame", state: "done" },
      { id: "decide", label: "Decide", state: "now" },
      { id: "spec", label: "Spec", state: "next" },
      { id: "implement", label: "Implement", state: "next" },
      { id: "accept", label: "Accept", state: "next" },
    ],
    todos: [
      { id: "column", label: "Default column", done: false },
      { id: "quote", label: "Quote on the card", done: false },
      { id: "link", label: "Link insight", done: false },
    ],
    artifacts: [],
    diff: null,
    terminal: [],
    desktop: 0,
    cursor: null,
    agentId: "ada",
    waits: { tereza: "qq", owen: "stake" },
    threads: {
      tereza: [
        {
          id: "q1",
          from: "agent",
          text: "Nová karta z insightu — do kterého sloupce?",
        },
      ],
      owen: [],
    },
    typing: null,
    status: "open",
  };
}

export function freshWorld(): World {
  return {
    fileId: null,
    seats: {
      tereza: { ...seat({ filter: "qq" }), thread: "tereza" },
      owen: { ...seat({ filter: "stake" }), thread: "owen" },
    },
    missions: [
      feature(),
      {
        id: "scores",
        roomId: "board",
        title: "Hide scores",
        steps: [
          { id: "frame", label: "Frame", state: "done" },
          { id: "review", label: "Review", state: "now" },
          { id: "ship", label: "Ship", state: "next" },
        ],
        todos: [{ id: "portal", label: "Scores off the portal", done: false }],
        artifacts: [],
        diff: null,
        terminal: [],
        desktop: 0,
        cursor: null,
        agentId: null,
        waits: { tereza: "dq" },
        threads: {
          tereza: [
            {
              id: "s1",
              from: "agent",
              text: "Skóre na portálu — nechat, nebo schovat?",
            },
          ],
          owen: [],
        },
        typing: null,
        status: "open",
      },
      {
        id: "theme",
        roomId: "board",
        title: "Portal theme",
        steps: [
          { id: "frame", label: "Frame", state: "done" },
          { id: "implement", label: "Implement", state: "now" },
          { id: "accept", label: "Accept", state: "next" },
        ],
        todos: [{ id: "token", label: "Token for the board chrome", done: false }],
        artifacts: [],
        diff: null,
        terminal: ["pnpm test portal/theme", "  running…"],
        desktop: 0,
        cursor: null,
        agentId: "kit",
        waits: { tereza: "stake", owen: "stake" },
        threads: { tereza: [], owen: [] },
        typing: null,
        status: "open",
      },
      {
        id: "logo",
        roomId: "portal",
        title: "Logo lockup",
        steps: [
          { id: "frame", label: "Frame", state: "done" },
          { id: "look", label: "Look", state: "now" },
          { id: "ship", label: "Ship", state: "next" },
        ],
        todos: [{ id: "mark", label: "Wordmark on the portal", done: false }],
        artifacts: [],
        diff: null,
        terminal: [],
        desktop: 0,
        cursor: null,
        agentId: null,
        waits: { tereza: "stake", owen: "stake" },
        threads: { tereza: [], owen: [] },
        typing: null,
        status: "open",
      },
    ],
  };
}

export type Action =
  | { type: "reset" }
  | { type: "filter"; person: PersonId; filter: FilterId }
  | { type: "open"; person: PersonId; missionId: string }
  | { type: "room"; person: PersonId; roomId: string }
  | { type: "home"; person: PersonId }
  | { type: "thread"; person: PersonId; thread: PersonId }
  | { type: "tab"; person: PersonId; tab: TabId }
  | { type: "draft"; person: PersonId; text: string }
  | { type: "ping"; person: PersonId; on: boolean }
  | { type: "create"; person: PersonId; open: boolean }
  | { type: "form"; person: PersonId; patch: Partial<Seat["form"]> }
  | { type: "submit-create"; person: PersonId }
  | { type: "send"; person: PersonId }
  | { type: "add-step"; missionId: string; label: string }
  | { type: "toggle-todo"; missionId: string; todoId: string }
  | { type: "file"; id: string | null }
  | { type: "close"; missionId: string; tone: "done" | "garbage" }
  | { type: "mission"; missionId: string; patch: (mission: Mission) => Mission };

export function currentStep(mission: Mission) {
  return mission.steps.find((step) => step.state === "now");
}

export function missionGate(mission: Mission) {
  if (mission.status === "done") return "Done";
  if (mission.status === "garbage") return "Garbage";
  return currentStep(mission)?.label ?? "";
}

export function blocker(mission: Mission): PersonId | null {
  const qq = (Object.keys(mission.waits) as PersonId[]).find((id) => mission.waits[id] === "qq");
  if (qq) return qq;
  return (Object.keys(mission.waits) as PersonId[]).find((id) => mission.waits[id] === "dq") ?? null;
}

export function visibleMissions(world: World, person: PersonId) {
  const filter = world.seats[person].filter;
  return world.missions.filter((mission) => mission.waits[person] === filter && mission.status === "open");
}

function mapMission(world: World, missionId: string, patch: (mission: Mission) => Mission): World {
  return {
    ...world,
    missions: world.missions.map((mission) => (mission.id === missionId ? patch(mission) : mission)),
  };
}

function seatPatch(world: World, person: PersonId, patch: Partial<Seat>): World {
  return { ...world, seats: { ...world.seats, [person]: { ...world.seats[person], ...patch } } };
}

let seq = 0;
function nid(prefix: string) {
  seq += 1;
  return `${prefix}-${seq}`;
}

export function reduce(world: World, action: Action): World {
  switch (action.type) {
    case "reset":
      return freshWorld();
    case "filter":
      return seatPatch(world, action.person, { filter: action.filter });
    case "open":
      return seatPatch(world, action.person, {
        screen: "mission",
        missionId: action.missionId,
        thread: action.person,
        create: false,
      });
    case "room":
      return seatPatch(world, action.person, {
        screen: "room",
        roomId: action.roomId,
        panel: true,
        create: false,
      });
    case "home":
      return seatPatch(world, action.person, { screen: "home" });
    case "thread":
      return seatPatch(world, action.person, { thread: action.thread });
    case "tab":
      return seatPatch(world, action.person, {
        tab: action.tab,
        panel: world.seats[action.person].tab === action.tab ? !world.seats[action.person].panel : true,
      });
    case "draft":
      return seatPatch(world, action.person, { draft: action.text });
    case "ping":
      return seatPatch(world, action.person, { ping: action.on });
    case "create":
      return seatPatch(world, action.person, { create: action.open });
    case "form":
      return seatPatch(world, action.person, {
        form: { ...world.seats[action.person].form, ...action.patch },
      });
    case "submit-create": {
      const form = world.seats[action.person].form;
      const title = form.title.trim();
      if (!title) return world;
      const book = BOOKS.find((item) => item.id === form.bookId) ?? BOOKS[0];
      const mission: Mission = {
        id: nid("m"),
        roomId: form.roomId,
        title,
        steps: book.steps.map((label, index) => ({
          id: nid("st"),
          label,
          state: index === 0 ? "now" : "next",
        })),
        todos: [{ id: nid("td"), label: "Open the card", done: false }],
        artifacts: [],
        diff: null,
        terminal: [],
        desktop: 0,
        cursor: "button",
        agentId: "noa",
        waits: { tereza: "stake", owen: "stake" },
        threads: { tereza: [], owen: [] },
        typing: null,
        status: "open",
      };
      return {
        ...seatPatch(world, action.person, {
          create: false,
          form: { ...form, title: "" },
          screen: "mission",
          missionId: mission.id,
          thread: action.person,
        }),
        missions: [mission, ...world.missions],
      };
    }
    case "send": {
      const seatState = world.seats[action.person];
      const text = seatState.draft.trim();
      const missionId = seatState.missionId;
      if (!text || !missionId || seatState.thread !== action.person) return world;
      const next = mapMission(world, missionId, (mission) => ({
        ...mission,
        threads: {
          ...mission.threads,
          [action.person]: [
            ...mission.threads[action.person],
            { id: nid("ln"), from: action.person, text },
          ],
        },
      }));
      return seatPatch(next, action.person, { draft: "" });
    }
    case "add-step": {
      const label = action.label.trim();
      if (!label) return world;
      return mapMission(world, action.missionId, (mission) => {
        const acceptAt = mission.steps.findIndex((step) => step.id === "accept");
        const step: Step = { id: nid("st"), label, state: "now", fresh: true };
        const steps: Step[] = mission.steps.map((item) =>
          item.state === "now"
            ? { ...item, state: "done", fresh: false }
            : { ...item, fresh: false },
        );
        if (acceptAt === -1) steps.push(step);
        else steps.splice(acceptAt, 0, step);
        return { ...mission, steps };
      });
    }
    case "toggle-todo":
      return mapMission(world, action.missionId, (mission) => ({
        ...mission,
        todos: mission.todos.map((todo) =>
          todo.id === action.todoId ? { ...todo, done: !todo.done } : todo,
        ),
      }));
    case "file":
      return { ...world, fileId: action.id };
    case "close":
      return mapMission(world, action.missionId, (mission) => ({
        ...mission,
        status: action.tone,
        agentId: null,
        cursor: null,
        typing: null,
        waits: {},
        steps: mission.steps.map((step) => ({ ...step, state: "done", fresh: false })),
      }));
    case "mission":
      return mapMission(world, action.missionId, action.patch);
    default:
      return world;
  }
}

export function markTodo(mission: Mission, todoId: string, done: boolean): Mission {
  return {
    ...mission,
    todos: mission.todos.map((todo) => (todo.id === todoId ? { ...todo, done } : todo)),
  };
}

export function goTo(mission: Mission, stepId: string): Mission {
  const index = mission.steps.findIndex((step) => step.id === stepId);
  if (index < 0) return mission;
  return {
    ...mission,
    steps: mission.steps.map((step, i) => ({
      ...step,
      fresh: false,
      state: i < index ? "done" : i === index ? "now" : "next",
    })),
  };
}

export const FEATURE_DIFF = DIFF;
