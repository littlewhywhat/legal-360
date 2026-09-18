export type Kind = "router" | "switch" | "camera" | "door";
export type Protocol = "rest" | "grpc";
export type Status = "up" | "degraded" | "down" | "unknown";
export type Fault = "none" | "lossy" | "dead";

export type DeviceEvent = {
  text: string;
};

export type DeviceRow = {
  id: string;
  name: string;
  kind: Kind;
  protocol: Protocol;
  emulator: boolean;
  status: Status;
  fault: Fault;
  consecutiveFails: number;
  consecutiveOk: number;
  lastLatencyMs: number;
  checks: number[];
  events: DeviceEvent[];
};

export type DevicesPayload = {
  view?: "fleet" | "detail" | "add";
  focusId?: string;
  inject?: { id: string; fault: Fault };
  spawn?: { name: string; kind: Kind; protocol: Protocol };
  reset?: boolean;
};

export const FAIL_THRESHOLD = 4;
export const TICK_MS = 650;
export const RECOVER_OK = 2;

const KIND_LABEL: Record<Kind, string> = {
  router: "Gateway",
  switch: "Switch",
  camera: "Camera",
  door: "Door",
};

export function kindLabel(kind: Kind): string {
  return KIND_LABEL[kind];
}

export function kindCode(kind: Kind): string {
  switch (kind) {
    case "router":
      return "GW";
    case "switch":
      return "SW";
    case "camera":
      return "CAM";
    case "door":
      return "DR";
  }
}

export function backoffMs(n: number): number {
  return Math.min(3200, 200 * 2 ** Math.max(0, n - 1));
}

function blank(partial: Omit<DeviceRow, "status" | "fault" | "consecutiveFails" | "consecutiveOk" | "lastLatencyMs" | "checks" | "events">): DeviceRow {
  return {
    ...partial,
    status: "up",
    fault: "none",
    consecutiveFails: 0,
    consecutiveOk: 0,
    lastLatencyMs: 24,
    checks: [18, 22, 19, 25, 21, 20],
    events: [{ text: "health ok" }],
  };
}

export function seedFleet(): DeviceRow[] {
  return [
    blank({
      id: "core-gw",
      name: "Core Gateway",
      kind: "router",
      protocol: "rest",
      emulator: true,
    }),
    blank({
      id: "access-sw",
      name: "Access Switch",
      kind: "switch",
      protocol: "grpc",
      emulator: true,
    }),
    blank({
      id: "lobby-cam",
      name: "Lobby Cam",
      kind: "camera",
      protocol: "rest",
      emulator: true,
    }),
    blank({
      id: "dock-cam",
      name: "Dock Cam",
      kind: "camera",
      protocol: "grpc",
      emulator: true,
    }),
    blank({
      id: "front-door",
      name: "Front Door",
      kind: "door",
      protocol: "rest",
      emulator: true,
    }),
    blank({
      id: "yard-ap",
      name: "Yard AP",
      kind: "router",
      protocol: "grpc",
      emulator: true,
    }),
  ];
}

export function slugId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `dev-${Date.now().toString(36)}`;
}

export function rollFail(fault: Fault, rng = Math.random): boolean {
  if (fault === "dead") return true;
  if (fault === "lossy") return rng() < 0.4;
  return rng() < 0.03;
}

function pushEvent(events: DeviceEvent[], text: string): DeviceEvent[] {
  return [{ text }, ...events].slice(0, 6);
}

export function tickDevice(
  d: DeviceRow,
  rng = Math.random,
): DeviceRow {
  const fail = rollFail(d.fault, rng);
  if (fail) {
    const consecutiveFails = d.consecutiveFails + 1;
    const latency = 0;
    const checks = [...d.checks.slice(-11), latency];
    const wait = backoffMs(consecutiveFails);
    const text =
      consecutiveFails >= FAIL_THRESHOLD
        ? `circuit open · ${consecutiveFails} misses`
        : `miss ${consecutiveFails}/${FAIL_THRESHOLD} · retry ${wait}ms`;
    const status: Status =
      consecutiveFails >= FAIL_THRESHOLD
        ? "down"
        : d.status === "down"
          ? "down"
          : d.status === "degraded"
            ? "degraded"
            : "up";
    return {
      ...d,
      consecutiveFails,
      consecutiveOk: 0,
      lastLatencyMs: latency,
      checks,
      events: pushEvent(d.events, text),
      status,
    };
  }

  const latency = Math.round(
    16 + rng() * 28 + (d.fault === "lossy" ? 90 + rng() * 80 : 0),
  );
  const checks = [...d.checks.slice(-11), latency];
  const consecutiveOk = d.consecutiveFails > 0 || d.status !== "up" ? d.consecutiveOk + 1 : 0;

  if (d.status === "down" || (d.status === "degraded" && consecutiveOk < RECOVER_OK)) {
    return {
      ...d,
      status: "degraded",
      consecutiveFails: 0,
      consecutiveOk,
      lastLatencyMs: latency,
      checks,
      events: pushEvent(d.events, `probe ok · recovering ${consecutiveOk}/${RECOVER_OK}`),
    };
  }

  const recovered = d.status !== "up";
  return {
    ...d,
    status: "up",
    consecutiveFails: 0,
    consecutiveOk: 0,
    lastLatencyMs: latency,
    checks,
    events: recovered ? pushEvent(d.events, "up") : d.events,
  };
}

export function tickFleet(devices: DeviceRow[], rng = Math.random): DeviceRow[] {
  return devices.map((d) => tickDevice(d, rng));
}

export function applyFault(
  devices: DeviceRow[],
  id: string,
  fault: Fault,
): DeviceRow[] {
  return devices.map((d) => {
    if (d.id !== id) return d;
    const label =
      fault === "lossy"
        ? "inject · 40% loss"
        : fault === "dead"
          ? "inject · hard kill"
          : "inject · recover";
    return {
      ...d,
      fault,
      events: pushEvent(d.events, label),
    };
  });
}

export function spawnEmulator(
  devices: DeviceRow[],
  input: { name: string; kind: Kind; protocol: Protocol },
): DeviceRow[] {
  const id = slugId(input.name);
  if (devices.some((d) => d.id === id)) return devices;
  return [
    ...devices,
    {
      id,
      name: input.name.trim() || "Emulator",
      kind: input.kind,
      protocol: input.protocol,
      emulator: true,
      status: "unknown",
      fault: "none",
      consecutiveFails: 0,
      consecutiveOk: 0,
      lastLatencyMs: 0,
      checks: [],
      events: [{ text: "spawned · first probe" }],
    },
  ];
}

export function counts(devices: DeviceRow[]): {
  up: number;
  degraded: number;
  down: number;
  total: number;
} {
  let up = 0;
  let degraded = 0;
  let down = 0;
  for (const d of devices) {
    if (d.status === "down") down += 1;
    else if (d.status === "degraded") degraded += 1;
    else up += 1;
  }
  return { up, degraded, down, total: devices.length };
}

export function latestTicker(devices: DeviceRow[]): string {
  for (const d of devices) {
    if (d.fault !== "none" || d.status !== "up") {
      const ev = d.events[0]?.text;
      if (ev) return `${d.name}: ${ev}`;
    }
  }
  const noisy = devices.find((d) => d.consecutiveFails > 0);
  if (noisy?.events[0]) return `${noisy.name}: ${noisy.events[0].text}`;
  return "polling health · REST + gRPC";
}
