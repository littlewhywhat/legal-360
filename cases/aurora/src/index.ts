import { buildCase } from "@demo/runtime";
import { scenes } from "./demo-script";
import { meta } from "./meta";

export { meta, scenes };
export { TOTAL_STEPS } from "./demo-script";
export type { Kind, Night, Origin, Place, Review, Stay, Way } from "./demo-script";
export { here, hill, lake, places, plateau, shore, spb } from "./demo-script";

export const demoCase = buildCase(meta, scenes);
