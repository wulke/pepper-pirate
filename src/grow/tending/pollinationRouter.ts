import type { PepperNode } from '../../types/node.js';
import type { Plant } from '../../types/plant.js';
import type { BreedRoutingRequestedEvent } from '../../types/events.js';

/**
 * Checks whether a node has entered its pollination window and, if so, emits a
 * BREED_ROUTING_REQUESTED event via the caller-supplied emit function.
 *
 * The GROW domain's responsibility ends at emission. The node's state is never advanced here —
 * progression past pollination_window requires a response from the BREED domain.
 * Does not mutate the node or plant.
 * @remarks Implements GROW-006. emit is injected by the caller; tests pass a spy.
 */
export function routePollinationIfReady(
  node: PepperNode,
  plant: Plant,
  emit: (event: BreedRoutingRequestedEvent) => void
): void {
  if (node.state.status !== 'pollination_window') return;

  const pollinationWindowEnd = node.timing.pollinationWindowEnd;
  if (pollinationWindowEnd === undefined) return;

  emit({
    type: 'BREED_ROUTING_REQUESTED',
    nodeId: node.id,
    plantId: plant.id,
    pollinationWindowEnd,
  });
}
