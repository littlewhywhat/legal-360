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
  { id: "mobile", label: "Fix mobile layout" },
  { id: "analytics", label: "Add analytics" },
];

const heatmap = [
  [0, 0, 1, 1, 0, 2, 0],
  [0, 1, 1, 1, 3, 2, 0],
  [0, 1, 1, 2, 3, 1, 0],
  [0, 0, 1, 1, 1, 2, 1],
  [0, 2, 1, 1, 3, 1, 0],
  [0, 1, 3, 1, 1, 0, 0],
  [0, 0, 1, 2, 1, 1, 0],
  [0, 1, 1, 1, 2, 3, 0],
  [0, 0, 2, 1, 1, 1, 0],
  [0, 0, 1, 1, 0, 0, 0],
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
        { id: "landing", label: "Build landing page", detail: "4 next squares" },
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
    hint: "Timer is a container. Squares are the progress.",
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
    hint: "Tap each square as you finish it, then end the session",
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
    hint: "No streak. Just four squares that happened.",
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
        "Fix mobile layout",
        "Add analytics",
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
    hint: "Same goal — four more squares filled. Open History.",
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
    hint: "15-min squares over the week — tap Insights",
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
      days: ["S", "M", "T", "W", "T", "F", "S"],
      heatmap,
      peek: {
        action: "Write hero copy",
        goal: "Launch my side project",
        task: "Build landing page",
        when: "Today, 10:42",
        session: "Focus #32 — 20 min",
      },
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
        "Writing is your most frequent action.",
        "Morning sessions fill more squares than evenings.",
      ],
    },
  },
];
