# F-FRUIT-001 — Fruit Genetic Baseline Resolution (Brainstorm)

Status: **needs review** — brainstormed ideas, not yet approved for documentation

Related: [Formula Registry](../FORMULA-REGISTRY.md#f-fruit-001--fruit-genetic-baseline-resolution) | [Fruit Data Model](../data-models/FRUIT.md) | [Seed Data Model](../data-models/SEED.md) | [Genetics](../GENETICS.md)

---

## Why This Document Exists

The genetics system is the core differentiator of Pepper Pirate — it's what turns pepper farming into pepper *bloodline building*. The game's data model defines five core objects (Seed, Plot, Plant, Node, Fruit) with a clear generational flow: seeds grow into plants, plants produce nodes, nodes get pollinated, pollination creates fruits, and fruits contain the next generation of seeds.

The [Formula Registry](../FORMULA-REGISTRY.md) was created to track all gameplay formulas and their interdependencies as the game's simulation layer grows. Within that registry, `F-FRUIT-001` was identified as a key next formula to define because it sits at the center of the generational bridge — it's the moment where parent genetics merge to produce offspring. Every other breeding-related formula either feeds into it (parent trait data, stability) or consumes its output (per-seed variance via F-SEED-001, rarity elevation via F-SEED-003).

The [Fruit data model](../data-models/FRUIT.md) already defines the *shape* of the output (`genetics.traitBaseline`, `genetics.stabilityScore`, `genetics.varianceRange`) and the [Seed data model](../data-models/SEED.md) defines the per-trait genome structure (`TraitGenome` with `inheritedValue`, `stability`, `variance`, `lockState`, `inheritanceSource`). But the actual *math* — how two parent seeds combine into a fruit's genetic baseline — has been `TBD` since both models were written. This document captures the initial brainstorm exploring that math.

The [Genetics doc](../GENETICS.md) establishes several design constraints that this formula must respect:
- **Stability is not generation count.** A pepper can be stable early if its lineage is consistent, and unstable late if its ancestry is noisy.
- **Multi-generation breeding is central.** Early generations are exploratory, mid generations reinforce, later generations stabilize.
- **The system is structured and learnable**, not purely random. Players follow reliable patterns while chasing occasional exceptional results.
- **Breeding has an optional mini-game** that provides potential for improved results without penalty for skipping.

The [Breeding Flow](../process-flows/breeding-flow.md) shows the player-facing process: select parents, preview predicted outcomes, optionally play a mini-game, generate offspring. This formula is the engine behind that "generate offspring" step.

---

## What This Formula Produces

At pollination time, F-FRUIT-001 takes two parent seeds (or one, for self-pollination) and outputs the fruit's genetic baseline:

1. **`traitBaseline`** — per-trait `TraitGenome` for the fruit (merged from parents)
2. **`stabilityScore`** — aggregate stability of this fruit's genetic profile
3. **`varianceRange`** — how far seeds can deviate from the baseline

These three values are the contract that F-SEED-001 (per-seed variance) consumes later at extraction time.

---

## Sub-Problem 1: Trait Value Inheritance

How do parent trait values combine for each trait? This is the most fundamental question — every other sub-problem depends on it. The Seed data model's `TraitGenome` type already has an `inheritanceSource` block with `maternalWeight`, `paternalWeight`, and `mutationWeight` fields, which implies a weighted contribution model, but the actual combination logic hasn't been defined.

### Option A: Weighted Average with Noise (recommended for V1)

```
fruitTraitValue = (maternalWeight * maternal.inheritedValue)
                + (paternalWeight * paternal.inheritedValue)
                + mutationNoise
```

Where `maternalWeight + paternalWeight + mutationWeight = 1.0`. Simple, tunable. The `inheritanceSource` block on `TraitGenome` already has slots for these three weights.

### Option B: Dominant/Recessive Model

One parent's value "wins" based on a dominance hierarchy per trait. More complex, more biological, but adds a hidden layer the player has to discover through experimentation. Better suited for V2+.

### Option C: Blended with Trait-Specific Rules

Some traits blend (Scoville = average), some traits pick one parent (flavor profile = one of the two), some traits are min/max (hardiness = higher of the two). More realistic but harder to learn.

### Weight Determination (if using Option A)

Several sub-options for how the maternal/paternal weights are set:

- **Fixed 50/50** — simplest, fully predictable
- **Slight maternal bias** (e.g., 55/45) — real-world pepper genetics lean maternal
- **Per-trait randomized** within a range (e.g., 40-60%) — adds variance without dominance complexity
- **Influenced by parent stability** — the more stable parent exerts more pull on that trait

---

## Sub-Problem 2: Per-Trait Stability Resolution

How does the fruit's per-trait stability derive from the parents' stabilities? This matters because stability is the primary lever that controls seed variance (via F-SEED-001) and is a core design pillar: "stability is not generation count." The Genetics doc explicitly states that a pepper can be stable at an early generation if its lineage is consistent, and unstable at a later generation if its ancestry is noisy. The formula here needs to mechanically enforce that — stability must be *earned* through consistent selection, not given automatically by breeding more generations.

### Design Principles

**What makes stability go up?**
- Parents have similar trait values (reinforcement)
- Parents both have high stability for that trait (consistent lineage)
- Self-pollination (no new genetic material introduced)

**What makes stability go down?**
- Parents have divergent trait values (contradictory signals)
- Cross-pollination between unrelated lines
- One or both parents have low stability

### Proposed Shape

```
parentAgreement = 1 - |maternal.inheritedValue - paternal.inheritedValue|
                      // normalized to trait range

parentStabilityAvg = (maternal.stability + paternal.stability) / 2

fruitTraitStability = parentStabilityAvg * parentAgreement
```

This means:
- Two stable parents that agree --> high fruit stability (reinforcement)
- Two stable parents that disagree --> medium stability (stable but conflicting signals)
- Two unstable parents --> low stability regardless of agreement
- Self-pollination --> `parentAgreement = 1.0`, so stability preserves at `parentStabilityAvg`

> **Review flag:** This formula can only hold or *decrease* stability — it has no mechanism to increase it. When `parentAgreement = 1.0` (self-pollination), the result equals `parentStabilityAvg`, which is the same parent's stability echoed back. Over many self-pollinated generations, stability flatlines rather than climbing toward `locked`. If self-pollination is meant to be a viable (slow) path to a locked cultivar (see [Sub-Problem 3](#sub-problem-3-self-vs-cross-pollination-differences)), the formula needs a reinforcement bonus — something like `min(1.0, parentStabilityAvg * parentAgreement + reinforcementBonus)` where the bonus is small and only kicks in when agreement is high. But adding a reinforcement bonus introduces its own question: how fast should stability climb, and does that make self-pollination too easy compared to selective cross-breeding?
>
> **Prompt to explore:** *If a player self-pollinates the same line for 10 generations, what should the stability curve look like — and at what generation should they realistically reach `locked`? Walk through the math with a concrete starting stability (e.g., 0.4) and compare the current formula vs a reinforcement-bonus version.*

---

## Sub-Problem 3: Self vs Cross Pollination Differences

The Node data model defines three pollination fates: self-pollinate, cross as female (receives pollen), or cross as male (donates pollen, consumed). Self-pollination is the default if the player doesn't intervene before the pollination window closes. This means the formula needs to handle both cases, and they should feel fundamentally different to create the core risk/reward tension in breeding:

| | Self-Pollination | Cross-Pollination |
|---|---|---|
| Trait values | Pass through (same source) | Blend from two parents |
| Stability | Preserves or slightly increases | Disrupted proportional to parent divergence |
| Variance | Narrow (safe) | Wider (risky) |
| Ceiling | Limited by existing genetics | Can discover new trait combinations |
| Player role | "Reinforce what I have" | "Explore new possibilities" |

For self-pollination, the formula simplifies: `parentAgreement` is always 1.0, maternal and paternal are the same seed, so the fruit baseline is essentially the seed's own genetics with a small mutation chance. Stability holds or ticks up slightly.

---

## Sub-Problem 4: Mutation

Without some source of randomness, self-pollination across many generations would converge to identical seeds with no surprises — the genetics system would feel "dead" once a line stabilizes. Mutation is a small random perturbation that keeps genetics alive and creates the possibility of unexpected discoveries even in established lines. It also ties into the Genetics doc's requirement that the system should offer "occasional exceptional results" alongside reliable patterns.

```
mutationChance = BASE_MUTATION_RATE * (1 - traitStability)
// Higher stability --> lower mutation chance

if mutation occurs:
  mutationMagnitude = random within MUTATION_RANGE * (1 - traitStability)
  fruitTraitValue += mutationMagnitude (positive or negative)
```

Stable lines are resistant to mutation (predictable). Unstable lines are more volatile (higher discovery potential).

> **Review flag:** This mutation system is the implementation of the `mutationNoise` term in [Sub-Problem 1's formula](#option-a-weighted-average-with-noise-recommended-for-v1), but the two are described separately and don't explicitly connect. In the inheritance formula, `mutationNoise` appears as a third additive term alongside the weighted parent contributions (`maternalWeight + paternalWeight + mutationWeight = 1.0`). Here, mutation is a conditional event with its own chance roll and magnitude. These are two different mechanics: one always contributes a small noise floor scaled by `mutationWeight`, the other fires probabilistically. The final formula needs to pick one model or clarify how they compose — e.g., does `mutationWeight` in `inheritanceSource` represent the *expected* contribution from the probabilistic mutation system, or is it a separate constant noise term?
>
> **Prompt to explore:** *Should mutation be a constant small noise term on every inheritance (the `mutationWeight` share from Sub-Problem 1), a probabilistic event that fires occasionally with larger effect (the chance/magnitude model here), or both layered together — and what does each approach mean for how "alive" a stable vs unstable line feels across 5-10 generations?*

---

## Sub-Problem 5: Overall stabilityScore and varianceRange

The Fruit data model defines `stabilityScore` and `varianceRange` as fruit-level fields that F-SEED-001 consumes at seed extraction time. But the per-trait stability values from Sub-Problem 2 are granular — one per trait. These fruit-level aggregates bridge that gap, collapsing per-trait detail into the two numbers that control how tight or wide the seed spread will be:

```
stabilityScore = weightedAverage(fruitTraitStability for each trait)
// possibly weighted by trait significance or uniformly

varianceRange = MAX_VARIANCE * (1 - stabilityScore)
// high stability --> tight variance, low stability --> wide variance
```

`varianceRange` is what F-SEED-001 uses to determine how much individual seeds diverge from the fruit baseline.

> **Review flag:** Collapsing per-trait stabilities into a single `stabilityScore` and deriving one `varianceRange` means all traits on a fruit vary by the same amount. In practice, a fruit could be very stable on Scoville (parents agreed, both locked) but unstable on yield (parents diverged). A single variance range flattens that — the stable Scoville still drifts as much as the unstable yield. An alternative is for [F-SEED-001](../FORMULA-REGISTRY.md#f-seed-001--per-seed-variance-resolution) to consume per-trait stability directly rather than the fruit-level aggregate, applying tighter variance to stable traits and wider variance to unstable ones. The tradeoff: per-trait variance is richer but more complex to implement and harder to surface to the player.
>
> **Prompt to explore:** *Should F-SEED-001 use per-trait stability to compute per-trait variance ranges, or is a single fruit-level varianceRange sufficient for V1? What does the player lose in breeding legibility if a trait they've stabilized over many generations still drifts as much as one they just introduced through a cross?*

---

## Sub-Problem 6: Mini-Game Bonus

The [Breeding Flow](../process-flows/breeding-flow.md) includes an optional mini-game step between parent selection and offspring generation. The Genetics doc specifies that "opting out uses base probabilities with no penalty" — the mini-game provides *potential* upside, never downside. The question is where in the F-FRUIT-001 formula that bonus plugs in, which determines what kind of control the player gains from active play:

### Options

- **Shift weights** — good mini-game performance lets the player bias toward the preferred parent
- **Stability bonus** — good performance adds a flat stability bump to the fruit
- **Mutation steering** — good performance lets mutations tend toward a player-chosen direction
- **Variance tightening** — good performance narrows the variance range on the fruit

### Initial Recommendation

A combination of **weight influence + stability bonus** — the player gets more control over which parent dominates AND the offspring is slightly more stable than the math alone would produce.

---

## Open Design Questions

These need decisions before the formula can be finalized. Each question represents a design tradeoff that affects how breeding *feels* to the player — the math shapes whether breeding is predictable or surprising, whether active play matters a lot or a little, and how many generations it takes to stabilize a line:

1. **Weight model** — should V1 be fixed 50/50, slight maternal bias, or per-trait randomized? This determines how "same" two sibling fruits from identical parents feel.

2. **Stability inheritance curve** — does the `parentAgreement * parentStabilityAvg` shape feel right? Or should stability have a harder time increasing (e.g., asymmetric — easy to lose, slow to gain)?

3. **Self-pollination stability gain** — should self-pollinating explicitly *increase* stability over generations, or just preserve it? If it increases, how fast? This determines whether pure self-pollination is a viable (if slow) path to a locked cultivar.

4. **Mutation rate** — should mutation be rare-but-impactful or frequent-but-small? This sets the feel for how "alive" genetics feel across generations.

5. **Mini-game scope for V1** — how much should the mini-game influence the formula? Subtle nudge or meaningful lever?

6. **lockState resolution** — the [`TraitGenome`](../data-models/SEED.md#supporting-types) type includes a `lockState` field (`"unstable" | "drifting" | "mostly_stable" | "locked"`) that this formula needs to resolve for each trait on the fruit. It's likely derived from the computed `fruitTraitStability` via threshold bands (e.g., 0-0.25 = unstable, 0.25-0.5 = drifting, 0.5-0.8 = mostly_stable, 0.8+ = locked), but this output isn't addressed in any of the sub-problems above. The thresholds directly affect how many generations it takes to reach `locked` and how easily a cross can knock a trait back down.

> **Prompt to explore:** *What stability thresholds should map to each lockState tier, and should the thresholds be symmetric (same distance to climb up as to fall down) or asymmetric (harder to reach `locked`, easier to lose it from a destabilizing cross)?*
