# Process Flows

BPMN-style process flows for Pepper Pirate, written as Mermaid diagrams.

## Conventions

### File naming
- One flow per file, named descriptively: `growing-cycle.md`, `breeding-flow.md`, etc.
- Use kebab-case for file names.

### Cross-referencing
- When a flow connects to another flow, use a node labeled `{{flow-name}}` with a link annotation.
- In the diagram, reference external flows using a stadium-shaped node (rounded rectangle) with the format:

  ```
  ext_ref([See: Flow Name])
  ```

- Below the diagram, include a **Links** section listing all referenced flows:

  ```markdown
  **Links:**
  - [Flow Name](./flow-name.md) — brief context for why this flow is referenced
  ```

- When a flow is referenced *by* other flows, include a **Referenced by** section:

  ```markdown
  **Referenced by:**
  - [Other Flow](./other-flow.md) — where in that flow this one is invoked
  ```

### Diagram style
- Use `flowchart TD` (top-down) for most flows. Use `LR` (left-right) when it reads better.
- Decision nodes use `{}` (diamond/rhombus).
- External flow references use `([])` (stadium/rounded).
- Start/end nodes use `([])` (stadium/rounded) with explicit Start/End labels.
- Process steps use `[]` (rectangle).
- Mini-game opt-in points use `{{}}` (hexagon) to visually distinguish them.

## Flow Index

| Flow | Description | Status |
|---|---|---|
| [Core Game Loop](./core-game-loop.md) | Top-level view of the three nested loops | Draft |
| [Growing Cycle](./growing-cycle.md) | Plant → Tend → Harvest → Decide | Draft |
| [Breeding Flow](./breeding-flow.md) | Parent selection → Mini-game → Offspring | Draft |
| [Season Cycle](./season-cycle.md) | Season progression and prestige reset | Draft |
