const fs = require('fs');

const mapping = {
  17: 1,
  1: 2,
  2: 3,
  3: 4,
  5: 5,
  18: 6,
  10: 7,
  4: 8,
  7: 9,
  6: 10,
  8: 11,
  9: 12,
  11: 13,
  12: 14,
  13: 15,
  14: 16,
  15: 17,
  16: 18
};

// 1. Update build_pdf.js
let pdfContent = fs.readFileSync('paper/experiments/build_pdf.js', 'utf8');

// We need to replace citations in text safely without collisions.
// Use temporary placeholders like ___CITE_1___
for (let oldNum = 1; oldNum <= 18; oldNum++) {
  const newNum = mapping[oldNum];
  const regex = new RegExp(`\\[${oldNum}\\]`, 'g');
  pdfContent = pdfContent.replace(regex, `___CITE_${newNum}___`);
}
// Now replace placeholders with new bracketed numbers
for (let newNum = 1; newNum <= 18; newNum++) {
  const regex = new RegExp(`___CITE_${newNum}___`, 'g');
  pdfContent = pdfContent.replace(regex, `[${newNum}]`);
}

// Update the references list at the end of build_pdf.js
const newReferencesHtml = `  <!-- REFERENCES SECTION: Balanced Two Columns on Final Page -->
  <div class="references-container">
    <div style="column-span: all;">
      <h2 class="heading-1" style="margin-top: 6pt; margin-bottom: 3pt;">REFERENCES</h2>
    </div>
    <p class="reference-item">[1] National Institute of Standards and Technology (NIST), “National Vulnerability Database (NVD),” U.S. Department of Commerce, 2024. [Online]. Available: https://nvd.nist.gov</p>
    <p class="reference-item">[2] FIRST, “Common Vulnerability Scoring System v3.1: Specification Document,” Forum of Incident Response and Security Teams, 2019. [Online]. Available: https://www.first.org/cvss/v3.1/specification-document</p>
    <p class="reference-item">[3] L. Allodi and F. Massacci, “Comparing vulnerability severity and exploits using case-control studies,” ACM Trans. Inf. Syst. Secur., vol. 17, no. 1, pp. 1–20, Aug. 2014.</p>
    <p class="reference-item">[4] J. Spring et al., “Time to change the CVSS?,” IEEE Secur. Privacy, vol. 19, no. 2, pp. 74–78, Mar.–Apr. 2021.</p>
    <p class="reference-item">[5] J. Jacobs et al., “Exploit Prediction Scoring System (EPSS),” Digit. Threats: Res. Pract., vol. 2, no. 3, pp. 1–17, 2021.</p>
    <p class="reference-item">[6] The MITRE Corporation, “Common Weakness Enumeration (CWE): A Community-Developed List of Software Weakness Types,” 2024. [Online]. Available: https://cwe.mitre.org</p>
    <p class="reference-item">[7] Cybersecurity and Infrastructure Security Agency (CISA), “Known Exploited Vulnerabilities Catalog,” CISA, 2021. [Online]. Available: https://www.cisa.gov/known-exploited-vulnerabilities-catalog</p>
    <p class="reference-item">[8] S. Frei, M. May, B. Stiller, and U. Fiedler, “Large-scale modeling of software vulnerabilities,” ACM SIGCOMM Comput. Commun. Rev., vol. 36, no. 4, pp. 131–142, 2006.</p>
    <p class="reference-item">[9] M. Bozorgi, L. K. Saul, S. Savage, and G. M. Voelker, “Beyond heuristics: Learning to classify vulnerabilities and predict exploits,” in Proc. 16th ACM SIGKDD Int. Conf. Knowl. Discov. Data Min., 2010, pp. 105–114.</p>
    <p class="reference-item">[10] H. Fang et al., “Predicting exploits in the wild: A machine learning approach,” in Proc. 27th ACM Conf. Comput. Commun. Secur. (CCS), 2020, pp. 1–14.</p>
    <p class="reference-item">[11] H. Holm et al., “A quantitative evaluation of vulnerability prioritization strategies,” in Proc. 10th Int. Conf. Availability, Rel. Secur. (ARES), 2015, pp. 248–255.</p>
    <p class="reference-item">[12] S. Fenz, J. Heurix, T. Neubauer, and W. Pechstein, “Current state of information security risk assessment,” Inf. Comput. Secur., vol. 22, no. 4, pp. 310–330, 2014.</p>
    <p class="reference-item">[13] P. Runeson et al., “Detection of duplicate defect reports using natural language processing,” in Proc. 29th Int. Conf. Softw. Eng. (ICSE), 2007, pp. 499–510.</p>
    <p class="reference-item">[14] X. Wang et al., “An approach to detecting duplicate bug reports using natural language and execution information,” in Proc. 30th Int. Conf. Softw. Eng. (ICSE), 2008, pp. 461–470.</p>
    <p class="reference-item">[15] C. Sun et al., “Towards more accurate retrieval of duplicate bug reports,” in Proc. 26th IEEE/ACM Int. Conf. Autom. Softw. Eng. (ASE), 2011, pp. 253–262.</p>
    <p class="reference-item">[16] OWASP Foundation, “OWASP DefectDojo: Vulnerability Management Platform Documentation,” 2024. [Online]. Available: https://defectdojo.github.io/django-DefectDojo</p>
    <p class="reference-item">[17] Greenbone AG, “Greenbone Community Edition Architecture and Manual,” 2024. [Online]. Available: https://docs.greenbone.net</p>
    <p class="reference-item">[18] Tenable Inc., “Tenable Nessus User Guide and Prioritization Architecture,” 2024. [Online]. Available: https://docs.tenable.com/nessus</p>
  </div>`;

const refStartTag = '<!-- REFERENCES SECTION: Balanced Two Columns on Final Page -->';
const refEndTag = '</body>';
const refStartIndex = pdfContent.indexOf(refStartTag);
const refEndIndex = pdfContent.indexOf(refEndTag);

if (refStartIndex !== -1 && refEndIndex !== -1) {
  pdfContent = pdfContent.substring(0, refStartIndex) + newReferencesHtml + '\n\n' + pdfContent.substring(refEndIndex);
}

fs.writeFileSync('paper/experiments/build_pdf.js', pdfContent, 'utf8');
console.log('build_pdf.js successfully updated with remapped citations and references.');

// 2. Update build_docx.js
let docxContent = fs.readFileSync('paper/experiments/build_docx.js', 'utf8');
for (let oldNum = 1; oldNum <= 18; oldNum++) {
  const newNum = mapping[oldNum];
  const regex = new RegExp(`\\[${oldNum}\\]`, 'g');
  docxContent = docxContent.replace(regex, `___CITE_${newNum}___`);
}
for (let newNum = 1; newNum <= 18; newNum++) {
  const regex = new RegExp(`___CITE_${newNum}___`, 'g');
  docxContent = docxContent.replace(regex, `[${newNum}]`);
}

// Update the references list in build_docx.js
const newDocxRefs = `        // Heading 1: REFERENCES
        new Paragraph({
          style: 'Heading1',
          children: [new TextRun({ text: 'REFERENCES', smallCaps: true })]
        }),

        new Paragraph({
          style: 'ReferencesText',
          text: '[1] National Institute of Standards and Technology (NIST), "National Vulnerability Database (NVD)," U.S. Department of Commerce, 2024. Available: https://nvd.nist.gov'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[2] FIRST, "Common Vulnerability Scoring System v3.1: Specification Document," Forum of Incident Response and Security Teams, 2019. Available: https://www.first.org/cvss/v3.1/specification-document'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[3] L. Allodi and F. Massacci, "Comparing vulnerability severity and exploits using case-control studies," ACM Trans. Inf. Syst. Secur., vol. 17, no. 1, pp. 1–20, Aug. 2014.'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[4] J. Spring et al., "Time to change the CVSS?," IEEE Secur. Privacy, vol. 19, no. 2, pp. 74–78, Mar.–Apr. 2021.'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[5] J. Jacobs et al., "Exploit Prediction Scoring System (EPSS)," Digit. Threats: Res. Pract., vol. 2, no. 3, pp. 1–17, 2021.'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[6] The MITRE Corporation, "Common Weakness Enumeration (CWE): A Community-Developed List of Software Weakness Types," 2024. Available: https://cwe.mitre.org'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[7] Cybersecurity and Infrastructure Security Agency (CISA), "Known Exploited Vulnerabilities Catalog," CISA, 2021. Available: https://www.cisa.gov/known-exploited-vulnerabilities-catalog'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[8] S. Frei, M. May, B. Stiller, and U. Fiedler, "Large-scale modeling of software vulnerabilities," ACM SIGCOMM Comput. Commun. Rev., vol. 36, no. 4, pp. 131–142, 2006.'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[9] M. Bozorgi, L. K. Saul, S. Savage, and G. M. Voelker, "Beyond heuristics: Learning to classify vulnerabilities and predict exploits," in Proc. 16th ACM SIGKDD Int. Conf. Knowl. Discov. Data Min., 2010, pp. 105–114.'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[10] H. Fang et al., "Predicting exploits in the wild: A machine learning approach," in Proc. 27th ACM Conf. Comput. Commun. Secur. (CCS), 2020, pp. 1–14.'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[11] H. Holm et al., "A quantitative evaluation of vulnerability prioritization strategies," in Proc. 10th Int. Conf. Availability, Rel. Secur. (ARES), 2015, pp. 248–255.'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[12] S. Fenz, J. Heurix, T. Neubauer, and W. Pechstein, "Current state of information security risk assessment," Inf. Comput. Secur., vol. 22, no. 4, pp. 310–330, 2014.'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[13] P. Runeson et al., "Detection of duplicate defect reports using natural language processing," in Proc. 29th Int. Conf. Softw. Eng. (ICSE), 2007, pp. 499–510.'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[14] X. Wang et al., "An approach to detecting duplicate bug reports using natural language and execution information," in Proc. 30th Int. Conf. Softw. Eng. (ICSE), 2008, pp. 461–470.'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[15] C. Sun et al., "Towards more accurate retrieval of duplicate bug reports," in Proc. 26th IEEE/ACM Int. Conf. Autom. Softw. Eng. (ASE), 2011, pp. 253–262.'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[16] OWASP Foundation, "OWASP DefectDojo: Vulnerability Management Platform Documentation," 2024. Available: https://defectdojo.github.io/django-DefectDojo'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[17] Greenbone AG, "Greenbone Community Edition Architecture and Manual," 2024. Available: https://docs.greenbone.net'
        }),
        new Paragraph({
          style: 'ReferencesText',
          text: '[18] Tenable Inc., "Tenable Nessus User Guide and Prioritization Architecture," 2024. Available: https://docs.tenable.com/nessus'
        })`;

const docxRefStart = '// Heading 1: REFERENCES';
const docxRefEnd = ']\n    }\n  ]\n});';
const docxStartIndex = docxContent.indexOf(docxRefStart);
const docxEndIndex = docxContent.indexOf(docxRefEnd);

if (docxStartIndex !== -1 && docxEndIndex !== -1) {
  docxContent = docxContent.substring(0, docxStartIndex) + newDocxRefs + '\n      ' + docxContent.substring(docxEndIndex);
}

fs.writeFileSync('paper/experiments/build_docx.js', docxContent, 'utf8');
console.log('build_docx.js successfully updated with remapped citations and references.');
