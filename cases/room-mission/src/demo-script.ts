import type { Scene } from "@demo/runtime";

export const TOTAL_STEPS = 10;

export type Stakeholder = "po" | "ux" | "dev";
export type AgentSpot = "pool" | "pricing" | "hero";
export type AgentMotion = "arrive" | "leave" | "glance";
export type ArtifactKind = "decision" | "spec" | "design" | "diff" | "verification" | "copy";

export type PlayStep = {
  id: string;
  label: string;
  state: "done" | "current" | "upcoming" | "added";
};

export type Artifact = {
  id: string;
  kind: ArtifactKind;
  title: string;
  detail: string;
  delay?: number;
};

export type ThreadLine = {
  id: string;
  from: "agent" | "human";
  text: string;
  tag?: "qq" | "dq";
  delay?: number;
};

export type MissionRow = {
  id: string;
  title: string;
  gate: string;
  tone: "active" | "queued" | "done" | "garbage";
  note?: string;
};

export type RoomPayload = {
  view: "room" | "mission";
  who: Stakeholder;
  agent: AgentSpot;
  agentMotion?: AgentMotion;
  poolLabel: string;
  missions: MissionRow[];
  openId: string;
  steps: PlayStep[];
  artifacts: Artifact[];
  thread: ThreadLine[];
  signal?: "qq" | "dq";
  stamp?: "done" | "garbage";
  callout?: string;
  continueLabel?: string;
};

const BASE = ["Scope", "Spec", "Design", "Implement", "Verify", "Accept"];

function steps(
  current: string,
  inserted?: { label: string; before: string; fresh?: boolean },
): PlayStep[] {
  const labels = [...BASE];
  if (inserted) {
    const at = labels.indexOf(inserted.before);
    labels.splice(at, 0, inserted.label);
  }
  const idx = labels.indexOf(current);
  return labels.map((label) => {
    const i = labels.indexOf(label);
    let state: PlayStep["state"] = i < idx ? "done" : i === idx ? "current" : "upcoming";
    if (inserted?.fresh && label === inserted.label) state = "added";
    return { id: label.toLowerCase().replace(/\s+/g, "-"), label, state };
  });
}

function missions(gate: string, tone: MissionRow["tone"], note?: string): MissionRow[] {
  return [
    { id: "pricing", title: "Pricing section", gate, tone, note },
    { id: "hero", title: "Hero contrast", gate: "Design", tone: "queued", note: "UX slot" },
  ];
}

const decision: Artifact = {
  id: "decision",
  kind: "decision",
  title: "Annual default",
  detail: "PO · show the year price first",
};

const spec: Artifact = {
  id: "spec",
  kind: "spec",
  title: "Pricing spec",
  detail: "Annual card, month as a secondary line",
};

const design: Artifact = {
  id: "design",
  kind: "design",
  title: "Pricing layout",
  detail: "UX · annual card on top",
};

const diff: Artifact = {
  id: "diff",
  kind: "diff",
  title: "Pricing diff",
  detail: "Hero price block",
  delay: 80,
};

const verification: Artifact = {
  id: "verification",
  kind: "verification",
  title: "Verification",
  detail: "Checks green",
  delay: 720,
};

const copy: Artifact = {
  id: "copy",
  kind: "copy",
  title: "Legal copy",
  detail: "Annual price, tax note",
  delay: 1400,
};

const legal = { label: "Legal copy", before: "Accept" };

function scene(
  id: string,
  step: number,
  title: string,
  hint: string,
  payload: RoomPayload,
  next?: string,
  choices?: Scene["choices"],
): Scene {
  return {
    id,
    step,
    totalSteps: TOTAL_STEPS,
    device: "system",
    app: "room",
    title,
    hint,
    next,
    choices,
    payload,
  };
}

export const scenes: Scene[] = [
  scene(
    "room",
    1,
    "Room",
    "Two missions share the room. The agent sits in the pool. Open Pricing section.",
    {
      view: "room",
      who: "po",
      agent: "pool",
      poolLabel: "idle",
      missions: missions("Scope", "active"),
      openId: "pricing",
      steps: steps("Scope"),
      artifacts: [],
      thread: [],
      continueLabel: "Open Pricing section",
    },
    "qq",
  ),
  scene(
    "qq",
    2,
    "Quick question",
    "QQ is a push. PO answers here. UX and Dev do not see this thread.",
    {
      view: "mission",
      who: "po",
      agent: "pricing",
      agentMotion: "arrive",
      poolLabel: "on mission",
      missions: missions("Scope", "active"),
      openId: "pricing",
      steps: steps("Scope"),
      artifacts: [],
      signal: "qq",
      thread: [
        {
          id: "q1",
          from: "agent",
          text: "Default price — month or year?",
          tag: "qq",
          delay: 280,
        },
      ],
    },
    undefined,
    [{ id: "annual", label: "Annual", next: "decision", variant: "primary" }],
  ),
  scene(
    "decision",
    3,
    "Decision on the mission",
    "The answer becomes an artifact. The chat line stays on PO's side.",
    {
      view: "mission",
      who: "po",
      agent: "pricing",
      poolLabel: "writing",
      missions: missions("Spec", "active"),
      openId: "pricing",
      steps: steps("Spec"),
      artifacts: [{ ...decision, delay: 80 }],
      thread: [
        { id: "q1", from: "agent", text: "Default price — month or year?", tag: "qq" },
        { id: "a1", from: "human", text: "Annual.", delay: 200 },
      ],
      continueLabel: "Let the agent write the spec",
    },
    "spec",
  ),
  scene(
    "spec",
    4,
    "Spec, then a deep review",
    "Design is a DQ. The mission waits on a UX slot. The agent goes back to the pool.",
    {
      view: "mission",
      who: "po",
      agent: "pool",
      agentMotion: "leave",
      poolLabel: "released",
      missions: missions("Design", "queued", "DQ · UX slot"),
      openId: "pricing",
      steps: steps("Design"),
      artifacts: [decision, { ...spec, delay: 60 }],
      signal: "dq",
      thread: [
        { id: "q1", from: "agent", text: "Default price — month or year?", tag: "qq" },
        { id: "a1", from: "human", text: "Annual." },
        {
          id: "q2",
          from: "agent",
          text: "Spec is on the mission. Design waits for UX — queued, not a push.",
          tag: "dq",
          delay: 480,
        },
      ],
      continueLabel: "Watch the pool",
    },
    "pool",
  ),
  scene(
    "pool",
    5,
    "Pool stays free",
    "Hero contrast is already waiting on UX. The agent looks, then returns. A person is not a router.",
    {
      view: "room",
      who: "po",
      agent: "pool",
      agentMotion: "glance",
      poolLabel: "idle",
      missions: missions("Design", "queued", "DQ · UX slot"),
      openId: "pricing",
      steps: steps("Design"),
      artifacts: [decision, spec],
      thread: [],
      callout: "Hero contrast held. Still the UX slot.",
      continueLabel: "Back to Pricing",
    },
    "playbook",
  ),
  scene(
    "playbook",
    6,
    "Playbook changes mid-flight",
    "PO adds Legal copy before Accept. The mission has to pass it.",
    {
      view: "mission",
      who: "po",
      agent: "pool",
      poolLabel: "idle",
      missions: missions("Design", "queued", "DQ · UX slot"),
      openId: "pricing",
      steps: steps("Design", { ...legal, fresh: true }),
      artifacts: [decision, spec],
      thread: [
        {
          id: "q3",
          from: "human",
          text: "Add a legal-copy checkpoint before accept.",
          delay: 120,
        },
      ],
      continueLabel: "UX takes the slot",
    },
    "design",
  ),
  scene(
    "design",
    7,
    "UX, private",
    "This thread is UX only. PO's messages are not here. The layout lands as an artifact.",
    {
      view: "mission",
      who: "ux",
      agent: "pricing",
      agentMotion: "arrive",
      poolLabel: "on mission",
      missions: missions("Implement", "active"),
      openId: "pricing",
      steps: steps("Implement", legal),
      artifacts: [decision, spec, { ...design, delay: 360 }],
      thread: [
        {
          id: "u1",
          from: "agent",
          text: "Pricing layout is in your slot.",
          tag: "dq",
          delay: 200,
        },
        { id: "u2", from: "human", text: "Annual card on top. Attached.", delay: 640 },
      ],
      continueLabel: "Agent continues",
    },
    "build",
  ),
  scene(
    "build",
    8,
    "Between the gates",
    "No new question. The agent leaves a diff, a green check, and the legal copy.",
    {
      view: "mission",
      who: "ux",
      agent: "pricing",
      poolLabel: "working",
      missions: missions("Accept", "active"),
      openId: "pricing",
      steps: steps("Accept", legal),
      artifacts: [decision, spec, design, diff, verification, copy],
      thread: [
        { id: "u1", from: "agent", text: "Pricing layout is in your slot.", tag: "dq" },
        { id: "u2", from: "human", text: "Annual card on top. Attached." },
        {
          id: "u3",
          from: "agent",
          text: "Working the next gates. Nothing to answer.",
          delay: 200,
        },
      ],
      continueLabel: "Ask PO",
    },
    "accept",
  ),
  scene(
    "accept",
    9,
    "Accept",
    "QQ back to PO. Their thread does not include the UX chat. Accept or throw it out.",
    {
      view: "mission",
      who: "po",
      agent: "pricing",
      agentMotion: "arrive",
      poolLabel: "asking",
      missions: missions("Accept", "active"),
      openId: "pricing",
      steps: steps("Accept", legal),
      artifacts: [decision, spec, design, diff, verification, copy],
      signal: "qq",
      thread: [
        {
          id: "q4",
          from: "agent",
          text: "Verification is green. Accept the mission?",
          tag: "qq",
          delay: 280,
        },
      ],
    },
    undefined,
    [
      { id: "accept", label: "Accept", next: "done", variant: "primary" },
      { id: "garbage", label: "Garbage", next: "garbage", variant: "danger" },
    ],
  ),
  scene(
    "done",
    10,
    "Done",
    "Done. The artifact trail stays. Hero contrast is still queued.",
    {
      view: "mission",
      who: "po",
      agent: "pool",
      agentMotion: "leave",
      poolLabel: "idle",
      missions: missions("Done", "done"),
      openId: "pricing",
      steps: steps("Accept", legal).map((step) => ({ ...step, state: "done" as const })),
      artifacts: [decision, spec, design, diff, verification, copy],
      thread: [
        { id: "q4", from: "agent", text: "Verification is green. Accept the mission?", tag: "qq" },
        { id: "a4", from: "human", text: "Accept.", delay: 160 },
      ],
      stamp: "done",
    },
  ),
  scene(
    "garbage",
    10,
    "Garbage",
    "Closed as garbage. Same trail, still on the mission. The other mission keeps its slot.",
    {
      view: "mission",
      who: "po",
      agent: "pool",
      agentMotion: "leave",
      poolLabel: "idle",
      missions: missions("Garbage", "garbage"),
      openId: "pricing",
      steps: steps("Accept", legal).map((step) => ({ ...step, state: "done" as const })),
      artifacts: [decision, spec, design, diff, verification, copy],
      thread: [
        { id: "q4", from: "agent", text: "Verification is green. Accept the mission?", tag: "qq" },
        { id: "a5", from: "human", text: "Garbage.", delay: 160 },
      ],
      stamp: "garbage",
    },
  ),
];
