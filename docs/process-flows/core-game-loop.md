# Core Game Loop

Top-level view of the three nested gameplay loops. This is the entry point for understanding how the game flows.

```mermaid
flowchart TD
    Start([Start: New Game / New Season]) --> inner_loop

    subgraph inner_loop [Inner Loop — Minute-to-Minute]
        plant[Plant seeds in plots] --> tend[Tend: water, soil, pests]
        tend --> tend_mini{{Optional: Tending mini-game}}
        tend_mini --> breed_nodes([See: Breeding Flow])
        breed_nodes --> harvest[Harvest mature peppers]
        harvest --> decide{Decide what to do with harvest}
        decide -->|Sell whole fruit| market_action[Sell on market]
        decide -->|Extract seeds| seed_bank[Store in seed library]
        decide -->|Process| process[Process into products]
    end

    market_action --> mid_check{More to do this session?}
    seed_bank --> mid_check
    process --> mid_check
    mid_check -->|Yes| mid_loop
    mid_check -->|Continue growing| plant

    subgraph mid_loop [Mid Loop — Session-to-Session]
        breed([See: Breeding Flow]) --> expand[Expand: plots, infrastructure, upgrades]
        expand --> trade[Trade on market]
        trade --> discover[Discover: new families, traits, recipes]
    end

    discover --> season_check{Season ended?}
    season_check -->|No| plant
    season_check -->|Yes| season_ref([See: Season Cycle])

    season_ref --> Start
```

**Links:**
- [Breeding Flow](./breeding-flow.md) — invoked during flowering/pollination decisions and broader breeding planning
- [Season Cycle](./season-cycle.md) — invoked when the current season ends

**Referenced by:**
- None (this is the top-level flow)
