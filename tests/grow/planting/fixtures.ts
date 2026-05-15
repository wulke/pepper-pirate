import type { Seed } from '../../../src/types/seed.js';
import type { Soil } from '../../../src/types/soil.js';
import type { Plot } from '../../../src/types/plot.js';

export const baseSeed: Seed = {
  id: 'seed-test-001',
  origin: {
    sourceFruitId: null,
    sourceType: 'market',
  },
  lineage: {
    knownLineage: false,
    rootType: 'unknown_stock',
    generation: 0,
    maternalSeedId: null,
    paternalSeedId: null,
  },
  genetics: {
    soilAffinity: {
      preferredPh: 6.5,
      preferredNitrogen: 0.6,
      preferredPhosphorus: 0.5,
      preferredPotassium: 0.5,
      preferredMoisture: 0.6,
    },
    traitGenome: {},
    overallStability: 0.7,
    overallVariance: 0.2,
  },
  expression: {
    visibleTraits: {},
    hiddenTraitKeys: [],
    expectedRanges: {},
  },
  identity: {
    displayName: 'Market Jalapeño Seed',
    rarity: 'common',
    archetypeRarity: 'common',
  },
  state: {
    status: 'stored',
    ageInSeasons: 0,
    viability: 1.0,
  },
  metadata: {
    tags: [],
  },
};

/** pH 4.5 seed planted into neutral soil (pH 6.8) — tolerance is exceeded. */
export const phMismatchSeed: Seed = {
  id: 'seed-ph-mismatch',
  origin: { sourceFruitId: null, sourceType: 'market' },
  lineage: { knownLineage: false, rootType: 'unknown_stock', generation: 0, maternalSeedId: null, paternalSeedId: null },
  genetics: {
    soilAffinity: {
      preferredPh: 4.5,
      preferredNitrogen: 0.6,
      preferredPhosphorus: 0.5,
      preferredPotassium: 0.5,
      preferredMoisture: 0.6,
    },
    traitGenome: {},
    overallStability: 0.7,
    overallVariance: 0.2,
  },
  expression: { visibleTraits: {}, hiddenTraitKeys: [], expectedRanges: {} },
  identity: { displayName: 'Acid-Loving Seed', rarity: 'common', archetypeRarity: 'common' },
  state: { status: 'stored', ageInSeasons: 0, viability: 1.0 },
  metadata: { tags: [] },
};

/**
 * Only potassium is fully out of range (preferredK=0.05, soil K=0.5 → delta=0.45 > tolerance).
 * N and P match neutralSoil exactly. Used to verify averaging: nutrientMod = (1+1+0)/3 = 0.67 → compatible.
 */
export const partialNpkMismatchSeed: Seed = {
  id: 'seed-partial-npk-mismatch',
  origin: { sourceFruitId: null, sourceType: 'market' },
  lineage: { knownLineage: false, rootType: 'unknown_stock', generation: 0, maternalSeedId: null, paternalSeedId: null },
  genetics: {
    soilAffinity: {
      preferredPh: 6.5,
      preferredNitrogen: 0.6,
      preferredPhosphorus: 0.5,
      preferredPotassium: 0.05, // fully out of range; N and P match soil exactly
      preferredMoisture: 0.6,
    },
    traitGenome: {},
    overallStability: 0.7,
    overallVariance: 0.2,
  },
  expression: { visibleTraits: {}, hiddenTraitKeys: [], expectedRanges: {} },
  identity: { displayName: 'Low-K Seed', rarity: 'common', archetypeRarity: 'common' },
  state: { status: 'stored', ageInSeasons: 0, viability: 1.0 },
  metadata: { tags: [] },
};

/** Seed wants very low NPK (0.05); soil is well-fertilized (0.6–0.7) — affinity mismatch. */
export const npkMismatchSeed: Seed = {
  id: 'seed-npk-mismatch',
  origin: { sourceFruitId: null, sourceType: 'market' },
  lineage: { knownLineage: false, rootType: 'unknown_stock', generation: 0, maternalSeedId: null, paternalSeedId: null },
  genetics: {
    soilAffinity: {
      preferredPh: 6.5,
      preferredNitrogen: 0.05,
      preferredPhosphorus: 0.05,
      preferredPotassium: 0.05,
      preferredMoisture: 0.6,
    },
    traitGenome: {},
    overallStability: 0.7,
    overallVariance: 0.2,
  },
  expression: { visibleTraits: {}, hiddenTraitKeys: [], expectedRanges: {} },
  identity: { displayName: 'Low-Nutrient Seed', rarity: 'common', archetypeRarity: 'common' },
  state: { status: 'stored', ageInSeasons: 0, viability: 1.0 },
  metadata: { tags: [] },
};

/** Balanced loam at pH 6.8, mid-range NPK — matches baseSeed's soilAffinity well. */
export const neutralSoil: Soil = {
  id: 'plot-neutral',
  base: {
    texture: 'loam',
    naturalDrainage: 0.5,
    basePhLevel: 6.5,
  },
  nutrients: {
    nitrogen: 0.6,
    phosphorus: 0.5,
    potassium: 0.5,
  },
  conditions: {
    currentPh: 6.8,
    currentDrainage: 0.5,
    waterRetention: 0.6,
    moistureLevel: 0.6,
  },
  health: {
    organicMatter: 0.4,
    compaction: 0.1,
    microbialHealth: 0.5,
    salinity: 0.0,
  },
  state: {
    consecutiveSeasonsUsed: 0,
  },
};

/** Single-slot open pot with no current occupants. */
export const emptyPlot: Plot = {
  id: 'plot-empty',
  type: 'open_pot',
  supportedStages: {
    germinating: 'optimal',
    seedling: 'optimal',
    vegetative: 'marginal',
    flowering: 'marginal',
    fruiting: 'marginal',
    mature: 'marginal',
  },
  capacity: { slotCount: 1, rootVolumePerSlot: 0.8 },
  environment: {
    moistureRetentionRate: 1.0,
    humidityLevel: 0.5,
    airflow: 0.5,
    weatherExposure: 0.7,
  },
  maintenance: { wateringFrequency: 1.0, forgiveness: 0.7 },
  risks: { moldRisk: 0.1, rootBoundRate: 0.02, transplantShockMultiplier: 1.0 },
  soilId: 'plot-empty',
  state: { occupantPlantIds: [] },
};

/** Same container as emptyPlot but already occupied — its single slot is taken. */
export const fullPlot: Plot = {
  id: 'plot-full',
  type: 'open_pot',
  supportedStages: {
    germinating: 'optimal',
    seedling: 'optimal',
    vegetative: 'marginal',
    flowering: 'marginal',
    fruiting: 'marginal',
    mature: 'marginal',
  },
  capacity: { slotCount: 1, rootVolumePerSlot: 0.8 },
  environment: {
    moistureRetentionRate: 1.0,
    humidityLevel: 0.5,
    airflow: 0.5,
    weatherExposure: 0.7,
  },
  maintenance: { wateringFrequency: 1.0, forgiveness: 0.7 },
  risks: { moldRisk: 0.1, rootBoundRate: 0.02, transplantShockMultiplier: 1.0 },
  soilId: 'plot-full',
  state: { occupantPlantIds: ['plant-001'] },
};
