# F-TEND-001 — V1 Proposal

Status: **proposed** — review-ready V1 recommendation aligned to the current registry

Related: [Formula Registry](../FORMULA-REGISTRY.md#f-tend-001--tending-modifier) | [Review Pass 2026-04-15](./F-TEND-001-review-pass-20260415.md) | [Lifecycle Formulas](../LIFECYCLE-FORMULAS.md#tending-modifier) | [Plant](../data-models/PLANT.md) | [Growing Cycle](../process-flows/growing-cycle.md)

---

## Purpose

`F-TEND-001` converts recent qualified player care into a modest short-term growth multiplier. Its job is to reward timing and consistency without replacing soil matching, plot fit, or plant health as the primary growth levers.

V1 should answer one question only: given the plant's recent care history and current tending state, how much temporary growth help does this plant earn right now?

## Inputs

- recent qualified tending actions
- `Plant.tending.lastTendedAtTick`
- `Plant.tending.autoTendEnabled`
- relevant `Plant.health.activeEffects`
- current elapsed time or tick window

## Output

- `tendingModifier`

V1 output stays in the lifecycle target band:

- `0.90` — extended neglect
- `1.00` — baseline maintenance / auto-tend
- `1.05` — regular active tending
- `1.10` — strong consistent tending
- `1.15` — optimal short-lived tending state

## Action Qualification Rule

Only actions that address a real plant need count at full value.

V1 qualified actions:

- corrective watering when moisture is actually off target
- meaningful soil care tied to current conditions
- pest or stress treatment that resolves an active problem
- optional mini-game success as a temporary bonus source

Repeated unnecessary actions should have sharply reduced or zero value. The goal is to reward timing and relevance, not spam.

Recommended V1 anti-spam rule:

- an action only grants full tending value if the addressed condition is currently outside its target band or an active negative effect is present
- repeating the same action category inside the same short care window should grant sharply diminishing value
- mini-game success should enhance a valid tending event, not create an independent parallel growth multiplier

## Stored Care State

V1 should use a single stored `careScore` in `[0,1]` as the plant's short-horizon care memory.

This keeps responsibilities distinct:

- player actions create tending events
- `careScore` stores recent care quality
- `tendingModifier` is the computed formula output consumed by `F-GROWTH-001`

## Decay Rule

Decay should trend toward a floor rather than always collapsing to zero:

- with auto-tend enabled, floor `= 0.40`
- without auto-tend and after extended neglect, floor `= 0.00`

Recommended V1 decay:

```text
careScore_next = floor + (careScore_current - floor) * 0.80
```

This gives active play a temporary edge while keeping idle play viable.

## Modifier Formula

Map `careScore` to `tendingModifier` with a baseline breakpoint at `0.40`:

```text
if careScore <= 0.40:
  tendingModifier = 0.90 + 0.25 * careScore
else:
  tendingModifier = 1.00 + 0.15 * ((careScore - 0.40) / 0.60)
```

Key points:

- `0.00 -> 0.90`
- `0.40 -> 1.00`
- `0.60 -> 1.05`
- `0.80 -> 1.10`
- `1.00 -> 1.15`

This shape preserves the lifecycle guidance that tending helps, but cannot dominate.

## Interaction with F-GROWTH-001

`F-TEND-001` should remain a multiplicative input into final growth:

```text
finalGrowthModifier = min(1.25, soilModifier * tendingModifier * healthModifier * plotModifier)
```

This preserves the core design rule:

- bad soil cannot be erased by good tending
- bad plot choice cannot be erased by good tending
- bad health still matters even under excellent care

Tending is strongest when the player already built a good foundation.

## Worked Examples

### Example 1 — Idle-friendly baseline

```text
auto-tend enabled
careScore = 0.40
tendingModifier = 1.00
```

Result: the player can step away without the plant feeling broken or heavily punished.

### Example 2 — Regular active tending

```text
start: careScore = 0.40 -> 1.00
timely watering: +0.20 -> 0.60 -> 1.05
pest treatment: +0.20 -> 0.80 -> 1.10
```

Result: two useful actions in a good window create meaningful upside without overpowering the rest of the system.

### Example 3 — Optimal short-lived tending state

```text
start: careScore = 0.40
watering: +0.20 -> 0.60
soil correction: +0.20 -> 0.80
strong mini-game result: +0.20 -> 1.00
tendingModifier = 1.15
```

Result: the top band is earned through varied, timely care and should decay back down if attention stops.

## V1 Scope Boundary

V1 should affect growth rate only.

It should not directly influence:

- fruit quality
- resilience
- visibility / forecast systems
- crop-specific care specializations

Those are good V2+ extensions once the base care model proves readable and stable.

## Open Questions Still Worth Review

- Should `careScore` be explicitly added to `Plant.tending`, or should the same behavior be derived from recent action history without a dedicated stored field?
- Should mini-game success feed the same `careScore` directly, or should it be represented as a short-lived effect that still resolves into the same `tendingModifier` band?
- Is the proposed auto-tend floor of `0.40` the right baseline, or should idle baseline be slightly weaker while still staying non-punitive?

## Registry Impact

No immediate registry change is required to discuss this V1 proposal, but the current `F-TEND-001` entry is too vague to remain at proposal stage indefinitely.

If this proposal is accepted, the registry should be updated to:

- promote `F-TEND-001` from `concept` to `draft`
- refine reads from generic player tending actions / plant care state into recent qualified tending actions plus `Plant.tending.*`
- keep V1 output scoped to `tendingModifier` only

Formula registry verified; no registry changes were made in this proposal file.
