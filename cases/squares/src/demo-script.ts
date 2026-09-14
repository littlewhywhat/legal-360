import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 6;

const goalsBefore = [
  { id: "launch", name: "Launch my side project", done: 8, total: 16, tone: "teal" },
  { id: "spanish", name: "Learn Spanish", done: 6, total: 12, tone: "violet" },
  { id: "fit", name: "Get fit", done: 8, total: 10, tone: "amber" },
];

const goalsAfter = [
  { id: "launch", name: "Launch my side project", done: 12, total: 16, tone: "teal" },
  { id: "spanish", name: "Learn Spanish", done: 6, total: 12, tone: "violet" },
  { id: "fit", name: "Get fit", done: 8, total: 10, tone: "amber" },
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

const weekDays = [
  { id: "sun", label: "S", name: "Sunday", squares: [] },
  {
    id: "mon",
    label: "M",
    name: "Monday",
    squares: [{ tone: "teal" }, { tone: "teal" }, { tone: "violet" }],
  },
  {
    id: "tue",
    label: "T",
    name: "Tuesday",
    squares: [{ tone: "teal" }, { tone: "amber" }, { tone: "teal" }, { tone: "violet" }],
  },
  {
    id: "wed",
    label: "W",
    name: "Wednesday",
    highlight: true,
    squares: [
      { tone: "teal" },
      { tone: "teal" },
      { tone: "teal" },
      { tone: "teal" },
      { tone: "violet" },
      { tone: "violet" },
      { tone: "amber" },
    ],
    detail: {
      title: "Wednesday",
      count: 7,
      groups: [
        {
          goal: "Launch my side project",
          task: "Build landing page",
          tone: "teal",
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
          tone: "violet",
          items: ["Review 5 cards", "Say 3 sentences out loud"],
        },
        {
          goal: "Get fit",
          task: "Walk",
          tone: "amber",
          items: ["10-minute walk"],
        },
      ],
    },
  },
  {
    id: "thu",
    label: "T",
    name: "Thursday",
    squares: [{ tone: "teal" }, { tone: "teal" }],
  },
  {
    id: "fri",
    label: "F",
    name: "Friday",
    squares: [{ tone: "violet" }, { tone: "teal" }, { tone: "amber" }],
  },
  { id: "sat", label: "S", name: "Saturday", squares: [] },
];

export const scenes: Scene[] = [
  {
    id: "s1-home",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "client",
    app: "squares",
    title: "Goals",
    hint: "Start Focus — pick a tiny action, not a whole project",
    next: "s2-quiz-goal",
    payload: {
      mode: "home",
      weekCount: 12,
      goals: goalsBefore,
      historyEnabled: false,
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
        { id: "launch", label: "Launch my side project", detail: "8 / 16 squares" },
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
      progressBefore: "50%",
      progressAfter: "75%",
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
    hint: "Same goal — more squares filled. Open History.",
    next: "s8-history",
    payload: {
      mode: "home",
      weekCount: 16,
      goals: goalsAfter,
      historyEnabled: true,
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
    hint: "Each day is many squares. Tap Wednesday, then Insights.",
    next: "s9-insights",
    payload: {
      mode: "history",
      homeScene: "s7-home-after",
      weeks: [
        { id: "w34", label: "W34" },
        { id: "w35", label: "W35" },
        { id: "w36", label: "W36" },
        { id: "w37", label: "W37", active: true },
      ],
      weekDays,
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
