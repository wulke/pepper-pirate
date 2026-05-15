import type { Plot } from '../../types/plot.js';

/** Returned by plotAvailability. Narrows on `outcome` before reading `nextAction`. */
export type PlotAvailabilityResult =
  | { outcome: 'plot_available'; plotId: string }
  | { outcome: 'no_open_plots'; nextAction: 'purchase' | 'unlock' };

/**
 * Determines whether the player has any plot with an open slot for a new plant.
 * Returns the first available plot ID, or a no-open-plots result with the recommended next action.
 *
 * Does not mutate any plot.
 * @remarks Implements GROW-003. Plot unlock gating (purchase vs. unlock) is a V1 stub — always returns 'purchase'.
 */
export function plotAvailability(plots: readonly Plot[]): PlotAvailabilityResult {
  for (const plot of plots) {
    if (plot.state.occupantPlantIds.length < plot.capacity.slotCount) {
      return { outcome: 'plot_available', plotId: plot.id };
    }
  }
  // TODO: distinguish 'purchase' vs 'unlock' once plot progression data (campaign state, zone unlocks) is available.
  return { outcome: 'no_open_plots', nextAction: 'purchase' };
}
