# Formula Review Queue

Status: **working coordination doc** — suggests what can be reviewed in parallel based on the current registry dependency graph

Related: [Formula Registry](../FORMULA-REGISTRY.md)

---

## Key Dependency Answer

`F-FRUIT-001` is an upstream dependency for:

- `F-SEED-001`
- indirectly `F-SEED-003`

`F-FRUIT-001` does **not** block the growth/environment branch:

- `F-SOIL-001`
- `F-TEND-001`
- `F-PLOT-001`
- `F-PLOT-002`
- `F-HEALTH-001`
- `F-GROWTH-001`

It also does **not** block:

- `F-SEED-002`

---

## Recommended Parallel Workstreams

### Workstream A — Breeding / Seed Generation

Recommended order:

1. `F-FRUIT-001`
2. `F-SEED-001`
3. `F-SEED-003`

Notes:

- `F-SEED-001` can begin early if the agent treats the current fruit contract as fixed and focuses on variance behavior within that boundary.
- `F-SEED-003` should wait until `F-SEED-001` is clearer, because rarity elevation depends on trait values plus stability/lock interpretation after per-seed resolution.

### Workstream B — Growth Inputs

Can be worked in parallel:

- `F-TEND-001`
- `F-HEALTH-001`
- `F-PLOT-001`
- `F-SOIL-001`

Follow-up:

- `F-GROWTH-001` should be reviewed after the input modifiers are clearer, since it is mostly an aggregation point over those formulas.

### Workstream C — Plot / Stress

Recommended order:

1. `F-PLOT-002`
2. `F-HEALTH-001`

Notes:

- `F-PLOT-002` already has a draft shape and feeds directly into `F-HEALTH-001`.
- `F-HEALTH-001` is a central sink for temporary and persistent stressors, so it benefits from a clearer view of transplant shock and any adjacent health signals.

### Workstream D — Seed Storage

Can be worked independently:

- `F-SEED-002`

Notes:

- This is isolated from the breeding and growth branches.
- It is a good candidate for a fast concept-to-proposal pass.

---

## Suggested Priority

If the goal is to unlock the most downstream work:

1. `F-FRUIT-001`
2. `F-TEND-001`
3. `F-HEALTH-001`
4. `F-SEED-002`
5. `F-SEED-001`
6. `F-GROWTH-001`
7. `F-SEED-003`

Rationale:

- `F-FRUIT-001` unlocks the most important breeding branch decisions.
- `F-TEND-001` and `F-HEALTH-001` are still `concept` and block a more complete review of `F-GROWTH-001`.
- `F-SEED-002` is independent and easy to parallelize.
- `F-SEED-001` should follow once the fruit contract is stable enough.

---

## Agent Assignment Pattern

If running multiple agents at once:

- Agent 1: `F-FRUIT-001`
- Agent 2: `F-TEND-001`
- Agent 3: `F-HEALTH-001`
- Agent 4: `F-SEED-002`

Second wave:

- Agent 5: `F-SEED-001`
- Agent 6: `F-GROWTH-001`
- Agent 7: `F-SEED-003`

---

## Next Step Convention

For each formula you want to push through review, create:

- `docs/to-review/F-<DOMAIN>-<NNN>-agent-prompts.md`

using the workflow in [FORMULA-REVIEW-WORKFLOW.md](./FORMULA-REVIEW-WORKFLOW.md).
