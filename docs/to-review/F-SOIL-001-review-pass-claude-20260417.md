# F-SOIL-001 — Review Pass

**Date:** 2026-04-17
**Prompts covered:** 1, 2, 3
**Feeds into:** [F-SOIL-001-proposal.md](./F-SOIL-001-proposal.md)

---

## Prompt 1 — V1 Contract Boundary

### 1. V1 Contract

F-SOIL-001 computes how well the soil conditions of a plot match a seed's genetic soil preferences. It produces a single scalar `soilModifier ∈ [0.0, 1.0]` per tick during growth evaluation. Good soil removes penalties — it does not generate bonuses above 1.0 in V1. The formula is strictly concerned with soil-to-seed fit, not general plant health, weather, or long-term soil ecology.

### 2. Required Reads and Output

**Reads from Seed:**
- `Seed.genetics.soilAffinity.preferredPh`
- `Seed.genetics.soilAffinity.preferredNitrogen`
- `Seed.genetics.soilAffinity.preferredPhosphorus`
- `Seed.genetics.soilAffinity.preferredPotassium`
- `Seed.genetics.soilAffinity.preferredMoisture`
- `Seed.genetics.traitGenome.hardiness.inheritedValue`
- `Seed.genetics.traitGenome.droughtResistance.inheritedValue`

**Reads from Soil:**
- `Soil.conditions.currentPh`
- `Soil.nutrients.nitrogen`
- `Soil.nutrients.phosphorus`
- `Soil.nutrients.potassium`
- `Soil.conditions.moistureLevel`

**Output:** `soilModifier` — consumed by `F-GROWTH-001`

### 3. Assumptions and Simplifications

- V1 treats `soilAffinity` as an explicit block on the seed rather than deriving it from `traitGenome` at runtime. LIFECYCLE-FORMULAS.md confirms this is intentional: other traits bias what affinity values a seed is born with, but the stored values are the runtime source of truth.
- Tolerance is a composite of `hardiness` and `droughtResistance` only. `soilAdaptability` (V2 trait) is intentionally excluded.
- All five soil factors (pH, N, P, K, moisture) contribute to `soilModifier`. No factor is silently ignored.
- pH acts as a gatekeeper multiplier rather than a peer factor in averaging.
- The formula produces one aggregate `soilModifier` rather than per-factor outputs. Per-factor values may be cached for player diagnostics but do not constitute additional formula outputs.

### 4. Deferred Behaviors for V2+

- `soilAdaptability` trait inclusion in tolerance
- Smooth (Gaussian) delta-to-modifier curve
- Soil health factors: `organicMatter`, `compaction`, `microbialHealth`, `salinity` — all scoped to `Soil.health` block in SOIL.md and explicitly marked V2
- Drainage and water retention interaction with drought resistance
- Soil degradation over time (nutrient depletion, moisture dynamics per-tick)
- pH range stored as a range rather than a point value

### 5. Registry Impact

**Contract drift identified — registry currently incorrect on these field paths:**

| Registry reads | Correct path |
|---|---|
| `Soil.conditions.nitrogen` | `Soil.nutrients.nitrogen` |
| `Soil.conditions.phosphorus` | `Soil.nutrients.phosphorus` |
| `Soil.conditions.potassium` | `Soil.nutrients.potassium` |
| `Soil.conditions.moisture` | `Soil.conditions.moistureLevel` |
| `Seed.genetics.hardiness` | `Seed.genetics.traitGenome.hardiness.inheritedValue` |
| `Seed.genetics.droughtResistance` | `Seed.genetics.traitGenome.droughtResistance.inheritedValue` |

**Missing field in SEED.md:** `Seed.genetics.soilAffinity` is fully described in LIFECYCLE-FORMULAS.md but absent from the TypeScript shape in SEED.md. It must be added as a first-class field under `genetics`.

---

## Prompt 2 — Delta, Tolerance, and Combination Mechanics

### 1. Recommended Tolerance Rule

```
tolerance = 0.75 * Seed.genetics.traitGenome.hardiness.inheritedValue
          + 0.25 * Seed.genetics.traitGenome.droughtResistance.inheritedValue
```

Rationale: Hardiness measures stress survival broadly; droughtResistance contributes a soil-moisture-specific forgiveness axis. The 75/25 weighting keeps hardiness as the dominant lever without making them interchangeable. Range: typical V1 seeds will fall between 0.20 and 0.50.

### 2. Recommended Normalization and Delta Rule

Normalization is required because pH is on a ~5.0–8.0 native scale while NPK/moisture are already 0–1. Without normalization, a pH delta of 0.3 would be ~3× larger than an equivalent NPK delta of 0.1, making pH disproportionately punishing.

```
PH_MIN = 5.0
PH_MAX = 8.0

normalizedActualPh    = (Soil.conditions.currentPh - 5.0) / 3.0
normalizedPreferredPh = (Seed.genetics.soilAffinity.preferredPh - 5.0) / 3.0

For each factor:
  delta = |normalize(actual) - normalize(preferred)|
```

### 3. Recommended Factor-Combination Rule

**Delta-to-modifier — Plateau + Falloff (V1 choice):**

```
sweetSpot   = tolerance * 0.5
maxOvershoot = tolerance * 0.5

if delta <= sweetSpot:
  factorModifier = 1.0
else:
  overshoot = delta - sweetSpot
  factorModifier = max(0.0, 1.0 - (overshoot / maxOvershoot))
```

**Candidate comparison:**

| Shape | Pros | Cons |
|---|---|---|
| Plateau + linear falloff (recommended) | Readable, learnable, tunable; maps to player intuition of "good enough range" | Hard cutoff at `delta = tolerance` can feel abrupt for borderline cases |
| Gaussian bell curve `e^(-(δ²)/(2t²))` | Smooth, no hard cutoff; rewards fine-tuning endlessly | Hard to explain to players; no clear "you're in range" signal; over-tuning incentive |

Plateau + falloff is correct for V1. Bell curve is a valid V2 upgrade when soil-health adds more interacting variables and the UI can better communicate gradients.

**On zero-factor behavior:** A single nutrient at `0.0` should drag down the nutrient average but not zero the whole formula. Only pH at `0.0` should collapse `soilModifier` to `0.0`. This is the correct mechanic — pH lockout is catastrophic, a single bad nutrient is recoverable.

**Combination rule:**

```
nutrientModifier = average(nitrogenModifier, phosphorusModifier, potassiumModifier)
soilModifier     = phModifier * average(nutrientModifier, moistureModifier)
```

pH as a multiplier (not averaged in) enforces the lockout mechanic: even perfect NPK cannot overcome wrong pH. Moisture averaged with nutrientModifier gives it equal weight to the full NPK block.

### 4. Worked Examples

**Near-ideal (nitrogen excess):**

```
Seed: pH=6.4  N=0.4  P=0.7  K=0.5  moisture=0.6
Tolerance=0.30, sweetSpot=0.15
Soil: pH=6.2  N=0.7  P=0.6  K=0.5  moisture=0.5

pH delta = |0.400 - 0.467| = 0.067  → within sweet spot → 1.00
N delta  = 0.300  → overshoot 0.15 → 0.00
P delta  = 0.100  → within sweet spot → 1.00
K delta  = 0.000  → 1.00
moisture = 0.100  → within sweet spot → 1.00

nutrientModifier = avg(0.00, 1.00, 1.00) = 0.67
soilModifier     = 1.00 * avg(0.67, 1.00) = 0.835
```

**Clearly mismatched (demanding variety, alkaline soil, poor NPK):**

```
Seed: pH=6.4  N=0.4  P=0.7  K=0.5  moisture=0.6
Tolerance=0.20, sweetSpot=0.10
Soil: pH=7.8  N=0.2  P=0.3  K=0.2  moisture=0.8

pH delta = |0.933 - 0.467| = 0.467  → maxOvershoot=0.10 → 0.00
N:  0.200 → overshoot 0.10 → 0.00
P:  0.400 → 0.00
K:  0.300 → 0.00
moisture: 0.200 → 0.00

soilModifier = 0.00
```

### 5. Risks and Edge Cases

- **Tolerance of 0.0** — a seed with zero hardiness and zero droughtResistance would have `sweetSpot = 0` and `maxOvershoot = 0`, causing a division-by-zero in the falloff. Implementation must guard: if `tolerance == 0`, any nonzero delta immediately yields `factorModifier = 0.0`.
- **Simultaneous all-zero factors** — mathematically valid but produces a confusing player experience where every factor is wrong at once. Player diagnostics must show per-factor state so the problem is diagnosable.
- **pH normalization boundary** — if `currentPh` falls outside `[5.0, 8.0]`, the normalized value falls outside `[0, 1]`. Implementation should clamp `currentPh` to the normalization range before delta calculation.

---

## Prompt 3 — Downstream Interaction and Data-Model Alignment

### 1. Interaction with F-GROWTH-001

`soilModifier` feeds `F-GROWTH-001` multiplicatively:

```
finalGrowthModifier = min(1.25, soilModifier * tendingModifier * healthModifier * plotModifier)
```

Key behaviors:
- `soilModifier` cannot push `finalGrowthModifier` above 1.0 on its own (capped at 1.0).
- Bad soil cannot be offset by tending: at `soilModifier = 0.5`, perfect tending (`1.15`) still yields at most `0.575`.
- `soilModifier` and `healthModifier` are independent — poor soil does not cause health effects in V1. They interact only through the multiplicative combination.
- `soilModifier` and `plotModifier` are also independent. A plant in a great plot with wrong soil still gets capped by its soil result.

### 2. Behavior at Low or Zero Soil Fit

At `soilModifier = 0.0`, `finalGrowthModifier = 0.0` regardless of other modifiers — plant growth **stalls**. The plant does not die in V1 and does not accumulate health damage from soil conditions alone.

Recovery is immediate once soil is corrected; there is no soil-stress debt or hysteresis in V1.

> **Open question:** Should a minimum growth floor (e.g., `0.05`) exist at `soilModifier = 0.0`? A stalled plant may appear broken rather than "struggling." A small floor gives a better player signal. Decision should be made before implementation.

### 3. Required Seed and Soil Contract Shape

**SEED.md must add `soilAffinity` to the `genetics` block:**

```ts
genetics: {
  traitGenome: Partial<Record<TraitKey, TraitGenome>>;
  soilAffinity: {
    preferredPh: number;          // natural units (e.g. 6.4)
    preferredNitrogen: number;    // 0–1
    preferredPhosphorus: number;  // 0–1
    preferredPotassium: number;   // 0–1
    preferredMoisture: number;    // 0–1
  };
  overallStability: number;
  overallVariance: number;
};
```

**SOIL.md shape is correct for V1.** The formula uses `Soil.nutrients.*` and `Soil.conditions.currentPh` / `Soil.conditions.moistureLevel`. No SOIL.md changes are needed.

**FORMULA-REGISTRY.md field paths need correction** (see Prompt 1 above).

### 4. Player Readability Implications

The formula produces meaningful per-factor intermediate values (phModifier, nitrogenModifier, etc.) that are ideal for a player-facing soil diagnostic. In V1 the player needs to be able to answer:
- Which factor is the problem?
- Is pH the gatekeeper, or is it nutrients/moisture?
- How far off is the soil vs. what my seed wants?

The formula's structure naturally supports this — implementation should surface per-factor modifier values or deltas in a soil-health panel. This is a UX requirement that should be scoped with the formula, not added later.

### 5. Registry Impact

Same as Prompt 1: field path corrections in registry, `soilAffinity` addition in SEED.md. No new registry entries required. F-GROWTH-001's `Depends On: F-SOIL-001` is already correct.
