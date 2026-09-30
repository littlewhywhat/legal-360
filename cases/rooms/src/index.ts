import { buildCase } from "@demo/runtime";
import { scenes } from "./demo-script";
import { meta } from "./meta";

export { meta, scenes };
export const demoCase = buildCase(meta, scenes);

export {
  BOOKS,
  PEOPLE,
  RIGHT_TABS,
  addCheckpoint,
  addTodo,
  bucket,
  closeMission,
  createMission,
  createWorld,
  focusAt,
  openingLine,
  reply,
  stepRunning,
  toggleTodo,
  worldAt,
  LAST_BEAT,
} from "./world";
export type {
  Artifact,
  Board,
  ChatLine,
  DeskFocus,
  FilterId,
  Mission,
  PersonId,
  RightTab,
  Room,
  Step,
  World,
} from "./world";
