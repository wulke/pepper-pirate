import type { Plant } from '../../types/plant.js';
import { computeTendingModifier } from './tendingMath.js';

/** The action types a player can perform when actively tending a plant. */
export type TendingAction = 'watering' | 'soil_check' | 'pest_control';

/** careScore increase granted when an action addresses a real plant need (F-TEND-001). */
const CARE_BONUS = 0.20;

/** waterLevel below this threshold is considered a real need; watering then qualifies. */
const WATER_NEED_THRESHOLD = 0.50;

/** soilQuality below this threshold is considered a real need; soil-check then qualifies. */
const SOIL_NEED_THRESHOLD = 0.50;

/** Returns true when the plant has an active negative status effect matching the given category. */
function hasActiveEffect(plant: Plant, category: 'pest' | 'disease'): boolean {
  return plant.health.activeEffects.some((e) => e.type === category);
}

/**
 * Applies a player tending action and returns the updated careScore, tendingModifier, and
 * lastTendedAtTick (when the action qualifies and a tick is provided).
 * Only qualified actions — those addressing a real plant need — grant a careScore bonus.
 * Repeated unnecessary actions yield no increase. Does not mutate the plant.
 * @remarks Implements GROW-005. Qualification rules per F-TEND-001 action qualification rule.
 * TODO: F-TEND-001 anti-spam — use lastTendedAtTick + per-category cooldowns to suppress
 * repeated same-category actions inside a short care window (open question in registry).
 */
export function applyTendingAction(
  plant: Plant,
  action: TendingAction
): { careScore: number; tendingModifier: number; lastTendedAtTick?: number } {
  let qualified = false;

  if (action === 'watering') {
    qualified = plant.health.waterLevel < WATER_NEED_THRESHOLD;
  } else if (action === 'soil_check') {
    qualified = plant.health.soilQuality < SOIL_NEED_THRESHOLD;
  } else if (action === 'pest_control') {
    qualified = hasActiveEffect(plant, 'pest') || hasActiveEffect(plant, 'disease');
  }

  const careScore = qualified
    ? Math.min(1.0, plant.tending.careScore + CARE_BONUS)
    : plant.tending.careScore;

  // lastTendedAtTick requires the caller to supply the current tick, which is not yet threaded
  // through this API — deferred until the anti-spam cooldown system is implemented.
  return { careScore, tendingModifier: computeTendingModifier(careScore) };
}
