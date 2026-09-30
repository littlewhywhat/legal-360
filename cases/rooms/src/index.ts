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
  openingLine,
  reply,
  stepRunning,
  toggleTodo,
} from "./world";
export type {
  Artifact,
  ChatLine,
  FilterId,
  Mission,
  PersonId,
  RightTab,
  Room,
  Step,
  World,
} from "./world";
