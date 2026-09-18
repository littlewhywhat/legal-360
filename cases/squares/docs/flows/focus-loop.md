# Squares — focus loop

Anti-procrastination execution layer. Atomic unit is a **square** (one small action). Timer ≠ square.

Notion is import-only (out of this prototype). No guilt streaks. Copy: “You moved forward.”

## Happy path

1. Home — last-7-days GitHub strip; tasks as square grids. Tap a task (no Start Focus).
2. Choose squares — checkboxes / multiselect for this session.
3. Ready — pomodoro timer set, not running. Start.
4. Focus Mode — chosen squares, any order; Split if a step is too big.
5. Summary — +squares, progress before → after.
6. Home — same task, more squares filled. Tap the week strip → History.
7. History — GitHub calendar (one square per day). Tap a day → that day's stats.

```mermaid
sequenceDiagram
  actor You
  participant Home
  participant Pick
  participant Ready
  participant Focus
  participant Summary
  participant History
  participant Day

  You->>Home: Tap a task
  Home->>Pick: Session squares
  You->>Pick: Check squares
  Pick->>Ready: 20 min set
  You->>Ready: Start
  Ready->>Focus: Timer running
  You->>Focus: Split oversized step
  You->>Focus: Fill squares in any order
  Focus->>Summary: You moved forward
  Summary->>Home: Task grid updated
  You->>Home: Tap last 7 days
  Home->>History: GitHub calendar
  You->>History: Tap a day square
  History->>Day: Stats for that day
```
