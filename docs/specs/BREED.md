# BREED — Breeding and Genetics Specifications

Status: `draft`
@source: [breeding-flow.md](../process-flows/breeding-flow.md), [GENETICS.md](../GENETICS.md)

---

## Pollination

### BREED-001
WHEN a flowering node is selected for pollination, the game shall require the player to designate a maternal node before any pollination parameters are resolved.

### BREED-002
WHEN a player has selected a maternal node and (optionally) a donor node, the game shall display a pollination preview showing likely trait ranges and a stability estimate — before the player confirms.

> **Testable:** The preview must be shown and must be dismissible; it must not skip directly to resolution.

### BREED-003
WHEN confirming pollination, the game shall offer the breeding mini-game as optional. Skipping the mini-game shall apply base probabilities. The player shall not be penalized for skipping.

### BREED-004
WHEN pollination is confirmed, the game shall create a fruit object on the maternal plant before any seeds are available for extraction.

> **Testable:** Seeds cannot exist in inventory from a pollination event until the fruit has been harvested and extraction chosen.

### BREED-005
WHEN a fruit is created from a pollination event, the game shall record both the maternal and paternal seed lineage on that fruit's lineage field.

---

## Genetics and Stability

### BREED-006
The game shall compute offspring stability from parental agreement and parent stability averages — not from generation count or age.

> **Testable:** Two gen-1 parents with identical trait values must be able to produce higher offspring stability than two gen-5 parents with divergent trait values.

### BREED-007
WHEN two genetically distant parents are crossed, the game shall apply a stability penalty to the resulting fruit baseline even if both individual parents are highly stable.

### BREED-008
WHEN a plant is self-pollinated, the game shall apply a small reinforcement bonus to the resulting fruit's stability score compared to an equivalent cross-pollination.

### BREED-009
The game shall classify trait stability into four tiers: `unstable` (< 0.30), `drifting` (0.30–0.59), `mostly_stable` (0.60–0.84), and `locked` (≥ 0.85).

> **Testable:** Each tier boundary must be enforced at resolution time; a trait at exactly 0.85 must be `locked`.

### BREED-010
WHEN a trait reaches `locked` status, the game shall allow a subsequent destabilizing cross to reduce that trait back to `mostly_stable`.

---

## Seed Extraction and Trait Revelation

### BREED-011
WHEN seeds are extracted from a harvested fruit, the game shall apply per-seed variance bounded by the fruit's `stabilityScore` and `varianceRange` to produce distinct sibling seeds.

### BREED-012
WHEN seeds are extracted, the game shall reveal an initial subset of visible traits. Some traits shall remain hidden or uncertain until the seed is grown to maturity or through multiple generations.

> **Testable:** At least one trait category must be in a hidden or uncertain state immediately after extraction from a first-generation cross.

---

## Lineage Visibility

### BREED-013
The game shall expose full lineage history for every seed with known ancestry, including generation depth, parent identities, and per-trait stability status.

### BREED-014
WHEN a seed's ancestry is unknown (wild or purchased stock), the game shall treat that seed as generation 0 with no prior lineage data — and shall not infer or fabricate ancestry.
