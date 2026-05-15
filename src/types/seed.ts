/** Unique identifier for a Seed instance. */
export type SeedId = string;

/** Unique identifier for a Fruit instance. */
export type FruitId = string;

/**
 * All genetic trait keys tracked in the system.
 * V2 traits are present in the type but may not be populated in V1 data.
 */
export type TraitKey =
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

/**
 * The genetic record for a single trait as it exists in a seed or fruit.
 * Resolved at fruit-grow time; seeds inherit from the parent fruit's traitBaseline
 * with per-seed variance applied.
 * @remarks Read by F-FRUIT-001 (fruit baseline resolution) and F-SEED-001 (per-seed variance).
 */
export type TraitGenome = {
  /** The trait value inherited from parent(s). Number for quantitative traits; string/string[] for categorical. */
  inheritedValue: number | string | string[];
  /** 0–1. How consistently this trait expresses across siblings. High = tight sibling spread. */
  stability: number;
  /** Expected deviation from inheritedValue when this seed grows. Bounded by fruit-level varianceRange. */
  variance: number;
  /**
   * Derived from stability; not tied to generation count.
   * - unstable: wide swing per generation
   * - drifting: narrowing but not fixed
   * - mostly_stable: reliable, minor drift possible
   * - locked: effectively fixed; breeding won't move it
   */
  lockState: "unstable" | "drifting" | "mostly_stable" | "locked";
  /** Whether the player can see this trait's genome data in the UI. */
  visibleToPlayer: boolean;
  /**
   * Proportion of this trait's inheritedValue that came from each source.
   * Weights sum to ~1.0. Missing keys mean no contribution from that source.
   */
  inheritanceSource: {
    /** Fraction from the maternal parent seed's trait value. */
    maternalWeight?: number;
    /** Fraction from the paternal parent seed's trait value. Absent if self-pollinated. */
    paternalWeight?: number;
    /** Fraction from random mutation. Non-zero only on mutation events. */
    mutationWeight?: number;
  };
};

/**
 * What the player currently knows about a single trait on a seed.
 * Distinct from TraitGenome — this is the observed/inferred value, not the underlying genome.
 */
export type TraitExpression = {
  /** The currently observed or inferred trait value. May be imprecise; see confidence. */
  currentValue: number | string | string[];
  /** 0–1. How certain the player should be about currentValue. Increases with observation. */
  confidence: number;
  /** How this expression was obtained. Affects confidence floor. */
  derivedFrom: "seed_preview" | "grown_observation" | "lineage_projection";
};

/**
 * The expected min/max range for a trait, inherited from the parent fruit's genetics.
 * Gives the player a preview window before growing the seed.
 */
export type TraitRange = {
  /** Lower bound of expected trait value. */
  min: number;
  /** Upper bound of expected trait value. */
  max: number;
  /** Most likely value within the range, if known. */
  expected?: number;
};

/**
 * A Seed is the core genetic individual in the system.
 * Every seed has its own unique genetics derived from its parent fruit with per-seed variance applied.
 * Seeds are what players evaluate, store, trade, plant, and select for breeding.
 * @remarks Genetics resolved by F-SEED-001. Viability decay governed by F-SEED-002.
 */
export type Seed = {
  /** Unique identifier for this seed. */
  id: SeedId;

  /**
   * Where this specific seed came from.
   * Links to the fruit, not the plant — origin is "which fruit produced this seed."
   * Distinct from lineage, which tracks the full ancestral chain.
   */
  origin: {
    /** The fruit this seed was extracted from. Null for wild/market seeds with no known parent fruit. */
    sourceFruitId: FruitId | null;
    /** How this seed entered the game world. */
    sourceType: "wild" | "market" | "player_bred" | "quest" | "event";
    /** Human-readable provenance label. E.g. "Bought from Trader Rosa, Season 3". */
    sourceLabel?: string;
  };

  /**
   * Ancestral lineage tracked through seeds, not fruits or plants.
   * maternalSeedId / paternalSeedId point to the seeds that grew into the parent plants.
   * Walk this chain upward to reconstruct the full family tree.
   */
  lineage: {
    /** False for wild/market seeds with no ancestry data. */
    knownLineage: boolean;
    /** Classification of the lineage root. unknown_stock = no data; wild_stock = undomesticated origin; known_record = full player-bred record. */
    rootType: "unknown_stock" | "wild_stock" | "known_record";
    /** Distance from the root of the known lineage record. 0 = founding seed. */
    generation: number;
    /** The seed that grew into the maternal (female) parent plant. Null if unknown. */
    maternalSeedId: SeedId | null;
    /** The seed that grew into the paternal (male) parent plant. Null if self-pollinated or unknown. */
    paternalSeedId: SeedId | null;
  };

  /**
   * This seed's own genetic identity. Determined at fruit-grow time; unique per seed even among siblings.
   * Sibling spread is tight when the parent line is stable, wide when unstable.
   * @remarks F-FRUIT-001 provides the fruit-level traitBaseline. F-SEED-001 applies per-seed variance.
   * F-SOIL-001 reads soilAffinity as the runtime source of truth for soil-seed fit evaluation.
   */
  genetics: {
    /**
     * Soil preference profile used at runtime by F-SOIL-001 to compute soilModifier.
     * Values are in natural units (pH) or 0–1 (nutrients, moisture).
     * Set at seed creation from parent genetics; does not change during the seed's lifetime.
     * @remarks Read by F-SOIL-001 as Seed.genetics.soilAffinity.*.
     */
    soilAffinity: {
      /** Preferred soil pH in natural units (e.g. 6.4). F-SOIL-001 normalizes to [0,1] internally. */
      preferredPh: number;
      /** 0–1. Preferred nitrogen level. */
      preferredNitrogen: number;
      /** 0–1. Preferred phosphorus level. */
      preferredPhosphorus: number;
      /** 0–1. Preferred potassium level. */
      preferredPotassium: number;
      /** 0–1. Preferred soil moisture level. */
      preferredMoisture: number;
    };
    /** Per-trait genome records. Only traits actually resolved are present; others are absent from the Partial map. */
    traitGenome: Partial<Record<TraitKey, TraitGenome>>;
    /** 0–1. Summary of overall trait-level stability across this seed's genome. */
    overallStability: number;
    /** 0–1. Summary of expected trait-level variance. High = siblings can differ significantly. */
    overallVariance: number;
  };

  /**
   * What the player can currently observe about this seed.
   * Not all genetic data is visible immediately — traits reveal through growing, observation, or breeding maturity.
   */
  expression: {
    /** Traits the player can currently see expressed on this seed. */
    visibleTraits: Partial<Record<TraitKey, TraitExpression>>;
    /** Trait keys that exist in the genome but are not yet revealed to the player. */
    hiddenTraitKeys: TraitKey[];
    /** Expected value ranges per trait, inherited from the parent fruit. Gives the player a preview window. */
    expectedRanges: Partial<Record<TraitKey, TraitRange>>;
  };

  /**
   * Player-facing identity: what the player calls this seed and how rare it is.
   * Rarity describes world-scarcity and unusualness, not power. See PEPPER-ALMANAC.md § Rarity System.
   * @remarks Rarity elevation governed by F-SEED-003.
   */
  identity: {
    /** Display name shown in the UI. E.g. "Jalapeno Seed", "Hybrid #47 Seed". */
    displayName: string;
    /** Botanical family name, if known. E.g. "Capsicum annuum". */
    family?: string;
    /** Named cultivar, only populated if this seed is part of a stabilized named line. */
    cultivarName?: string;
    /**
     * Instance-level rarity. Defaults to archetypeRarity; can elevate above it through selective breeding.
     * Never decreases below archetypeRarity.
     */
    rarity: "common" | "uncommon" | "rare" | "exotic" | "legendary";
    /**
     * The baseline rarity of this pepper type from the Almanac. Immutable floor for instance rarity.
     * E.g. Bell Pepper = common, Ghost Pepper = exotic — always, regardless of genetics.
     */
    archetypeRarity: "common" | "uncommon" | "rare" | "exotic" | "legendary";
  };

  /**
   * Inventory and lifecycle state. A seed can only be in one status at a time.
   * Seeds age across seasons in storage; viability decays exponentially.
   * @remarks Viability decay formula: F-SEED-002 — viability = 0.92 ^ (ageInSeasons ^ 2).
   */
  state: {
    /**
     * Current lifecycle position.
     * - stored: in inventory, aging each season
     * - planted: a Plant instance exists for this seed
     * - spent: consumed as a male pollen donor
     * - sold / discarded: terminal states
     */
    status: "stored" | "planted" | "spent" | "sold" | "discarded";
    /** The season number when this seed entered storage. Absent if never in storage. */
    storedAtSeason?: number;
    /** The season number when this seed was planted. Absent if never planted. */
    plantedAtSeason?: number;
    /** How many seasons this seed has been carried forward in storage. Increments each new season. */
    ageInSeasons: number;
    /**
     * 0–1. How viable this seed still is for germination.
     * Decays exponentially with age. Near 0 = heavily degraded but not automatically dead.
     * @remarks Written by F-SEED-002.
     */
    viability: number;
  };

  /** Player-assigned annotations. Not used by any formula. */
  metadata: {
    /** Player-defined tags for filtering/organization. */
    tags: string[];
    /** Free-text notes the player has written about this seed. */
    notes?: string;
    /** Whether the player has marked this seed as a favorite. */
    playerFavorite?: boolean;
  };
};
