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

const oldRefs = {
  1: 'FIRST, “Common Vulnerability Scoring System v3.1: Specification Document,” Forum of Incident Response and Security Teams, 2019. [Online]. Available: https://www.first.org/cvss/v3.1/specification-document',
  2: 'L. Allodi and F. Massacci, “Comparing vulnerability severity and exploits using case-control studies,” ACM Trans. Inf. Syst. Secur., vol. 17, no. 1, pp. 1–20, Aug. 2014.',
  3: 'J. Spring et al., “Time to change the CVSS?,” IEEE Secur. Privacy, vol. 19, no. 2, pp. 74–78, Mar.–Apr. 2021.',
  4: 'S. Frei, M. May, B. Stiller, and U. Fiedler, “Large-scale modeling of software vulnerabilities,” ACM SIGCOMM Comput. Commun. Rev., vol. 36, no. 4, pp. 131–142, 2006.',
  5: 'J. Jacobs et al., “Exploit Prediction Scoring System (EPSS),” Digit. Threats: Res. Pract., vol. 2, no. 3, pp. 1–17, 2021.',
  6: 'H. Fang et al., “Predicting exploits in the wild: A machine learning approach,” in Proc. 27th ACM Conf. Comput. Commun. Secur. (CCS), 2020, pp. 1–14.',
  7: 'M. Bozorgi, L. K. Saul, S. Savage, and G. M. Voelker, “Beyond heuristics: Learning to classify vulnerabilities and predict exploits,” in Proc. 16th ACM SIGKDD Int. Conf. Knowl. Discov. Data Min., 2010, pp. 105–114.',
  8: 'H. Holm et al., “A quantitative evaluation of vulnerability prioritization strategies,” in Proc. 10th Int. Conf. Availability, Rel. Secur. (ARES), 2015, pp. 248–255.',
  9: 'S. Fenz, J. Heurix, T. Neubauer, and W. Pechstein, “Current state of information security risk assessment,” Inf. Comput. Secur., vol. 22, no. 4, pp. 310–330, 2014.',
  10: 'Cybersecurity and Infrastructure Security Agency (CISA), “Known Exploited Vulnerabilities Catalog,” CISA, 2021. [Online]. Available: https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
  11: 'P. Runeson et al., “Detection of duplicate defect reports using natural language processing,” in Proc. 29th Int. Conf. Softw. Eng. (ICSE), 2007, pp. 499–510.',
  12: 'X. Wang et al., “An approach to detecting duplicate bug reports using natural language and execution information,” in Proc. 30th Int. Conf. Softw. Eng. (ICSE), 2008, pp. 461–470.',
  13: 'C. Sun et al., “Towards more accurate retrieval of duplicate bug reports,” in Proc. 26th IEEE/ACM Int. Conf. Autom. Softw. Eng. (ASE), 2011, pp. 253–262.',
  14: 'OWASP Foundation, “OWASP DefectDojo: Vulnerability Management Platform Documentation,” 2024. [Online]. Available: https://defectdojo.github.io/django-DefectDojo',
  15: 'Greenbone AG, “Greenbone Community Edition Architecture and Manual,” 2024. [Online]. Available: https://docs.greenbone.net',
  16: 'Tenable Inc., “Tenable Nessus User Guide and Prioritization Architecture,” 2024. [Online]. Available: https://docs.tenable.com/nessus',
  17: 'National Institute of Standards and Technology (NIST), “National Vulnerability Database (NVD),” U.S. Department of Commerce, 2024. [Online]. Available: https://nvd.nist.gov',
  18: 'The MITRE Corporation, “Common Weakness Enumeration (CWE): A Community-Developed List of Software Weakness Types,” 2024. [Online]. Available: https://cwe.mitre.org'
};

const newRefs = {};
for (const [oldNum, newNum] of Object.entries(mapping)) {
  newRefs[newNum] = oldRefs[oldNum];
}

console.log('New References List in Strict Citation Order:');
for (let i = 1; i <= 18; i++) {
  console.log(`[${i}] ${newRefs[i]}`);
}
