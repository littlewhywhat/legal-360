"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Choice, DemoCase, Scene } from "@demo/runtime";
import { PhoneFrame } from "./PhoneFrame";
import { StepStrip } from "./StepStrip";
import { EmailScene } from "./EmailScene";
import { SlackScene } from "./SlackScene";
import { DocsFlash } from "./DocsFlash";
import { SystemBeat } from "./SystemBeat";
import { TelegramScene } from "./TelegramScene";
import { AppScene } from "./AppScene";

function deviceLabel(scene: Scene): string {
  switch (scene.device) {
    case "client":
      return "Client phone";
    case "supervisor":
      return "Supervisor phone";
    default:
      return "System";
  }
}

export function DemoPlayer({ demoCase }: { demoCase: DemoCase }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramScene = searchParams.get("s");
  const { sceneById, firstSceneId } = demoCase;

  const sceneId =
    paramScene && sceneById[paramScene] ? paramScene : firstSceneId;
  const scene = sceneById[sceneId];

  const go = useCallback(
    (nextId: string) => {
      if (!sceneById[nextId]) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("s", nextId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, sceneById, searchParams],
  );

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
      if (e.key === "ArrowRight" || e.key === " ") {
        const hasBlockingChoices =
          !!scene.choices &&
          scene.choices.length > 0 &&
          scene.app !== "email";
        if (scene.next && !hasBlockingChoices) {
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
  }, [advance, firstSceneId, go, scene]);

  const primaryChoice = useMemo(
    () => scene.choices?.find((c) => c.variant === "primary"),
    [scene.choices],
  );

  return (
    <div className="flex flex-1 flex-col items-center gap-6 py-6">
      <StepStrip step={scene.step} total={scene.totalSteps} title={scene.title} />

      <PhoneFrame deviceLabel={deviceLabel(scene)}>
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
        {scene.app === "telegram" ? (
          <TelegramScene
            payload={scene.payload as never}
            onAdvance={scene.next ? advance : undefined}
          />
        ) : null}
        {scene.app === "app" ? (
          <AppScene
            key={scene.id}
            payload={scene.payload as never}
            choices={scene.choices}
            onChoice={onChoice}
            onAdvance={scene.next ? advance : undefined}
          />
        ) : null}
      </PhoneFrame>

      <p className="max-w-sm px-4 text-center text-sm text-[var(--stage-muted)]">
        {scene.hint}
      </p>

      <div className="flex items-center gap-3 text-xs text-[var(--stage-muted)]">
        <button
          type="button"
          onClick={() => go(firstSceneId)}
          className="rounded-md px-2 py-1 underline-offset-2 hover:text-[var(--stage-fg)] hover:underline"
        >
          Reset
        </button>
        <span aria-hidden>·</span>
        <span>Tap through · Home resets</span>
      </div>
    </div>
  );
}
