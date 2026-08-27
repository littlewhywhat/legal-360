# Investing OS — mobile research loop

Telegram is the interrupt. Everything after is one app.

Related: `littlewhywhat/investing` `spec/concept.md` (Status, Goal, Opportunities, Defense, Hypothesis).

## Sequence

```mermaid
sequenceDiagram
  participant TG as Telegram DM
  participant App as Investing app
  participant R as Roman

  TG->>R: Insider P on cheap name (sleeve)
  R->>App: Open home — economic P and L + expense coverage
  App->>R: Opportunity card + quiet defense on holdings
  R->>App: Dossier — Form 4, memo, other buyers
  R->>App: Like or Skip CEO / mission
  opt Like
    App->>R: Hypothesis card g vs r — confirm or dismiss, not an order
  end
```

## Happy path

1. Daily DM: Form 4 **P** on a name that screens cheap vs own history.
2. Home answers Status (`equity + cashouts − deposits`) and Goal (coverage ratio), then the name.
3. One dossier scroll replaces OpenInsider → Fiscal → paste AI → eToro → 13F.
4. Human verdict. Hypothesis only after Like, on that name.

Defense is a badge on home, not a second story.
