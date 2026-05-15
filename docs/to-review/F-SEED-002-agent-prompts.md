# F-SEED-002 — Agent Prompt Pack

Status: **working prompts** — intended to drive iterative review toward a final proposal for `F-SEED-002`

Related: [Formula Registry](../FORMULA-REGISTRY.md#f-seed-002--seed-viability-decay) | [Seed Data Model](../data-models/SEED.md#state) | [Lifecycle Formulas](../LIFECYCLE-FORMULAS.md)

---

## Purpose

These prompts are ordered by dependency, not strict requirement. The output of each prompt should make the next one sharper and less speculative.

Use them to move an agent from `0 -> 1` on `F-SEED-002`:

1. define the V1 viability boundary
2. resolve the actual decay curve
3. resolve gameplay interpretation and downstream consequences
4. synthesize a review-ready proposal

Each prompt is written to reduce drift against the current registry and seed model docs.

---

## Prompt 1 — Define the V1 Contract Boundary

```text
Review docs/FORMULA-REGISTRY.md, docs/data-models/SEED.md, docs/LIFECYCLE-FORMULAS.md, and any adjacent seed- or germination-related references.

Propose a V1 design boundary for F-SEED-002. Your job is to define what viability means in simulation terms, when it changes, what it affects, and what should be deferred to later versions.

Constraints:
- Treat docs/FORMULA-REGISTRY.md as the canonical contract surface.
- Keep V1 aligned to the current rule that seed viability decays exponentially across seasons in storage.
- Preserve the seed doc guidance that loss is mild early and severe by around 4 stored seasons.
- Distinguish viability from germination traits, rarity, and lineage quality.

Structure your answer as:
1. V1 contract
2. Simulation meaning of viability
3. Assumptions and simplifications
4. Deferred behaviors for V2+
5. Registry impact
```

### Why First

This formula is narrow, but the design still needs a clean statement of what viability is and is not before picking the actual curve.

---

## Prompt 2 — Resolve the Decay Curve

```text
Using the recommended V1 boundary for F-SEED-002, design the actual exponential decay model for seed viability.

Your goal is to recommend one V1 curve that satisfies:
- minimal loss after 1 stored season
- meaningful but not catastrophic decline after 2 to 3 seasons
- severe viability loss by around 4 stored seasons

Required analysis:
- Compare at least 3 curve shapes or parameterizations
- Provide a simple formula or config-driven representation
- Show viability values at 0, 1, 2, 3, 4, and 5 stored seasons
- Explain why the chosen curve feels right for player decision-making

Constraints:
- Keep the math simple enough to reason about and tune
- Avoid a curve that makes storage effectively irrelevant
- Avoid a curve that makes one missed season feel overly punishing

Structure your answer as:
1. Candidate curves compared
2. Recommended curve
3. Worked value table
4. Tuning knobs
5. Risks or edge cases
```

### Why Second

This is the core unresolved design choice. Once the curve is chosen, the rest of the review is mostly about interpretation and integration.

---

## Prompt 3 — Resolve Downstream Gameplay Consequences

```text
Using the recommended V1 viability curve, determine how F-SEED-002 should affect downstream gameplay.

Required analysis:
- Explain what low viability should mean for later planting or germination systems
- Evaluate whether viability should only affect binary germination success in V1, or also influence time-to-sprout or weak starts in future versions
- Explain how the system should feel for players who store seeds intentionally across multiple seasons
- Identify what should be visible to the player: exact percentage, bands, warnings, or inferred quality

Constraints:
- Do not overreach beyond the current registry contract
- Keep V1 narrow and implementation-oriented
- Preserve room for future storage-environment mechanics without requiring them now

Structure your answer as:
1. V1 gameplay effect
2. Player-facing interpretation
3. Future extensions kept out of scope
4. Registry impact
```

### Why Third

The decay curve is only useful once its gameplay meaning is explicit. This step prevents a mathematically neat curve from producing weak or confusing player consequences.

---

## Prompt 4 — Produce the Review-Ready V1 Proposal

```text
Synthesize the previous decisions into a concise, review-ready V1 proposal for F-SEED-002.

Write it as a design memo that could be used to update the seed documentation and support a registry-aligned formula proposal.

Include:
- purpose
- inputs
- outputs
- trigger timing
- recommended decay formula
- a short season-by-season value table
- player-facing interpretation
- how future planting/germination formulas are expected to consume viability

End with two short sections:
- Open questions still worth review
- Registry impact

Constraints:
- Keep the proposal implementation-oriented
- Distinguish clearly between stored state, decay math, and downstream usage
- If you recommend changing the registry contract, say exactly what would need to change
```

### Why Last

This turns the curve discussion into a concrete proposal that can be reviewed and documented without reopening the whole problem.

---

## Output Capture

Write outputs under `docs/to-review/` using these paths:

- exploratory or intermediate pass:
  `docs/to-review/F-SEED-002-review-pass-<agent-or-date>.md`
- strongest current synthesized proposal:
  `docs/to-review/F-SEED-002-proposal.md`

Guidance:

- Use `review-pass` files for answers to Prompts 1 through 3 and any intermediate synthesis.
- Use `F-SEED-002-proposal.md` for the best current V1 recommendation after Prompt 4.
- If multiple agents are working in parallel, each agent should keep its own `review-pass` file rather than overwriting another agent's work.

## Usage Notes

- If an agent is starting cold, begin at Prompt 1.
- If the viability boundary is already accepted, begin at Prompt 2.
- Prompt 3 should follow once a candidate curve exists.
- Prompt 4 should be run only after at least one pass on Prompts 1 through 3.

## Review Standard

A good response set should:

- stay aligned with the current `F-SEED-002` registry entry unless a change is justified
- produce a curve that is easy to tune and explain
- make stored seeds feel durable for a while, but not timeless
- preserve future room for richer storage or germination systems
- leave a reviewer with a concrete V1 recommendation rather than abstract curve talk
