# Pepper Pirate — Product Requirements Document

## Overview

**Genre:** Incremental / idle game with active gameplay elements

**Premise:** You are a pepper farmer. You are responsible for growing, maintaining, breeding, and utilizing the peppers of the world. You progress by growing peppers, creating crossbreeds and discovering new genetics, and buying, selling, and trading seeds, peppers, and sauces in the market.

**Design Philosophy:**
- **Active-first, idle-supported.** There should always be something to do. Active play is rewarded but idle play is never punished.
- **Respect the player's time.** No real-time pressure mechanics. A player should never feel like they missed out because they stepped away.
- **Reward engagement, don't gate on it.** Optional depth everywhere — players choose how deep they go.

**Primary Fantasy:**
- You are not just growing peppers. You are building pepper bloodlines.
- The player should be able to discover promising crosses, track their ancestry, and turn unstable experiments into stable cultivars with known history.
- Long-term mastery comes from understanding inheritance patterns, selecting breeding stock, and improving consistency across generations.

---

## Core Gameplay Loop

The game operates on three nested loops:

### Inner Loop — Minute-to-Minute

The heartbeat of the game. Even as systems grow complex, the player is always cycling through this.

1. **Plant** — Select seeds and place them in available plots.
2. **Tend** — Water, check soil, handle pests/weather events. Optional mini-games can boost yield or quality.
3. **Breed / Pollinate** — During flowering, assign nodes for selfing or cross-pollination to determine the next generation.
4. **Harvest** — Collect mature peppers from plots.
5. **Decide** — Choose what to do with the harvest:
   - Sell whole peppers on the market
   - Extract seeds for future planting
   - Process into products (e.g., sauces)

**Idle behavior:** Peppers grow passively. With upgrades (e.g., auto-watering), tending can be automated at base effectiveness. Harvests queue up for the player to collect and make decisions on return.

### Mid Loop — Session-to-Session

Where strategy lives. Players are making choices about what kind of farm they're building.

1. **Breed** — Cross two peppers to discover new varieties, guided by a visible genetics system. Players start new lines, inspect ancestry, and selectively reinforce traits across generations. Optional mini-game for improved (but not guaranteed) breeding odds. Opting out uses base probabilities with no penalty.
2. **Expand** — Purchase more plots, upgrade infrastructure (irrigation, greenhouses, soil quality, tools).
3. **Trade** — Buy and sell seeds, peppers, and products on the market. Market prices are fixed per season (no real-time pressure). Forecast modeling for upcoming seasons provides strategic depth.
4. **Discover** — Unlock new pepper families, trait combinations, and recipes. Fill out a pepper catalog/index tracking all discovered varieties, notable bloodlines, and stable cultivars.

### Outer Loop — Season-to-Season (Prestige)

What keeps players coming back. Each season is a fresh puzzle with accumulated knowledge.

1. **Season ends** — Evaluate performance (yield, varieties discovered, profit, goals met).
2. **Carry over** — Keep seed library (or a subset); lose plots and infrastructure.
3. **New season** — New climate/zone, new market prices, potentially new challenges.
4. **Permanent unlocks** — Meta-progression that persists across all seasons (e.g., new zones available, trait knowledge, tools, recipes).

**V1 scope:** Seasons exist as a structural mechanic — the cycle happens and the player progresses through seasons. Depth of seasonal impact (weather variation, zone mechanics, climate effects, roguelike elements) is deferred to later versions.

---

## Core Systems

### Growing

The foundational system. Peppers are planted, grow over time, and are harvested.

- Plots have properties (soil quality, sunlight, water level) that affect growth.
- Different pepper varieties have different growth times, yield rates, and environmental preferences.
- Tending (watering, pest control, etc.) can be done actively for bonuses or left to idle/automated systems at base effectiveness.

### Breeding / Genetics

The core mid-game engagement driver. Players cross parent plants to produce offspring with inherited traits, build lineages, and stabilize cultivars across generations.

For full details on the genetics system — including design principles, high-level requirements, definitions, and the stability model — see [GENETICS.md](./GENETICS.md).

### Market / Trading

The economic layer.

- Players buy and sell seeds, raw peppers, and processed products.
- **No real-time price pressure.** Prices are fixed for the duration of a season.
- Prices change between seasons, creating planning opportunities.
- Forecast modeling: players can attempt to predict future market conditions and plan crops accordingly.
- Rare genetics and unique varieties have market value.

### Seasons (Prestige)

The meta-progression and reset mechanic.

- Each season represents a growing year.
- Prestige is measured by how many seasons the player has completed.
- Between seasons, players retain their seed library but reset infrastructure.
- Future versions will introduce: varied climates/zones, random weather events, map-based farm selection, and roguelike seasonal modifiers.

### Mini-Games

An optional engagement layer woven throughout the game.

- Mini-games are available in almost every core activity (breeding, tending, harvesting, processing, and potentially others).
- **Always optional.** Skipping a mini-game applies base probabilities / default outcomes. No punishment for opting out.
- **Reward-based.** Opting in provides *potential* for improved results but does not guarantee them.
- Specific mini-game designs are TBD. The system should be flexible enough to support different mini-game types across different activities.

### Processing (Late Game)

Converting raw peppers into higher-value products.

- Sauce-making is one processing path — specific recipes require specific pepper combinations.
- Additional processing paths TBD.
- Encourages maintaining diverse crops rather than monoculturing the most profitable pepper.
- Potential for "hot sauce challenge" mode or similar late-game activities.

---

## Design Pillars

| Pillar | Meaning |
|---|---|
| Always something to do | Active players should never be idle. Breeding, trading, mini-games, and tending fill gaps between harvests. |
| Never punished for absence | Idle progress is meaningful. No expiring offers, no real-time market swings, no missed windows. |
| Depth through choice, not complexity | Systems are simple to engage with at the surface but reward players who dig deeper (genetics, market forecasting, mini-game mastery). |
| Each season is a fresh puzzle | Prestige resets should feel like a new challenge, not a grind through the same content. |
| Lineage is gameplay | Seed ancestry is not flavor text. Tracking, understanding, and improving bloodlines is one of the core progression systems. |
| Stability must be legible | Players should understand why a pepper is stable or unstable and what actions will change that. |

---

## Open Questions

- What specific mini-games will be used for each activity?
- How much of the seed library carries over between seasons? All, a limited selection, or player's choice?
- What permanent meta-unlocks exist across seasons?
- What does the pepper catalog / discovery index look like?
- What processing paths exist beyond sauce-making?
- How does the forecast modeling system work in practice?
- What are the roguelike elements for seasons (maps, weather, zone selection)?
- Tech stack and platform targets?
