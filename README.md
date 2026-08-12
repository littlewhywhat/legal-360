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

Vercel: set Root Directory to `apps/web`, include files outside root (pnpm workspace). Prod URL TBD after first deploy.
