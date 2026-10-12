# Archive

Superseded or exploratory material, kept for reference. **Nothing here is production code or a current plan.** Archived on 2026-10-12. File contents are unchanged (SHA-256 verified).

| Path | What it is | Why archived |
|---|---|---|
| `plans/FNOS_App_Development_Plan_14wk_Original_Backup.xlsx` | Byte-identical backup of the original 14-week plan | The backup is kept here; the original is in `plans/original/` |
| `plans/FNOS_App_Development_Plan_Aligned.xlsx` | Management plan before the final Workspace and multi-agent edits | Superseded by `FNOS_App_Development_Plan_Aligned_Final.xlsx` |
| `plans/FNOS_App_Development_Plan_W1-W5.xlsx`, `…_W1-W5_Final.xlsx`, `…_W1-W5_Final_Aligned.xlsx` | Earlier W1–W5 task plans | Superseded by `FNOS_App_Development_Plan_W1-W5_With_User_Stories.xlsx` |
| `plan-scripts/*.py` | openpyxl scripts that generated the early 14-week plans | Superseded. **Do not run:** they overwrite plan workbooks in the current directory, including the original plan. |
| `poc/poc_generate_80_slides.py` | python-pptx proof of concept generating an 80-slide deck from synthetic data | Not production; see `docs/analysis/FNOS_PPTX_TEMPLATE_TECHNICAL_ANALYSIS.md`. Its output is kept in `frontend-poc/public/`. |
| `frontend-poc/` | React 19 + Vite clickable prototype: source, config, lockfile and public assets, including the POC-generated 80-slide PPTX it offered for download | Retired, not reused (D-17). `node_modules/` and `dist/` were excluded. Install with `npm install` if you ever need to run it for reference. |
