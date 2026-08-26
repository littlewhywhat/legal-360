# Monorepo layout

Polyglot setup: JS and Python side by side. Demo cases share one Next shell + `@demo/runtime`.

## Tree

```
apps/web/              Next.js shell — catalog + /[case] player (pnpm)
apps/api/              Python API — FastAPI + uv (later)
packages/demo-runtime/ Scene / Choice / buildCase types
cases/<id>/            Case meta + demo-script + docs/flows
docs/                  How to add a case; monorepo notes
```

## Ownership

| Path | Tooling |
|---|---|
| `apps/web`, `packages/*`, `cases/*` | pnpm (`pnpm-workspace.yaml`) |
| `apps/api` | uv + `pyproject.toml` (sibling, not installed by pnpm) |

## Script orchestrator: `just`

Root [`justfile`](../justfile):

```bash
just dev      # web
just web      # Next only
just api      # FastAPI only
just test
```
