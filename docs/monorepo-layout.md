# Monorepo layout

Polyglot setup: JS and Python side by side, not one package manager for both.

## Tree

```
apps/web/     Next.js UI (pnpm)
apps/api/     Python API — FastAPI + uv (LLM judge, ingest, Docs adapter)
packages/     shared TS types / OpenAPI-generated clients (later)
docs/flows/   product flows
```

## Ownership

| Path | Tooling |
|---|---|
| `apps/web`, `packages/*` | pnpm (`pnpm-workspace.yaml`) |
| `apps/api` | uv + `pyproject.toml` (sibling, not installed by pnpm) |

## Script orchestrator: `just`

Not Turborepo (JS-centric) and not Makefile. Root [`justfile`](../justfile) is the thin entrypoint:

```bash
just dev      # web + api
just web      # Next only
just api      # FastAPI only
just test
```

[`just`](https://github.com/casey/just) = command runner. Each recipe shells into `pnpm` or `uv`.
