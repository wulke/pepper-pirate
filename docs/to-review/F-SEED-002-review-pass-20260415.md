# F-SEED-002 — Review Pass 2026-04-15

Status: **proposed** — exploratory sequential answers for Prompts 1 through 3, with Prompt 4 synthesized separately in [F-SEED-002-proposal.md](./F-SEED-002-proposal.md)

Related: [Formula Registry](../FORMULA-REGISTRY.md#f-seed-002--seed-viability-decay) | [Seed](../data-models/SEED.md#state) | [Lifecycle Formulas](../LIFECYCLE-FORMULAS.md) | [F-FRUIT-001 Proposal](./F-FRUIT-001-proposal.md)

---

## Prompt 1 — Define the V1 Contract Boundary

### 1. V1 contract

`F-SEED-002` should be a narrow storage-aging formula.

In V1, it updates `Seed.state.viability` only when a stored seed crosses a season boundary. `viability` should represent the seed's remaining chance to successfully begin life when the player eventually plants it. It should not directly alter genetics, rarity, lineage quality, or trait stability.

This keeps responsibilities distinct:

- `F-FRUIT-001` and `F-SEED-001` determine what kind of seed the player has
- `F-SEED-002` determines how much storage age has reduced that seed's remaining usability
- later germination or planting formulas consume `viability` to resolve outcome

### 2. Simulation meaning of viability

In simulation terms, `viability` is a stored readiness value in `[0,1]` that answers one question: if this seed is planted now, how likely is it to successfully germinate under otherwise-valid planting conditions?

V1 meaning:

- `1.00` = fresh seed, no storage-age penalty
- mid-range values = aging seed, still usable but increasingly risky
- near `0.00` = old seed with very poor odds of successful germination

What viability is not:

- not a trait-quality score
- not a proxy for fruit genetics or line stability
- not rarity
- not plant vigor after successful sprouting in V1

This matters because a genetically excellent seed from a stable line can still become non-viable if stored too long, while an unstable or common seed can still be fully viable if it is fresh.

### 3. Assumptions and simplifications

- Viability changes only across seasons in storage, not continuously per tick.
- The formula reads `Seed.state.ageInSeasons` and storage context, then writes `Seed.state.viability`.
- V1 treats all stored seeds the same regardless of storage environment.
- V1 assumes planting conditions are otherwise valid; viability is only the storage-age component of later germination success.
- V1 keeps viability as a scalar rather than splitting it into separate concepts like dormancy, contamination, or storage damage type.

### 4. Deferred behaviors for V2+

- storage-environment modifiers such as humidity, temperature, or specialized storage upgrades
- crop-specific viability decay profiles
- viability effects beyond germination chance, such as slower sprouting or weak starts
- recovery mechanics that partially preserve or restore viability
- player tools that estimate or test viability with greater precision

### 5. Registry impact

No registry change is required for this boundary.

The current `F-SEED-002` entry already supports a narrow V1:

- reads `Seed.state.ageInSeasons`
- writes `Seed.state.viability`
- triggers on season rollover for stored seeds
- is consumed by future germination or planting formulas

The main remaining need is to choose the exact decay curve.

---

## Prompt 2 — Resolve the Decay Curve

### 1. Candidate curves compared

All three candidates below preserve the same V1 boundary: storage age only, season-rollover trigger, and downstream use by later germination logic.

#### Candidate A — Simple geometric decay

```text
viability = 0.85 ^ ageInSeasons
```

Values:

- `0 -> 1.000`
- `1 -> 0.850`
- `2 -> 0.723`
- `3 -> 0.614`
- `4 -> 0.522`
- `5 -> 0.444`

Assessment:

- easy to explain
- early loss feels fine
- by season 4 the seed is still too healthy for the stated design goal
- makes long-term storage too forgiving

#### Candidate B — Accelerated exponential using squared age

```text
viability = 0.92 ^ (ageInSeasons ^ 2)
```

Values:

- `0 -> 1.000`
- `1 -> 0.920`
- `2 -> 0.716`
- `3 -> 0.472`
- `4 -> 0.263`
- `5 -> 0.124`

Assessment:

- small first-season loss
- meaningful decline by seasons 2 to 3
- severe degradation by season 4
- simple enough to tune with one base constant

#### Candidate C — Harsher accelerated exponential

```text
viability = 0.90 ^ (ageInSeasons ^ 2)
```

Values:

- `0 -> 1.000`
- `1 -> 0.900`
- `2 -> 0.656`
- `3 -> 0.387`
- `4 -> 0.185`
- `5 -> 0.072`

Assessment:

- season 4 clearly feels severe
- season 2 to 3 may fall too quickly for players who intentionally store seed stock
- risks making one or two carried seasons feel more punishing than the seed doc implies

### 2. Recommended curve

Recommend Candidate B:

```text
viability = DECAY_BASE ^ (ageInSeasons ^ 2)

V1 default:
DECAY_BASE = 0.92
```

Why this is the best V1 fit:

- it satisfies the current design note that early loss should stay mild
- it produces a real decision point by seasons 2 to 3
- it makes season-4 seeds feel unreliable without being mathematically dead
- it is simple to reason about and tune with one config constant

This also preserves the intended player story:

- saving seeds for next season is normal
- carrying them for multiple seasons is possible but increasingly risky
- hoarding indefinitely is allowed but not efficient

### 3. Worked value table

Recommended V1 table with `DECAY_BASE = 0.92`:

| Stored Seasons | Viability |
|---|---|
| 0 | `1.000` |
| 1 | `0.920` |
| 2 | `0.716` |
| 3 | `0.472` |
| 4 | `0.263` |
| 5 | `0.124` |

Interpretation:

- season 1: almost always still worth planting
- season 2: noticeable risk, but still broadly usable
- season 3: now a real gamble unless the player is intentionally pushing old stock
- season 4: severe loss, only worth keeping for special cases
- season 5: nearly spent for ordinary play

### 4. Tuning knobs

Primary V1 knob:

- `DECAY_BASE`

Examples:

- `0.94` = more forgiving long-term storage
- `0.92` = recommended baseline
- `0.90` = harsher preservation pressure

Optional future knob if needed later:

- `ageExponent`, default `2.0`

V1 should probably avoid exposing both knobs unless tuning proves necessary. One constant is easier to discuss and safer to document.

### 5. Risks or edge cases

- If later germination systems also apply strong penalties from planting conditions, old seeds could become too unreliable unless those formulas account for viability separately.
- Season rollover is coarse. A seed stored just before rollover and a seed stored all season may age the same in V1. That is acceptable for now, but it is an abstraction to keep in mind.
- If the UI hides too much, players may not understand why older seeds suddenly feel unreliable.

---

## Prompt 3 — Resolve Downstream Gameplay Consequences

### 1. V1 gameplay effect

In V1, low viability should affect binary germination success only.

That is the cleanest downstream use of the current registry contract:

- `F-SEED-002` maintains `Seed.state.viability`
- a future planting or germination formula reads `viability`
- germination outcome becomes less likely as viability falls

V1 should not also use viability to change:

- time-to-sprout
- starting plant health
- early growth rate
- trait expression confidence

Those are valid future extensions, but adding them now would over-expand a formula that is currently documented as storage aging.

### 2. Player-facing interpretation

The system should feel like this:

- storing seeds for one season is normal and low-risk
- storing seeds for two to three seasons is a strategic compromise
- storing seeds for four or more seasons is a salvage or nostalgia play, not standard practice

Recommended V1 player-facing presentation:

- show stored age in seasons
- show a coarse viability band instead of exact percentage by default
- add warnings once seeds enter the risky bands

Suggested bands:

- `Fresh` — `0.85 to 1.00`
- `Aging` — `0.60 to 0.84`
- `Fragile` — `0.30 to 0.59`
- `Near Spent` — `< 0.30`

This is better than exposing raw percentage first because:

- it keeps the system legible
- it avoids false precision
- it still lets the player make meaningful inventory decisions

If the UI later wants more detail, exact values can be revealed through advanced tools or seed-analysis features rather than becoming the default surface.

### 3. Future extensions kept out of scope

- slower sprouting for low-viability seeds
- weaker seedling starts
- viability interaction with storage environment or upgrades
- species-specific storage durability
- recovery, preservation, or cryostorage mechanics
- player-facing lab tools that estimate exact viability percentage

### 4. Registry impact

No immediate registry change is required.

The current `Used By` note of "future germination or planting formulas" is still the right V1 contract. The key design recommendation is simply that those future formulas should consume `Seed.state.viability` first as a germination-success input, not as a broad all-purpose weakness stat.

## Review Pass Summary

Recommended V1 shape:

- viability is a storage-age readiness value, not a genetics-quality signal
- it updates only on season rollover for stored seeds
- recommended curve is `0.92 ^ (ageInSeasons ^ 2)`
- downstream V1 use should be binary germination success only
- player-facing UI should show age plus coarse viability bands

## Prompt 4 Handoff

The strongest current Prompt 4 synthesis is captured in [F-SEED-002-proposal.md](./F-SEED-002-proposal.md).

## Registry Status

No registry changes were made in this review pass.
