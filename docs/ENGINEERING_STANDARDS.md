# Engineering Standards

Owns: development rules. Agent-specific instructions are in [../AGENTS.md](../AGENTS.md). Decisions behind these rules are in [DECISIONS.md](DECISIONS.md).

Where a rule depends on a pending decision, it is marked **[Pending D-xx]**.

## Code quality and maintainability

- Keep changes small and focused. Do not refactor unrelated code in the same change.
- Prefer clear names and small functions and components over comments that explain dense code.
- No duplicated logic. Extract shared code only once it has a second real use; avoid premature abstraction.
- Add a dependency only when it removes real work, and note why in the change description.
- Remove dead code rather than commenting it out.

## TypeScript (frontend) [Pending D-02]

- React with TypeScript in `strict` mode. No `any` without a comment explaining why.
- Function components and hooks. Business logic, data shaping and API calls live in hooks, services or modules, not in JSX.
- Components should stay small. Split one that mixes several concerns or grows beyond about 200 lines.
- One shared API client. Validate API responses at the boundary, and type them from the agreed contract.
- Lint must pass (linter chosen at scaffold time).

## Python (backend)

- Python 3.11+ with type annotations on all public functions. [Assumption: version to be confirmed at scaffold time]
- FastAPI with Pydantic models for every request and response.
- Layering: routers (HTTP only) → services (business logic) → clients/repositories (external systems). Routers must not call external systems directly.
- Linting, formatting and type checks must pass (tools chosen at scaffold time, recorded in DECISIONS.md).

## Module boundaries

`frontend/` ↔ API contract ↔ `backend/` API layer ↔ orchestration ↔ data integration. Each crosses only through a defined interface. The frontend never talks to Databricks, AI services or storage directly. See [ARCHITECTURE.md](ARCHITECTURE.md).

## Input validation and error handling

- Validate all external input: request bodies, query parameters, files, and responses from other services and AI.
- A single error response format for the API (agreed in W1 task "agree API conventions"). Never return stack traces or internal details to clients.
- UI: every data view handles **loading, empty, error (with retry) and success** states.

## Authentication and authorisation

- Target: Entra ID sign-in. APIM validates JWTs; the backend also checks authorisation on protected operations. [Confirmed: diagrams. Pending: backend re-validation, roles]
- M1/M2 use **mock sign-in**, which must be visibly labelled. Mock auth must never ship to a shared or production environment.
- Never put privileged credentials, client secrets or service keys in the browser bundle.

## Testing expectations

- New behaviour comes with automated tests. Fix bugs with a test that reproduces them first.
- Frontend: component and hook tests for logic and states. Backend: unit tests for services, plus API tests that check responses against the contract.
- Contract checks for mock endpoints before each milestone demo (W1–W5 plan).
- Report the actual test results. Do not claim checks that were not run.

## Logging and observability

- Structured (JSON) logs with a correlation or request ID. Target platform: App Insights / Log Analytics.
- Never log secrets, tokens, personal data or full financial datasets. Rules for logging prompts and figures are pending security guidance.

## Accessibility and responsive design

- Keyboard operable, visible focus, labelled controls, sufficient colour contrast. Target WCAG 2.1 AA. [Proposed: no standard is named in the plan]
- Supported widths for M2: 1366×768 laptop and 1920×1080 desktop. [Confirmed: W1–W5 plan]

## Data integrity and AI output

- Mock or sample values must be clearly labelled as mock wherever shown.
- AI-generated numbers are not presented as verified unless checked against trusted source data.

## Configuration and secret management

- Configuration comes from the environment. Commit only `.env.example` files containing placeholder values.
- Secrets live in Azure Key Vault in deployed environments. Never commit secrets, and never paste them into docs or tickets.
- No environment-specific URLs or IDs in code.

## Definition of Done

A task is done only when **all** of these hold:

1. Its acceptance criteria (Remarks in the W1–W5 task plan) are met and demonstrated.
2. Code follows these standards; lint, type checks and tests pass locally (results stated).
3. Loading, empty and error states are handled where relevant.
4. No secrets, and no unlabelled mock data.
5. Affected docs are updated (only the affected ones).
6. Reviewed by the other developer, or by the tech lead.
7. Status is updated in the plan by the task owner. Scope, owner or dates do not change without agreement.
