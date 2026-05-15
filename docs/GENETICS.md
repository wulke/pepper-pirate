# Pepper Pirate — Genetics System

> This document details the breeding and genetics system for Pepper Pirate. For overall game design context, see [PRD.md](./PRD.md).

---

## Overview

Breeding is the core mid-game engagement driver. Players cross two parent plants/seed lines to produce offspring with inherited traits and some controlled variance. The genetics system is the primary differentiator of this game — it's what turns pepper farming into pepper *bloodline building*.

---

## Design Principles

- The genetics system should be **mostly visible** to the player. Players should have clear expectations about likely outcomes, while still understanding that early generations may express variance.
- The system is **structured and learnable**, not purely random. Players should be able to follow reliable patterns and formulas while still chasing occasional exceptional results.
- Breeding has an **optional mini-game** that provides potential for improved results. Opting out uses base probabilities with no penalty.

---

## High-Level Requirements

- **Lineage is first-class.** Every seed with known ancestry should expose its lineage history to the player.
- **Known ancestry matters.** Seeds obtained from the wild or bought as unknown stock may be treated as a root of known history with no prior lineage data available.
- **Generation is record-relative.** "Generation" refers to how far a seed is from the root of its known lineage record, not how genetically advanced or stable it is.
- **Stability is not generation count.** A pepper can be stable at an early known generation if its lineage is consistent, and unstable at a later known generation if its ancestry is noisy or contradictory.
- **Multi-generation breeding is central.** Early generations are exploratory, mid generations are about reinforcing desirable traits, and later generations are about stabilizing a cultivar into a reliable line.
- **Trait expression should mature over time.** Crosses should not immediately reveal all enduring inherited characteristics. The player should expect clearer parental trait expression in later generations and true long-term stability only after repeated selection.
- **Lineage readability is required.** The UI must make it easy to answer: where did this seed come from, which traits are stable, which are still drifting, and what breeding decisions would improve stability.

---

## Traits

**Traits** are inherited characteristics that affect gameplay and market value. All traits follow the same inheritance, stability, and variance rules. Traits are split into two tiers for implementation priority.

### V1 Traits (MVP)

| Trait | Description | Gameplay Role |
|---|---|---|
| Scoville level | Capsaicin intensity / heat rating | Core progression metric and primary market value driver |
| Yield | How much a plant produces per harvest | Economic tension — breed for quality or quantity. Stabilizing a high-yield line is itself a breeding goal |
| Growing time | Duration from sprout to harvestable | Tempo management — fast cheap crops vs. slow valuable ones |
| Hardiness | Tolerance to cold and heat extremes | Gates which zones/climates a pepper can survive in. Becomes critical when seasons introduce varied environments |
| Drought resistance | How quickly water depletes and tolerance for missed watering | Reduces active tending burden — a quality-of-life trait players breed for to ease idle play |
| Flavor profile | Taste characteristics (sweet, smoky, fruity, earthy, citrus, etc.) | Required for sauce/processing recipes and market differentiation. May be multi-dimensional rather than a single value |
| Ratoon ability | Whether a plant produces multiple harvests per season or is one-and-done | Huge economic trait — a pepper that fruits 3 times per season vs. once is a major breeding target |

### V2 Traits (MVP+)

| Trait | Description | Gameplay Role |
|---|---|---|
| Plant size | Physical space the plant occupies in a plot | Farm layout optimization — large high-yield plants vs. compact plants you can pack densely |
| Wall thickness | Meaty vs. thin-walled fruit | Affects processing paths — thick walls for stuffing/drying, thin walls for powder/flakes |
| Pepper size | Small vs. large individual fruit | Processing ratios — more small peppers needed per sauce batch. Visual variety |
| Color | Red, orange, yellow, green, purple, chocolate, etc. | Market appeal, recipe requirements, cosmetic collection goal |
| Shape | Round, elongated, wrinkled, lantern, etc. | Market categories, visual variety, potential processing implications |
| Disease resistance | Susceptibility to pests and blight | Reduces tending burden at scale. Becomes important as farm grows and pest events increase |
| Soil adaptability | Tolerance for poor or varied soil types | Matters when unlocking new zones with different terrain. Reduces infrastructure investment needed |
| Capsaicin distribution | Where heat concentrates (placenta, walls, seeds) | Same scoville, different processing outcomes — adds nuance to sauce-making and product differentiation |
| Germination time | Duration from seed to sprout | Early-game tempo trait. Separated from growing time to add planning depth around planting schedules |

### Definitions

- **Generation** is the distance from the earliest known point in a seed's recorded lineage. A "gen 0" seed is the root of the currently known record, not necessarily a primitive or unstable plant.
- **Stability** measures how consistently a line expresses traits across its known lineage history. Consistent ancestry and repeated selective breeding increase stability; sporadic or chaotic ancestry lowers it.
- **Expression variance** is the amount of short-term trait deviation the player should expect from a seed or line. Low stability implies higher variance; high stability implies more reliable outcomes.

---

## Example Stability Model

- A jalapeno acquired as unknown stock may be represented as gen 0 while still being highly stable if it reliably expresses jalapeno traits.
- A new cross between two unrelated peppers may produce a gen 1 offspring with interesting traits but low stability.
- Repeatedly breeding unstable hybrids together does not automatically create a stable line.
- Stability improves when the player repeatedly selects for consistent outcomes and builds a coherent, well-documented bloodline.

## V1 Breeding Resolution

The current V1 breeding path is:

1. `F-FRUIT-001` resolves a fruit-level baseline from the two parent seed genomes at pollination.
2. `F-SEED-001` resolves each extracted seed from that fruit baseline with bounded sibling variance.
3. Stability affects reliability, while generation remains lineage bookkeeping only.

### Parent contribution

V1 uses a stability-weighted blend with a bounded maternal bias:

```text
baseMaternalWeight = 0.55
basePaternalWeight = 0.45

stabilityDelta = maternal.stability - paternal.stability
stabilityShift = clamp(stabilityDelta * 0.10, -0.05, 0.05)

maternalWeight = clamp(baseMaternalWeight + stabilityShift, 0.45, 0.60)
paternalWeight = 1 - maternalWeight
```

This keeps inheritance readable, gives the mother plant a slight identity pull, and lets the more stable parent influence the baseline a bit more without introducing hidden dominance logic.

### Stability resolution

Trait stability is resolved from both parent stability and parent agreement:

```text
agreement = 1 - normalizedDistance(maternal.inheritedValue, paternal.inheritedValue)
parentAvg = (maternal.stability + paternal.stability) / 2
```

Self-pollination provides a small reinforcement bonus. Divergent crosses apply a penalty even when both parents are individually stable. This keeps the core rule intact: stability follows coherence, not lineage length.

### Lock progression

V1 uses these trait stability tiers:

- `unstable`: `< 0.30`
- `drifting`: `0.30 - 0.59`
- `mostly_stable`: `0.60 - 0.84`
- `locked`: `>= 0.85`

The `locked` threshold is intentionally high so a destabilizing cross can knock a trait back into `mostly_stable`.

### Mutation and seed spread

V1 uses a hybrid mutation model:

- low continuous noise keeps stable lines from becoming completely static
- rarer discrete mutation events create occasional bigger jumps
- fruit-level `stabilityScore` and `varianceRange` control sibling spread
- per-trait stability inside `traitBaseline` can further tighten individual seed variance

### Scope boundary

V1 keeps one inheritance family across traits. Trait-family-specific dominance, recessive rules, and richer categorical inheritance are deferred.

For any trait that is not naturally scalar, the breeding system still needs a documented `normalizedDistance` or equivalent agreement adapter before the formula is fully implementation-ready.

---

## Open Questions

- What does the lineage viewer look like, and how does the player navigate parentage without it becoming cumbersome?
- Which parts of a seed's genetic profile are always visible vs. inferred vs. unlocked over time?
- How is stability surfaced numerically or visually to the player?
- What are the exact rules for inheritance, variance, mutation, and stability gain/loss across generations?
