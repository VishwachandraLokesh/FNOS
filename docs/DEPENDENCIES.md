# Dependencies

Owns: external dependencies and blockers. "Needed for" refers to the planning spreadsheets. Owners shown as *Unknown* must be confirmed; do not guess.

| # | Dependency | Owner / provider | Needed for | Status (12 Oct 2026) |
|---|---|---|---|---|
| 1 | **Editable ~80-slide PowerPoint master** (PPTX/POTX) | *Unknown* (the DS Team Plan covers template decomposition) | Template set-up (W4 prep only); PPTX generation (backlog) | **Not received.** Only the 58-slide design reference deck is available (`templates/`). Does not block M1/M2. |
| 2 | **Entra ID app registration**, APIM configuration, security set-up | Mars platform / IAM team | Real sign-in and token validation (backlog) | Not started. M1/M2 use mock sign-in; token validation is tested with local test tokens only. |
| 3 | **Final Figma designs** | *Unknown* | All UI tasks | Pending. Work proceeds from the mockups in `assets/ui-mockups/`. |
| 4 | **KPI definitions and Databricks Gold-layer data contracts** | Data Science team | Parameter & Report APIs, Analytics Data Integration (backlog) | Not available |
| 5 | **Databricks access** (workspace, SQL warehouse, service identity) | Data Science team / Mars data platform | As above | Not available |
| 6 | Azure subscription, environments, Key Vault, networking | Mars cloud platform team | Any deployment | Not started |
| 7 | Azure OpenAI (GPT-4o) deployment, quota and data-handling approval | Mars AI platform / security | AI commentary, Ask AI, multi-agent integration (backlog) | Not started |
| 8 | Email service choice and approval (Microsoft Graph or SendGrid) | Mars IT / security | Enterprise Email Service (backlog) | Undecided |
| 9 | Architect clarifications (see ARCHITECTURE.md open questions) | Solution architect | Backend design beyond mocks | Open |
| 10 | Owner for multi-agent AI integration | *TBD* (management plan) | Backlog story | Open |
| 11 | Git repository and CI (Azure Pipelines per architecture) | *Unknown* | First commit; code review | **Open: needed in W1** |
| 12 | Testing team availability | *Unknown* | Release handoff (backlog) | Unknown |

Notes:
- The retired POC loaded Google Fonts from an external CDN at runtime. If the production frontend needs web fonts, confirm with security whether a CDN is acceptable or the fonts must be self-hosted. [Pending]
- The slide inventory (about 44 report templates vs ~80 slides) must be confirmed with the business before PPTX work starts.
