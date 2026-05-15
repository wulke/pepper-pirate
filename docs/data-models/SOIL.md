# Soil Data Model

**Soil** defines the growing conditions of a plot. Soil properties directly interact with seed genetics to determine growth outcomes — a pepper bred for high yield needs different soil conditions than one bred for heat tolerance. Managing soil is a core part of the tending loop.

> Related models: [Plant](./PLANT.md) | [Seed](./SEED.md) | [Overview](./PEPPER.md)

## Design Goals

- Soil is a per-plot property, not global. Different plots can have different soil profiles.
- Soil interacts with seed genetics — matching soil to a pepper's needs is a player skill.
- Active tending (fertilizing, adjusting pH, watering) modifies soil state. Neglect causes degradation.
- Overmanagement has consequences (over-fertilizing, salt buildup) — brute force is not optimal.
- Some soil properties are base characteristics of a plot (hard to change), others are actively managed.

## Proposed Object Shape

```ts
type PlotId = string;

type Soil = {
  id: PlotId; // 1:1 with the plot this soil belongs to

  // Base properties — inherent to the plot, difficult/expensive to change
  base: {
    texture: "sand" | "sandy_loam" | "loam" | "clay_loam" | "clay";
    naturalDrainage: number;             // 0-1, how quickly water moves through naturally
    basePhLevel: number;                 // natural resting pH if left unamended (e.g. 5.5-8.0)
  };

  // Nutrients — actively managed by the player
  nutrients: {
    nitrogen: number;                    // 0-1, current available N
    phosphorus: number;                  // 0-1, current available P
    potassium: number;                   // 0-1, current available K
  };

  // Managed conditions — player adjusts these through tending
  conditions: {
    currentPh: number;                   // current effective pH (6.0-6.8 ideal for most peppers)
    currentDrainage: number;             // effective drainage (base + amendments)
    waterRetention: number;              // 0-1, how long water stays available to roots
    moistureLevel: number;               // 0-1, current water content
  };

  // V2 properties — long-term soil health
  health: {
    organicMatter: number;               // 0-1, slow-building, improves nutrient retention and structure
    compaction: number;                   // 0-1, increases with use, degrades root growth and drainage
    microbialHealth: number;             // 0-1, bonus multiplier for nutrient uptake
    salinity: number;                    // 0-1, builds from over-fertilizing, inhibits growth
  };

  // History and state
  state: {
    lastAmendedAtTick?: number;
    lastPlantedSeason?: number;
    consecutiveSeasonsUsed: number;      // contributes to compaction in V2
    currentPlantId?: string;             // plant currently growing in this plot, if any
  };
};
```

## Soil-Genetics Interaction

Soil properties interact directly with seed genetic traits. The player's job is to match soil conditions to a pepper's genetic needs.

| Soil Factor | Interacts With (Seed Trait) | Relationship |
|---|---|---|
| Nitrogen | Yield, Growing time | High N promotes vegetative growth. Excess N → leafy plant with fewer/smaller fruits. |
| Phosphorus | Yield, Ratoon ability | High P promotes flowering and fruiting. Critical for node production and fruit quality. |
| Potassium | Hardiness, Scoville level | High K promotes overall health, disease resistance, and fruit maturation. |
| pH | All traits (indirect) | Wrong pH causes nutrient lockout — nutrients are present but unavailable to the plant. Each pepper variety has a preferred pH range. |
| Drainage | Drought resistance | Fast drainage + low drought resistance = plant dries out quickly. Slow drainage + overwatering = root rot. |
| Water retention | Drought resistance | High retention benefits drought-sensitive varieties. Low retention pairs well with drought-resistant varieties in arid zones. |
| Texture | Multiple (indirect) | Base property that influences drainage, retention, and nutrient behavior. Sandy = drains fast, holds few nutrients. Clay = retains water, compacts easily. Loam = balanced. |

### Nutrient Balance Model

NPK nutrients are not "more is better." Each pepper variety has a preferred ratio, and the player needs to find the right balance.

```
Example preferred ratios (conceptual):

High-yield pepper:      N=0.4  P=0.7  K=0.5  (heavy phosphorus for fruiting)
Fast-growing pepper:    N=0.7  P=0.4  K=0.4  (heavy nitrogen for vegetative growth)
High-scoville pepper:   N=0.3  P=0.5  K=0.7  (heavy potassium for capsaicin/maturation)
Hardy/resilient pepper: N=0.4  P=0.4  K=0.7  (heavy potassium for stress tolerance)
```

Over-fertilizing any single nutrient has diminishing returns and can cause negative effects:
- **Excess N** → lush foliage but reduced fruiting, lower yield per node
- **Excess P** → can lock out other micronutrients (zinc, iron)
- **Excess K** → can lock out calcium and magnesium uptake

### pH and Nutrient Lockout

pH acts as a gatekeeper for nutrient availability. Even if NPK levels are high, plants can't absorb them at the wrong pH.

```
Simplified nutrient availability by pH:

pH 5.0-5.5:  N limited,    P limited,    K available
pH 5.5-6.0:  N available,  P limited,    K available
pH 6.0-6.8:  N available,  P available,  K available   ← ideal range
pH 6.8-7.5:  N available,  P decreasing, K decreasing
pH 7.5+:     N decreasing, P locked out,  K locked out
```

This creates a puzzle layer: the player needs to get pH right *first*, then manage NPK ratios. A player dumping fertilizer into a plot with wrong pH is wasting resources.

## Soil Texture Properties

Texture is the base property of a plot — it defines the starting character that everything else builds on.

| Texture | Drainage | Water Retention | Nutrient Retention | Compaction Risk | Notes |
|---|---|---|---|---|---|
| Sand | Very high | Very low | Very low | None | Drains fast, nutrients wash out. Needs frequent fertilizing and watering. |
| Sandy loam | High | Low-medium | Low-medium | Low | Better than sand, still drains quickly. Good for drought-resistant varieties. |
| Loam | Medium | Medium | Medium-high | Medium | The balanced option. Works for most varieties without heavy amendment. |
| Clay loam | Low-medium | High | High | High | Retains water and nutrients well, but compacts. Good for nutrient-hungry varieties. |
| Clay | Low | Very high | Very high | Very high | Waterlogging risk, compacts hard. Needs drainage amendments. Rich but demanding. |

## V1 vs V2 Scope

### V1 (MVP)

Core soil management that directly impacts the growing loop:

- **Soil texture** — base plot property, determines starting drainage/retention/nutrient behavior
- **NPK nutrients** — actively managed, player adds fertilizer and manages ratios
- **pH** — player adjusts to match pepper preferences, gates nutrient availability
- **Drainage and water retention** — interact with watering tending actions and drought resistance trait
- **Moisture level** — current water content, depletes over time, replenished by watering/rain

### V2 (MVP+)

Long-term soil health and degradation mechanics:

- **Organic matter** — slow-building investment that improves everything. Rewards players who care for their soil over time. Lost on prestige reset.
- **Compaction** — degradation from consecutive use. Forces crop rotation or remediation investment. Reduces root growth, drainage, and nutrient uptake.
- **Microbial health** — bonus multiplier for nutrient absorption. Built through consistent organic soil care. Could tie into tending mini-games.
- **Salinity** — consequence of over-fertilizing. Builds up gradually, inhibits growth. Requires remediation (flushing with water, adding gypsum). Prevents brute-force nutrient dumping.

## Open Questions

- How does soil interact with seasons/prestige? Is soil state fully reset, partially retained, or plot-dependent?
- Can the player buy soil amendments (compost, lime, sulfur, perlite) as market items?
- Do different zones (V2 seasons) come with different base soil textures?
- Should the player be able to see a soil analysis screen with current NPK/pH levels, or is some of it hidden/estimated?
- How does rain/weather (V2) affect moisture and nutrient levels?
- Is crop rotation a mechanic? (e.g., planting the same pepper type repeatedly degrades specific nutrients faster)
