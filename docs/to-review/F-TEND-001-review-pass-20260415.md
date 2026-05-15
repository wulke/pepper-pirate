# F-TEND-001 — Review Pass 2026-04-15

Status: **proposed** — exploratory sequential answers for Prompts 1 through 3, with Prompt 4 synthesized separately in [F-TEND-001-proposal.md](./F-TEND-001-proposal.md)

Related: [Formula Registry](../FORMULA-REGISTRY.md#f-tend-001--tending-modifier) | [Lifecycle Formulas](../LIFECYCLE-FORMULAS.md#tending-modifier) | [Plant](../data-models/PLANT.md) | [Soil](../data-models/SOIL.md) | [Growing Cycle](../process-flows/growing-cycle.md) | [F-FRUIT-001 Proposal](./F-FRUIT-001-proposal.md)

---

## Prompt 1 — Define the V1 Contract Boundary

### 1. V1 contract

`F-TEND-001` should be a hybrid care-state formula.

In V1, it resolves a plant's short-horizon care quality from recent qualified tending and converts that into `tendingModifier` in the existing `0.90-1.15` band. It should not directly repair bad soil, bad plot fit, or poor plant health. It only multiplies the result of those systems.

This keeps the current lifecycle direction intact:

- soil, plot, and health remain the primary condition levers
- tending remains the active-play optimization layer
- idle-friendly play still lands near baseline rather than feeling broken

### 2. Candidate tending inputs

Candidate V1 inputs should be:

- recent watering that corrects low or drifting `Soil.conditions.moistureLevel`
- meaningful soil management actions tied to current need
- pest or stress treatment that addresses active plant problems
- optional mini-game result as a short-lived bonus source
- plant-side care state such as `Plant.tending.lastTendedAtTick`, `Plant.tending.autoTendEnabled`, and relevant active effects

Simulation distinction:

- player actions are discrete events
- plant care state is the stored recent-care memory
- `tendingModifier` is the computed output consumed by `F-GROWTH-001`

### 3. Assumptions and simplifications

- Auto-tend holds a true baseline near `1.00`, not a bonus state.
- Active play improves timing and quality, not raw override power.
- Repeated redundant actions should not stack linearly.
- Tending in V1 is about recent care execution, not long-term soil investment.
- Negative outcomes like pests and transplant shock should stay primarily in health/status systems rather than being duplicated here.

### 4. Deferred behaviors for V2+

- fruit quality bonuses
- resilience or recovery bonuses
- richer care categories like pruning or microclimate management
- crop-specific tending profiles
- predictive UI or visibility systems that forecast upcoming care windows

### 5. Registry impact

The current registry intent is directionally correct but underspecified.

If `F-TEND-001` is promoted beyond `concept`, the registry should explicitly read:

- recent qualified tending actions
- `Plant.tending.*`
- relevant `Plant.health.activeEffects`

It should continue to influence only `tendingModifier` in V1.

---

## Prompt 2 — Resolve Action Qualification and Decay

### 1. Recommended action model

Three candidate models:

#### Model A — Flat recent-action bonus

Each recent action adds a short-lived bonus.

Pros:

- easy to implement
- easy to explain

Cons:

- invites spam
- awkward once actions have different value
- weak foundation for auto-tend baseline behavior

#### Model B — Care meter with decay

Qualified actions raise a `careScore` in `[0,1]`. The score decays over time and maps to `tendingModifier`.

Pros:

- best fit for both active and idle-friendly play
- easy to tune
- easy to visualize
- naturally supports diminishing returns

Cons:

- requires one stored intermediate state

#### Model C — Category-based care quality

Separate categories like watering, soil care, and stress response each feed a composite score.

Pros:

- richer long-term design surface
- strong readability for advanced play

Cons:

- more complexity than V1 needs
- likely premature before category breadth is stable

Recommendation: use Model B in V1.

Qualified V1 actions:

- corrective watering
- meaningful soil adjustment or soil-check action tied to current conditions
- pest or status treatment
- optional mini-game success

Later-version actions:

- pruning
- climate management
- fruit support actions

### 2. Recommended decay model

Use decay toward a floor, not toward zero in all cases:

- auto-tend enabled floor: `0.40`
- no auto-tend / extended neglect floor: `0.00`

Per evaluation window:

```text
careScore_next = floor + (careScore_current - floor) * 0.80
```

Map score to modifier:

```text
if careScore <= 0.40:
  tendingModifier = 0.90 + 0.25 * careScore
else:
  tendingModifier = 1.00 + 0.15 * ((careScore - 0.40) / 0.60)
```

This yields:

- `0.00 -> 0.90`
- `0.40 -> 1.00`
- `0.60 -> 1.05`
- `0.80 -> 1.10`
- `1.00 -> 1.15`

This is a good V1 shape because:

- neglect creates only a mild downside
- auto-tend preserves baseline
- active timing matters
- peak values require maintained effort rather than spam

### 3. Numeric examples

#### Example A — Idle-friendly baseline

```text
auto-tend enabled
careScore = 0.40
tendingModifier = 1.00
```

Result: the player is not punished for stepping away.

#### Example B — Regular active tending

```text
start: careScore = 0.40 -> 1.00
timely watering: +0.20 -> 0.60 -> 1.05
later pest treatment: +0.20 -> 0.80 -> 1.10
```

Result: two useful actions in the right window produce a strong but not dominant gain.

#### Example C — Optimal tending window

```text
start: careScore = 0.40
watering: +0.20 -> 0.60
soil correction: +0.20 -> 0.80
strong mini-game result: +0.20 -> 1.00
tendingModifier = 1.15
```

Result: the player reaches the top band through varied, timely care rather than repetition.

#### Example D — Decay after peak play

With auto-tend floor `0.40`:

```text
1.00 -> 0.88 -> 1.12
0.88 -> 0.78 -> 1.10
0.78 -> 0.71 -> 1.08
0.71 -> 0.65 -> 1.06
```

Result: the peak is temporary but falls back gently.

### 4. Failure modes or exploits

- spam watering when no correction is needed
- repeating the same low-value action for steady gain
- banking a full bonus immediately before a long idle period

Mitigations:

- no full value for unnecessary actions
- per-category cooldown or strong diminishing returns on repetition
- decay fast enough that perfect play requires ongoing attention

### 5. Recommendation

Use the care-meter-with-decay model.

It is the cleanest V1 fit for the current lifecycle formula, supports both active and idle play, and keeps the target band legible.

---

## Prompt 3 — Resolve Interaction with Growth and Adjacent Systems

### 1. Interaction with F-GROWTH-001

Keep the current multiplicative structure:

```text
finalGrowthModifier = min(1.25, soilModifier * tendingModifier * healthModifier * plotModifier)
```

This preserves the key design rule: tending amplifies a good setup but does not rescue a bad one.

Examples:

- `soilModifier = 0.50`, `tendingModifier = 1.15` still yields only `0.575` before other factors
- `soilModifier = 0.95`, `plotModifier = 1.00`, `healthModifier = 1.00`, `tendingModifier = 1.10` yields meaningful upside without breaking the soft cap

### 2. Interaction with plant/status state

In V1:

- transplant shock should affect growth through `F-PLOT-002 -> F-HEALTH-001`, not by separately deleting tending value
- pests and disease should lower `healthModifier`, while successful treatment can raise care quality through `F-TEND-001`
- mini-game bonuses should feed into tending's temporary upper band rather than becoming a separate parallel growth multiplier

Recommended V1 rule:

- preserve care state through transplant, but let transplant shock reduce net growth through health
- preserve care state through temporary negative effects, but let untreated status conditions drag growth through health

This avoids double punishment and keeps responsibilities distinct.

### 3. V1-only effects vs future extensions

V1:

- affects growth rate only

Future extensions:

- fruit quality
- stress resilience
- UI confidence or care-readiness forecasting
- species-specific or trait-specific care preferences

### 4. Player readability implications

The player should be able to infer three states:

- maintained: baseline care, around `1.00`
- boosted: recent good care is helping
- neglected: the plant is slipping below baseline

The system should be readable without exposing raw math. A simple care bar, banded status label, or short tooltip is enough.

Most importantly, the player should still understand that larger wins come from choosing the right seed, soil, and plot combination. Tending should feel like optimization, not rescue.

### 5. Registry impact

If this direction is adopted:

- `F-TEND-001` should remain an input to `F-GROWTH-001`
- V1 should not expand its outputs into quality or resilience
- the registry should remain multiplicative and soft-capped at the `F-GROWTH-001` layer

## Review Pass Summary

Recommended V1 shape:

- one stored `careScore`
- qualified action inputs only
- decay toward an auto-tend baseline
- output band `0.90-1.15`
- growth-only effect in V1

## Prompt 4 Handoff

The strongest current Prompt 4 synthesis is captured in [F-TEND-001-proposal.md](./F-TEND-001-proposal.md).

That proposal carries forward this review pass's recommended V1 shape:

- one stored `careScore`
- qualified action inputs only
- decay toward an auto-tend baseline
- output band `0.90-1.15`
- growth-only effect in V1

## Registry Status

No registry changes were made in this review pass.
