import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 4;

const here = {
  id: "here",
  name: "Здесь",
  kind: "here" as const,
  oval: 72,
  cloud: 62,
  dark: true,
  km: 0,
  you: true,
  x: 46,
  y: 58,
};

const shore = {
  id: "shore",
  name: "Берег",
  kind: "shore" as const,
  oval: 74,
  cloud: 12,
  dark: true,
  km: 118,
  favorite: true,
  best: true,
  x: 72,
  y: 24,
};

const plateau = {
  id: "plateau",
  name: "Плато",
  kind: "plateau" as const,
  oval: 70,
  cloud: 38,
  dark: true,
  km: 32,
  favorite: true,
  x: 60,
  y: 40,
};

const lake = {
  id: "lake",
  name: "Озеро",
  kind: "lake" as const,
  oval: 71,
  cloud: 55,
  dark: true,
  km: 6,
  x: 38,
  y: 70,
};

const hill = {
  id: "hill",
  name: "Сопка",
  kind: "hill" as const,
  oval: 72,
  cloud: 70,
  dark: true,
  km: 4,
  x: 32,
  y: 46,
};

const hourly = [
  { t: "21", cloud: 62 },
  { t: "22", cloud: 50 },
  { t: "23", cloud: 34 },
  { t: "00", cloud: 18 },
  { t: "01", cloud: 12 },
  { t: "02", cloud: 10 },
];

export const scenes: Scene[] = [
  {
    id: "s1-lock",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Lock",
    hint: "Tap the banner",
    next: "s2-brief",
    payload: {
      mode: "lock",
      time: "21:14",
      date: "пт 18 сен",
      appName: "Сияния",
      place: shore,
    },
  },
  {
    id: "s2-brief",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Brief",
    hint: "Tap the map",
    next: "s3-map",
    choices: [
      { id: "stay", label: "Остаться", next: "s1-lock", variant: "ghost" },
      { id: "go", label: "Ехать", next: "s4-go", variant: "primary" },
    ],
    payload: {
      mode: "brief",
      headline: "Вечерний чек-ин",
      kicker: "Ещё не поздно.",
      here,
      spots: [hill, lake, plateau, shore],
      hourly,
      best: shore,
      eta: "1ч 20м",
    },
  },
  {
    id: "s3-map",
    step: 3,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Map",
    hint: "Tap Берег",
    next: "s4-go",
    payload: {
      mode: "map",
      here,
      spots: [hill, lake, plateau, shore],
      sheet: shore,
      eta: "1ч 20м",
    },
  },
  {
    id: "s4-go",
    step: 4,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Go",
    hint: "Tap to replay",
    next: "s1-lock",
    payload: {
      mode: "finale",
      place: shore,
      eta: "1ч 20м",
    },
  },
];
