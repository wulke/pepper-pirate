# Formula Review Workflow

Status: **working process** — reusable workflow for moving a formula from registry concept/draft into a review-ready proposal

Related: [Formula Registry](../FORMULA-REGISTRY.md)

---

## Purpose

This workflow is the standard process for taking a formula from open review to a concrete proposal without drifting from the registry or data model contracts.

It is designed for parallel agent work.

Use it when:

- a formula exists in the registry as `concept`, `draft`, or `needs_revision`
- the model fields exist but the formula math is still unresolved
- the formula has multiple open questions that need structured iteration

---

## High-Level Process

For each formula:

1. define the high-level review boundary and constraints
2. identify dependency relationships from the registry
3. break the design work into 3 to 4 prompts
4. order those prompts by dependency
5. save the prompts under `docs/to-review/`
6. let agents iterate in parallel where dependencies allow
7. synthesize a review-ready proposal

---

## Required Rules

- `docs/FORMULA-REGISTRY.md` is the canonical source of truth.
- Do not invent shadow formulas outside the registry.
- Distinguish clearly between:
  - canonical contract
  - formula behavior
  - deferred future extensions
- If a prompt recommends changing reads, writes, dependencies, owner, trigger, or output shape, the registry impact must be stated explicitly.
- If a formula depends on another unresolved formula, agents may still work in parallel, but must treat the upstream formula as a boundary condition rather than silently redefining it.

---

## Standard Prompt Set

Each formula should usually get 4 prompts.

### Prompt 1 — Define the V1 Boundary

Goal:
- define what the formula must compute in V1
- define what it reads and writes in practice
- identify what should be deferred

### Prompt 2 — Resolve Core Mechanics

Goal:
- define the main formula shape
- work through edge cases and player-facing consequences
- choose one recommendation rather than only listing options

### Prompt 3 — Resolve Downstream Interaction

Goal:
- define how this formula affects dependent formulas or systems
- identify what simplifications are acceptable in V1
- call out any lost fidelity

### Prompt 4 — Produce the Review-Ready Proposal

Goal:
- synthesize the prior work into a concise proposal
- include worked examples
- include explicit registry impact

---

## Parallelization Rule

Formulas can be worked on in parallel when they:

- have no `Depends On` relationship between them
- or only require a stable boundary from an upstream formula, not final tuning

Formulas should generally wait when they:

- directly consume unresolved outputs whose shape may still change
- or their core mechanic would be invalidated by an upstream contract change

---

## Output Convention

For each formula under review, add a companion prompt file:

`docs/to-review/F-<DOMAIN>-<NNN>-agent-prompts.md`

That file should include:

- purpose
- dependency ordering
- 3 to 4 prompts
- output capture rules
- usage notes for cold-start agents
- review standard

### Output Capture

Agents should write their outputs under `docs/to-review/` using a consistent naming pattern.

Per-pass exploratory output:

- `docs/to-review/F-<DOMAIN>-<NNN>-review-pass-<agent-or-date>.md`

Final synthesized proposal:

- `docs/to-review/F-<DOMAIN>-<NNN>-proposal.md`

Recommended conventions:

- Use `review-pass` files for prompt responses, comparisons, rough recommendations, and intermediate synthesis.
- Use the `proposal` file only for the strongest current recommendation that is ready for human review.
- Do not overwrite another agent's `review-pass` file.
- If updating an existing `proposal` file, preserve prior review context unless replacing it with a clearly better synthesis.

---

## Review Standard

A good formula review output should:

- remain registry-aligned unless a change is justified
- choose a V1 recommendation instead of staying purely exploratory
- explain tradeoffs in player-facing terms when relevant
- identify open questions that truly matter
- leave enough clarity to update docs without re-brainstorming from scratch
