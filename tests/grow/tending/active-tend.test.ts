import { describe, it, expect } from 'vitest';
import { applyTendingAction } from '../../../src/grow/tending/activeTend.js';
import { lowWaterPlant, poorSoilPlant, plantWithPest, wellWateredPlant } from './fixtures.js';

describe('GROW-005', () => {
  it('applies a tending bonus above base effectiveness on a qualified watering action', () => {
    // lowWaterPlant.health.waterLevel = 0.15 — a real need exists; careScore and modifier should rise.
    const result = applyTendingAction(lowWaterPlant, 'watering');
    expect(result.careScore).toBeGreaterThan(lowWaterPlant.tending.careScore);
    expect(result.tendingModifier).toBeGreaterThan(1.0);
  });

  it('applies a tending bonus above base effectiveness on a qualified soil-check action', () => {
    // poorSoilPlant.health.soilQuality = 0.15 — a real need exists; careScore and modifier should rise.
    const result = applyTendingAction(poorSoilPlant, 'soil_check');
    expect(result.careScore).toBeGreaterThan(poorSoilPlant.tending.careScore);
    expect(result.tendingModifier).toBeGreaterThan(1.0);
  });

  it('applies a tending bonus above base effectiveness on a qualified pest-control action', () => {
    // plantWithPest has an active pest StatusEffect — a real need exists; careScore and modifier should rise.
    const result = applyTendingAction(plantWithPest, 'pest_control');
    expect(result.careScore).toBeGreaterThan(plantWithPest.tending.careScore);
    expect(result.tendingModifier).toBeGreaterThan(1.0);
  });

  it('does not increase careScore above the cap for non-qualifying repeated actions', () => {
    // wellWateredPlant.health.waterLevel = 0.90 — watering addresses no real need; no bonus granted.
    const result = applyTendingAction(wellWateredPlant, 'watering');
    expect(result.careScore).toBeLessThanOrEqual(wellWateredPlant.tending.careScore);
  });
});
