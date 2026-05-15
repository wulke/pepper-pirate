import type { Seed } from '../../types/seed.js';
import type { Soil } from '../../types/soil.js';

/** Returned by checkCompatibility. Narrows on `outcome` before reading `reason` or `alternatives`. */
export type CheckCompatibilityResult =
  | { outcome: 'compatible' }
  | {
      outcome: 'incompatible';
      /** The first factor that fell fully out of tolerance. pH is evaluated before nutrients. */
      reason: 'soil_ph' | 'soil_nutrients';
      alternatives: ReadonlyArray<'change_seed' | 'upgrade_plot'>;
    };

/** pH normalization bounds matching the F-SOIL-001 definition. */
const PH_MIN = 5.0;
const PH_MAX = 8.0;

/**
 * Fallback tolerance when hardiness/droughtResistance traits are absent from the genome.
 * 0.30 places the seed in the "typical" band from the F-SOIL-001 proposal.
 */
const DEFAULT_TOLERANCE = 0.30;

/**
 * F-SOIL-001: tolerance = 0.75 * hardiness + 0.25 * droughtResistance.
 * Falls back to DEFAULT_TOLERANCE when either trait is absent or non-numeric.
 */
function computeTolerance(seed: Seed): number {
  const hardinessTrait = seed.genetics.traitGenome['hardiness'];
  const droughtTrait = seed.genetics.traitGenome['droughtResistance'];

  const h =
    typeof hardinessTrait?.inheritedValue === 'number'
      ? hardinessTrait.inheritedValue
      : DEFAULT_TOLERANCE;
  const d =
    typeof droughtTrait?.inheritedValue === 'number'
      ? droughtTrait.inheritedValue
      : DEFAULT_TOLERANCE;

  return 0.75 * h + 0.25 * d;
}

/**
 * F-SOIL-001: plateau + linear falloff.
 * Returns 1.0 within the sweet spot, falls linearly to 0.0 at delta == tolerance.
 */
function factorModifier(delta: number, tolerance: number): number {
  if (tolerance === 0) return delta === 0 ? 1.0 : 0.0;
  const sweetSpot = tolerance * 0.5;
  if (delta <= sweetSpot) return 1.0;
  const maxOvershoot = tolerance * 0.5;
  const overshoot = delta - sweetSpot;
  return Math.max(0.0, 1.0 - overshoot / maxOvershoot);
}

/**
 * Checks whether a seed's soil affinity is compatible with the given soil's current conditions.
 * Implements the compatibility gate from F-SOIL-001: a factor reaching 0.0 (fully outside tolerance)
 * blocks planting. Partial mismatch (modifier > 0) still allows planting but reduces growth rate.
 *
 * Does not mutate the seed or soil.
 * @remarks Implements GROW-001 and GROW-002. Full soilModifier computation lives in F-GROWTH-001.
 */
export function checkCompatibility(seed: Seed, soil: Soil): CheckCompatibilityResult {
  const tolerance = computeTolerance(seed);
  const affinity = seed.genetics.soilAffinity;

  const normalizedActualPh = (soil.conditions.currentPh - PH_MIN) / (PH_MAX - PH_MIN);
  const normalizedPreferredPh = (affinity.preferredPh - PH_MIN) / (PH_MAX - PH_MIN);
  const phDelta = Math.abs(normalizedActualPh - normalizedPreferredPh);
  const phMod = factorModifier(phDelta, tolerance);

  if (phMod === 0) {
    return {
      outcome: 'incompatible',
      reason: 'soil_ph',
      alternatives: ['change_seed', 'upgrade_plot'],
    };
  }

  const nMod = factorModifier(Math.abs(soil.nutrients.nitrogen - affinity.preferredNitrogen), tolerance);
  const pMod = factorModifier(Math.abs(soil.nutrients.phosphorus - affinity.preferredPhosphorus), tolerance);
  const kMod = factorModifier(Math.abs(soil.nutrients.potassium - affinity.preferredPotassium), tolerance);
  // Average, not min: a single bad nutrient drags growth rate down but does not block planting on its own.
  // Only when all three nutrients are fully out of tolerance (nutrientMod === 0) is planting rejected.
  // Mirrors F-SOIL-001's "recoverable" framing — fixing one nutrient is always meaningful progress.
  const nutrientMod = (nMod + pMod + kMod) / 3;

  if (nutrientMod === 0) {
    return {
      outcome: 'incompatible',
      reason: 'soil_nutrients',
      alternatives: ['change_seed', 'upgrade_plot'],
    };
  }

  // moistureLevel is an F-SOIL-001 input to the per-tick soilModifier (F-GROWTH-001) but is not
  // evaluated here: moisture is dynamic and corrected by watering, not by seed or plot selection.
  return { outcome: 'compatible' };
}
