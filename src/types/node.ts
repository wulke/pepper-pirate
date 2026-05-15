import type { NodeId, PlantId } from "./plant.js";
import type { FruitId } from "./seed.js";

export type { NodeId, PlantId };

/**
 * A Node is a flower/bud site on a plant.
 * Nodes are where pollination happens and where fruits originate.
 * Each node has three possible fates: self-pollinate, receive pollen (cross_female), or donate pollen (cross_male).
 * Donating pollen consumes the node — it produces no fruit.
 *
 * The pollination event on a node determines the genetics of the resulting Fruit.
 */
export type PepperNode = {
  /** Unique identifier for this node. */
  id: NodeId;

  /** The plant that owns this node. */
  plantId: PlantId;

  /**
   * Current lifecycle status and progress within that status.
   * Stages: budding → flowering → pollination_window → pollinated → fruiting → harvested | spent.
   */
  state: {
    /**
     * Where this node is in its lifecycle.
     * - budding: appeared but not ready for pollination
     * - flowering: visible flower, approaching the pollination window
     * - pollination_window: active player decision window; assign as female or male, or it self-pollinates at window close
     * - pollinated: genetics of future fruit are locked
     * - fruiting: fruit is growing on this node
     * - harvested: fruit has been collected
     * - spent: node was consumed as a male pollen donor; terminal, no fruit
     */
    status:
      | "budding"
      | "flowering"
      | "pollination_window"
      | "pollinated"
      | "fruiting"
      | "harvested"
      | "spent";
    /** 0–1. Progress within the current status. */
    progress: number;
  };

  /**
   * How this node was pollinated and with what partner, if cross-pollinated.
   * type starts as "pending" and is set when pollination occurs.
   * Cross-pollination fields are filled only for cross events.
   */
  pollination: {
    /**
     * - pending: no pollination has occurred yet
     * - self: self-pollinated when the window closed
     * - cross_female: this node received pollen from another plant
     * - cross_male: this node donated pollen and was consumed
     */
    type: "pending" | "self" | "cross_female" | "cross_male";
    /** Tick when pollination occurred. Absent until pollination happens. */
    pollinationTick?: number;
    /** For cross_female: the node that donated pollen. */
    maleNodeId?: NodeId;
    /** For cross_female: the plant that donated pollen. */
    malePlantId?: PlantId;
    /** For cross_male: the node that received this node's pollen. */
    femaleNodeId?: NodeId;
    /** For cross_male: the plant that received this node's pollen. */
    femalePlantId?: PlantId;
  };

  /**
   * The fruit produced by this node after pollination.
   * Null if this node is a male donor (no fruit produced) or has not yet reached the fruiting stage.
   */
  fruitId: FruitId | null;

  /**
   * Tick-level timing for the node's lifecycle.
   * pollinationWindowStart / pollinationWindowEnd define the active player decision window.
   */
  timing: {
    /** Tick when this node first appeared on the plant. */
    appearedAtTick: number;
    /** Tick when the player can begin intervening in pollination. Absent until the window opens. */
    pollinationWindowStart?: number;
    /** Tick when the window closes and self-pollination occurs if the player has not acted. */
    pollinationWindowEnd?: number;
  };
};
