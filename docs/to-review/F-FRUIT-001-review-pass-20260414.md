# F-FRUIT-001 — Review Pass 2026-04-14

Status: **review pass** — answers Prompts 1 through 3 from [F-FRUIT-001-agent-prompts.md](./F-FRUIT-001-agent-prompts.md)

Related: [Brainstorm](./F-FRUIT-001-brainstorm.md) | [Formula Registry](../FORMULA-REGISTRY.md#f-fruit-001--fruit-genetic-baseline-resolution) | [Fruit](../data-models/FRUIT.md#genetics) | [Seed](../data-models/SEED.md#supporting-types) | [Genetics](../GENETICS.md)

---

## Prompt 1 — Define the V1 Contract Boundary

### 1. V1 contract

`F-FRUIT-001` should stay narrow in V1. At pollination / fruit creation, it should:

- resolve a per-trait baseline genome for the fruit in `Fruit.genetics.traitBaseline`
- resolve a fruit-level aggregate `Fruit.genetics.stabilityScore`
- resolve a fruit-level `Fruit.genetics.varianceRange` derived from that aggregate

Inside each `traitBaseline[TraitKey]`, V1 should resolve these `TraitGenome` fields because the data model already implies them:

- `inheritedValue`
- `stability`
- `variance`
- `lockState`
- `inheritanceSource`

That gives `F-SEED-001` one canonical baseline object per trait plus two fruit-level controls. In V1, `F-SEED-001` should consume:

- `traitBaseline` as the seed starting genome
- `stabilityScore` as the main spread-tightening scalar
- `varianceRange` as the global upper bound on per-seed divergence

The registry outputs are sufficient for a V1 if `F-SEED-001` is allowed to read the per-trait `TraitGenome` values already embedded inside `Fruit.genetics.traitBaseline`.

### 2. Assumptions and simplifications

- V1 should use a single inheritance rule across all V1 traits: weighted blend, not dominance and not trait-specific inheritance families.
- V1 should treat self-pollination as the same formula path with `maternal = paternal`, plus a small reinforcement bonus.
- `stabilityScore` should be an aggregate summary for sibling spread, not the only source of truth for trait-level stability.
- `varianceRange` should remain fruit-level in V1 for registry simplicity, even though that flattens some nuance.
- The brainstorm implies a richer per-trait contract than the registry explicitly states because `lockState`, per-trait `stability`, and per-trait `variance` are all operationally important but only indirectly represented through `traitBaseline`.

### 3. Deferred behaviors for V2+

- dominance / recessive logic
- trait-family-specific inheritance rules
- per-trait fruit-level variance ranges as explicit registry outputs
- mini-game steering beyond small bounded bonuses
- hidden-trait specific mutation behavior
- lineage-history-aware formulas that inspect more than the immediate parent genomes

### 4. Registry impact

No registry change is strictly required for the recommended V1.

Why:

- `Fruit.genetics.traitBaseline` already points to `TraitGenome`-shaped per-trait data, which can carry `stability`, `variance`, and `lockState`.
- `F-SEED-001` already reads `traitBaseline`, `stabilityScore`, and `varianceRange`.

What should be called out during future registry refinement:

- the current registry text underspecifies that `traitBaseline` is doing substantial per-trait work
- if V2 wants explicit per-trait variance consumption by `F-SEED-001`, the registry should add that contract directly rather than leaving it implied

Sufficiency of current registered outputs:

- `Fruit.genetics.traitBaseline`: sufficient for V1, but richer than the registry prose currently acknowledges
- `Fruit.genetics.stabilityScore`: sufficient as a fruit-level aggregation control
- `Fruit.genetics.varianceRange`: sufficient for V1, but lossy compared with per-trait variance control

---

## Prompt 2 — Resolve Inheritance, Stability, and Lock Progression

### 1. Recommended parent contribution rule

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

Rationale:

- fixed-enough to stay legible
- slight maternal identity helps fruits feel tied to the mother plant
- the more stable parent pulls slightly harder without creating hidden dominance rules

For self-pollination, set `maternalWeight = 1`, `paternalWeight = 0`, and carry forward the same baseline value before mutation.

### 2. Recommended stability formula

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

Interpretation:

- stable, agreeing parents can improve stability
- selfing is the safest reinforcement path, but only climbs gradually
- divergent crosses damage stability even when both parents are individually stable
- stability is driven by signal coherence, not generation count

### 3. `lockState` threshold proposal

Use asymmetric thresholds:

- `unstable`: `< 0.30`
- `drifting`: `0.30 - 0.59`
- `mostly_stable`: `0.60 - 0.84`
- `locked`: `>= 0.85`

Why asymmetric:

- reaching `locked` should be meaningfully hard
- a destabilizing cross should be able to knock a trait out of `locked` in one generation if parent agreement is low enough
- `mostly_stable` should be the common reward band for sustained but not perfect reinforcement

### 4. Worked multi-generation examples

Assume normalized trait values.

Example A: self-pollination from middling stability `0.40`

```text
G0 parent stability = 0.40

G1 self:
agreement = 1.00
parentAvg = 0.40
fruitTraitStability = 0.40 + 0.08 * 0.60 = 0.448

G2 self:
0.448 + 0.08 * 0.552 = 0.492

G3 self:
0.492 + 0.08 * 0.508 = 0.533

G4 self:
0.533 + 0.08 * 0.467 = 0.570

G5 self:
0.570 + 0.08 * 0.430 = 0.604
```

Outcome:

- the line moves from `drifting` to `mostly_stable` in about five reinforcing generations
- it does not reach `locked` quickly, which preserves breeding tension

Continuing the same curve:

```text
G6 = 0.636
G7 = 0.665
G8 = 0.692
G9 = 0.717
G10 = 0.739
```

Pure selfing from `0.40` is still not `locked` by generation ten. That is desirable. Lock should be earned through repeated coherence, not handed out by a short loop.

Example B: close-line cross

```text
maternal value = 0.62, stability = 0.74
paternal value = 0.66, stability = 0.70

agreement = 0.96
parentAvg = 0.72
reinforcementBonus = 0.05
divergencePenalty = 0

fruitTraitStability = 0.72 + 0.05 * 0.28 = 0.734
```

Outcome:

- close-line breeding can still reinforce a line
- it is slower than pure selfing on perfect agreement, but it preserves some exploration room

Example C: divergent cross knocks down a locked trait

```text
maternal value = 0.80, stability = 0.90
paternal value = 0.30, stability = 0.88

agreement = 0.50
parentAvg = 0.89
reinforcementBonus = 0
divergencePenalty = (0.75 - 0.50) * 0.40 = 0.10

fruitTraitStability = 0.79
```

Outcome:

- the trait falls from `locked` to `mostly_stable` in one destabilizing cross
- that matches the design goal that novel crosses create discovery potential but reduce consistency

Example D: very divergent unstable cross

```text
maternal value = 0.85, stability = 0.45
paternal value = 0.20, stability = 0.35

agreement = 0.35
parentAvg = 0.40
divergencePenalty = (0.75 - 0.35) * 0.40 = 0.16

fruitTraitStability = 0.24
```

Outcome:

- the result lands in `unstable`
- this is appropriate for exploratory hybrid discovery

### 5. Risks or edge cases

- A single fruit-level `stabilityScore` can hide the fact that one trait is locked while another is unstable.
- Numerical traits fit this cleanly; categorical or multi-value traits will need a documented agreement metric.
- If the reinforcement bonus is tuned too high, selfing becomes the dominant strategy.
- If divergence penalty is tuned too low, crosses preserve too much stability and make lock states feel cheap.

---

## Prompt 3 — Resolve Mutation and Seed Variance Behavior

### 1. Recommended mutation model

Use a hybrid with a very small continuous noise floor plus a rarer discrete event.

Continuous floor:

```text
microNoise = random(-0.15, +0.15) * traitRange * (1 - fruitTraitStability) * 0.15
```

Discrete mutation:

```text
mutationChance = 0.02 + 0.08 * (1 - fruitTraitStability)
mutationMagnitude = random(-0.5, +0.5) * traitRange * (1 - fruitTraitStability)
```

Why hybrid:

- continuous-only noise keeps lines alive but rarely creates memorable moments
- discrete-only mutation can make long runs feel dead between events
- hybrid gives stable lines slight motion and unstable lines occasional noticeable jumps

### 2. Recommended variance model for `F-SEED-001` consumption

V1 recommendation:

- keep the registry contract as fruit-level `stabilityScore` plus fruit-level `varianceRange`
- in practice, let `F-SEED-001` also read per-trait `TraitGenome.stability` already present inside `traitBaseline`

Practical shape:

```text
stabilityScore = average(fruitTraitStability across resolved traits)
varianceRange = MAX_VARIANCE * (1 - stabilityScore)

For each seed trait in F-SEED-001:
  traitVarianceCap = varianceRange * (1 - 0.5 * traitBaseline[trait].stability)
```

This preserves the current registry while avoiding the worst flattening problem. A locked trait still varies less than a drifting one, even though both sit under one fruit-level cap.

### 3. Player-feel implications

Across 5 to 10 generations:

- stable lines feel dependable because most seeds cluster tightly around the fruit baseline
- stable lines are not genetically dead because micro-noise and rare discrete mutation still allow edge-case outliers
- unstable lines remain interesting because both sibling spread and mutation frequency are visibly higher
- unstable lines stay readable because the baseline is still inherited structure, not full reroll chaos

Comparison of mutation approaches:

- continuous low noise only: readable, but discoveries feel too smooth and unremarkable over long runs
- discrete events only: exciting spikes, but many generations feel static
- hybrid: best fit for Pepper Pirate because it supports both reliability and occasional surprise

### 4. V1 simplifications vs future extensibility

V1 simplifications:

- one fruit-level `varianceRange`
- one aggregated `stabilityScore`
- per-trait stability used implicitly through `traitBaseline`, not as explicit registry outputs

What fidelity is lost:

- players cannot perfectly infer that one trait should drift much less than another from fruit-level fields alone
- UI explanations for variance will be less precise than the underlying behavior
- per-trait locked traits may still inherit some variance from overall fruit instability

Future extension path:

- add explicit per-trait variance outputs to `F-FRUIT-001`
- make `F-SEED-001` contractually consume per-trait variance caps
- expose trait-specific stability forecasts in breeding previews

### 5. Registry impact

Current registry contract is sufficient for the recommended V1 if `traitBaseline` is understood to include per-trait `TraitGenome` data that `F-SEED-001` can inspect.

It is not sufficient for a cleaner V2 per-trait variance model. If that path is chosen later, the registry should explicitly add per-trait variance or per-trait variance influence rather than keeping it implicit.

