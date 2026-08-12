# Client redline — auto (Docs + Slack)

Preferred product shape: **minimal custom review UI**. App ingests the client redline, annotates the internal Google Doc, notifies the supervisor in Slack; after decisions resolve, app exports and emails the client with a short summary.

In-app screens stay for **admin / exceptions** (phone call from client, stuck thread, force-close), not the happy path.

Related: [as-is today](./client-redline-as-is.md) · [in-app review UI variant](./client-redline-review.md)

## Sequence

```mermaid
sequenceDiagram
  participant Client
  participant Inbox as Intake (email)
  participant App as Legal app
  participant Docs as Google Docs (SoT)
  participant Slack
  participant Sup as Supervisor

  Note over Docs: v1 already sent as file export<br/>Docs stays internal

  Client->>Inbox: Redline reply (attachment)
  Inbox->>App: Ingest · diff vs our v1 · playbook judge
  App->>Docs: Comments / suggestions on matching spans<br/>@supervisor per open item
  App->>Slack: Notify + deep link to Docs<br/>buttons: Accept / Reject / AI alt (optional prompt)
  Sup->>Slack: Choose action (or edit in Docs)
  Slack->>App: Decision webhook
  App->>Docs: Apply / reject suggestion · resolve comment
  Note over App,Docs: Loop until no open suggestions<br/>(or Sup finishes in Docs; App syncs)

  App->>App: Build reply package + summary<br/>(accepted as-is / with our counters)
  App->>Client: Email v2 file — never Docs link
  App->>Slack: Thread update — sent · waiting for next round

  opt Exception / phone call / stop
    Note over App: Admin: adjust Docs (SoT) · sync<br/>or [Close thread — stop auto-reply]
  end
```

## Happy path (numbered)

1. Lead closed → we already sent our standard draft (file). Internal Docs copy is the working source of truth.
2. Client returns a **redline** → intake picks it up (no lawyer inbox step required).
3. App diffs against our draft, posts **comments / suggestions** on the Docs spans, @mentions the approver; Slack message with link + action buttons (and optional “prompt alternative here”).
4. Supervisor decides in Slack and/or Docs. App keeps Docs and its decision log in sync.
5. When the round is resolved, app **emails the client** the updated file + short summary (fully accepted vs accepted with our counters) and waits for the next reply.
6. Admin panel only for exceptions: manual tweak, re-sync from Docs, **close / stop email thread**.

## Roles of each system

| System | Role |
|---|---|
| Google Docs | Source of truth for internal draft + suggestion/comment state |
| Slack | Notification + primary decision UX for supervisor |
| Email | Only client-facing channel (send / receive files) |
| App | Ingest, judge vs playbook, Docs+Slack adapters, audit, auto-reply, admin kill-switch |
| Admin UI | Exceptions, force-close thread, inspect audit — not day-to-day review |

## Why this over a big in-app editor

- Matches how legal already collaborates (Docs + Slack).
- FDE story: orchestrate existing tools; custom UI only where gaps are.
- Audit trail = Docs history + app decision log + Slack actions.
- Still need a thin admin surface: phone-driven edits, stuck rounds, stop auto-email.

## Open product choices

- Slack buttons for legal accept/reject: who is authorized, idempotency, full audit text in-app even if clicked in Slack.
- Auto-send to client: only after **all** open items resolved, or after explicit “Send round” in Slack/admin.
- AI alt from Slack: ephemeral modal / prompt → new suggestion on same span, still needs supervisor confirm before send.
