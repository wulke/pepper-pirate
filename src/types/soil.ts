import type { PlotId } from "./plant.js";

/**
 * Soil defines the growing conditions inside a plot.
 * It is a separate model from Plot — the same soil mix in different containers behaves differently
 * due to the container's physical environment (humidity, airflow, root space).
 *
 * Soil properties interact directly with seed genetics: matching soil to a pepper's genetic needs
 * is a core player skill. Neglect causes degradation; overmanagement has consequences.
 *
 * V2 properties (health block) are modeled here for completeness but are not active in V1.
 * @remarks Soil-seed fit computed by F-SOIL-001 → produces soilModifier for F-GROWTH-001.
 */
export type Soil = {
  /** Shares the ID of the plot this soil belongs to. 1:1 relationship in V1. */
  id: PlotId;

  /**
   * Inherent plot properties that are difficult or expensive to change.
   * Texture is set when the player acquires the plot and acts as the character of the soil.
   */
  base: {
    /**
     * Base soil texture. Determines starting drainage, water retention, and nutrient behavior.
     * - sand: drains fast, nutrients wash out; needs frequent fertilizing
     * - sandy_loam: faster drainage, good for drought-resistant varieties
     * - loam: balanced; works for most varieties without heavy amendment
     * - clay_loam: high retention and nutrients, compacts easily
     * - clay: waterlogging risk, compacts hard; rich but demanding
     */
    texture: "sand" | "sandy_loam" | "loam" | "clay_loam" | "clay";
    /** 0–1. How quickly water moves through this soil naturally, before amendments. */
    naturalDrainage: number;
    /** The natural resting pH if left unamended (typically 5.5–8.0). Player adjusts currentPh via tending. */
    basePhLevel: number;
  };

  /**
   * NPK nutrients — actively managed by the player.
   * Not "more is better": each pepper variety has a preferred ratio.
   * Excess of any single nutrient has diminishing returns and can lock out others.
   * @remarks Read by F-SOIL-001 at the paths Soil.nutrients.nitrogen / phosphorus / potassium.
   */
  nutrients: {
    /** 0–1. Available nitrogen. Promotes vegetative growth; excess reduces fruiting. */
    nitrogen: number;
    /** 0–1. Available phosphorus. Promotes flowering and fruiting; critical for node production. */
    phosphorus: number;
    /** 0–1. Available potassium. Promotes hardiness, disease resistance, and fruit maturation. */
    potassium: number;
  };

  /**
   * Managed conditions that the player adjusts through tending actions.
   * pH is the master gatekeeper: wrong pH causes nutrient lockout even when NPK levels are high.
   * @remarks moistureLevel read by F-SOIL-001 as Soil.conditions.moistureLevel.
   */
  conditions: {
    /**
     * Effective pH of this soil (typically 6.0–6.8 for most peppers).
     * Player adjusts this by adding lime (raises) or sulfur (lowers).
     * @remarks Read by F-SOIL-001 as Soil.conditions.currentPh.
     */
    currentPh: number;
    /** Effective drainage rate after amendments (base + perlite/sand/etc.). */
    currentDrainage: number;
    /** 0–1. How long water stays available to roots after watering. */
    waterRetention: number;
    /**
     * 0–1. Current water content in the soil.
     * Depletes each tick; replenished by watering or rain (V2). Affects drought stress.
     * @remarks Read by F-SOIL-001 as Soil.conditions.moistureLevel.
     */
    moistureLevel: number;
  };

  /**
   * V2 long-term soil health properties. Included in the model for forward compatibility.
   * None of these fields are read by any V1 formula.
   */
  health: {
    /** 0–1. Slow-building organic content. Improves nutrient retention and structure over time. */
    organicMatter: number;
    /** 0–1. Compaction from consecutive use. Degrades root growth, drainage, and nutrient uptake. */
    compaction: number;
    /** 0–1. Microbial activity bonus multiplier for nutrient absorption. Built through consistent organic care. */
    microbialHealth: number;
    /** 0–1. Salt buildup from over-fertilizing. Inhibits growth; remediated by flushing or gypsum. */
    salinity: number;
  };

  /** Historical state used for degradation tracking and diagnostics. */
  state: {
    /** Tick of the most recent soil amendment (pH adjustment, fertilizer addition). */
    lastAmendedAtTick?: number;
    /** Season number of the most recent planting in this soil. */
    lastPlantedSeason?: number;
    /** How many consecutive seasons this soil has been used. Contributes to V2 compaction. */
    consecutiveSeasonsUsed: number;
    /** The plant currently drawing from this soil, if any. Absent when the plot is empty. */
    currentPlantId?: string;
  };
};
