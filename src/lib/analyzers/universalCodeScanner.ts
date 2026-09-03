import { Finding } from '../../types/review';
import { getEvidenceForCwe } from '../evidence/registry';

export function scanSourceCode(code: string, fileName: string = 'code.py'): Finding[] {
  const findings: Finding[] = [];
  const lines = code.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    // -------------------------------------------------------------
    // 1. Secrets, Passwords & API Tokens (CWE-798)
    // -------------------------------------------------------------

    // Check if the assignment reads from an environment variable (e.g. process.env, os.environ, getenv) - SAFE
    const isFromEnv = /process\.env|os\.environ|os\.getenv|config\.|secret_manager/i.test(lineText);

    if (!isFromEnv) {
      // 1A. Database Connection Strings with embedded credentials
      const dbUriMatch = lineText.match(/(postgres|postgresql|mongodb|mongodb\+srv|mysql|redis):\/\/[^:\s'"]+:([^@\s'"]+)@[^\s'"]+/i);
      if (dbUriMatch) {
        findings.push({
          id: `sec-dburi-${lineNum}`,
          reviewId: '',
          title: 'Embedded Database Credentials in Connection String',
          description: `Line ${lineNum} exposes an embedded database password inside a literal connection URI ("${trimmed}").`,
          category: 'secrets',
          severity: 'critical',
          confidence: 99,
          confidenceReason: 'Database connection URI contains explicit authentication credentials.',
          file: fileName,
          lineStart: lineNum,
          lineEnd: lineNum,
          vulnerableSnippet: trimmed,
          recommendedSnippet: `// Load connection URI from runtime environment\nconst DATABASE_URL = process.env.DATABASE_URL;`,
          simpleExplanation: {
            analogy: 'Imagine shipping a safe to a customer with the combination permanently engraved onto the handle. Anyone who gets hold of the code has instant administrative control over the entire database.',
            whyCare: 'Attackers scanning code repositories can immediately access, dump, or delete production data.',
            realWorldImpact: ['Full database compromise', 'Unauthorized data exfiltration', 'Ransomware risk']
          },
          technicalExplanation: {
            cweId: 'CWE-798',
            cweTitle: 'CWE-798: Use of Hard-coded Credentials',
            mechanism: 'Plaintext URI contains unencrypted database user credentials.',
            attackSurface: ['Source code repos', 'Build logs', 'Compiled bundles']
          },
          remediation: {
            whatChanged: 'Removed hardcoded database URI and ingested connection string from environment variables.',
            whyBetter: 'Protects database cluster credentials from source code exposure.',
            additionalSteps: 'Ensure DATABASE_URL is added to your secure .env and omitted from git.',
            lineExplanations: []
          },
          references: getEvidenceForCwe('CWE-798'),
          quiz: [
            {
              id: `q-dburi-${lineNum}`,
              findingId: `sec-dburi-${lineNum}`,
              question: 'What is the recommended practice for storing production database connection URIs?',
              type: 'fix-selection',
              category: 'fix',
              options: [
                { id: 'opt-db1', text: 'Store them in environment variables or cloud secrets managers', isCorrect: true },
                { id: 'opt-db2', text: 'Hardcode them in the main server file', isCorrect: false },
                { id: 'opt-db3', text: 'Write them into a comment at the top of the file', isCorrect: false },
                { id: 'opt-db4', text: 'Store them in a public JSON file', isCorrect: false }
              ],
              explanation: 'Secrets should always be decoupled from source code and ingested through secure runtime environment variables.'
            }
          ],
          status: 'unresolved'
        });
      }

      // 1B. Known Vendor Tokens (Stripe, AWS, GitHub, Google, OpenAI, Slack)
      const isVendorToken = 
        /(sk_live_[a-zA-Z0-9_\-]{16,}|sk_test_[a-zA-Z0-9_\-]{16,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|AIza[0-9A-Za-z-_]{35}|xox[baprs]-[0-9a-zA-Z-]+)/i.test(lineText);
      if (isVendorToken) {
        findings.push({
          id: `sec-vendor-${lineNum}`,
          reviewId: '',
          title: 'Exposed Vendor API Secret Token',
          description: `Line ${lineNum} contains an exposed API token or cloud secret key ("${trimmed}").`,
          category: 'secrets',
          severity: 'critical',
          confidence: 99,
          confidenceReason: 'Matches live vendor API key format.',
          file: fileName,
          lineStart: lineNum,
          lineEnd: lineNum,
          vulnerableSnippet: trimmed,
          recommendedSnippet: `const API_KEY = process.env.API_KEY || "";`,
          simpleExplanation: {
            analogy: 'Imagine printing your credit card number on a business flyer. Automated web scrapers search code 24/7 for live API tokens.',
            whyCare: 'Exposed tokens lead to high cloud compute bills, data leaks, and service disruption.',
            realWorldImpact: ['Financial charges from API abuse', 'API rate limit exhaustion', 'Data compromise']
          },
          technicalExplanation: {
            cweId: 'CWE-798',
            cweTitle: 'CWE-798: Use of Hard-coded Credentials',
            mechanism: 'Static secret token embedded in code.',
            attackSurface: ['Public git repositories', 'CI/CD pipeline artifacts']
          },
          remediation: {
            whatChanged: 'Replaced static key with environment variable lookup.',
            whyBetter: 'Keys can be revoked and rotated instantly without code modifications.',
            additionalSteps: 'Revoke the exposed key immediately in your vendor console.',
            lineExplanations: []
          },
          references: getEvidenceForCwe('CWE-798'),
          quiz: [
            {
              id: `q-vendor-${lineNum}`,
              findingId: `sec-vendor-${lineNum}`,
              question: 'If you accidentally commit an API key to GitHub, what must you do first?',
              type: 'mcq',
              category: 'reasoning',
              options: [
                { id: 'opt-v1', text: 'Immediately revoke/rotate the key in the vendor dashboard', isCorrect: true },
                { id: 'opt-v2', text: 'Delete the line in a new commit', isCorrect: false },
                { id: 'opt-v3', text: 'Rename the file', isCorrect: false },
                { id: 'opt-v4', text: 'Do nothing', isCorrect: false }
              ],
              explanation: 'Past commits preserve deleted code. The secret must be revoked in the vendor dashboard.'
            }
          ],
          status: 'unresolved'
        });
      }

      // 1C. Hardcoded Password Assignment
      const isPasswordAssignment = 
        /(password|passwd|pwd|db_pass|db_password|admin_password)\s*[:=]\s*["']([^"']{2,})["']/i.test(lineText) &&
        !lineText.includes('WHERE') &&
        !/(password|passwd)\s*[:=]\s*["'](\{[^}]+\}|\$\{[^}]+\})["']/i.test(lineText);
      if (isPasswordAssignment && !dbUriMatch) {
        findings.push({
          id: `sec-pwd-${lineNum}`,
          reviewId: '',
          title: 'Hard-Coded Password / Credential in Source Code',
          description: `Line ${lineNum} assigns a literal plaintext password in code ("${trimmed}").`,
          category: 'secrets',
          severity: 'critical',
          confidence: 97,
          confidenceReason: 'Variable assignment embeds plaintext password string.',
          file: fileName,
          lineStart: lineNum,
          lineEnd: lineNum,
          vulnerableSnippet: trimmed,
          recommendedSnippet: lineText.includes('password="') || lineText.includes("password = '")
            ? `password = os.environ.get("DB_PASSWORD", "")`
            : `const password = process.env.DB_PASSWORD || "";`,
          simpleExplanation: {
            analogy: 'Think about writing your ATM PIN on the front of your wallet. Anyone who gets the wallet can immediately see the PIN.',
            whyCare: 'Anyone reading the code gains instant unauthorized access to the database or admin account.',
            realWorldImpact: ['Unauthorized database or account access', 'Immediate data exposure or deletion']
          },
          technicalExplanation: {
            cweId: 'CWE-798',
            cweTitle: 'CWE-798: Use of Hard-coded Credentials',
            mechanism: 'Literal credentials in program files bypass external secret controls.',
            attackSurface: ['Source code repos', 'Memory dumps', 'Screenshots']
          },
          remediation: {
            whatChanged: 'Replaced plaintext string with environment variable lookup.',
            whyBetter: 'Keeps credentials out of version control and permits secret rotation.',
            additionalSteps: 'Store password in a secured .env or cloud secret vault.',
            lineExplanations: []
          },
          references: getEvidenceForCwe('CWE-798'),
          quiz: [
            {
              id: `q-pwd-${lineNum}`,
              findingId: `sec-pwd-${lineNum}`,
              question: 'Why is hardcoding a password in source code considered a critical security flaw?',
              type: 'mcq',
              category: 'identification',
              options: [
                { id: 'opt-pw1', text: 'Because anyone with access to the source code can view and abuse the password', isCorrect: true },
                { id: 'opt-pw2', text: 'Because it makes compilers run out of memory', isCorrect: false },
                { id: 'opt-pw3', text: 'Because databases refuse connection from hardcoded strings', isCorrect: false },
                { id: 'opt-pw4', text: 'Because passwords can only be written in uppercase', isCorrect: false }
              ],
              explanation: 'Hardcoded passwords cannot be kept secret once code is shared, committed, or deployed.'
            }
          ],
          status: 'unresolved'
        });
      }

      // 1D. Hardcoded Generic API Key / Secret Variable
      const isGenericSecretVar = 
        /(api_key|apikey|secret_key|secret|token|auth_token|jwt_secret)\s*[:=]\s*["']([a-zA-Z0-9_\-]{6,})["']/i.test(lineText) &&
        !isPasswordAssignment && !isVendorToken;
      if (isGenericSecretVar) {
        findings.push({
          id: `sec-key-${lineNum}`,
          reviewId: '',
          title: 'Hard-Coded Secret Key / Authentication Token',
          description: `Line ${lineNum} assigns a static secret key or token directly in source code ("${trimmed}").`,
          category: 'secrets',
          severity: 'critical',
          confidence: 95,
          confidenceReason: 'Authentication token assigned to literal string.',
          file: fileName,
          lineStart: lineNum,
          lineEnd: lineNum,
          vulnerableSnippet: trimmed,
          recommendedSnippet: `const API_KEY = process.env.API_KEY; // Loaded from environment`,
          simpleExplanation: {
            analogy: 'Leaving your house key permanently taped to your front door handle with a note that says "For delivery drivers".',
            whyCare: 'Attackers can forge authentication tokens or invoke private backend services.',
            realWorldImpact: ['Forged user authentication sessions', 'Service abuse', 'Data theft']
          },
          technicalExplanation: {
            cweId: 'CWE-798',
            cweTitle: 'CWE-798: Use of Hard-coded Credentials',
            mechanism: 'Cryptographic secret or API token embedded in static program text.',
            attackSurface: ['Public repositories', 'Frontend bundle decompilation']
          },
          remediation: {
            whatChanged: 'Extracted secret key to environment variable.',
            whyBetter: 'Prevents token leakage in source repositories.',
            additionalSteps: 'Store secret in runtime environment.',
            lineExplanations: []
          },
          references: getEvidenceForCwe('CWE-798'),
          quiz: [
            {
              id: `q-key-${lineNum}`,
              findingId: `sec-key-${lineNum}`,
              question: 'Where should API secret keys and JWT secrets be stored in production?',
              type: 'fix-selection',
              category: 'fix',
              options: [
                { id: 'opt-k1', text: 'Secure runtime environment variables or a Secret Manager vault', isCorrect: true },
                { id: 'opt-k2', text: 'In a public git commit', isCorrect: false },
                { id: 'opt-k3', text: 'In client-side JavaScript files', isCorrect: false },
                { id: 'opt-k4', text: 'In HTML comment tags', isCorrect: false }
              ],
              explanation: 'Environment variables and vaults ensure secrets never enter source control.'
            }
          ],
          status: 'unresolved'
        });
      }
    }

    // -------------------------------------------------------------
    // 2. SQL Injection (CWE-89)
    // -------------------------------------------------------------
    const isSqlConcat = 
      /(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\s+.*\{[^}]+\}/i.test(lineText) || // Python f-string
      /f["']\s*(SELECT|INSERT|UPDATE|DELETE|DROP)\s+/i.test(lineText) || // Python f-string query
      /`\s*(SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*\$\{[^}]+\}/i.test(lineText) || // JS template literal
      /(SELECT|INSERT|UPDATE|DELETE)\s+.*["']\s*\+\s*[a-zA-Z_]/i.test(lineText) || // String concatenation
      /(SELECT|INSERT|UPDATE|DELETE)\s+.*["']\s*%\s*[a-zA-Z_]/i.test(lineText) || // Python % formatting
      /cursor\.execute\s*\(\s*f["']/i.test(lineText) || // Python cursor.execute(f"...")
      /db\.query\s*\(\s*`.*(SELECT|INSERT|UPDATE|DELETE)/i.test(lineText); // JS db.query(`...`)

    if (isSqlConcat) {
      findings.push({
        id: `inj-sql-${lineNum}`,
        reviewId: '',
        title: 'SQL Injection Risk via Dynamic String Interpolation',
        description: `Line ${lineNum} dynamically injects raw variables directly into an SQL command string without parameterization ("${trimmed}").`,
        category: 'injection',
        severity: 'critical',
        confidence: 98,
        confidenceReason: 'SQL statement contains unescaped variable concatenation or format string syntax.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: lineText.includes('f"') || lineText.includes("f'") 
          ? `query = "SELECT * FROM table WHERE col = %s"\ncursor.execute(query, (user_val,))`
          : `const query = "SELECT * FROM table WHERE col = ?";\ndb.query(query, [user_val]);`,
        simpleExplanation: {
          analogy: 'Imagine ordering a custom printed t-shirt with your name, but when you type "Bob\'; DROP TABLE orders; --" into the name box, the printing machine interprets it as a command and deletes all factory records.',
          whyCare: 'An attacker can supply malicious input (like "\' OR \'1\'=\'1") to bypass authentication or dump customer tables.',
          realWorldImpact: ['Full database dumping', 'Authentication bypass without valid credentials', 'Arbitrary table drops']
        },
        technicalExplanation: {
          cweId: 'CWE-89',
          cweTitle: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
          mechanism: 'Untrusted user input is directly concatenated into SQL statement, altering database AST parser logic.',
          attackSurface: ['Login forms', 'Search inputs', 'URL query parameters']
        },
        remediation: {
          whatChanged: 'Replaced dynamic string interpolation with parameterized queries (%s or ?). The database driver sends the command structure and parameters in separate channels.',
          whyBetter: 'The database treats input strictly as literal values, neutralizing all SQL syntax inside the input.',
          additionalSteps: 'Never concatenate SQL queries with + or template literals.',
          lineExplanations: []
        },
        references: getEvidenceForCwe('CWE-89'),
        quiz: [
          {
            id: `q-sqli-${lineNum}`,
            findingId: `inj-sql-${lineNum}`,
            question: 'What is the primary recommended defense against SQL injection according to OWASP and NIST?',
            type: 'fix-selection',
            category: 'fix',
            options: [
              { id: 'opt-sqli1', text: 'Using parameterized queries (prepared statements)', isCorrect: true },
              { id: 'opt-sqli2', text: 'Client-side regular expression validation', isCorrect: false },
              { id: 'opt-sqli3', text: 'Encoding all SQL queries in Base64', isCorrect: false },
              { id: 'opt-sqli4', text: 'Deleting all spaces in the input string', isCorrect: false }
            ],
            explanation: 'Parameterized queries ensure the SQL engine processes user parameters strictly as data, not executable code.'
          }
        ],
        status: 'unresolved'
      });
    }

    // -------------------------------------------------------------
    // 3. Command Injection / Remote Code Execution (CWE-78 / CWE-94)
    // -------------------------------------------------------------
    const isCommandInjection = 
      /\bos\.system\s*\(/i.test(lineText) ||
      /\bos\.popen\s*\(/i.test(lineText) ||
      /\bsubprocess\.(call|Popen|run)\s*\(.*shell\s*=\s*True/i.test(lineText) ||
      /\b(child_process\.)?(exec|execSync)\s*\(/i.test(lineText) ||
      /\beval\s*\(/i.test(lineText) ||
      /\bRuntime\.getRuntime\(\)\.exec\s*\(/i.test(lineText);

    if (isCommandInjection) {
      findings.push({
        id: `inj-cmd-${lineNum}`,
        reviewId: '',
        title: 'Operating System Command Injection / Arbitrary Execution',
        description: `Line ${lineNum} invokes an operating system shell command or eval parser ("${trimmed}"). If user-controlled input reaches this function, attackers can execute arbitrary shell commands.`,
        category: 'injection',
        severity: 'critical',
        confidence: 96,
        confidenceReason: 'Direct invocation of OS shell executor or eval function.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: lineText.includes('os.system') || lineText.includes('subprocess')
          ? `import subprocess\nsubprocess.run(["cmd_name", arg1, arg2], check=True, shell=False)`
          : `// Use child_process.execFile with argument array instead of raw shell string\nconst { execFile } = require("child_process");\nexecFile("command", [arg1, arg2], (err, stdout) => { ... });`,
        simpleExplanation: {
          analogy: 'Imagine handing a delivery driver your signed checkbook and saying "Write whatever you want for payment." An OS command runner allows anyone who can feed it text to execute any system command on your server.',
          whyCare: 'Attackers can execute shell commands to download malware, read server files, or open a reverse shell.',
          realWorldImpact: ['Complete server takeover (RCE)', 'Installation of cryptominers or backdoors', 'Host filesystem access']
        },
        technicalExplanation: {
          cweId: 'CWE-78',
          cweTitle: 'CWE-78: Improper Neutralization of Special Elements used in an OS Command',
          mechanism: 'Input passed to shell interpreter allows command chaining operators (;, &&, |, `) to run arbitrary binaries.',
          attackSurface: ['File upload handlers', 'System utility endpoints']
        },
        remediation: {
          whatChanged: 'Replaced shell execution with safe argument-array execution (shell=False or execFile).',
          whyBetter: 'The OS passes arguments directly to the binary without spawning a command shell.',
          additionalSteps: 'Avoid calling OS commands from web applications whenever a native library exists.',
          lineExplanations: []
        },
        references: getEvidenceForCwe('CWE-78'),
        quiz: [
          {
            id: `q-cmd-${lineNum}`,
            findingId: `inj-cmd-${lineNum}`,
            question: 'Why is passing user input to os.system() or child_process.exec() dangerous?',
            type: 'reasoning',
            category: 'reasoning',
            options: [
              { id: 'opt-cmd1', text: 'Attackers can inject shell operators (like ; or |) to run arbitrary system commands', isCorrect: true },
              { id: 'opt-cmd2', text: 'It slows down web network sockets', isCorrect: false },
              { id: 'opt-cmd3', text: 'It requires root permissions on all operating systems', isCorrect: false },
              { id: 'opt-cmd4', text: 'It deletes browser cookies', isCorrect: false }
            ],
            explanation: 'Shell interpreters evaluate operators like ; or | as command separators, running attacker-appended commands with the server\'s privileges.'
          }
        ],
        status: 'unresolved'
      });
    }

    // -------------------------------------------------------------
    // 4. Cross-Site Scripting (XSS - CWE-79)
    // -------------------------------------------------------------
    const isXss = 
      /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:/i.test(lineText) ||
      /\.innerHTML\s*=\s*/i.test(lineText) ||
      /document\.write\s*\(/i.test(lineText);

    if (isXss) {
      findings.push({
        id: `inj-xss-${lineNum}`,
        reviewId: '',
        title: 'Cross-Site Scripting (XSS) via Unsafe HTML Injection',
        description: `Line ${lineNum} directly inserts raw HTML or markup into the DOM ("${trimmed}"). If untrusted input is included, attackers can inject malicious JavaScript.`,
        category: 'security',
        severity: 'high',
        confidence: 94,
        confidenceReason: 'Direct usage of innerHTML or dangerouslySetInnerHTML bypasses framework auto-escaping.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: `// Use safe textContent or sanitize using DOMPurify\nimport DOMPurify from 'dompurify';\n<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />`,
        simpleExplanation: {
          analogy: 'Imagine allowing anyone to stick uninspected stickers onto your store front that can secretly record visitor credit card pin numbers. Unsafe HTML allows external attackers to run scripts in your visitors\' browsers.',
          whyCare: 'Attackers can steal session cookies, capture keystrokes, or redirect visitors to malicious clones.',
          realWorldImpact: ['Session hijacking via stolen cookies', 'Defacement of application UI', 'Phishing credential prompts']
        },
        technicalExplanation: {
          cweId: 'CWE-79',
          cweTitle: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
          mechanism: 'Unescaped user data inserted into DOM executes as active JavaScript context.',
          attackSurface: ['Comments', 'User profile bios', 'Search result renders']
        },
        remediation: {
          whatChanged: 'Used safe DOM text setters or sanitized HTML with DOMPurify.',
          whyBetter: 'Strips dangerous tags (<script>, <svg onload>, <img> onerror) while keeping safe markup.',
          additionalSteps: 'Enforce a strict Content Security Policy (CSP).',
          lineExplanations: []
        },
        references: getEvidenceForCwe('CWE-79'),
        quiz: [
          {
            id: `q-xss-${lineNum}`,
            findingId: `inj-xss-${lineNum}`,
            question: 'What is the primary danger of using element.innerHTML with user-supplied input?',
            type: 'mcq',
            category: 'identification',
            options: [
              { id: 'opt-xss1', text: 'The browser can execute malicious JavaScript injected by attackers', isCorrect: true },
              { id: 'opt-xss2', text: 'It prevents fonts from rendering', isCorrect: false },
              { id: 'opt-xss3', text: 'It disconnects CSS stylesheets', isCorrect: false },
              { id: 'opt-xss4', text: 'It increases database query times', isCorrect: false }
            ],
            explanation: 'innerHTML treats string contents as HTML and script elements, enabling Cross-Site Scripting (XSS).'
          }
        ],
        status: 'unresolved'
      });
    }

    // -------------------------------------------------------------
    // 5. Broken Cryptography & Weak Hashing (CWE-327)
    // -------------------------------------------------------------
    const isWeakCrypto = 
      /hashlib\.(md5|sha1)\s*\(/i.test(lineText) ||
      /crypto\.createHash\s*\(\s*["'](md5|sha1)["']\s*\)/i.test(lineText);

    if (isWeakCrypto) {
      findings.push({
        id: `crypto-weak-${lineNum}`,
        reviewId: '',
        title: 'Use of Cryptographically Broken Hash Algorithm (MD5/SHA1)',
        description: `Line ${lineNum} utilizes a broken hashing algorithm (MD5 or SHA1) for security operations ("${trimmed}").`,
        category: 'cryptography',
        severity: 'high',
        confidence: 96,
        confidenceReason: 'MD5 and SHA1 suffer from proven cryptographic collision attacks.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: `// Use SHA-256 for integrity or Argon2id/bcrypt for password hashing\nimport hashlib\nhashlib.sha256(data).hexdigest()`,
        simpleExplanation: {
          analogy: 'Using a padlock from 1950 whose master key pattern is published online. MD5 and SHA1 can be cracked or generated with identical collision hashes using standard GPUs.',
          whyCare: 'Attackers can forge certificates, generate hash collisions, and crack password hashes in seconds.',
          realWorldImpact: ['Hash collision attacks', 'Trivial rainbow table cracking', 'Compliance failure (NIST, FIPS)']
        },
        technicalExplanation: {
          cweId: 'CWE-327',
          cweTitle: 'CWE-327: Use of a Broken or Risky Cryptographic Algorithm',
          mechanism: 'Known collision vulnerabilities in MD5 and SHA1 permit practical certificate and signature forgery.',
          attackSurface: ['Signature verification', 'Password storage', 'Token generation']
        },
        remediation: {
          whatChanged: 'Upgraded to SHA-256 (for checksums) or Argon2id / bcrypt (for authentication passwords).',
          whyBetter: 'Provides collision resistance and cryptographic security compliant with NIST guidelines.',
          additionalSteps: 'Never use fast hashes (MD5, SHA1, SHA256) for password storage; use slow adaptive algorithms like Argon2id.',
          lineExplanations: []
        },
        references: getEvidenceForCwe('CWE-327'),
        quiz: [
          {
            id: `q-crypto-${lineNum}`,
            findingId: `crypto-weak-${lineNum}`,
            question: 'Why does NIST forbid MD5 and SHA1 for security authentication and signature checks?',
            type: 'reasoning',
            category: 'reasoning',
            options: [
              { id: 'opt-cr1', text: 'Because practical collision attacks allow different inputs to produce identical hashes', isCorrect: true },
              { id: 'opt-cr2', text: 'Because they only work on 32-bit computers', isCorrect: false },
              { id: 'opt-cr3', text: 'Because they produce hashes that are too long for database columns', isCorrect: false },
              { id: 'opt-cr4', text: 'Because they require licensing fees', isCorrect: false }
            ],
            explanation: 'MD5 and SHA-1 have proven collision vulnerabilities and should never be used for digital signatures or security verification.'
          }
        ],
        status: 'unresolved'
      });
    }

    // -------------------------------------------------------------
    // 6. Insecure TLS / Certificate Verification Disabled (CWE-295)
    // -------------------------------------------------------------
    const isTlsDisabled = 
      /verify\s*=\s*False/i.test(lineText) ||
      /rejectUnauthorized\s*:\s*false/i.test(lineText) ||
      /NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0['"]?/i.test(lineText);

    if (isTlsDisabled) {
      findings.push({
        id: `tls-disabled-${lineNum}`,
        reviewId: '',
        title: 'Disabled SSL/TLS Certificate Verification',
        description: `Line ${lineNum} explicitly disables SSL/TLS certificate verification ("${trimmed}"). This leaves outgoing requests open to Man-in-the-Middle (MitM) eavesdropping.`,
        category: 'security',
        severity: 'critical',
        confidence: 99,
        confidenceReason: 'Certificate verification flag is explicitly disabled.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: `// Maintain default secure certificate verification\nrequests.get(url, verify=True)`,
        simpleExplanation: {
          analogy: 'Imagine an armored bank courier who agrees to hand millions in cash to anyone wearing a handwritten sticky note saying "I am the bank" without checking their ID badge.',
          whyCare: 'Anyone on the local network or transit ISP can intercept private API tokens and inject modified responses.',
          realWorldImpact: ['Man-in-the-middle credential interception', 'Tampering with outbound API payloads']
        },
        technicalExplanation: {
          cweId: 'CWE-295',
          cweTitle: 'CWE-295: Improper Certificate Validation',
          mechanism: 'Client ignores TLS certificate authenticity checks, trusting self-signed or fraudulent certificates.',
          attackSurface: ['Public Wi-Fi', 'Compromised DNS', 'Proxy servers']
        },
        remediation: {
          whatChanged: 'Enabled strict TLS certificate verification.',
          whyBetter: 'Ensures data is transmitted only to cryptographically verified destinations.',
          additionalSteps: 'Install root CA certificates in your container environment rather than disabling verification.',
          lineExplanations: []
        },
        references: getEvidenceForCwe('CWE-295'),
        quiz: [
          {
            id: `q-tls-${lineNum}`,
            findingId: `tls-disabled-${lineNum}`,
            question: 'What attack is possible when verify=False is set on outgoing HTTP requests?',
            type: 'reasoning',
            category: 'reasoning',
            options: [
              { id: 'opt-tls1', text: 'Man-in-the-Middle (MitM) interception of credentials and payloads', isCorrect: true },
              { id: 'opt-tls2', text: 'SQL injection on the local client', isCorrect: false },
              { id: 'opt-tls3', text: 'Buffer overflow in the Python interpreter', isCorrect: false },
              { id: 'opt-tls4', text: 'Denial of service on the user mouse cursor', isCorrect: false }
            ],
            explanation: 'Disabling verification prevents the client from validating server authenticity, allowing attackers to spoof the server.'
          }
        ],
        status: 'unresolved'
      });
    }

    // -------------------------------------------------------------
    // 7. Insecure Deserialization (CWE-502)
    // -------------------------------------------------------------
    const isInsecureDeserialization = 
      /pickle\.loads?\s*\(/i.test(lineText) ||
      /yaml\.load\s*\(.*Loader\s*=\s*yaml\.Loader\)/i.test(lineText);

    if (isInsecureDeserialization) {
      findings.push({
        id: `deserial-${lineNum}`,
        reviewId: '',
        title: 'Insecure Deserialization of Untrusted Data',
        description: `Line ${lineNum} deserializes objects using unsafe loaders ("${trimmed}"). Malicious serialized payloads can trigger immediate arbitrary code execution.`,
        category: 'security',
        severity: 'critical',
        confidence: 97,
        confidenceReason: 'Unsafe deserializer method invoked directly on input.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: lineText.includes('yaml')
          ? `yaml.safe_load(data) # Uses SafeLoader`
          : `import json\njson.loads(data) # Safe serialization format`,
        simpleExplanation: {
          analogy: 'Accepting an uninspected package through the mail, blindly bringing it into your living room, and pressing a button that automatically unpacks and detonates its contents.',
          whyCare: 'Attackers can construct serialized payloads that execute system shell commands as soon as they are parsed.',
          realWorldImpact: ['Remote code execution (RCE)', 'Instant server compromise']
        },
        technicalExplanation: {
          cweId: 'CWE-502',
          cweTitle: 'CWE-502: Deserialization of Untrusted Data',
          mechanism: 'Python pickle and unsafe YAML loaders execute arbitrary object constructors during unpickling.',
          attackSurface: ['Cookie payloads', 'Message queues', 'Cache deserialization']
        },
        remediation: {
          whatChanged: 'Replaced unsafe deserializer with standard JSON or safe YAML loader (yaml.safe_load).',
          whyBetter: 'Data formats like JSON only represent data structures, not executable code objects.',
          additionalSteps: 'Never deserialize pickle objects from untrusted network sources.',
          lineExplanations: []
        },
        references: getEvidenceForCwe('CWE-502'),
        quiz: [
          {
            id: `q-deserial-${lineNum}`,
            findingId: `deserial-${lineNum}`,
            question: 'Why should Python pickle NEVER be used to deserialize data received over the network?',
            type: 'reasoning',
            category: 'reasoning',
            options: [
              { id: 'opt-ds1', text: 'Because pickle can execute arbitrary Python functions defined in the payload during unpickling', isCorrect: true },
              { id: 'opt-ds2', text: 'Because pickle files are too large for HTTP', isCorrect: false },
              { id: 'opt-ds3', text: 'Because pickle only works on Windows computers', isCorrect: false },
              { id: 'opt-ds4', text: 'Because pickle is not open source', isCorrect: false }
            ],
            explanation: 'Pickle was designed for trusted internal persistence; its protocol allows invoking arbitrary constructors and shell commands.'
          }
        ],
        status: 'unresolved'
      });
    }

    // -------------------------------------------------------------
    // 8. Plaintext Password Checking & Auth Comparison (CWE-256)
    // -------------------------------------------------------------
    const isPlaintextAuth = 
      /if\s*\(?\s*(user(\.|\[["']?)password|user\[\d+\])\s*===?\s*password\s*\)?/i.test(lineText) ||
      /(password|passwd)\s*===?\s*["'][^"']+["']/i.test(lineText);

    if (isPlaintextAuth) {
      findings.push({
        id: `auth-plain-${lineNum}`,
        reviewId: '',
        title: 'Plain-Text Password Comparison (Missing Hash Verification)',
        description: `Line ${lineNum} directly compares passwords using string equality ("${trimmed}"). Passwords should be stored and checked using salted cryptographic hashes.`,
        category: 'authentication',
        severity: 'high',
        confidence: 95,
        confidenceReason: 'Direct equality operator used on password fields without cryptographic hash verification.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: `// Use timing-safe hash comparison\nconst isValid = await bcrypt.compare(password, user.passwordHash);`,
        simpleExplanation: {
          analogy: 'Keeping your house keys in an unlocked shoebox on the porch instead of inside a secure safe.',
          whyCare: 'If a database snapshot is leaked, all user accounts across your platform are compromised immediately.',
          realWorldImpact: ['Total user password compromise on data breach', 'Credential stuffing attacks']
        },
        technicalExplanation: {
          cweId: 'CWE-256',
          cweTitle: 'CWE-256: Plaintext Storage of a Password',
          mechanism: 'Direct string equality indicates passwords are stored unhashed or compared without timing attack protection.',
          attackSurface: ['Database backups', 'Memory inspection']
        },
        remediation: {
          whatChanged: 'Replaced plaintext check with bcrypt / Argon2id cryptographic verification.',
          whyBetter: 'Passwords are never stored in plaintext and hashes cannot be reversed without prohibitive compute cost.',
          additionalSteps: 'Store password hashes using bcrypt with cost factor >= 12 or Argon2id.',
          lineExplanations: []
        },
        references: getEvidenceForCwe('CWE-798'),
        quiz: [
          {
            id: `q-plain-${lineNum}`,
            findingId: `auth-plain-${lineNum}`,
            question: 'What algorithm is mandated by NIST SP 800-63B and OWASP for storing user passwords safely?',
            type: 'fix-selection',
            category: 'fix',
            options: [
              { id: 'opt-pl1', text: 'Salted, slow adaptive hashes like Argon2id, bcrypt, or PBKDF2', isCorrect: true },
              { id: 'opt-pl2', text: 'Plaintext strings in a private file', isCorrect: false },
              { id: 'opt-pl3', text: 'MD5 checksums', isCorrect: false },
              { id: 'opt-pl4', text: 'Base64 string encoding', isCorrect: false }
            ],
            explanation: 'Salted adaptive hashes protect passwords against GPU rainbow tables and offline brute-force cracking.'
          }
        ],
        status: 'unresolved'
      });
    }

    // -------------------------------------------------------------
    // 9. Sensitive Credential Logging (CWE-532)
    // -------------------------------------------------------------
    const isSensitiveLog = 
      /(console\.log|print|logger\.(info|debug|error|warn))\s*\(.*(password|passwd|apiKey|api_key|secret|token).*\)/i.test(lineText);

    if (isSensitiveLog) {
      findings.push({
        id: `priv-log-${lineNum}`,
        reviewId: '',
        title: 'Sensitive Credential or Token Logged to Console',
        description: `Line ${lineNum} prints sensitive credentials into standard logging streams ("${trimmed}").`,
        category: 'privacy',
        severity: 'high',
        confidence: 94,
        confidenceReason: 'Logging statement contains direct reference to a password or secret argument.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: `console.log("Authentication attempt for user:", username); // Password redacted`,
        simpleExplanation: {
          analogy: 'Shouting every customer\'s secret PIN into a crowded hallway so your coworkers can write it down in the visitor notebook.',
          whyCare: 'Logs are stored in aggregators (Datadog, CloudWatch, Splunk) where support engineers or contractors can view plaintext passwords.',
          realWorldImpact: ['Plaintext password leakage into monitoring systems', 'Credential theft via log aggregator compromise']
        },
        technicalExplanation: {
          cweId: 'CWE-532',
          cweTitle: 'CWE-532: Insertion of Sensitive Information into Log File',
          mechanism: 'Application streams unredacted credential payloads into standard out or disk logs.',
          attackSurface: ['CloudWatch', 'Sentry logs', 'Shared terminal scrollbacks']
        },
        remediation: {
          whatChanged: 'Removed password from log arguments and recorded only non-sensitive contextual metadata.',
          whyBetter: 'Audit capability is preserved without creating a persistent plaintext credential leak.',
          additionalSteps: 'Install automated log redaction filters or a structured logger that masks "password".',
          lineExplanations: []
        },
        references: getEvidenceForCwe('CWE-532'),
        quiz: [
          {
            id: `q-log-${lineNum}`,
            findingId: `priv-log-${lineNum}`,
            question: 'Why should passwords and API tokens never be included in console.log or print statements?',
            type: 'reasoning',
            category: 'reasoning',
            options: [
              { id: 'opt-lg1', text: 'Because log streams are stored in monitoring tools where unauthorized individuals can read them in plaintext', isCorrect: true },
              { id: 'opt-lg2', text: 'Because it breaks terminal color output', isCorrect: false },
              { id: 'opt-lg3', text: 'Because log statements cannot take strings', isCorrect: false },
              { id: 'opt-lg4', text: 'Because logging takes too much battery power', isCorrect: false }
            ],
            explanation: 'Application logs are often aggregated, indexed, and stored across multiple cloud services with wider access permissions.'
          }
        ],
        status: 'unresolved'
      });
    }

    // -------------------------------------------------------------
    // 10. CORS Wildcard & Insecure Configuration (CWE-942)
    // -------------------------------------------------------------
    const isUnsafeCors = 
      /cors\s*\(\s*\{\s*origin\s*:\s*["']\*["']/i.test(lineText) ||
      /Access-Control-Allow-Origin['"]?\s*[:=]\s*['"]\*['"]/i.test(lineText);

    if (isUnsafeCors) {
      findings.push({
        id: `conf-cors-${lineNum}`,
        reviewId: '',
        title: 'Unrestricted Wildcard CORS Policy (Origin: *)',
        description: `Line ${lineNum} configures Cross-Origin Resource Sharing (CORS) with a wildcard origin ("*"), allowing arbitrary external domains to make cross-origin requests to your API.`,
        category: 'configuration',
        severity: 'medium',
        confidence: 93,
        confidenceReason: 'CORS configuration sets origin to unrestricted wildcard.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: `app.use(cors({\n  origin: ["https://yourdomain.com"],\n  credentials: true\n}));`,
        simpleExplanation: {
          analogy: 'Placing a sign on an office door saying "Anyone on earth can enter and read any memo on any desk, no badge required."',
          whyCare: 'Malicious websites visited by your authenticated users can make requests to your backend and read private user data.',
          realWorldImpact: ['Cross-origin data exfiltration', 'Cross-site request forgery facilitation']
        },
        technicalExplanation: {
          cweId: 'CWE-942',
          cweTitle: 'CWE-942: Permissive Cross-Domain Policy with Untrusted Domains',
          mechanism: 'Broad wildcard Access-Control-Allow-Origin headers allow malicious third-party origins to read API responses.',
          attackSurface: ['Browser-based cross-origin fetch requests']
        },
        remediation: {
          whatChanged: 'Restricted allowed origins to an explicit whitelist of trusted production domains.',
          whyBetter: 'Browsers block malicious third-party origins from reading sensitive API responses.',
          additionalSteps: 'Separate environments: allow localhost in dev mode, verified production domain in deployment.',
          lineExplanations: []
        },
        references: getEvidenceForCwe('CWE-942'),
        quiz: [
          {
            id: `q-cors-${lineNum}`,
            findingId: `conf-cors-${lineNum}`,
            question: 'Why is Access-Control-Allow-Origin: * dangerous for APIs handling private user data?',
            type: 'reasoning',
            category: 'reasoning',
            options: [
              { id: 'opt-cor1', text: 'Any third-party website can make requests through a user\'s browser and read API responses', isCorrect: true },
              { id: 'opt-cor2', text: 'It causes web servers to run out of RAM', isCorrect: false },
              { id: 'opt-cor3', text: 'It deletes DNS A records', isCorrect: false },
              { id: 'opt-cor4', text: 'It prevents mobile users from connecting', isCorrect: false }
            ],
            explanation: 'Wildcard CORS removes the browser\'s Same-Origin Policy protection for that endpoint.'
          }
        ],
        status: 'unresolved'
      });
    }

  });

  return findings;
}
