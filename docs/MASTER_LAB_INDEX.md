# EFMW Field Master Lab Explorer — Inventory and Maintenance Record

**Project:** [enuminous/EFMW-Field](https://github.com/enuminous/EFMW-Field)  
**Prepared:** 2026-11-10  
**Classification:** SOURCE INDEX / SOFTWARE DASHBOARD / CROSS-PROJECT NAVIGATION  
**Physical significance:** NONE IMPLIED. A linked equation, experiment, executable demo, paper, or source repository is not evidence for a new EFMW physical field.

## Counts and scope

- **159 public eNuminous repositories**, including the newly created EFMW-Field source repository, identified through the authenticated GitHub repository inventory.
- **70 GitHub Pages root sites** checked as accessible on 2026-11-10.
- **19 additional individual Pages views** checked (specific lab dashboards, simulation scenes, report pages and library indexes).
- **89 repository-only entries**, of which **37 previously returned an unavailable/404 Pages root** and **52 had no independently verified Pages root** in the inventory. The source repository URL is used as the destination for all 89; the explorer never fabricates live pages for them.
- Five curated cross-domain research pathways and ten source-grounded reading-room documents.

The word **full** denotes *the complete 159-repository public account inventory discovered during this snapshot*, not all unpublished work, private GitHub repositories, third-party sites, obsolete domains, external Sites applications, or all possible documents inside every repository.

The inventory includes individual Zoo-agent repos. The category taxonomy is an editorial navigation convenience, not a proof of a common scientific ontology or functional equivalence.

## Files and runtime

- [index.html](../index.html) — accessible, responsive browser landing page.
- [assets/explorer.css](../assets/explorer.css) — self-contained dark scientific styling.
- [assets/explorer.js](../assets/explorer.js) — search, filters, curated pathways, bookmark state, copy and CSV.
- [data/labs.json](../data/labs.json) — authoritative machine-readable snapshot. Every record has a canonical repository URL, category and evidence-oriented research note.
- [data/labs.js](../data/labs.js) — exact browser-compatible representation of the JSON, intentionally included so opening an extracted copy via file:// works without requiring JSON fetch/CORS or a server.
- [tests/catalog.test.cjs](../tests/catalog.test.cjs) — catalog integrity, link consistency, target presence and interface smoke tests.
- [.github/workflows/master-lab.yml](../.github/workflows/master-lab.yml) — CI syntax/integrity checks.

The main explorer works **offline** if the project folder is downloaded and opened locally; only clicking a link requires a network connection. The app does not perform telemetry or client-side scraping. Bookmarks use the local browser's storage if available; the research catalog itself remains static.

## How the live-Pages check was made

The dashboard links recorded as accessible were opened from the public \`https://enuminous.github.io/<repo>/\` GitHub Pages domain and inspected for returned content and plausible project titles. Certain repositories also yielded direct internal HTML reports and interfaces. An HTTP response with meaningful static HTML shows *page accessibility at the check date*, not that interactive scientific controls, computation, scientific inference or independent reproduction are all functioning.

For repositories whose conventional Pages roots returned 404 or were not verified, the explorer exposes source links, not invented dashboard URLs. GitHub Pages status may change after this inventory was compiled.

## Research status categories are not quality rankings

The per-project \`researchStatus\` string is an **inspection prompt**, not a universal verdict. In particular:

- The EFMW-Field paper is an interpretation, not an independently detected field of nature.
- The 102-equation catalogue is preserved source, with historical labels of varying status.
- FieldSpace's 165-triplet completeness is an exact combinatorial fact, not evidence for 165 physical interactions.
- EFMW-Lagrangian C1 is a candidate effective action.
- The IST-FAM-001 spectral novelty hypotheses had **NO SOURCE SUPPORT** under their frozen audit. This is a bounded route closure, not a disproof of the whole EFMW program.
- RSI's 100% number is for an artificial oracle-defined benchmark, matched by a conventional oracle-aware policy, not AGI.
- StorySpace's experimental protocol is proposed and **unexecuted**, not evidence for precognition.
- Lean builds and software test passes certify only the exact code and mathematical assumptions checked; real physical interpretation remains separate.

## Updating the inventory safely

1. Capture a fresh authenticated GitHub public-repository list. Exclude any private repos unless explicit publication permission is given.
2. Confirm whether a Pages site actually opens. Only mark \`access: "live"\` after positive observation. Mark \`unavailable\` only after a recorded failure; use \`not_verified\` otherwise.
3. Add or change an entry in **data/labs.json**, keeping \`name\` unique; include a short accurate project description and supported research-status language.
4. Regenerate the browser mirror **data/labs.js** by taking the exact JSON and wrapping it as \`window.EFMW_LAB_CATALOG = <json>;\`. Keep the two identical.
5. Add direct subpages only if they exist and serve a useful standalone view. A raw template file is not automatically a distinct experiment.
6. Update the compilation date and provenance notes, then run \`node --test tests/catalog.test.cjs\`.
7. Do not change frozen source files or audit outcomes merely to make the master atlas aesthetically consistent.

## Publishing

GitHub Pages can be deployed without a build step: Settings → Pages → Deploy from branch → \`main\` / \`(root)\`. The expected address is:

https://enuminous.github.io/EFMW-Field/

This URL is not guaranteed live simply because the file is committed. If it returns 404, inspect repository Pages settings and deployment workflow before advertising the address.

## Navigation paths and exact limits

- **Physical hypothesis:** Field interpretation → canonical equations → FieldSpace → variational candidate → information tensor → published audits.
- **Reference physics:** Standard Model → Higgs–gauge → EFMW comparison → Base888 → quantum spacetime programs.
- **Formal review:** Frozen catalogue → Lean review → Zoo → mathematical audit → Jacobian replay.
- **Cognition:** Memory dynamics → coherence observatory → predictor → bounded RSI → StorySpace → Observe Unity.
- **Simulation:** Archimedes → 3D/field-native labs → Codex → HORIZON → Multiverse simulator.

These paths are **research routes**, not derivation arrows. Distinct results retain their individual evidence gates.

*The Zoo abides. The master lab is a directory, not an oracle.*
