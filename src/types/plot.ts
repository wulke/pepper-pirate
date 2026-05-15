import type { PlantId, PlotId } from "./plant.js";

export type { PlotId };

/** Unique identifier for a Soil record (1:1 with Plot). */
export type SoilId = string;

/**
 * How well a plot supports a plant at a particular growth stage.
 * - optimal: designed for this stage; full effectiveness, possible small bonus
 * - marginal: works but at reduced effectiveness; growth is slower
 * - unsupported: plant cannot progress through this stage here; growth halts
 */
export type StageSupport = "optimal" | "marginal" | "unsupported";

/**
 * The six available plot (container) types.
 * Each has a fixed environmental profile in V1; composable microclimate items are a V2 feature.
 * No type is universally best — each excels for certain stages and pepper profiles.
 */
export type PlotType =
  | "starter_tray"
  | "open_pot"
  | "nursery_pot"
  | "fabric_pot"
  | "raised_bed"
  | "greenhouse_bed";

/**
 * The six plant growth stages that plot support is evaluated against.
 * Matches Plant.growth.stage (excluding "spent", which needs no plot support).
 */
export type GrowthStage =
  | "germinating"
  | "seedling"
  | "vegetative"
  | "flowering"
  | "fruiting"
  | "mature";

/**
 * A Plot is the physical container where a plant grows.
 * It defines the environmental envelope — stage support, microclimate, root space, and risk profile —
 * independent of the soil medium inside it.
 *
 * Container choice is a core player decision: match the plot type to the lifecycle stage and pepper profile.
 * A starter tray excels at germination; a fabric pot excels for established drought-resistant plants.
 * @remarks plotModifier fed into F-GROWTH-001. Transplant shock governed by F-PLOT-002, F-HEALTH-001.
 */
export type Plot = {
  /** Unique identifier for this plot. */
  id: PlotId;

  /** The container type. Determines the fixed environmental profile in V1. */
  type: PlotType;

  /**
   * How well this plot supports a plant at each growth stage.
   * The stage support level directly controls whether a plant can progress through a stage here.
   * @remarks stageModifier component of plotModifier in F-GROWTH-001: optimal=1.0, marginal=0.5-0.8, unsupported=0.0.
   */
  supportedStages: Record<GrowthStage, StageSupport>;

  /**
   * Physical capacity of the container.
   * slotCount governs how many plants fit; rootVolumePerSlot governs how large each can grow.
   */
  capacity: {
    /** How many plant/seed slots this container has. */
    slotCount: number;
    /**
     * 0–1. Root space per slot relative to an unconstrained baseline.
     * Plants exceeding this limit incur a rootSpaceModifier penalty in F-GROWTH-001.
     */
    rootVolumePerSlot: number;
  };

  /**
   * The microclimate profile of this container.
   * V1: fixed per plot type. V2: composable via microclimate items (dome, shade cloth, etc.).
   */
  environment: {
    /**
     * Multiplier on per-tick moisture depletion. >1 = retains moisture longer; <1 = dries faster.
     * E.g. starter tray (dome) = 1.8; fabric pot = 0.6.
     */
    moistureRetentionRate: number;
    /**
     * 0–1. Enclosed humidity level. High = great for germination, raises mold risk if airflow is low.
     */
    humidityLevel: number;
    /** 0–1. Air circulation. High = lowers disease risk but increases moisture loss. */
    airflow: number;
    /**
     * 0–1. How much external weather affects this plot. 0 = fully enclosed; 1 = fully exposed.
     * V1 placeholder — weather system is V2.
     */
    weatherExposure: number;
  };

  /** How demanding this plot is to maintain. Higher = more frequent player intervention needed. */
  maintenance: {
    /** Relative multiplier on how often the player needs to water. 1.0 = baseline. */
    wateringFrequency: number;
    /** 0–1. How quickly neglect causes problems. 1.0 = very forgiving; 0.0 = punishes immediately. */
    forgiveness: number;
  };

  /**
   * Signature risks for this plot type. Each type has 1–2 characteristic failure modes.
   * Risk values are probability modifiers, not guaranteed outcomes.
   */
  risks: {
    /** 0–1. Probability modifier for mold events. Elevated on high-humidity, low-airflow containers. */
    moldRisk: number;
    /** Per-tick health degradation rate when a plant remains in a marginal stage past the grace period. */
    rootBoundRate: number;
    /**
     * Multiplier on transplant shock severity when a plant is moved OUT of this container.
     * Higher = plant was more settled in; transition is harder.
     * @remarks Used in F-PLOT-002 transplant shock calculation.
     */
    transplantShockMultiplier: number;
  };

  /** The soil medium inside this container. 1:1 with the plot in V1. */
  soilId: SoilId;

  /** Runtime occupancy and unlock state. */
  state: {
    /** Plants currently growing in this plot. Length ≤ capacity.slotCount. */
    occupantPlantIds: PlantId[];
    /** Season when the player gained access to this plot. Absent if available from the start. */
    unlockedAtSeason?: number;
  };
};
