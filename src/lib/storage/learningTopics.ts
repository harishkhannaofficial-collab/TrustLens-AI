import { LearningTopic } from '../../types/review';

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'hard-coded-secrets',
    slug: 'hard-coded-secrets',
    title: 'Hard-Coded Secrets & API Keys',
    category: 'Secrets & Credentials',
    icon: 'KeyRound',
    difficulty: 'Beginner',
    cwe: 'CWE-798',
    description: 'Why embedding passwords, database credentials, and cloud API keys directly into source code leads to catastrophic leaks and how to manage runtime secrets.',
    steps: {
      discover: 'AI tools commonly output code with dummy strings like "admin123" or placeholder keys that developers accidentally commit or leave in production.',
      understand: {
        summary: 'Source code is distributed, copied, committed, and compiled. Secrets embedded in code are essentially public.',
        analogy: 'Imagine writing your bank ATM PIN with a Sharpie on the front of your debit card. Anyone who sees the card has your money.',
        whyCare: 'Automated GitHub scanners find and drain API tokens within 4 minutes of a public commit.'
      },
      see: {
        unsafeCode: `const DB_PASSWORD = "admin123";\nconst STRIPE_KEY = "sk_live_9988776655443322";`,
        problemLine: 1,
        explanation: 'Strings assigned directly to constants in source code are committed to git and bundled into artifacts.'
      },
      practice: {
        challengePrompt: 'Refactor this database connection string so it reads the credentials from environment variables:',
        sampleCode: `const dbUrl = "postgres://user:superSecret@db.internal:5432/main";`,
        hint: 'Use process.env.DATABASE_URL',
        solution: `const dbUrl = process.env.DATABASE_URL;`
      },
      verify: {
        question: 'Why does deleting an API key in a subsequent Git commit fail to protect it?',
        options: [
          'Because Git crashes when secrets are deleted',
          'Because Git history preserves every previous commit permanently unless rewritten',
          'Because computers make backups every 5 seconds',
          'Because keys are stored in the monitor display'
        ],
        correctIndex: 1,
        explanation: 'Git is a version control ledger. Attackers specifically scan git commit logs (git log -p) to find secrets deleted in subsequent commits.'
      },
      apply: 'Always add .env to your .gitignore before initiating git, and use cloud secret stores in production.'
    },
    references: [
      {
        title: 'CWE-798: Use of Hard-coded Credentials',
        organization: 'MITRE CWE',
        url: 'https://cwe.mitre.org/data/definitions/798.html',
        level: 'LEVEL_A'
      },
      {
        title: 'OWASP Secrets Management Cheat Sheet',
        organization: 'OWASP Foundation',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html',
        level: 'LEVEL_C'
      }
    ]
  },
  {
    id: 'sql-injection',
    slug: 'sql-injection',
    title: 'SQL Injection Prevention',
    category: 'Injection Vulnerabilities',
    icon: 'Database',
    difficulty: 'Intermediate',
    cwe: 'CWE-89',
    description: 'Understanding how attackers manipulate backend SQL queries through unescaped user inputs, and why parameterized queries are the ultimate defense.',
    steps: {
      discover: 'AI models often generate SQL queries using string formatting (f-strings in Python or template literals in JavaScript) for brevity, which introduces critical SQL injection.',
      understand: {
        summary: 'When data and executable code are concatenated into the same string, the database parser cannot tell which parts were intended by the developer and which parts were injected by the attacker.',
        analogy: 'Imagine ordering a custom mug with your name, but when you enter "Bob; DROP TABLE customers;", the factory robot interprets the text as machine instructions and destroys the factory database.',
        whyCare: 'Attackers can bypass logins, extract all customer records, modify sensitive account balances, or execute administrative commands.'
      },
      see: {
        unsafeCode: `query = f"SELECT * FROM users WHERE username = '{username}'"\ncursor.execute(query)`,
        problemLine: 1,
        explanation: 'The username parameter is pasted directly into the SQL string. If username is "\' OR 1=1 --", the condition is always true.'
      },
      practice: {
        challengePrompt: 'Rewrite this search query to use safe query parameters:',
        sampleCode: `db.query("SELECT * FROM items WHERE name = '" + req.query.name + "'");`,
        hint: 'Use the placeholder ? and pass parameters in an array',
        solution: `db.query("SELECT * FROM items WHERE name = ?", [req.query.name]);`
      },
      verify: {
        question: 'Which technique is considered the primary, fail-safe defense against SQL injection by OWASP?',
        options: [
          'Filtering out quotes with JavaScript regex',
          'Parameterized queries (Prepared Statements)',
          'Converting all inputs to uppercase',
          'Only allowing GET requests'
        ],
        correctIndex: 1,
        explanation: 'Prepared statements send query structure and parameters in distinct channels, rendering injected SQL syntax inert.'
      },
      apply: 'Always use parameterized placeholders (%s, ?, or :param) or a modern ORM (Prisma, Drizzle, SQLAlchemy) with parameter bindings.'
    },
    references: [
      {
        title: 'CWE-89: SQL Injection',
        organization: 'MITRE CWE',
        url: 'https://cwe.mitre.org/data/definitions/89.html',
        level: 'LEVEL_A'
      },
      {
        title: 'OWASP SQL Injection Prevention Cheat Sheet',
        organization: 'OWASP',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
        level: 'LEVEL_C'
      }
    ]
  },
  {
    id: 'command-injection',
    slug: 'command-injection',
    title: 'Operating System Command Injection (RCE)',
    category: 'Injection Vulnerabilities',
    icon: 'Terminal',
    difficulty: 'Advanced',
    cwe: 'CWE-78',
    description: 'How unvalidated inputs passed to system shell functions (os.system, exec, child_process) allow attackers to take complete control of your host operating system.',
    steps: {
      discover: 'When developers need to ping a host or run a script, AI often generates child_process.exec("ping " + host) which runs inside an OS shell interpreter.',
      understand: {
        summary: 'Shell executors parse metacharacters like ";", "&&", and "|". Attackers can append their own commands to execute arbitrary shell scripts.',
        analogy: 'Imagine handing a handwritten letter to a courier, but the recipient wrote "And also burn the post office down" on the bottom, and the courier obeys blindly.',
        whyCare: 'Command injection leads to total server takeover, ransomware deployment, or using your server in botnet attacks.'
      },
      see: {
        unsafeCode: `const { exec } = require('child_process');\nexec("ping -c 1 " + req.query.host);`,
        problemLine: 2,
        explanation: 'If the host query is "google.com; cat /etc/passwd", the shell runs both commands sequentially.'
      },
      practice: {
        challengePrompt: 'Refactor this shell command to execute using child_process.execFile with arguments separated from executable:',
        sampleCode: `exec("git clone " + userRepoUrl);`,
        hint: 'Use execFile("git", ["clone", userRepoUrl])',
        solution: `execFile("git", ["clone", userRepoUrl], (err, stdout) => {});`
      },
      verify: {
        question: 'Why is child_process.execFile safer than child_process.exec in Node.js?',
        options: [
          'Because execFile does not spawn an intermediate system shell by default',
          'Because execFile only runs on Windows',
          'Because execFile encrypts the file',
          'Because execFile runs slower'
        ],
        correctIndex: 0,
        explanation: 'execFile bypasses the shell parser, passing arguments directly as an array of strings without interpreting shell metacharacters.'
      },
      apply: 'Never pass user strings to os.system() or exec(). Use subprocess.run(["cmd", arg]) with shell=False or native SDK libraries.'
    },
    references: [
      {
        title: 'CWE-78: Improper Neutralization of Special Elements used in an OS Command',
        organization: 'MITRE CWE',
        url: 'https://cwe.mitre.org/data/definitions/78.html',
        level: 'LEVEL_A'
      },
      {
        title: 'OWASP Command Injection Defense',
        organization: 'OWASP Foundation',
        url: 'https://owasp.org/www-community/attacks/Command_Injection',
        level: 'LEVEL_C'
      }
    ]
  },
  {
    id: 'broken-crypto',
    slug: 'broken-crypto',
    title: 'Broken Cryptography & Deprecated Hashes (MD5/SHA1)',
    category: 'Cryptography & Data Protection',
    icon: 'ShieldAlert',
    difficulty: 'Intermediate',
    cwe: 'CWE-327',
    description: 'Why obsolete algorithms like MD5 and SHA-1 fail modern security standards, and how to use Argon2id, bcrypt, and SHA-256 for cryptographic integrity.',
    steps: {
      discover: 'AI prompts asking for "a quick way to hash a token or password" often output hashlib.md5(pwd.encode()).hexdigest() because it is brief.',
      understand: {
        summary: 'MD5 was cryptographically broken in 2004. Attackers can generate hash collisions in fractions of a second using commodity GPUs.',
        analogy: 'Imagine a door lock keyed to a skeleton key that 10,000 other people in the neighborhood also possess.',
        whyCare: 'Attackers can forge digital signatures, bypass password verification, and spoof integrity checksums.'
      },
      see: {
        unsafeCode: `import hashlib\ntoken_hash = hashlib.md5(token.encode()).hexdigest()`,
        problemLine: 2,
        explanation: 'MD5 is insecure for digital signatures, token hashing, and password storage.'
      },
      practice: {
        challengePrompt: 'Upgrade this hash generation to use modern SHA-256 with hashlib:',
        sampleCode: `const hash = crypto.createHash('md5').update(secret).digest('hex');`,
        hint: 'Change "md5" to "sha256"',
        solution: `const hash = crypto.createHash('sha256').update(secret).digest('hex');`
      },
      verify: {
        question: 'Which algorithm is recommended by NIST and OWASP for hashing user passwords?',
        options: [
          'MD5 with a salt',
          'Plain SHA-256',
          'Argon2id or bcrypt (slow adaptive functions)',
          'Base64 encoding'
        ],
        correctIndex: 2,
        explanation: 'Passwords require slow, memory-hard adaptive hashing algorithms (Argon2id or bcrypt) to resist GPU rainbow table cracking.'
      },
      apply: 'Use crypto.subtle with SHA-256 for message integrity, and Argon2id or bcrypt for password hashing.'
    },
    references: [
      {
        title: 'CWE-327: Use of a Broken or Risky Cryptographic Algorithm',
        organization: 'MITRE CWE',
        url: 'https://cwe.mitre.org/data/definitions/327.html',
        level: 'LEVEL_A'
      },
      {
        title: 'NIST Special Publication 800-131A: Transitioning Cryptographic Algorithms',
        organization: 'NIST',
        url: 'https://csrc.nist.gov/publications/detail/sp/800-131a/rev-2/final',
        level: 'LEVEL_A'
      }
    ]
  },
  {
    id: 'insecure-tls',
    slug: 'insecure-tls',
    title: 'Insecure Transport & Disabled SSL Verification',
    category: 'Network & Transport Security',
    icon: 'Lock',
    difficulty: 'Intermediate',
    cwe: 'CWE-295',
    description: 'Understanding how setting verify=False or rejectUnauthorized: false leaves API traffic vulnerable to active Man-In-The-Middle (MITM) attacks.',
    steps: {
      discover: 'When developers test local APIs with self-signed SSL certificates, AI frequently suggests adding requests.get(..., verify=False) to bypass certificate errors.',
      understand: {
        summary: 'Turning off certificate verification stops your client from verifying that the remote server is who it claims to be.',
        analogy: 'Imagine sending cash in a sealed envelope, but telling the mail carrier to hand it to anyone who holds their hand out on the street.',
        whyCare: 'Attackers on the same Wi-Fi network or upstream ISP can intercept, read, and alter all your API requests and customer data in real time.'
      },
      see: {
        unsafeCode: `response = requests.get("https://api.internal/v1/customers", verify=False)`,
        problemLine: 1,
        explanation: 'Disabled certificate validation allows any proxy or rogue DNS server to decrypt and modify traffic.'
      },
      practice: {
        challengePrompt: 'Fix this request so it uses a custom trusted CA bundle file instead of disabling verification:',
        sampleCode: `requests.get("https://internal.bank/api", verify=False)`,
        hint: 'Set verify to the path of your CA bundle: verify="/etc/ssl/certs/company-ca.pem"',
        solution: `requests.get("https://internal.bank/api", verify="/etc/ssl/certs/company-ca.pem")`
      },
      verify: {
        question: 'What is the primary danger of disabling SSL/TLS certificate verification?',
        options: [
          'It slows down internet connection speed',
          'It allows attackers to intercept, read, and modify encrypted traffic via Man-In-The-Middle (MITM)',
          'It disables JavaScript on the server',
          'It causes browser tabs to close'
        ],
        correctIndex: 1,
        explanation: 'Without certificate validation, clients accept impostor certificates from rogue proxies without raising an alert.'
      },
      apply: 'Always keep SSL verification enabled (verify=True). For internal enterprise domains, supply the root certificate bundle.'
    },
    references: [
      {
        title: 'CWE-295: Improper Certificate Validation',
        organization: 'MITRE CWE',
        url: 'https://cwe.mitre.org/data/definitions/295.html',
        level: 'LEVEL_A'
      }
    ]
  },
  {
    id: 'sensitive-logging',
    slug: 'sensitive-logging',
    title: 'Sensitive Credential & Log Leakage',
    category: 'Privacy & Operations',
    icon: 'FileText',
    difficulty: 'Beginner',
    cwe: 'CWE-532',
    description: 'Detecting accidental console and file logging of user passwords, credit card numbers, and authorization headers in production telemetry.',
    steps: {
      discover: 'Developers and AI assistants commonly add console.log("Login:", username, password) while debugging, and forget to remove it before deployment.',
      understand: {
        summary: 'Everything printed to stdout or stderr is indexed by cloud log aggregation tools and visible to dozens of team members.',
        analogy: 'Imagine an accountant who shouts every customer’s bank balance and password across the room so the intern can write it down.',
        whyCare: 'Centralized log systems (CloudWatch, Datadog) are often accessible to support agents and contractors who should never see plaintext passwords.'
      },
      see: {
        unsafeCode: `console.log("Processing login for:", username, password);`,
        problemLine: 1,
        explanation: 'Plaintext passwords are saved to server log files and third-party monitoring services.'
      },
      practice: {
        challengePrompt: 'Safely log the login attempt without leaking the secret:',
        sampleCode: `console.log("Auth attempt:", req.body);`,
        hint: 'Log only non-sensitive identifiers like userId or username',
        solution: `console.log("Auth attempt for user:", req.body.username);`
      },
      verify: {
        question: 'Who can typically read logs generated by your production servers?',
        options: [
          'Only the person who wrote the code',
          'Anyone with access to cloud monitoring, centralized log viewers, or server terminal access',
          'Nobody, logs are erased every second',
          'Only law enforcement'
        ],
        correctIndex: 1,
        explanation: 'Logs are stored on disk and streamed to dashboards where anyone with observability access can view them.'
      },
      apply: 'Use structured loggers with automated redaction filters (e.g. Pino redacting ["password", "token"]).'
    },
    references: [
      {
        title: 'CWE-532: Insertion of Sensitive Information into Log File',
        organization: 'MITRE CWE',
        url: 'https://cwe.mitre.org/data/definitions/532.html',
        level: 'LEVEL_A'
      }
    ]
  },
  {
    id: 'cors-misconfiguration',
    slug: 'cors-misconfiguration',
    title: 'CORS & Cross-Domain Security',
    category: 'Configuration & Browser',
    icon: 'Globe',
    difficulty: 'Intermediate',
    cwe: 'CWE-942',
    description: 'Why Access-Control-Allow-Origin: * breaks your browser boundary protections and allows malicious sites to read your API responses.',
    steps: {
      discover: 'When developers run into browser CORS errors while testing, AI frequently advises adding app.use(cors()) or origin: "*", opening the gate to all origins.',
      understand: {
        summary: 'CORS is a browser security mechanism that stops malicious websites from stealing authenticated data from other websites.',
        analogy: 'Imagine a bouncer who says "Anyone from any bar in town can walk in and read your confidential documents."',
        whyCare: 'An authenticated user visiting a malicious blog could have their sensitive profile data pulled silently in the background.'
      },
      see: {
        unsafeCode: `app.use(cors({ origin: "*" }));`,
        problemLine: 1,
        explanation: 'Any third-party origin can trigger cross-origin requests and inspect the responses.'
      },
      practice: {
        challengePrompt: 'Restrict CORS to your company domain and enable credentials:',
        sampleCode: `app.use(cors({ origin: "*" }));`,
        hint: 'Replace * with your domain name',
        solution: `app.use(cors({ origin: "https://app.trustlens.dev", credentials: true }));`
      },
      verify: {
        question: 'What happens if a user visits a malicious website while logged into an API that has origin: "*"?',
        options: [
          'The malicious website is blocked by Windows defender',
          'The malicious website\'s JavaScript may be able to fetch and read private data from your API',
          'The computer shuts down',
          'Nothing, browsers ignore CORS headers'
        ],
        correctIndex: 1,
        explanation: 'A permissive CORS policy tells the browser to allow the foreign origin to read the response payload.'
      },
      apply: 'Always specify exact allowed origins in production and keep localhost origins restricted strictly to development environments.'
    },
    references: [
      {
        title: 'MDN Web Docs - CORS Security',
        organization: 'Mozilla',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
        level: 'LEVEL_B'
      }
    ]
  },
  {
    id: 'clean-code-architecture',
    slug: 'clean-code-architecture',
    title: 'Defensive Architecture & Clean Code Mastery',
    category: 'Secure Architecture',
    icon: 'CheckCircle2',
    difficulty: 'Beginner',
    cwe: 'BEST-PRACTICE',
    description: 'Essential defensive coding standards: loading secrets from environment vaults, utilizing prepared statements, and validating all external inputs.',
    steps: {
      discover: 'Writing clean code is not an accident; it is the deliberate choice to decouple credentials and validate all trust boundaries.',
      understand: {
        summary: 'Clean code separates configuration from implementation and assumes all external inputs are potentially untrusted.',
        analogy: 'Building a house with steel door locks and grounded electrical wiring from day one, rather than trying to patch holes after a burglary.',
        whyCare: 'Code with zero security vulnerabilities deploys safely, requires less rework, and maintains 100% compliance during security audits.'
      },
      see: {
        unsafeCode: `// Clean secure implementation\nconst password = process.env.DB_PASSWORD;\nconst user = await db.query("SELECT * FROM users WHERE id = ?", [userId]);`,
        problemLine: 0,
        explanation: 'This code securely retrieves secrets from environment variables and uses parameterized SQL execution.'
      },
      practice: {
        challengePrompt: 'Ensure this API route returns sanitized data and handles missing parameters gracefully:',
        sampleCode: `app.get("/user", (req, res) => { res.send(users[req.query.id]); });`,
        hint: 'Validate that req.query.id exists and is a valid format before lookup',
        solution: `app.get("/user", (req, res) => { const id = req.query.id; if (!id) return res.status(400).send("Missing id"); res.json(users[id] || null); });`
      },
      verify: {
        question: 'What is the primary indicator of production-ready, clean code in TRUSTLENS AI?',
        options: [
          'Code written entirely in one single line',
          'Zero critical vulnerabilities, verified environment secret handling, and 100% understanding score',
          'Code containing at least 50 comments',
          'Code that ignores all error exceptions'
        ],
        correctIndex: 1,
        explanation: 'Production readiness requires both zero unresolved vulnerabilities and verified developer understanding of the security architecture.'
      },
      apply: 'Continuously run TRUSTLENS AI before deploying any AI-assisted code to staging or production.'
    },
    references: [
      {
        title: 'OWASP Secure Coding Practices Quick Reference Guide',
        organization: 'OWASP Foundation',
        url: 'https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/',
        level: 'LEVEL_C'
      }
    ]
  }
];
