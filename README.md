# legal-360

Playbook-aware client redline triage.

Monorepo layout and tooling: [docs/monorepo-layout.md](./docs/monorepo-layout.md).

## Flows

Client redline (pick one product shape; as-is is the baseline):

1. [As-is (no system)](./docs/flows/client-redline-as-is.md)
2. [Auto — Docs + Slack](./docs/flows/client-redline-auto-slack.md) ← preferred
3. [In-app review UI](./docs/flows/client-redline-review.md) (variant)

## Status

Clickable phone storyboard demo in `apps/web` (tap-through; no real integrations).

```bash
pnpm install
pnpm --filter web dev   # or: just web
```

**TODO / scope:** [docs/TODO-demo-prototype.md](./docs/TODO-demo-prototype.md)

Vercel (preview/prod):
- Demo is a **static export** (`apps/web/out`) — works with Root Directory = repo root
- Root `vercel.json`: `pnpm --filter web build` → `outputDirectory: apps/web/out`
- Prefer: Framework Other/static is fine; do **not** set Output Directory to `public` (override via vercel.json)
- Alt: Root Directory `apps/web` + include files outside root → uses `apps/web/vercel.json` (`out`)
