import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 6;

export type Kind = "shore" | "plateau" | "lake" | "hill";

export type Night = {
  id: string;
  label: string;
  oval: number;
  cloud: number;
  dark: boolean;
};

export type Review = { who: string; text: string };
export type Way = { title: string; detail: string; duration: string };
export type Stay = { name: string; meta: string };

export type Origin = {
  id: "here" | "spb";
  name: string;
  x: number;
  y: number;
};

export type Place = {
  id: string;
  name: string;
  kind: Kind;
  oval: number;
  cloud: number;
  dark: boolean;
  km: number;
  x: number;
  y: number;
  nearest?: boolean;
  best?: boolean;
  nights: Night[];
  reviews: Review[];
  waysHere: Way[];
  waysSpb: Way[];
  hotels: Stay[];
  food: Stay[];
};

export const here: Origin = { id: "here", name: "Ты", x: 46, y: 58 };
export const spb: Origin = { id: "spb", name: "Санкт-Петербург", x: 14, y: 86 };

export const shore: Place = {
  id: "shore",
  name: "Берег",
  kind: "shore",
  oval: 74,
  cloud: 12,
  dark: true,
  km: 118,
  x: 72,
  y: 24,
  best: true,
  nights: [
    { id: "n0", label: "12 сен 2026", oval: 81, cloud: 8, dark: true },
    { id: "n1", label: "3 сен 2026", oval: 68, cloud: 22, dark: true },
    { id: "n2", label: "18 авг 2026", oval: 77, cloud: 16, dark: true },
  ],
  reviews: [
    { who: "Аня", text: "Столб над водой, двадцать минут — и всё небо." },
    { who: "Кирилл", text: "Парковка у маяка, дальше 800 м пешком." },
    { who: "Лена", text: "После полуночи облака ушли. Стоило ждать." },
  ],
  waysHere: [
    { title: "Авто + пешком", detail: "Трасса до маяка, тропа к воде", duration: "1ч 20м" },
    { title: "Автобус + пешком", detail: "Мурманск → посёлок, 800 м", duration: "2ч 10м" },
    { title: "Такси", detail: "Дорога до тупика, дальше пешком", duration: "1ч 10м" },
  ],
  waysSpb: [
    { title: "Самолёт + автобус", detail: "LED → MMK, автобус к берегу", duration: "5ч" },
    { title: "Поезд + авто", detail: "Ласточка до Мурманска, затем авто", duration: "27ч" },
    { title: "Авто + пешком", detail: "Кольский тракт, тропа к воде", duration: "18ч" },
  ],
  hotels: [
    { name: "Дом у маяка", meta: "800 м · от 6 400 ₽" },
    { name: "База «Север»", meta: "4 км · от 4 900 ₽" },
    { name: "Изба на косе", meta: "1.2 км · от 7 200 ₽" },
  ],
  food: [
    { name: "Кафе «Прилив»", meta: "у дороги · до 23:00" },
    { name: "Рыбацкая кухня", meta: "1.4 км · горячее" },
    { name: "Магазин у трассы", meta: "термос, булки, вода" },
  ],
};

export const plateau: Place = {
  id: "plateau",
  name: "Плато",
  kind: "plateau",
  oval: 70,
  cloud: 38,
  dark: true,
  km: 32,
  x: 60,
  y: 40,
  nights: [
    { id: "n0", label: "9 сен 2026", oval: 73, cloud: 18, dark: true },
    { id: "n1", label: "1 сен 2026", oval: 64, cloud: 30, dark: true },
    { id: "n2", label: "11 авг 2026", oval: 70, cloud: 24, dark: true },
  ],
  reviews: [
    { who: "Олег", text: "Горизонт на 360. Ветер, но овал виден целиком." },
    { who: "Маша", text: "Грунтовка нормальная. Палатка у края." },
  ],
  waysHere: [
    { title: "Авто + пешком", detail: "Грунтовка, 1.5 км тропа", duration: "50м" },
    { title: "Автобус + такси", detail: "До поворота, дальше заказ", duration: "1ч 25м" },
  ],
  waysSpb: [
    { title: "Самолёт + авто", detail: "LED → MMK, аренда до плато", duration: "5ч 40м" },
    { title: "Поезд + авто", detail: "До Мурманска, затем грунтовка", duration: "28ч" },
    { title: "Авто + пешком", detail: "Тракт и тропа по краю", duration: "18ч 30м" },
  ],
  hotels: [
    { name: "База на плато", meta: "2 км · от 5 100 ₽" },
    { name: "Домик егерей", meta: "6 км · от 3 800 ₽" },
  ],
  food: [
    { name: "Столовая у трассы", meta: "до 21:00" },
    { name: "Чайная", meta: "термосы, суп" },
  ],
};

export const lake: Place = {
  id: "lake",
  name: "Озеро",
  kind: "lake",
  oval: 71,
  cloud: 55,
  dark: true,
  km: 6,
  x: 38,
  y: 70,
  nights: [
    { id: "n0", label: "14 сен 2026", oval: 69, cloud: 20, dark: true },
    { id: "n1", label: "29 авг 2026", oval: 75, cloud: 14, dark: true },
    { id: "n2", label: "7 авг 2026", oval: 62, cloud: 28, dark: true },
  ],
  reviews: [
    { who: "Ира", text: "Отражение в воде — как второй овал." },
    { who: "Паша", text: "Близко от города, но тёмная сторона озера." },
  ],
  waysHere: [
    { title: "Авто + пешком", detail: "Лесная дорога, 400 м", duration: "15м" },
    { title: "Автобус + пешком", detail: "Остановка «Озеро», тропа", duration: "35м" },
  ],
  waysSpb: [
    { title: "Самолёт + такси", detail: "LED → MMK, 20 мин до озера", duration: "4ч 20м" },
    { title: "Поезд + автобус", detail: "Мурманск, затем пригород", duration: "26ч 40м" },
    { title: "Авто + пешком", detail: "Кольский, съезд к воде", duration: "17ч 50м" },
  ],
  hotels: [
    { name: "Дом у воды", meta: "300 м · от 5 600 ₽" },
    { name: "База «Тишина»", meta: "1 км · от 4 200 ₽" },
  ],
  food: [
    { name: "Кафе у пирса", meta: "до 22:00" },
    { name: "Магазин в посёлке", meta: "10 мин" },
  ],
};

export const hill: Place = {
  id: "hill",
  name: "Сопка",
  kind: "hill",
  oval: 72,
  cloud: 70,
  dark: true,
  km: 4,
  x: 32,
  y: 46,
  nearest: true,
  nights: [
    { id: "n0", label: "16 сен 2026", oval: 70, cloud: 26, dark: true },
    { id: "n1", label: "5 сен 2026", oval: 66, cloud: 18, dark: true },
    { id: "n2", label: "21 авг 2026", oval: 78, cloud: 12, dark: true },
  ],
  reviews: [
    { who: "Ника", text: "Близко. Засветка снизу, смотреть на север." },
    { who: "Глеб", text: "15 минут пешком от кольца. Часто облачно." },
  ],
  waysHere: [
    { title: "Пешком", detail: "Тропа от кольца", duration: "15м" },
    { title: "Авто + пешком", detail: "Парковка у подножия", duration: "8м" },
  ],
  waysSpb: [
    { title: "Самолёт + такси", detail: "LED → MMK, 10 мин до тропы", duration: "4ч 10м" },
    { title: "Поезд + пешком", detail: "Вокзал, автобус, тропа", duration: "26ч 20м" },
    { title: "Авто + пешком", detail: "Город, затем сопка", duration: "17ч 40м" },
  ],
  hotels: [
    { name: "Городская гостиница", meta: "3 км · от 3 900 ₽" },
    { name: "Хостел у вокзала", meta: "5 км · от 1 800 ₽" },
  ],
  food: [
    { name: "Столовая 24", meta: "внизу · круглосуточно" },
    { name: "Шаурма у кольца", meta: "до 02:00" },
  ],
};

export const places: Place[] = [shore, plateau, lake, hill];

const aurora = (id: string, step: number, title: string, hint: string, extra: Partial<Scene>): Scene => ({
  id,
  step,
  totalSteps: TOTAL_STEPS,
  device: "watcher",
  app: "aurora",
  title,
  hint,
  ...extra,
  payload: extra.payload ?? {},
});

function placeScenes(place: Place): Scene[] {
  const pid = place.id;
  return [
    aurora(`s3-${pid}`, 3, "Place", "Tap the badge or a date", {
      next: `s4-${pid}`,
      payload: { mode: "place", place, origin: here },
    }),
    aurora(`s3-${pid}-go`, 3, "Place", "Tap Маршрут", {
      next: `s5-${pid}`,
      payload: { mode: "place", place, origin: here },
    }),
    aurora(`s4-${pid}`, 4, "Analysis", "Tap back, then route", {
      next: `s3-${pid}-go`,
      payload: { mode: "analysis", place, night: null },
    }),
    ...place.nights.map((night) =>
      aurora(`s4-${pid}-${night.id}`, 4, "Analysis", "Tap back, then route", {
        next: `s3-${pid}-go`,
        payload: { mode: "analysis", place, night },
      }),
    ),
    aurora(`s5-${pid}`, 5, "Location", "Share or decline", {
      choices: [
        { id: "share", label: "Разрешить", next: `s6-${pid}-here`, variant: "primary" },
        { id: "deny", label: "Не сейчас", next: `s5-${pid}-from`, variant: "ghost" },
      ],
      payload: { mode: "geo", place },
    }),
    aurora(`s5-${pid}-from`, 5, "Location", "Type a from-city", {
      next: `s6-${pid}-spb`,
      payload: { mode: "from", place, suggestion: "Санкт-Петербург" },
    }),
    aurora(`s6-${pid}-here`, 6, "Trip", "Tap to replay", {
      next: "s1-lock",
      payload: { mode: "trip", place, origin: here, dates: "18–20 сен" },
    }),
    aurora(`s6-${pid}-spb`, 6, "Trip", "Tap to replay", {
      next: "s1-lock",
      payload: { mode: "trip", place, origin: spb, dates: "18–20 сен" },
    }),
  ];
}

export const scenes: Scene[] = [
  aurora("s1-lock", 1, "Lock", "Tap the banner", {
    next: "s2-home",
    payload: {
      mode: "lock",
      time: "21:14",
      date: "пт 18 сен",
      appName: "Сияния",
      place: shore,
    },
  }),
  aurora("s2-home", 2, "Home", "Tap a photo card", {
    next: "s3-shore",
    payload: {
      mode: "home",
      nearest: hill,
      probable: shore,
      spots: places,
    },
  }),
  ...places.flatMap(placeScenes),
];
