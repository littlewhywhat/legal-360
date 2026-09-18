import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 5;

const here = {
  id: "here",
  name: "Здесь",
  kind: "here" as const,
  oval: 72,
  cloud: 62,
  dark: true,
  km: 0,
  you: true,
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
};

const lake = {
  id: "lake",
  name: "Озеро",
  kind: "lake" as const,
  oval: 71,
  cloud: 55,
  dark: true,
  km: 6,
};

const hill = {
  id: "hill",
  name: "Сопка",
  kind: "hill" as const,
  oval: 72,
  cloud: 70,
  dark: true,
  km: 4,
};

export const scenes: Scene[] = [
  {
    id: "s1-lock",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Lock",
    hint: "Tap the banner",
    next: "s2-list",
    payload: {
      mode: "lock",
      time: "21:14",
      date: "пт 18 сен",
      appName: "Сияния",
      place: "Берег",
      p: 65,
      km: 118,
    },
  },
  {
    id: "s2-list",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Places",
    hint: "Tap Берег",
    next: "s3-detail",
    payload: {
      mode: "list",
      here,
      places: [shore, plateau, lake, hill],
      tabs: { list: "s2-list", map: "s4-map", active: "list" },
    },
  },
  {
    id: "s3-detail",
    step: 3,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Spot",
    hint: "Open the map",
    choices: [
      { id: "map", label: "Карта", next: "s4-map", variant: "primary" },
    ],
    payload: {
      mode: "detail",
      place: shore,
      vsHere: 27,
      tabs: { list: "s2-list", map: "s4-map", active: "list" },
    },
  },
  {
    id: "s4-map",
    step: 4,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Map",
    hint: "Tap the sheet",
    next: "s5-go",
    payload: {
      mode: "map",
      here: { ...here, x: 42, y: 58 },
      spots: [
        { ...hill, x: 36, y: 48 },
        { ...lake, x: 50, y: 64 },
        { ...plateau, x: 58, y: 40 },
        { ...shore, x: 72, y: 22 },
      ],
      sheet: shore,
      tabs: { list: "s2-list", map: "s4-map", active: "map" },
    },
  },
  {
    id: "s5-go",
    step: 5,
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
