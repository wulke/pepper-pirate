# Breeding Flow

The process of assigning flowering nodes for self-pollination or cross-pollination, then carrying that decision forward into fruit and next-generation seed creation. This is the core mid-game activity and the primary way players discover new varieties and build bloodlines.

```mermaid
flowchart TD
    Start([Start: Flowering node enters pollination window]) --> select_female[Select maternal flowering node]
    select_female --> view_female[View maternal line: traits, lineage, stability]
    view_female --> choose_mode{Self or cross?}

    choose_mode -->|Self| self_parent[Use maternal plant as both parents]
    choose_mode -->|Cross| select_male[Select donor flowering node]
    select_male --> view_male[View donor line: traits, lineage, stability]

    self_parent --> preview[Preview fruit baseline: likely trait ranges, stability estimate]
    view_male --> preview
    preview --> confirm{Confirm pollination?}
    confirm -->|No| select_female
    confirm -->|Yes| mini_game_choice{Play breeding mini-game?}

    mini_game_choice -->|Skip| base_calc[Resolve pollination using base probabilities]
    mini_game_choice -->|Play| mini_game{{Breeding mini-game}}

    mini_game --> game_result{Mini-game outcome}
    game_result -->|Good result| boosted_calc[Resolve pollination with improved odds]
    game_result -->|Neutral result| base_calc

    base_calc --> fruit_baseline[Create fruit baseline from parent genomes]
    boosted_calc --> fruit_baseline

    fruit_baseline --> lineage_update[Record maternal and paternal seed lineage on fruit]
    lineage_update --> fruit_growth[Fruit grows on maternal plant]
    fruit_growth --> harvest[Harvest fruit]
    harvest --> decide{What to do with harvested fruit?}

    decide -->|Extract seeds| seed_generation[Resolve per-seed variance and create inventory seeds]
    decide -->|Sell whole| market([See: Growing Cycle])
    decide -->|Process whole| processing([See: Growing Cycle])

    seed_generation --> offspring_reveal[Reveal initial visible traits for extracted seeds]
    offspring_reveal --> trait_note[Some traits remain hidden or uncertain until later growth]
    trait_note --> next_step{What next?}
    next_step -->|Plant extracted seeds| grow([See: Growing Cycle])
    next_step -->|Store for later| seed_lib[Add seeds to library]

    seed_lib --> End([End: return to other activities])
    grow --> End
```

## Notes

- **Preview is informational, not deterministic.** The pollination preview shows likely fruit baseline ranges based on parent genetics and stability, but extracted seeds still carry variance — especially in early generations.
- **Mini-game does not guarantee improvement.** It provides *potential* for better results. A neutral mini-game outcome falls back to base probabilities. The player is never worse off for playing.
- **Node-level breeding is canonical.** The player is assigning flowering nodes, not combining harvested peppers or loose seeds directly. Pollination creates a fruit first; extracted seeds come later.
- **Trait revelation is partial.** Not all next-generation seed traits are immediately visible. Some require growing the plant to maturity, or multiple generations, before they fully express. This ties into the "trait expression matures over time" requirement from [GENETICS.md](../GENETICS.md).
- **Chain breeding** is explicitly supported, but it still follows the full lifecycle: pollination -> fruit -> extraction -> replanting.

**Links:**
- [Growing Cycle](./growing-cycle.md) — pollination happens during growth, and extracted seeds can be replanted into the main loop
- [GENETICS.md](../GENETICS.md) — detailed trait, stability, and lineage rules

**Referenced by:**
- [Core Game Loop](./core-game-loop.md) — breeding appears as a flowering-stage action and a broader mid-loop strategy surface
- [Growing Cycle](./growing-cycle.md) — flowering plants route into breeding before harvest
