/**
 * F-TEND-001: maps careScore to tendingModifier using a breakpoint at 0.40.
 * Band: 0.90 (neglect, careScore=0) → 1.00 (idle baseline, careScore=0.40) → 1.15 (peak, careScore=1.0).
 * Single source of truth — imported by autoTend and activeTend.
 */
export function computeTendingModifier(careScore: number): number {
  const FLOOR = 0.40;
  if (careScore <= FLOOR) {
    return 0.90 + 0.25 * careScore;
  }
  return 1.00 + 0.15 * ((careScore - FLOOR) / 0.60);
}
