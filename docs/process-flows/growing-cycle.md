# Growing Cycle

The inner loop in detail: planting, tending, harvesting, and deciding what to do with the yield.

```mermaid
flowchart TD
    Start([Start: Player has seeds]) --> select_plot{Open plot available?}

    select_plot -->|No| expand_or_wait{Expand or wait?}
    expand_or_wait -->|Expand| buy_plot[Purchase / unlock new plot]
    buy_plot --> select_plot
    expand_or_wait -->|Wait| wait_harvest[Wait for existing crops to finish]
    wait_harvest --> harvest_check

    select_plot -->|Yes| choose_seed[Select seed from library]
    choose_seed --> check_compat{Seed compatible with plot conditions?}
    check_compat -->|No — wrong climate/soil| choose_diff[Choose different seed or upgrade plot]
    choose_diff --> choose_seed
    check_compat -->|Yes| plant[Plant seed in plot]

    plant --> growing[Growing phase — time passes]
    growing --> idle_or_active{Player active?}

    idle_or_active -->|Idle| auto_tend[Auto-tend at base effectiveness]
    idle_or_active -->|Active| tend_options[Tend: water, soil check, pest control]
    tend_options --> tend_mini{{Optional: Tending mini-game for bonus}}
    tend_mini --> tend_result[Apply tending bonuses to growth]
    auto_tend --> growth_progress[Growth progresses]
    tend_result --> growth_progress

    growth_progress --> pollination_check{Flowering node needs pollination?}
    pollination_check -->|Yes| breeding([See: Breeding Flow])
    pollination_check -->|No| mature_check{Fruit mature?}
    breeding --> mature_check
    mature_check -->|No| growing
    mature_check -->|Yes| harvest_check[Harvest ready notification]

    harvest_check --> harvest[Harvest peppers from plot]
    harvest --> evaluate[Evaluate yield: quantity + quality + traits]

    evaluate --> decide{What to do with harvest?}
    decide -->|Sell whole fruit| market([See: Market / Trading])
    decide -->|Extract seeds| seed_lib[Add seeds to library]
    decide -->|Process| processing[Send to processing]
    decide -->|Split| split[Split harvest across multiple uses]

    seed_lib --> next([Continue: plant again or other activity])
    processing --> next
    split --> next
    market --> next
```

**Links:**
- [Breeding Flow](./breeding-flow.md) — player assigns flowering nodes for selfing or cross-pollination before harvest
- Market / Trading — flow not yet created

**Referenced by:**
- [Core Game Loop](./core-game-loop.md) — this is the detailed view of the inner loop
