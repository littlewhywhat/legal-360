import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 1;

export const scenes: Scene[] = [
  {
    id: "desk",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "system",
    app: "triptych",
    title: "Desks",
    hint: "",
    payload: {},
  },
];
