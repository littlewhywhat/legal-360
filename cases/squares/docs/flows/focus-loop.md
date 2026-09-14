# Squares — focus loop

Anti-procrastination execution layer. Atomic unit is a **square** (one small action). Timer ≠ square.

Notion is import-only (out of this prototype). No guilt streaks. Copy: “You moved forward.”

## Happy path

1. Home — goals as square grids, Start Focus.
2. Quiz — Goal → Task → session squares (mark too-big ones).
3. Focus Mode — list of chosen squares, any order; Split if a step is too big.
4. Summary — +squares, progress before → after.
5. Home — same goal, more squares filled.
6. History — week heatmap (many squares per day) → tap a day for counts → Insights.

```mermaid
sequenceDiagram
  actor You
  participant Home
  participant Quiz
  participant Focus
  participant Summary
  participant History

  You->>Home: Start Focus
  Home->>Quiz: Goal / task / steps
  Quiz->>Focus: 20 min
  You->>Focus: Split oversized step
  You->>Focus: Fill squares in any order
  Focus->>Summary: You moved forward
  Summary->>Home: Goal grid updated
  Home->>History: Day heatmap
  You->>History: Open a day
```
