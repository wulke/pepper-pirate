import type { Plant } from '../../types/plant.js';
import { computeTendingModifier } from './tendingMath.js';

/**
 * careScore floor when autoTendEnabled is true (F-TEND-001).
 * At this floor, tendingModifier = 1.00 — the idle-friendly baseline that never stalls growth.
 */
export const AUTO_TEND_FLOOR = 0.40;

/** Per-tick decay factor applied to the gap between careScore and the floor (F-TEND-001). */
const DECAY_FACTOR = 0.80;

/**
 * Advances the plant's careScore through `ticks` decay steps using the F-TEND-001 rule.
 * Deterministic — no timers or side effects. Does not mutate the plant.
 * @remarks Implements GROW-004. floor = AUTO_TEND_FLOOR when autoTendEnabled, 0.0 otherwise.
 */
export function stepAutoTend(plant: Plant, ticks: number): { careScore: number; tendingModifier: number } {
  const floor = plant.tending.autoTendEnabled ? AUTO_TEND_FLOOR : 0.0;
  let careScore = plant.tending.careScore;
  for (let i = 0; i < ticks; i++) {
    careScore = floor + (careScore - floor) * DECAY_FACTOR;
  }
  return { careScore, tendingModifier: computeTendingModifier(careScore) };
}
