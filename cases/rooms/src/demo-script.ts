import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 8;

type Who = { kind: "bot" | "human"; name: string; when?: string };
type Agent = { name: string; state: "free" | "busy"; on?: string };
type Cast = { id: string; name: string; role: string; lang: string };
type Talk = Cast & { line: string; agent: string };
type RoomMission = {
  title: string;
  book: string;
  step: string;
  who: Who;
  scene: string;
};
type BookOpt = { id: string; name: string; steps: string[]; artifact: string };

const cast: Cast[] = [
  { id: "klara", name: "Klára", role: "PM", lang: "cs" },
  { id: "jordan", name: "Jordan", role: "Eng", lang: "en" },
  { id: "marek", name: "Marek", role: "Design", lang: "de" },
];

const books: BookOpt[] = [
  {
    id: "ship",
    name: "Ship",
    steps: ["Spec", "Build", "Verify", "Ship"],
    artifact: "Spec: trial email, day −1",
  },
  {
    id: "decide",
    name: "Decide",
    steps: ["Frame", "Options", "Decide", "Record"],
    artifact: "Options: 1-day vs 3-day notice",
  },
  {
    id: "fix",
    name: "Fix",
    steps: ["Reproduce", "Fix", "Verify"],
    artifact: "Repro: email sends twice",
  },
];

const rooms: {
  id: string;
  name: string;
  context: string;
  agents: Agent[];
  take: string;
  missions: RoomMission[];
}[] = [
  {
    id: "checkout",
    name: "Checkout",
    context: "Web checkout",
    agents: [
      { name: "Ada", state: "free" },
      { name: "Noa", state: "free" },
    ],
    take: "Ada",
    missions: [
      {
        title: "Annual as default?",
        book: "Decide",
        step: "Frame",
        who: { kind: "human", name: "Jordan" },
        scene: "s2-qq",
      },
      {
        title: "Paywall layout",
        book: "Ship",
        step: "Spec",
        who: { kind: "human", name: "Marek" },
        scene: "s-mission-paywall",
      },
    ],
  },
  {
    id: "onboarding",
    name: "Onboarding",
    context: "First run",
    agents: [
      { name: "Ada", state: "free" },
      { name: "Noa", state: "busy", on: "Checklist copy" },
    ],
    take: "Ada",
    missions: [
      {
        title: "Empty state",
        book: "Ship",
        step: "Spec",
        who: { kind: "human", name: "Marek", when: "Thu 15:00" },
        scene: "s3-dq",
      },
      {
        title: "Checklist copy",
        book: "Decide",
        step: "Options",
        who: { kind: "bot", name: "Noa" },
        scene: "s-mission-checklist",
      },
    ],
  },
  {
    id: "billing",
    name: "Billing",
    context: "Usage and invoices",
    agents: [
      { name: "Ada", state: "busy", on: "Usage meter" },
      { name: "Noa", state: "free" },
    ],
    take: "Noa",
    missions: [
      {
        title: "Usage meter",
        book: "Ship",
        step: "Build",
        who: { kind: "bot", name: "Ada" },
        scene: "s5-usage",
      },
      {
        title: "Invoice PDF",
        book: "Fix",
        step: "Reproduce",
        who: { kind: "human", name: "Klára" },
        scene: "s-mission-invoice",
      },
    ],
  },
];

function roomSceneId(roomId: string) {
  return `s-room-${roomId}`;
}

function bootId(roomId: string, bookId: string) {
  return `s7-boot-${roomId}-${bookId}`;
}

function gateId(roomId: string, bookId: string) {
  return `s8-gate-${roomId}-${bookId}`;
}

function talk(
  lines: Record<string, { line: string; agent: string }>,
): Talk[] {
  return cast.map((person) => ({ ...person, ...lines[person.id] }));
}

function threadScene(
  id: string,
  title: string,
  roomId: string,
  mission: string,
  book: string,
  steps: { label: string; state: "done" | "now" | "next" }[],
  artifacts: string[],
  lines: Record<string, { line: string; agent: string }>,
): Scene {
  const room = rooms.find((item) => item.id === roomId);
  if (!room) {
    throw new Error(`unknown room ${roomId}`);
  }
  return {
    id,
    step: 5,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title,
    hint: "",
    payload: {
      mode: "thread",
      nav: roomId,
      room: room.name,
      mission,
      book,
      steps,
      artifacts,
      people: talk(lines),
      youId: "jordan",
    },
  };
}

const roomScenes: Scene[] = rooms.map((room) => ({
  id: roomSceneId(room.id),
  step: 4,
  totalSteps: TOTAL_STEPS,
  device: "watcher" as const,
  app: "rooms" as const,
  title: room.name,
  hint: "",
  payload: {
    mode: "room",
    nav: room.id,
    name: room.name,
    context: room.context,
    people: cast,
    agents: room.agents,
    missions: room.missions,
  },
}));

const bootScenes: Scene[] = rooms.flatMap((room) =>
  books.map((book) => ({
    id: bootId(room.id, book.id),
    step: 7,
    totalSteps: TOTAL_STEPS,
    device: "watcher" as const,
    app: "rooms" as const,
    title: room.name,
    hint: "",
    next: gateId(room.id, book.id),
    payload: {
      mode: "room",
      nav: room.id,
      name: room.name,
      context: room.context,
      people: cast,
      agents: room.agents,
      missions: room.missions,
      incoming: {
        title: "Trial expiry email",
        book: book.name,
        step: book.steps[0],
        agent: room.take,
      },
    },
  })),
);

const gateScenes: Scene[] = rooms.flatMap((room) =>
  books.map((book) => ({
    id: gateId(room.id, book.id),
    step: 8,
    totalSteps: TOTAL_STEPS,
    device: "watcher" as const,
    app: "rooms" as const,
    title: "Trial expiry email",
    hint: "",
    choices: [
      { id: "done", label: "Done", next: "s8-done", variant: "primary" as const },
      { id: "garbage", label: "Garbage", next: "s8-garbage", variant: "danger" as const },
    ],
    payload: {
      mode: "checkpoint",
      nav: room.id,
      room: room.name,
      mission: "Trial expiry email",
      book: book.name,
      steps: book.steps,
      insert: "Design review",
      artifact: book.artifact,
    },
  })),
);

export const scenes: Scene[] = [
  {
    id: "s1-list",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "My list",
    hint: "",
    choices: [
      { id: "qq-annual", label: "Annual as default?", next: "s2-qq" },
      { id: "dq-empty", label: "Empty state", next: "s3-dq" },
      { id: "play-usage", label: "Usage meter", next: "s5-usage" },
      { id: "new", label: "New mission", next: "s6-create", variant: "primary" },
    ],
    payload: {
      mode: "list",
      nav: "list",
      rows: [
        {
          id: "qq-annual",
          filter: "qq",
          room: "Checkout",
          roomScene: roomSceneId("checkout"),
          title: "Annual as default?",
          who: { kind: "human", name: "Jordan" },
        },
        {
          id: "dq-empty",
          filter: "dq",
          room: "Onboarding",
          roomScene: roomSceneId("onboarding"),
          title: "Empty state",
          who: { kind: "human", name: "Marek", when: "Thu 15:00" },
        },
        {
          id: "play-usage",
          filter: "play",
          room: "Billing",
          roomScene: roomSceneId("billing"),
          title: "Usage meter",
          who: { kind: "bot", name: "Ada" },
        },
      ],
    },
  },
  {
    id: "s2-qq",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "Annual as default?",
    hint: "",
    choices: [
      { id: "send", label: "Send", next: "s3-dq", variant: "primary" },
    ],
    payload: {
      mode: "qq",
      nav: "list",
      room: "Checkout",
      mission: "Annual as default?",
      from: { name: "Klára", lang: "cs", text: "Roční plán jako výchozí?" },
      reply: "Yes. Annual default. Monthly stays on the toggle.",
      speaker: { name: "Jordan", lang: "en" },
    },
  },
  {
    id: "s3-dq",
    step: 3,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "Empty state",
    hint: "",
    choices: [
      { id: "slot", label: "Thu 15:00", next: roomSceneId("billing"), variant: "primary" },
    ],
    payload: {
      mode: "dq",
      nav: "list",
      room: "Onboarding",
      mission: "Empty state",
      who: "Marek",
      when: "Thu 15:00",
      text: "First-run screen, no illustration.",
      artifact: "First-run spec",
    },
  },
  ...roomScenes,
  threadScene(
    "s5-usage",
    "Usage meter",
    "billing",
    "Usage meter",
    "Ship",
    [
      { label: "Spec", state: "done" },
      { label: "Build", state: "now" },
      { label: "Verify", state: "next" },
      { label: "Ship", state: "next" },
    ],
    ["Usage API", "80% mark"],
    {
      klara: {
        line: "Barva až od 80 procent.",
        agent: "Beru usage z API. Práh 80 %.",
      },
      jordan: {
        line: "Poll the usage API once a minute.",
        agent: "Next point is the 80% threshold.",
      },
      marek: {
        line: "Neutral bis 80 %, danach Amber.",
        agent: "Schwelle liegt bei 80 %.",
      },
    },
  ),
  threadScene(
    "s-mission-paywall",
    "Paywall layout",
    "checkout",
    "Paywall layout",
    "Ship",
    [
      { label: "Spec", state: "now" },
      { label: "Build", state: "next" },
      { label: "Verify", state: "next" },
      { label: "Ship", state: "next" },
    ],
    ["Flow sketch", "Gate after value"],
    {
      klara: {
        line: "Paywall až po první hodnotě.",
        agent: "Ne na prvním screenu.",
      },
      jordan: {
        line: "Gate it after the empty state, not before.",
        agent: "Spec is the gate after value.",
      },
      marek: {
        line: "Preis erst nach dem leeren Zustand.",
        agent: "Nicht auf dem ersten Screen.",
      },
    },
  ),
  threadScene(
    "s-mission-checklist",
    "Checklist copy",
    "onboarding",
    "Checklist copy",
    "Decide",
    [
      { label: "Frame", state: "done" },
      { label: "Options", state: "now" },
      { label: "Decide", state: "next" },
      { label: "Record", state: "next" },
    ],
    ["Product flags", "Three steps"],
    {
      klara: {
        line: "Tři kroky, bez marketingu.",
        agent: "Beru jen produktové flagy.",
      },
      jordan: {
        line: "Three steps from product flags.",
        agent: "No marketing blocks.",
      },
      marek: {
        line: "Drei Zeilen, keine Illustration.",
        agent: "Nur die Produktflags.",
      },
    },
  ),
  threadScene(
    "s-mission-invoice",
    "Invoice PDF",
    "billing",
    "Invoice PDF",
    "Fix",
    [
      { label: "Reproduce", state: "now" },
      { label: "Fix", state: "next" },
      { label: "Verify", state: "next" },
    ],
    ["PDF template", "VAT line"],
    {
      klara: {
        line: "Číslo faktury nahoru, DPH pod součet.",
        agent: "Doplním to do šablony PDF.",
      },
      jordan: {
        line: "Invoice number in the header, VAT under the total.",
        agent: "I will patch the PDF template.",
      },
      marek: {
        line: "Nummer im Kopf, Steuer unter der Summe.",
        agent: "Ich setze es in die PDF-Vorlage.",
      },
    },
  ),
  {
    id: "s6-create",
    step: 6,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "Trial expiry email",
    hint: "",
    payload: {
      mode: "create",
      nav: "list",
      mission: "Trial expiry email",
      prompt: "Email the day before the trial ends. One CTA.",
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        context: room.context,
      })),
      books,
    },
  },
  ...bootScenes,
  ...gateScenes,
  {
    id: "s8-done",
    step: 8,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "Done",
    hint: "",
    next: "s1-list",
    payload: {
      mode: "result",
      nav: "list",
      tone: "done",
      mission: "Trial expiry email",
      artifact: "Trial email spec",
    },
  },
  {
    id: "s8-garbage",
    step: 8,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "Garbage",
    hint: "",
    next: "s1-list",
    payload: {
      mode: "result",
      nav: "list",
      tone: "garbage",
      mission: "Trial expiry email",
      artifact: "Trial email spec",
    },
  },
];
