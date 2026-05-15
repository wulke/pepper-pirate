# F-SOIL-001 Review Pass — Codex — 2026-04-17

Status: `review-pass`

Related: [Formula Registry](../FORMULA-REGISTRY.md#f-soil-001--soil-modifier) | [Lifecycle Formulas](../LIFECYCLE-FORMULAS.md#soil-seed-affinity) | [Soil Data Model](../data-models/SOIL.md) | [Seed Data Model](../data-models/SEED.md) | [Plot Data Model](../data-models/PLOT.md)

---

## Prompt 1 — Define the V1 Contract Boundary

### 1. V1 contract

`F-SOIL-001` should compute one thing in V1: how well the current soil conditions of a plot match the planted seed's stored soil preferences, expressed as a single `soilModifier` in the range `0.0-1.0`.

This formula should remain narrowly scoped:

- It is a soil-to-seed fit formula, not a general health formula.
- It evaluates current effective soil state, not long-horizon soil ecology.
- It outputs one composite modifier for downstream growth formulas.
- It does not directly own death, disease, transplant stress, watering decay, or nutrient depletion behavior.

In simulation terms, `F-SOIL-001` answers:

`Given this seed's preferred soil profile and this plot's current soil state, how much of the plant's base growth potential is available right now?`

### 2. Required reads and output

Required V1 reads:

- `Seed.genetics.soilAffinity.preferredPh`
- `Seed.genetics.soilAffinity.preferredNitrogen`
- `Seed.genetics.soilAffinity.preferredPhosphorus`
- `Seed.genetics.soilAffinity.preferredPotassium`
- `Seed.genetics.soilAffinity.preferredMoisture`
- `Seed.genetics.hardiness`
- `Seed.genetics.droughtResistance`
- `Soil.conditions.currentPh`
- `Soil.nutrients.nitrogen`
- `Soil.nutrients.phosphorus`
- `Soil.nutrients.potassium`
- `Soil.conditions.moistureLevel`

Required V1 output:

- `soilModifier: number` in the range `0.0-1.0`

Optional internal intermediate values worth computing but not making canonical contract fields:

- `tolerance`
- per-factor modifiers for `pH`, `N`, `P`, `K`, and `moisture`
- `nutrientModifier`

### 3. Assumptions and simplifications

- V1 should treat `soilAffinity` as an explicit stored runtime input, not a runtime-derived value.
- V1 should treat soil nutrients and moisture as current effective values, not stockpile-plus-availability layers.
- V1 should treat pH as the only special-case gate in the combination rule.
- V1 should not model nutrient lockout as separate per-nutrient subformulas. The pH gate is enough abstraction for now.
- V1 should not include drainage, water retention, texture, salinity, compaction, microbial health, or organic matter inside `F-SOIL-001`, even though those fields matter elsewhere in the soil system.

### 4. Deferred behaviors for V2+

- Trait-driven generation rules for `soilAffinity`
- `soilAdaptability` entering the tolerance formula
- Separate handling for drainage and water retention versus current moisture
- Secondary soil-health systems such as salinity, compaction, organic matter, and microbial health
- Nutrient depletion, nutrient washout, and pH drift over time
- Per-nutrient availability curves instead of one pH gate
- More expressive factor weighting than `pH`-plus-average

### 5. Registry impact

No formula split is needed. `F-SOIL-001` remains one interaction formula.

However, the current contract surface is not fully aligned:

- The registry reads `Soil.conditions.nitrogen/phosphorus/potassium/moisture`.
- The current `SOIL.md` model uses `Soil.nutrients.nitrogen/phosphorus/potassium` and `Soil.conditions.moistureLevel`.
- The registry and lifecycle docs refer to `Seed.genetics.soilAffinity.*`, but `SEED.md` does not yet expose `soilAffinity` or trait values directly on `Seed.genetics`.

My recommendation is to treat the lifecycle/registry shape as the intended formula contract and clean the model docs to match that intent, while updating the registry soil field paths to the current `SOIL.md` naming if those names are kept.

---

## Prompt 2 — Resolve Delta, Tolerance, and Combination Mechanics

### 1. Recommended tolerance rule

Keep the current V1 direction:

```text
tolerance = 0.75 * Seed.genetics.hardiness
          + 0.25 * Seed.genetics.droughtResistance
```

Why this is good enough for V1:

- It gives hardier peppers more forgiveness without making hardiness the sole explanation.
- It lets drought resistance matter through the moisture axis and overall tolerance.
- It stays simple enough to reason about without introducing a new soil-specific trait early.

Implementation note:

- Clamp tolerance into a practical range such as `0.10-0.60`.

Reason:

- Without a floor, very low-trait seeds can become mathematically brittle.
- Without a ceiling, highly tolerant seeds can flatten the whole soil puzzle.

### 2. Recommended normalization and delta rule

Use normalization before delta calculation.

```text
For N, P, K, moisture:
  normalizedValue = rawValue

For pH:
  normalizedPh = (value - PH_MIN) / (PH_MAX - PH_MIN)
```

Recommended V1 constants:

```text
PH_MIN = 5.0
PH_MAX = 8.0
```

Then:

```text
delta = abs(normalizedActual - normalizedPreferred)
```

Why normalization is required:

- pH and the other factors live on different native scales.
- A raw pH difference of `0.3` is not equivalent to an NPK difference of `0.3`.
- Without normalization, pH gets unintentionally overweighted before the formula even starts making design choices.

What breaks without normalization:

- pH dominates the modifier for the wrong reason.
- Tolerance stops meaning the same thing across factors.
- Worked examples become misleading because the player-visible soil analysis does not match the hidden math.

### 3. Recommended factor-combination rule

#### Candidate A — Current plateau plus linear falloff

```text
sweetSpot = tolerance * 0.5

if delta <= sweetSpot:
  factorModifier = 1.0
else:
  overshoot = delta - sweetSpot
  maxOvershoot = tolerance - sweetSpot
  factorModifier = max(0.0, 1.0 - (overshoot / maxOvershoot))
```

Strengths:

- Very readable.
- Supports a clear "close enough" zone.
- Gives designers easy tuning leverage.
- Maps well to player expectations.

Weaknesses:

- The cliff at tolerance can feel harsh for extreme mismatches.
- A factor can hit `0.0` abruptly.

#### Candidate B — Smooth bell-curve falloff

```text
factorModifier = exp(-(delta * delta) / (2 * tolerance * tolerance))
```

Strengths:

- Smoother curve.
- No hard cutoff.
- Better if V2 adds more interacting soil variables.

Weaknesses:

- Harder to explain to players.
- Harder to tune by intuition.
- Less obvious where "good enough" begins and ends.

#### Recommendation

Choose Candidate A for V1.

The system needs readability more than elegance. Players should be able to infer:

- this seed likes a range, not a perfect number
- small misses are acceptable
- large misses are punishing

That is exactly what plateau plus falloff communicates.

#### Recommended combination rule

Keep `pH` as the gate, but tighten the combination logic slightly:

```text
nutrientModifier = average(nitrogenModifier, phosphorusModifier, potassiumModifier)
soilModifier = phModifier * average(nutrientModifier, moistureModifier)
```

I would keep this rule for V1.

Why:

- It preserves the intended ordering of care: fix pH first, then nutrient balance, then moisture.
- It keeps pH important without forcing every pH problem to zero the whole formula.
- It avoids inventing separate lockout rules by nutrient.

If one branch reaches `0.0`, it should drag the formula down sharply, not necessarily zero the whole result by itself, except for `pH`.

Recommended V1 interpretation:

- `phModifier = 0.0` should zero `soilModifier`.
- `nutrientModifier = 0.0` should not automatically zero `soilModifier` if moisture is still correct.
- `moistureModifier = 0.0` should not automatically zero `soilModifier` if nutrients remain correct.

This is consistent with the current formula shape and keeps pH as the one deliberate gate.

### 4. Worked examples

#### Example A — Near-ideal soil

```text
Seed preferences:
  pH=6.4 N=0.4 P=0.7 K=0.5 moisture=0.6

Traits:
  hardiness=0.40 droughtResistance=0.20

tolerance = 0.75*0.40 + 0.25*0.20 = 0.35
sweetSpot = 0.175

Actual soil:
  pH=6.5 N=0.45 P=0.65 K=0.55 moisture=0.55

Normalized deltas:
  pH = |(6.5-5.0)/3 - (6.4-5.0)/3| = |0.500 - 0.467| = 0.033
  N  = |0.45 - 0.40| = 0.05
  P  = |0.65 - 0.70| = 0.05
  K  = |0.55 - 0.50| = 0.05
  M  = |0.55 - 0.60| = 0.05
```

All deltas are inside the sweet spot, so all factor modifiers are `1.0`.

```text
nutrientModifier = 1.0
soilModifier = 1.0 * average(1.0, 1.0) = 1.0
```

Result:

- The plant gets full soil efficiency.
- This matches the rule that ideal soil removes penalties but does not create bonus growth.

#### Example B — Clear mismatch, but not fully dead

```text
Seed preferences:
  pH=6.4 N=0.4 P=0.7 K=0.5 moisture=0.6

Traits:
  hardiness=0.30 droughtResistance=0.20

tolerance = 0.275
sweetSpot = 0.1375

Actual soil:
  pH=7.4 N=0.8 P=0.2 K=0.3 moisture=0.3

Normalized deltas:
  pH = |0.800 - 0.467| = 0.333
  N  = |0.80 - 0.40| = 0.40
  P  = |0.20 - 0.70| = 0.50
  K  = |0.30 - 0.50| = 0.20
  M  = |0.30 - 0.60| = 0.30
```

Applying plateau plus falloff:

- `pH`, `N`, `P`, and `M` all land at or below `0.0`
- `K` lands low but above zero

That gives:

```text
nutrientModifier = average(0.0, 0.0, low) = very low
soilModifier = 0.0 * average(very low, 0.0) = 0.0
```

Result:

- The plant is effectively fully blocked by severe pH mismatch.
- This is the one case where a zero result is justified by the intended pH gate.

#### Example C — Wrong nutrient ratio, acceptable pH

```text
Seed preferences:
  pH=6.4 N=0.4 P=0.7 K=0.5 moisture=0.6

Traits:
  hardiness=0.35 droughtResistance=0.15

tolerance = 0.30
sweetSpot = 0.15

Actual soil:
  pH=6.3 N=0.7 P=0.6 K=0.5 moisture=0.6
```

Normalized deltas:

- `pH` delta is small and stays in the sweet spot
- `P`, `K`, and `moisture` stay in or near the sweet spot
- `N` is meaningfully too high

Likely result:

```text
phModifier = 1.0
nitrogenModifier = 0.0
phosphorusModifier = 1.0
potassiumModifier = 1.0
moistureModifier = 1.0

nutrientModifier = 0.67
soilModifier = 1.0 * average(0.67, 1.0) = 0.835
```

Result:

- The plant is penalized, but still viable.
- The player diagnosis is legible: pH is fine, nitrogen is the problem.

### 5. Risks or edge cases

- If tolerance is too low for too many seeds, many varieties will feel arbitrarily invalid.
- If tolerance is too high, seed identity disappears and soil management becomes cosmetic.
- A hard zero at `pH` mismatch is acceptable only if the UI clearly explains that nutrients are unavailable because pH is off.
- Because `moisture` is current state while NPK is more persistent state, the shared delta logic may make moisture feel more volatile than the other factors. That is acceptable in V1, but should be watched.

---

## Prompt 3 — Resolve Downstream Interaction and Data-Model Alignment

### 1. Interaction with F-GROWTH-001

`F-SOIL-001` should remain a foundational multiplier inside `F-GROWTH-001`:

```text
finalGrowthModifier = min(1.25, soilModifier * tendingModifier * healthModifier * plotModifier)
```

Interpretation:

- `soilModifier` defines whether the plant has the right baseline medium.
- `tendingModifier` rewards player attention but cannot erase bad fit.
- `plotModifier` defines whether the vessel and stage are appropriate.
- `healthModifier` captures stress and damage states that are not the same as soil fit.

This multiplicative interaction is correct for V1.

Reason:

- It preserves foundational versus supplemental levers.
- It prevents active play from bypassing genetics and environment.
- It keeps each modifier legible.

### 2. Behavior at low or zero soil fit

Recommended behavior:

- `soilModifier > 0.0 and low`: growth slows proportionally.
- `soilModifier = 0.0`: stage progression should stall for that tick.

What should not happen automatically inside `F-SOIL-001`:

- instant plant death
- automatic health loss
- silent recovery rules

If the design later wants prolonged zero-fit conditions to damage the plant, that should route through `F-HEALTH-001` or a future stress formula, not be hidden inside `F-SOIL-001`.

This keeps the boundary clean:

- `F-SOIL-001` says whether growth can proceed.
- other formulas decide whether sustained mismatch causes damage.

### 3. Required Seed and Soil contract shape

Required Seed shape for implementation clarity:

```ts
Seed.genetics = {
  hardiness: number;
  droughtResistance: number;
  soilAffinity: {
    preferredPh: number;
    preferredNitrogen: number;
    preferredPhosphorus: number;
    preferredPotassium: number;
    preferredMoisture: number;
  };
}
```

Required Soil shape for implementation clarity:

```ts
Soil = {
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  conditions: {
    currentPh: number;
    moistureLevel: number;
  };
}
```

Important alignment call:

- `currentDrainage`, `waterRetention`, `texture`, and long-horizon health fields should not be required inputs for `F-SOIL-001` in V1.
- They belong to adjacent systems and future iterations, not the minimal implementation contract.

### 4. Player readability implications

V1 should support player-facing diagnostics that match the formula structure:

- overall soil fit summary
- per-factor labels such as `pH off`, `nitrogen high`, `soil too dry`
- a clear indication that pH problems reduce nutrient availability

The player does not need to see exact modifier numbers in V1, but the game should be able to surface:

- which factor is the main problem
- whether the issue is minor versus severe
- which corrective action is relevant

If the player sees "growth is poor" without factor-level explanation, this formula will feel arbitrary.

### 5. Registry impact

The current registry structure is still the right formula shape, but the field paths need cleanup if the project keeps the current soil model naming.

Recommended exact contract edits if adopted:

- Change registry reads from:
  - `Soil.conditions.nitrogen`
  - `Soil.conditions.phosphorus`
  - `Soil.conditions.potassium`
  - `Soil.conditions.moisture`
- To:
  - `Soil.nutrients.nitrogen`
  - `Soil.nutrients.phosphorus`
  - `Soil.nutrients.potassium`
  - `Soil.conditions.moistureLevel`

Also, `SEED.md` should be updated so that formula-relevant trait values and `soilAffinity` are represented explicitly enough to support the formula contract already described by the lifecycle and registry docs.

---

## Consolidated Recommendation

My V1 recommendation is:

- keep `F-SOIL-001` as one composite soil-to-seed fit formula
- keep tolerance as `hardiness` plus `droughtResistance`
- keep normalization mandatory
- keep plateau plus linear falloff for factor mapping
- keep `pH` as the only explicit gate
- keep multiplicative downstream use inside `F-GROWTH-001`
- treat `soilModifier = 0.0` as growth stall, not automatic death
- clean the doc contract so registry, lifecycle, and data-model paths stop disagreeing

This is strong enough for implementation and still leaves room for richer soil simulation later.
