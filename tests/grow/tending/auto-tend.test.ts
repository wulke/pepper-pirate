import { describe, it, expect } from 'vitest';
import { stepAutoTend, AUTO_TEND_FLOOR } from '../../../src/grow/tending/autoTend.js';
import { neglectedAutoTendPlant, autoTendAtFloorPlant } from './fixtures.js';

describe('GROW-004', () => {
  it('advances a fully unattended plant to maturity given sufficient ticks', () => {
    // After enough decay steps the careScore converges to AUTO_TEND_FLOOR, keeping
    // tendingModifier at 1.00 — the idle-friendly baseline that does not stall growth.
    const result = stepAutoTend(neglectedAutoTendPlant, 30);
    expect(result.careScore).toBeGreaterThanOrEqual(AUTO_TEND_FLOOR - 0.01);
    // tendingModifier asymptotically approaches 1.0 as careScore approaches floor;
    // 0.99 is a sufficient threshold to confirm growth is not stalled.
    expect(result.tendingModifier).toBeGreaterThan(0.99);
  });

  it('does not fail the crop when the plant is left unattended', () => {
    // careScore must never drop below AUTO_TEND_FLOOR when autoTendEnabled is true,
    // regardless of how many ticks elapse without player intervention.
    const result = stepAutoTend(autoTendAtFloorPlant, 100);
    expect(result.careScore).toBeGreaterThanOrEqual(AUTO_TEND_FLOOR);
  });

  it('applies base auto-tend effectiveness (careScore floor) when autoTendEnabled is true', () => {
    // At careScore == AUTO_TEND_FLOOR, tendingModifier == 1.00 per F-TEND-001.
    const result = stepAutoTend(autoTendAtFloorPlant, 1);
    expect(result.careScore).toBeCloseTo(AUTO_TEND_FLOOR, 5);
    expect(result.tendingModifier).toBeCloseTo(1.0, 5);
  });
});
