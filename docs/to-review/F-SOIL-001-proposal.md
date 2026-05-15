# F-SOIL-001 — V1 Soil Modifier Proposal

**Date:** 2026-04-17
**Status:** review-ready
**Based on:** FORMULA-REGISTRY.md, LIFECYCLE-FORMULAS.md, data-models/SOIL.md, data-models/SEED.md, GENETICS.md

---

## Purpose

`F-SOIL-001` computes how well the current soil conditions match a seed's genetic preferences. It produces a single `soilModifier` in the range `[0.0, 1.0]` that scales growth rate. Good soil removes penalties; it does not create bonuses above 1.0 in V1.

Soil-seed fit is a **foundational lever** — it cannot be compensated away by tending or plot choice. A player who ignores soil matching will see consistently degraded growth on any genetic line that has meaningful preferences.

---

## Inputs

### From Seed

| Field | Path | Notes |
|---|---|---|
| Preferred pH | `Seed.genetics.soilAffinity.preferredPh` | Natural units (e.g. 6.4). Normalized at eval time. |
| Preferred Nitrogen | `Seed.genetics.soilAffinity.preferredNitrogen` | 0–1 |
| Preferred Phosphorus | `Seed.genetics.soilAffinity.preferredPhosphorus` | 0–1 |
| Preferred Potassium | `Seed.genetics.soilAffinity.preferredPotassium` | 0–1 |
| Preferred Moisture | `Seed.genetics.soilAffinity.preferredMoisture` | 0–1 |
| Hardiness | `Seed.genetics.traitGenome.hardiness.inheritedValue` | Extracted as number |
| Drought Resistance | `Seed.genetics.traitGenome.droughtResistance.inheritedValue` | Extracted as number |

### From Soil

| Field | Path | Notes |
|---|---|---|
| Current pH | `Soil.conditions.currentPh` | Natural units |
| Nitrogen | `Soil.nutrients.nitrogen` | 0–1 |
| Phosphorus | `Soil.nutrients.phosphorus` | 0–1 |
| Potassium | `Soil.nutrients.potassium` | 0–1 |
| Moisture | `Soil.conditions.moistureLevel` | 0–1 |

---

## Output

`soilModifier` — a single number in `[0.0, 1.0]`, produced once per tick during growth evaluation.

Consumed by: `F-GROWTH-001`

---

## Tolerance Rule

Tolerance measures how forgiving a seed's genetics are toward soil mismatch. V1 derives it as a composite of two existing traits:

```
tolerance = 0.75 * Seed.genetics.traitGenome.hardiness.inheritedValue
          + 0.25 * Seed.genetics.traitGenome.droughtResistance.inheritedValue
```

**Tolerance bands:**
- `≥ 0.50` — forgiving; grows well in a wide range of conditions
- `0.25–0.50` — typical; needs reasonable soil matching
- `< 0.25` — demanding; requires precise conditions, high ceiling, high maintenance

`soilAdaptability` (V2 trait) will be added to this composite when it comes online.

---

## Normalization Rules

All factors must be normalized to `[0, 1]` before delta calculation so that pH deltas are comparable in scale to NPK/moisture deltas.

| Factor | Normalization |
|---|---|
| Nitrogen, Phosphorus, Potassium, Moisture | Already 0–1 — use raw value |
| pH | `(value - 5.0) / 3.0` where `PH_MIN=5.0`, `PH_MAX=8.0` |

```
normalizedActualPh    = (Soil.conditions.currentPh - 5.0) / 3.0
normalizedPreferredPh = (Seed.genetics.soilAffinity.preferredPh - 5.0) / 3.0
```

`preferredPh` is stored in natural units for player readability. Normalization is internal to formula evaluation only.

---

## Delta-to-Modifier Mapping

V1 uses a plateau + linear falloff model.

```
sweetSpot = tolerance * 0.5

if delta <= sweetSpot:
  factorModifier = 1.0
else:
  overshoot     = delta - sweetSpot
  maxOvershoot  = tolerance * 0.5
  factorModifier = max(0.0, 1.0 - (overshoot / maxOvershoot))
```

The sweet spot covers the first half of tolerance range. The falloff covers the second half. At `delta >= tolerance`, `factorModifier = 0.0`.

**Why plateau + falloff over a smooth curve:**
- The plateau models the real-world intuition that "close enough" is genuinely fine.
- The linear falloff provides a clear, readable signal to the player that something is wrong.
- A Gaussian bell curve (V2 candidate) would offer smoother gradient but is harder to tune and communicate to players before V2 soil-health mechanics justify the added complexity.

---

## Factor Combination Rule

```
phModifier       = factorModifier(pH)
nitrogenModifier = factorModifier(N)
phosphorusModifier = factorModifier(P)
potassiumModifier  = factorModifier(K)
moistureModifier   = factorModifier(moisture)

nutrientModifier = average(nitrogenModifier, phosphorusModifier, potassiumModifier)
soilModifier     = phModifier * average(nutrientModifier, moistureModifier)
```

**Why pH is a gatekeeper multiplier, not averaged in:**
pH controls whether nutrients are physically available to roots (lockout effect documented in SOIL.md). Averaging pH in with nutrients would let a plant partially compensate for bad pH with good NPK — that contradicts the lockout model.

**Intended player optimization order:**
1. Get pH right first (unlocks all nutrients)
2. Tune NPK ratios to match genetic preferences
3. Manage moisture

The formula structure naturally enforces this priority.

**On zero-factor behavior:** A factor reaching `0.0` does not fully zero the entire `soilModifier` (unless it's pH). A single nutrient at `0.0` drags nutrient average to `0.33` minimum (if the other two are perfect), making `soilModifier` at worst `phModifier * average(0.33, moistureModifier)`. Only pH at `0.0` collapses the full result to `0.0`. This is intentional — pH lockout is catastrophic, a single bad nutrient is recoverable.

---

## Worked Examples

### Example 1 — Near-Ideal (slight nitrogen excess)

```
Seed:      pH=6.4  N=0.4  P=0.7  K=0.5  moisture=0.6
Tolerance: 0.30  (hardiness=0.35, droughtRes=0.15)
SweetSpot: 0.15

Actual soil: pH=6.2  N=0.7  P=0.6  K=0.5  moisture=0.5

Normalized pH deltas:
  actual    = (6.2 - 5.0) / 3.0 = 0.400
  preferred = (6.4 - 5.0) / 3.0 = 0.467
  delta = 0.067  → within sweetSpot → phModifier = 1.00

Factor deltas:
  N:        |0.7 - 0.4| = 0.300  → past sweetSpot by 0.15 → 0.00
  P:        |0.6 - 0.7| = 0.100  → within sweetSpot       → 1.00
  K:        |0.5 - 0.5| = 0.000  → within sweetSpot       → 1.00
  moisture: |0.5 - 0.6| = 0.100  → within sweetSpot       → 1.00

nutrientModifier = average(0.00, 1.00, 1.00) = 0.67
soilModifier     = 1.00 * average(0.67, 1.00) = 0.835

Result: 83.5% growth efficiency.
Diagnosis: nitrogen well above preference. Player should reduce N fertilization.
```

### Example 2 — Clearly Mismatched (wrong pH, poor nutrients)

```
Seed:      pH=6.4  N=0.4  P=0.7  K=0.5  moisture=0.6
Tolerance: 0.20  (hardiness=0.20, droughtRes=0.20)
SweetSpot: 0.10

Actual soil: pH=7.8  N=0.2  P=0.3  K=0.2  moisture=0.8

Normalized pH deltas:
  actual    = (7.8 - 5.0) / 3.0 = 0.933
  preferred = (6.4 - 5.0) / 3.0 = 0.467
  delta = 0.467  → maxOvershoot = 0.10 → overshoot = 0.367 >> maxOvershoot
  phModifier = max(0, 1 - (0.367 / 0.10)) = 0.00

Factor deltas:
  N:        |0.2 - 0.4| = 0.200 → overshoot 0.10 → 0.00
  P:        |0.3 - 0.7| = 0.400 → 0.00
  K:        |0.2 - 0.5| = 0.300 → 0.00
  moisture: |0.8 - 0.6| = 0.200 → overshoot 0.10 → 0.00

nutrientModifier = 0.00
soilModifier     = 0.00 * average(0.00, 0.00) = 0.00

Result: 0% growth efficiency. Plant growth fully stalled.
Diagnosis: pH is alkaline and out of range for this demanding variety. All nutrients
           are locked out or mismatched. Correct pH first, then address NPK.
```

### Example 3 — Tolerant Variety in Poor Soil

```
Seed:      pH=6.0  N=0.5  P=0.5  K=0.5  moisture=0.5
Tolerance: 0.60  (hardiness=0.75, droughtRes=0.15)
SweetSpot: 0.30

Actual soil: pH=6.8  N=0.2  P=0.8  K=0.3  moisture=0.2

Normalized pH deltas:
  actual    = (6.8 - 5.0) / 3.0 = 0.600
  preferred = (6.0 - 5.0) / 3.0 = 0.333
  delta = 0.267  → within sweetSpot (0.30) → phModifier = 1.00

Factor deltas:
  N:        |0.2 - 0.5| = 0.30 → within sweetSpot → 1.00
  P:        |0.8 - 0.5| = 0.30 → within sweetSpot → 1.00
  K:        |0.3 - 0.5| = 0.20 → within sweetSpot → 1.00
  moisture: |0.2 - 0.5| = 0.30 → within sweetSpot → 1.00

nutrientModifier = 1.00
soilModifier     = 1.00 * average(1.00, 1.00) = 1.00

Result: 100% soil efficiency despite objectively poor soil.
Diagnosis: high-hardiness variety is forgiving enough that rough soil doesn't penalize it.
           This is the intended payoff for breeding a tolerant line.
```

---

## Downstream Usage — F-GROWTH-001

`soilModifier` feeds directly into `F-GROWTH-001` as one of four multiplicative factors:

```
finalGrowthModifier = min(1.25, soilModifier * tendingModifier * healthModifier * plotModifier)
```

**Interaction rules:**
- `soilModifier` operates in `[0.0, 1.0]`. It cannot push `finalGrowthModifier` above 1.0 on its own.
- Bad soil cannot be erased by good tending. At `soilModifier = 0.5`, even peak tending (`1.15`) yields at most `0.575 * healthModifier * plotModifier`.
- `soilModifier = 0.0` fully stalls growth. The plant does not die in V1 — it holds in place until soil is corrected.
- Recovery is immediate once soil conditions improve; there is no hysteresis or soil-stress debt in V1.

**What soilModifier does NOT affect in V1:**
- Fruit quality or trait expression
- Seed genetics or stability
- Health modifier or status effects (bad soil does not trigger `transplant_shock` or similar)

All of these are deferred to future formula expansion.

---

## Open Questions

1. **Growth floor at soilModifier = 0.0** — The current model stalls the plant. Should there be a minimum growth floor (e.g., `0.05`) so players get a visible indication that the plant is alive but struggling, rather than appearing frozen? Or is stall the correct signal?

2. **Player-facing diagnostics** — What does the player see when soil is wrong? A factor-level breakdown (per-nutrient indicator) is needed for this system to be learnable. The formula produces per-factor modifier values that could directly drive a soil-health display. This is a UX requirement that should accompany implementation, not follow it.

3. **preferredPh as a range vs. point** — LIFECYCLE-FORMULAS.md raises whether `preferredPh` should be stored as a range (e.g., `6.2–6.6`) rather than a single value. The current model already provides range behavior via the sweet spot, making a stored range slightly redundant. Recommend keeping it as a single point and relying on sweet spot for tolerance. However, this means the player needs to understand that "preferred pH" has implicit tolerance built in.

4. **Moisture depletion interaction** — When idle catchup occurs, moisture may have dropped to 0. The formula correctly penalizes this, but whether that penalty is applied retroactively across all elapsed ticks or only at current state on resume is unresolved. This is a tick-catchup system question, not a formula question — but F-SOIL-001 must be implementable either way.

---

## Registry Impact

The following changes are needed to bring the registry and data models into alignment:

### Field path corrections (registry currently incorrect)

| Registry reads | Correct path | Source |
|---|---|---|
| `Soil.conditions.nitrogen` | `Soil.nutrients.nitrogen` | SOIL.md |
| `Soil.conditions.phosphorus` | `Soil.nutrients.phosphorus` | SOIL.md |
| `Soil.conditions.potassium` | `Soil.nutrients.potassium` | SOIL.md |
| `Soil.conditions.moisture` | `Soil.conditions.moistureLevel` | SOIL.md |
| `Seed.genetics.hardiness` | `Seed.genetics.traitGenome.hardiness.inheritedValue` | SEED.md |
| `Seed.genetics.droughtResistance` | `Seed.genetics.traitGenome.droughtResistance.inheritedValue` | SEED.md |

### Missing field in SEED.md

`Seed.genetics.soilAffinity` is defined in LIFECYCLE-FORMULAS.md but **does not appear in the SEED.md TypeScript shape**. The `genetics` block on `Seed` only includes `traitGenome`, `overallStability`, and `overallVariance`. `soilAffinity` must be added as a first-class field:

```ts
genetics: {
  traitGenome: Partial<Record<TraitKey, TraitGenome>>;
  soilAffinity: {
    preferredPh: number;
    preferredNitrogen: number;
    preferredPhosphorus: number;
    preferredPotassium: number;
    preferredMoisture: number;
  };
  overallStability: number;
  overallVariance: number;
};
```

### Registry status

Update F-SOIL-001 status from `draft` to `approved` once:
- Field path corrections above are applied to the registry entry
- `soilAffinity` field is added to SEED.md
- Open question #1 (growth floor) is resolved

No other formulas need registry changes. F-GROWTH-001 already correctly lists F-SOIL-001 as a dependency and references `soilModifier` as the consumed output.
