# Decisions

Owns: agreed and open technical decisions. Add new entries at the bottom. Do not rewrite history; supersede old entries instead.

Status values: **Confirmed** (approved by architect or business, or in an approved artefact) · **Agreed** (team working decision) · **Proposed** (needs approval) · **Open** (not yet decided).

| ID | Date | Decision | Rationale / evidence | Status |
|---|---|---|---|---|
| D-01 | (pre-project) | Architecture as drawn in `assets/architecture/`: four layers on Azure, APIM + Entra ID, FastAPI & GraphQL + Presentation Orchestrator, multi-agent subsystem, Databricks Gold, AI Foundry. | Architect sign-off; deep-dive §15.1 | Confirmed |
| D-02 | 2026-10-12 | Frontend: React 19 + Vite. **TypeScript** for new production code. | React 19 + Vite is in the management plan (Dev Environment Setup). TypeScript is required by the engineering lead but not stated in any approved artefact; confirm with the architect that it is compatible with the approved stack. | Confirmed (React/Vite) / Proposed (TypeScript) |
| D-03 | 2026-10-12 | Backend: Python FastAPI with type annotations and Pydantic models. | Architecture (FastAPI & GraphQL); plan | Confirmed |
| D-04 | 2026-10-12 | M1 and M2 use mock data and mock sign-in only. Save to Slide and Ask AI are simulated. Everything mock is labelled. | W1–W5 task plan and Milestones sheet | Confirmed |
| D-05 | 2026-10-12 | OpenAPI contract first. A FastAPI mock service serves the frontend until real integrations exist. | W1–W5 tasks "Define the first API contracts", "Set up a FastAPI mock service" | Confirmed |
| D-06 | 2026-10-12 | Workspace layout: `docs/`, `plans/`, `assets/`, `templates/`, `archive/`; `frontend/` and `backend/` for application code. Superseded material is archived, never deleted. | Workspace clean-up of 12 Oct 2026 | Agreed |
| D-07 | 2026-10-12 | The existing `frontend/` prototype is **not** production code. It stays in place until the W1 reuse review. After that review it moves to `archive/prototype-frontend/`, and the production app is scaffolded fresh in `frontend/`. | Prototype is JavaScript, single 1,400-line component, hard-coded data, invented AI figures | Superseded by D-17 |
| D-08 | 2026-10-12 | The 80-slide python-pptx script is a proof of concept only (synthetic data, filler slides). Archived; not a basis for production rendering. | `archive/poc/poc_generate_80_slides.py`; template analysis | Agreed |
| D-09 | 2026-10-12 | The planning spreadsheets are the only schedule of record. Docs summarise milestones but never hold a competing schedule. | Engineering lead instruction | Agreed |
| D-10 | — | Repository location and Git hosting (e.g. Azure DevOps). No Git repository exists for FNOS. `/mnt/d/.git` is an empty, invalid stub that does not belong to this project. | See DEVELOPMENT_STATUS.md | Open |
| D-11 | — | Frontend tooling: test runner, linter, UI component approach, state management. | Decide at W1 scaffold; record here | Open |
| D-12 | — | Backend tooling: Python version, dependency manager, linter/formatter, type checker. | Decide at W1 scaffold; record here | Open |
| D-13 | — | Monorepo layout and shared contract location (e.g. where `openapi.yaml` lives). | W1 task "Set up the monorepo" | Open |
| D-14 | — | API error format, naming and versioning conventions. | W1 task "agree API conventions" | Open |
| D-15 | — | Architect clarifications: canonical diagram, APIM target, Orchestrator vs FastAPI split, role of Azure Functions, location of agents. | ARCHITECTURE.md open questions | Open |
| D-16 | — | Ownership of multi-agent AI integration (backlog story, owner TBD). | Management plan, row 37 | Open |
| D-17 | 2026-10-12 | The frontend POC will **not** be reused. Its source is archived in `archive/frontend-poc/` (no `node_modules` or `dist`), and the root `frontend/` folder is removed. The production frontend is created from scratch in the next development step. | Engineering lead decision; POC was built only as a proof of concept | Confirmed |
