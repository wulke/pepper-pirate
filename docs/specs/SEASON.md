# SEASON — Season Cycle and Prestige Specifications

Status: `draft`
@source: [season-cycle.md](../process-flows/season-cycle.md), [PRD.md](../PRD.md)

---

## Season Start

### SEASON-001
WHEN a new season begins, the game shall set market prices for all tradeable items and hold them fixed for the entire season — no intra-season price drift.

### SEASON-002
WHEN a new season begins, the game shall make forecast data available to the player before they begin planting.

> **Testable:** Forecast data must be accessible from the farm setup screen at season start, not gated behind a mid-season unlock.

---

## Season End

### SEASON-003
WHEN a season ends, the game shall trigger a final harvest pass that collects all remaining mature crops before evaluation.

### SEASON-004
WHEN season evaluation completes, the game shall display a summary screen showing: total yield, varieties discovered, profit/loss, goals met, Challenge Contract objective results, and Prestige Score across all dimensions.

### SEASON-005
WHEN the season resets, the game shall carry over the player's seed library (full or subset per carryover rules) to the next season.

### SEASON-006
WHEN the season resets, the game shall carry over all permanent meta-unlocks to the next season.

### SEASON-007
WHEN the season resets, the game shall remove all plots and infrastructure — the player begins the next season without them.

### SEASON-008
WHEN the season resets, the game shall discard all unharvested crops still in the field.

---

## Seed Aging

### SEASON-009
WHEN a season rollover occurs, the game shall re-evaluate `Seed.state.viability` for all seeds in `stored` state via `F-SEED-002`.

> **Testable:** Seeds stored across a season boundary must have viability recalculated; their prior viability value must not persist unchanged.

---

## V1 Scope Boundary

### SEASON-010

> **Retired:** Zone and weather variation has been promoted to core design as part of the roguelike Season structure. The V2 deferral no longer applies. Season cycling and reset behavior is fully specified by SEASON-003 through SEASON-008. Zone mechanics are now specified in SEASON-011 and SEASON-012. See [season-roguelike-brainstorm.md](../to-review/season-roguelike-brainstorm.md).

---

## Zone Variance

### SEASON-011
WHEN a new season begins, the game shall assign a Zone configuration — comprising environment type, weather pattern, and soil quality baseline — that defines the starting conditions for that season's run.

### SEASON-012
Zone configurations shall vary meaningfully between seasons, producing distinct strategic starting conditions that require players to adapt their grow and breed strategy to the assigned Zone.

> **Testable:** A fixed strategy optimized for one Zone must not be equally optimal across all Zone types — at least one Zone dimension must create a meaningful disadvantage for an unadapted strategy.

---

## Challenge Contracts

### SEASON-013
WHEN a new season begins, the game shall present the player with a Challenge Contract containing one or more visible objectives for the season, displayed before planting begins.

### SEASON-014
Challenge Contracts shall support hidden objectives — objectives not revealed to the player until a specific trigger condition is met during the season.

> **Testable:** A hidden objective must not appear in the contract UI until its trigger fires; once revealed, it must persist in the contract UI for the remainder of the season.

### SEASON-015
Challenge Contract difficulty shall be tiered — the game shall support multiple difficulty variants of each contract type, with higher-tier contracts gating proportionally greater rewards.

### SEASON-016
WHEN a player fulfills a Challenge Contract objective across seasons, the game shall unlock new Challenge Contract types and higher-tier variants available in future seasons.

---

## Season End — Contract and Prestige Evaluation

### SEASON-017
WHEN season evaluation completes, the game shall evaluate all Challenge Contract objectives — both visible and any hidden objectives that were revealed — and report completion status for each individually.

### SEASON-018
WHEN season evaluation completes, the game shall calculate a Prestige Score across the following independent dimensions: yield volume, variety count, rarity achieved, profit margin, and play efficiency — and display each dimension score separately.

### SEASON-019
The game shall maintain a persistent record of Prestige Scores across all completed seasons, queryable by the player at any time.

---

## Meta-Progression

### SEASON-020
WHEN a player fulfills a Challenge Contract objective, the game shall award meta-progression unlocks that expand capability depth across multiple systems (mini-games, breeding, soil management) — unlocks shall not be limited to raw power increases in a single system.

---

## Campaign Arc

### SEASON-021
Seasons shall be grouped into bounded campaigns. Each campaign is a traversal of a procedurally generated Zone map from a starting Zone to a capstone boss season. Completing the boss season concludes the campaign; a new map is generated for the next run.

### SEASON-022
Campaign length shall be variable, determined by the path the player chooses through the Zone map. Typical campaign length is 4–8 seasons. Shorter paths complete faster; longer paths offer more breeding depth but harder Zone conditions.

### SEASON-023
WHEN a campaign begins, the game shall display the full Zone map — Zone types and path structure — to the player before the first season starts. Specific contract options and Zone condition details for each node shall reveal progressively as the player approaches that node. The boss season node shall always be visible.

### SEASON-024
WHEN a campaign ends, the game shall apply a hard prestige reset: seed carryover limit applies, all permanent meta-unlocks persist, plots and infrastructure are lost.

### SEASON-025
The first campaign map shall be predetermined and function as a tutorial run. Zone draft (the ability to choose between Zone options at each map node) shall unlock after the player completes their first campaign.

---

## Zone Map and Draft

### SEASON-026
WHEN Zone draft is unlocked, the game shall present the player with 2 Zone options at each map node instead of a fixed Zone assignment. The player selects one before that season begins.

### SEASON-027
The Zone draft pool size shall start at 2 options. A meta-progression unlock shall expand the pool to 3 options.

---

## Challenge Contract — Assignment and Rewards

### SEASON-028
WHEN a season begins, the game shall present the player with a draft of 2–3 Challenge Contract options. The player selects one. The draft pool starts at 2 options; a meta-progression unlock expands it to 3.

### SEASON-029
Each Challenge Contract completion shall award at least one reward. Reward types vary by contract and may include:
- **Run-scoped rewards** — e.g. rare seed packs available only for the current campaign
- **Vendor NPC unlocks** — new specialists or traders that expand available options for the run or permanently
- **Permanent mechanic unlocks** — new depth in breeding, soil, mini-games, or other systems

### SEASON-030
Challenge Contract hidden objectives shall use puzzle-style triggers tied to genetics or discovery achievements — e.g. breeding a specific pepper variety or unlocking a pepper type. Trigger conditions shall not be simple action counters.

> **Testable:** A hidden objective trigger must require a specific genetics or discovery outcome, not just a quantity of any action.

### SEASON-031
The contract UI shall display a telegraphed `?` slot for each hidden objective from the start of the season, indicating that a hidden objective exists without revealing its content or trigger.

### SEASON-032
Base-tier contracts shall contain 1 hidden objective. Higher-difficulty tier contracts shall contain 2 hidden objectives.

---

## Seed Library Carryover

### SEASON-033
WHEN a campaign ends, the player shall select a limited subset of seeds from their library to carry into the next campaign. Seeds not selected are lost.

### SEASON-034
The seed carryover limit shall be a configurable value, set conservatively for initial release and adjusted via playtesting and A/B testing. An early meta-progression unlock shall increase the limit by a small fixed amount. The limit shall not scale infinitely — a soft cap applies once the player has access to the full breadth of useful seed types.

---

## Campaign Capstone — Boss Season

### SEASON-035
The final node on every Zone map shall be a boss season: a uniquely demanding season with severe weather events and survival/output objectives (e.g. keep N plants alive, sell X peppers, produce X hot sauces).

### SEASON-036
Boss season objectives shall be calibrated to require planning from the start of the campaign — a player who optimized myopically each prior season shall not have the resources or genetics to complete all objectives.

### SEASON-037
The boss season Zone shall be visually and thematically distinct from standard Zone nodes to signal its significance.

---

## Prestige Score — Personal Best

### SEASON-038
The game shall maintain a personal best record for Prestige Score across campaigns, queryable per season and per campaign. Players shall be able to compare current season scores against prior seasons across all five dimensions.

### SEASON-039
Prestige Score thresholds shall provide light gating — reaching certain cumulative score levels shall unlock access to harder map paths or higher-tier contract pools. Prestige Score shall not be the primary gate for meta-progression unlocks; contract completion handles that.

---

## NPC System

### SEASON-040
The game shall support vendor NPC unlocks as a contract reward type. A vendor NPC grants the player access to a specialist's inventory or service (e.g. rare seed stock, breeding analysis tools, expanded market categories).

### SEASON-041
Vendor NPCs shall be either run-scoped (available for the current campaign only) or permanent (persist across campaigns as a meta-unlock). Contract reward definitions shall specify which type applies.

> **Out of scope:** NPC relationship mechanics, dialogue trees, and persistent story arcs are explicitly deferred.
