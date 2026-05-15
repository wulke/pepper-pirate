# Claude Project Instructions

## What This Project Is

Pepper Pirate is an incremental/idle game about growing, breeding, and trading peppers. The core differentiator is a genetics system — players build pepper bloodlines across generations, stabilizing traits through selective breeding. There is no code yet; the project is in the design documentation phase.

Start with [docs/PRD.md](./docs/PRD.md) for high-level game design, then read the specific docs relevant to the task at hand.

## Project Map

- **Core:** [PRD.md](./docs/PRD.md) (Vision), [GENETICS.md](./docs/GENETICS.md) (Breeding), [PEPPER-ALMANAC.md](./docs/PEPPER-ALMANAC.md) (Archetypes)
- **Data:** [PEPPER.md](./docs/data-models/PEPPER.md) (Hierarchy), [FORMULA-REGISTRY.md](./docs/FORMULA-REGISTRY.md) (Truth)
- **Models:** See `docs/data-models/` for SEED, PLANT, NODE, FRUIT, PLOT, SOIL.
- **Formulas:** [LIFECYCLE-FORMULAS.md](./docs/LIFECYCLE-FORMULAS.md) (Growth math)
- **Flows:** [breeding-flow.md](./docs/process-flows/breeding-flow.md), [growing-cycle.md](./docs/process-flows/growing-cycle.md), [season-cycle.md](./docs/process-flows/season-cycle.md), [core-game-loop.md](./docs/process-flows/core-game-loop.md)
- **Review:** [to-review/](./docs/to-review/) (Brainstorms pending approval)

## Operational Mandates

### Formula Integrity
Treat [docs/FORMULA-REGISTRY.md](./docs/FORMULA-REGISTRY.md) as the absolute source of truth. Use the [formula-registry-guard](./docs/ai-skills/formula-registry-guard/SKILL.md) skill for any task affecting gameplay math or formula-adjacent data models. 

**Requirement:** Update the registry in the same pass as any contract change. State registry status in every final response.

### Design & Brainstorming
1. **Model First:** Proposed formulas must use existing fields in [data-models/](./docs/data-models/).
2. **Trace Genetics:** Follow the flow: Seed → Plant → Node → Fruit → Seeds.
3. **Review Process:** Save brainstorms to `docs/to-review/`. Use blockquotes for review flags with actionable prompts.
4. **Context over Content:** Provide the "WHY" in brainstorms, not just the "WHAT."

### Core Principles
- **Stability != Generation:** Lineage consistency determines stability, not age.
- **Active-First, Idle-Supported:** Reward engagement; never punish idleness.
- **Structured Depth:** Systems are learnable and pattern-based, not pure RNG.

### Document Conventions
- Data models: Include goals, TS shape, rationale, and formula registry notes.
- Formulas: Use template in [FORMULA-REGISTRY.md](./docs/FORMULA-REGISTRY.md#formula-template) (ID: `F-DOMAIN-NNN`).
- Cross-reference with relative links. Check for formula participation when changing fields.
