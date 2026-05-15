# Pepper Almanac

This document defines the baseline pepper corpus for Pepper Pirate. It is a design reference first and a player-facing reference second.

The goal is to give each pepper archetype:
- a recognizable gameplay identity
- a baseline trait profile
- a baseline soil affinity profile
- enough variance room for individual seeds and bloodlines to differ from the default

These values are not meant to represent every real-world specimen exactly. They define the expected starting profile for peppers in-game before lineage variance, breeding, stability, and environmental effects shift a specific seed away from its baseline.

> Related docs: [PRD.md](./PRD.md) | [GENETICS.md](./GENETICS.md) | [LIFECYCLE-FORMULAS.md](./LIFECYCLE-FORMULAS.md) | [SEED.md](./data-models/SEED.md) | [SOIL.md](./data-models/SOIL.md)

## Rarity System

### Core Principle

**Rarity describes how unusual a seed is in the world, not how powerful it is.** A Legendary seed is not guaranteed to outperform a well-bred Common cultivar. Rarity signals scarcity, specialization, and deviation from the norm — not universal superiority. Lineage and stability remain the primary path to mastery.

### Tiers

| Tier | World Meaning | Gameplay Feel |
|---|---|---|
| **Common** | Widely available, core peppers, broad market presence | Bread and butter. Easy to find, forgiving to grow, strategically relevant through stability and yield. |
| **Uncommon** | Less frequent but accessible through normal play. Slightly more specialized or regionally distinct. | "That's a good one." Worth keeping, may have a niche strength or unusual combination. |
| **Rare** | Uncommon market appearances, lower wild-find rates. More likely to carry unusual trait distributions. | Active pursuit target. Demands more from the player in soil, tending, or stabilization. |
| **Exotic** | Hard to obtain. Often tied to specialty traders, advanced discovery, or specific regions. Demanding profiles. | Trophy-tier. Unusual flavor, extreme heat, odd breeding value, or tight soil demands. |
| **Legendary** | Extremely scarce. Event-, zone-, or progression-gated. Cannot be bought from standard markets. | Prestige content. Feels singular and prestigious, not just numerically superior. |

### Archetype Rarity vs. Seed Rarity

Rarity operates at **two levels**:

1. **Archetype baseline rarity** — stored in this Almanac. Describes how common the pepper type is in the game world. Bell Peppers are Common. Ghost Peppers are Exotic.

2. **Seed instance rarity** — stored on the individual seed ([SEED.md](./data-models/SEED.md)). Floors at the archetype baseline but can **elevate** based on how far the seed's genetics have deviated from its type's normal profile through breeding.

A Bell Pepper is Common by default. But a Bell Pepper line that has been selectively bred over 8 generations to achieve exceptional yield AND drought resistance — a combination that doesn't exist in the baseline archetype — is genuinely unusual. That seed's rarity elevates to Uncommon (or higher) because it represents something rare in the world, not because its stats are "better."

### Rarity Elevation Rules

- **Rarity can only go up from archetype baseline, never down.** A bad Ghost Pepper seed is still Exotic.
- **Elevation is based on deviation from archetype, not raw magnitude.** A Bell Pepper at 0.95 yield is remarkable for a Bell Pepper. A Cayenne at 0.72 yield is baseline. Same number, different rarity implication.
- **Stability matters.** An unstable spike in one seed doesn't elevate rarity — it's noise. Locked, stable deviations across a line do. Rarity elevation rewards breeding mastery, not luck.
- **Tradeoffs persist.** A Bell Pepper that became Uncommon through exceptional yield still has Bell Pepper tolerance and growing time. It didn't become a better type — it became an exceptional instance of its type.
- **Legendary is never assigned to standard Almanac archetypes.** Reserved for event/quest/discovery content and exceptional player-bred lines.

### Rarity and Existing Systems

| System | How Rarity Interacts |
|---|---|
| **Acquisition** | Higher archetype rarity = lower spawn rates in wild finds, markets, and traders. Primary effect of rarity. |
| **Market value** | Rarer peppers command higher prices. Elevated seed rarity also increases sale value. |
| **Soil / Tolerance** | Higher archetype rarity generally correlates with narrower tolerance and more demanding soil profiles. Not a rule, but a design tendency. |
| **Stabilization** | Rarer archetypes tend to be harder to stabilize — wider initial variance, more generations needed. |
| **Discovery / Collection** | Encountering a new Rare+ archetype is a season-defining moment. Elevating a seed's rarity through breeding is a mid-loop achievement. |
| **Breeding** | Rarity does not directly affect breeding formulas. Genetics and stability drive outcomes. Rarity is an emergent *result* of breeding, not an input. |

### V1 vs V2 Scope

**V1:** Store rarity on each seed. Compute from archetype baseline + simple deviation check (how many traits fall outside the archetype's typical range, weighted by stability). Keep the formula lightweight.

**V2:** Richer computation factoring in multi-trait deviation patterns, stability depth, market/collector recognition, and possibly player-named cultivar status influencing perceived rarity.

## Usage

Use this Almanac for:
- defining wild stock and market stock baselines
- setting starting trait ranges for named pepper types
- informing seed generation and cultivar generation
- giving players a quick reference for likely soil preparation

Do not use this Almanac for:
- overriding a specific seed's actual genetics
- treating all peppers of a type as genetically identical
- bypassing lineage or stability systems

## Baseline Conventions

### Numeric Trait Scales

Non-Scoville trait values use a normalized `0.0 - 1.0` scale unless otherwise noted.

| Trait | Meaning of Low End | Meaning of High End |
|---|---|---|
| Yield | Very low fruit output | Very high fruit output |
| Growing Time | Very fast maturity | Very slow maturity |
| Hardiness | Very fragile | Very resilient |
| Drought Resistance | Needs frequent watering | Handles dry conditions well |
| Ratoon Ability | One harvest, little regrowth | Strong multi-harvest potential |
| Tolerance | Narrow soil sweet spot | Forgiving soil sweet spot |

### Soil Affinity Fields

These align with [LIFECYCLE-FORMULAS.md](./LIFECYCLE-FORMULAS.md#soil-seed-affinity):

- `preferredPh` uses natural pH units
- `preferredNitrogen`, `preferredPhosphorus`, `preferredPotassium`, and `preferredMoisture` use `0.0 - 1.0`
- `tolerance` is shown here as a baseline outcome for the pepper archetype, even though runtime seeds derive it from genetics

### Baseline Range Semantics

Each pepper entry includes:
- `Baseline`: the expected midpoint for unknown stock of that pepper type
- `Typical Range`: the normal spread for stable or near-stable examples

This gives room for:
- unknown stock variation
- early-generation noise
- line stabilization through breeding

---

## Core Almanac

### Bell Pepper

**Species:** `Capsicum annuum`
**Baseline Rarity:** Common
**Role:** beginner-friendly, low heat, high yield, forgiving grower

| Attribute | Baseline | Typical Range |
|---|---|---|
| Scoville | 0 SHU | 0 - 500 SHU |
| Yield | 0.75 | 0.65 - 0.85 |
| Growing Time | 0.62 | 0.55 - 0.70 |
| Hardiness | 0.68 | 0.58 - 0.78 |
| Drought Resistance | 0.42 | 0.32 - 0.52 |
| Ratoon Ability | 0.28 | 0.15 - 0.40 |
| Flavor Profile | sweet, vegetal, mild | sweet to grassy |
| preferredPh | 6.4 | 6.2 - 6.6 |
| preferredNitrogen | 0.45 | 0.35 - 0.55 |
| preferredPhosphorus | 0.62 | 0.52 - 0.72 |
| preferredPotassium | 0.50 | 0.40 - 0.60 |
| preferredMoisture | 0.66 | 0.56 - 0.74 |
| Tolerance | 0.48 | 0.40 - 0.55 |

**Soil Prep Snapshot:** balanced fertility, slightly phosphorus-forward, consistent moisture, near-neutral slightly acidic pH.

### Jalapeno

**Species:** `Capsicum annuum`
**Baseline Rarity:** Common
**Role:** foundational mid-heat cultivar, stable benchmark pepper

| Attribute | Baseline | Typical Range |
|---|---|---|
| Scoville | 6000 SHU | 3500 - 9000 SHU |
| Yield | 0.68 | 0.58 - 0.78 |
| Growing Time | 0.54 | 0.46 - 0.62 |
| Hardiness | 0.62 | 0.52 - 0.72 |
| Drought Resistance | 0.50 | 0.40 - 0.60 |
| Ratoon Ability | 0.42 | 0.30 - 0.52 |
| Flavor Profile | grassy, bright, moderately hot | grassy to slightly smoky |
| preferredPh | 6.3 | 6.1 - 6.5 |
| preferredNitrogen | 0.42 | 0.34 - 0.50 |
| preferredPhosphorus | 0.60 | 0.50 - 0.68 |
| preferredPotassium | 0.58 | 0.48 - 0.66 |
| preferredMoisture | 0.60 | 0.52 - 0.68 |
| Tolerance | 0.44 | 0.36 - 0.52 |

**Soil Prep Snapshot:** balanced soil with a slight phosphorus and potassium lean; moderate moisture; versatile baseline reference for players.

### Poblano

**Species:** `Capsicum annuum`
**Baseline Rarity:** Uncommon
**Role:** mild specialty pepper, slower but flavorful and meaty

| Attribute | Baseline | Typical Range |
|---|---|---|
| Scoville | 1750 SHU | 1000 - 3000 SHU |
| Yield | 0.58 | 0.48 - 0.68 |
| Growing Time | 0.64 | 0.56 - 0.72 |
| Hardiness | 0.56 | 0.46 - 0.66 |
| Drought Resistance | 0.40 | 0.30 - 0.50 |
| Ratoon Ability | 0.34 | 0.24 - 0.44 |
| Flavor Profile | earthy, rich, mildly sweet | earthy to smoky |
| preferredPh | 6.4 | 6.2 - 6.6 |
| preferredNitrogen | 0.40 | 0.32 - 0.48 |
| preferredPhosphorus | 0.64 | 0.56 - 0.72 |
| preferredPotassium | 0.54 | 0.46 - 0.62 |
| preferredMoisture | 0.64 | 0.56 - 0.72 |
| Tolerance | 0.40 | 0.32 - 0.48 |

**Soil Prep Snapshot:** steady moisture and fruiting-focused fertility; less forgiving than bell peppers but still approachable.

### Cayenne

**Species:** `Capsicum annuum`
**Baseline Rarity:** Uncommon
**Role:** productive heat workhorse, strong processing pepper

| Attribute | Baseline | Typical Range |
|---|---|---|
| Scoville | 40000 SHU | 25000 - 50000 SHU |
| Yield | 0.72 | 0.62 - 0.82 |
| Growing Time | 0.52 | 0.44 - 0.60 |
| Hardiness | 0.58 | 0.48 - 0.68 |
| Drought Resistance | 0.56 | 0.46 - 0.66 |
| Ratoon Ability | 0.46 | 0.34 - 0.56 |
| Flavor Profile | sharp, earthy, direct heat | sharp to slightly fruity |
| preferredPh | 6.2 | 6.0 - 6.4 |
| preferredNitrogen | 0.36 | 0.28 - 0.44 |
| preferredPhosphorus | 0.58 | 0.48 - 0.66 |
| preferredPotassium | 0.66 | 0.58 - 0.74 |
| preferredMoisture | 0.52 | 0.44 - 0.60 |
| Tolerance | 0.42 | 0.34 - 0.50 |

**Soil Prep Snapshot:** keep nitrogen controlled, favor potassium for heat and maturation, avoid overwatering.

### Serrano

**Species:** `Capsicum annuum`
**Baseline Rarity:** Uncommon
**Role:** fast, reliable, compact heat producer

| Attribute | Baseline | Typical Range |
|---|---|---|
| Scoville | 18000 SHU | 10000 - 25000 SHU |
| Yield | 0.70 | 0.60 - 0.80 |
| Growing Time | 0.46 | 0.38 - 0.54 |
| Hardiness | 0.60 | 0.50 - 0.70 |
| Drought Resistance | 0.54 | 0.44 - 0.64 |
| Ratoon Ability | 0.44 | 0.32 - 0.54 |
| Flavor Profile | bright, grassy, crisp heat | bright to slightly citrusy |
| preferredPh | 6.2 | 6.0 - 6.4 |
| preferredNitrogen | 0.40 | 0.32 - 0.48 |
| preferredPhosphorus | 0.56 | 0.48 - 0.64 |
| preferredPotassium | 0.62 | 0.54 - 0.70 |
| preferredMoisture | 0.56 | 0.48 - 0.64 |
| Tolerance | 0.43 | 0.35 - 0.51 |

**Soil Prep Snapshot:** slightly leaner moisture than bell or poblano; balanced feed with a modest potassium bias.

### Habanero

**Species:** `Capsicum chinense`
**Baseline Rarity:** Rare
**Role:** premium high-heat fruit, slower and more demanding

| Attribute | Baseline | Typical Range |
|---|---|---|
| Scoville | 225000 SHU | 150000 - 325000 SHU |
| Yield | 0.56 | 0.46 - 0.66 |
| Growing Time | 0.72 | 0.64 - 0.80 |
| Hardiness | 0.38 | 0.28 - 0.48 |
| Drought Resistance | 0.46 | 0.36 - 0.56 |
| Ratoon Ability | 0.52 | 0.40 - 0.62 |
| Flavor Profile | fruity, floral, intense heat | tropical fruit to citrus-floral |
| preferredPh | 6.1 | 5.9 - 6.3 |
| preferredNitrogen | 0.30 | 0.22 - 0.38 |
| preferredPhosphorus | 0.58 | 0.50 - 0.66 |
| preferredPotassium | 0.74 | 0.66 - 0.82 |
| preferredMoisture | 0.54 | 0.46 - 0.62 |
| Tolerance | 0.28 | 0.20 - 0.36 |

**Soil Prep Snapshot:** warm, precise, potassium-heavy setup; avoid excess nitrogen and avoid soil drift.

### Thai Bird

**Species:** `Capsicum frutescens`
**Baseline Rarity:** Uncommon
**Role:** prolific small-fruit heat pepper with strong repeat harvest value

| Attribute | Baseline | Typical Range |
|---|---|---|
| Scoville | 85000 SHU | 50000 - 100000 SHU |
| Yield | 0.78 | 0.68 - 0.88 |
| Growing Time | 0.48 | 0.40 - 0.56 |
| Hardiness | 0.52 | 0.42 - 0.62 |
| Drought Resistance | 0.60 | 0.50 - 0.70 |
| Ratoon Ability | 0.58 | 0.46 - 0.68 |
| Flavor Profile | sharp, clean, fast heat | sharp to slightly fruity |
| preferredPh | 6.2 | 6.0 - 6.4 |
| preferredNitrogen | 0.38 | 0.30 - 0.46 |
| preferredPhosphorus | 0.60 | 0.52 - 0.68 |
| preferredPotassium | 0.68 | 0.60 - 0.76 |
| preferredMoisture | 0.50 | 0.42 - 0.58 |
| Tolerance | 0.41 | 0.33 - 0.49 |

**Soil Prep Snapshot:** relatively forgiving for a hot pepper; moderate moisture and strong potassium support frequent fruiting.

### Ghost Pepper

**Species:** `Capsicum chinense`
**Baseline Rarity:** Exotic
**Role:** elite late-game heat line with low forgiveness and high payoff

| Attribute | Baseline | Typical Range |
|---|---|---|
| Scoville | 950000 SHU | 700000 - 1150000 SHU |
| Yield | 0.42 | 0.32 - 0.52 |
| Growing Time | 0.82 | 0.74 - 0.90 |
| Hardiness | 0.26 | 0.18 - 0.34 |
| Drought Resistance | 0.34 | 0.24 - 0.44 |
| Ratoon Ability | 0.50 | 0.38 - 0.60 |
| Flavor Profile | smoky, fruity, brutal heat | smoky-fruity to earthy |
| preferredPh | 6.0 | 5.8 - 6.2 |
| preferredNitrogen | 0.24 | 0.18 - 0.30 |
| preferredPhosphorus | 0.56 | 0.48 - 0.64 |
| preferredPotassium | 0.80 | 0.72 - 0.88 |
| preferredMoisture | 0.48 | 0.40 - 0.56 |
| Tolerance | 0.22 | 0.15 - 0.30 |

**Soil Prep Snapshot:** highly specialized soil profile; low nitrogen, high potassium, tight pH control, and minimal overwatering.

---

## Soil Preparation Heuristics

These are player-facing shortcuts, not exact formulas.

| Pepper Type | Rarity | Soil Approach |
|---|---|---|
| Bell Pepper | Common | Balanced soil, moderate-high moisture, fruiting support without extremes |
| Jalapeno | Common | Balanced baseline reference; slight phosphorus and potassium support |
| Poblano | Uncommon | Moisture-consistent, phosphorus-forward, steady fruiting conditions |
| Cayenne | Uncommon | Lower nitrogen, higher potassium, slightly drier management |
| Serrano | Uncommon | Balanced but leaner moisture than mild peppers |
| Habanero | Rare | Precise pH, restrained nitrogen, high potassium |
| Thai Bird | Uncommon | Productive hot-pepper setup with moderate moisture and strong potassium |
| Ghost Pepper | Exotic | Specialist soil management with very tight tolerances |

## Design Notes

- Mild and beginner-friendly peppers should generally have higher tolerance and broader typical ranges.
- Premium heat peppers should generally have narrower tolerance and more punishing soil demands.
- Soil affinity should support player intuition:
  - fruiting peppers tend to like stronger phosphorus support
  - extreme heat peppers tend to skew toward stronger potassium support
  - drought-sensitive peppers tend to want higher moisture
- Higher archetype rarity should generally correlate with specialization and tradeoffs, not universal superiority. Common peppers should remain strategically relevant through stability, yield, and ease of cultivation.
- Legendary is prestige content, not mandatory progression content. Never assign Legendary to standard real-world baseline archetypes.
- The Almanac should remain readable to players. If more fields are added later, consider splitting this into:
  - `Player Almanac` for simplified reference
  - `Designer Almanac` for full baseline formulas and hidden values

## Open Questions

- Which peppers make up the actual starting roster in V1?
- Should the player see exact numeric baseline values, approximate bands, or both?
- Should wild stock always spawn from Almanac baselines, or can some wild seeds belong to hidden regional variants?
- Do named stabilized cultivars get their own Almanac entries, or only species/common-type archetypes?
- What is the exact rarity elevation formula for V1? (How many traits outside typical range, at what stability threshold, to move from e.g. Common → Uncommon?)
- Is there a cap on how far a seed's rarity can elevate above its archetype baseline? (e.g., can a Common pepper ever reach Exotic through breeding alone?)
