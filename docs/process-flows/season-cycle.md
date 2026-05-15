# Season Cycle

The outer loop: how seasons progress, what happens at season boundaries, and what carries over during prestige. Each Season is a roguelike run — a unique Zone configuration, a Challenge Contract, and a Prestige Score evaluation at the end.

```mermaid
flowchart TD
    Start([Start: Season begins]) --> zone_assign[Zone assigned: environment type, weather pattern, soil quality baseline]
    zone_assign --> zone_reveal[Zone revealed to player]
    zone_reveal --> contract_present[Challenge Contract presented: visible objectives shown]

    contract_present --> setup[Set up farm: assign plots, review seed library]
    setup --> market_prices[Market prices set for this season]
    market_prices --> forecast[Forecast data available: next season hints]

    forecast --> play([See: Core Game Loop])

    play --> hidden_trigger{Hidden objective trigger met?}
    hidden_trigger -- Yes --> hidden_reveal[Hidden objective revealed in contract UI]
    hidden_trigger -- No --> season_end_trigger
    hidden_reveal --> season_end_trigger

    season_end_trigger{Season end triggered\ngoal-based or player-initiated}

    season_end_trigger --> final_harvest[Final harvest: collect all remaining crops]
    final_harvest --> contract_eval[Evaluate Challenge Contract objectives\nvisible + revealed hidden]
    final_harvest --> prestige_calc[Calculate Prestige Score\nyield · variety · rarity · profit · efficiency]

    contract_eval --> summary[Season summary screen]
    prestige_calc --> summary

    summary --> eval_yield[Total yield]
    summary --> eval_discovery[Varieties discovered]
    summary --> eval_profit[Profit / loss]
    summary --> eval_goals[Goals met]
    summary --> eval_contract[Contract objective results]
    summary --> eval_prestige[Prestige Score — per dimension]

    eval_yield --> meta_award[Award meta-progression unlocks\nfor completed contract objectives]
    eval_discovery --> meta_award
    eval_profit --> meta_award
    eval_goals --> meta_award
    eval_contract --> meta_award
    eval_prestige --> meta_award

    meta_award --> carryover[Determine carryover]

    carryover --> keep_seeds[Keep seed library — full or subset TBD]
    carryover --> keep_meta[Keep permanent meta-unlocks]
    carryover --> lose_infra[Lose plots and infrastructure]
    carryover --> lose_crops[Lose unharvested crops]

    keep_seeds --> new_season[Prepare next season]
    keep_meta --> new_season
    lose_infra --> new_season
    lose_crops --> new_season

    new_season --> new_zone[New Zone assigned]
    new_season --> new_market[New market prices and conditions]

    new_zone --> Start
    new_market --> Start
```

## Notes

- **Zone variance:** Each Season starts with a Zone configuration (environment, weather, soil baseline) that varies between runs, requiring players to adapt strategy rather than execute a fixed optimal path. See [season-roguelike-brainstorm.md](../to-review/season-roguelike-brainstorm.md) for Zone dimension details and open questions.
- **Challenge Contracts:** Visible objectives are shown before planting. Hidden objectives unlock mid-season when trigger conditions fire. Contracts are tiered by difficulty; higher tiers unlock via meta-progression. See [SEASON-013 through SEASON-016](../specs/SEASON.md).
- **Season end trigger:** Goal-based (contract completion triggers option to end) or player-initiated. Time-based triggers are avoided to preserve the active-first, idle-supported design pillar (LOOP-002, LOOP-003). Exact trigger logic is an open design question.
- **Prestige Score:** Calculated across five independent dimensions and stored persistently. Displayed as a profile, not a single number. See [SEASON-018, SEASON-019](../specs/SEASON.md).
- **Meta-progression:** Awarded on contract objective completion. Unlocks expand depth across systems (mini-games, breeding, soil) — not raw power. See [SEASON-020](../specs/SEASON.md).
- **Stored seed aging:** Carried seeds remain in the library, but `F-SEED-002` re-evaluates `Seed.state.viability` on season rollover for seeds in `stored` state (SEASON-009).
- **Seed library carryover:** Open design question — does the player keep everything, choose a limited selection, or is carryover gated by prestige currency? This significantly affects reset feel and Zone/genetics investment value each run.

**Links:**
- [Core Game Loop](./core-game-loop.md) — the gameplay that happens during a season
- [Season Roguelike Brainstorm](../to-review/season-roguelike-brainstorm.md) — full design rationale and open questions

**Referenced by:**
- [Core Game Loop](./core-game-loop.md) — season cycle is invoked when a season ends
