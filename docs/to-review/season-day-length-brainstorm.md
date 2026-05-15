# Season Day Length — Brainstorm

status: `approved`
@source: [PRD.md](../PRD.md), [season-cycle.md](../process-flows/season-cycle.md), [season-roguelike-brainstorm.md](./season-roguelike-brainstorm.md)

---

## Why This Design

The existing Season model gives players agency over their campaign path (Zone selection, Contract draft) but treats each Season's duration as implicit and undefined. Without a day-length mechanic, every Season is the same structural shape — the player just plays until done. There's no lever for trading speed against risk, and no way to make the "how long should I spend here?" question a deliberate strategic decision.

Variable day length solves this by making Season duration a player-controlled constraint with real consequences. Short seasons enable faster campaign progression but restrict what's achievable. Long seasons open up breeding depth and yield potential but expose the player to more risk. The player's ability to read a Zone, a Contract, and their seed library — then commit to a length — becomes a learnable skill.

---

## What Is a Day

A Day is one full inner-loop cycle: the player gets one opportunity to tend, one opportunity to trigger breeding decisions, and one harvest window per plot.

**Days advance only through explicit player action.** The player sees an "End Day" button after completing their available actions. There is an optional auto-advance toggle for players who prefer a smoother flow — when enabled, the Day advances automatically once all available actions for that Day are exhausted. Auto-advance is opt-in and does not affect scoring; every advanced Day counts toward `daysUsed` regardless of how it was triggered.

**Why not real-time?** Time pressure would conflict with the core design principle of never punishing absence. Days as discrete action cycles give players a consistent game model to reason around without introducing session-length anxiety. "Idle" means the player advances a Day without taking all available actions — they miss optimization, but are never penalized for absence.

---

## Day Length Options

Players choose from three discrete options — **Short**, **Standard**, or **Long** — at the start of each Season, after selecting their Zone and Contract.

**Decision sequence:** Zone selection → Contract selection → Season length selection.

The player has full visibility into Zone conditions and Contract objectives before committing to a length. This makes the choice informed and strategic, not a blind gamble.

**Standard is the center of gravity.** It is designed to accommodate most strategies with enough flexibility over the course of a run. Short and Long are deliberate deviations — opportunities for decision-making and skill expression:

- **Short** is a risk management lever and a scoring tool. Any player who reads Zone conditions may reach for it (e.g., shortening a rainy Zone to protect a breeding pipeline). Skilled players use it to chase Prestige Score efficiency. It should feel genuinely tight.
- **Long** is a real commitment. It should feel meaningfully longer than Standard — not just a slight extension. Players who choose Long are signing up for more breeding depth and more risk exposure.

**Zone character signaling:** Each Zone's risk profile is visible before selection via a weather snapshot (see Risk Vectors). This informs length decisions without hard-gating the player's choice.

**Specific day counts are TBD** and will be determined through playtesting once pepper growth times are established. Key constraints: at least one fast-growing pepper archetype must complete a full growth cycle within a Short season; Long should feel disproportionately longer than Standard. All counts are configurable for playtesting. The ordering Short < Standard < Long holds; exact numbers are a balance variable.

---

## Pepper Growth and Day Length

Peppers have a fixed number of Days required to reach maturity. This is visible to the player before planting. Breeding can unlock variance in growth time — selectively breeding for faster maturation is a viable genetics goal.

**Implication:** Season length is a genuine constraint, not a cosmetic setting. A pepper that takes 12 Days to mature cannot be harvested in an 8-Day season. Players must cross-reference their seed library's growth times against the selected Season length before planting. Mismatches are legible and avoidable — not invisible traps.

**Genetics feasibility warning:** When a genetics Contract's generation depth makes completion mathematically impossible at the selected Season length, the UI surfaces a targeted warning before the player commits. This warning fires only on hard impossibility — not on difficulty or risk. "Difficult" is skill; "impossible" is a trap.

**Genetics and multi-season breeding:** Stabilizing a trait across multiple generations requires more Days than a single season may provide. Breeding lines that span multiple Zones are supported through seed carryover — a player extracts seeds from generation N in Zone 1 and continues the line in Zone 2. Plants and plots do not carry over between Zones. Formal multi-Zone genetics Contracts are parked for post-V1 design.

---

## Risk Vectors

Longer seasons expose the player to more Day-based negative events. Risk scales with both Zone character and season length.

**Zone risk model — hybrid:**
- **Event pool gating:** Zone character determines which event types can appear. An arid Zone draws from drought and heat events; a rainy Zone draws from storms and flooding. This makes Zones feel distinct and makes Zone-reading a learnable skill.
- **Probability scaling:** Within that pool, per-Day event probability is scaled by the Zone's intensity and the season's length. More Days in a high-probability Zone means more total exposure.

**Weather snapshot:** Before Zone selection, the player sees a weather snapshot — a rough preview of what conditions to expect over a season (calendar-style or similar, UX TBD). This gives players enough signal to make informed length decisions without requiring them to memorize Zone profiles.

**Primary risk vectors:**
- **Weather events** — storms, frost, drought, or heat spikes that fire on specific Days. Probability scaled by Zone weather pattern and season length.
- **Pest and disease outbreaks** — random negative events that can spread if untreated. Players who tend actively can mitigate; players who skip tending miss the optimization window.
- **Soil degradation** — cumulative soil quality loss (compaction, nutrient depletion) over the season. Longer seasons accumulate more degradation, requiring active soil management to maintain.

**Post-MVP event ideas (not scoped for V1):**
- Black market traders appearing for a single Day — sell or miss.
- A neighboring farm's disease spreading into your plots if untreated by Day N.
- A rare weather window that supercharges growth for 2 Days but requires immediate action.
- A traveling botanist appearing mid-season with a one-time breeding offer.

---

## Contract Interaction

Contract objectives are **fixed regardless of Season length**. The player's day count is a self-imposed constraint on their ability to complete the Contract — choosing Short on a difficult genetics Contract is a knowable risk, not a hidden penalty.

This creates the core risk/reward loop: Short seasons are fast but may make certain Contracts structurally difficult. Long seasons give time to complete ambitious Contracts but expose the player to more negative events. The player's job is to read the Contract, assess their seed library, and pick a length they can execute within.

General contract length signals (e.g., "Genetics — Long-favored") are deferred to V2+ pending playtesting feedback on whether players need the additional UX context.

---

## Incentive Structure for Shorter Seasons

Short seasons are incentivized through a **flat Prestige Score efficiency multiplier** — the primary scoring lever for play skill. The mechanic is defined in [`F-SEASON-001`](../FORMULA-REGISTRY.md) and is ratio-based: completing a Contract with more Days remaining relative to the season's total Days scores higher, regardless of tier. Short seasons naturally score higher because the ratio is tighter.

The formula has two configurable levers (`RATIO_WEIGHT` and `MULTIPLIER_WEIGHT`) that can isolate or combine ratio-based and tier-bonus behavior during playtesting. The V1 default is ratio-only (`MULTIPLIER_WEIGHT = 0`).

**Hidden Contract achievements** (firing when a player completes a Contract within a Short season) are deferred to V2+. If Short is underutilized post-launch, discovery hooks are the first candidate to address it.

---

## Boss Season

The Boss season has a **fixed day count equal to Standard**, visible on the Zone map from the start of the campaign. The player cannot select Short/Standard/Long for the Boss — the game dictates the terms.

The Boss's fixed length is stored as a named configurable constant and can be adjusted if playtesting reveals that Standard length doesn't create the intended challenge. The Boss's difficulty is intended to come from its Contract and Zone conditions, not from an unusual length constraint.

**Design intent:** A player who chained Short seasons for efficiency must arrive with a seed library capable of performing at Standard length — implicitly punishing under-prepared speed runs without penalizing them via an unexpectedly long commitment.

---

## Open Design Questions

| Question | Status |
|---|---|
| Specific day counts for Short, Standard, Long, and Boss season | TBD — depends on pepper growth time distributions; all counts are configurable for playtesting |
| Post-MVP Day-based event types | Parked — see post-MVP event ideas above |
| Run-level genetics Contracts spanning multiple Zones | Parked — multi-Zone breeding is supported via seed carryover; formal multi-Zone Contract types need their own design pass post-V1 |
| Contract length compatibility signals (e.g., "Long-favored") | Deferred to V2+ pending playtesting feedback |
| Hidden Contract achievements for Short completion | Deferred to V2+ |
