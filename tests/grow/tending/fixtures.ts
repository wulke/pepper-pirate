import type { Plant, StatusEffect } from '../../../src/types/plant.js';
import type { PepperNode } from '../../../src/types/node.js';

/** Plant with autoTend on and careScore at 0 — baseline for GROW-004 neglect tests. */
export const neglectedAutoTendPlant: Plant = {
  id: 'plant-neglected-autotend',
  sourceSeedId: 'seed-001',
  placement: { plotId: 'plot-001', plantedAtSeason: 1 },
  growth: { stage: 'vegetative', progress: 0.3, totalGrowthProgress: 0.3 },
  health: { waterLevel: 0.7, soilQuality: 0.7, sunlightExposure: 0.8, overallHealth: 0.7, activeEffects: [] },
  nodeIds: [],
  tending: { autoTendEnabled: true, careScore: 0.0 },
  harvest: { totalFruitsProduced: 0, ratoonsRemaining: 2, canRatoon: true },
};

/** Plant with autoTend on and careScore already at the floor — tests stable equilibrium. */
export const autoTendAtFloorPlant: Plant = {
  id: 'plant-autotend-floor',
  sourceSeedId: 'seed-001',
  placement: { plotId: 'plot-001', plantedAtSeason: 1 },
  growth: { stage: 'vegetative', progress: 0.3, totalGrowthProgress: 0.3 },
  health: { waterLevel: 0.7, soilQuality: 0.7, sunlightExposure: 0.8, overallHealth: 0.7, activeEffects: [] },
  nodeIds: [],
  tending: { autoTendEnabled: true, careScore: 0.40 },
  harvest: { totalFruitsProduced: 0, ratoonsRemaining: 2, canRatoon: true },
};

/** Plant at baseline careScore with low water — watering qualifies as a real need. */
export const lowWaterPlant: Plant = {
  id: 'plant-low-water',
  sourceSeedId: 'seed-001',
  placement: { plotId: 'plot-001', plantedAtSeason: 1 },
  growth: { stage: 'vegetative', progress: 0.3, totalGrowthProgress: 0.3 },
  health: { waterLevel: 0.15, soilQuality: 0.7, sunlightExposure: 0.8, overallHealth: 0.6, activeEffects: [] },
  nodeIds: [],
  tending: { autoTendEnabled: false, careScore: 0.40 },
  harvest: { totalFruitsProduced: 0, ratoonsRemaining: 2, canRatoon: true },
};

/** Plant at baseline careScore with poor soil quality — soil-check qualifies as a real need. */
export const poorSoilPlant: Plant = {
  id: 'plant-poor-soil',
  sourceSeedId: 'seed-001',
  placement: { plotId: 'plot-001', plantedAtSeason: 1 },
  growth: { stage: 'vegetative', progress: 0.3, totalGrowthProgress: 0.3 },
  health: { waterLevel: 0.7, soilQuality: 0.15, sunlightExposure: 0.8, overallHealth: 0.6, activeEffects: [] },
  nodeIds: [],
  tending: { autoTendEnabled: false, careScore: 0.40 },
  harvest: { totalFruitsProduced: 0, ratoonsRemaining: 2, canRatoon: true },
};

const activePestEffect: StatusEffect = {
  type: 'pest',
  severity: 0.6,
  appliedAtTick: 100,
};

/** Plant with an active pest effect — pest-control qualifies as a real need. */
export const plantWithPest: Plant = {
  id: 'plant-with-pest',
  sourceSeedId: 'seed-001',
  placement: { plotId: 'plot-001', plantedAtSeason: 1 },
  growth: { stage: 'vegetative', progress: 0.3, totalGrowthProgress: 0.3 },
  health: { waterLevel: 0.7, soilQuality: 0.7, sunlightExposure: 0.8, overallHealth: 0.5, activeEffects: [activePestEffect] },
  nodeIds: [],
  tending: { autoTendEnabled: false, careScore: 0.40 },
  harvest: { totalFruitsProduced: 0, ratoonsRemaining: 2, canRatoon: true },
};

/** Plant at baseline careScore with high water — watering addresses no real need; no bonus expected. */
export const wellWateredPlant: Plant = {
  id: 'plant-well-watered',
  sourceSeedId: 'seed-001',
  placement: { plotId: 'plot-001', plantedAtSeason: 1 },
  growth: { stage: 'vegetative', progress: 0.3, totalGrowthProgress: 0.3 },
  health: { waterLevel: 0.90, soilQuality: 0.8, sunlightExposure: 0.8, overallHealth: 0.85, activeEffects: [] },
  nodeIds: [],
  tending: { autoTendEnabled: false, careScore: 0.40 },
  harvest: { totalFruitsProduced: 0, ratoonsRemaining: 2, canRatoon: true },
};

/** Plant that owns the pollination-window node below. */
export const pollinationPlant: Plant = {
  id: 'plant-poll-001',
  sourceSeedId: 'seed-001',
  placement: { plotId: 'plot-001', plantedAtSeason: 1 },
  growth: { stage: 'flowering', progress: 0.7, totalGrowthProgress: 0.55 },
  health: { waterLevel: 0.7, soilQuality: 0.7, sunlightExposure: 0.8, overallHealth: 0.7, activeEffects: [] },
  nodeIds: ['node-poll-001'],
  tending: { autoTendEnabled: false, careScore: 0.40 },
  harvest: { totalFruitsProduced: 0, ratoonsRemaining: 2, canRatoon: true },
};

/** Node in the active pollination window — triggers GROW-006 routing. */
export const pollinationWindowNode: PepperNode = {
  id: 'node-poll-001',
  plantId: 'plant-poll-001',
  state: { status: 'pollination_window', progress: 0.3 },
  pollination: { type: 'pending' },
  fruitId: null,
  timing: { appearedAtTick: 50, pollinationWindowStart: 70, pollinationWindowEnd: 120 },
};

/** Node still in the flowering stage — not yet in the pollination window; no event expected. */
export const floweringNode: PepperNode = {
  id: 'node-flowering-001',
  plantId: 'plant-poll-001',
  state: { status: 'flowering', progress: 0.5 },
  pollination: { type: 'pending' },
  fruitId: null,
  timing: { appearedAtTick: 50 },
};
