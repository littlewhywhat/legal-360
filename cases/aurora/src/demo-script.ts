import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 5;

const murmansk = {
  id: "murmansk",
  name: "Мурманск",
  oval: 72,
  cloud: 62,
  dark: true,
  you: true,
};

const teriberka = {
  id: "teriberka",
  name: "Териберка",
  oval: 74,
  cloud: 12,
  dark: true,
  favorite: true,
};

const khibiny = {
  id: "khibiny",
  name: "Хибины",
  oval: 70,
  cloud: 38,
  dark: true,
  favorite: true,
};

const spb = {
  id: "spb",
  name: "Санкт-Петербург",
  oval: 18,
  cloud: 48,
  dark: true,
};

export const scenes: Scene[] = [
  {
    id: "s1-lock",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Lock screen",
    hint: "Tap the notification",
    next: "s2-list",
    payload: {
      mode: "lock",
      time: "21:14",
      appName: "Сияния",
      title: "Дома 27% — облака",
      body: "Териберка 65%, ясно. Открыть список?",
    },
  },
  {
    id: "s2-list",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Simple list",
    hint: "Tap your city",
    next: "s3-detail",
    payload: {
      mode: "list",
      heading: "Сегодня",
      sub: "P_see = овал × ясность × темнота",
      cities: [murmansk, teriberka, khibiny, spb],
    },
  },
  {
    id: "s3-detail",
    step: 3,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Why not home",
    hint: "Open the map for a clearer spot",
    choices: [
      {
        id: "map",
        label: "Где лучше рядом",
        next: "s4-map",
        variant: "primary",
      },
    ],
    payload: {
      mode: "detail",
      city: murmansk,
      verdict: "Овал есть. Решают облака.",
    },
  },
  {
    id: "s4-map",
    step: 4,
    totalSteps: TOTAL_STEPS,
    device: "watcher",
    app: "aurora",
    title: "Map",
    hint: "Tap Териберка",
    next: "s5-go",
    payload: {
      mode: "map",
      heading: "Кольский",
      spots: [
        { ...spb, x: 28, y: 78 },
        { ...murmansk, x: 46, y: 44 },
        { ...khibiny, x: 58, y: 56 },
        { ...teriberka, x: 68, y: 30, best: true },
      ],
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
      headline: "Ехать в Териберку",
      detail: "65% · облака 12% · ~120 км",
      footnote: "Дома 27% из‑за облаков 62%",
    },
  },
];
