# Client redline — as-is (no system)

How the loop usually runs today after a lead closes, without Legal 360.

## Sequence

```mermaid
sequenceDiagram
  participant Sales
  participant Lawyer
  participant Client
  participant Mail as Email and Word
  participant Docs as Google Docs ad hoc
  participant Sup as Supervisor

  Sales->>Lawyer: Deal closed - need MSA or order form
  Lawyer->>Docs: Copy standard template or Word
  Lawyer->>Client: Email PDF or DOCX v1
  Client->>Mail: Reply with redline tracked changes
  Mail->>Lawyer: Inbox - manual triage
  Lawyer->>Lawyer: Read redline vs playbook by eye
  opt Unsure or outside authority
    Lawyer->>Sup: Slack or email or meeting
    Sup->>Lawyer: Verbal or thread approval
  end
  Lawyer->>Mail: Edit counter in Word or paste into Docs
  Lawyer->>Client: Email v2 plus short note
  Note over Lawyer,Client: Repeat N rounds until signed - no shared state or metrics
```

## Pain

- Each round is a stack of **manual** steps: pull the redline from email, eyeball it against the playbook, request approval when unsure, send the next file.
- No single source of truth - communication happens in email, slack, Google docs comments
- Requires a lawyer who preprocesses and provides context for Supervisor approval
