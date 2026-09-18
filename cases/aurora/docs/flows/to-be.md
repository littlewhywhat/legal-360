# Aurora — to-be (brief)

Now-brief: headline, **map with you on it**, hourly sky, one recommended spot.

Prototype only — scripted places, no live NOAA.

Related: [as-is today](./as-is.md)

## Sequence

```mermaid
sequenceDiagram
  participant App as Aurora
  participant W as Watcher

  App->>W: Push — best spot
  W->>App: Evening brief (map + you, hourly, route card)
  W->>App: Full map, still you + nearby spots
  W->>W: Go
```

## Happy path

1. Lock banner: spot + number.
2. Brief: map with current position, hourly clouds, «Ехать / Остаться».
3. Map: you (pulse) + spots as dots.
4. Go / replay.
