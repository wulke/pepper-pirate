import { describe, it, expect } from 'vitest';
import { plotAvailability } from '../../../src/grow/planting/plotAvailability.js';
import { emptyPlot, fullPlot } from './fixtures.js';

describe('GROW-003', () => {
  it('returns a no-open-plots result when all plots are occupied', () => {
    const result = plotAvailability([fullPlot]);
    expect(result.outcome).toBe('no_open_plots');
  });

  it('returns nextAction: purchase in the no-open-plots result for V1', () => {
    const result = plotAvailability([fullPlot]);
    if (result.outcome === 'no_open_plots') {
      expect(result.nextAction).toBe('purchase');
    }
  });

  it('does not attempt to plant the seed when no plots are available', () => {
    const occupantsBefore = fullPlot.state.occupantPlantIds.length;
    plotAvailability([fullPlot]);
    expect(fullPlot.state.occupantPlantIds.length).toBe(occupantsBefore);
  });

  it('returns a plot-available result when at least one plot has an open slot', () => {
    const result = plotAvailability([fullPlot, emptyPlot]);
    expect(result.outcome).toBe('plot_available');
    if (result.outcome === 'plot_available') {
      expect(result.plotId).toBe(emptyPlot.id);
    }
  });
});
