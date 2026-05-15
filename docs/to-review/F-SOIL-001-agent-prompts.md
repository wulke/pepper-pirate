# F-SOIL-001 — Agent Prompt Pack

Status: **working prompts** — intended to drive iterative review toward a final proposal for `F-SOIL-001`

Related: [Formula Registry](../FORMULA-REGISTRY.md#f-soil-001--soil-modifier) | [Lifecycle Formulas](../LIFECYCLE-FORMULAS.md#soil-seed-affinity) | [Soil Data Model](../data-models/SOIL.md) | [Seed Data Model](../data-models/SEED.md) | [Genetics](../GENETICS.md)

---

## Purpose

These prompts are ordered by dependency, not strict requirement. The output of each prompt should make the next one sharper and less speculative.

Use them to move an agent from `0 -> 1` on `F-SOIL-001`:

1. define the V1 soil-modifier boundary
2. resolve the core delta and modifier mechanics
3. resolve downstream growth interaction and model-contract alignment
4. synthesize a review-ready proposal

Each prompt is written to reduce drift against the current registry, lifecycle docs, and data model docs.

---

## Prompt 1 — Define the V1 Contract Boundary

```text
Review docs/FORMULA-REGISTRY.md, docs/LIFECYCLE-FORMULAS.md, docs/data-models/SOIL.md, docs/data-models/SEED.md, and docs/GENETICS.md.

Propose a V1 design boundary for F-SOIL-001. Your job is to define what the soil modifier must compute in simulation terms, which seed and soil fields it truly needs, what output shape is sufficient in V1, and which richer soil systems should be explicitly deferred.

Constraints:
- Treat docs/FORMULA-REGISTRY.md as the canonical contract surface.
- Preserve the current design rule that good soil removes penalties but does not create bonuses above 1.0 in V1.
- Keep the formula focused on soil-to-seed fit, not general plant health, weather, or long-term soil ecology.
- Call out any contract drift between the registry and current data model docs, especially around exact field names and object shape.

Structure your answer as:
1. V1 contract
2. Required reads and output
3. Assumptions and simplifications
4. Deferred behaviors for V2+
5. Registry impact
```

### Why First

`F-SOIL-001` already has substantial pseudocode, so the main first-pass risk is not missing ideas but hidden contract drift between the registry and the current seed/soil models.

---

## Prompt 2 — Resolve Delta, Tolerance, and Combination Mechanics

```text
Using the recommended V1 boundary for F-SOIL-001, design the actual soil modifier model.

Your goal is to recommend one V1 formula shape for:
- tolerance resolution
- soil-factor normalization
- delta-to-modifier mapping
- combining pH, nutrients, and moisture into one soilModifier

Constraints:
- Preserve the current direction that tolerance is a composite of hardiness and drought resistance in V1.
- Keep the model readable enough that players can understand what "wrong soil" means and how to improve it.
- Preserve the idea that pH is a gatekeeper, but evaluate whether the exact combination rule is the strongest V1 choice.
- Do not expand into V2 soil-health systems like salinity, compaction, or microbial health.

Required analysis:
- Compare at least 2 candidate delta-to-modifier shapes, even if one is the current recommended plateau-plus-falloff model
- Explain why normalization is required and what breaks if native units are compared directly
- Use at least 2 worked examples, including one near-ideal case and one clearly mismatched case
- Evaluate whether a factor reaching 0.0 should fully zero a branch of the calculation or merely drag it down sharply

Structure your answer as:
1. Recommended tolerance rule
2. Recommended normalization and delta rule
3. Recommended factor-combination rule
4. Worked examples
5. Risks or edge cases
```

### Why Second

This is the core mechanics pass. Once the contract boundary is clear, the real review question is whether the actual modifier shape creates the intended player behavior.

---

## Prompt 3 — Resolve Downstream Interaction and Data-Model Alignment

```text
Using the recommended V1 soil modifier model, determine how F-SOIL-001 should interact with F-GROWTH-001 and the current seed/soil data model boundaries.

Your goal is to make the formula implementation-ready without silently redefining adjacent systems.

Required analysis:
- Explain how soilModifier should interact with tendingModifier, plotModifier, and the future healthModifier
- Evaluate what should happen when soilModifier becomes extremely low or reaches 0.0
- Identify which fields must exist on Seed and Soil for the formula to be implementable without ambiguity
- State whether the current registry and data-model docs are aligned enough, or what exact contract edits would be needed
- Identify what player-facing diagnostics or feedback the system should support in V1

Constraints:
- Preserve the design rule that soil/genetics fit is a foundational lever, not a cosmetic stat
- Do not invent shadow formulas for drainage, moisture depletion, or nutrient lockout outside the current registry boundary
- Keep V1 implementation-oriented and avoid pulling in unresolved stage formulas unless needed as boundary conditions

Structure your answer as:
1. Interaction with F-GROWTH-001
2. Behavior at low or zero soil fit
3. Required Seed and Soil contract shape
4. Player readability implications
5. Registry impact
```

### Why Third

`F-SOIL-001` is already mathematically richer than some other formulas. The unresolved risk is whether its inputs and consequences are aligned enough to hand off to implementation and downstream growth formulas.

---

## Prompt 4 — Produce the Review-Ready V1 Proposal

```text
Synthesize the previous decisions into a concise, review-ready V1 proposal for F-SOIL-001.

Write it as a design memo that could be used to update the lifecycle documentation and support a registry-aligned formula proposal.

Include:
- purpose
- inputs
- output
- tolerance rule
- normalization rules
- delta-to-modifier mapping
- factor combination rule
- 2 to 3 worked examples
- downstream usage assumptions for F-GROWTH-001

End with two short sections:
- Open questions still worth review
- Registry impact

Constraints:
- Keep the proposal implementation-oriented
- Distinguish clearly between canonical contract, formula behavior, and future soil-system extensions
- If you recommend changing the registry contract or data-model field names, say exactly what would need to change
```

### Why Last

This converts the mechanics review into a concrete proposal that can be challenged, approved, and used to clean up the contract surface.

---

## Output Capture

Write outputs under `docs/to-review/` using these paths:

- exploratory or intermediate pass:
  `docs/to-review/F-SOIL-001-review-pass-<agent-or-date>.md`
- strongest current synthesized proposal:
  `docs/to-review/F-SOIL-001-proposal.md`

Guidance:

- Use `review-pass` files for answers to Prompts 1 through 3 and any intermediate synthesis.
- Use `F-SOIL-001-proposal.md` for the best current V1 recommendation after Prompt 4.
- If multiple agents are working in parallel, each agent should keep its own `review-pass` file rather than overwriting another agent's work.

## Usage Notes

- If an agent is starting cold, begin at Prompt 1.
- If the main question is only about modifier math, Prompt 2 can be run after a quick registry-and-model alignment read.
- Prompt 3 should be run before final synthesis if there is any uncertainty about Seed or Soil field shape.
- Prompt 4 should be run only after at least one pass on Prompts 1 through 3.

## Review Standard

A good response set should:

- stay aligned with the current `F-SOIL-001` registry entry unless a change is justified
- produce a soil-fit model that is understandable, tunable, and player-readable
- preserve pH as a meaningful gate without making the system feel arbitrary
- identify any seed/soil contract drift explicitly rather than coding around it implicitly
- leave a reviewer with a concrete V1 recommendation rather than only alternate math options
