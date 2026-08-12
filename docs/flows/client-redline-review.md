# Client redline review flow

Scope: **client-proposed edits only** — our draft → their redline → lawyer decision → internal Google Docs approval → reply artifact.

Client never gets a Google Docs link. Docs is the internal collaboration / supervisor-approval layer. Client channel = email / exported file.

## Sequence

```mermaid
sequenceDiagram
  participant Client
  participant Inbox as Intake (email/upload)
  participant App as Legal app
  participant Lawyer
  participant Docs as Google Docs (internal)
  participant Sup as Supervisor

  Note over Lawyer,Docs: v1 = our standard draft<br/>(Docs internal, not shared with client)

  Lawyer->>Client: Send v1 as PDF/DOCX export
  Client->>Inbox: Reply with redline (tracked changes / markup)
  Inbox->>App: Ingest + diff vs our v1
  App->>Lawyer: Notify: N proposed edits

  Lawyer->>App: Open analysis
  Note over App: Per edit:<br/>their change · risk if accept · AI alternative

  loop Each client proposal
    Lawyer->>App: Accept / Reject / Use AI alt
  end

  App->>Docs: Apply chosen edits as Suggestions<br/>+ comment @supervisor
  App->>Lawyer: Status: awaiting internal approval
  Sup->>Docs: Review suggestions · accept/reject
  Docs-->>App: Sync (suggestions resolved / revisionId)
  App->>Lawyer: Next actions ready

  alt All internal decisions done
    App->>Lawyer: Export clean v2
    Lawyer->>Client: Send v2 (file), not Docs link
  else Still open / need another round
    App->>Lawyer: Remaining rejects or new counter package
  end
```

## Layers

| Layer | Role |
|---|---|
| App | Diff client edits vs our draft, risk, AI alternative, lawyer decisions |
| Google Docs | Internal working copy + Suggest mode + supervisor approve |
| Client channel | File / email only — never share the Docs URL |

## Screen sketch (analysis)

```
Notify
  "Client returned N proposed edits · open →"

Analysis (vs OUR draft v1)
  ┌ # ┬ Their edit (quote) ┬ Risk if accept ┬ AI alt ┬ Action ─┐
  │ 1 │ …                  │ ! / ~ / ✓      │ …      │ Accept │
  │   │                    │                │        │ Reject │
  │   │                    │                │        │ Use AI │
  └─┴──────────────────────┴────────────────┴────────┴────────┘

Push to Docs (internal)
  chosen edits → Suggestions on working copy
  @supervisor · review before we reply to client

After Docs sync
  ✓ suggestions accepted by Sup
  ✗ rejected by Sup → back to app as "need new decision"
  → [Export v2] [Package rejects + counters for client email]
```

## States (for implementation)

`ingested → decided → pending_docs_approval → ready_to_send`

## Notes

- Docs API: write edits with `writeControl.writeMode: SUGGEST`; sync via `revisionId` / suggestion status. Some suggestion-thread APIs are Developer Preview — enough for a demo.
- Hard part: map client Word/PDF anchors onto spans in our Docs draft. Demo can use a small fixed set of edits.
