"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Choice, DemoCase, Scene } from "@demo/runtime";
import { PhoneFrame } from "./PhoneFrame";
import { StepStrip } from "./StepStrip";
import { EmailScene } from "./EmailScene";
import { SlackScene } from "./SlackScene";
import { DocsFlash } from "./DocsFlash";
import { SystemBeat } from "./SystemBeat";
import { AuroraScene } from "./AuroraScene";
import { RoomScene } from "./RoomScene";
import type { RoomPayload } from "@cases/room-mission";

function deviceLabel(scene: Scene): string {
  switch (scene.device) {
    case "client":
      return "Client phone";
    case "supervisor":
      return "Supervisor phone";
    case "watcher":
      return "Your phone";
    default:
      return "System";
  }
}

function pathSceneId(pathname: string, caseId: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== caseId) return null;
  return parts[1] ?? null;
}

function sceneHref(caseId: string, sceneId: string, firstSceneId: string): string {
  if (sceneId === firstSceneId) return `/${caseId}/`;
  return `/${caseId}/${sceneId}/`;
}

const sceneStacks = new Map<string, string[]>();

function rememberedStack(caseId: string, sceneId: string): string[] {
  if (typeof window === "undefined") return [sceneId];
  const prev = sceneStacks.get(caseId);
  if (prev && prev[prev.length - 1] === sceneId) return prev;
  return [sceneId];
}

function rememberStack(caseId: string, stack: string[]) {
  if (typeof window === "undefined") return;
  sceneStacks.set(caseId, stack);
}

export function DemoPlayer({ demoCase }: { demoCase: DemoCase }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { sceneById, firstSceneId, meta } = demoCase;
  const fromPath = pathSceneId(pathname, meta.id);
  const fromQuery = searchParams.get("s");

  const sceneId =
    (fromPath && sceneById[fromPath] && fromPath) ||
    (fromQuery && sceneById[fromQuery] && fromQuery) ||
    firstSceneId;
  const scene = sceneById[sceneId];
  const stackRef = useRef<string[] | null>(null);
  if (stackRef.current === null) {
    stackRef.current = rememberedStack(meta.id, sceneId);
  }
  const [canBack, setCanBack] = useState(() => rememberedStack(meta.id, sceneId).length > 1);
  const [playing, setPlaying] = useState(false);

  const navigate = useCallback(
    (nextId: string) => {
      router.replace(sceneHref(meta.id, nextId, firstSceneId), { scroll: false });
    },
    [firstSceneId, meta.id, router],
  );

  const go = useCallback(
    (nextId: string) => {
      if (!sceneById[nextId]) return;
      const stack = stackRef.current ?? [sceneId];
      if (nextId === firstSceneId) {
        stackRef.current = [firstSceneId];
        rememberStack(meta.id, stackRef.current);
        setCanBack(false);
        setPlaying(false);
        navigate(nextId);
        return;
      }
      const top = stack[stack.length - 1];
      if (nextId !== top) {
        stackRef.current = [...stack, nextId];
        rememberStack(meta.id, stackRef.current);
        setCanBack(stackRef.current.length > 1);
      }
      navigate(nextId);
    },
    [firstSceneId, meta.id, navigate, sceneById, sceneId],
  );

  const back = useCallback(() => {
    setPlaying(false);
    if (!stackRef.current || stackRef.current.length < 2) return;
    stackRef.current = stackRef.current.slice(0, -1);
    rememberStack(meta.id, stackRef.current);
    setCanBack(stackRef.current.length > 1);
    navigate(stackRef.current[stackRef.current.length - 1]);
  }, [meta.id, navigate]);

  const advance = useCallback(() => {
    if (scene.next) go(scene.next);
  }, [go, scene.next]);

  const onChoice = useCallback(
    (choice: Choice) => {
      go(choice.next);
    },
    [go],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "Backspace") {
        if ((stackRef.current?.length ?? 0) > 1) {
          e.preventDefault();
          back();
        }
      }
      if (e.key === "ArrowRight" || e.key === " ") {
        const hasBlockingChoices =
          !!scene.choices &&
          scene.choices.length > 0 &&
          scene.app !== "email" &&
          !(scene.app === "room" && scene.choices.length === 1);
        if (scene.app === "room" && scene.choices?.length === 1) {
          e.preventDefault();
          onChoice(scene.choices[0]);
        } else if (scene.next && !hasBlockingChoices) {
          e.preventDefault();
          advance();
        }
      }
      if (e.key === "Home") {
        e.preventDefault();
        go(firstSceneId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, back, firstSceneId, go, onChoice, scene]);

  const nextBeat =
    scene.app === "room" && !(scene.choices && scene.choices.length > 1)
      ? (scene.next ?? scene.choices?.[0]?.next)
      : undefined;

  useEffect(() => {
    if (!playing || !nextBeat) return;
    const timer = window.setTimeout(() => go(nextBeat), 3600);
    return () => window.clearTimeout(timer);
  }, [go, nextBeat, playing]);

  const primaryChoice = useMemo(
    () => scene.choices?.find((c) => c.variant === "primary"),
    [scene.choices],
  );

  const room = scene.app === "room";

  return (
    <div className={["flex w-full flex-1 flex-col items-center py-6", room ? "gap-4" : "gap-6"].join(" ")}>
      <StepStrip step={scene.step} total={scene.totalSteps} title={scene.title} />

      {room ? (
        <RoomScene
          key={scene.id}
          payload={scene.payload as RoomPayload}
          choices={scene.choices}
          onChoice={onChoice}
          onAdvance={scene.next ? advance : undefined}
        />
      ) : null}

      {room ? null : (
        <PhoneFrame
          deviceLabel={deviceLabel(scene)}
          chrome={
            scene.app === "aurora"
              ? (scene.payload as { mode?: string }).mode === "lock"
                ? "overlay"
                : "dark"
              : "light"
          }
          clock={scene.app === "aurora" ? "21:14" : "9:41"}
        >
          {scene.app === "email" ? (
            <EmailScene
              payload={scene.payload as never}
              onOpen={scene.next ? advance : undefined}
              primaryLabel={primaryChoice?.label}
              onPrimary={primaryChoice ? () => onChoice(primaryChoice) : undefined}
            />
          ) : null}
          {scene.app === "slack" ? (
            <SlackScene
              key={scene.id}
              payload={scene.payload as never}
              choices={scene.choices}
              onChoice={onChoice}
              onAdvance={scene.next ? advance : undefined}
            />
          ) : null}
          {scene.app === "docs" ? (
            <DocsFlash payload={scene.payload as never} onAdvance={advance} />
          ) : null}
          {scene.app === "system" ? (
            <SystemBeat
              payload={scene.payload as never}
              primaryLabel={primaryChoice?.label}
              onPrimary={primaryChoice ? () => onChoice(primaryChoice) : undefined}
              onAdvance={scene.next ? advance : undefined}
            />
          ) : null}
          {scene.app === "aurora" ? (
            <AuroraScene
              key={scene.id}
              payload={scene.payload as never}
              choices={scene.choices}
              onChoice={onChoice}
              onAdvance={scene.next ? advance : undefined}
              onGo={go}
              onBack={canBack ? back : undefined}
            />
          ) : null}
        </PhoneFrame>
      )}

      <p className={["px-4 text-center text-sm text-[var(--stage-muted)]", room ? "max-w-xl" : "max-w-sm"].join(" ")}>
        {scene.hint}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={back}
          disabled={!canBack}
          className="rounded-full border border-[var(--stage-fg)]/15 bg-[var(--stage-fg)]/[0.04] px-3.5 py-1.5 text-[12px] text-[var(--stage-fg)] disabled:cursor-default disabled:opacity-30"
        >
          Back
        </button>
        {room ? (
          <button
            type="button"
            onClick={() => setPlaying((value) => (nextBeat ? !value : false))}
            disabled={!nextBeat}
            className="rounded-full border border-[var(--stage-accent)]/40 bg-[var(--stage-accent)]/15 px-3.5 py-1.5 text-[12px] text-[var(--stage-fg)] disabled:cursor-default disabled:opacity-30"
          >
            {playing && nextBeat ? "Pause" : "Play"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => go(firstSceneId)}
          className="rounded-full border border-[var(--stage-fg)]/15 bg-[var(--stage-fg)]/[0.04] px-3.5 py-1.5 text-[12px] text-[var(--stage-muted)] hover:text-[var(--stage-fg)]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
