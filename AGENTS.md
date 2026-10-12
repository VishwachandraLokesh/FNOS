# AGENTS.md: rules for coding agents working on FNOS

FNOS is a high-visibility enterprise application for Mars. These rules apply to every change. The local documents are your reference. **Approved architecture and confirmed business requirements take precedence over your own assumptions.** If they conflict with a request, stop and ask.

## Before you change anything

1. Read the documents relevant to the task:
   - [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
   - [docs/ENGINEERING_STANDARDS.md](docs/ENGINEERING_STANDARDS.md)
   - [docs/DECISIONS.md](docs/DECISIONS.md)
   - [docs/DEVELOPMENT_STATUS.md](docs/DEVELOPMENT_STATUS.md)
   - The task's row (acceptance criteria in Remarks) in the W1–W5 task plan.
2. Inspect the affected modules and follow their existing patterns.
3. Follow the signed-off architecture (`assets/architecture/`). Do not redesign it, add services or change integration boundaries.

## Stack

4. New production frontend code: React with TypeScript. Backend: Python/FastAPI with type annotations and Pydantic models. (TypeScript is pending architect confirmation, D-02. If it is rejected, follow the decision recorded in DECISIONS.md.)
5. The earlier frontend POC is retired (`archive/frontend-poc/`) and is not to be reused. Do not use `archive/` content as a base for production code.

## Design rules

6. Keep business logic out of UI components.
7. Keep clear boundaries between frontend, API, orchestration and data integration. The browser talks only to the API.
8. Validate all external inputs and API responses.
9. Handle loading, empty, error and retry states.
10. Never hard-code credentials, secrets or environment-specific configuration.
11. Never expose privileged credentials to the browser.
12. Enforce authentication and authorisation on protected backend operations.
13. Use the agreed error format and structured logging. Never log or return secrets, tokens, personal data or internal details.
14. Avoid duplicated logic, oversized components, unnecessary dependencies and premature abstractions.
15. Follow the accessibility and responsive-design standards.

## Data and AI integrity

16. Never introduce mock values into real financial reporting without explicit "mock" labelling.
17. Never present AI-generated numerical claims as verified unless they have been validated against trusted data.

## Working practice

18. Keep changes focused. Do not refactor unrelated modules.
19. Write automated tests for new functionality and changes.
20. Run the relevant checks (lint, type check, tests, build) after implementation, and report the **actual** results. If you could not run a check, say so.
21. Update only the documents affected by your change when it alters an agreed interface, behaviour or architectural decision. Record new decisions in DECISIONS.md and progress in DEVELOPMENT_STATUS.md.
22. Never mark a feature complete without verifying its acceptance criteria.
23. Never silently change scope, ownership or milestone dates. The planning spreadsheets are the schedule of record; do not edit them unless asked.
24. Never delete or overwrite business materials (plans, PowerPoint files, architecture images). Archive instead.
25. Never put secret values in code, docs, commit messages or chat output.
