# TODO — clickable demo prototype (next chat)

Goal: shareable Vercel link that **presents** the preferred auto flow like a Figma prototype / demo video — not an admin dashboard.

Flows to implement against: [client-redline-auto-slack.md](./flows/client-redline-auto-slack.md).

## Format

- One Next app in `apps/web`, deploy to **Vercel** (easy share URL).
- Screen = **phone frame** (simulator). Scene-by-scene storyboard; tap bubble/button → next beat.
- Small step strip (e.g. 1/8) so the viewer does not get lost.
- Hardcoded script JSON (Helios-style MSA, 3–5 edits). No Python/API in this step.

## Storyboard scenes

1. **Client phone** — email: “your MSA v1” attached / link summary.
2. Client writes reply with a redline change → **Send**.
3. Switch device context → **Supervisor phone** — Slack notification.
4. Slack buttons: Accept / Reject / Ask AI.
5. **Branch:** supervisor asks to tweak in-thread → bot proposes new wording → supervisor chooses **Add suggestion**.
6. Short beat: agent applies **Docs suggestion** (mini Docs flash OK, not full editor) + link/summary.
7. **Client phone** — email with summary; client replies OK.
8. System: draft approved — **create final in DocuSign?** → Yes → finale “envelope sent”.

## Build steps

1. Pull `main` in workspace `legal-360-08-12` (or re-activate).
2. Scaffold Next (App Router) under `apps/web` with pnpm; wire `just web`.
3. Phone-frame shell + scene state machine driven by script JSON.
4. Implement scenes 1–8 (stylized Email + Slack UI, not real integrations).
5. Deploy Vercel preview/production; put URL in README Status.
6. Optional later: thin admin “Close thread” beat; real API behind the same scenes.

## Out of scope for this demo

- Real Gmail / Slack / Docs / DocuSign APIs.
- Full in-app review queue ([variant flow](./flows/client-redline-review.md)).
- Python `apps/api`.

## Done when

Anyone can open one URL, tap through the story in ~2 minutes, and understand intake → Slack decide → Docs suggestion → client email → DocuSign ask.
