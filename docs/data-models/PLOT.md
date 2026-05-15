# Plot Data Model

The **Plot** is the physical vessel or container where growing happens. A plot defines the environmental envelope — stage support, microclimate, root space, maintenance demands, and risk profile — independent of the soil medium inside it. Matching the right plot type to the right lifecycle stage and pepper profile is a core player decision.

> Related models: [Soil](./SOIL.md) | [Plant](./PLANT.md) | [Seed](./SEED.md) | [Overview](./PEPPER.md) | [Formula Registry](../FORMULA-REGISTRY.md)

## Design Goals

- **Plot is the vessel; Soil is the medium.** A starter tray and a raised bed can hold the same soil mix, but their physical behavior (humidity, airflow, root space) differs fundamentally. These are separate concerns.
- **Specialization over quality ladder.** No universally "best" plot type. Each is good for certain lifecycle stages and pepper profiles, weak for others. A starter tray is excellent for germination and terrible for fruiting. A raised bed is the opposite.
- **Stage support drives transplanting.** Plot types define which growth stages they can host. This creates a natural transplanting loop: start seeds in germination-friendly containers, move established plants to production-friendly ones.
- **Direct sow is always viable.** Players can skip transplanting by using an all-purpose plot type with marginal-across-the-board performance. Optimal play involves transplanting; casual play does not require it.
- **Genetics interact with plot type.** Hardiness affects transplant shock recovery. Drought resistance matters more in fast-draining containers. Plant size can outgrow small containers. Plot choice is informed by the seed's traits, not just the lifecycle stage.
- **V1 bundles microclimate into plot type; V2 makes it composable.** In V1, a Starter Tray inherently comes with humidity dome behavior. In V2, microclimate components (dome, shade cloth, heating mat) become separate items the player can add or remove from any container.

## Proposed Object Shape

```ts
type PlotId = string;
type SoilId = string;
type PlantId = string;

type StageSupport = "optimal" | "marginal" | "unsupported";

type PlotType =
  | "starter_tray"
  | "open_pot"
  | "nursery_pot"
  | "fabric_pot"
  | "raised_bed"
  | "greenhouse_bed";

type GrowthStage =
  | "germinating"
  | "seedling"
  | "vegetative"
  | "flowering"
  | "fruiting"
  | "mature";

type Plot = {
  id: PlotId;

  // What kind of container this is
  type: PlotType;

  // Which lifecycle stages this plot supports, and how well
  supportedStages: Record<GrowthStage, StageSupport>;

  // Physical capacity
  capacity: {
    slotCount: number;                     // how many plants/seeds this plot holds
    rootVolumePerSlot: number;             // 0-1, constrains max plant size and yield ceiling
  };

  // Environmental profile (V1: fixed per type; V2: composable via microclimate items)
  environment: {
    moistureRetentionRate: number;         // multiplier on moisture depletion (>1 = retains longer, <1 = dries faster)
    humidityLevel: number;                 // 0-1, affects germination success and disease risk
    airflow: number;                       // 0-1, reduces disease risk, increases moisture loss
    weatherExposure: number;               // 0-1, how much external weather affects this plot (0 = fully enclosed)
  };

  // How demanding this plot is to maintain
  maintenance: {
    wateringFrequency: number;             // relative multiplier — higher = needs more frequent watering
    forgiveness: number;                   // 0-1, how quickly neglect causes problems (1 = very forgiving)
  };

  // Signature risks for this plot type (V1: 1-2 per type)
  risks: {
    moldRisk: number;                      // 0-1, probability modifier — high humidity + low airflow
    rootBoundRate: number;                 // per-tick health degradation when plant exceeds optimal stages
    transplantShockMultiplier: number;     // scales transplant shock severity when moving OUT of this plot
  };

  // Soil medium inside this plot (1:1 per slot in V1)
  soilId: SoilId;

  // Runtime state
  state: {
    occupantPlantIds: PlantId[];           // plants currently in this plot
    unlockedAtSeason?: number;             // when the player gained access to this plot
  };
};
```

## Field Rationale

### `type`

The plot type determines the full environmental and capacity profile. In V1, all properties are fixed per type — a `starter_tray` always has the same humidity, airflow, and slot count. This keeps the decision space manageable: the player picks a type, not a build. V2 introduces composable microclimate to allow customization within a type.

### `supportedStages`

The most important gameplay field. Each plot type maps every growth stage to one of three support levels:

- **optimal** — the plot is designed for this stage. No penalty, and the environment may provide small bonuses (e.g., high humidity during germination).
- **marginal** — the plot can host this stage, but with reduced effectiveness. Growth is slower, success rates are lower. Represents "it works, but you could do better."
- **unsupported** — the plant cannot progress through this stage in this plot. Growth halts. The player must transplant or accept that the plant stalls.

This creates the transplanting decision loop: *where should I start this seed, and when should I move it?*

### `capacity.slotCount` vs `capacity.rootVolumePerSlot`

These are distinct constraints. A starter tray has many slots (6-12) with tiny root volume each — good for batch germination. A raised bed has few slots (1-2) with large root volume — good for full-lifecycle growing. Slot count governs how many plants fit; root volume governs how large each plant can grow before penalties apply.

### `environment`

Four properties that define the plot's microclimate:

- **moistureRetentionRate** — directly modifies the per-tick moisture depletion formula. A rate of 1.5 means moisture lasts 50% longer than baseline. This is why the user's seed starter (with dome) retains moisture while open containers dry out.
- **humidityLevel** — primarily affects germination success rate. High humidity is great for seeds, but creates mold risk if airflow is low.
- **airflow** — counterbalances humidity. Good airflow reduces disease risk but increases moisture loss. This creates a real tradeoff: enclosed containers retain moisture but risk mold; open containers dry faster but stay healthier.
- **weatherExposure** — V1 placeholder (weather is V2), but included in the model so the field exists. A greenhouse bed at 0.0 is fully protected; an open plot at 1.0 takes full weather effects.

### `maintenance`

Answers the player question: *how much attention does this plot demand?*

- **wateringFrequency** — how often the player needs to water relative to baseline. A fabric pot with high drainage needs frequent watering. A greenhouse bed with high retention needs less.
- **forgiveness** — how quickly neglect compounds. A forgiving plot (raised bed, 0.7) degrades slowly when ignored. An unforgiving plot (fabric pot, 0.3) punishes missed watering cycles quickly.

### `risks`

Each plot type has 1-2 signature risks that create meaningful downsides:

- **moldRisk** — primarily affects enclosed, high-humidity containers. The Starter Tray is great for germination but overuse or overwatering creates mold. This prevents "just leave everything in the starter forever."
- **rootBoundRate** — per-tick health penalty when a plant stays in a container past its optimal stages. A seedling that stays in a Nursery Pot through flowering and fruiting will become root-bound, degrading health over time. This is the "move it or lose it" signal.
- **transplantShockMultiplier** — scales the severity of transplant shock when moving a plant OUT of this container. Higher values mean the plant was more "settled in" and the transition is harder.

## Stage Support Matrix

| Plot Type | Germinating | Seedling | Vegetative | Flowering | Fruiting | Mature |
|---|---|---|---|---|---|---|
| Starter Tray | optimal | optimal | unsupported | unsupported | unsupported | unsupported |
| Open Pot | marginal | marginal | marginal | marginal | marginal | marginal |
| Nursery Pot | marginal | optimal | optimal | marginal | unsupported | unsupported |
| Fabric Pot | unsupported | marginal | optimal | optimal | optimal | optimal |
| Raised Bed | unsupported | marginal | optimal | optimal | optimal | optimal |
| Greenhouse Bed | optimal | optimal | optimal | optimal | optimal | optimal |

**Reading the matrix:**
- Starter Tray excels at early stages but can't support a full plant. Transplant out after seedling.
- Open Pot is the all-purpose fallback — marginal everywhere, optimal nowhere. Direct sow path.
- Nursery Pot bridges early to mid growth. Transplant to a final container before flowering.
- Fabric Pot and Raised Bed are production containers — great for established plants, poor for starting seeds.
- Greenhouse Bed is the premium option — optimal everywhere, but expensive and limited in quantity.

## Plot Type Taxonomy

### Starter Tray

The germination specialist. Modeled after real-world seed starter kits with plastic humidity domes.

| Property | Value | Notes |
|---|---|---|
| Slot count | 6-12 | Batch germination |
| Root volume | Very low (0.1) | Tiny cells, no room for mature roots |
| Moisture retention | High (1.8) | Dome traps moisture |
| Humidity | High (0.85) | Enclosed environment |
| Airflow | Low (0.15) | Dome limits circulation |
| Weather exposure | None (0.0) | Fully enclosed |
| Watering frequency | Low (0.5) | Retains moisture well |
| Forgiveness | Moderate (0.5) | Mold risk offsets ease of watering |
| Signature risk | Mold | High humidity + low airflow = mold if overwatered |
| Best for | Germination batches, rare/exotic seeds that need controlled starts |

### Open Pot

The all-purpose fallback. Simple, cheap, works for everything at a marginal level.

| Property | Value | Notes |
|---|---|---|
| Slot count | 1 | Single plant |
| Root volume | Low-medium (0.35) | Adequate but constrained |
| Moisture retention | Low (0.7) | Open top, moderate drainage |
| Humidity | Low (0.25) | Fully exposed air |
| Airflow | High (0.8) | No enclosure |
| Weather exposure | Full (1.0) | No protection |
| Watering frequency | High (1.3) | Dries out faster |
| Forgiveness | Moderate (0.5) | Doesn't punish hard but doesn't help either |
| Signature risk | None severe | Jack of all trades, master of none |
| Best for | Direct sow, beginners, hardy/common peppers |

### Nursery Pot

The mid-stage workhorse. Good soil control, portable, bridges the gap between starter and final container.

| Property | Value | Notes |
|---|---|---|
| Slot count | 1 | Single plant |
| Root volume | Medium (0.5) | Room to establish, but will outgrow |
| Moisture retention | Medium (1.0) | Baseline |
| Humidity | Low-medium (0.35) | Open top |
| Airflow | Medium (0.6) | Good but not exceptional |
| Weather exposure | High (0.85) | Mostly exposed |
| Watering frequency | Medium (1.0) | Baseline |
| Forgiveness | Moderate-high (0.6) | Balanced and forgiving |
| Signature risk | Root binding | Plant degrades if left too long past vegetative stage |
| Best for | Seedling-to-vegetative bridge, transplant staging area |

### Fabric Pot

The drainage specialist. Excellent airflow to roots, prevents overwatering, but demands frequent attention.

| Property | Value | Notes |
|---|---|---|
| Slot count | 1 | Single plant |
| Root volume | Medium-high (0.65) | Good space, air-pruned roots |
| Moisture retention | Low (0.6) | Fabric breathes, water evaporates through walls |
| Humidity | Low (0.2) | Maximum breathability |
| Airflow | Very high (0.9) | Air reaches roots through fabric |
| Weather exposure | High (0.9) | Minimal protection |
| Watering frequency | High (1.5) | Fastest drying of production containers |
| Forgiveness | Low (0.3) | Missed watering punishes quickly |
| Signature risk | Drought stress | Fast drainage + missed watering = rapid dry-out |
| Best for | Drought-resistant varieties, peppers that dislike wet roots, experienced players |

### Raised Bed

The production standard. Large root space, good soil control, strong for full-lifecycle growing.

| Property | Value | Notes |
|---|---|---|
| Slot count | 2 | Room for multiple plants |
| Root volume | High (0.8) | Generous root space |
| Moisture retention | Medium-high (1.2) | Soil volume retains well |
| Humidity | Low (0.3) | Open air |
| Airflow | Medium-high (0.7) | Good circulation |
| Weather exposure | High (0.85) | Exposed but elevated |
| Watering frequency | Medium (0.9) | Slightly better than baseline due to soil volume |
| Forgiveness | High (0.7) | Large soil mass buffers against neglect |
| Signature risk | Mild — harder to fine-tune per-plant | Shared soil makes individual plant optimization harder |
| Best for | Main production, mid-to-late game workhorse |

### Greenhouse Bed

The premium all-rounder. Optimal for all stages, but expensive and limited in quantity.

| Property | Value | Notes |
|---|---|---|
| Slot count | 2 | Room for multiple plants |
| Root volume | High (0.8) | Same as raised bed |
| Moisture retention | High (1.5) | Enclosed environment |
| Humidity | Medium-high (0.7) | Controlled enclosure |
| Airflow | Medium (0.5) | Enclosed — decent but not great |
| Weather exposure | Very low (0.1) | Nearly fully protected |
| Watering frequency | Low (0.6) | Retains moisture well |
| Forgiveness | High (0.7) | Stable environment buffers mistakes |
| Signature risk | Overheating / disease | Enclosed + warm = disease risk if unmanaged |
| Best for | High-value/exotic peppers, all-stage growing, late-game investment |

## Transplanting

Transplanting is the act of moving a plant from one plot to another. It creates a meaningful decision loop (*where should I start this seed? when should I move it?*) without becoming mandatory busywork.

### When Transplanting Is Allowed

- **Seedling** and **vegetative** stages only. A plant that is germinating (too fragile), flowering, or fruiting (too disruptive) cannot be transplanted.
- The destination plot must have an available slot and must support the plant's current stage at **marginal** or **optimal** level.

### Transplant Shock

Moving a plant imposes a temporary health penalty. The severity depends on the plant's genetics and the source container:

**Formula IDs:** `F-PLOT-002`, `F-HEALTH-001`

```
shockSeverity = Plot.risks.transplantShockMultiplier
              * (1 - (0.5 * Seed.genetics.traitGenome.hardiness.inheritedValue
                    + 0.5 * Seed.genetics.traitGenome.droughtResistance.inheritedValue))

shockDuration = baseShockTicks * shockSeverity
```

During shock, a temporary `transplant_shock` status effect is applied:
- Reduces `healthModifier` by `shockSeverity * 0.5` (so max ~25% health penalty for a fragile plant from a high-shock container)
- Duration in ticks scales with severity
- Hardy, drought-resistant peppers recover faster — their genetics reduce both severity and duration

### Soil Continuity

Soil does **not** travel with the plant. On transplant, the plant begins interacting with the destination plot's soil immediately. There is no transition period beyond transplant shock itself — the shock represents the adaptation cost.

### Root-Bound Penalty

If a plant remains in a plot past its **optimal** stages into **marginal** territory for an extended period, the container's `rootBoundRate` applies a compounding health degradation per tick:

```
if currentStage is "marginal" for this plot AND ticksInMarginalStage > gracePeriod:
  rootBoundPenalty += Plot.risks.rootBoundRate * ticksElapsed
  Plant.health.overallHealth -= rootBoundPenalty
```

This is the "move it or lose it" signal — a seedling that stays in a Nursery Pot through flowering will degrade. The penalty compounds, so it starts gentle (player has time to react) but becomes severe if ignored.

### The Direct Sow Alternative

The Open Pot supports all stages at **marginal** level with no signature risk. A player who plants directly into an Open Pot skips transplanting entirely — lower ceiling, but zero transplant management. This ensures transplanting is a skill-rewarding optimization, not a mandatory chore.

## How Plot Interacts with Formulas

Plot effects enter the existing [Lifecycle Formulas](../LIFECYCLE-FORMULAS.md) in three places:

**Registry IDs:** `F-PLOT-001`, `F-PLOT-002`, `F-GROWTH-001`, `F-HEALTH-001`

### 1. Growth Modifier

The plot contributes a `plotModifier` to the final growth calculation:

```
plotModifier = stageModifier * rootSpaceModifier

finalGrowthModifier = min(1.25, soilModifier * tendingModifier * healthModifier * plotModifier)
```

Where:
- `stageModifier` — from `Plot.supportedStages[currentStage]`: optimal = 1.0, marginal = 0.5-0.8, unsupported = 0.0
- `rootSpaceModifier` — 1.0 unless plant size (V2 trait) exceeds `rootVolumePerSlot`, then scales down proportionally

### 2. Moisture Depletion

Plot environment directly modifies how quickly soil moisture drops:

```
moistureLoss = baseMoistureDepletion * (1 / Plot.environment.moistureRetentionRate)
```

A Starter Tray (retention 1.8) loses moisture at ~56% of baseline rate. A Fabric Pot (retention 0.6) loses moisture at ~167% of baseline rate. This is the mechanical expression of "my open containers dry out quicker."

**Registry note:** a dedicated moisture depletion formula has not been registered yet. Add one before this behavior becomes canonical outside this model doc.

### 3. Risk Events

Per-tick probability checks for plot-specific risks:

```
// Mold risk (high humidity + low airflow containers)
if Plot.environment.humidityLevel > threshold AND Plot.environment.airflow < threshold:
  moldChance = Plot.risks.moldRisk * ticksElapsed
  // probability check → apply "disease" status effect if triggered

// Root-bound (plant in marginal stage too long)
// See Transplanting § Root-Bound Penalty above
```

**Registry note:** mold and root-bound event formulas are still unregistered. If they become formal V1 formulas, give them formula IDs before expanding them further.

## Progression Path

Plot types become available as the player progresses, creating a natural expansion of the decision space:

| Game Phase | Available Plots | Player Experience |
|---|---|---|
| Early game | Starter Tray, Open Pot | Learn germination basics, direct sow path |
| Mid game | + Nursery Pot, Raised Bed | Learn transplanting, production scaling |
| Late game | + Fabric Pot, Greenhouse Bed | Specialize for exotic varieties, optimize yield |

Acquisition method (purchase, unlock, quest reward) is an open question — see below.

## V1 vs V2 Scope

### V1 (MVP)

Core plot system that creates meaningful container decisions:

- **6 plot types** with fixed environmental profiles — Starter Tray, Open Pot, Nursery Pot, Fabric Pot, Raised Bed, Greenhouse Bed
- **Stage support matrix** — optimal / marginal / unsupported per stage per plot type
- **Transplanting** — move plants between containers during seedling/vegetative stages, with transplant shock scaled by genetics
- **Root-bound penalty** — compounding health degradation for plants left too long in undersized containers
- **Moisture retention modifier** — plot type affects per-tick soil moisture depletion
- **1-2 signature risks per type** — mold for enclosed containers, root binding for small containers, drought stress for fast-draining containers
- **Plot modifier in growth formula** — `plotModifier = stageModifier * rootSpaceModifier` plugs into existing `finalGrowthModifier`

### V2 (MVP+)

Composable microclimate and deeper environmental interaction:

- **Composable microclimate items** — dome lid, shade cloth, heating mat, grow lights as separate items the player can add/remove from any container. Decouples microclimate from plot type.
- **Plot upgrades in-place** — add drainage amendments, expand root volume, improve an existing plot rather than replacing it
- **Hydro systems** — fundamentally different growing medium (nutrient solution, no soil). Requires rethinking the Soil interaction model for these plot types.
- **Automated transplanting** — unlockable upgrade that auto-moves plants at optimal timing, reducing late-game busywork
- **Weather interaction** — `weatherExposure` becomes active when the weather system comes online. Exposed plots affected by rain (moisture), heat waves (stress), cold snaps (damage). Enclosed plots buffered.
- **Plant size interaction** — V2 plant size trait interacts with `rootVolumePerSlot` to produce root space penalties for oversized plants in undersized containers

## Open Questions

- How are plots acquired? Purchased with currency, unlocked via season progression, quest rewards, or some combination?
- Can the player own multiple plots of the same type? If so, is there a cap?
- How does the stage support `marginal` value map to a specific modifier number? Is it a fixed 0.6 for all marginal cases, or does it vary by plot type and stage?
- What is the `gracePeriod` (in ticks) before root-bound penalty begins? Should it scale with the plant's genetics?
- Does the Raised Bed's shared soil (2 plant slots, 1 soil) mean both plants draw from the same NPK pool? If so, this creates a resource competition mechanic.
- How does transplanting interact with tending bonuses? Are active tending effects lost on transplant, or do they persist?
- Should there be a "transplant readiness" indicator in the UI to signal when a plant is approaching the end of its optimal stage in the current container?

## Resolved Decisions

| Decision | Resolution | Rationale |
|---|---|---|
| Plot as first-class object | **Yes.** Plot is a separate model from Soil. | The container's physical behavior (humidity, airflow, root space) is independent of the soil medium. Same soil, different container = different outcomes. |
| Quality ladder vs specialization | **Specialization.** No universally "best" plot. | A Starter Tray beats a Raised Bed for germination. A Fabric Pot beats a Greenhouse Bed for drought-resistant varieties. Contextual is more interesting than linear. |
| Microclimate: separate layer vs bundled | **V1: bundled into plot type. V2: composable.** | Three-layer model (plot/soil/microclimate) is the right target, but too much surface area for V1. Bundling keeps the initial decision space manageable. |
| Transplanting: mandatory vs optional | **Optional but rewarded.** Direct sow via Open Pot is always viable. | Prevents transplanting from becoming tedious busywork at scale. Optimal play uses the transplant loop; casual play skips it with marginal-but-functional results. |
| Soil travels with plant on transplant | **No.** Plant adapts to destination soil. Transplant shock covers the transition cost. | Simpler model, avoids "soil mixing" edge cases. The shock mechanic is sufficient to represent adaptation. |
| Hydro systems in V1 | **Deferred to V2+.** | Fundamentally changes the soil model. Not needed for the core container decision loop. |

## Formula Registry Note

If plot fields change in a way that affects growth, transplanting, moisture loss, or risk calculations, verify and update [FORMULA-REGISTRY.md](../FORMULA-REGISTRY.md) in the same pass.
