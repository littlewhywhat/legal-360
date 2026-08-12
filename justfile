# Legal 360 — root command runner (install: https://github.com/casey/just)

dev:
    pnpm --filter web dev

web:
    pnpm --filter web dev

api:
    @echo "TODO: cd apps/api && uv run …"

test:
    pnpm --filter web lint
