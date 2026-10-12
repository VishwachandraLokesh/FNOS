# Project Overview

Owns: business purpose, workflow, scope, milestones. The schedule itself lives in the planning spreadsheets. This page only summarises it.

Labels: **[Confirmed]** stated in a project artefact · **[Assumption]** working assumption · **[Proposed]** not yet agreed · **[Pending]** awaiting business or architect confirmation.

## Business purpose

Mars Food & Nutrition (F&N) Europe produces a recurring executive performance pack in PowerPoint, combining Finance and Consumer & Market Insights (CMI) reporting. Today it is built by hand. FNOS automates generation of the pack from governed Databricks data, adds AI-drafted commentary that users review and edit, and distributes the finished deck. [Confirmed: design deck, plans, architecture diagrams. Detail in [analysis/PROJECT_DISCOVERY_REPORT.md](analysis/PROJECT_DISCOVERY_REPORT.md) §1–2.]

Success measures (time saved, adoption and similar) are not defined. [Pending]

## Application workflow

Based on the UI mockups in `assets/ui-mockups/` and the management plan. [Confirmed]

1. **Sign in** with Mars corporate identity (Entra ID).
2. **Dashboard:** KPI cards (RSV, Market Share, Volume, Weighted Distribution, HH Penetration) with CMI / Finance / Brand Category tabs, and Recent Reports with Draft / Published status.
3. **Select filters:** Region, Market, Template. Then **Generate Narrative**.
4. **PowerPoint Workspace:** slide thumbnails, 16:9 slide preview, and a right panel with editable Commentary, **Save to Slide** and **Ask AI**.
5. **Distribute:** download the PPTX, or email it to recipient groups with an AI executive summary.

Not defined anywhere: role model, Draft → Published lifecycle rules, and who may edit or distribute. [Pending]

## Confirmed scope

- **W1–W5 (current plan):** mock-data delivery of steps 1–4. Real sign-in, real AI, Databricks data, database persistence and PPTX generation are explicitly **out of scope** for M1/M2. [Confirmed: W1–W5 task plan, Milestones sheet]
- **After W5:** the management plan backlog (data APIs, Databricks integration, AI commentary, multi-agent integration, PPTX generation, distribution, hardening). These stories are **unscheduled**, with schedule and some owners to be agreed. [Confirmed]
- The real slide inventory is unresolved. The design deck defines about 44 report templates, while the plans refer to an ~80-slide deck. [Pending]

## Current milestones

Source of truth: the `Milestones` sheet in the planning workbooks. Do not change these dates here.

| Milestone | Week | Date | Deliverable |
|---|---|---|---|
| M1 | W2 | Fri 23 Oct 2026 | Login and Dashboard with mock data |
| M2 | W5 | Fri 13 Nov 2026 | PowerPoint Workspace with mock data, editable Commentary, simulated Save to Slide and Ask AI |

W1 starts Mon 12 Oct 2026. Team: Vishwachandra (frontend, 25 tasks) and Sudhakshina (backend, 14 tasks). [Confirmed: W1–W5 task plan]

## Known dependencies

Summary only. Owners and status are in [DEPENDENCIES.md](DEPENDENCIES.md).

- Editable ~80-slide PowerPoint master template. Not received; does not block M1/M2.
- Entra ID app registration, APIM and security set-up. Needed for real sign-in; not needed for M1/M2.
- Final Figma designs. Pending; UI work uses the current mockups.
- KPI definitions, Databricks Gold-layer data contracts and access. Needed for the post-W5 backlog.
