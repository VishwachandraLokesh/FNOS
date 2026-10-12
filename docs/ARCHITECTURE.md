# Architecture

Owns: system and integration design. **The approved diagrams in [`assets/architecture/`](../assets/architecture/) are the primary evidence and take precedence over this text.** The full component-by-component analysis is in [analysis/FNOS_ARCHITECTURE_DEEP_DIVE.md](analysis/FNOS_ARCHITECTURE_DEEP_DIVE.md).

Labels: **[Confirmed]** drawn in the approved diagrams · **[Assumption]** · **[Proposed]** · **[Pending]** needs architect confirmation.

The architecture is signed off. Do not redesign it. Lower-level design work must fit inside it.

## Overview [Confirmed]

Four layers plus cross-cutting services (architecture-1 to -4 show the same components in different layouts):

| Layer | Components |
|---|---|
| 1. Frontend Access & Security | React SPA (static web hosting), Azure DNS, WAF/Firewall, Entra ID, Key Vault, Policies |
| 2. API Gateway | Azure API Management with OAuth 2 / JWT validation, routing and rate limits; Azure VNet |
| 3. Presentation Orchestrator | App Service Presentation Orchestrator ↔ Python FastAPI & GraphQL ("APIs/S2S"); multi-agent subsystem; Azure Functions; App Services |
| 4. Data Management & Storage | Databricks: 1CON/DDaS → Silver → Gold, Databricks Workflows (ETL/ELT) |

| Cross-cutting | Components |
|---|---|
| AI | Azure AI Foundry: OpenAI GPT-4o, content safety filtering, Azure AI Search |
| App Database | SQL, Azure Blob Storage |
| Observability | Azure Monitor, App Insights, Log Analytics, dashboard |
| CI/CD | git → Azure Pipelines → Azure Container Registry |

**Multi-agent subsystem [Confirmed]:** a Router chooses between a deterministic path (SQL Agent → Insights Agent) and a dynamic path (Manager Agent → SQL / Python / Insights / Custom agents → Agent Output). Both paths feed a Summarizer → Insights Summary. Triggered asynchronously ("Asynchronous slide rendering and handling").

## Responsibilities

| Area | Responsibility | Label |
|---|---|---|
| Frontend (React SPA) | UI rendering, view state, user sign-in via Entra ID, calling APIs through APIM. No business rules, no secrets, no direct data-source access. | Confirmed (layering) / Proposed (rules) |
| API layer (FastAPI & GraphQL) | Validated API contracts for the frontend; authentication and authorisation checks; application data. | Confirmed (component) |
| Presentation Orchestrator | Data retrieval, AI content generation and slide assembly, triggered asynchronously. | Confirmed (diagram description) |
| Data integration | Read presentation-ready Gold-layer tables. Databricks pipelines are owned by the Data Science team. | Confirmed |
| Rendering (Azure Functions) | Inferred PPTX rendering role; not connected in any diagram. | Pending |

## Data flow (target) [Confirmed at component level]

User → DNS / WAF → React SPA → (Entra ID token) → APIM (JWT validated) → FastAPI / Orchestrator → async agent subsystem → Databricks Gold + AI Foundry → Insights Summary → App Database (SQL / Blob) → back to the Workspace UI → PPTX for download or distribution.

## M1/M2 implementation scope [Confirmed: W1–W5 plan]

For M1 and M2 only the frontend and a **FastAPI mock service** are built. The mock service serves clearly labelled sample data against an OpenAPI contract. There is no APIM, Entra ID, Databricks, AI or database integration yet. Token-validation design and middleware are built with local test tokens only.

## Integration boundaries

| Boundary | Rule | Label |
|---|---|---|
| Browser ↔ backend | Only through the API gateway, using user tokens. No privileged credentials in the browser. | Confirmed (APIM/Entra) / Proposed (wording) |
| Frontend ↔ API | Versioned contract (OpenAPI first). The frontend uses a single API client. | Confirmed (W1 tasks) |
| API ↔ Orchestrator | "APIs/S2S". The split of responsibilities is not defined. | Pending |
| Orchestrator ↔ agents | Asynchronous. Agent input/output contracts are not defined. | Pending |
| App ↔ Databricks | Read Gold layer. Contracts and access identity are not defined. | Pending |
| App ↔ PPTX template | Template not yet received. Manifest is prepared in W4. | Pending |

## Open technical questions [Pending]

Full list: deep-dive §16. Most relevant now:

1. Which diagram (architecture-1 to -4) is canonical, or are they equivalent?
2. Does APIM route to FastAPI or to the Presentation Orchestrator (architecture-2 differs)?
3. How are responsibilities split between the Orchestrator and FastAPI & GraphQL? Which operations use GraphQL?
4. What is the role of Azure Functions (renderer, agent host, or both)? Where do agents run?
5. Where do email distribution, the job queue and the progress channel sit? None is drawn.
6. Does "Save to Slide" write to the slide face, the speaker notes, or both?
7. What are the Gold-layer contracts per slide, and which identity is used to access them?
8. Who owns delivery of the multi-agent integration? Its backlog story has owner TBD.
