# F-FRUIT-001 — V1 Proposal

Status: **proposed** — review-ready V1 recommendation aligned to the current registry

Related: [Formula Registry](../FORMULA-REGISTRY.md#f-fruit-001--fruit-genetic-baseline-resolution) | [Review Pass 2026-04-14](./F-FRUIT-001-review-pass-20260414.md) | [Fruit](../data-models/FRUIT.md#genetics) | [Seed](../data-models/SEED.md#supporting-types) | [Genetics](../GENETICS.md)

---

## Purpose

`F-FRUIT-001` resolves the fruit's genetic baseline at pollination. It is the bridge between parent seed genomes and later per-seed resolution in `F-SEED-001`.

V1 should answer one question only: given the parent genomes and pollination context, what baseline genetic profile does this fruit carry forward, and how stable is that profile for the next generation?

## Inputs

- maternal seed genetics
- paternal seed genetics
- pollination context (`self` or `cross`)
- trait ranges needed to normalize parent distance

## Outputs

- `Fruit.genetics.traitBaseline`
- `Fruit.genetics.stabilityScore`
- `Fruit.genetics.varianceRange`

Within each `traitBaseline[TraitKey]`, V1 resolves:

- `inheritedValue`
- `stability`
- `variance`
- `lockState`
- `inheritanceSource`

## Parent contribution rule

Use a stability-weighted blend with a bounded maternal bias:

```text
baseMaternalWeight = 0.55
basePaternalWeight = 0.45

stabilityDelta = maternal.stability - paternal.stability
stabilityShift = clamp(stabilityDelta * 0.10, -0.05, 0.05)

maternalWeight = clamp(baseMaternalWeight + stabilityShift, 0.45, 0.60)
paternalWeight = 1 - maternalWeight

baselineValue = maternalWeight * maternal.inheritedValue
              + paternalWeight * paternal.inheritedValue
```

For self-pollination, the fruit copies the parent baseline value before mutation handling.

## Stability rule

Per trait:

```text
agreement = 1 - normalizedDistance(maternal.inheritedValue, paternal.inheritedValue)
parentAvg = (maternal.stability + paternal.stability) / 2

reinforcementBonus =
  if self-pollination: 0.08
  else if agreement >= 0.90: 0.05
  else if agreement >= 0.75: 0.02
  else 0.00

divergencePenalty =
  if agreement >= 0.75: 0.00
  else (0.75 - agreement) * 0.40

fruitTraitStability = clamp(
  parentAvg
  + reinforcementBonus * (1 - parentAvg)
  - divergencePenalty,
  0,
  1
)
```

Fruit-level summary:

```text
stabilityScore = average(fruitTraitStability across resolved traits)
varianceRange = MAX_VARIANCE * (1 - stabilityScore)
```

This keeps stability tied to trait coherence, not lineage length.

## Mutation rule

Use a hybrid model:

```text
microNoise = random(-0.15, +0.15) * traitRange * (1 - fruitTraitStability) * 0.15

mutationChance = 0.02 + 0.08 * (1 - fruitTraitStability)
if discrete mutation triggers:
  mutationDelta = random(-0.5, +0.5) * traitRange * (1 - fruitTraitStability)
else:
  mutationDelta = 0

finalInheritedValue = baselineValue + microNoise + mutationDelta
```

Stable lines remain mostly reliable. Unstable lines get broader discovery space.

## `lockState` resolution

Map per-trait stability to tiers with an asymmetric top threshold:

- `unstable`: `< 0.30`
- `drifting`: `0.30 - 0.59`
- `mostly_stable`: `0.60 - 0.84`
- `locked`: `>= 0.85`

This keeps `locked` meaningful and allows a divergent cross to knock a trait back to `mostly_stable`.

## What exactly `F-SEED-001` consumes

`F-SEED-001` should consume:

- `Fruit.genetics.traitBaseline` as the starting genome for each seed
- `Fruit.genetics.stabilityScore` as the fruit-wide spread control
- `Fruit.genetics.varianceRange` as the fruit-wide maximum deviation

In practice, `F-SEED-001` should also inspect `traitBaseline[trait].stability` so stable traits can drift less than unstable ones without expanding the V1 registry contract.

Suggested per-trait seed variance cap:

```text
traitVarianceCap = varianceRange * (1 - 0.5 * traitBaseline[trait].stability)
```

## Worked examples

Example 1: selfing a middling line

```text
starting trait stability = 0.40

G1 self -> 0.448
G2 self -> 0.492
G3 self -> 0.533
G5 self -> 0.604
```

Result: the line climbs from `drifting` into `mostly_stable`, but not quickly enough to trivialize lock progression.

Example 2: close-line cross

```text
maternal value/stability = 0.62 / 0.74
paternal value/stability = 0.66 / 0.70

agreement = 0.96
parentAvg = 0.72
fruitTraitStability = 0.734
```

Result: the cross remains coherent and slightly reinforces the line while still mixing parent values.

Example 3: destabilizing cross from a locked trait

```text
maternal value/stability = 0.80 / 0.90
paternal value/stability = 0.30 / 0.88

agreement = 0.50
parentAvg = 0.89
divergencePenalty = 0.10
fruitTraitStability = 0.79
```

Result: the trait falls from `locked` to `mostly_stable`, preserving the tradeoff between exploration and reliability.

## Open Questions Still Worth Review

- How should categorical or multi-dimensional traits compute `normalizedDistance` and `agreement` in V1?
- Should the breeding mini-game affect parent weights, reinforcement bonus, or only preview confidence?
- Is the proposed selfing reinforcement rate slow enough to preserve selective cross-breeding as a meaningful path?

## Registry impact

No immediate registry change is required for this V1 proposal.

The current registry is workable if `traitBaseline` is understood as a `TraitGenome` carrier and `F-SEED-001` is allowed to read per-trait stability from it. If the project wants explicit per-trait variance control later, the registry should be expanded rather than leaving that richer contract implicit.
