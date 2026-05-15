# LOOP — Core Loop and Design Pillar Specifications

Status: `draft`
@source: [PRD.md](../PRD.md), [core-game-loop.md](../process-flows/core-game-loop.md)

These specs encode the game's design pillars as testable system behaviors. They act as cross-cutting constraints on all other domains.

---

## Active-First, Idle-Supported

### LOOP-001
WHILE a player is active, the game shall provide at least one meaningful available action (breed, tend, trade, process, mini-game) at all times between harvests.

### LOOP-002
WHILE a player is inactive, the game shall continue passive growth and queue outcomes — no crop, breed event, or market opportunity shall expire due to the player's absence.

> **Testable:** A session paused for an arbitrary duration must not result in lost crops, expired opportunities, or missed queued events.

### LOOP-003
The game shall never include mechanics that create real-time pressure (expiring offers, real-time market swings, or timed windows that close while the player is offline).

---

## Depth Through Choice

### LOOP-004
The game shall expose optional depth in every core activity. Players who engage shallowly shall still progress; players who engage deeply shall receive proportional rewards.

---

## Lineage as Gameplay

### LOOP-005
The game shall make a seed's lineage history — including known ancestors, generation depth, and per-trait stability — queryable by the player at any time a seed is in their inventory or planted.
