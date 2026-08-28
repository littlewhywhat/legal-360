import type { DemoCase } from "@demo/runtime";
import { demoCase as legal360 } from "@cases/legal-360";
import { demoCase as investing } from "@cases/investing";

export const cases: DemoCase[] = [legal360, investing];

export const caseById = Object.fromEntries(
  cases.map((c) => [c.meta.id, c]),
) as Record<string, DemoCase>;

export function getCase(id: string): DemoCase | undefined {
  return caseById[id];
}
