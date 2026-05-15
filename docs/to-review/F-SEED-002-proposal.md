# F-SEED-002 — V1 Proposal

Status: **proposed** — review-ready V1 recommendation aligned to the current registry

Related: [Formula Registry](../FORMULA-REGISTRY.md#f-seed-002--seed-viability-decay) | [Review Pass 2026-04-15](./F-SEED-002-review-pass-20260415.md) | [Seed](../data-models/SEED.md#state) | [F-FRUIT-001 Proposal](./F-FRUIT-001-proposal.md)

---

## Purpose

`F-SEED-002` models how stored seeds lose usability across seasons. Its job is to preserve a simple inventory truth: a seed's genetics may remain excellent, but its chance to successfully start life declines if the player carries it forward too long.

V1 should answer one question only: given a stored seed's age in seasons, how much viability does it still retain for later germination resolution?

## Inputs

- `Seed.state.ageInSeasons`
- season rollover for stored seeds

## Output

- `Seed.state.viability`

V1 output remains a scalar in `[0,1]`:

- `1.00` — fresh seed, no storage-age penalty
- mid-range values — aging seed, increasingly risky to plant
- low values — near-spent seed with poor germination odds

## Trigger Timing

`F-SEED-002` should resolve on season rollover for seeds whose `Seed.state.status` is still `stored`.

V1 should not decay viability continuously per tick. Seasonal aging is the intended abstraction.

## Recommended Decay Formula

Use an accelerated exponential curve with one config constant:

```text
viability = DECAY_BASE ^ (ageInSeasons ^ 2)

V1 default:
DECAY_BASE = 0.92
```

This gives the right storage feel:

- only mild loss after one carried season
- meaningful decline after two to three seasons
- severe loss by around four stored seasons

It is also easy to tune without changing the overall formula shape.

## Season-by-Season Value Table

Recommended V1 values with `DECAY_BASE = 0.92`:

| Stored Seasons | Viability |
|---|---|
| 0 | `1.000` |
| 1 | `0.920` |
| 2 | `0.716` |
| 3 | `0.472` |
| 4 | `0.263` |
| 5 | `0.124` |

Interpretation:

- season 1 seeds are still comfortably usable
- season 2 seeds are still reasonable but no longer free of risk
- season 3 seeds are now a deliberate gamble
- season 4+ seeds are heavily degraded and should feel unreliable

## Player-Facing Interpretation

Players should understand viability as storage freshness, not seed quality.

Recommended V1 presentation:

- show stored age in seasons
- show viability as broad condition bands rather than exact percentage by default
- warn the player once a seed enters clearly risky territory

Suggested V1 bands:

- `Fresh` — `0.85 to 1.00`
- `Aging` — `0.60 to 0.84`
- `Fragile` — `0.30 to 0.59`
- `Near Spent` — `< 0.30`

This makes the system readable while leaving room for later seed-analysis tools to expose finer precision if the project wants that.

## How Future Planting / Germination Formulas Should Consume Viability

V1 should use `Seed.state.viability` as a germination-success input only.

That means:

- fresh or lightly aged seeds retain high odds of sprouting
- older seeds increasingly fail to germinate even if they are otherwise genetically valuable
- successful germination should still produce a normal plant in V1

This preserves clean system boundaries:

- `F-FRUIT-001` and `F-SEED-001` govern what the seed genetically is
- `F-SEED-002` governs whether storage age has compromised its ability to start
- future germination formulas decide pass/fail using viability plus planting context

V1 should not make low viability also reduce sprout speed, seedling health, or later growth rate. Those are reasonable future extensions, but they should be added explicitly rather than implied here.

## Open Questions Still Worth Review

- Should the project keep exact viability percentage fully hidden, or should advanced UI surfaces reveal it later while the default inventory stays band-based?
- Is `DECAY_BASE = 0.92` the right baseline, or should the project tune slightly harsher (`0.90`) or softer (`0.94`) after germination rules are drafted?
- When the future germination formula arrives, should it treat viability as a direct probability multiplier or pass it through threshold bands for readability and tuning?

## Registry Impact

No immediate registry change is required for this V1 proposal.

The current registry contract is already compatible with this recommendation:

- reads `Seed.state.ageInSeasons`
- writes `Seed.state.viability`
- triggers on season rollover for stored seeds
- is consumed by future germination or planting formulas

Formula registry verified; no registry changes were made in this proposal file.
