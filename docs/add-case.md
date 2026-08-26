# Add a demo case

1. Copy `cases/legal-360/` → `cases/<id>/`.
2. Set `package.json` name to `@cases/<id>`.
3. Edit `src/meta.ts` (`id`, `title`, `tagline`) and `src/demo-script.ts` (scenes).
4. Put product flows in `docs/flows/` (optional).
5. Register the case in `apps/web/lib/cases.ts`.
6. Add `@cases/<id>` to `apps/web/package.json` + `transpilePackages` in `next.config.ts`.
7. `pnpm install` from repo root, then `pnpm --filter web dev`.

Engine owns skins (`email` / `slack` / `docs` / `system`) and `DemoPlayer`. Case owns only script + copy. New UI skin → extend `apps/web/components/demo/`, not a new app.
