# Pepper Pirate Agent Guide

## Purpose

This file is a lightweight bootstrap for any new agent joining the Pepper Pirate project.

The goal is not to restate all project context. The goal is to help a new agent become useful quickly by:

- finding the right source docs
- understanding how to continue high-level brainstorming
- avoiding drift across formulas and data models
- using the existing design docs as the primary context surface

## Start Here
1. [PRD](./docs/PRD.md) (Vision)
2. [Genetics](./docs/GENETICS.md) (Breeding)
3. [Pepper Overview](./docs/data-models/PEPPER.md) (Data Hierarchy)

## Task Quick Links

| Task Area | Essential Docs |
| :--- | :--- |
| **Breeding & Inheritance** | [Genetics](./docs/GENETICS.md), [Seed](./docs/data-models/SEED.md), [Fruit](./docs/data-models/FRUIT.md), [Formula Registry](./docs/FORMULA-REGISTRY.md), [F-FRUIT-001 Brainstorm](./docs/to-review/F-FRUIT-001-brainstorm.md) |
| **Growth & Environment** | [Lifecycle Formulas](./docs/LIFECYCLE-FORMULAS.md), [Plot](./docs/data-models/PLOT.md), [Soil](./docs/data-models/SOIL.md), [Plant](./docs/data-models/PLANT.md), [Growing Cycle](./docs/process-flows/growing-cycle.md) |
| **Catalog & Rarity** | [Pepper Almanac](./docs/PEPPER-ALMANAC.md), [Seed](./docs/data-models/SEED.md) |
| **Process / Loop Reviews** | [Core Game Loop](./docs/process-flows/core-game-loop.md), [Breeding Flow](./docs/process-flows/breeding-flow.md), [Growing Cycle](./docs/process-flows/growing-cycle.md), [Season Cycle](./docs/process-flows/season-cycle.md) |
| **New Systems** | [PRD](./docs/PRD.md), [Genetics](./docs/GENETICS.md), [Pepper Overview](./docs/data-models/PEPPER.md), [Formula Registry](./docs/FORMULA-REGISTRY.md) |
| **EARS Specs** | [Specs Index](./docs/specs/README.md), [GROW](./docs/specs/GROW.md), [BREED](./docs/specs/BREED.md), [SEASON](./docs/specs/SEASON.md), [MARKET](./docs/specs/MARKET.md), [MINI](./docs/specs/MINI.md), [LOOP](./docs/specs/LOOP.md) |

## Source Of Truth Rules
- [EARS Specs](./docs/specs/) are the authoritative statement of intended system behavior. When implementing any feature, verify the relevant spec and cite the ID.
- [Formula Registry](./docs/FORMULA-REGISTRY.md) is the absolute truth for IDs, ownership, and dependencies.
- **Formula Work:** Use the `formula-registry-guard` skill.
- **Formula Workflow:** Read the registry first, identify affected formula IDs, update the registry in the same pass if a contract changes, and state registry status in the final response.
- **Documentation:** Prefer linking to existing docs over duplication.

## Working Style
- **Brainstorming:** Use existing models as constraints. Define WHY, not just WHAT.
- **Reviews:** Prioritize findings and gaps over summary.
- **Distinctions:** Keep intent, data shape, and formula contracts distinct.
- **Model First:** Proposed formulas should use existing fields in [docs/data-models/](./docs/data-models/).
- **Lifecycle Trace:** Follow the chain `Seed -> Plant -> Node -> Fruit -> Seeds` when reasoning about genetics and output flow.
- **Review Drafts:** Save brainstorms and review-only proposals in [docs/to-review/](./docs/to-review/).

## Prompt Patterns
- **System V1:** "Review <system> docs. Identify gaps and propose a V1 approach that preserves future flexibility."
- **Deep Review:** "Review <doc>. Identify design gaps and contradictions with adjacent systems."
- **Safe Extension:** "Propose model changes for <feature>. Separate canonical identity, runtime, and formula-owned fields."

## Constraints
- **Stability != Generation.**
- **No Shadow Formulas.** Check [Formula Registry](./docs/FORMULA-REGISTRY.md) before edits.
- **Status Matters.** Mark proposals as "proposed" until reviewed.
- **Don't duplicate.** Link instead.
