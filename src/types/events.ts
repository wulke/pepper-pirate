/**
 * Emitted by the GROW domain when a flowering node enters its pollination window.
 * The BREED domain listens for this event and handles cross-pollination routing.
 * The GROW domain's responsibility ends at emission — it does not call any BREED module directly.
 * @remarks Emitted by src/grow/tending/pollinationRouter.ts. Consumed by the BREED domain (future).
 */
export type BreedRoutingRequestedEvent = {
  type: 'BREED_ROUTING_REQUESTED';
  /** The node that entered its pollination window. */
  nodeId: string;
  /** The plant that owns the node. */
  plantId: string;
  /** Tick when the window closes and self-pollination occurs if no breed-domain response arrives. */
  pollinationWindowEnd: number;
};
