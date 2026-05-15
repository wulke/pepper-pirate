import type {
  FruitId,
  SeedId,
  TraitKey,
  TraitGenome,
  TraitExpression,
} from "./seed.js";
import type { NodeId, PlantId } from "./plant.js";

/**
 * A Fruit is the output of a pollinated Node and the bridge between generations.
 * Fruit genetics are resolved at pollination time (not harvest time) and form the baseline
 * from which all contained seeds are derived.
 *
 * The player harvests, evaluates, sells, processes, or extracts seeds from fruits.
 * Selling or processing a fruit whole means the seeds inside are lost permanently.
 * @remarks Genetics resolved by F-FRUIT-001. Per-seed variance applied by F-SEED-001.
 */
export type Fruit = {
  /** Unique identifier for this fruit. */
  id: FruitId;

  /**
   * Links this fruit back to the specific pollination event that created it.
   * maternalSeedId / paternalSeedId trace to the seeds that grew into the parent plants,
   * forming the lineage chain for all seeds extracted from this fruit.
   */
  origin: {
    /** The node on which pollination occurred. */
    nodeId: NodeId;
    /** The plant that bore this fruit (the maternal plant). */
    plantId: PlantId;
    /** How pollination occurred. self = same plant; cross = pollen from a different plant. */
    pollinationType: "self" | "cross";
    /** Seed that grew into the maternal plant. Entry point for maternal lineage traversal. */
    maternalSeedId: SeedId;
    /** Seed that grew into the paternal plant. Null if self-pollinated (same seed as maternal). */
    paternalSeedId: SeedId | null;
  };

  /**
   * The fruit's combined genetic profile, resolved at pollination time.
   * This is the baseline from which all seeds in this fruit are derived.
   * High stabilityScore = seeds are tightly grouped. Low = wide sibling spread.
   * @remarks Written by F-FRUIT-001. Read by F-SEED-001 for per-seed variance resolution.
   */
  genetics: {
    /** Merged per-trait genome from both parents. Each seed starts here and deviates by variance. */
    traitBaseline: Partial<Record<TraitKey, TraitGenome>>;
    /**
     * 0–1. Fruit-level summary that tightens or widens sibling seed spread.
     * High = seeds are similar to each other and to the baseline.
     */
    stabilityScore: number;
    /** Maximum numeric distance any individual seed trait can deviate from traitBaseline. */
    varianceRange: number;
  };

  /** Growth lifecycle state. Genetics are locked at pollination; growth just tracks ripeness. */
  growth: {
    /** Current ripeness stage. Fruit progresses developing → ripening → ripe; may reach overripe if unharvested. */
    stage: "developing" | "ripening" | "ripe" | "overripe";
    /** 0–1. Progress within the current stage. */
    progress: number;
    /** Season number when this fruit began growing. */
    grownAtSeason: number;
    /** Tick when this fruit was harvested. Absent until harvested. */
    harvestedAtTick?: number;
  };

  /**
   * What the player can observe about this fruit while it grows and after harvest.
   * Traits become more visible as the fruit matures.
   */
  expression: {
    /** Traits currently observable on this fruit. Expands as the fruit ripens. */
    visibleTraits: Partial<Record<TraitKey, TraitExpression>>;
    /** How many seeds the player can expect to extract. Informed by genetics; confirmed at extraction. */
    estimatedSeedCount: number;
    /** Derived quality grade (e.g. "A", "B+"). Absent until the fruit has ripened enough to assess. */
    qualityGrade?: string;
  };

  /**
   * Seeds contained in this fruit.
   * Seeds are generated when the player actively extracts them; selling whole means they're gone.
   */
  seeds: {
    /** IDs of extracted seeds. Empty until the player extracts seeds from this fruit. */
    seedIds: SeedId[];
    /** Whether the player has opened/processed this fruit to extract its seeds. */
    seedsExtracted: boolean;
  };

  /**
   * Disposition state. Terminal states (sold, processed, discarded) are irreversible.
   * A harvested fruit that hasn't been acted on stays in "harvested" until the player decides.
   */
  state: {
    status: "growing" | "ready" | "harvested" | "sold" | "processed" | "discarded";
  };

  /** Player-assigned annotations. Not used by any formula. */
  metadata: {
    /** Player-defined tags for filtering/organization. */
    tags: string[];
    /** Free-text notes the player has written about this fruit. */
    notes?: string;
    /** Whether the player has marked this fruit as a favorite. */
    playerFavorite?: boolean;
  };
};
