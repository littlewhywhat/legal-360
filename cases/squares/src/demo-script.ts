import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 6;

const goalsBefore = [
  {
    id: "launch",
    name: "Launch my side project",
    task: "Build landing page",
    done: 11,
    total: 24,
    tone: "teal",
    nextScene: "s2-pick-steps",
  },
  {
    id: "spanish",
    name: "Learn Spanish",
    task: "Vocab",
    done: 6,
    total: 8,
    tone: "violet",
  },
  {
    id: "fit",
    name: "Get fit",
    task: "Walk",
    done: 5,
    total: 8,
    tone: "amber",
  },
];

const goalsAfter = [
  {
    id: "launch",
    name: "Launch my side project",
    task: "Build landing page",
    done: 15,
    total: 24,
    tone: "teal",
  },
  {
    id: "spanish",
    name: "Learn Spanish",
    task: "Vocab",
    done: 6,
    total: 8,
    tone: "violet",
  },
  {
    id: "fit",
    name: "Get fit",
    task: "Walk",
    done: 5,
    total: 8,
    tone: "amber",
  },
];

const landingSteps = [
  { id: "hero", label: "Write hero copy" },
  { id: "cta", label: "Add CTA" },
  {
    id: "mobile",
    label: "Fix mobile layout",
    tooBig: true,
    splitInto: [
      { id: "breakpoints", label: "Check breakpoints" },
      { id: "nav", label: "Fix nav wrap" },
    ],
  },
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
      task: "Build landing page",
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
      task: "Vocab",
      tone: "violet" as const,
      items: ["Review 5 cards", "Say 3 sentences out loud"],
    },
    {
      goal: "Get fit",
      task: "Walk",
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

const calendarWeeks = [
  { id: "w33", month: "Aug", days: weekDays("w33", [0, 1, 0, 2, 1, 0, 0]) },
  { id: "w34", month: "Aug", days: weekDays("w34", [0, 2, 1, 1, 0, 3, 0]) },
  { id: "w35", month: "Aug", days: weekDays("w35", [1, 0, 2, 3, 2, 1, 0]) },
  { id: "w36", month: "Sep", days: weekDays("w36", [0, 1, 3, 2, 4, 2, 1]) },
  { id: "w37", month: "Sep", days: last7 },
];

export const scenes: Scene[] = [
  {
    id: "s1-home",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Tasks",
    hint: "Tap a task to start — or the week strip for History",
    payload: {
      mode: "home",
      weekCount: 12,
      goals: goalsBefore,
      last7,
      historyScene: "s7-history",
    },
  },
  {
    id: "s2-pick-steps",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Choose squares",
    hint: "Check the squares for this session. Too big? Split in Focus.",
    choices: [
      { id: "ready", label: "Continue", next: "s3-ready", variant: "primary" },
    ],
    payload: {
      mode: "pick-steps",
      goalName: "Launch my side project",
      taskName: "Build landing page",
      steps: landingSteps,
    },
  },
  {
    id: "s3-ready",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Ready",
    hint: "Timer is set. Start when you are.",
    choices: [
      { id: "start", label: "Start", next: "s4-focus", variant: "primary" },
    ],
    payload: {
      mode: "ready",
      timer: "20:00",
      goalName: "Launch my side project",
      taskName: "Build landing page",
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
    hint: "Split the oversized step. Fill any remaining square — any order.",
    payload: {
      mode: "focus",
      timer: "20:00",
      goalName: "Launch my side project",
      taskName: "Build landing page",
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
    title: "You moved forward",
    hint: "Split turned one square into two. No streak.",
    choices: [
      { id: "done", label: "Finish for now", next: "s6-home-after", variant: "primary" },
    ],
    payload: {
      mode: "summary",
      added: 4,
      duration: "20 min",
      progressBefore: "46%",
      progressAfter: "62%",
      goalName: "Launch my side project",
      completed: [
        "Write hero copy",
        "Add CTA",
        "Check breakpoints",
        "Fix nav wrap",
      ],
    },
  },
  {
    id: "s6-home-after",
    step: 5,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Tasks",
    hint: "Same task — more squares filled. Tap the week strip.",
    payload: {
      mode: "home",
      weekCount: 16,
      goals: goalsAfter,
      last7,
      historyScene: "s7-history",
    },
  },
  {
    id: "s7-history",
    step: 6,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "History",
    hint: "One square per day. Tap Wednesday for that day's stats.",
    payload: {
      mode: "history",
      homeScene: "s6-home-after",
      insightsScene: "s8-insights",
      calendarWeeks,
    },
  },
  {
    id: "s8-insights",
    step: 6,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Insights",
    hint: "From squares, not a productivity score. Tap to replay.",
    next: "s1-home",
    payload: {
      mode: "insights",
      homeScene: "s6-home-after",
      lines: [
        "You completed 43 squares this week.",
        "Wednesday was the busiest day — 7 squares.",
        "Writing is your most frequent action.",
      ],
    },
  },
];
