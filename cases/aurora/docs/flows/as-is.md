# Aurora — as-is (KP apps)

How a watcher decides tonight with My Aurora Forecast / Glendale / NOAA.

## Sequence

```mermaid
sequenceDiagram
  participant W as Watcher
  participant App as KP app
  participant NOAA as OVATION / Kp
  participant Wx as Weather app

  W->>App: Open dashboard
  App->>NOAA: Kp, Bz, oval image
  App-->>W: Kp 5, oval PNG, buried %
  W->>Wx: Separate cloud check
  Note over W: Two apps, no combined P_see
  W->>W: Guess: go or stay
```

## Pain

- Product is **space weather** (Kp, Bz, substorm nT), not **will I see it from here**.
- Clouds and darkness are secondary or in another app.
- Map shows raw oval, not observed probability at a place.
- Nearby clearer town is a manual hunt.
