import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 6;

const launchItems = [
  { id: "landing", label: "Landing page", depth: 0 },
  { id: "hero", label: "Write hero copy", depth: 1 },
  { id: "cta", label: "Add CTA", depth: 1 },
  { id: "mobile", label: "Fix mobile layout", depth: 1 },
  { id: "api", label: "Backend API", depth: 0, done: true },
  { id: "sketch", label: "Sketch endpoints", depth: 1, done: true },
];

const spanishItems = [
  { id: "vocab", label: "Vocab", depth: 0 },
  { id: "cards", label: "Review 5 cards", depth: 1 },
  { id: "say", label: "Say 3 sentences out loud", depth: 1 },
];

const fitItems = [
  { id: "walk", label: "Walk", depth: 0 },
  { id: "ten", label: "10-minute walk", depth: 1, done: true },
];

const goalsBefore = [
  {
    id: "launch",
    name: "Launch my side project",
    done: 11,
    total: 24,
    tone: "teal",
    items: launchItems,
    openScene: "s2-goal",
  },
  {
    id: "spanish",
    name: "Learn Spanish",
    done: 6,
    total: 8,
    tone: "violet",
    items: spanishItems,
  },
  {
    id: "fit",
    name: "Get fit",
    done: 5,
    total: 8,
    tone: "amber",
    items: fitItems,
  },
];

const goalsAfter = [
  {
    id: "launch",
    name: "Launch my side project",
    done: 13,
    total: 24,
    tone: "teal",
    items: launchItems,
    openScene: "s2-goal",
  },
  {
    id: "spanish",
    name: "Learn Spanish",
    done: 6,
    total: 8,
    tone: "violet",
    items: spanishItems,
  },
  {
    id: "fit",
    name: "Get fit",
    done: 5,
    total: 8,
    tone: "amber",
    items: fitItems,
  },
];

const landingSteps = [
  { id: "hero", label: "Write hero copy" },
  { id: "cta", label: "Add CTA" },
  { id: "mobile", label: "Fix mobile layout" },
];

const afterItems = [
  { id: "landing", label: "Landing page", depth: 0 },
  { id: "hero", label: "Write hero copy", depth: 1, done: true },
  { id: "cta", label: "Add CTA", depth: 1, done: true },
  { id: "mobile", label: "Fix mobile layout", depth: 1 },
  {
    id: "breakpoints",
    label: "Check breakpoints",
    depth: 1,
    added: true,
  },
  { id: "api", label: "Backend API", depth: 0, done: true },
  { id: "sketch", label: "Sketch endpoints", depth: 1, done: true },
];

const DAY = ["S", "M", "T", "W", "T", "F", "S"] as const;
const DAY_NAME = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const wedDetail = {
  title: "Wednesday",
  count: 7,
  groups: [
    {
      goal: "Launch my side project",
      tone: "teal" as const,
      items: [
        "Write hero copy",
        "Add CTA",
        "Check breakpoints",
        "Fix nav wrap",
      ],
    },
    {
      goal: "Learn Spanish",
      tone: "violet" as const,
      items: ["Review 5 cards", "Say 3 sentences out loud"],
    },
    {
      goal: "Get fit",
      tone: "amber" as const,
      items: ["10-minute walk"],
    },
  ],
};

function weekDays(
  weekId: string,
  counts: number[],
  highlightId?: string,
): {
  id: string;
  label: string;
  name: string;
  count: number;
  detail?: typeof wedDetail;
}[] {
  return counts.map((count, i) => {
    const id = `${weekId}-${DAY_NAME[i].slice(0, 3).toLowerCase()}`;
    const isWed = highlightId === id || (highlightId === "wed" && i === 3);
    return {
      id,
      label: DAY[i],
      name: DAY_NAME[i],
      count,
      ...(isWed && count > 0 ? { detail: wedDetail } : {}),
    };
  });
}

const last7 = weekDays("w37", [0, 3, 4, 7, 2, 3, 0], "w37-wed");

const EMPTY = [0, 0, 0, 0, 0, 0, 0];

function monthWeeks(
  month: string,
  weekIds: string[],
  countsById: Record<string, number[]> = {},
) {
  return weekIds.map((id) => ({
    id,
    month,
    days: weekDays(
      id,
      countsById[id] ?? EMPTY,
      id === "w37" ? "w37-wed" : undefined,
    ),
  }));
}

const calendarWeeks = [
  ...monthWeeks("May", ["w18", "w19", "w20", "w21", "w22"]),
  ...monthWeeks("Jun", ["w23", "w24", "w25", "w26"]),
  ...monthWeeks("Jul", ["w27", "w28", "w29", "w30"]),
  ...monthWeeks(
    "Aug",
    ["w31", "w32", "w33", "w34", "w35"],
    {
      w33: [0, 1, 0, 2, 1, 0, 0],
      w34: [0, 2, 1, 1, 0, 3, 0],
      w35: [1, 0, 2, 3, 2, 1, 0],
    },
  ),
  ...monthWeeks(
    "Sep",
    ["w36", "w37"],
    {
      w36: [0, 1, 3, 2, 4, 2, 1],
      w37: [0, 3, 4, 7, 2, 3, 0],
    },
  ),
];

export const scenes: Scene[] = [
  {
    id: "s1-home",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Goals",
    hint: "Tap a goal, or + under the list for a new one",
    payload: {
      mode: "home",
      weekCount: 12,
      goals: goalsBefore,
      last7,
      historyScene: "s8-history",
    },
  },
  {
    id: "s2-goal",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Goal",
    hint: "Edit the list. Select for session, then tap tasks and Next.",
    choices: [
      { id: "next", label: "Next", next: "s3-ready", variant: "primary" },
    ],
    payload: {
      mode: "goal",
      goalName: "Launch my side project",
      outline: launchItems,
      homeScene: "s1-home",
    },
  },
  {
    id: "s3-ready",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Ready",
    hint: "Set the timer, then Start.",
    choices: [
      { id: "start", label: "Start", next: "s4-focus", variant: "primary" },
    ],
    payload: {
      mode: "ready",
      timer: "20:00",
      goalName: "Launch my side project",
      steps: landingSteps,
    },
  },
  {
    id: "s4-focus",
    step: 3,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Focus",
    hint: "Rename or add squares. End early or tap the timer when time is up.",
    payload: {
      mode: "focus",
      timer: "20:00",
      goalName: "Launch my side project",
      steps: landingSteps,
      finishTo: "s5-summary",
    },
  },
  {
    id: "s5-summary",
    step: 4,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Confirm",
    hint: "Confirm what you finished. Added-in-session sit apart.",
    choices: [
      { id: "done", label: "Confirm", next: "s6-after", variant: "primary" },
    ],
    payload: {
      mode: "summary",
      duration: "20 min",
      goalName: "Launch my side project",
      steps: [
        { id: "hero", label: "Write hero copy", done: true },
        { id: "cta", label: "Add CTA", done: true },
        { id: "mobile", label: "Fix mobile layout", done: false },
        {
          id: "breakpoints",
          label: "Check breakpoints",
          done: false,
          added: true,
        },
      ],
    },
  },
  {
    id: "s6-after",
    step: 5,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Goal",
    hint: "Same goal list — session changes flash in. Select for session, or Back to goals.",
    choices: [
      { id: "next", label: "Next", next: "s3-ready", variant: "primary" },
    ],
    payload: {
      mode: "goal",
      goalName: "Launch my side project",
      outline: afterItems,
      homeScene: "s7-home-after",
      animateAdded: true,
    },
  },
  {
    id: "s7-home-after",
    step: 5,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Goals",
    hint: "Same goal — more squares filled. Tap the week strip.",
    payload: {
      mode: "home",
      weekCount: 14,
      goals: goalsAfter,
      last7,
      historyScene: "s8-history",
    },
  },
  {
    id: "s8-history",
    step: 6,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "History",
    hint: "One square per day. Tap Wednesday for that day's stats.",
    payload: {
      mode: "history",
      homeScene: "s7-home-after",
      calendarWeeks,
    },
  },
];
