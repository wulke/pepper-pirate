---
name: formula-registry-guard
description: Use when modifying gameplay formulas, data models that participate in formulas, or docs that describe formula behavior. This skill requires treating docs/FORMULA-REGISTRY.md as the source of truth, validating dependency correctness before edits, and updating the registry whenever a formula contract, owner, input, output, dependency, trigger, or status changes.
---

# Formula Registry Guard

Use when modifying gameplay formulas, data models with formula-relevant fields, or docs describing formula behavior. [docs/FORMULA-REGISTRY.md](./docs/FORMULA-REGISTRY.md) is the absolute source of truth.

## Required Workflow
1. **Read Registry:** Identify affected formula IDs in `docs/FORMULA-REGISTRY.md` first.
2. **Validate:** Compare current docs/code against registry `Owner`, `Reads`, `Writes`, `Depends On`, `Used By`, and `Status`.
3. **Execute:** Apply changes to the target doc or code.
4. **Sync Registry:** Update `docs/FORMULA-REGISTRY.md` in the same pass if any contract changed.
5. **Report:** State whether the registry was `verified unchanged`, `updated`, or `deferred` (if unresolved).

## Integrity Rules
- **No Shadow Formulas:** Changes to math or consuming fields MUST be reflected in the registry.
- **Maintain Symmetry:** Keep `Depends On` and `Used By` fields updated for graph navigation.
- **Status Progression:** Update status (`concept` → `draft` → `approved`) when intent solidifies.
- **Single Source:** Data models define object shapes, but the registry defines their participation in formulas.

## Final Response Requirement
Include a status note at the end of every interaction:
- `Formula registry verified; no changes needed.`
- `Formula registry updated for [ID1, ID2].`
- `Registry update partially deferred (inheritance unresolved).`
