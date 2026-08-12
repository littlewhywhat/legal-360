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
- Framework Preset: **Next.js** (not Other / static)
- Root Directory: `apps/web`
- Include files outside root directory: on (pnpm workspace)
- **Output Directory: leave empty** — do not set `public` (that folder is static assets, not the Next build output)
- `apps/web/vercel.json` sets install/build via pnpm from the monorepo root
