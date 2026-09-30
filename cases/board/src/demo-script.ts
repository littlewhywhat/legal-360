import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 1;

export const scenes: Scene[] = [
  {
    id: "stage",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "system",
    app: "board",
    title: "Board",
    hint: "",
    payload: {},
  },
];
