# Plant Data Model

The **Plant** is the runtime growth instance. A plant grows from a single planted seed, occupies a plot, progresses through growth stages, and produces nodes that become fruits. The plant does not own genetics — it references the seed it grew from.

> Related models: [Seed](./SEED.md) | [Node](./NODE.md) | [Fruit](./FRUIT.md) | [Overview](./PEPPER.md)

## Design Goals

- Purely runtime state — growth progress, health, environmental conditions.
- References its source seed for genetic identity.
- Owns its nodes, which are the sites where pollination and fruiting occur.
- Supports both active tending (mini-games, manual care) and idle growth.

## Proposed Object Shape

```ts
type PlantId = string;
type SeedId = string;
type NodeId = string;
type PlotId = string;

type Plant = {
  id: PlantId;

  // Genetic identity — lives on the seed, not the plant
  sourceSeedId: SeedId;

  // Where this plant lives
  placement: {
    plotId: PlotId;
    plantedAtSeason: number;
    plantedAtTick?: number;
  };

  // Current growth state
  growth: {
    stage: "germinating" | "seedling" | "vegetative" | "flowering" | "fruiting" | "mature" | "spent";
    progress: number;                    // 0-1 within current stage
    totalGrowthProgress: number;         // 0-1 across entire lifecycle
    estimatedTicksRemaining?: number;
  };

  // Health and environmental factors
  health: {
    waterLevel: number;                  // 0-1
    soilQuality: number;                 // 0-1
    sunlightExposure: number;            // 0-1
    overallHealth: number;               // 0-1, derived from above + genetics
    activeEffects: StatusEffect[];       // pests, disease, weather damage, tending bonuses
  };

  // Nodes (flower/bud sites) owned by this plant
  nodeIds: NodeId[];

  // Tending history
  tending: {
    lastTendedAtTick?: number;
    autoTendEnabled: boolean;            // player has irrigation/automation upgrades
    careScore: number;                   // 0-1 recent care quality used by F-TEND-001
  };

  // Harvest tracking
  harvest: {
    totalFruitsProduced: number;
    ratoonsRemaining: number;            // how many more fruiting cycles this plant can do
    canRatoon: boolean;                  // derived from seed genetics (ratoon ability trait)
  };
};

type StatusEffect = {
  type: "pest" | "disease" | "drought_stress" | "cold_damage" | "heat_damage" | "tending_bonus" | "mini_game_bonus";
  severity: number;                      // 0-1
  appliedAtTick: number;
  duration?: number;                     // ticks until expiry, undefined = permanent until treated
};
```

## Field Rationale

### `sourceSeedId`

The plant's genetic identity is fully determined by its source seed. All trait lookups, lineage queries, and breeding decisions trace back through this reference. The plant itself stores no genetic data.

### `growth`

Stage-based progression with a continuous progress value within each stage. This supports both time-based idle growth and active tending that can accelerate progress.

The stages map to the real pepper lifecycle:
1. **Germinating** — seed is in soil, not yet sprouted
2. **Seedling** — sprouted, early growth
3. **Vegetative** — growing stems/leaves, no flowers yet
4. **Flowering** — nodes appear, pollination window opens
5. **Fruiting** — pollinated nodes are growing fruits
6. **Mature** — fruits ready for harvest
7. **Spent** — plant has exhausted its fruiting cycles (or is one-and-done with no ratoon ability)

### `health`

Environmental factors that affect growth rate and fruit quality. These are what the tending mini-games and active care interact with. Idle/auto-tend maintains base levels; active play optimizes them.

### `nodeIds`

References to Node objects owned by this plant. Nodes appear during the flowering stage. The number of nodes a plant produces is influenced by the source seed's genetics (yield-related traits, node count, etc.).

### `harvest.ratoonsRemaining`

Tracks how many more fruiting cycles this plant can produce. Derived from the seed's ratoon ability trait. A plant with no ratoon ability goes to `spent` after one fruiting cycle. A plant with high ratoon ability can produce multiple rounds of fruits across a season.

### `tending`

Tending stores the plant-side state used by `F-TEND-001`.

- `careScore` is the plant's short-horizon care memory, decaying over time toward an idle floor
- qualified actions should raise `careScore` only when they address a real current need
- mini-game success should resolve into the same care state rather than creating a second independent growth multiplier

## Open Questions

- How does plot placement interact with plant size (V2 trait)? Does a large plant take multiple plot slots?
- Should plants have a visual appearance derived from seed genetics, or is that purely UI?
- What determines node count per plant? Is it a direct genetic trait, or derived from yield + other factors?
- Can a spent plant be composted or otherwise recycled for value?
