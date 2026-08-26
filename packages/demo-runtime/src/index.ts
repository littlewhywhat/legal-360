import type { DemoCase, Scene } from "./types";

export type {
  AppSkin,
  CaseMeta,
  Choice,
  DemoCase,
  Device,
  Scene,
} from "./types";

export function buildCase(
  meta: DemoCase["meta"],
  scenes: Scene[],
): DemoCase {
  if (scenes.length === 0) {
    throw new Error(`Case "${meta.id}" has no scenes`);
  }
  return {
    meta,
    scenes,
    sceneById: Object.fromEntries(scenes.map((s) => [s.id, s])) as Record<
      string,
      Scene
    >,
    firstSceneId: scenes[0].id,
  };
}
