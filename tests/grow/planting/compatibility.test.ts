import { describe, it, expect } from 'vitest';
import { checkCompatibility } from '../../../src/grow/planting/checkCompatibility.js';
import { baseSeed, phMismatchSeed, npkMismatchSeed, neutralSoil } from './fixtures.js';

describe('GROW-001', () => {
  it('rejects an incompatible seed without advancing its state', () => {
    const statusBefore = phMismatchSeed.state.status;
    const result = checkCompatibility(phMismatchSeed, neutralSoil);
    expect(result.outcome).toBe('incompatible');
    expect(phMismatchSeed.state.status).toBe(statusBefore);
  });

  it('returns a rejection result when soil pH is out of seed tolerance', () => {
    const result = checkCompatibility(phMismatchSeed, neutralSoil);
    expect(result.outcome).toBe('incompatible');
    if (result.outcome === 'incompatible') {
      expect(result.reason).toBe('soil_ph');
    }
  });

  it('returns a rejection result when NPK is outside seed affinity', () => {
    const result = checkCompatibility(npkMismatchSeed, neutralSoil);
    expect(result.outcome).toBe('incompatible');
    if (result.outcome === 'incompatible') {
      expect(result.reason).toBe('soil_nutrients');
    }
  });
});

describe('GROW-002', () => {
  it('returns an offer-alternatives result, not a plant result, on incompatible seed', () => {
    const result = checkCompatibility(phMismatchSeed, neutralSoil);
    expect(result.outcome).not.toBe('compatible');
    if (result.outcome === 'incompatible') {
      expect(result.alternatives.length).toBeGreaterThan(0);
    }
  });

  it('does not mutate seed state when offering alternatives', () => {
    const statusBefore = phMismatchSeed.state.status;
    checkCompatibility(phMismatchSeed, neutralSoil);
    expect(phMismatchSeed.state.status).toBe(statusBefore);
  });
});

describe('GROW-001 compatible path', () => {
  it('returns compatible when seed affinity matches soil conditions', () => {
    const result = checkCompatibility(baseSeed, neutralSoil);
    expect(result.outcome).toBe('compatible');
  });
});
