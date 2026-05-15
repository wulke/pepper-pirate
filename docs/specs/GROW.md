# GROW — Growing Cycle Specifications

Status: `draft`
@source: [growing-cycle.md](../process-flows/growing-cycle.md), [PRD.md](../PRD.md)

---

## Planting

### GROW-001
WHEN a player selects a seed to plant, the game shall check the seed against the target plot's climate and soil conditions before allowing placement.

> **Testable:** Attempting to plant an incompatible seed in a plot must produce a rejection and not advance the seed's state.

### GROW-002
IF a seed is incompatible with the selected plot, THEN the game shall offer the player the option to choose a different seed or upgrade the plot — and shall not plant the seed.

### GROW-003
WHEN a player has no open plots, the game shall present the option to purchase or unlock a new plot before planting can continue.

---

## Tending

### GROW-004
WHILE a plant is in the growing phase and the player is inactive, the game shall automatically tend the plant at base effectiveness with no intervention required.

> **Testable:** A plant left fully unattended must still reach maturity; yield or quality may differ from actively tended plants, but the crop must not fail.

### GROW-005
WHEN a player actively tends a plant (water, soil check, pest control), the game shall apply a tending bonus above the base auto-tend effectiveness.

### GROW-006
WHEN a plant is in the growing phase and a flowering node enters its pollination window, the game shall route the player to the Breeding Flow before that node can progress to fruit.

---

## Harvesting

### GROW-007
WHEN a plant's fruit reaches maturity, the game shall queue a harvest-ready notification for the player.

> **Testable:** A fully matured fruit must remain available for harvest until the player acts; it must not expire, rot, or be silently discarded.

### GROW-008
WHEN a player harvests a mature plant, the game shall evaluate and display yield quantity, quality, and trait summary before the player makes a disposition decision.

### GROW-009
WHEN a player decides what to do with a harvest, the game shall support all of the following dispositions independently or in combination: sell whole fruit on the market, extract seeds to the seed library, send to processing, or split across multiple uses.
