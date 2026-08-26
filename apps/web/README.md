# apps/web

Next.js shell: demo catalog + `/[case]` story player (`@demo/runtime` + `cases/*`).

```bash
# from repo root
pnpm install
pnpm --filter web dev
# or: just web
```

Register cases in `lib/cases.ts`. Deploy: Vercel, Root Directory `apps/web`, include files outside root.
