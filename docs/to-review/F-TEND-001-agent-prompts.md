# F-TEND-001 — Agent Prompt Pack

Status: **working prompts** — intended to drive iterative review toward a final proposal for `F-TEND-001`

Related: [Formula Registry](../FORMULA-REGISTRY.md#f-tend-001--tending-modifier) | [Lifecycle Formulas](../LIFECYCLE-FORMULAS.md#tending-modifier) | [Plant Data Model](../data-models/PLANT.md) | [Growing Cycle](../process-flows/growing-cycle.md)

---

## Purpose

These prompts are ordered by dependency, not strict requirement. The output of each prompt should make the next one sharper and less speculative.

Use them to move an agent from `0 -> 1` on `F-TEND-001`:

1. define the V1 tending boundary
2. resolve what player actions count and how they decay
3. resolve how the modifier interacts with growth without overpowering core conditions
4. synthesize a review-ready proposal

Each prompt is written to reduce drift against the current registry and lifecycle docs.

---

## Prompt 1 — Define the V1 Contract Boundary

```text
Review docs/FORMULA-REGISTRY.md, docs/LIFECYCLE-FORMULAS.md, docs/data-models/PLANT.md, docs/data-models/SOIL.md, and docs/process-flows/growing-cycle.md.

Propose a V1 design boundary for F-TEND-001. Your job is to define what tending means in simulation terms, what this formula reads, what it writes in practice, and what should be deferred to later versions.

Constraints:
- Treat docs/FORMULA-REGISTRY.md as the canonical contract surface.
- Keep F-TEND-001 modest. Tending should help, but it should not erase bad soil, bad plot choice, or poor plant health.
- Align to the lifecycle guidance that tendingModifier operates in a narrow range around 1.0 and can contribute to the final growth soft cap.
- Distinguish clearly between player actions, plant state, and the resulting modifier.

Structure your answer as:
1. V1 contract
2. Candidate tending inputs
3. Assumptions and simplifications
4. Deferred behaviors for V2+
5. Registry impact
```

### Why First

This establishes whether V1 tending is primarily a short-lived buff model, a care-state model, or a hybrid before tuning values.

---

## Prompt 2 — Resolve Action Qualification and Decay

```text
Using the recommended V1 boundary for F-TEND-001, design the actual tending resolution model.

Your goal is to recommend one V1 formula shape for:
- which player actions count as tending
- how those actions accumulate or refresh
- how the effect decays over time
- how neglect creates a mild downside without feeling punitive

Constraints:
- The system should support both active tending and idle-friendly play.
- Opting out of active play should not create severe punishment.
- Tending should reward timing and consistency more than spam.
- The lifecycle doc's current target range is approximately 0.90 to 1.15.

Required analysis:
- Compare at least 3 models such as flat recent-action bonus, care meter with decay, and category-based care quality
- Explain what actions likely count in V1 versus later versions
- Show concrete examples over several ticks or a short in-game day
- Explain how a player reaches values near 1.05, 1.10, and 1.15

Structure your answer as:
1. Recommended action model
2. Recommended decay model
3. Numeric examples
4. Failure modes or exploits
5. Recommendation
```

### Why Second

The core open question for this formula is not the range but what behavior generates that range.

---

## Prompt 3 — Resolve Interaction with Growth and Adjacent Systems

```text
Using the recommended V1 tending model, determine how F-TEND-001 should interact with F-GROWTH-001 and adjacent plant systems.

Your goal is to make tending meaningful without letting it dominate the simulation.

Required analysis:
- Explain how the modifier should interact with soilModifier, plotModifier, and healthModifier
- Evaluate whether tending should affect only growth rate in V1 or also influence quality, resilience, or visibility in later versions
- Explain whether transplanting, status effects, or mini-game bonuses should reset, preserve, or partially dampen tending effects
- Identify what the player should be able to infer from the system from a readability standpoint

Constraints:
- Preserve the design rule that bad soil cannot be erased by good tending
- Preserve the final growth soft cap
- Keep V1 legible and implementation-oriented

Structure your answer as:
1. Interaction with F-GROWTH-001
2. Interaction with plant/status state
3. V1-only effects vs future extensions
4. Player readability implications
5. Registry impact
```

### Why Third

This formula exists mostly as an input into final growth. Its value depends on being strong enough to matter and weak enough not to become the dominant lever.

---

## Prompt 4 — Produce the Review-Ready V1 Proposal

```text
Synthesize the previous decisions into a concise, review-ready V1 proposal for F-TEND-001.

Write it as a design memo that could be used to update the lifecycle documentation and support a registry-aligned formula proposal.

Include:
- purpose
- inputs
- outputs
- action qualification rule
- decay rule
- modifier bands or formula
- interaction with F-GROWTH-001
- 2 to 3 worked examples

End with two short sections:
- Open questions still worth review
- Registry impact

Constraints:
- Keep the proposal implementation-oriented
- Distinguish clearly between player behavior, stored plant care state, and the computed modifier
- If you recommend changing the registry contract, say exactly what would need to change
```

### Why Last

This turns exploratory discussion into a concrete proposal that can be challenged, refined, and documented.

---

## Output Capture

Write outputs under `docs/to-review/` using these paths:

- exploratory or intermediate pass:
  `docs/to-review/F-TEND-001-review-pass-<agent-or-date>.md`
- strongest current synthesized proposal:
  `docs/to-review/F-TEND-001-proposal.md`

Guidance:

- Use `review-pass` files for answers to Prompts 1 through 3 and any intermediate synthesis.
- Use `F-TEND-001-proposal.md` for the best current V1 recommendation after Prompt 4.
- If multiple agents are working in parallel, each agent should keep its own `review-pass` file rather than overwriting another agent's work.

## Usage Notes

- If an agent is starting cold, begin at Prompt 1.
- If the V1 tending boundary is already accepted, begin at Prompt 2.
- Prompt 3 can run after Prompt 2 has produced a clear modifier shape.
- Prompt 4 should be run only after at least one pass on Prompts 1 through 3.

## Review Standard

A good response set should:

- stay aligned with the current `F-TEND-001` registry entry unless a change is justified
- preserve active-play upside without creating punishment for opting out
- make the tending range feel earned and understandable
- keep tending secondary to soil, plot, and health
- leave a reviewer with a concrete V1 recommendation rather than a menu of possibilities
