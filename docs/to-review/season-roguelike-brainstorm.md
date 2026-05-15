# Season Roguelike Design — Brainstorm

status: `approved`
@source: [PRD.md](../PRD.md), [season-cycle.md](../process-flows/season-cycle.md), [SEASON specs](../specs/SEASON.md)

> **Decisions incorporated:** All open questions resolved in design grilling session (2026-05-14). New decisions added below each section and to [SEASON.md](../specs/SEASON.md) (SEASON-021 through SEASON-038).

---

## Why This Design

The original Season model described a prestige reset (lose infrastructure, keep seeds, new market prices) but lacked a structural hook that made each Season feel like a distinct, meaningful run. Without that, players are optimizing the same loop repeatedly with diminishing novelty.

The roguelike frame solves this by making each Season a puzzle with a unique starting configuration and a clear evaluation target. Players aren't just "doing another season" — they're running a specific contract under specific Zone conditions, and improving their meta-game to handle harder contracts in future runs.

This also unblocks Market and Mini-game system design, which were previously underconstrained — both systems now have a structural context (Zone, Contract, Prestige) they can be designed against.

---

## Campaign Arc (Zone Map)

Seasons are grouped into bounded campaigns. Each campaign is a traversal of a procedurally generated Zone map — a branching path of Zones from a starting point to a capstone boss season.

**Campaign structure:**
- **Bounded run:** Each campaign has a defined start and end. Completing the boss season concludes the campaign; a new map is generated for the next run.
- **Variable length:** Campaign length varies by path chosen through the map. Shorter paths finish faster but offer less time for breeding depth. Longer paths face harder Zone conditions but greater payoff. Typical range: 4–8 seasons per campaign.
- **Map visibility:** The full map structure and Zone types are visible from the start of the campaign. Specific contract options and Zone conditions sharpen progressively as the player approaches each node. The boss season is always visible on the horizon from turn one.
- **Reset:** Each campaign is a hard prestige reset — seed carryover limit applies, meta-unlocks persist, plots and infrastructure are lost. Persistent world elements are deferred.

**Run 1 as tutorial:** The first campaign map is predetermined. Zone draft (the ability to choose between Zone options) unlocks after completing the first campaign, marking the transition from learning to mastery.

---

## Zone Variance

Each Season begins with a Zone configuration assigned at the start of the run. The Zone defines the environmental starting conditions the player must work within.

**Zone dimensions (proposed):**
- **Environment type** — e.g. humid valley, arid highland, coastal lowland. Affects which pepper archetypes thrive naturally.
- **Weather pattern** — e.g. high rainfall, drought, stable. Affects water/irrigation management and growth rate modifiers.
- **Soil quality baseline** — e.g. rich loam, depleted clay, sandy. Affects which soil upgrades have leverage and which seeds are viable without amendment.

**Design intent:** Zone variance creates replayability because the optimal grow/breed strategy changes with the Zone. A strategy that worked in a humid valley may be inefficient in an arid highland. Players learn to read the Zone and adapt, rather than running a fixed "optimal" strategy every season.

**Zone reveal timing:** The Zone type is visible on the map before the campaign begins. Specific conditions (weather severity, soil modifier values) reveal as the player approaches.

**Zone draft:** Unlocked after completing the first campaign. Gives the player a choice between 2 Zone options at each map node rather than a fixed assignment. Pool size may expand via further meta-progression.

---

## Challenge Contracts

Each Season presents a Challenge Contract — a set of objectives that give the run direction and create a scoring target beyond raw profit.

**Contract structure:**
- **Visible objectives** — shown to the player at season start. Example: "Harvest 15 peppers with heat ≥ 80, AND achieve 400g profit."
- **Hidden objectives** — revealed during the season when a trigger condition is met. Triggers are tied to genetics or discovery achievements (e.g., breeding a specific pepper variety or unlocking a pepper type). Hidden objectives reward players who engage deeply with the core loop, not just action counts. The contract UI shows a telegraphed `?` slot so players know something is lurking and can actively hunt for the trigger.
- **Difficulty tiers** — each contract type has multiple difficulty variants. Higher tiers have stricter objectives, greater rewards, and a second hidden objective. Tier access is gated by meta-progression.

**Hidden objective count:** 1 per contract at base tiers. Higher-difficulty tiers add a second hidden objective. Design avoids checklist feel — objectives are discoveries, not tasks.

**Challenge Contract types (examples, not exhaustive):**
- *Genetics contract* — achieve a specific trait combination or stability tier in a lineage
- *Market contract* — hit a profit target within a constrained tradeable category (e.g. seeds only, no whole peppers)
- *Discovery contract* — breed or stabilize N new pepper varieties not seen in a previous season
- *Efficiency contract* — achieve yield targets with a limited plot count or plot budget
- *Combo contract* — multi-system challenge combining genetics + market + yield targets

**Contract assignment:** Hybrid draft. At season start, the player is presented with 2–3 contract options and picks one. Early meta-progression starts players with 2 options; a meta-unlock expands the pool to 3. This preserves strategic agency while guaranteeing variance.

**Meta-progressing contracts:** As the player completes contracts, new contract types unlock. Early runs offer simpler, single-dimension contracts. Later runs offer combo contracts that require mastery across multiple systems.

**Contract rewards:** Every contract completion awards a reward. Reward types vary by contract:
- **Run-scoped rewards** — e.g. rare seed packs available only for the current campaign
- **Vendor NPC unlocks** — new specialists or traders that expand available options
- **Permanent mechanic unlocks** — new depth in breeding, soil, mini-games, or other systems

---

## Campaign Capstone — Boss Season

The final node on every Zone map is a Boss Season: a uniquely demanding season that tests everything the player built during the campaign.

**Boss season characteristics:**
- **Weather theme** — severe, escalating weather events throughout the season
- **Survival and output objectives** — e.g. keep N plants alive through the weather, sell X peppers, produce X hot sauces
- **Requires early planning** — objectives are calibrated such that a player who optimized myopically each prior season will struggle; a player who built with the endgame in mind will be positioned to succeed
- **Visually and thematically distinct** — the boss Zone has a unique identity (e.g. "the highlands," "the ancient soil") to signal its significance

**Alternate capstones:** Completing campaigns unlocks alternate boss season types with different challenge emphases (genetics-focused, market-focused, efficiency-focused). Alternate capstone selection is a future meta-progression layer.

---

## Prestige Score

Beyond contract completion, each Season is evaluated on a Prestige Score — an aggregate across multiple independent dimensions.

**Prestige Score dimensions (proposed):**
- **Yield volume** — total weight/count of harvested peppers
- **Variety count** — number of distinct pepper varieties harvested
- **Rarity achieved** — highest rarity tier achieved in a harvested pepper or stabilized seed
- **Profit margin** — total profit, or profit-per-plot-slot as an efficiency measure
- **Play efficiency** — ratio of meaningful outcomes (successful breeds, viable seeds extracted) to total actions taken

**Score presentation:** Displayed as a profile (individual dimension scores), not a single collapsed number. A single total is available for leaderboard comparison; the profile is the primary improvement tool.

**Score function:** Personal best tracker. Players are always trying to beat their own scores from prior runs. Score thresholds provide light gating — hitting certain cumulative scores unlocks access to harder map paths or higher-tier contracts. Score is not the primary meta-unlock gate; contract completion handles that.

**Persistence:** Prestige Scores stored per-season, queryable at any time.

---

## NPCs

NPCs are functional unlocks — vendors and specialists that expand what is available to the player.

**NPC design scope:**
- NPCs are mechanical unlocks with narrative framing. Meeting a character grants access to their inventory, mechanic, or service.
- Examples: highland seed trader (rare cold-climate seeds), botanist (new breeding analysis tool), market broker (expanded market category access)
- NPCs may be run-scoped (available this campaign only) or permanent (persist across campaigns as a meta-unlock)

**Out of scope:** Relationship mechanics, dialogue trees, and persistent NPC story arcs are explicitly deferred.

---

## Meta-Progression Philosophy

Meta-progression unlocks are earned by completing Challenge Contract objectives and reaching Prestige Score thresholds. The design principle:

**Unlocks = depth, not power.** A meta-progression unlock should open a new option, mechanic, or interaction — not simply make the player stronger at what they already do. Examples:
- Unlocking a new mini-game variant for a specific activity (depth in mini-game system)
- Unlocking a new soil amendment type (depth in soil management)
- Unlocking access to a rare pepper archetype in the Almanac (depth in genetics)
- Unlocking a new Challenge Contract type (depth in run structure)
- Unlocking Zone draft (ability to choose between Zone options at each map node)
- Unlocking vendor NPCs (access to new specialists)
- Unlocking alternate capstone Zone types (depth in campaign structure)

---

## Seed Library Carryover

**Decision:** Player picks a limited subset of seeds to carry into the next campaign. Carryover limit is fixed early and scales slightly via meta-progression, reaching a soft cap. Once a player has bred excellent seeds across all relevant types, carrying more doesn't represent meaningful growth — the cap becomes pseudo-permanent at that stage.

**Design intent:** Seed selection at campaign end is a strategic decision. Players must bet on what will be useful given what they can see of the next map. This preserves Zone-genetics tension.

**Balancing:** Specific limits (e.g. carry 10 seeds, meta-unlock to 15) are configurable for playtesting and A/B testing. Starting with a rough framework; exact numbers TBD.

---

## Resolved Design Questions

| Question | Resolution |
|---|---|
| Season end trigger | Goal-based (contract completion prompts option to end) or player-initiated. No time limit — preserves active-first pillar. |
| Seed carryover | Player picks subset; soft cap that doesn't scale infinitely; early scaling via meta-unlock; numbers TBD via playtesting. |
| Contract assignment | Hybrid draft — pick from 2–3 options; pool size scales with meta-progression. |
| Zone structure | Zone map with branching paths; not per-season random draw. |
| Campaign length | Variable; determined by path chosen through map. Typical 4–8 seasons. |
| Campaign reset | Hard prestige reset each campaign; meta-unlocks persist; persistent world elements deferred. |
| Prestige Score coupling | Personal best tracker with light gating on harder content tiers; not primary meta-unlock gate. |
| Contract rewards | Varied per contract type: run-scoped seed packs, vendor NPC unlocks, permanent mechanic unlocks. |
| Hidden objective triggers | Puzzle-style triggers tied to genetics or discovery achievements; telegraphed `?` slot visible from contract start. |
| Campaign capstone | Fixed boss season — severe weather, survival/output objectives, requires early planning; alternate capstones unlock via meta-progression. |
| Map visibility | Full structure and Zone types visible from run start; specific contract options and conditions reveal progressively. |
| NPC system | Functional vendors and specialists only; relationship arcs out of scope. |
| Zone draft unlock | Unlocks after completing first campaign. Run 1 is a predetermined tutorial run. |
