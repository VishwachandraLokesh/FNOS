# FNOS PowerPoint Template — Technical Analysis

| | |
|---|---|
| **Purpose** | Determine how the editable ~80-slide FNOS report template can be safely automated for generation, browser preview, slide commentary, and final PPTX download. |
| **Status** | **BLOCKED.** The editable ~80-slide master template is **not present** in the workspace. Master-specific analysis cannot be performed. See §1. |
| **Prepared** | 2026-10-12 |
| **Method** | Read-only inspection of the OOXML parts (slide XML, relationships, masters, layouts, themes, media, notes, comments) using Python standard-library parsing. Nothing was installed or modified. |
| **Related** | `docs/analysis/FNOS_ARCHITECTURE_DEEP_DIVE.md` (approved architecture, unchanged by this document) |

> **Path note (2026-10-12):** the workspace was reorganised after this document was written. File paths in backticks were updated to the new locations (the frontend POC moved to `archive/frontend-poc/`); the content and findings were not changed. See the repository `README.md` for the current layout.


### Tags used

| Tag | Meaning |
|---|---|
| **[Evidence]** | Measured directly from a file in the workspace |
| **[Library fact]** | A capability or limitation of a named technology, independent of the template |
| **[Blocked]** | Needs the actual editable template |
| **[Proposed]** | A recommendation; requires agreement |

---

## Blocker summary

> **The actual editable ~80-slide PowerPoint template could not be located.**
>
> - **Searched:** the FNOS workspace (all subfolders except `node_modules`) and the parent folder `/mnt/d/Code/Work/Mars` (depth 4), for `*.pptx`, `*.potx`, `*.pptm`, `*.potm` and `*.ppt`.
> - **Found:** only three files: two copies of one generated POC deck, and the 58-slide design reference deck.
> - **Result:** both candidates were inspected structurally, and **neither qualifies as the master** (§1.2).
>
> **To unblock:** place the editable template (PPTX or POTX) in the workspace, e.g. `templates/`, and re-run this analysis. The inspection procedure in §2.3 is ready to apply. Sections 3–6 and 13 contain the structure to complete, not findings.

---

## 1. Actual Template Identification

### 1.1 Files found

| File | Size | Modified | Slides |
|---|---|---|---|
| `templates/FNOS_Automation_Template_Design_Deck_Final.pptx` | 25.4 MB | 2026-10-09 | 58 |
| `archive/frontend-poc/public/FNOS_European_Executive_Review_80_Slides.pptx` | 192 KB | 2026-10-07 | 80 |
| `frontend/dist/FNOS_European_Executive_Review_80_Slides.pptx` (removed 12 Oct 2026; identical copy in `archive/frontend-poc/public/`) | 192 KB | 2026-10-07 | 80 (byte-identical copy of the above) |

No POTX, PPTM or legacy PPT files exist.

### 1.2 Assessment of each candidate

**Candidate 1 — `templates/FNOS_Automation_Template_Design_Deck_Final.pptx` — NOT the master [Evidence]**

| Finding | Detail |
|---|---|
| Content type | A before/after **redesign catalogue**. Slides 5–57 each place a "Previous Version" screenshot beside an "Updated Version" screenshot, plus design-rationale text. |
| The redesigned report pages are **pictures** | e.g. slide 5: a 4.01 × 2.24 in picture (previous version) and a 6.00 × 3.10 in picture (updated version), plus six small icon pictures. The tables, KPIs and commentary panels in the "Updated Version" exist only as pixels in PNG files. |
| Native data objects | **No charts anywhere** (0 chart parts). **Native tables on only one slide** (slide 22, "Topline Category/Brand headlines in one page": a 4 × 3 table and a 20 × 6 table with 16 merged cells). |
| Origin | Shape names follow `Google Shape;NNNN;pNN`, i.e. the deck was authored in **Google Slides** and exported. |
| Dimensions | 10.0 × 5.625 in (16:9, Google Slides default) |
| Slide count | 58, not ~80 |

The text boxes on slides 5–57 describe the design ("Design principles & value additions"); they are not data placeholders.

**Candidate 2 — `FNOS_European_Executive_Review_80_Slides.pptx` — NOT the master [Evidence]**

| Finding | Detail |
|---|---|
| Origin | **Generated output** of `archive/poc/poc_generate_80_slides.py` (python-pptx) |
| Layouts | All 80 slides use the default "Blank" layout. **No placeholders** on any slide. |
| Theme | Default Office theme (Calibri). No Mars branding in the theme. |
| Charts | None. The "charts" are drawn from rectangles and rounded rectangles (e.g. slide 9). |
| Media, notes, comments | No media, no speaker notes, no comments |
| How it reaches 80 slides | The script pads with repeated filler slides to reach exactly 80 (`archive/poc/poc_generate_80_slides.py`, `TOTAL_SLIDES_TARGET`) |
| Data | Fictional markets and figures |
| Dimensions | 13.333 × 7.5 in, but `sldSz type="screen4x3"`, a mislabelled attribute that python-pptx's default carries |

This is a proof-of-concept artefact, not a template.

### 1.3 Conclusion

**There is no authoritative editable master in the workspace.** Neither candidate supports any claim about the real template's placeholders, tables, charts, commentary areas or slide IDs.

---

## 2. File and Slide Structure

### 2.1 Real template — [Blocked]

Slide count, dimensions, ordering, sections, masters, layouts and themes cannot be reported.

### 2.2 Reference facts from the design deck, useful when the template arrives [Evidence]

| Item | Design deck |
|---|---|
| Slide masters | 2: "simple-light-2" (Google Slides) and an unnamed Mars-branded master |
| Layouts | 46 across both masters (e.g. "TITLE_ONLY", "Title and chart", "Content_chart right", "Section Header_green", "1_Branded Footer") |
| Layouts actually used | TITLE_ONLY (51 slides), OBJECT (4), plus one each of 22_Cover Slide, Ttile only, Thank you |
| Themes | 3. One uses **Mars Centra / Mars Centra Extrabold**; two use Arial. |
| Embedded fonts | 9 font parts: Mars Centra, Mars Centra Extrabold, Aptos Narrow, NTR |
| OLE | 1 embedded OLE object, referenced from **slide master 2** (not from any slide) |
| Comments | 17 "modern comment" parts (review comments; contents not reproduced here) |
| Speaker notes | 57 notes parts, **all empty** |
| Animations / transitions | None on slides (the cover slide carries a transition element only) |
| External links | None |
| Custom XML / tags | 9 customXml parts; 3 tags parts |
| Media | 121 PNG, 9 EMF, 2 JPEG (EMF is a Windows vector format that some renderers handle poorly) |

**Correction to earlier reports.** The edit instructions in the design deck ("Remove", "Replace with slide 22", "Add in place of slide 23") are **text boxes on the slides**, not speaker notes. The speaker notes are empty.

If the real template derives from the Mars-branded master in this deck, expect a dependency on **Mars Centra fonts**. Any server-side renderer must have them licensed and installed (§12). **[Proposed assumption — verify]**

### 2.3 Inspection procedure to run on the real template [Proposed]

Apply this read-only procedure when the file arrives. Every item maps to an OOXML part, so it can be done without PowerPoint.

| # | Check | Where in the PPTX package |
|---|---|---|
| 1 | Slide count, size, ordering, sections | `ppt/presentation.xml` (`sldSz`, `sldIdLst`, `p14:sectionLst`) |
| 2 | Slide ID per slide | `p:sldId/@id` in `presentation.xml` |
| 3 | Master and layout per slide; layout names; placeholders on layouts | `ppt/slides/_rels/*.rels` → `slideLayoutN.xml` → `slideMasterN.xml` |
| 4 | Theme fonts and colours | `ppt/theme/themeN.xml` |
| 5 | Shapes per slide: `p:sp` (text), `p:ph` (placeholder), `p:pic` (image), `p:graphicFrame` (table/chart/OLE/SmartArt), `p:grpSp` (group), `p:cxnSp` (connector) | `ppt/slides/slideN.xml` |
| 6 | Shape names, IDs and alt text (binding candidates) | `p:cNvPr/@name`, `@id`, `@descr` |
| 7 | Native charts and their embedded workbooks | `ppt/charts/chartN.xml`, `ppt/embeddings/*.xlsx` |
| 8 | OLE objects (e.g. pasted Excel ranges, which render as images) | `ppt/embeddings/oleObject*.bin`, with fallback images |
| 9 | SmartArt | `ppt/diagrams/*` |
| 10 | Media types (PNG/JPEG/EMF/SVG/video) | `ppt/media/*` |
| 11 | Speaker notes | `ppt/notesSlides/*` |
| 12 | Comments | `ppt/comments/*` |
| 13 | External links (linked Excel charts, linked images) | `TargetMode="External"` in any `.rels` |
| 14 | Animations / transitions | `p:timing`, `p:transition`, `mc:AlternateContent` |
| 15 | Embedded fonts | `ppt/fonts/*`, `p:embeddedFontLst` |
| 16 | Tags / custom data (candidate stable keys) | `ppt/tags/*`, `p:custDataLst` |
| 17 | **Visual review** | Render every slide to an image and compare to PowerPoint, to find "tables" or "charts" that are really pictures |

---

## 3. Complete Slide Inventory

### 3.1 Real template — [Blocked]

The required inventory cannot be produced. The table below is the agreed **format** to fill in once the template is available.

| # | Slide ID (`sldId`) | Proposed stable key | Title | Pillar / section | Layout | Native elements | Images / charts | Editable text objects | Commentary location | Data placeholders | Dynamic data required | Render complexity (L/M/H) | Risks |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | — | — | — | — | — | — | — | — | — | — | — | — | — |
| … | | | | | | | | | | | | | |

### 3.2 Design deck structure (reference only, not the template) [Evidence]

| Slides | Content | Native objects | Automation relevance |
|---|---|---|---|
| 1 | Cover | 1 placeholder | None |
| 2 | Overview summary | 3 pictures | None (image) |
| 3, 7, 15, 50 | Pillar divider (four pillars) | 8 text shapes, 6 pictures, 6 groups | Possible section-divider pattern |
| 4, 8, 16, 51, 56 | Report coverage lists per pillar; 56 = backlog | 4 pictures each; slide 56 has no text shapes | None (image) |
| 5–6, 9–14, 17–21, 23–49, 52–55, 57 | Before/after report redesigns | ~27 shapes (≈17 with text), 7–9 pictures, 1 group | **Redesigned reports are pictures**; text is design rationale |
| 22 | "Topline Category/Brand headlines in one page" | **2 native tables** (4×3; 20×6 with merges) | The only native, data-shaped slide. A useful pattern for a narrative + metrics slide. |
| 58 | Thank you | 2 placeholders | None |

---

## 4. Native Versus Non-Editable Elements

### 4.1 Real template — [Blocked]

### 4.2 Classification rules to apply [Proposed]

| Object found | Automation class | How to recognise it | Action |
|---|---|---|---|
| Placeholder (`p:ph`) with text | **Editable, preferred** | `p:nvPr/p:ph` | Bind by placeholder `idx` and shape name |
| Plain text box (`p:sp` with `txBody`) | **Editable** | No `p:ph` | Bind by shape name |
| Native table (`a:tbl`) | **Editable values**; structure changes need care | `graphicFrame` with table URI | Write cell text. Adding or removing rows needs XML row cloning. |
| Native chart (`c:chart`) | **Editable data** | `graphicFrame` with chart URI + `ppt/charts/` | Replace chart data (updates the embedded workbook and cache) |
| Linked chart (external workbook) | **Fragile** | External relationship | Break the link in the template or replace it with an embedded chart |
| Pasted Excel / OLE object | **Not editable** (renders a stored image) | `p:oleObj` + `embeddings/*.bin` | Replace with a native table or chart in the template |
| Picture of a table or chart | **Not editable** | `p:pic` that *looks like* data | Template must be rebuilt natively, or the slide is treated as static |
| SmartArt | **Weakly editable** (no high-level API; drawing cache) | `ppt/diagrams/` | Avoid for dynamic content |
| Group shape | Editable children | `p:grpSp` | Address children by name |
| Icons / logos / decorative images | Static | `p:pic` | Leave untouched |
| EMF/WMF vector images | Static; **render risk** | `media/*.emf` | Convert to PNG/SVG in the template if they render badly |

The design deck shows why this matters. Its "Updated Version" reports *look* like tables, KPI cards and commentary panels, but they are PNG pictures. **[Evidence]**

---

## 5. Master/Layout/Placeholder Analysis

### 5.1 Real template — [Blocked]

### 5.2 What to look for, and why it matters [Proposed]

| Question | Why it matters |
|---|---|
| Are dynamic regions **placeholders on layouts** or loose text boxes on slides? | Placeholders give a consistent `idx` across slides that share a layout. Loose shapes need name-based binding. |
| How many layouts are actually used? | Fewer layouts mean fewer distinct render paths and a simpler manifest |
| Are titles in title placeholders? | Needed to set dynamic titles (some FNOS report titles are period-specific headlines — `docs/analysis/PROJECT_DISCOVERY_REPORT.md` §5.1) |
| Are there unused layouts from other sources? | The design deck carries 46 layouts but uses 5. Clutter is harmless but should be ignored by tooling. |
| Is there a dedicated **commentary placeholder** in the relevant layouts? | Determines whether Save to Slide requires a layout change (§6) |
| Do masters contain OLE objects or images with text? | The design deck's master 2 contains an OLE object. It must render correctly on every slide that inherits it. |

---

## 6. Commentary and Speaker Notes Analysis

### 6.1 Real template — [Blocked]

The analysis cannot establish:

- whether a commentary text box exists on each slide;
- its size and capacity;
- whether it is a placeholder;
- whether speaker notes are already used.

### 6.2 The four kinds of "commentary" (keep them separate)

| Kind | Lives in | Visible to | Notes |
|---|---|---|---|
| **Browser commentary** | React state in the right panel (unsaved) | The editing user only | Lost on refresh unless drafts are saved |
| **Saved commentary** | Azure SQL (application database) — a versioned record per report × slide × block | All app users with access | The single source of truth for what goes into the PPTX **[Proposed]** |
| **Visible PowerPoint slide text** | A text shape on the slide face inside the PPTX | Everyone who views or presents the deck | Constrained by box size, font and layout |
| **PowerPoint speaker notes** | The notes page of the slide (`notesSlideN.xml`) | Presenters and editors (not shown to the audience when presenting) | Unconstrained length; does not affect layout |

### 6.3 Layout impact — decision rules [Proposed]

| Template finding (to be checked) | Consequence |
|---|---|
| A commentary box exists and is named or placeholdered | Write saved commentary into it. No layout change. Enforce a character or line limit in the editor. |
| A box exists but is unnamed | The template owner adds a stable shape name (metadata only, no visual change) |
| No box exists | **Either** the template owner adds one (a template revision, needing design sign-off), **or** commentary goes to speaker notes only (no visual change, but invisible when presenting). Generating a new box at runtime is **not recommended**, because it risks overlapping content. |
| The box is inside a group or a picture | If grouped, address the child shape. If it is a picture, a template revision is needed. |

---

## 7. Data Population Feasibility

Feasibility is assessed per capability. "Template-dependent" items cannot be rated until §2.3 runs.

| # | Capability | Feasibility | Basis |
|---|---|---|---|
| 1 | Open the existing PPTX without losing formatting | **High** with python-pptx | **[Library fact]** python-pptx loads all package parts and writes back unchanged the parts it does not modify, including those it has no API for (animations, media, comments, custom XML). Edited shapes keep their properties unless overwritten. Verify by round-trip diff (§13). |
| 2 | Replace text in existing shapes | **High**, with care | **[Library fact]** Text is held in *runs*. Assigning `text_frame.text` collapses runs and loses mixed formatting. Safe replacement keeps the first run's formatting and edits run text. Autofit is **not** recalculated, so overflow must be controlled by length limits or explicit font sizing. |
| 3 | Update tables | **High** for cell values; **Medium** for structural changes | **[Library fact]** Cell text and formatting are accessible, and merged cells can be read. Adding or removing rows has no high-level API, so it requires cloning `a:tr` XML. Conditional colouring (e.g. red/green variances) must be applied per cell in code. |
| 4 | Update native charts | **Medium–High** | **[Library fact]** `chart.replace_data()` rewrites the series cache and the embedded workbook for supported chart types (category, XY, bubble). Changing the number of series can lose per-series formatting. Combo charts, secondary axes and some chart types need testing. Linked (external) charts cannot be updated this way. |
| 5 | Populate numerical KPIs | **High** if KPIs are text shapes or table cells; **impossible** if they are pictures | Template-dependent |
| 6 | Update narrative placeholders | **High** if a named box exists (§6.3) | Template-dependent |
| 7 | Write speaker notes | **High** | **[Library fact]** `slide.notes_slide.notes_text_frame` is read/write, and a notes slide is created if absent |
| 8 | Preserve themes, fonts, animations, media | **High** in the file; **renderer-dependent** in previews | **[Library fact]** Untouched parts round-trip. Fonts are not embedded or subset by python-pptx; existing embedded font parts are left as they are. |
| 9 | Save a modified copy without changing the master | **High** | Load the template from Blob (read-only), save to a new blob path per report version. Never write back to the template path. **[Proposed]** |
| 10 | Produce accurate browser preview images | **Not possible with python-pptx** | **[Library fact]** python-pptx has no rendering engine. A separate converter is required (§8). |
| 11 | Produce all slide thumbnails | Depends on #10 | Thumbnails are downscaled renders from the same converter |
| 12 | Generate an editable final PPTX | **High** | Output is a normal PPTX with native objects, provided the template uses native objects |

**Other library constraints [Library fact]:**

- python-pptx has **no slide-duplication API**. Repeating a slide per brand or market means copying slide XML and its relationships (charts and images need careful handling), or pre-authoring each instance in the template.
- It has no API for SmartArt, modern comments or OLE content. Those parts survive untouched but cannot be meaningfully edited.

---

## 8. PowerPoint Preview and Thumbnail Options

### 8.1 Rendering technologies (python-pptx cannot render)

| Technology | How it renders | Fidelity | Fit with the approved architecture | Notes |
|---|---|---|---|---|
| **LibreOffice (headless) → PDF/PNG** | Converts PPTX with its own layout engine | **Medium.** Differences in fonts, autofit, some chart styling, EMF, gradients and effects. | Runs in a container (e.g. a custom container on Azure Functions or App Service). **The converter itself is not drawn in the diagram**; agree it with the architect. | Open source. Large image (hundreds of MB). Cold start and CPU cost. Needs Mars fonts installed. |
| **Aspose.Slides for Python** | Commercial library with its own renderer | **High** for most content | In-process in Python (Functions / App Service) | Licence cost; also edits PPTX |
| **Microsoft Graph file conversion** (`format=pdf` on a drive item) | Microsoft's Office rendering | **Highest** (Office engine) | Needs the file in OneDrive/SharePoint and Graph permissions. **Not in the approved diagram.** | Produces PDF; a PDF-to-image step is still needed. Data-governance review required. |
| **PowerPoint desktop automation (COM)** | Real PowerPoint | Highest | **Not suitable.** Microsoft does not support unattended server-side Office automation. | Reject |
| **No conversion (HTML only)** | React renders from data | N/A (re-implementation) | Fits | See strategy B below |

### 8.2 Strategy comparison

| Criterion | **A. PPTX → image** | **B. React/HTML from structured data** | **C. Hybrid: slide images + separately managed commentary** |
|---|---|---|---|
| Visual fidelity to the final PPTX | High, as good as the converter (§8.1) | **Low–Medium.** ~80 layouts re-implemented in HTML; drift is inevitable. | High for the slide; commentary shown in the right panel |
| Data/PPTX consistency | Guaranteed: the preview *is* the output | Two renderers can disagree | Guaranteed for the slide body |
| Editability in the browser | None on the image | Full in-canvas editing | Editing in the right panel; the slide updates after re-render |
| Performance (~80 slides) | Batch render after generation (seconds to minutes, converter-dependent); images cache well; lazy-load thumbnails | Fast client rendering once built | Same as A, plus a single-slide re-render on save |
| Build complexity | Converter operations (container, fonts) | **Very high** (an HTML twin of every layout) | Medium |
| Effect of template revisions | Automatic | Every template change needs a frontend change | Automatic |
| Accuracy of "what you see is what you download" | Yes | No | Yes, after re-render |

### 8.3 Recommendation (conditional) [Proposed]

**Direction: Strategy C (hybrid).**

1. The final PPTX is produced from the template (python-pptx).
2. **Preview and thumbnails are rendered images of that same PPTX**, made by a converter selected through a fidelity spike: LibreOffice vs Aspose.Slides, and Graph if governance permits.
3. **Commentary is edited in the right panel** as structured text from Azure SQL.
4. On Save to Slide, the affected slide is re-populated and re-rendered asynchronously. The canvas shows "updating" until the new image is ready.

**Assumptions this rests on (verify against the real template):**

- The template's dynamic regions are native objects.
- Commentary has a destination box or is written to notes.
- A converter reproduces Mars fonts and layouts acceptably.

**If the converter fidelity spike fails:** fall back to B for selected high-traffic slides only, accepting the drift.

---

## 9. Save to Slide Technical Flow

Example: commentary on **slide 24**. Steps are architecture-aligned. Exact components follow `docs/analysis/FNOS_ARCHITECTURE_DEEP_DIVE.md`. The template destination is **[Blocked]**.

| # | Step | Where | Data |
|---|---|---|---|
| 1 | User opens slide 24. The frontend resolves it to a **stable slide key** (not the position "24"), e.g. `ext_brand_share`. | React | Report ID, template version, slide key |
| 2 | The frontend loads the saved commentary (latest version) and AI suggestions | FastAPI → Azure SQL | Commentary blocks + version number |
| 3 | The user edits in the right panel | React (**browser commentary**) | Unsaved text; length counter against the manifest limit |
| 4 | User clicks **Save to Slide**. The frontend sends report ID, slide key, block ID, text and the expected version (optimistic locking). | React → APIM → FastAPI | Payload validated (length, allowed formatting) |
| 5 | The backend authorises, validates and inserts a **new commentary version** (status: saved), and marks slide 24 "render pending" | FastAPI → Azure SQL (**saved commentary**) | Version N+1, author, timestamp, origin (AI/human/edited) |
| 6 | An async render job re-populates slide 24. The manifest names the destination (e.g. shape `fnos.commentary.main`, and/or speaker notes). | Orchestrator → Azure Functions (rendering, per the architecture interpretation) | Template from Blob + slide data + commentary |
| 7 | The renderer writes the text into the destination shape (**visible slide text**), keeping run formatting, and/or into **speaker notes**, per the manifest | python-pptx | Working PPTX for the report version |
| 8 | Slide 24 is re-rendered to an image; the thumbnail is regenerated | Converter (§8.1) → Blob | Preview PNG + thumbnail |
| 9 | The frontend is notified (polling or push) and swaps the preview image | React | New image URL |
| 10 | On download, the PPTX built from the latest saved commentary is served | Blob → user | Final PPTX |

**Rules [Proposed]:**

- Only **saved** commentary reaches the PPTX; unsaved browser text never does.
- AI suggestions do not enter the PPTX until a user saves them.
- Each commentary block maps to exactly one destination declared in the manifest.
- **Whether a layout change is required depends on §6.3.** If slide 24 has no commentary box, the options are a template revision or notes-only.

---

## 10. Template Manifest Proposal

### 10.1 Purpose

A machine-readable description of the template that both the renderer and the frontend use. It maps:

**Template version → Slide key → Order → Layout → Data bindings → Narrative destinations → Preview → Output.**

It lives in Azure SQL (or as a versioned JSON document in Blob alongside the template). Exactly one manifest exists per template version.

### 10.2 Illustrative structure (data specification, not code)

```yaml
template:
  template_id: fnos-executive-deck
  version: 2026.10.0            # bumped on every template file change
  blob_path: templates/fnos-executive-deck/2026.10.0/template.pptx
  sha256: "<hash of template file>"
  slide_size_emu: [cx, cy]
  fonts_required: [ "<from theme>" ]

slides:
  - slide_key: ext_brand_share          # stable, human-assigned, never reused
    order: 24                           # display position (may change between versions)
    pptx_slide_id: 291                  # p:sldId/@id observed in this version (diagnostic)
    title_shape: "fnos.title"
    section: drive_relevance
    layout_name: "Title Only"
    route: simple                       # simple → deterministic agents; complex → dynamic
    repeat_for: null                    # or a list of brand/market keys if instanced
    bindings:
      - shape: "fnos.kpi.rsv_share"     # shape name in the template
        kind: text                      # text | table | chart | notes
        source: gold.ext_brand_share    # data contract reference
        field: rsv_share_ytd
        format: "0.0%"
      - shape: "fnos.table.brand_share"
        kind: table
        source: gold.ext_brand_share
        columns: [brand, rsv_share, vs_ya]
        max_rows: 12
        conditional_format: variance_red_green
    narrative:
      - block_id: main
        destination: { shape: "fnos.commentary.main" }   # or { notes: true }
        max_chars: 600
        ai_route: deterministic
    preview:
      image_path: reports/{report_id}/v{n}/slides/ext_brand_share.png
      thumb_path: reports/{report_id}/v{n}/thumbs/ext_brand_share.png
    output:
      include: true
```

### 10.3 Stable slide identification [Proposed]

| Option | Survives reordering? | Survives template revisions? | Notes |
|---|---|---|---|
| Slide position (1…80) | No | No | Never use as a key |
| `p:sldId/@id` | **Yes** | Often, but **not guaranteed**: copying, re-importing or rebuilding slides assigns new IDs | Keep as a diagnostic, not the primary key |
| Slide title text | Partly | No (titles are dynamic) | Unsuitable |
| **Author-assigned key stored in the slide** — a hidden tag (`p:custDataLst` / tags part) or a key shape name, e.g. a zero-size shape named `fnos.slide:ext_brand_share` | **Yes** | **Yes**, if the template owner keeps it | **Recommended.** python-pptx reads shape names directly; tags need light XML access. |
| Shape names for bindings (`fnos.kpi.*`, `fnos.table.*`, `fnos.commentary.*`) | Yes | Yes, if kept | Editable in PowerPoint's Selection Pane; no visual change |

**Template ingest validation [Proposed].** When a new template version is uploaded, an automated check should:

1. confirm that every manifest slide key and bound shape exists;
2. flag missing or duplicate keys, unexpected shape types (e.g. a picture where a table is expected) and external links;
3. diff against the previous version.

Only a template that passes is activated. Reports keep a reference to the template version they were generated from.

---

## 11. PowerPoint Library Compatibility and Limitations

| Technology | Role | Strengths | Limitations | Fit |
|---|---|---|---|---|
| **python-pptx** | Read, modify, write PPTX | Pure Python; round-trips unknown parts; text, tables, native chart data, notes, placeholders, shape names | **No rendering.** No slide duplication. No SmartArt API. No autofit recalculation. Table row add/remove needs XML. Chart-type coverage gaps. No modern-comments API. | **Primary editor** (matches the Python/FastAPI stack and the earlier POC) |
| **lxml (beneath python-pptx)** | Low-level XML edits | Anything the API lacks (row cloning, tags) | Requires OOXML expertise; easy to corrupt files | Targeted use only |
| **Aspose.Slides for Python** | Edit + render | Rendering to PNG/PDF; slide cloning; broad feature support | Commercial licence; heavier dependency | Candidate converter, or editor + converter |
| **LibreOffice headless** | Render | Free; PPTX → PDF/PNG | Fidelity gaps; container size; font provisioning; concurrency limits | Candidate converter |
| **Microsoft Graph conversion** | Render (via Office) | Best fidelity | Requires SharePoint/OneDrive storage and governance approval; not in the approved diagram | Candidate if approved |
| **Open XML SDK (.NET)** | Low-level edit | Complete OOXML control | No rendering; introduces .NET outside the stated stack | Not recommended unless needed |
| **PowerPoint COM automation** | Render/edit | Perfect fidelity | Unsupported for servers | Reject |

---

## 12. Rendering Risks

| # | Risk | Impact | Mitigation [Proposed] |
|---|---|---|---|
| R1 | **Editable template unavailable** | Blocks every master-specific decision | Obtain the file; run §2.3 |
| R2 | Template "tables/KPIs/commentary" are **pictures** (as in the design deck) | Cannot populate them | Template owner rebuilds those regions natively before automation |
| R3 | **Mars Centra fonts** missing on the render host | Wrong metrics, reflow, overflow in previews | Licence and install fonts in the converter image; test glyph coverage |
| R4 | **Text overflow**: python-pptx does not recompute autofit | Commentary spills out of its box | `max_chars` per block; fixed font sizes; overflow check in the PoC |
| R5 | Converter fidelity differs from PowerPoint (EMF, gradients, chart styles) | Preview ≠ download | Fidelity spike; compare against PowerPoint renders |
| R6 | OLE or linked objects (incl. objects on masters) | Stale or broken content | Replace with native objects; remove external links |
| R7 | Slide repetition per brand/market (no clone API) | Complex code, corrupted relationships | Pre-author instances in the template, or use a proven cloning routine with tests |
| R8 | Chart `replace_data` changes series formatting | Visual regressions | Keep series counts fixed per chart; golden-file tests |
| R9 | Conditional formatting (red/green) not inherent in a table | Manual per-cell styling | Encode rules in the manifest; unit tests |
| R10 | ~80-slide render time and cost | Slow preview after generation | Render in parallel per slide; cache; render only changed slides on save |
| R11 | Concurrent saves on one slide | Lost edits | Optimistic locking on commentary versions |
| R12 | Template revisions break bindings | Runtime failures | Ingest validation (§10.3); versioned manifests |
| R13 | Comments or review artefacts left in the template | Leakage of internal review notes into distributed decks | Strip comments when ingesting the template |

---

## 13. Recommended Three-Slide Proof of Concept

### 13.1 Slide selection — [Blocked]

The three slides must be **real template slides**. Selection criteria:

| PoC slide | Criteria | Provisional candidate (from the redesign catalogue; confirm it exists natively in the template) |
|---|---|---|
| 1. KPI-heavy | Several numeric text values / KPI cards; period and variance formatting | "F&N EU Strategic Cells Overview MAT/YTD" |
| 2. Table- or chart-heavy | A native table with merged headers and conditional colouring, and/or a native chart | "F&N EU P&L" (table) or a share-trend chart slide |
| 3. Narrative area | A commentary box or Working / Not Working / Actions structure | "Topline Summary – Working / Not Working / Actions" |

### 13.2 Experiment design (not executed)

Use synthetic data only (no real business figures). For each slide:

1. Load the template.
2. Populate bindings from a synthetic JSON payload.
3. Write a commentary block to the slide face and to speaker notes.
4. Save as a new file.
5. Render to PNG with two candidate converters.
6. Compare.

### 13.3 Acceptance checks

| # | Check | Pass criterion |
|---|---|---|
| A1 | Master untouched | Template file hash unchanged after the run |
| A2 | Round-trip integrity | The output opens in PowerPoint with **no repair prompt**. Untouched parts (masters, layouts, theme, media) are byte-identical to the template. |
| A3 | Values correct | Every bound value in the output XML equals the synthetic input (automated comparison), with the correct number format |
| A4 | Formatting preserved | Font, size, colour and alignment of populated runs match the template run properties |
| A5 | Table update | Cell values written; merged headers intact; conditional colours applied per rule |
| A6 | Chart update (if present) | The chart remains native and editable in PowerPoint; the embedded workbook contains the new data; series formatting unchanged |
| A7 | Commentary on slide | Text is in the named shape, within its bounds, at the maximum allowed length (no overflow in the PowerPoint render) |
| A8 | Speaker notes | Notes contain the commentary; slide layout unchanged |
| A9 | Preview fidelity | Converter PNG vs a PowerPoint-exported PNG: no missing elements; text not reflowed beyond its box; fonts correct (visual review plus a pixel-difference threshold to agree) |
| A10 | Thumbnail | Generated at the agreed size; legible as a navigation aid |
| A11 | Performance | Per-slide populate + render time measured; extrapolated time for ~80 slides reported |
| A12 | Stable keys | Slides and shapes resolved by manifest keys, not by position; still works after reordering the template slides in a copy |

---

## 14. Open Decisions and Acceptance Criteria

### 14.1 Open decisions

| # | Decision | Owner (suggested) | Blocked by |
|---|---|---|---|
| D1 | **Provide the editable ~80-slide template** (PPTX or POTX) and name its owner | Product owner / template owner | — |
| D2 | One template or several ("Presentation Template" filter)? | Product owner | D1 |
| D3 | Commentary destination per slide: slide face, speaker notes, or both | Product owner + template owner | D1 |
| D4 | Template revisions needed: native rebuild of picture regions; adding named commentary boxes; stable keys and shape names | Template owner + design sign-off | D1 |
| D5 | Preview strategy: confirm C (hybrid) after the spike | Tech lead + architect | PoC |
| D6 | Converter: LibreOffice / Aspose.Slides / Graph; its hosting (the converter is not drawn in the approved diagram) | Architect | PoC |
| D7 | Slide repetition approach for brand/market instances (pre-authored vs cloned) | Tech lead + template owner | D1 |
| D8 | Template storage and versioning location (Blob is plausible, not confirmed) | Architect | — |
| D9 | Font licensing for server-side rendering | Mars IT / brand | D6 |
| D10 | Whether review comments must be stripped from generated decks | Product owner / security | — |

### 14.2 Acceptance criteria for "template ready for automation"

1. The editable template is stored in version control or Blob, with a version number and hash.
2. Every slide has a stable key. Every dynamic region has a named shape or placeholder.
3. No dynamic region is a picture, OLE object or linked object.
4. Each slide declares its commentary destination, with a maximum length.
5. A manifest exists, and it passes ingest validation against the template.
6. Required fonts are licensed for the render host.
7. The three-slide PoC passes A1–A12.

---

## Appendix — Evidence commands (read-only)

All findings were produced by parsing the PPTX ZIP packages with Python's standard library (`zipfile`, `xml.etree`), reading:

- `ppt/presentation.xml`;
- `ppt/slides/*.xml` and their `.rels`;
- `ppt/slideLayouts`, `ppt/slideMasters`, `ppt/theme`;
- `ppt/notesSlides`, `ppt/comments`, `ppt/embeddings`, `ppt/fonts`, `ppt/media`.

The source decks were opened read-only, and extracted copies were kept in a temporary scratch directory outside the workspace. No workspace file was modified.
