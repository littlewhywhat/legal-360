import type { DemoCase } from "@demo/runtime";
import { demoCase as legal360 } from "@cases/legal-360";
import { demoCase as deviceMonitor } from "@cases/device-monitor";
import { demoCase as deviceMonitorPlay } from "@cases/device-monitor-play";

export const cases: DemoCase[] = [legal360, deviceMonitor, deviceMonitorPlay];

export const caseById = Object.fromEntries(
  cases.map((c) => [c.meta.id, c]),
) as Record<string, DemoCase>;

export function getCase(id: string): DemoCase | undefined {
  return caseById[id];
}
