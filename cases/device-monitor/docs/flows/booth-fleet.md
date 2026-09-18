# Device monitor — booth fleet

Ops phone watches in-process emulators. Simulator owns fault injection. Monitor only paints status.

## Sequence

```mermaid
sequenceDiagram
  participant Ops as Ops phone
  participant Mon as Monitor
  participant Sim as Emulator fleet

  Ops->>Mon: Open fleet
  Mon->>Sim: Poll /health (REST or gRPC)
  Sim-->>Mon: capabilities + diagnostics
  Ops->>Sim: Inject 40% loss on Lobby Cam
  Sim-->>Mon: intermittent misses
  Note over Mon: retries + backoff, still UP
  Ops->>Sim: Hard kill
  Note over Mon: 4 consecutive misses → DOWN
  Ops->>Sim: Spawn Patio Cam emulator
  Sim-->>Mon: first probe, no restart
  Ops->>Sim: Recover Lobby Cam
  Note over Mon: DEGRADED then UP
```

## Happy path

1. Fleet shows six emulators, all UP.
2. 40% loss on Lobby Cam — retries visible, status stays UP.
3. Hard kill — DOWN after four consecutive misses.
4. Add emulator (in-process, not a container).
5. Recover — DEGRADED, then UP.
