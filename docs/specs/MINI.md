# MINI — Mini-Game Specifications

Status: `draft`
@source: [PRD.md](../PRD.md), [breeding-flow.md](../process-flows/breeding-flow.md)

---

### MINI-001
The game shall make mini-games available in at minimum the following activities: breeding/pollination, tending, and harvesting — with the system designed to accommodate additional activity types.

### MINI-002
Every mini-game shall be optional. WHEN a player skips a mini-game, the game shall apply base probabilities or default outcomes — the player must not receive a worse outcome than if the mini-game did not exist.

> **Testable:** The outcome distribution for "skip" must be identical to the base-probability outcome with no mini-game present.

### MINI-003
WHEN a player completes a mini-game, the game shall provide potential for an improved outcome. The improvement must not be guaranteed — a neutral mini-game result shall fall back to base probabilities.

> **Testable:** A neutral mini-game result must produce an outcome distribution statistically equivalent to the skip path.

### MINI-004
WHEN designing or extending mini-game types, the game's mini-game system shall support different mini-game implementations per activity without requiring core loop changes.
