import { describe, it, expect, vi } from 'vitest';
import { routePollinationIfReady } from '../../../src/grow/tending/pollinationRouter.js';
import type { BreedRoutingRequestedEvent } from '../../../src/types/events.js';
import { pollinationWindowNode, floweringNode, pollinationPlant } from './fixtures.js';

describe('GROW-006', () => {
  it('emits a BREED_ROUTING_REQUESTED event when a node enters its pollination window', () => {
    const emit = vi.fn<[BreedRoutingRequestedEvent], void>();
    routePollinationIfReady(pollinationWindowNode, pollinationPlant, emit);
    expect(emit).toHaveBeenCalledOnce();
  });

  it('includes nodeId, plantId, and pollinationWindowEnd in the emitted event payload', () => {
    const emit = vi.fn<[BreedRoutingRequestedEvent], void>();
    routePollinationIfReady(pollinationWindowNode, pollinationPlant, emit);
    const event = emit.mock.calls[0]?.[0];
    expect(event?.type).toBe('BREED_ROUTING_REQUESTED');
    expect(event?.nodeId).toBe(pollinationWindowNode.id);
    expect(event?.plantId).toBe(pollinationPlant.id);
    expect(event?.pollinationWindowEnd).toBe(pollinationWindowNode.timing.pollinationWindowEnd);
  });

  it('does not advance the node past pollination_window without a breed-domain response', () => {
    const emit = vi.fn<[BreedRoutingRequestedEvent], void>();
    routePollinationIfReady(pollinationWindowNode, pollinationPlant, emit);
    expect(pollinationWindowNode.state.status).toBe('pollination_window');
  });

  it('does not emit an event for a node not yet in its pollination window', () => {
    const emit = vi.fn<[BreedRoutingRequestedEvent], void>();
    routePollinationIfReady(floweringNode, pollinationPlant, emit);
    expect(emit).not.toHaveBeenCalled();
  });
});
