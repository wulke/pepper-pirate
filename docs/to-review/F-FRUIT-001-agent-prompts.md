# F-FRUIT-001 — Agent Prompt Pack

Status: **working prompts** — intended to drive iterative review toward a final proposal for `F-FRUIT-001`

Related: [Brainstorm](./F-FRUIT-001-brainstorm.md) | [Formula Registry](../FORMULA-REGISTRY.md#f-fruit-001--fruit-genetic-baseline-resolution) | [Fruit Data Model](../data-models/FRUIT.md#genetics) | [Seed Data Model](../data-models/SEED.md#supporting-types) | [Genetics](../GENETICS.md)

---

## Purpose

These prompts are ordered by dependency, not strict requirement. The output of each prompt should make the next one sharper and less speculative.

Use them to move an agent from `0 -> 1` on `F-FRUIT-001`:

1. define the V1 contract boundary
2. resolve the core inheritance and stability mechanics
3. resolve mutation and downstream variance behavior
4. synthesize a review-ready proposal

Each prompt is written to reduce drift against the current registry and data model docs.

---

## Prompt 1 — Define the V1 Contract Boundary

```text
Review docs/to-review/F-FRUIT-001-brainstorm.md, docs/FORMULA-REGISTRY.md, docs/data-models/FRUIT.md, docs/data-models/SEED.md, and docs/GENETICS.md.

Propose a V1 design boundary for F-FRUIT-001. Your job is to define what this formula must compute at fruit creation, what exactly it passes to F-SEED-001, and which richer behaviors should be explicitly deferred to later versions.

Constraints:
- Treat docs/FORMULA-REGISTRY.md as the canonical contract surface.
- Do not invent shadow formulas.
- Prefer the smallest V1 that still supports structured, learnable multi-generation breeding.
- Call out any place where the brainstorm implies a richer per-trait contract than the current registry explicitly states.

Structure your answer as:
1. V1 contract
2. Assumptions and simplifications
3. Deferred behaviors for V2+
4. Registry impact

Be explicit about whether the current registered outputs are sufficient:
- Fruit.genetics.traitBaseline
- Fruit.genetics.stabilityScore
- Fruit.genetics.varianceRange
```

### Why First

This establishes the design surface before agents start optimizing mechanics that may not fit the current contract.

---

## Prompt 2 — Resolve Inheritance, Stability, and Lock Progression

```text
Using the recommended V1 contract boundary for F-FRUIT-001, design the actual inheritance and stability resolution model.

Your goal is to recommend one V1 formula shape for:
- parent trait contribution
- per-trait stability resolution
- lockState progression

The model must satisfy these design constraints from docs/GENETICS.md:
- stability is not generation count
- repeated reinforcement and selective breeding should be able to increase stability over time
- divergent crosses should create discovery potential but destabilize consistency
- the system should remain structured and learnable, not opaque

Required analysis:
- Compare self-pollination, close-line breeding, and divergent cross-pollination
- Use concrete numeric examples across multiple generations
- Show at least one example starting from a middling stability value such as 0.4
- Evaluate whether lockState thresholds should be symmetric or asymmetric
- Describe how a destabilizing cross should knock a trait down from locked or mostly_stable

Structure your answer as:
1. Recommended parent contribution rule
2. Recommended stability formula
3. lockState threshold proposal
4. Worked multi-generation examples
5. Risks or edge cases
```

### Why Second

The main open design problem is stability. Lock progression depends on it, and downstream variance behavior is hard to judge until this curve exists.

---

## Prompt 3 — Resolve Mutation and Seed Variance Behavior

```text
Using the recommended V1 contract and stability model for F-FRUIT-001, resolve how mutation and seed variance should work.

Decide whether mutation in V1 should be:
- continuous low noise
- a discrete event
- or a hybrid

Then determine how F-SEED-001 should consume the fruit output:
- only fruit-level stabilityScore and varianceRange
- or per-trait stability influence in practice

Required analysis:
- Compare the player-feel consequences of each mutation approach across 5 to 10 generations
- Explain how stable lines stay reliable without becoming genetically dead
- Explain how unstable lines remain interesting without becoming unreadable
- State what fidelity is lost if V1 keeps only a single fruit-level varianceRange
- Call out whether the existing registry contract is sufficient for the recommendation

Structure your answer as:
1. Recommended mutation model
2. Recommended variance model for F-SEED-001 consumption
3. Player-feel implications
4. V1 simplifications vs future extensibility
5. Registry impact
```

### Why Third

Mutation and variance depend on the stability model. This step also forces a decision on whether V1 stays fruit-level or needs more per-trait richness downstream.

---

## Prompt 4 — Produce the Review-Ready V1 Proposal

```text
Synthesize the previous decisions into a concise, review-ready V1 proposal for F-FRUIT-001.

Write it as a design memo that could be used to update the open-review doc and prepare a registry-aligned formula proposal.

Include:
- purpose
- inputs
- outputs
- parent contribution rule
- stability rule
- mutation rule
- lockState resolution
- what exactly F-SEED-001 consumes
- 2 to 3 worked examples

End with two short sections:
- Open questions still worth review
- Registry impact

Constraints:
- Keep the proposal implementation-oriented
- Preserve the distinction between canonical contract, formula behavior, and future extensions
- If you recommend changing the registry contract, say exactly what would need to change
```

### Why Last

This converts exploratory work into a single proposal that can be reviewed, challenged, and turned into approved documentation.

---

## Output Capture

Write outputs under `docs/to-review/` using these paths:

- exploratory or intermediate pass:
  `docs/to-review/F-FRUIT-001-review-pass-<agent-or-date>.md`
- strongest current synthesized proposal:
  `docs/to-review/F-FRUIT-001-proposal.md`

Guidance:

- Use `review-pass` files for answers to Prompts 1 through 3 and any intermediate synthesis.
- Use `F-FRUIT-001-proposal.md` for the best current V1 recommendation after Prompt 4.
- If multiple agents are working in parallel, each agent should keep its own `review-pass` file rather than overwriting another agent's work.

## Usage Notes

- If an agent is starting cold, begin at Prompt 1.
- If Prompt 1 already produced a clear boundary, start at Prompt 2.
- If the main unresolved debate is only mutation or downstream variance behavior, Prompt 3 can be run independently after reviewing earlier output.
- Prompt 4 should be run only after at least one pass on Prompts 1 through 3.

## Review Standard

A good response set should:

- stay aligned with the current `F-FRUIT-001` registry entry unless a change is justified
- explain how stability can increase without collapsing into generation count
- make self-pollination and cross-pollination feel meaningfully different
- keep the system legible to players across multiple generations
- leave a reviewer with a concrete V1 recommendation, not just option lists
