# FNOS Automation Engine

Web application for Mars Food & Nutrition Europe. It lets users generate the recurring FNOS executive PowerPoint pack from governed data, review and edit AI-drafted commentary slide by slide, then download or distribute the deck.

**Status (12 Oct 2026, W1 day 1):** no production code exists yet. The repository holds planning records, approved architecture diagrams, and design references. The exploratory frontend POC has been retired to `archive/frontend-poc/`. See [docs/DEVELOPMENT_STATUS.md](docs/DEVELOPMENT_STATUS.md).

Coding assistants and developers must read [AGENTS.md](AGENTS.md) before changing anything.

## Repository structure

```text
FNOS/
├── AGENTS.md              Rules for coding agents and developers
├── CLAUDE.md              Points Claude Code at AGENTS.md
├── README.md
├── docs/                  Project knowledge base (start here)
│   └── analysis/          Point-in-time discovery, architecture and template analyses
├── plans/                 Official planning spreadsheets (see note below)
│   └── original/          Original 14-week plan and initial draft (incl. DS Team Plan)
├── assets/
│   ├── architecture/      Approved solution architecture diagrams (primary evidence)
│   ├── ui-mockups/        Target UI mockups (login, dashboard, canvas, distribution)
│   └── prototype-screenshots/  Screenshots of the exploratory prototype
├── templates/             PowerPoint design reference deck (read-only)
└── archive/               Superseded plans, plan scripts, PPTX proof of concept, retired frontend POC
```

`frontend/` and `backend/` do not exist yet. They are created by the W1 set-up tasks.

**Official plans:** `plans/FNOS_App_Development_Plan_Aligned_Final.xlsx` (management plan) and `plans/FNOS_App_Development_Plan_W1-W5_With_User_Stories.xlsx` (W1–W5 task plan). See [plans/README.md](plans/README.md).

## Retired frontend POC

The earlier React 19 + Vite clickable prototype was a proof of concept and will not be reused ([docs/DECISIONS.md](docs/DECISIONS.md) D-17). Its source is kept for reference only in [archive/frontend-poc/](archive/frontend-poc/). It contains hard-coded data and invented financial figures, so do not use it as a base for production code.

## Running locally

- **Frontend (production):** not yet available. It will be added by W1 task "Set up the monorepo and React 19 + Vite frontend".
- **Backend (FastAPI mock service):** not yet available. It will be added by W1 task "Set up a FastAPI mock service".

## Key documents

| Document | Owns |
|---|---|
| [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | Business purpose, workflow, scope, milestones |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Approved system and integration design |
| [docs/ENGINEERING_STANDARDS.md](docs/ENGINEERING_STANDARDS.md) | Development rules, Definition of Done |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Agreed and open technical decisions |
| [docs/DEVELOPMENT_STATUS.md](docs/DEVELOPMENT_STATUS.md) | Current implementation progress |
| [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md) | External blockers and owners |
| [assets/architecture/](assets/architecture/) | Approved architecture diagrams, which take precedence over any text |
| Planning spreadsheets (above) | Official schedule, owners and milestones |
