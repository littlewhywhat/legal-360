import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 6;

const goalsBefore = [
  { id: "launch", name: "Launch my side project", done: 11, total: 24, tone: "teal" },
  { id: "spanish", name: "Learn Spanish", done: 6, total: 8, tone: "violet" },
  { id: "fit", name: "Get fit", done: 5, total: 8, tone: "amber" },
];

const goalsAfter = [
  { id: "launch", name: "Launch my side project", done: 15, total: 24, tone: "teal" },
  { id: "spanish", name: "Learn Spanish", done: 6, total: 8, tone: "violet" },
  { id: "fit", name: "Get fit", done: 5, total: 8, tone: "amber" },
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
    title: "Goals",
    hint: "Start Focus — or tap the week strip for History",
    next: "s2-quiz-goal",
    payload: {
      mode: "home",
      weekCount: 12,
      goals: goalsBefore,
      last7,
      historyScene: "s8-history",
    },
  },
  {
    id: "s2-quiz-goal",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Choose a goal",
    hint: "What do you want to move forward right now?",
    choices: [
      { id: "launch", label: "Launch my side project", next: "s3-quiz-task", variant: "primary" },
    ],
    payload: {
      mode: "quiz-goal",
      question: "What do you want to move forward right now?",
      options: [
        { id: "launch", label: "Launch my side project", detail: "11 / 24 squares" },
        { id: "spanish", label: "Learn Spanish", detail: "Later" },
        { id: "fit", label: "Get fit", detail: "Later" },
      ],
    },
  },
  {
    id: "s3-quiz-task",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Choose a task",
    hint: "One task — landing page",
    choices: [
      { id: "landing", label: "Build landing page", next: "s4-quiz-steps", variant: "primary" },
    ],
    payload: {
      mode: "quiz-task",
      question: "Which task?",
      goalName: "Launch my side project",
      options: [
        { id: "landing", label: "Build landing page", detail: "Next squares" },
        { id: "backend", label: "Backend API", detail: "Later" },
      ],
    },
  },
  {
    id: "s4-quiz-steps",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Pick steps",
    hint: "These are the session squares. Too big? Split in Focus.",
    choices: [
      { id: "start", label: "Start 20 min", next: "s5-focus", variant: "primary" },
    ],
    payload: {
      mode: "quiz-steps",
      question: "Work on these squares",
      goalName: "Launch my side project",
      taskName: "Build landing page",
      steps: landingSteps,
    },
  },
  {
    id: "s5-focus",
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
      finishTo: "s6-summary",
    },
  },
  {
    id: "s6-summary",
    step: 4,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "You moved forward",
    hint: "Split turned one square into two. No streak.",
    choices: [
      { id: "done", label: "Finish for now", next: "s7-home-after", variant: "primary" },
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
    id: "s7-home-after",
    step: 5,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Goals",
    hint: "Same goal — more squares filled. Tap the week strip.",
    next: "s8-history",
    payload: {
      mode: "home",
      weekCount: 16,
      goals: goalsAfter,
      last7,
      historyScene: "s8-history",
      startEnabled: false,
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
      insightsScene: "s9-insights",
      calendarWeeks,
    },
  },
  {
    id: "s9-insights",
    step: 6,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Insights",
    hint: "From squares, not a productivity score. Tap to replay.",
    next: "s1-home",
    payload: {
      mode: "insights",
      homeScene: "s7-home-after",
      lines: [
        "You completed 43 squares this week.",
        "Wednesday was the busiest day — 7 squares.",
        "Writing is your most frequent action.",
      ],
    },
  },
];
