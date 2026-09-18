import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 5;

export const scenes: Scene[] = [
  {
    id: "s1-site",
    step: 1,
    totalSteps: TOTAL_STEPS,
    device: "ops",
    app: "devices-play",
    title: "Site",
    hint: "Protect-style grid. The camera is the status.",
    choices: [{ id: "next", label: "Next", next: "s2-lossy", variant: "primary" }],
    payload: {
      view: "fleet",
      reset: true,
      focusId: "lobby-cam",
      coach: {
        title: "Your site",
        body: "Tap the lobby feed — or Next to drop packets on it.",
      },
    },
  },
  {
    id: "s2-lossy",
    step: 2,
    totalSteps: TOTAL_STEPS,
    device: "ops",
    app: "devices-play",
    title: "Weak signal",
    hint: "Noise is not a down. Tile stays LIVE.",
    choices: [{ id: "next", label: "Next", next: "s3-kill", variant: "primary" }],
    payload: {
      view: "fleet",
      focusId: "lobby-cam",
      inject: { id: "lobby-cam", fault: "lossy" },
      coach: {
        title: "40% loss",
        body: "Feed stutters. LIVE stays green. Tap the tile to Kill.",
      },
    },
  },
  {
    id: "s3-kill",
    step: 3,
    totalSteps: TOTAL_STEPS,
    device: "ops",
    app: "devices-play",
    title: "No signal",
    hint: "Four consecutive misses → black tile.",
    choices: [{ id: "next", label: "Next", next: "s4-add", variant: "primary" }],
    payload: {
      view: "fleet",
      focusId: "lobby-cam",
      inject: { id: "lobby-cam", fault: "dead" },
      coach: {
        title: "Hard kill",
        body: "Wait for NO SIGNAL. Four misses. Then add a camera.",
      },
    },
  },
  {
    id: "s4-add",
    step: 4,
    totalSteps: TOTAL_STEPS,
    device: "ops",
    app: "devices-play",
    title: "Add",
    hint: "Plus tile. In-process emulator, no Docker.",
    choices: [{ id: "next", label: "Next", next: "s5-play", variant: "primary" }],
    payload: {
      view: "add",
      coach: {
        title: "Add emulator",
        body: "Spin one up — or Next to drop Patio Cam on the grid.",
      },
    },
  },
  {
    id: "s5-play",
    step: 5,
    totalSteps: TOTAL_STEPS,
    device: "ops",
    app: "devices-play",
    title: "Play",
    hint: "Sandbox. Tap anything. Reset to replay the beats.",
    payload: {
      view: "fleet",
      spawn: { name: "Patio Cam", kind: "camera", protocol: "grpc" },
      inject: { id: "lobby-cam", fault: "none" },
      coach: {
        title: "Your turn",
        body: "Grid is live. Break, add, recover — no more wizard.",
      },
    },
  },
];
