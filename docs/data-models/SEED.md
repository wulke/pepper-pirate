# Seed Data Model

The **Seed** is the core genetic individual in the system. Every seed has its own unique genetics, derived from its parent fruit's genetics with per-seed variance applied. Seeds are what players evaluate, store, trade, plant, and select for breeding.

> Related models: [Plant](./PLANT.md) | [Node](./NODE.md) | [Fruit](./FRUIT.md) | [Overview](./PEPPER.md) | [Formula Registry](../FORMULA-REGISTRY.md)

## Design Goals

- Every seed is a unique genetic individual, even siblings from the same fruit.
- Lineage and ancestry are first-class — a seed knows where it came from.
- Genetic trait ranges are informed by the parent fruit, but actual values are per-seed.
- Stability of the parent line directly influences how much variance exists between sibling seeds.

## Proposed Object Shape

```ts
type SeedId = string;
type FruitId = string;
type TraitKey =
  | "scoville"
  | "yield"
  | "growingTime"
  | "hardiness"
  | "droughtResistance"
  | "flavorProfile"
  | "ratoonAbility"
  // V2 traits
  | "plantSize"
  | "wallThickness"
  | "pepperSize"
  | "color"
  | "shape"
  | "diseaseResistance"
  | "soilAdaptability"
  | "capsaicinDistribution"
  | "germinationTime";

type Seed = {
  id: SeedId;

  // Where this seed came from
  origin: {
    sourceFruitId: FruitId | null;       // null for wild/market seeds with no known parent fruit
    sourceType: "wild" | "market" | "player_bred" | "quest" | "event";
    sourceLabel?: string;                 // e.g. "Bought from Trader Rosa, Season 3"
  };

  // Lineage tracking
  lineage: {
    knownLineage: boolean;               // false for wild/market seeds with no ancestry data
    rootType: "unknown_stock" | "wild_stock" | "known_record";
    generation: number;                   // distance from root of known lineage record
    maternalSeedId: SeedId | null;       // the seed that grew into the maternal plant
    paternalSeedId: SeedId | null;       // the seed that grew into the paternal plant (null if self-pollinated)
  };

  // The seed's own genetic identity
  genetics: {
    soilAffinity: {
      preferredPh: number;
      preferredNitrogen: number;
      preferredPhosphorus: number;
      preferredPotassium: number;
      preferredMoisture: number;
    };
    traitGenome: Partial<Record<TraitKey, TraitGenome>>;
    overallStability: number;            // summary of trait-level stability
    overallVariance: number;             // summary of trait-level variance
  };

  // What the player can currently see about this seed
  expression: {
    visibleTraits: Partial<Record<TraitKey, TraitExpression>>;
    hiddenTraitKeys: TraitKey[];         // traits that exist but aren't yet revealed
    expectedRanges: Partial<Record<TraitKey, TraitRange>>;  // informed by parent fruit
  };

  // Player-facing identity and state
  identity: {
    displayName: string;                 // e.g. "Jalapeno Seed", "Hybrid #47 Seed"
    family?: string;                     // e.g. "Capsicum annuum"
    cultivarName?: string;               // only if part of a stabilized named line
    rarity: "common" | "uncommon" | "rare" | "exotic" | "legendary";
    archetypeRarity: "common" | "uncommon" | "rare" | "exotic" | "legendary";  // baseline from Almanac, floor for instance rarity
  };

  // Inventory and lifecycle state
  state: {
    status: "stored" | "planted" | "spent" | "sold" | "discarded";
    storedAtSeason?: number;
    plantedAtSeason?: number;
    ageInSeasons: number;               // increments when carried into a new season
    viability: number;                  // 0-1, degrades exponentially with age
  };

  // Player annotations
  metadata: {
    tags: string[];
    notes?: string;
    playerFavorite?: boolean;
  };
};
```

## Supporting Types

```ts
type TraitGenome = {
  inheritedValue: number | string | string[];
  stability: number;                     // how consistently this trait expresses in this line
  variance: number;                      // expected deviation from inherited value
  lockState: "unstable" | "drifting" | "mostly_stable" | "locked";
  visibleToPlayer: boolean;              // whether the player can see this trait's genome data
  inheritanceSource: {
    maternalWeight?: number;             // contribution from maternal parent
    paternalWeight?: number;             // contribution from paternal parent
    mutationWeight?: number;             // contribution from random mutation
  };
};

type TraitExpression = {
  currentValue: number | string | string[];
  confidence: number;                    // how certain the player should be about this value
  derivedFrom: "seed_preview" | "grown_observation" | "lineage_projection";
};

type TraitRange = {
  min: number;
  max: number;
  expected?: number;
};
```

## Field Rationale

### `origin`

Links the seed back to the fruit it came from. `sourceFruitId` is null for seeds that entered the game without a known parent (wild, market, quest). This is distinct from lineage — origin is "where did this specific seed come from," lineage is "what is the full ancestry."

### `lineage`

Tracks ancestry through seeds, not fruits or plants. `maternalSeedId` and `paternalSeedId` point to the seeds that grew into the parent plants. This allows full lineage traversal: from any seed, walk up through parent seeds to reconstruct the family tree.

For self-pollinated fruits, `paternalSeedId` is null — both genetic contributions came from the same plant/seed.

### `genetics`

The seed's own genetic identity, determined at fruit-grow time with per-seed variance applied. Sibling seeds from the same fruit share a genetic baseline but diverge based on the parent line's stability:
- **Stable parent** → tight variance, siblings are similar
- **Unstable parent** → wide variance, siblings can differ significantly

This block also stores `soilAffinity` as an explicit runtime preference profile used by `F-SOIL-001`. Other traits may bias how those values are generated during inheritance, but the stored affinity values are the runtime source of truth when the game evaluates soil fit.

**Formula IDs:** `F-SEED-001`, `F-SOIL-001`

V1 detail:

- `F-FRUIT-001` provides the fruit-level `traitBaseline`, `stabilityScore`, and `varianceRange`
- `F-SEED-001` starts from that baseline and applies bounded per-seed variance
- per-trait baseline stability may further tighten individual trait spread even when the fruit-level variance band is shared

### `expression`

What the player currently knows. Not all genetic data is immediately visible — some traits reveal through growing, observation, or generational maturity. `expectedRanges` are inherited from the parent fruit's genetics and give the player a preview window.

### `identity.rarity` and `identity.archetypeRarity`

Rarity describes **how unusual this seed is in the world**, not how powerful it is. See [PEPPER-ALMANAC.md § Rarity System](../PEPPER-ALMANAC.md#rarity-system) for full tier definitions and design rules.

**Formula IDs:** `F-SEED-003`

- `archetypeRarity` — the baseline rarity of this pepper type from the Almanac. A Bell Pepper's archetype rarity is always Common. A Ghost Pepper's is always Exotic. This value is immutable and acts as the **floor** for instance rarity.
- `rarity` — the seed's instance-level rarity. Defaults to `archetypeRarity`. Can **elevate** above the archetype baseline if the seed's genetics have deviated significantly from the archetype's typical range through selective breeding.

Rarity elevation is based on:
- **Trait deviation from archetype baseline** — how far the seed's trait values fall outside the archetype's typical range (as defined in the Almanac)
- **Number of deviating traits** — multiple unusual traits compound the rarity signal
- **Stability of deviations** — locked/stable deviations count more than unstable spikes. This ties rarity to breeding mastery, not luck.

Rarity **never decreases** below `archetypeRarity`. A poorly-bred Ghost Pepper seed is still Exotic.

Rarity does not directly affect breeding formulas, growth rates, or soil interaction. It affects acquisition frequency, market value, discovery/collection significance, and player-facing prestige.

### `state`

Tracks where the seed is in its lifecycle. A seed can only be in one state. `planted` means a PlantInstance exists for it. `spent` means it was consumed (used as a male pollen donor). `sold` and `discarded` are terminal states.

Seeds also age across seasons while in storage. `ageInSeasons` tracks how long a seed has been carried forward, and `viability` tracks how usable it still is. Viability should decay exponentially rather than linearly:

- A seed that is 1 season old should lose only a small amount of viability when entering the next season.
- A seed that is 4 seasons old should be close to fully degraded.

V1 decay is:

```text
viability = 0.92 ^ (ageInSeasons ^ 2)
```

This keeps one carried season mild, makes seasons two to three meaningfully risky, and leaves four-plus season seeds heavily degraded but not automatically dead.

**Formula IDs:** `F-SEED-002`

## Formula Registry Note

If a seed field is added or changed in a way that affects inheritance, variance, rarity, viability, or any other computed behavior, verify the corresponding formula entry in [FORMULA-REGISTRY.md](../FORMULA-REGISTRY.md) in the same pass.

## Open Questions

- How does the player efficiently browse/filter large seed inventories? (UX, not data model)
- How are "seed lots" or groupings handled in the UI? (e.g. "12 Jalapeno seeds from Season 3, Fruit #7")
- What is the exact V1 formula for rarity elevation? (Threshold for number of traits outside typical range, minimum stability for deviations to count, tier jump increments)
- Is there a cap on how far instance rarity can elevate above archetype baseline? (e.g., can a Common pepper reach Exotic through breeding alone?)

## Resolved Decisions

- Seeds do degrade over time across seasons. V1 uses `viability = 0.92 ^ (ageInSeasons ^ 2)`, producing minimal loss in early seasons and severe viability loss by around 4 stored seasons.
- There is no seed storage cap for now. Storage remains open-ended unless a later system, such as difficulty modes, creates a reason to limit it.
- Rarity is an instance-level attribute on each seed. It floors at the archetype baseline (from the Almanac) and can elevate through breeding. Rarity describes world-scarcity and unusualness, not trait quality or power. See [PEPPER-ALMANAC.md § Rarity System](../PEPPER-ALMANAC.md#rarity-system).
