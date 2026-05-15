import type { SeedId } from "./seed.js";

/** Unique identifier for a Plant instance. */
export type PlantId = string;

/** Unique identifier for a Node (flower/bud site) on a plant. */
export type NodeId = string;

/** Unique identifier for a Plot (growing container). */
export type PlotId = string;

/**
 * A temporary condition affecting a plant's health or growth rate.
 * Applied by events (pests, weather, tending mini-games) and removed when resolved or expired.
 */
export type StatusEffect = {
  /**
   * The category of effect. Negative effects degrade health; positive effects boost it.
   * Weather event types (storm_damage, flooding, drought_stress, cold_damage, heat_damage) are
   * gated by Zone character — arid Zones draw from drought/heat; rainy Zones from storm/flooding.
   */
  type:
    | "pest"
    | "disease"
    | "drought_stress"
    | "cold_damage"
    | "heat_damage"
    | "storm_damage"
    | "flooding"
    | "tending_bonus"
    | "mini_game_bonus";
  /** 0–1. How strongly this effect is currently acting on the plant. */
  severity: number;
  /** The game tick when this effect was applied. */
  appliedAtTick: number;
  /** Ticks until the effect expires automatically. Absent means it persists until actively treated. */
  duration?: number;
};

/**
 * A Plant is the runtime growth instance for a planted seed.
 * It does not own genetics — genetics live on the source Seed.
 * The Plant owns its growth state, health conditions, tending history, and node references.
 * @remarks Growth rate formula: F-GROWTH-001. Tending modifier: F-TEND-001.
 */
export type Plant = {
  /** Unique identifier for this plant instance. */
  id: PlantId;

  /** The seed this plant grew from. All genetic lookups trace back through this reference. */
  sourceSeedId: SeedId;

  /** Where this plant is physically located and when it was planted. */
  placement: {
    /** The plot this plant occupies. */
    plotId: PlotId;
    /** The season number when this seed was planted. */
    plantedAtSeason: number;
    /** The tick within the season when planting occurred. Absent if tick-level resolution is not needed. */
    plantedAtTick?: number;
  };

  /**
   * Current stage in the growth lifecycle and progress within that stage.
   * Stages: germinating → seedling → vegetative → flowering → fruiting → mature → spent.
   */
  growth: {
    /** The plant's current lifecycle stage. */
    stage:
      | "germinating"
      | "seedling"
      | "vegetative"
      | "flowering"
      | "fruiting"
      | "mature"
      | "spent";
    /** 0–1. Progress within the current stage. 1.0 = ready to advance to next stage. */
    progress: number;
    /** 0–1. Progress across the entire lifecycle from germination to spent. */
    totalGrowthProgress: number;
    /** Estimated ticks remaining in the current stage, if calculable. Absent when unknown. */
    estimatedTicksRemaining?: number;
  };

  /**
   * Environmental health factors. These are what tending mini-games and active care interact with.
   * Idle/auto-tend maintains base levels; active play optimizes them.
   * @remarks overallHealth is consumed by F-HEALTH-001.
   */
  health: {
    /** 0–1. Current soil water content available to this plant. */
    waterLevel: number;
    /** 0–1. Current soil quality at this plant's root zone. */
    soilQuality: number;
    /** 0–1. Effective sunlight reaching this plant. */
    sunlightExposure: number;
    /** 0–1. Derived composite of waterLevel, soilQuality, sunlight, and active effects. */
    overallHealth: number;
    /** Currently active conditions modifying growth or health. Empty array when plant is healthy. */
    activeEffects: StatusEffect[];
  };

  /** References to Node objects owned by this plant. Nodes appear during the flowering stage. */
  nodeIds: NodeId[];

  /**
   * Tending history used to compute the tending modifier.
   * careScore is the plant's short-horizon care memory — decays toward an idle floor over time.
   * Qualified tending actions raise it; auto-tend maintains a baseline floor.
   * @remarks careScore and lastTendedAtTick are the primary inputs to F-TEND-001.
   */
  tending: {
    /** Tick of the most recent tending action. Absent if never manually tended. */
    lastTendedAtTick?: number;
    /** Whether the player has unlocked irrigation/automation upgrades for this plant. */
    autoTendEnabled: boolean;
    /**
     * 0–1. Recent care quality used as the tending modifier input.
     * Decays over time; rises when a qualified tending action addresses a real plant need.
     * @remarks Read by F-TEND-001 to compute tendingModifier.
     */
    careScore: number;
  };

  /** Harvest lifecycle tracking. */
  harvest: {
    /** Total fruits this plant has produced across all fruiting cycles. */
    totalFruitsProduced: number;
    /** How many more fruiting cycles this plant can undergo before becoming spent. */
    ratoonsRemaining: number;
    /** Whether this plant can ratoon at all. Derived from the seed's ratoonAbility trait. */
    canRatoon: boolean;
  };
};
