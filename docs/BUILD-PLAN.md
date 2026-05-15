# BUILD-PLAN — GROW Domain (TDD Sequence)

> Status: `pending owner approval` — no code is written until this document is approved.
>
> Registry status: FORMULA-REGISTRY.md read and confirmed consistent with proposals in `to-review/`. No registry changes are made in this document. Registry promotion happens in the formula finalization PRs defined below.

---

## Master Sequence

| # | PR Title | Type | Blocking On |
|---|---|---|---|
| 0 | `types: translate all data model docs to TypeScript interfaces` | Types | Prerequisites complete |
| F1 | `formula: promote F-SOIL-001 to approved` | Formula | PR 0 merged |
| F2 | `formula: promote F-TEND-001 to approved` | Formula | PR 0 merged |
| F3 | `formula: promote F-FRUIT-001 to approved` | Formula | PR 0 merged |
| F4 | `formula: promote F-SEED-002 to approved` | Formula | PR 0 merged |
| 1A | `test(grow/planting): GROW-001 through GROW-003 — red tests` | Tests | PR 0, F1 merged |
| 1B | `feat(grow/planting): implement planting group — green tests` | Impl | PR 1A owner-approved |
| 2A | `test(grow/tending): GROW-004 through GROW-006 — red tests` | Tests | PR 0, F2 merged |
| 2B | `feat(grow/tending): implement tending group — green tests` | Impl | PR 2A owner-approved |
| 3A | `test(grow/harvesting): GROW-007 through GROW-009 — red tests` | Tests | PR 0, F3, F4 merged |
| 3B | `feat(grow/harvesting): implement harvesting group — green tests` | Impl | PR 3A owner-approved |

Formula finalization PRs (F1–F4) are independent of one another and may be opened in parallel after PR 0 merges. Spec groups are serialized within each group (A before B) but otherwise independent across groups.

---

## Prerequisites

These steps are completed once before PR 0 is opened. An agent must verify each item before proceeding.

### 1. GitHub Repository

```bash
gh auth status                          # verify authenticated as repo owner
gh repo create pepper-pirate \
  --private \
  --description "Pepper Pirate — headless incremental pepper-breeding engine" \
  --clone
cd pepper-pirate
```

The repo must exist and the local clone must be confirmed before any PR workflow begins.

### 2. Tooling Setup

Initialize the TypeScript package with the following choices. Rationale is provided for each so the owner can challenge or affirm before code is written.

**Package manager: npm**
Plain npm with a standard `package.json` and `package-lock.json`. No Yarn or pnpm. Removes a dependency class from a project that has none yet.

**Language: TypeScript 5.x**
Strict mode enabled. All interfaces from the data model docs are the direct source of types — no inference shortcuts.

**Test runner: Vitest**
Vitest is the well-proven, zero-config TypeScript test runner that runs Jest-compatible `describe`/`it`/`expect` syntax without a Babel transpile step. It is faster than Jest on cold starts and natively understands ESM. Alternatives considered:
- Jest: requires ts-jest or Babel config to run TypeScript without a build step; heavier setup for no gain here.
- Node test runner: no first-class `describe` grouping; not worth the friction for a spec-driven suite.

**`package.json` key entries:**

```json
{
  "name": "pepper-pirate",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

**`tsconfig.json` key settings:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Directory layout:**

```
src/
  types/          # interfaces from PR 0 — no logic
  grow/
    planting/
    tending/
    harvesting/
tests/
  grow/
    planting/
    tending/
    harvesting/
```

### 3. `gh` CLI Authentication Check

Before opening any PR, the agent must confirm:

```bash
gh auth status   # must show "Logged in to github.com as <owner>"
gh repo view     # must resolve the correct repo
```

If either check fails, stop and report to the owner before proceeding.

---

## Formula Finalization

Each formula finalization PR follows this exact workflow. The agent must not skip or reorder steps.

### Agent Workflow (per formula)

1. **Read the proposal.** Open `docs/to-review/F-<DOMAIN>-<NNN>-proposal.md`. Read it fully.

2. **Read the current registry entry.** Open `docs/FORMULA-REGISTRY.md` and locate the matching formula section.

3. **Apply the proposal's registry changes.** Each proposal file includes a "Registry Impact" section listing the exact changes required (field path corrections, status change, any new fields). Apply every listed change to `FORMULA-REGISTRY.md`.

4. **Update dependent data model docs if the proposal requires it.** For example, F-SOIL-001 requires adding `soilAffinity` to the `Seed.genetics` TypeScript shape in `docs/data-models/SEED.md`. Make that change in the same commit as the registry update.

5. **Set formula status to `approved`.** The registry entry's `Status:` line must change from `draft` (or `concept`) to `approved`.

6. **Open a PR against `main`.**

   - Branch name: `formula/F-<DOMAIN>-<NNN>-approve`
   - PR title: `formula: promote F-<DOMAIN>-<NNN> to approved`
   - PR body must state: which proposal file was read, which registry changes were applied, which data model docs (if any) were updated, and any open questions that remain unresolved and are deferred to implementation.

7. **Do not resolve open questions.** If the proposal's "Open Questions" section contains unresolved items, list them in the PR description as "deferred open questions" and do not invent answers. The owner resolves open questions, not the agent.

### Formula Finalization Blocking Logic

| Formula | Required Before | Notes |
|---|---|---|
| F-SOIL-001 | PR 1A (Planting tests) | Planting compatibility check (GROW-001) reads `soilModifier` logic. Tests must encode the correct field paths. |
| F-TEND-001 | PR 2A (Tending tests) | Tending bonus (GROW-004, GROW-005) encodes `careScore` and `tendingModifier` shape. |
| F-FRUIT-001 | PR 3A (Harvesting tests) | Harvesting yield evaluation (GROW-008) reads `Fruit.genetics` shape. GROW-009 seed extraction reads the same. |
| F-SEED-002 | PR 3A (Harvesting tests) | Seed viability at extraction time (GROW-009) must use the approved decay formula. |

F1 through F4 are independent of each other. An agent may open all four in parallel after PR 0 merges.

---

## PR Specifications

---

### PR 0 — Types: Translate Data Model Docs to TypeScript Interfaces

**Purpose:** Establish the shared type layer that all subsequent PRs import. No logic, no formulas, no functions.

**Inputs:**
- `docs/data-models/SEED.md` — `Seed`, `TraitGenome`, `TraitExpression`, `TraitRange`, `TraitKey`
- `docs/data-models/PLANT.md` — `Plant`, `StatusEffect`
- `docs/data-models/NODE.md` — `Node`
- `docs/data-models/FRUIT.md` — `Fruit`
- `docs/data-models/PLOT.md` — `Plot`, `PlotType`, `StageSupport`, `GrowthStage`
- `docs/data-models/SOIL.md` — `Soil`

**Outputs:**

| File | Contents |
|---|---|
| `src/types/seed.ts` | `Seed`, `TraitGenome`, `TraitExpression`, `TraitRange`, `TraitKey`, `SeedId`, `FruitId` |
| `src/types/plant.ts` | `Plant`, `StatusEffect`, `PlantId`, `NodeId`, `PlotId` |
| `src/types/node.ts` | `Node` |
| `src/types/fruit.ts` | `Fruit` |
| `src/types/plot.ts` | `Plot`, `PlotType`, `StageSupport`, `GrowthStage` |
| `src/types/soil.ts` | `Soil` |
| `src/types/index.ts` | Re-exports all of the above |

**Acceptance Criteria:**
- `npm run typecheck` exits with code 0.
- No test file exists yet — this PR contains only `src/types/`.
- Every field from each data model doc is present in the interface. The agent must do a line-by-line field check against the source docs.
- No field is invented or omitted. If a doc has an open question about a field's type, the agent uses the type stated in the doc and notes the open question in the PR description as a deferred item.
- `Seed.genetics.soilAffinity` is **not** yet added here — that change is gated on F-SOIL-001 approval. The interface from `SEED.md` as it currently reads is what gets translated. (F-SOIL-001's registry impact step will add `soilAffinity` when that formula PR merges.)

**Blocking Dependencies:** Prerequisites complete (repo created, tooling initialized).

---

### PR F1 — Formula: Promote F-SOIL-001 to Approved

**Purpose:** Apply the F-SOIL-001 proposal's registry and data model changes, advancing the formula from `draft` to `approved`.

**Inputs:**
- `docs/to-review/F-SOIL-001-proposal.md` — the authoritative proposal
- `docs/FORMULA-REGISTRY.md` — current registry entry
- `docs/data-models/SEED.md` — requires `soilAffinity` field addition
- `src/types/seed.ts` — requires matching TypeScript update

**Outputs:**
- `docs/FORMULA-REGISTRY.md` — field path corrections applied (see proposal § Registry Impact), status set to `approved`
- `docs/data-models/SEED.md` — `soilAffinity` block added to `Seed.genetics` TypeScript shape
- `src/types/seed.ts` — `soilAffinity` added to `Seed['genetics']` interface

**Acceptance Criteria:**
- `FORMULA-REGISTRY.md` F-SOIL-001 entry shows `Status: approved`.
- All six field path corrections from the proposal's Registry Impact table are applied exactly.
- `soilAffinity` is present in both `SEED.md` and `src/types/seed.ts` with the exact shape from the proposal.
- `npm run typecheck` exits with code 0.
- PR description lists any open questions from the proposal that remain unresolved.

**Blocking Dependencies:** PR 0 merged.

---

### PR F2 — Formula: Promote F-TEND-001 to Approved

**Purpose:** Apply the F-TEND-001 proposal's registry changes, advancing the formula from `draft` to `approved`.

**Inputs:**
- `docs/to-review/F-TEND-001-proposal.md`
- `docs/FORMULA-REGISTRY.md`

**Outputs:**
- `docs/FORMULA-REGISTRY.md` — F-TEND-001 reads list updated to match proposal inputs; status set to `approved`

**Acceptance Criteria:**
- `FORMULA-REGISTRY.md` F-TEND-001 entry shows `Status: approved`.
- The `Reads:` section of the registry entry is updated to match the proposal inputs exactly: `Plant.tending.lastTendedAtTick`, `Plant.tending.careScore`, `Plant.tending.autoTendEnabled`, relevant `Plant.health.activeEffects`, recent qualified tending actions.
- No data model doc changes are required (proposal does not mandate any).
- PR description lists remaining open questions as deferred.

**Blocking Dependencies:** PR 0 merged.

---

### PR F3 — Formula: Promote F-FRUIT-001 to Approved

**Purpose:** Apply the F-FRUIT-001 proposal's registry changes, advancing the formula from `draft` to `approved`.

**Inputs:**
- `docs/to-review/F-FRUIT-001-proposal.md`
- `docs/FORMULA-REGISTRY.md`

**Outputs:**
- `docs/FORMULA-REGISTRY.md` — F-FRUIT-001 status set to `approved`; definition block updated to match the proposal's exact formula text for parent contribution, stability, mutation, and lockState tiers

**Acceptance Criteria:**
- `FORMULA-REGISTRY.md` F-FRUIT-001 entry shows `Status: approved`.
- The definition block in the registry matches the proposal's canonical formula text (parent contribution rule, stability rule including `reinforcementBonus` / `divergencePenalty`, mutation rule, `lockState` tiers).
- The proposal's "What exactly F-SEED-001 consumes" section's `traitVarianceCap` formula is noted in the F-SEED-001 registry entry's "Notes" field as a downstream contract.
- PR description lists open questions (categorical trait distance, mini-game weight steering) as deferred.

**Blocking Dependencies:** PR 0 merged.

---

### PR F4 — Formula: Promote F-SEED-002 to Approved

**Purpose:** Apply the F-SEED-002 proposal's registry changes, advancing the formula from `draft` to `approved`.

**Inputs:**
- `docs/to-review/F-SEED-002-proposal.md`
- `docs/FORMULA-REGISTRY.md`

**Outputs:**
- `docs/FORMULA-REGISTRY.md` — F-SEED-002 definition updated to include `DECAY_BASE = 0.92` as the V1 constant; status set to `approved`

**Acceptance Criteria:**
- `FORMULA-REGISTRY.md` F-SEED-002 entry shows `Status: approved`.
- The definition block explicitly names `DECAY_BASE = 0.92` as the V1 default constant (not just the formula shape).
- PR description lists remaining open questions (exact `DECAY_BASE` tuning once germination formula exists, storage environment modifiers) as deferred.

**Blocking Dependencies:** PR 0 merged.

---

### PR 1A — Test: Planting Group (GROW-001, GROW-002, GROW-003) — Red

**Purpose:** Write the complete test suite for the planting group. All tests must fail (red) when the PR is opened because no implementation exists.

**Inputs:**
- `docs/specs/GROW.md` § Planting — authoritative statement of expected behavior
- `src/types/` — interfaces for `Seed`, `Plot`, `Soil`
- `docs/FORMULA-REGISTRY.md` F-SOIL-001 entry (now `approved`) — for correct field paths in test fixtures

**Outputs:**

| File | Contents |
|---|---|
| `tests/grow/planting/compatibility.test.ts` | GROW-001, GROW-002 |
| `tests/grow/planting/plot-availability.test.ts` | GROW-003 |

**Test Structure:**

```
describe('GROW-001', () => {
  it('rejects an incompatible seed without advancing its state', ...)
  it('returns a rejection result when soil pH is out of seed tolerance', ...)
  it('returns a rejection result when NPK is outside seed affinity', ...)
})

describe('GROW-002', () => {
  it('returns an offer-alternatives result, not a plant result, on incompatible seed', ...)
  it('does not mutate seed state when offering alternatives', ...)
})

describe('GROW-003', () => {
  it('returns a no-open-plots result when all plots are occupied', ...)
  it('presents a purchase-or-unlock option in the no-open-plots result', ...)
  it('does not attempt to plant the seed when no plots are available', ...)
})
```

Each test uses minimal in-memory fixtures built from the TypeScript interfaces. No database, no I/O, no side effects.

**Acceptance Criteria (owner review gate):**
- All tests run (`npm test`) and all fail for the correct reason: the module under test does not exist yet. CI must not fail due to syntax errors or import failures — the test file must be structurally valid.
- Each spec ID maps to exactly one `describe` block. No spec is untested, no describe block covers multiple spec IDs.
- Test descriptions read as behavioral statements, not implementation statements (e.g., "rejects incompatible seed without advancing its state" not "calls checkCompatibility and returns false").
- Fixtures use only fields present in approved type interfaces.

**Blocking Dependencies:** PR 0 merged, PR F1 merged.

---

### PR 1B — Feat: Planting Group Implementation — Green

**Purpose:** Implement the planting module so that all GROW-001 through GROW-003 tests pass.

**Inputs:**
- `tests/grow/planting/` — the test suite from PR 1A (must not be modified)
- `docs/FORMULA-REGISTRY.md` F-SOIL-001 — approved formula definition
- `src/types/` — all interfaces

**Outputs:**

| File | Contents |
|---|---|
| `src/grow/planting/checkCompatibility.ts` | GROW-001, GROW-002: soil/climate check, returns typed result union |
| `src/grow/planting/plotAvailability.ts` | GROW-003: open-plot check, returns typed result union |
| `src/grow/planting/index.ts` | Re-exports |

**Acceptance Criteria:**
- `npm test` exits with code 0. All tests in `tests/grow/planting/` pass.
- No test file is modified.
- `npm run typecheck` exits with code 0.
- `soilModifier` is computed using the exact F-SOIL-001 formula as approved (tolerance, plateau + falloff, pH as gatekeeper multiplier). The formula implementation must be traceable to the registry entry.
- GROW-002 and GROW-003 return structured result types, not thrown exceptions, for the alternative/no-plot paths.

**Blocking Dependencies:** PR 1A owner-approved and merged.

---

### PR 2A — Test: Tending Group (GROW-004, GROW-005, GROW-006) — Red

**Purpose:** Write the complete test suite for the tending group. All tests must fail (red) when the PR is opened.

**Inputs:**
- `docs/specs/GROW.md` § Tending
- `src/types/` — `Plant`, `Seed`
- `docs/FORMULA-REGISTRY.md` F-TEND-001 entry (now `approved`)
- Cross-domain boundary rule for GROW-006 (see Conventions § Cross-Domain Boundary)

**Outputs:**

| File | Contents |
|---|---|
| `tests/grow/tending/auto-tend.test.ts` | GROW-004 |
| `tests/grow/tending/active-tend.test.ts` | GROW-005 |
| `tests/grow/tending/pollination-routing.test.ts` | GROW-006 |

**Test Structure:**

```
describe('GROW-004', () => {
  it('advances a fully unattended plant to maturity given sufficient ticks', ...)
  it('does not fail the crop when the plant is left unattended', ...)
  it('applies base auto-tend effectiveness (careScore floor) when autoTendEnabled is true', ...)
})

describe('GROW-005', () => {
  it('applies a tending bonus above base effectiveness on a qualified watering action', ...)
  it('applies a tending bonus above base effectiveness on a qualified soil-check action', ...)
  it('applies a tending bonus above base effectiveness on a qualified pest-control action', ...)
  it('does not increase careScore above the cap for non-qualifying repeated actions', ...)
})

describe('GROW-006', () => {
  it('emits a BREED_ROUTING_REQUESTED event when a node enters its pollination window', ...)
  it('includes nodeId, plantId, and pollinationWindowEnd in the emitted event payload', ...)
  it('does not advance the node past pollination_window without a breed-domain response', ...)
})
```

**Acceptance Criteria (owner review gate):**
- Same structural validity requirements as PR 1A.
- GROW-006 tests assert only on the emitted event and on the node not advancing — they do not import or call any breeding-domain module.
- GROW-004 test uses a deterministic tick-step function with a controlled `careScore` floor, not real timers.
- GROW-005 tests confirm the `tendingModifier` value range from the approved F-TEND-001 formula shape.

**Blocking Dependencies:** PR 0 merged, PR F2 merged.

---

### PR 2B — Feat: Tending Group Implementation — Green

**Purpose:** Implement the tending module so that all GROW-004 through GROW-006 tests pass.

**Inputs:**
- `tests/grow/tending/` — the test suite from PR 2A (must not be modified)
- `docs/FORMULA-REGISTRY.md` F-TEND-001 — approved formula definition
- `src/types/`

**Outputs:**

| File | Contents |
|---|---|
| `src/grow/tending/autoTend.ts` | GROW-004: per-tick auto-tend, `careScore` floor logic |
| `src/grow/tending/activeTend.ts` | GROW-005: qualified action handler, `careScore` update |
| `src/grow/tending/pollinationRouter.ts` | GROW-006: pollination window watcher, event emitter |
| `src/grow/tending/index.ts` | Re-exports |

**Acceptance Criteria:**
- `npm test` exits with code 0. All tests in `tests/grow/tending/` pass.
- No test file is modified.
- `npm run typecheck` exits with code 0.
- `tendingModifier` is computed using the exact F-TEND-001 formula (decay rule, breakpoint at `careScore = 0.40`, modifier band `0.90–1.15`).
- GROW-006 emits a typed event object — it does not call any breeding-domain module directly. The event type is defined in `src/types/` as a plain interface.

**Blocking Dependencies:** PR 2A owner-approved and merged.

---

### PR 3A — Test: Harvesting Group (GROW-007, GROW-008, GROW-009) — Red

**Purpose:** Write the complete test suite for the harvesting group. All tests must fail (red) when the PR is opened.

**Inputs:**
- `docs/specs/GROW.md` § Harvesting
- `src/types/` — `Fruit`, `Seed`, `Plant`
- `docs/FORMULA-REGISTRY.md` F-FRUIT-001 and F-SEED-002 entries (both now `approved`)

**Outputs:**

| File | Contents |
|---|---|
| `tests/grow/harvesting/harvest-ready.test.ts` | GROW-007 |
| `tests/grow/harvesting/harvest-evaluation.test.ts` | GROW-008 |
| `tests/grow/harvesting/disposition.test.ts` | GROW-009 |

**Test Structure:**

```
describe('GROW-007', () => {
  it('queues a harvest-ready notification when a fruit reaches the ripe stage', ...)
  it('does not expire or discard a ripe fruit before the player acts', ...)
  it('keeps the fruit in ready state across multiple tick advances without harvest', ...)
})

describe('GROW-008', () => {
  it('returns yield quantity for a harvested mature fruit', ...)
  it('returns quality grade for a harvested mature fruit', ...)
  it('returns a trait summary for a harvested mature fruit', ...)
  it('requires a disposition decision before finalizing harvest', ...)
})

describe('GROW-009', () => {
  it('supports sell-whole-fruit disposition independently', ...)
  it('supports extract-seeds disposition independently', ...)
  it('supports send-to-processing disposition independently', ...)
  it('supports a split disposition combining multiple uses', ...)
  it('applies F-SEED-002 viability decay for seeds stored across seasons', ...)
})
```

**Acceptance Criteria (owner review gate):**
- Same structural validity requirements as PR 1A.
- GROW-007 tests confirm the non-expiry behavior: a fruit at `status: 'ready'` must remain at that status regardless of tick count while player has not acted.
- GROW-008 tests confirm three separate return fields: quantity, quality, trait summary. A single opaque "result" object does not pass review.
- GROW-009 test for split disposition uses two or more disposition types in the same call and confirms each sub-result is independently represented.
- The F-SEED-002 viability test uses `DECAY_BASE = 0.92` exactly and checks at least one age/viability pair from the proposal's value table.

**Blocking Dependencies:** PR 0 merged, PR F3 merged, PR F4 merged.

---

### PR 3B — Feat: Harvesting Group Implementation — Green

**Purpose:** Implement the harvesting module so that all GROW-007 through GROW-009 tests pass.

**Inputs:**
- `tests/grow/harvesting/` — the test suite from PR 3A (must not be modified)
- `docs/FORMULA-REGISTRY.md` F-FRUIT-001 and F-SEED-002 — approved formula definitions
- `src/types/`

**Outputs:**

| File | Contents |
|---|---|
| `src/grow/harvesting/harvestReady.ts` | GROW-007: fruit maturity watcher, notification queue |
| `src/grow/harvesting/harvestEvaluator.ts` | GROW-008: yield/quality/trait evaluation |
| `src/grow/harvesting/disposition.ts` | GROW-009: all four disposition paths |
| `src/grow/harvesting/seedViability.ts` | F-SEED-002 decay computation |
| `src/grow/harvesting/index.ts` | Re-exports |

**Acceptance Criteria:**
- `npm test` exits with code 0. All tests in `tests/grow/harvesting/` pass.
- No test file is modified.
- `npm run typecheck` exits with code 0.
- `seedViability.ts` implements `viability = DECAY_BASE ^ (ageInSeasons ^ 2)` with `DECAY_BASE` as a named constant defaulting to `0.92`.
- Disposition paths return distinct typed result shapes. A union type distinguishes each disposition outcome.
- No GROW-009 disposition path silently discards the player's intent — each path must produce a traceable state change on the `Fruit` object.

**Blocking Dependencies:** PR 3A owner-approved and merged.

---

## Conventions

### Test File Naming

```
tests/grow/<group>/<behavior>.test.ts
```

- `<group>`: `planting`, `tending`, or `harvesting`
- `<behavior>`: named after the behavioral concern, not the spec ID. The spec ID appears inside the file in the `describe` block, not in the filename.

### Spec ID to Test Description Mapping

Every spec must have exactly one `describe` block named with its spec ID:

```ts
describe('GROW-001', () => { ... })
describe('GROW-002', () => { ... })
```

Nested `it` blocks state behavior in plain English. They must be readable without knowing the spec.

### Fixture Construction

All test fixtures are plain object literals constructed inline or in a `fixtures.ts` helper within the same test directory. No factories, no shared global test state. Each test constructs only the fields it actually needs for the behavior under test — other fields may be minimal stubs that satisfy TypeScript but carry no test significance.

### No I/O in Tests

Test files must not read files, open network connections, access a database, or use real timers. Deterministic inputs only.

### Cross-Domain Boundary Pattern (GROW-006)

GROW-006 routes a flowering node to the Breeding domain. The GROW domain's responsibility ends at emitting a typed event. The test verifies:
1. The event is emitted with correct payload fields.
2. The node's state does not advance past `pollination_window` before the GROW domain receives a breed-domain response.

The typed event is defined in `src/types/events.ts` as:

```ts
export type BreedRoutingRequestedEvent = {
  type: 'BREED_ROUTING_REQUESTED';
  nodeId: string;
  plantId: string;
  pollinationWindowEnd: number;
};
```

The GROW implementation calls a caller-supplied `emit` function (dependency injection via parameter). Tests pass a jest/vitest spy as `emit`. No breeding module is imported in `src/grow/`.

### Result Union Types

Functions that have multiple behavioral outcomes (reject, offer alternatives, no plots available) return a discriminated union rather than throwing exceptions. Example pattern:

```ts
type PlantingResult =
  | { outcome: 'planted'; plant: Plant }
  | { outcome: 'incompatible'; reason: 'soil' | 'climate'; alternatives: 'change_seed' | 'upgrade_plot' }
  | { outcome: 'no_plots'; nextAction: 'purchase' | 'unlock' };
```

Tests assert on `result.outcome` before reading type-narrowed fields.

### Formula Constants

Any formula that has a named constant (`DECAY_BASE`, `MAX_VARIANCE`, etc.) must define that constant as a named `const` export in the implementation file. This allows tests to import and document the constant by name rather than using a magic number.

---

## Formula Registry Status at Build Start

All formulas currently at `draft` or `concept`. The formula finalization PRs (F1–F4) promote the four that unblock GROW tests. Remaining formulas (`F-PLOT-001`, `F-PLOT-002`, `F-HEALTH-001`, `F-GROWTH-001`, `F-SEED-001`, `F-SEED-003`) are not finalized in this plan — their approval is deferred to the implementation PRs or domain plans that depend on them.

> **Registry note:** This document does not modify FORMULA-REGISTRY.md. Registry changes happen in formula finalization PRs (F1–F4) only.
