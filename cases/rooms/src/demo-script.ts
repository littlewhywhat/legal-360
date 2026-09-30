import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 8;

type RoomOpt = { id: string; name: string; context: string };
type BookOpt = { id: string; name: string; steps: string[]; artifact: string };

const rooms: RoomOpt[] = [
  {
    id: "helios",
    name: "Helios MSA",
    context: "MSA v1 · Klára, Jordan, Marek · shared redlines",
  },
  {
    id: "acme",
    name: "Acme DPA",
    context: "DPA draft · Jordan, Marek · shared issues",
  },
  {
    id: "northwind",
    name: "Northwind NDA",
    context: "NDA v3 · Klára, Jordan, Marek · shared redline",
  },
];

const books: BookOpt[] = [
  {
    id: "redline",
    name: "Redline triage",
    steps: ["Read", "Flag", "Counter", "Accept"],
    artifact: "Flag: cap below 2× floor",
  },
  {
    id: "intake",
    name: "Intake",
    steps: ["Log", "Route", "Ack"],
    artifact: "Logged client redline",
  },
  {
    id: "close",
    name: "Close",
    steps: ["Check", "File", "Done"],
    artifact: "Close checklist started",
  },
];

function bootId(roomId: string, bookId: string) {
  return `s6-boot-${roomId}-${bookId}`;
}

function gateId(roomId: string, bookId: string) {
  return `s7-gate-${roomId}-${bookId}`;
}

const bootScenes: Scene[] = rooms.flatMap((room) =>
  books.map((book) => ({
    id: bootId(room.id, book.id),
    step: 6,
    totalSteps: TOTAL_STEPS,
    device: "watcher" as const,
    app: "rooms" as const,
    title: "It starts",
    hint: "The room pool lends an agent. The first artifact lands on the mission.",
    next: gateId(room.id, book.id),
    payload: {
      mode: "boot",
      mission: "Liability cap counter",
      room: room.name,
      playbook: book.name,
      steps: book.steps,
      artifact: book.artifact,
    },
  })),
);

const gateScenes: Scene[] = rooms.flatMap((room) =>
  books.map((book) => ({
    id: gateId(room.id, book.id),
    step: 7,
    totalSteps: TOTAL_STEPS,
    device: "watcher" as const,
    app: "rooms" as const,
    title: "Add a checkpoint",
    hint: "Insert a step. The mission has to pass it.",
    choices: [
      {
        id: "finish",
        label: "Close the loop",
        next: "s8-end",
        variant: "primary" as const,
      },
    ],
    payload: {
      mode: "checkpoint",
      mission: "Liability cap counter",
      room: room.name,
      playbook: book.name,
      steps: book.steps,
      insert: "Local counsel",
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
    hint: "Filter QQ, DQ, or missions you are in. Rooms are only labels here.",
    choices: [
      { id: "qq-cap", label: "Cap length", next: "s2-qq" },
      { id: "dq-indemnity", label: "Indemnity carve-out", next: "s3-dq" },
      { id: "play-law", label: "Governing law", next: "s4-watch" },
      { id: "new", label: "New mission", next: "s5-create", variant: "primary" },
    ],
    payload: {
      mode: "list",
      you: "Jordan",
      role: "Associate",
      rooms: rooms.map((room) => room.name),
      rows: [
        {
          id: "qq-cap",
          filter: "qq",
          room: "Helios MSA",
          title: "Cap length",
          detail: "Answer now",
        },
        {
          id: "dq-indemnity",
          filter: "dq",
          room: "Acme DPA",
          title: "Indemnity carve-out",
          detail: "Slot Thu 15:00",
        },
        {
          id: "play-law",
          filter: "play",
          room: "Northwind NDA",
          title: "Governing law",
          detail: "You are in this. Not blocking.",
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
    title: "QQ",
    hint: "Push is fine. Ada stays on this mission until you answer.",
    choices: [
      {
        id: "answer",
        label: "Counter at 2×",
        next: "s3-dq",
        variant: "primary",
      },
    ],
    payload: {
      mode: "qq",
      room: "Helios MSA",
      mission: "Cap length",
      you: "Jordan",
      lang: "en",
      agent: "Ada",
      prompt: "Client wants 1× fees over 12 months. The floor is 2×. Counter now?",
      poolNote: "Ada stays on Cap length",
    },
  },
  {
    id: "s3-dq",
    step: 3,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "DQ",
    hint: "No push. The slot waits. Ada is back in the Acme pool.",
    choices: [
      {
        id: "slot",
        label: "Keep the slot",
        next: "s4-watch",
        variant: "primary",
      },
    ],
    payload: {
      mode: "dq",
      room: "Acme DPA",
      mission: "Indemnity carve-out",
      slot: "Thu 15:00",
      with: "Marek",
      ask: "Client widened the IP carve-out. The playbook allows that only if it is mutual.",
      poolNote: "Ada is free in the Acme pool",
    },
  },
  {
    id: "s4-watch",
    step: 4,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "In play",
    hint: "Switch person. Each thread is private. The playbook and artifacts stay shared.",
    choices: [
      {
        id: "new",
        label: "New mission",
        next: "s5-create",
        variant: "primary",
      },
    ],
    payload: {
      mode: "watch",
      room: "Northwind NDA",
      mission: "Governing law",
      context: "NDA v3 · shared redline and playbook",
      you: "jordan",
      steps: [
        { label: "Read", state: "done" },
        { label: "Flag", state: "done" },
        { label: "Counter", state: "now" },
        { label: "Accept", state: "next" },
      ],
      artifacts: ["Redline v3", "Playbook: Delaware"],
      agents: [
        { name: "Ada", state: "busy", on: "Governing law" },
        { name: "Noa", state: "free" },
      ],
      people: [
        {
          id: "klara",
          name: "Klára",
          role: "Partner",
          lang: "cs",
          line: "Delaware nechte. Kalifornie jen se souhlasem.",
          agent: "Beru Delaware jako výchozí. Čekám na souhlas.",
        },
        {
          id: "jordan",
          name: "Jordan",
          role: "Associate",
          lang: "en",
          line: "Client asked for California. I am in this, not blocking.",
          agent: "Noted. I will not ping you while Counter is open.",
        },
        {
          id: "marek",
          name: "Marek",
          role: "Counsel",
          lang: "de",
          line: "Gerichtsstand weicht ab. Gegenvorschlag vorbereiten.",
          agent: "Verstanden. Der Gegenvorschlag liegt als Artefakt.",
        },
      ],
    },
  },
  {
    id: "s5-create",
    step: 5,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "New mission",
    hint: "Room brings the people and the artifacts. Playbook is the gates.",
    payload: {
      mode: "create",
      mission: "Liability cap counter",
      rooms,
      books,
    },
  },
  ...bootScenes,
  ...gateScenes,
  {
    id: "s8-end",
    step: 8,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "Close",
    hint: "The mission has no owner. Done and Garbage both keep the artifacts.",
    choices: [
      { id: "done", label: "Done", next: "s8-done", variant: "primary" },
      { id: "garbage", label: "Garbage", next: "s8-garbage", variant: "danger" },
    ],
    payload: {
      mode: "end",
      mission: "Liability cap counter",
      room: "Shared room",
    },
  },
  {
    id: "s8-done",
    step: 8,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "Done",
    hint: "Tap replay to walk the list again.",
    next: "s1-list",
    payload: {
      mode: "result",
      tone: "done",
      headline: "Done",
      detail: "Liability cap counter is closed. The artifacts stay in the room.",
    },
  },
  {
    id: "s8-garbage",
    step: 8,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "rooms",
    title: "Garbage",
    hint: "Tap replay to walk the list again.",
    next: "s1-list",
    payload: {
      mode: "result",
      tone: "garbage",
      headline: "Garbage",
      detail: "Marked garbage. The room still holds the artifacts.",
    },
  },
];
