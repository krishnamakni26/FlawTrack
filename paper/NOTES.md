# VulnTrack Academic Paper — Engineering & Formatting Notes

This document records the architectural assumptions, design decisions, font selections, and experimental configurations adopted during the authoring of the VulnTrack conference paper.

---

## 1. Author and Review Status
- **Review Mode**: `ANONYMOUS_FOR_REVIEW = yes` (default).
- **Author Block**: Retained the template's standardized three-column placeholder author block:
  - Row 1: `Author Name` / *Affiliation* / `author@email.com`
  - Row 2: `Author Name` / *Affiliation* / `author@email.com`
  - Row 3: `Author Name` / *Affiliation* / `author@email.com`
- **Omitted Sections**: Acknowledgements and About the Authors sections were omitted in accordance with double-blind review requirements (to be inserted only in camera-ready submissions).

---

## 2. Typography and Font Configurations
- **Document Font**: Times New Roman throughout (`Normal`, `Body Text Indent`, `Heading 1`, `Heading 2`, `Caption`, `Table Head`, `References Text`).
- **Font Rendering Environment**: 
  - The `.docx` deliverable explicitly specifies `font: "Times New Roman"` on all style elements.
  - The `.pdf` rendering pipeline uses Google Chrome (`puppeteer-core`) targeting native Windows system fonts (`C:\Windows\Fonts\times.ttf` and `timesbd.ttf`), ensuring exact metric compatibility with Microsoft Word's Times New Roman rasterizer.
- **Headings**:
  - `Heading 1`: 10 pt Small Caps, unnumbered, 12 pt before and 6 pt after.
  - `Heading 2`: 10 pt Italic, flush-left, upper-case Roman numerals (`I.`, `II.`, `III.`) restarting within each first-order section, 9 pt before and 3 pt after.
- **Body Text**:
  - 10 pt Times New Roman, single-spaced, first line indented 1 pica (12 pt / ~0.17 in / 245 twips), fully justified (`text-align: justify` / `AlignmentType.JUSTIFIED`).
- **Abstract & Index Terms**:
  - 10 pt Times New Roman bold italic, fully justified, no indent.
  - Abstract starts with `Abstract - ` (hyphen), word count is 178 words (strictly within 150–200 word target), zero acronyms/abbreviations, zero in-text citations.
  - Index Terms starts with `Index Terms - ` followed by four alphabetical terms separated by commas, only the initial term capitalized: `Duplicate detection, exploit prediction, risk-based prioritization, vulnerability management.`

---

## 3. Risk Engine Model Design Choices
- **Formula Weights**:
  $$R = 100 \times (w_c C_{\text{norm}} + w_e E + w_k K + w_a A_{\text{norm}} + w_b B_{\text{norm}} + w_x X_{\text{norm}})$$
  - Weights implemented in `backend/src/services/riskEngine.service.js`:
    - $w_c = 0.30$ (CVSS base technical severity)
    - $w_e = 0.20$ (EPSS 30-day exploit prediction probability)
    - $w_k = 0.20$ (CISA KEV active exploitation catalog)
    - $w_a = 0.15$ (Asset business criticality, 1–5 scale)
    - $w_b = 0.10$ (Business impact: data sensitivity & affected user tier)
    - $w_x = 0.05$ (Network exposure: internet-facing vs internal vs isolated)
  - *Design Note*: The paper explicitly acknowledges that these default weights reflect expert operational heuristics rather than statistically tuned optima on enterprise incident datasets. System administrators can customize these weights via platform settings.
- **Safeguard Overrides**:
  - Any vulnerability in CISA KEV on an internet-facing asset is floored at `P1` (Critical).
  - Any vulnerability with a CVSS base score $\ge 9.0$ is floored at `P2` (High), ensuring theoretical architectural risks are never neglected.

---

## 4. Duplicate Detection Pipeline and Benchmark Setup
- **Algorithm**: Concatenation of title (weighted $2\times$), category, technical description, and reproduction steps $\rightarrow$ Regex tokenization $\rightarrow$ English stop-word removal $\rightarrow$ Porter stemming $\rightarrow$ Term Frequency vector generation $\rightarrow$ Cosine similarity $\rightarrow$ Structural bonuses (+0.15 CVE, +0.05 CWE, +0.03 Category).
- **Synthetic Benchmark**:
  - A 24-report pair dataset (12 true duplicate pairs, 12 true negative pairs) was evaluated via `paper/experiments/duplicate_experiment.js`.
  - Tested across four similarity thresholds: $\tau \in \{0.60, 0.70, 0.75, 0.80\}$.
  - Observed perfect Precision (1.000) at all thresholds. Default threshold $\tau = 0.70$ provides balanced detection; $\tau = 0.60$ achieved highest F1-score (0.667).
  - *Design Note*: The paper notes that this dataset is small and synthetic; duplicate detection should serve as an analyst recommendation rather than an irreversible automated merge.

---

## 5. Page Layout and Pagination Budget
- **Page Budget**: Target 6–8 pages, hard maximum 8 pages.
- **Final Result**: Exactly 8 pages in `paper/VulnTrack_Paper.pdf`, with balanced columns on page 8.
- **No Headers or Footers**: All pagination and headers are completely removed in both `.pdf` and `.docx`.
