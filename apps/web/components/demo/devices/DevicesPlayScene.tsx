"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import type { Choice } from "@demo/runtime";
import {
  FAIL_THRESHOLD,
  TICK_MS,
  applyFault,
  counts,
  kindLabel,
  seedFleet,
  spawnEmulator,
  tickFleet,
  type DeviceRow,
  type DevicesPayload,
  type Fault,
  type Kind,
  type Protocol,
  type Status,
} from "./fleet";

type Screen =
  | { type: "grid" }
  | { type: "sheet"; id: string }
  | { type: "add" };

type State = {
  devices: DeviceRow[];
  appliedScene: string;
};

type Action =
  | { type: "tick" }
  | { type: "apply-scene"; sceneId: string; payload: DevicesPayload }
  | { type: "fault"; id: string; fault: Fault }
  | { type: "spawn"; name: string; kind: Kind; protocol: Protocol };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "tick":
      return { ...state, devices: tickFleet(state.devices) };
    case "apply-scene": {
      if (state.appliedScene === action.sceneId) return state;
      let devices = action.payload.reset ? seedFleet() : state.devices;
      if (action.payload.inject) {
        devices = applyFault(
          devices,
          action.payload.inject.id,
          action.payload.inject.fault,
        );
      }
      if (action.payload.spawn) {
        devices = spawnEmulator(devices, action.payload.spawn);
      }
      return { devices, appliedScene: action.sceneId };
    }
    case "fault":
      return {
        ...state,
        devices: applyFault(state.devices, action.id, action.fault),
      };
    case "spawn":
      return {
        ...state,
        devices: spawnEmulator(state.devices, {
          name: action.name,
          kind: action.kind,
          protocol: action.protocol,
        }),
      };
  }
}

function screenFromPayload(payload: DevicesPayload): Screen {
  if (payload.view === "detail" && payload.focusId) {
    return { type: "sheet", id: payload.focusId };
  }
  if (payload.view === "add") return { type: "add" };
  return { type: "grid" };
}

const DOT: Record<Status, string> = {
  up: "bg-[#3dd68c]",
  degraded: "bg-[#f5a524]",
  down: "bg-[#f31260]",
  unknown: "bg-[#6b7280]",
};

type DevicesPlaySceneProps = {
  sceneId: string;
  payload: DevicesPayload;
  choices?: Choice[];
  onChoice: (choice: Choice) => void;
};

export function DevicesPlayScene({
  sceneId,
  payload,
  choices,
  onChoice,
}: DevicesPlaySceneProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    devices: seedFleet(),
    appliedScene: "",
  }));
  const [nav, setNav] = useState<{ scene: string; screen: Screen } | null>(
    null,
  );
  const primary = choices?.find((c) => c.variant === "primary") ?? choices?.[0];

  if (state.appliedScene !== sceneId) {
    dispatch({ type: "apply-scene", sceneId, payload });
  }

  useEffect(() => {
    const id = window.setInterval(() => dispatch({ type: "tick" }), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const screen =
    nav && nav.scene === sceneId ? nav.screen : screenFromPayload(payload);
  const setScreen = (next: Screen) => setNav({ scene: sceneId, screen: next });

  const stats = useMemo(() => counts(state.devices), [state.devices]);
  const hero =
    state.devices.find((d) => d.id === "lobby-cam") ?? state.devices[0];
  const rest = state.devices.filter((d) => d.id !== hero?.id);
  const sheetDevice =
    screen.type === "sheet"
      ? state.devices.find((d) => d.id === screen.id)
      : undefined;
  const spotlight = payload.focusId;

  return (
    <div className="relative flex h-full w-full flex-col bg-[#050608] text-[#eceff1]">
      <header className="flex shrink-0 items-center justify-between px-3 pb-1.5 pt-1">
        <div>
          <div className="text-[15px] font-semibold tracking-tight">UniFi</div>
          <div className="text-[10px] text-[#8b949e]">Booth-01 · emulators</div>
        </div>
        <div className="text-right text-[10px] font-semibold tabular-nums">
          <span className="text-[#3dd68c]">{stats.up} live</span>
          {stats.down ? (
            <span className="ml-1.5 text-[#f31260]">{stats.down} down</span>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-2">
        {hero ? (
          <button
            type="button"
            onClick={() => setScreen({ type: "sheet", id: hero.id })}
            className={[
              "mb-1.5 block w-full overflow-hidden rounded-xl text-left ring-1 ring-white/10",
              spotlight === hero.id ? "ring-2 ring-[#006fff]" : "",
            ].join(" ")}
          >
            <CameraFeed device={hero} tall />
          </button>
        ) : null}
        <div className="grid grid-cols-2 gap-1.5">
          {rest.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setScreen({ type: "sheet", id: d.id })}
              className={[
                "overflow-hidden rounded-xl text-left ring-1 ring-white/10",
                spotlight === d.id ? "ring-2 ring-[#006fff]" : "",
              ].join(" ")}
            >
              {d.kind === "camera" ? (
                <CameraFeed device={d} />
              ) : (
                <GearTile device={d} />
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setScreen({ type: "add" })}
            className={[
              "flex min-h-[88px] flex-col items-center justify-center rounded-xl border border-dashed border-white/20 text-[#9ecbff]",
              payload.view === "add" ? "ring-2 ring-[#006fff]" : "",
            ].join(" ")}
          >
            <span className="text-lg leading-none">+</span>
            <span className="mt-1 text-[10px] font-medium">Add</span>
          </button>
        </div>
      </div>

      {sheetDevice ? (
        <HomeSheet
          device={sheetDevice}
          onClose={() => setScreen({ type: "grid" })}
          onFault={(fault) =>
            dispatch({ type: "fault", id: sheetDevice.id, fault })
          }
        />
      ) : null}

      {screen.type === "add" ? (
        <AddSheet
          onClose={() => setScreen({ type: "grid" })}
          onSpawn={(input) => {
            dispatch({ type: "spawn", ...input });
            setScreen({ type: "grid" });
          }}
        />
      ) : null}

      {payload.coach && screen.type === "grid" ? (
        <CoachCard
          title={payload.coach.title}
          body={payload.coach.body}
          nextLabel={primary?.label}
          onNext={primary ? () => onChoice(primary) : undefined}
        />
      ) : null}
      {payload.coach && screen.type !== "grid" && primary ? (
        <div className="absolute right-2.5 top-10 z-30">
          <button
            type="button"
            onClick={() => onChoice(primary)}
            className="rounded-full bg-[#006fff] px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg"
          >
            {primary.label}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CameraFeed({
  device,
  tall,
}: {
  device: DeviceRow;
  tall?: boolean;
}) {
  const dead = device.status === "down" || device.fault === "dead";
  const lossy = !dead && device.fault === "lossy";
  return (
    <div
      className={[
        "relative w-full overflow-hidden",
        tall ? "h-[148px]" : "h-[88px]",
        dead ? "cam-dead" : "cam-live",
        lossy ? "cam-lossy" : "",
      ].join(" ")}
    >
      {!dead ? <div className="cam-scanlines pointer-events-none absolute inset-0" /> : null}
      {lossy ? (
        <div className="cam-scan-bar pointer-events-none absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      ) : null}
      <div className="absolute left-2 top-2 flex items-center gap-1">
        <span className={["h-1.5 w-1.5 rounded-full", DOT[device.status]].join(" ")} />
        <span className="text-[9px] font-semibold uppercase tracking-wide text-white/90">
          {dead ? "no signal" : lossy ? "weak" : "live"}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-5">
        <div className="truncate text-[11px] font-semibold">{device.name}</div>
        <div className="text-[9px] text-white/70">
          {device.protocol.toUpperCase()}
          {device.status === "up" && device.fault === "lossy"
            ? " · up"
            : ` · ${device.status}`}
        </div>
      </div>
    </div>
  );
}

function GearTile({ device }: { device: DeviceRow }) {
  return (
    <div className="flex min-h-[88px] flex-col justify-between bg-[#12151b] px-2.5 py-2">
      <div className="flex items-start justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wide text-[#9ecbff]">
          {kindLabel(device.kind)}
        </span>
        <span className={["mt-0.5 h-1.5 w-1.5 rounded-full", DOT[device.status]].join(" ")} />
      </div>
      <div>
        <div className="truncate text-[12px] font-semibold">{device.name}</div>
        <Sparkline checks={device.checks} down={device.status === "down"} />
      </div>
    </div>
  );
}

function Sparkline({ checks, down }: { checks: number[]; down?: boolean }) {
  const pts = checks.length < 2 ? [0, 0] : checks;
  const max = Math.max(40, ...pts);
  const w = 120;
  const h = 18;
  const d = pts
    .map((v, i) => {
      const x = (i / Math.max(1, pts.length - 1)) * w;
      const y = h - (Math.max(0, v) / max) * (h - 3) - 1.5;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${Number.isFinite(y) ? y.toFixed(1) : h}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-4 w-full" aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={down ? "#f31260" : "#006fff"}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeSheet({
  device,
  onClose,
  onFault,
}: {
  device: DeviceRow;
  onClose: () => void;
  onFault: (fault: Fault) => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-2xl bg-[#16181d] px-3 pb-3 pt-2 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
      <button
        type="button"
        onClick={onClose}
        className="mx-auto mb-2 block h-1 w-10 rounded-full bg-white/25"
        aria-label="Close"
      />
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[14px] font-semibold">{device.name}</div>
          <div className="text-[10px] text-[#8b949e]">
            {kindLabel(device.kind)} · {device.protocol.toUpperCase()} · emu
          </div>
        </div>
        <span
          className={[
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
            device.status === "up"
              ? "bg-[#3dd68c]/15 text-[#3dd68c]"
              : device.status === "down"
                ? "bg-[#f31260]/15 text-[#f31260]"
                : "bg-[#f5a524]/15 text-[#f5a524]",
          ].join(" ")}
        >
          {device.status}
        </span>
      </div>
      <p className="mt-1.5 text-[10px] text-[#8b949e]">
        {device.fault === "lossy"
          ? `40% loss · ${device.consecutiveFails}/${FAIL_THRESHOLD} misses · still ${device.status}`
          : device.events[0]?.text ?? "health ok"}
      </p>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        <FaultChip
          label="Drop 40%"
          active={device.fault === "lossy"}
          onClick={() => onFault("lossy")}
        />
        <FaultChip
          label="Kill"
          active={device.fault === "dead"}
          danger
          onClick={() => onFault("dead")}
        />
        <FaultChip
          label="Recover"
          active={device.fault === "none"}
          onClick={() => onFault("none")}
        />
      </div>
    </div>
  );
}

function FaultChip({
  label,
  active,
  danger,
  onClick,
}: {
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full py-2 text-[11px] font-semibold active:scale-[0.98]",
        active
          ? danger
            ? "bg-[#f31260] text-white"
            : "bg-[#006fff] text-white"
          : danger
            ? "bg-[#2a1218] text-[#fca5a5]"
            : "bg-white/8 text-[#e8eaed]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function AddSheet({
  onClose,
  onSpawn,
}: {
  onClose: () => void;
  onSpawn: (input: { name: string; kind: Kind; protocol: Protocol }) => void;
}) {
  const [name, setName] = useState("Patio Cam");
  const [kind, setKind] = useState<Kind>("camera");
  const [protocol, setProtocol] = useState<Protocol>("grpc");
  return (
    <form
      className="absolute inset-x-0 bottom-0 z-10 rounded-t-2xl bg-[#16181d] px-3 pb-3 pt-2 ring-1 ring-white/10"
      onSubmit={(e) => {
        e.preventDefault();
        onSpawn({ name, kind, protocol });
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="mx-auto mb-2 block h-1 w-10 rounded-full bg-white/25"
        aria-label="Close"
      />
      <div className="text-[14px] font-semibold">New emulator</div>
      <p className="text-[10px] text-[#8b949e]">In-process. No container.</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-2 w-full rounded-lg bg-[#0d0f13] px-3 py-2 text-[13px] outline-none ring-1 ring-white/10 focus:ring-[#006fff]"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(
          [
            ["camera", "Camera"],
            ["router", "Gateway"],
            ["switch", "Switch"],
            ["door", "Door"],
          ] as [Kind, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setKind(id)}
            className={[
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              kind === id ? "bg-[#006fff] text-white" : "bg-white/8 text-[#c4cdd6]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {(["rest", "grpc"] as Protocol[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setProtocol(p)}
            className={[
              "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
              protocol === p ? "bg-[#006fff] text-white" : "bg-white/8 text-[#c4cdd6]",
            ].join(" ")}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="mt-3 w-full rounded-full bg-[#006fff] py-2 text-[13px] font-semibold text-white"
      >
        Spin up
      </button>
    </form>
  );
}

function CoachCard({
  title,
  body,
  nextLabel,
  onNext,
}: {
  title: string;
  body: string;
  nextLabel?: string;
  onNext?: () => void;
}) {
  return (
    <div className="absolute inset-x-2 bottom-2 z-20 flex items-end gap-2 rounded-2xl bg-[#16181d]/95 p-2.5 shadow-xl ring-1 ring-white/15">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold text-[#9ecbff]">{title}</div>
        <p className="text-[11px] leading-snug text-[#c4cdd6]">{body}</p>
      </div>
      {nextLabel && onNext ? (
        <button
          type="button"
          onClick={onNext}
          className="shrink-0 rounded-full bg-[#006fff] px-3 py-1.5 text-[11px] font-semibold text-white"
        >
          {nextLabel}
        </button>
      ) : null}
    </div>
  );
}
