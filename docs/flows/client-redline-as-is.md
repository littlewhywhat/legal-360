# Client redline — as-is (no system)

How the loop usually runs today after a lead closes, without Legal 360.

## Sequence

```mermaid
sequenceDiagram
  participant Sales
  participant Lawyer
  participant Client
  participant Mail as Email / Word
  participant Docs as Google Docs (ad hoc)
  participant Sup as Supervisor

  Sales->>Lawyer: Deal closed — need MSA / order form
  Lawyer->>Docs: Copy standard template (or Word)
  Lawyer->>Client: Email PDF/DOCX v1
  Client->>Mail: Reply with redline (tracked changes)
  Mail->>Lawyer: Inbox — manual triage
  Lawyer->>Lawyer: Read redline vs playbook (eyes)
  opt Unsure / outside authority
    Lawyer->>Sup: Slack / email / meeting
    Sup->>Lawyer: Verbal / thread approval
  end
  Lawyer->>Mail: Edit counter in Word (or paste into Docs)
  Lawyer->>Client: Email v2 + short note
  Note over Lawyer,Client: Repeat N rounds until signed<br/>No shared state, no metrics, no audit of why
```

## Pain

- Redline vs playbook is manual; decisions inconsistent across lawyers.
- Supervisor approval lives in Slack threads — hard to reconstruct later.
- Client never sees Docs; internal copy often drifts from what was emailed.
- No calendar of open rounds; Sales asks “where is the MSA?” into the void.
- No measure of which positions we concede most.

## What exists

CLM / DocuSign for signature storage after the fact. The **negotiation rounds** are mostly email + Word + human memory.
