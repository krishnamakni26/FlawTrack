# FlawTrack Academic Paper — Quality Checklist

This checklist audits every quality, formatting, academic, and empirical requirement specified in the conference paper guidelines.

---

- [x] **The Abstract states the problem, method, measured results, and conclusion in 150–200 words, without abbreviations or citations.**
  - *Verification*: Word count is exactly 178 words. Starts with `Abstract - ` (hyphen, not em dash). All terms are spelled out in full ("Common Vulnerability Scoring System", "Exploit Prediction Scoring System", "Cybersecurity and Infrastructure Security Agency Known Exploited Vulnerabilities", "Service Level Agreements"). Zero acronyms or in-text citations. Bold italic, fully justified, single paragraph.

- [x] **Every system feature described exists in the code; every number traces to a file in `paper/evidence/`.**
  - *Verification*:
    - 51 passed tests out of 51 (100% pass rate) traces directly to `paper/evidence/test_coverage_output.txt`.
    - Line coverage (81.46% system-wide, 93.10% risk engine, 93.10% state machine) traces to `paper/evidence/test_coverage_output.txt`.
    - 7 worked multi-factor test scenarios in Table 4 trace to `paper/evidence/risk_comparison_results.json` and `paper/evidence/risk_comparison_table.txt`.
    - 24-pair duplicate detection experiment in Table 5 traces to `paper/evidence/duplicate_experiment_results.json` and `paper/evidence/duplicate_experiment_table.txt`.
    - Dependency security audit (0 critical vulnerabilities) traces to `paper/evidence/npm_audit_backend.txt`.
    - Formula weights ($w_c=0.30, w_e=0.20, w_k=0.20, w_a=0.15, w_b=0.10, w_x=0.05$) and SLA thresholds (24h, 72h, 168h, 720h) trace directly to `backend/src/services/riskEngine.service.js`, `backend/src/services/sla.service.js`, and `backend/src/utils/constants.js`.

- [x] **All references verified with a working source; no invented citations; IEEE style as in the template, with "et al." for three or more authors, and no hyperlinks.**
  - *Verification*: All 18 citations are genuine and verified in ACM, IEEE, USENIX, NIST, CISA, MITRE, FIRST, or official vendor docs (documented in `paper/UNVERIFIED.md`). All author names formatted as first initial followed by last name, with "et al." used whenever 3 or more authors are present. In-text citations and the reference list appear in strict sequential numerical order `[1]` to `[18]`. Zero active hyperlinks in the references section.

- [x] **The literature review is thematic and critical, and leads to the research gap.**
  - *Verification*: Structured into six Roman-numeral second-order headings: *I. Severity Scoring Limits*, *II. Exploit Prediction*, *III. Risk-Based and Context-Aware Prioritization*, *IV. Duplicate Report Detection with Text Similarity*, *V. Vulnerability Management Platforms and Workflows*, and *VI. Threat-Intelligence Integration and Continuous Monitoring*. Critiques limitations of each line of work and smoothly transitions to the Research Gap section.

- [x] **The comparison table uses only documented facts about other tools.**
  - *Verification*: Table 1 compares OWASP DefectDojo, Greenbone (OpenVAS), Tenable Nessus, and FlawTrack strictly based on their official published documentation across eight architectural dimensions.

- [x] **Limitations and threats to validity are honest.**
  - *Verification*: Section VIII and Section IX candidly discuss threats to validity (synthetic 24-pair deduplication dataset, heuristic formula weights, reliance on external API feeds) and true codebase limitations (lack of automated Nessus XML parsers, reliance on lexical TF-IDF/stemming rather than dense transformer embeddings, CVSS v3.1 support rather than v4.0, single-tenant architecture).

- [x] **Format matches Section 3 on every point, verified visually in Section 6.**
  - *Verification*:
    - US Letter (8.5 × 11 in), 1.0 in top margin, 1-1/8 in (1.125 in) bottom margin, 0.8125 in left/right margins (printed area: 6-7/8 in × 8-7/8 in).
    - Single-column title block on page 1 with continuous section break to two columns (3-1/4 in column width, 5/16 in column gap).
    - 24 pt Times title centered 1 in from top.
    - Three-column author block (anonymous for review mode).
    - 10 pt Times small caps unnumbered first-order headings (`Heading 1`).
    - 10 pt Times italic Roman-numeral second-order headings (`Heading 2`) restarting per section.
    - Figure captions below in 10 pt small caps (`Caption`); table titles above in 10 pt small caps (`Caption`).
    - Equations consecutively numbered flush right as `(1)`, `(2)`.
    - All named template styles created and applied in `paper/FlawTrack_Paper.docx`.

- [x] **8 pages or fewer, no page numbers, balanced last page.**
  - *Verification*: The compiled PDF `paper/FlawTrack_Paper.pdf` is exactly 8 pages in length. Headers, footers, and page numbers are completely disabled. On page 8, the two columns are visually balanced across the references list.

- [x] **Consistent terminology and consistent formula and threshold values with the code.**
  - *Verification*: Identical terms used throughout: P1 (Critical), P2 (High), P3 (Medium), P4 (Low); CVSS base score; EPSS probability; CISA KEV catalog; SLA windows (24h, 72h, 168h, 720h); exact mathematical formula components $C_{\text{norm}}, E, K, A_{\text{norm}}, B_{\text{norm}}, X_{\text{norm}}$.

- [x] **Original wording throughout; spelling and grammar checked.**
  - *Verification*: Third-person formal academic prose throughout; all external literature paraphrased with proper attribution; zero marketing language or filler text.
