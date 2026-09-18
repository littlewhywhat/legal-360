"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import type { Choice } from "@demo/runtime";
import {
  FAIL_THRESHOLD,
  TICK_MS,
  applyFault,
  counts,
  kindCode,
  kindLabel,
  latestTicker,
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
  | { type: "fleet" }
  | { type: "detail"; id: string }
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
    return { type: "detail", id: payload.focusId };
  }
  if (payload.view === "add") return { type: "add" };
  return { type: "fleet" };
}

const STATUS_DOT: Record<Status, string> = {
  up: "bg-[#3dd68c]",
  degraded: "bg-[#f5a524]",
  down: "bg-[#f31260]",
  unknown: "bg-[#6b7280]",
};

const STATUS_TEXT: Record<Status, string> = {
  up: "text-[#3dd68c]",
  degraded: "text-[#f5a524]",
  down: "text-[#f31260]",
  unknown: "text-[#9ca3af]",
};

type DevicesSceneProps = {
  sceneId: string;
  payload: DevicesPayload;
  choices?: Choice[];
  onChoice: (choice: Choice) => void;
  onAdvance?: () => void;
};

export function DevicesScene({
  sceneId,
  payload,
  choices,
  onChoice,
  onAdvance,
}: DevicesSceneProps) {
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
  const ticker = useMemo(() => latestTicker(state.devices), [state.devices]);
  const focused =
    screen.type === "detail"
      ? state.devices.find((d) => d.id === screen.id)
      : undefined;

  const goNext = () => {
    if (primary) onChoice(primary);
    else onAdvance?.();
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#0b0f14] text-[#e8eaed]">
      <header className="shrink-0 px-3 pb-2 pt-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[15px] font-semibold tracking-tight">
            Device Monitor
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold tabular-nums">
            <span className="text-[#3dd68c]">{stats.up} up</span>
            {stats.degraded ? (
              <span className="text-[#f5a524]">{stats.degraded} deg</span>
            ) : null}
            {stats.down ? (
              <span className="text-[#f31260]">{stats.down} down</span>
            ) : null}
          </div>
        </div>
        <p className="mt-1 truncate text-[10px] text-[#8b949e]">{ticker}</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {screen.type === "fleet" ? (
          <FleetList
            devices={state.devices}
            onOpen={(id) => setScreen({ type: "detail", id })}
            onAdd={() => setScreen({ type: "add" })}
          />
        ) : null}
        {screen.type === "detail" && focused ? (
          <DeviceDetail
            device={focused}
            onBack={() => setScreen({ type: "fleet" })}
            onFault={(fault) =>
              dispatch({ type: "fault", id: focused.id, fault })
            }
          />
        ) : null}
        {screen.type === "detail" && !focused ? (
          <FleetList
            devices={state.devices}
            onOpen={(id) => setScreen({ type: "detail", id })}
            onAdd={() => setScreen({ type: "add" })}
          />
        ) : null}
        {screen.type === "add" ? (
          <AddSheet
            onBack={() => setScreen({ type: "fleet" })}
            onSpawn={(input) => {
              dispatch({ type: "spawn", ...input });
              setScreen({ type: "fleet" });
            }}
          />
        ) : null}
      </div>

      {primary || onAdvance ? (
        <div className="shrink-0 border-t border-white/10 p-2.5">
          <button
            type="button"
            onClick={goNext}
            className="w-full rounded-lg bg-[#006fff] py-2 text-[13px] font-semibold text-white active:scale-[0.98]"
          >
            {primary?.label ?? "Continue"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FleetList({
  devices,
  onOpen,
  onAdd,
}: {
  devices: DeviceRow[];
  onOpen: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="px-2 pb-3">
      <ul className="space-y-1">
        {devices.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onOpen(d.id)}
              className="flex w-full items-center gap-2.5 rounded-lg bg-[#151a21] px-2.5 py-2 text-left ring-1 ring-white/6 active:bg-[#1b222c]"
            >
              <span
                className={[
                  "h-2 w-2 shrink-0 rounded-full",
                  STATUS_DOT[d.status],
                  d.status === "up" ? "status-pulse" : "",
                ].join(" ")}
              />
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/6 text-[9px] font-bold tracking-wide text-[#9ecbff]">
                {kindCode(d.kind)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">
                  {d.name}
                </span>
                <span className="block text-[10px] text-[#8b949e]">
                  {d.protocol.toUpperCase()}
                  {d.emulator ? " · emu" : ""}
                  {d.fault === "lossy" ? " · 40% loss" : ""}
                  {d.fault === "dead" ? " · killed" : ""}
                </span>
              </span>
              <span
                className={[
                  "shrink-0 text-[10px] font-semibold uppercase tracking-wide",
                  STATUS_TEXT[d.status],
                ].join(" ")}
              >
                {d.status}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 w-full rounded-lg border border-dashed border-white/15 py-2 text-[12px] font-medium text-[#9ecbff] active:bg-white/5"
      >
        + Add emulator
      </button>
    </div>
  );
}

function DeviceDetail({
  device,
  onBack,
  onFault,
}: {
  device: DeviceRow;
  onBack: () => void;
  onFault: (fault: Fault) => void;
}) {
  return (
    <div className="flex flex-col px-3 pb-3">
      <button
        type="button"
        onClick={onBack}
        className="mb-2 self-start text-[11px] font-medium text-[#9ecbff]"
      >
        ← Fleet
      </button>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[16px] font-semibold">{device.name}</div>
          <div className="mt-0.5 text-[11px] text-[#8b949e]">
            {kindLabel(device.kind)} · {device.protocol.toUpperCase()} · emulator
          </div>
        </div>
        <span
          className={[
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
            STATUS_TEXT[device.status],
            "bg-white/5",
          ].join(" ")}
        >
          {device.status}
        </span>
      </div>
      <Sparkline checks={device.checks} />
      <div className="mt-1 flex justify-between text-[10px] text-[#8b949e]">
        <span>
          misses {device.consecutiveFails}/{FAIL_THRESHOLD} to down
        </span>
        <span className="tabular-nums">
          {device.lastLatencyMs ? `${device.lastLatencyMs} ms` : "timeout"}
        </span>
      </div>
      <ul className="mt-3 space-y-1">
        {device.events.map((ev, i) => (
          <li
            key={`${ev.text}-${i}`}
            className="truncate rounded-md bg-[#151a21] px-2 py-1.5 font-mono text-[10px] text-[#c4cdd6]"
          >
            {ev.text}
          </li>
        ))}
      </ul>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <FaultBtn
          label="Drop 40%"
          active={device.fault === "lossy"}
          onClick={() => onFault("lossy")}
        />
        <FaultBtn
          label="Kill"
          active={device.fault === "dead"}
          danger
          onClick={() => onFault("dead")}
        />
        <FaultBtn
          label="Recover"
          active={device.fault === "none"}
          onClick={() => onFault("none")}
        />
      </div>
    </div>
  );
}

function FaultBtn({
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
        "rounded-lg py-2 text-[11px] font-semibold active:scale-[0.98]",
        active
          ? danger
            ? "bg-[#f31260] text-white"
            : "bg-[#006fff] text-white"
          : danger
            ? "bg-[#2a1218] text-[#fca5a5] ring-1 ring-[#f31260]/30"
            : "bg-[#151a21] text-[#e8eaed] ring-1 ring-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function Sparkline({ checks }: { checks: number[] }) {
  const w = 280;
  const h = 36;
  const pts = checks.length < 2 ? [0, 0] : checks;
  const max = Math.max(40, ...pts);
  const d = pts
    .map((v, i) => {
      const x = (i / Math.max(1, pts.length - 1)) * w;
      const y = h - (Math.max(0, v) / max) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${Number.isFinite(y) ? y.toFixed(1) : h}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-3 w-full text-[#006fff]"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AddSheet({
  onBack,
  onSpawn,
}: {
  onBack: () => void;
  onSpawn: (input: { name: string; kind: Kind; protocol: Protocol }) => void;
}) {
  const [name, setName] = useState("Patio Cam");
  const [kind, setKind] = useState<Kind>("camera");
  const [protocol, setProtocol] = useState<Protocol>("rest");

  return (
    <form
      className="flex flex-col gap-3 px-3 pb-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSpawn({ name, kind, protocol });
      }}
    >
      <button
        type="button"
        onClick={onBack}
        className="self-start text-[11px] font-medium text-[#9ecbff]"
      >
        ← Fleet
      </button>
      <div>
        <div className="text-[16px] font-semibold">New emulator</div>
        <p className="mt-0.5 text-[11px] text-[#8b949e]">
          In-process virtual device. No container spawn.
        </p>
      </div>
      <label className="block text-[11px] font-medium text-[#8b949e]">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg bg-[#151a21] px-3 py-2 text-[13px] text-[#e8eaed] outline-none ring-1 ring-white/10 focus:ring-[#006fff]"
        />
      </label>
      <ChipRow
        label="Type"
        value={kind}
        options={[
          ["router", "Gateway"],
          ["switch", "Switch"],
          ["camera", "Camera"],
          ["door", "Door"],
        ]}
        onChange={setKind}
      />
      <ChipRow
        label="Health"
        value={protocol}
        options={[
          ["rest", "REST"],
          ["grpc", "gRPC"],
        ]}
        onChange={setProtocol}
      />
      <button
        type="submit"
        className="mt-1 rounded-lg bg-[#006fff] py-2.5 text-[13px] font-semibold text-white active:scale-[0.98]"
      >
        Spin up emulator
      </button>
    </form>
  );
}

function ChipRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium text-[#8b949e]">{label}</div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {options.map(([id, text]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={[
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              value === id
                ? "bg-[#006fff] text-white"
                : "bg-[#151a21] text-[#c4cdd6] ring-1 ring-white/10",
            ].join(" ")}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
