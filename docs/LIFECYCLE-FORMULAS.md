# Lifecycle Formulas

This document defines the formulas and state transitions that govern how game objects change over time. All formulas are **language-agnostic** — expressed in pseudocode using nomenclature from the [data models](./data-models/PEPPER.md).

> Related docs: [Formula Registry](./FORMULA-REGISTRY.md) | [Data Models](./data-models/PEPPER.md) | [Genetics](./GENETICS.md) | [Process Flows](./process-flows/README.md)

## Registry Rule

[FORMULA-REGISTRY.md](./FORMULA-REGISTRY.md) is the source of truth for formula IDs, ownership, reads/writes, triggers, and inter-formula dependencies.

This document owns the human-readable formula design and pseudocode. If any formula here changes its contract, the corresponding registry entry must be updated in the same pass.

## Table of Contents

- [Foundational Concepts](#foundational-concepts)
  - [Ticks](#ticks)
  - [Formula Categories](#formula-categories)
  - [The Modifier Pattern](#the-modifier-pattern)
- [Soil-Seed Affinity](#soil-seed-affinity)
  - [Soil Affinity Profile](#soil-affinity-profile)
  - [Tolerance](#tolerance)
  - [Normalization Rules](#normalization-rules)
  - [Delta Calculation](#delta-calculation)
  - [Delta-to-Modifier Mapping](#delta-to-modifier-mapping)
  - [Combining Factor Modifiers](#combining-factor-modifiers)
  - [Worked Example](#worked-example)
- [Growth Modifier Formula](#growth-modifier-formula)
  - [Tending Modifier](#tending-modifier)
  - [Final Growth Modifier](#final-growth-modifier)
- [Lifecycle Stage Formulas](#lifecycle-stage-formulas) *(to be defined)*
- [Open Questions](#open-questions)

---

## Foundational Concepts

### Ticks

A **tick** is the smallest logical unit of game time. All formulas express rates as "per tick" or "triggered at tick N." The tick is decoupled from wall-clock time:

```
TICK_DURATION_MS = <configurable>   // not part of game logic — tunable at runtime
```

Key properties:
- Ticks continue to accumulate while the game is running (active or idle).
- The player can **pause** the game at any time, halting tick advancement. This ensures no uncontrolled time loss, supporting the "never punished for absence" design pillar.
- Idle catchup: when the player returns, the game calculates `ticksElapsed` since last active and resolves accumulated changes.
- Fast-forward mechanics (spend currency to advance N ticks) are possible because formulas are tick-based, not clock-based.

### Formula Categories

Every formula in the lifecycle falls into one of three categories:

| Category | When It Runs | Examples |
|---|---|---|
| **Progression** | Per tick | Plant growth rate, fruit maturation, moisture depletion |
| **Resolution** | Once, at a trigger | Genetics inheritance at pollination, per-seed variance at extraction, node count at flowering |
| **Interaction** | Per tick, between two objects | Soil effects on plant growth, pH gating nutrients, tending bonuses |

Most progression and interaction formulas follow the same shape:

```
newValue = currentValue + (baseRate * modifier1 * modifier2 * ... * ticksElapsed)
```

### The Modifier Pattern

A **modifier** is a value (typically 0-1) that scales a base rate. Modifiers are derived from the relationship between an object's current state and its ideal conditions. In V1, individual modifiers are **capped at 1.0** — matching ideal conditions removes penalties but does not create bonuses. The final combined growth modifier has a **soft cap of 1.25** to allow active tending to provide a small edge (see [Final Growth Modifier](#final-growth-modifier)).

The general pattern:
1. An object defines its **optimum** (preferred conditions)
2. The game calculates the **delta** between actual and preferred
3. The delta maps to a **modifier** via a falloff function
4. Multiple factor modifiers **combine** into one composite modifier
5. The composite modifier plugs into a **progression formula**

The modifier falloff function determines the game's "feel." See [Delta-to-Modifier Mapping](#delta-to-modifier-mapping) for the V1 approach.

---

## Soil-Seed Affinity

The first and most fundamental interaction formula: how soil conditions affect plant performance. Each seed's genetics define the soil conditions where that pepper variety thrives.

**Registry IDs:** `F-SOIL-001`

### Soil Affinity Profile

Each seed carries a preferred soil profile as an **explicit block** on its genetic identity:

```
Seed.genetics.soilAffinity = {
  preferredPh:          number    // e.g. 6.4
  preferredNitrogen:    number    // 0-1, e.g. 0.4
  preferredPhosphorus:  number    // 0-1, e.g. 0.7
  preferredPotassium:   number    // 0-1, e.g. 0.5
  preferredMoisture:    number    // 0-1, e.g. 0.6
}
```

`soilAffinity` is stored explicitly on the seed, not derived at runtime from other traits. This gives direct control over varietal identity — two peppers with the same Scoville level can have different soil preferences, enabling meaningful diversity within trait archetypes.

However, during **inheritance and cultivar generation**, other traits **bias** the generation of soilAffinity values. For example, a high-yield seed is more likely to generate a high `preferredPhosphorus` value, consistent with the trait-nutrient relationships documented in [SOIL.md](./data-models/SOIL.md#soil-genetics-interaction). The key distinction: traits influence what affinities a seed *tends to be born with*, but the stored values are the source of truth at runtime.

### Tolerance

`tolerance` determines how precisely the player needs to match soil conditions. It is a **composite value** derived from multiple genetic traits, not a 1:1 mapping to any single trait.

**V1 formula** (soilAdaptability is a V2 trait):
```
tolerance = 0.75 * Seed.genetics.traitGenome.hardiness.inheritedValue
          + 0.25 * Seed.genetics.traitGenome.droughtResistance.inheritedValue
```

**V2 formula** (when soilAdaptability comes online):
```
tolerance = 0.60 * Seed.genetics.traitGenome.hardiness.inheritedValue
          + 0.25 * Seed.genetics.traitGenome.soilAdaptability.inheritedValue
          + 0.15 * Seed.genetics.traitGenome.droughtResistance.inheritedValue
```

This avoids overloading Hardiness as a single catch-all. Hardiness represents survival under stress. Soil forgiveness is related but not identical — a pepper could be hardy (survives frost) but finicky about soil pH. The composite gives room for that distinction, especially once soilAdaptability adds another axis in V2.

Tolerance ranges:
- High tolerance (~0.5+) → forgiving, grows in a wide range of conditions — good for beginners or low-maintenance plots
- Medium tolerance (~0.25-0.5) → needs reasonable soil matching — the typical case
- Low tolerance (~0.1-0.25) → demands precise conditions — specialist varieties with high ceiling but high maintenance

### Normalization Rules

Soil factors operate on different native scales. Before delta calculation, all values must be normalized to a common 0-1 range so the modifier math produces comparable results.

| Factor | Native Range | Normalization |
|---|---|---|
| Nitrogen | 0-1 | Already normalized — use raw value |
| Phosphorus | 0-1 | Already normalized — use raw value |
| Potassium | 0-1 | Already normalized — use raw value |
| Moisture | 0-1 | Already normalized — use raw value |
| pH | ~5.0-8.0 | Normalize: `(value - PH_MIN) / (PH_MAX - PH_MIN)` |

pH normalization constants (V1):
```
PH_MIN = 5.0
PH_MAX = 8.0
PH_RANGE = PH_MAX - PH_MIN    // 3.0

normalizedActualPh    = (Soil.conditions.currentPh - PH_MIN) / PH_RANGE
normalizedPreferredPh = (Seed.genetics.soilAffinity.preferredPh - PH_MIN) / PH_RANGE
```

This means a pH delta of 0.3 (e.g., 6.4 vs 6.7) becomes a normalized delta of 0.1 — comparable in scale to an NPK delta of 0.1. Without this normalization, pH deltas would be ~3x larger than NPK deltas in raw terms, making pH disproportionately punishing in the modifier formula.

`preferredPh` is stored in natural units (e.g., 6.4) for readability and player-facing display. Normalization is applied only during formula evaluation.

### Delta Calculation

Each tick (for interaction formulas) or at key moments (for resolution formulas), the game compares the seed's preferred values against the actual soil state. All values are normalized before comparison (see [Normalization Rules](#normalization-rules)):

```
For each soil factor:
  delta = |normalize(Soil.actual) - normalize(Seed.genetics.soilAffinity.preferred)|
```

### Delta-to-Modifier Mapping

#### V1: Plateau + Falloff

The V1 approach uses a two-phase model: a **sweet spot** where small deviations cause no penalty, followed by a **linear falloff** once the deviation exceeds the sweet spot.

```
sweetSpot = tolerance * 0.5

if delta <= sweetSpot:
  factorModifier = 1.0                              // "close enough" — no penalty
else:
  overshoot = delta - sweetSpot
  maxOvershoot = tolerance * 0.5
  factorModifier = max(0, 1 - (overshoot / maxOvershoot))
```

**Why this model:**
- Matches the real-world farming intuition of "good enough" — you don't need exact soil, you need the right ballpark.
- Aligns with the "depth through choice, not complexity" design pillar — the player optimizes toward a range, not a precise number.
- The sweet spot (first half of tolerance) provides a forgiving zone. The falloff (second half) provides a clear signal that something is wrong.
- A modifier of 0.0 at `delta >= tolerance` means the plant is completely outside its viable range for that factor.

Visual representation:

```
modifier
  1.0 |████████████\
      |             \
      |              \
  0.0 |_______________\___________
      0    sweetSpot  tolerance    delta
           (t*0.5)    (t*1.0)
```

#### V2: Bell Curve (future exploration)

A Gaussian falloff for smoother, more nuanced behavior:

```
factorModifier = e^(-(delta^2) / (2 * tolerance^2))
```

This produces a smoother curve with no hard cutoff, allowing more granular optimization for advanced players. To be evaluated during V2 when long-term soil health mechanics (organic matter, compaction, microbial health) add more interacting variables.

### Combining Factor Modifiers

Individual factor modifiers combine into a single `soilModifier`. **pH is special** — it acts as a gatekeeper for nutrient availability (see [SOIL.md § pH and Nutrient Lockout](./data-models/SOIL.md#ph-and-nutrient-lockout)), so it multiplies against the other modifiers rather than averaging with them:

```
nutrientModifier = average(nitrogenModifier, phosphorusModifier, potassiumModifier)
soilModifier     = phModifier * average(nutrientModifier, moistureModifier)
```

This means:
- Perfect NPK with bad pH → low soilModifier (nutrients are locked out)
- Perfect pH with bad NPK → moderate soilModifier (nutrients are available but wrong ratio)
- Bad pH *and* bad NPK → very low soilModifier (compounding problems)

The player's optimization order should be: **get pH right first, then tune NPK ratios, then manage moisture.** The formula structure naturally rewards this approach.

### Worked Example

```
Seed preferences:  pH=6.4  N=0.4  P=0.7  K=0.5  moisture=0.6
Tolerance:         0.3  (derived: 0.75 * hardiness(0.35) + 0.25 * droughtRes(0.15) ≈ 0.30)
Sweet spot:        tolerance * 0.5 = 0.15

Actual soil:       pH=6.2  N=0.7  P=0.6  K=0.5  moisture=0.5

Step 1: Normalize pH
  normalizedActualPh    = (6.2 - 5.0) / 3.0 = 0.40
  normalizedPreferredPh = (6.4 - 5.0) / 3.0 = 0.467

Step 2: Calculate deltas (all values now on 0-1 scale)
  pH:         |0.40 - 0.467| = 0.067
  Nitrogen:   |0.7  - 0.4|   = 0.300
  Phosphorus: |0.6  - 0.7|   = 0.100
  Potassium:  |0.5  - 0.5|   = 0.000
  Moisture:   |0.5  - 0.6|   = 0.100

Step 3: Apply plateau + falloff (sweetSpot=0.15, maxOvershoot=0.15)
  pH:         delta=0.067  → within sweet spot        → 1.00
  Nitrogen:   delta=0.300  → past sweet spot by 0.15  → 1 - (0.15/0.15) = 0.00
  Phosphorus: delta=0.100  → within sweet spot         → 1.00
  Potassium:  delta=0.000  → within sweet spot         → 1.00
  Moisture:   delta=0.100  → within sweet spot         → 1.00

Step 4: Combine (pH as gatekeeper)
  nutrientModifier = average(0.00, 1.00, 1.00)          = 0.67
  soilModifier     = 1.00 * average(0.67, 1.00)          = 0.835

Result: plant grows at 83.5% soil efficiency.
Diagnosis: nitrogen excess is the only problem (modifier = 0.00).
           pH is fine after normalization — the raw 0.2 gap looked worse
           than it actually is on a 3.0-range scale.
Player action: reduce nitrogen fertilization.
```

Note: compare this to the pre-normalization version of this example where pH had a raw delta of 0.2 and produced a modifier of 0.67. With proper normalization, the same 0.2 pH gap becomes a normalized delta of 0.067 — well within the sweet spot. This is why normalization matters: without it, pH would be disproportionately punishing relative to NPK.

---

## Growth Modifier Formula

The soil modifier is one component of the overall growth calculation. Multiple modifier sources combine to produce the final rate at which a plant progresses through its lifecycle.

**Registry IDs:** `F-TEND-001`, `F-HEALTH-001`, `F-GROWTH-001`

### Tending Modifier

The tending modifier reflects active player care. It operates in a narrow range — tending helps but can't compensate for fundamentally wrong conditions.

```
tendingModifier range: 0.9 - 1.15

0.90  — neglected (no tending for extended period)
1.00  — baseline (auto-tend or minimal care)
1.05  — regular active tending
1.10  — consistent active tending with good timing
1.15  — optimal tending (mini-game bonuses, perfect timing)
```

The narrow range is intentional: active play provides a meaningful edge (~15% at peak) without making idle play feel broken. A player who matches soil well but doesn't tend actively still gets good results. A player who tends perfectly on bad soil still struggles.

V1 uses a single short-horizon care memory on the plant:

```
Plant.tending.careScore: 0.0 - 1.0
```

Qualified care actions raise `careScore`. A qualified action must address a real current need, such as:

- corrective watering when moisture is actually off target
- meaningful soil care tied to current conditions
- treatment that resolves an active pest or stress effect
- mini-game success attached to an otherwise valid care action

Repeated unnecessary actions should grant sharply reduced or zero value. The goal is to reward timing and relevance, not spam.

Decay trends toward a floor instead of collapsing to zero in all cases:

```
floor = if Plant.tending.autoTendEnabled then 0.40 else 0.00

careScore_next = floor + (careScore_current - floor) * 0.80
```

`careScore` then maps to the live growth modifier:

```text
if careScore <= 0.40:
  tendingModifier = 0.90 + 0.25 * careScore
else:
  tendingModifier = 1.00 + 0.15 * ((careScore - 0.40) / 0.60)
```

This yields the intended V1 bands:

- `0.00 -> 0.90`
- `0.40 -> 1.00`
- `0.60 -> 1.05`
- `0.80 -> 1.10`
- `1.00 -> 1.15`

Boundary rules:

- tending improves growth rate only in V1
- tending does not directly repair bad soil, bad plot fit, or poor health
- mini-game success should not create a second parallel growth multiplier
- successful pest or stress treatment can improve care quality, while the negative effect itself still routes through health

### Final Growth Modifier

All modifiers combine **multiplicatively** with a **soft cap**:

```
finalGrowthModifier = min(1.25, soilModifier * tendingModifier * healthModifier * plotModifier)
```

Where:
- `soilModifier` — from [Soil-Seed Affinity](#soil-seed-affinity), range 0-1
- `tendingModifier` — from active player care, range 0.9-1.15
- `healthModifier` — from Plant.health (pests, disease, weather effects), range 0-1
- `plotModifier` — from [Plot Data Model](./data-models/PLOT.md#how-plot-interacts-with-formulas), based on stage support and root space

The **1.25 soft cap** means the absolute best case — perfect soil, perfect tending, no health issues — produces 125% of base growth rate. This prevents runaway stacking while still rewarding optimization.

**Why multiplicative, not additive:**
- Bad soil can't be erased by good tending. If soilModifier = 0.5, even perfect tending (1.15) only gets you to 0.575.
- This preserves the importance of genetic matching and soil management as the primary levers. Tending is a multiplier on a good foundation, not a substitute for one.
- Plot choice is part of that same foundation. A plant in the wrong container should not grow at the same rate as one in the right environment.

### Plugging Into Progression

The final growth modifier feeds into per-tick progression:

```
// Each tick:
growthIncrement = baseStageRate * finalGrowthModifier * ticksElapsed
Plant.growth.progress += growthIncrement

if Plant.growth.progress >= 1.0:
  advance to next stage
  Plant.growth.progress = 0.0 (or carry overflow)
```

Where `baseStageRate` is stage-specific and genetics-scaled (see [Lifecycle Stage Formulas](#lifecycle-stage-formulas)).

---

## Lifecycle Stage Formulas

*To be defined — this section will contain the specific formulas for each lifecycle transition.*

### Base Growth Rate by Stage

Each growth stage has its own base duration, and genetics influence stages differently. This allows pepper varieties with distinct growth personalities — fast germinators that mature slowly, or slow starters that finish strong.

**Registry note:** no stage-specific formula IDs are assigned yet. Add registry entries before formalizing any stage progression math beyond placeholders.

```
Stage base rates (ticks to complete at 1.0 modifier — placeholder values for tuning):

  germinating:  baseRate scaled by → Seed.genetics.germinationTime (strong)
  seedling:     baseRate scaled by → Seed.genetics.growingTime (moderate)
  vegetative:   baseRate scaled by → Seed.genetics.growingTime (moderate)
  flowering:    baseRate scaled by → Seed.genetics.growingTime (strong)
  fruiting:     baseRate scaled by → Seed.genetics.growingTime (strong)
  mature:       baseRate (fixed — harvest window, not genetics-dependent)
```

Note: `germinationTime` is a V2 trait. In V1, germination uses `growingTime` as a proxy with moderate influence.

### Remaining Stage Formulas *(to be defined)*

- **Germination** (Seed + Soil → Plant) — progression from planted to seedling
- **Vegetative Growth** (Plant stages) — growth rate through seedling → vegetative → flowering
- **Node Production** (Plant → Nodes) — resolution formula for node count at flowering
- **Pollination** (Node state transitions) — timing, self-pollination window, cross success
- **Fruit Development** (Node → Fruit → maturation) — progression through fruit stages
- **Seed Extraction** (Fruit → Seeds) — resolution formula for seed count and per-seed variance
- **Soil Depletion** (Soil per-tick changes) — how soil degrades during active growing

---

## Open Questions

### Resolved

| Question | Decision | Rationale |
|---|---|---|
| soilAffinity: derived or explicit? | **Explicit field, trait-influenced generation.** Stored on Seed, but other traits bias its values during inheritance/cultivar generation. | Avoids "every high-scoville pepper wants high K" problem. Preserves varietal identity while maintaining trait coherence. |
| tolerance: 1:1 with Hardiness? | **Composite.** V1: `0.75*hardiness + 0.25*droughtResistance`. V2 adds soilAdaptability. | Hardiness = stress survival, not soil forgiveness. Composite avoids overloading one trait. |
| Modifier exceed 1.0? | **No, capped at 1.0 in V1.** Good soil removes penalties, doesn't create bonuses. | Keeps tuning predictable. Expert play rewarded via separate cultivationBonus system if needed later. |
| Tending interaction model? | **Multiplicative with soft cap plus a decaying careScore.** `min(1.25, soil * tending * health * plot)`. Tending range 0.9-1.15 with `1.00` baseline at `careScore = 0.40`. | Bad soil + good tending still struggles. Preserves soil/genetics as primary levers while rewarding timely care. |
| Base growth rate per stage? | **Per-stage rates, scaled by genetics.** Germination by germinationTime, growth stages by growingTime, with varying influence weights. | Enables "fast germinator, slow maturer" variety personalities. |

### Open

- How are the actual `baseStageRate` values tuned? Absolute tick counts per stage, or relative proportions of a total lifecycle?
- Should `soilAffinity.preferredPh` have a range (e.g., 6.2-6.6) instead of a single value, since the sweet spot already provides some tolerance?
- How does `healthModifier` compose from individual status effects? Multiplicative per-effect, or worst-effect-wins?
- What happens at `soilModifier = 0.0`? Does the plant die, stall, or degrade? Is there a minimum growth floor?
- How does idle catchup handle accumulated soil depletion? (e.g., moisture drops to 0 while idle — does the plant retroactively suffer?)
