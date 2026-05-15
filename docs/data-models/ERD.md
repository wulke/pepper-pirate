# Pepper Pirate — Data Model ERD

This diagram is the canonical single-view of all core entities and their relationships.
It is generated from the TypeScript interfaces in `src/types/` and must be kept in sync
with any field or relationship change made there.

The game's generational loop runs: **Seed → Plant → Node → Fruit → Seeds (next generation).**

---

```mermaid
erDiagram

    SEED {
        SeedId      id                  PK
        FruitId     sourceFruitId       FK  "null for wild/market seeds"
        SeedId      maternalSeedId      FK  "null if lineage unknown"
        SeedId      paternalSeedId      FK  "null if self-pollinated or unknown"
        string      sourceType              "wild | market | player_bred | quest | event"
        string      rootType                "unknown_stock | wild_stock | known_record"
        int         generation              "distance from lineage root"
        string      rarity                  "common → legendary"
        string      archetypeRarity         "immutable floor from Almanac"
        string      status                  "stored | planted | spent | sold | discarded"
        int         ageInSeasons            "increments each new season in storage"
        float       viability               "0–1; F-SEED-002: 0.92^(age^2)"
        float       overallStability        "0–1; summary of trait-level stability"
        float       overallVariance         "0–1; summary of expected trait deviation"
    }

    PLANT {
        PlantId     id                  PK
        SeedId      sourceSeedId        FK  "all genetic lookups trace here"
        PlotId      plotId              FK
        string      stage                   "germinating → seedling → … → spent"
        float       progress                "0–1 within current stage"
        float       totalGrowthProgress     "0–1 across full lifecycle"
        float       waterLevel              "0–1"
        float       soilQuality             "0–1"
        float       sunlightExposure        "0–1"
        float       overallHealth           "0–1; F-HEALTH-001"
        float       careScore               "0–1; F-TEND-001 primary input"
        bool        autoTendEnabled         "irrigation/automation unlocked"
        int         totalFruitsProduced
        int         ratoonsRemaining
        bool        canRatoon               "derived from seed ratoonAbility trait"
    }

    NODE {
        NodeId      id                  PK
        PlantId     plantId             FK
        FruitId     fruitId             FK  "null until fruiting; null if male donor"
        NodeId      maleNodeId          FK  "cross_female only: pollen donor node"
        NodeId      femaleNodeId        FK  "cross_male only: pollen recipient node"
        string      status                  "budding | flowering | pollination_window | pollinated | fruiting | harvested | spent"
        float       progress                "0–1 within current status"
        string      pollinationType         "pending | self | cross_female | cross_male"
        int         appearedAtTick
        int         pollinationWindowStart  "optional"
        int         pollinationWindowEnd    "optional; self-pollinates at close"
    }

    FRUIT {
        FruitId     id                  PK
        NodeId      nodeId              FK  "node where pollination occurred"
        PlantId     plantId             FK  "maternal plant"
        SeedId      maternalSeedId      FK  "seed that grew into maternal plant"
        SeedId      paternalSeedId      FK  "null if self-pollinated"
        string      pollinationType         "self | cross"
        float       stabilityScore          "0–1; tightens/widens sibling seed spread"
        float       varianceRange           "max trait deviation band for seeds; F-FRUIT-001"
        string      stage                   "developing | ripening | ripe | overripe"
        float       progress                "0–1 within current stage"
        int         grownAtSeason
        string      status                  "growing | ready | harvested | sold | processed | discarded"
        bool        seedsExtracted
        int         estimatedSeedCount
    }

    PLOT {
        PlotId      id                  PK
        SoilId      soilId              FK
        string      type                    "starter_tray | open_pot | nursery_pot | fabric_pot | raised_bed | greenhouse_bed"
        int         slotCount               "max concurrent plants"
        float       rootVolumePerSlot       "0–1; F-GROWTH-001 rootSpaceModifier"
        float       moistureRetentionRate   "multiplier on moisture depletion"
        float       humidityLevel           "0–1"
        float       airflow                 "0–1"
        float       weatherExposure         "0–1; active in V2 per-plot differentiation"
        float       wateringFrequency       "relative maintenance demand"
        float       forgiveness             "0–1; neglect tolerance"
        float       moldRisk                "0–1 probability modifier"
        float       rootBoundRate           "per-tick health penalty when past optimal stage"
        float       transplantShockMultiplier "scales shock on move-out; F-PLOT-002"
    }

    SOIL {
        PlotId      id                  PK  "1-to-1 with Plot"
        string      texture                 "sand | sandy_loam | loam | clay_loam | clay"
        float       naturalDrainage         "0–1; base before amendments"
        float       basePhLevel             "natural resting pH"
        float       nitrogen                "0–1; F-SOIL-001"
        float       phosphorus              "0–1; F-SOIL-001"
        float       potassium               "0–1; F-SOIL-001"
        float       currentPh               "effective pH; F-SOIL-001 gatekeeper"
        float       currentDrainage         "effective drainage after amendments"
        float       waterRetention          "0–1"
        float       moistureLevel           "0–1; F-SOIL-001 input"
        int         consecutiveSeasonsUsed  "V2 compaction input"
    }

    %% ─── Relationships ───────────────────────────────────────────────────────

    %% Generational loop: Seed → Plant → Node → Fruit → Seed (next gen)
    SEED        o|--o|  PLANT   : "grows into"
    PLANT       ||--o{  NODE    : "owns"
    NODE        ||--o|  FRUIT   : "produces"
    FRUIT       o|--o{  SEED    : "source of"

    %% Plot and Soil
    PLOT        ||--||  SOIL    : "contains"
    PLOT        ||--o{  PLANT   : "hosts"

    %% Cross-pollination linkage (Node to Node)
    NODE        o|--o|  NODE    : "pollen donor ↔ recipient"

    %% Lineage (self-referential on Seed)
    SEED        o|--o|  SEED    : "maternal parent"
    SEED        o|--o|  SEED    : "paternal parent"
```

---

## Relationship Key

| Relationship | Cardinality | Notes |
|---|---|---|
| SEED → PLANT | 0..1 : 0..1 | One seed grows into at most one active plant; one plant grew from exactly one seed |
| PLANT → NODE | 1 : 0..n | A plant owns zero or more nodes; each node belongs to exactly one plant |
| NODE → FRUIT | 1 : 0..1 | A node produces at most one fruit; male donors produce none |
| FRUIT → SEED | 0..1 : 0..n | A fruit is the source of zero or more seeds; a seed has zero or one source fruit (null for wild/market) |
| PLOT → SOIL | 1 : 1 | Exactly one soil record per plot (1:1 in V1) |
| PLOT → PLANT | 1 : 0..n | A plot hosts zero or more plants (up to `slotCount`) |
| NODE → NODE | 0..1 : 0..1 | Cross-pollination pairs a male donor node with a female recipient node |
| SEED → SEED | 0..1 : 0..n | Self-referential lineage; a seed has at most two parent seeds (maternal, paternal) |

---

## Formula Touchpoints

| Formula | Reads From | Writes / Produces |
|---|---|---|
| F-SOIL-001 | `Soil.nutrients.*`, `Soil.conditions.currentPh`, `Soil.conditions.moistureLevel`, `Seed.genetics.traitGenome.hardiness`, `Seed.genetics.traitGenome.droughtResistance` | `soilModifier` → F-GROWTH-001 |
| F-TEND-001 | `Plant.tending.careScore`, `Plant.tending.lastTendedAtTick`, `Plant.health.activeEffects` | `tendingModifier` → F-GROWTH-001 |
| F-GROWTH-001 | `soilModifier`, `tendingModifier`, `healthModifier`, `plotModifier` | `finalGrowthModifier` → `Plant.growth.progress` |
| F-FRUIT-001 | Parent `Seed.genetics.traitGenome` (both parents) | `Fruit.genetics.traitBaseline`, `stabilityScore`, `varianceRange` |
| F-SEED-001 | `Fruit.genetics.traitBaseline`, `Fruit.genetics.varianceRange`, `Fruit.genetics.stabilityScore` | `Seed.genetics.traitGenome` (per-seed variance) |
| F-SEED-002 | `Seed.state.ageInSeasons` | `Seed.state.viability` |
| F-PLOT-002 | `Plot.risks.transplantShockMultiplier`, `Seed.genetics.traitGenome.hardiness`, `Seed.genetics.traitGenome.droughtResistance` | `transplant_shock` StatusEffect |
| F-SEASON-001 | `Season.selectedLength`, `Season.totalDays`, `Season.daysUsed` | `efficiencyScore` → F-PRESTIGE-001 |

> **Note:** `Season` is not yet typed (`season.ts` pending SEASON data model doc). F-SEASON-001 fields are listed here for completeness.

---

## V1 / V2 Scope Markers

Fields and behaviors deferred to V2 are included in the type interfaces for forward compatibility but are not read by any V1 formula:

- `Soil.health.*` — organic matter, compaction, microbial health, salinity
- `Plot.environment.weatherExposure` — per-plot weather differentiation (Zone weather events fire in V1 but affect all plots equally)
- `TraitKey` V2 entries — `plantSize`, `wallThickness`, `pepperSize`, `color`, `shape`, `diseaseResistance`, `soilAdaptability`, `capsaicinDistribution`, `germinationTime`
