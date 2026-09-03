import { Finding } from '../../types/review';
import { getEvidenceForCwe } from '../evidence/registry';

export function detectAuthenticationIssues(code: string, fileName: string = 'code.js'): Finding[] {
  const findings: Finding[] = [];
  const lines = code.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // Pattern 1: Hardcoded login logic or plaintext comparison
    // e.g. username === "admin" && password === "password123"
    const isHardcodedAdminCheck = 
      /(username\s*===?\s*["']admin["']|password\s*===?\s*["'][^"']+["'])/i.test(lineText) &&
      lineText.includes('password');

    // Pattern 2: Direct plaintext password equality check without hashing
    // e.g. if (user.password === password) or user[2] == password
    const isPlaintextComparison = 
      /if\s*\(\s*(user(\.|\[["']?)password|user\[\d+\])\s*===?\s*password\s*\)/i.test(lineText) ||
      /user(\.|\[["']?)password\s*===?\s*req\.body\.password/i.test(lineText);

    if (isHardcodedAdminCheck) {
      findings.push({
        id: `auth-hardcoded-${lineNum}`,
        reviewId: '',
        title: 'Hard-Coded Administrator Login Credentials',
        description: `Line ${lineNum} directly compares credentials against hardcoded strings ("${trimmed}").`,
        category: 'authentication',
        severity: 'critical',
        confidence: 98,
        confidenceReason: 'Authentication check compares request fields directly with hardcoded plaintext strings.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: `// Verify against securely hashed password in database\nconst isValid = await bcrypt.compare(password, user.passwordHash);`,
        simpleExplanation: {
          analogy: 'Imagine hiding your master key under a transparent plastic doormat with a note saying "Only the manager knows this key is here". Anyone inspecting your code has immediate master administrator access.',
          whyCare: 'Anyone who can view this file (such as developers, auditors, contractors, or repo forks) gains permanent backdoor access to your system.',
          realWorldImpact: [
            'Instant administrator account takeover',
            'Bypass of normal password complexity and multi-factor authentication (MFA)',
            'Impossible to rotate without recompiling and redeploying the app'
          ]
        },
        technicalExplanation: {
          cweId: 'CWE-798',
          cweTitle: 'CWE-798: Use of Hard-coded Credentials in Authentication Routine',
          mechanism: 'Fixed authentication credentials in program logic create an unrevokable backdoor that bypasses database-driven authorization and audit logging.',
          attackSurface: ['Public APIs', 'Login endpoints', 'Source code repositories']
        },
        remediation: {
          whatChanged: 'Replaced the hard-coded comparison with a cryptographic password verification lookup using bcrypt/argon2 against a secure database record.',
          whyBetter: 'Passwords are never stored in plaintext or hardcoded in logic. Each user can rotate their password independently.',
          additionalSteps: 'Ensure passwords in the database are stored as salted hashes (Argon2id or bcrypt with cost >= 12).',
          lineExplanations: [
            {
              code: 'await bcrypt.compare(password, user.passwordHash)',
              part: 'Cryptographic Compare',
              explanation: 'Uses a constant-time cryptographic comparison function resistant to timing attacks and rainbow tables.'
            }
          ]
        },
        practiceScenario: {
          prompt: 'Why is changing "password123" to "mySecretAdminPass789!" still fundamentally insecure?',
          unsafeSnippet: `if (user === "admin" && pass === "mySecretAdminPass789!")`,
          safeSnippet: `const isMatch = await argon2.verify(user.hash, pass);`,
          explanation: 'The flaw is not that the password is weak; the flaw is that an authentication credential is embedded directly in source code.'
        },
        references: getEvidenceForCwe('CWE-798'),
        quiz: [
          {
            id: `q-auth-1-${lineNum}`,
            findingId: `auth-hardcoded-${lineNum}`,
            question: 'Why is changing "password123" to "mySecretComplexPass456!" not a valid fix?',
            type: 'mcq',
            category: 'identification',
            options: [
              { id: 'opt-auth-1a', text: 'Because longer passwords crash Node.js and Python servers', isCorrect: false },
              { id: 'opt-auth-1b', text: 'Because a reusable credential is still permanently visible to anyone who views the source code', isCorrect: true },
              { id: 'opt-auth-1c', text: 'Because passwords must contain emojis to be secure', isCorrect: false },
              { id: 'opt-auth-1d', text: 'Because administrators should never have passwords', isCorrect: false },
            ],
            explanation: 'Hardcoding any secret—no matter how complex—leaves it exposed in plaintext in source repositories, build logs, and memory dumps.'
          }
        ],
        status: 'unresolved'
      });
    } else if (isPlaintextComparison) {
      findings.push({
        id: `auth-plain-${lineNum}`,
        reviewId: '',
        title: 'Plain-Text Password Comparison & Storage',
        description: `Line ${lineNum} directly compares passwords using string equality (== or ===), indicating passwords are saved or checked in plaintext without cryptographic hashing.`,
        category: 'authentication',
        severity: 'high',
        confidence: 94,
        confidenceReason: 'Direct equality operator used on password fields without cryptographic hash verification.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: `// Verify using cryptographic timing-safe hash comparison\nconst passwordMatches = await bcrypt.compare(password, user.passwordHash);`,
        simpleExplanation: {
          analogy: 'Imagine if a bank kept all customer PINs written on index cards in an unlocked shoebox instead of in an encrypted digital safe. If a burglar enters the room, all customer accounts are instantly lost.',
          whyCare: 'If your database is ever leaked or backed up insecurely, all user passwords will be readable immediately.',
          realWorldImpact: [
            'Total user account compromise upon any database dump',
            'Credential stuffing attacks across other sites where users reuse passwords',
            'Violation of GDPR, HIPAA, and PCI-DSS compliance regulations'
          ]
        },
        technicalExplanation: {
          cweId: 'CWE-256',
          cweTitle: 'CWE-256: Plaintext Storage of a Password',
          mechanism: 'Passwords compared with direct string equality indicate unhashed storage and vulnerability to timing attacks.',
          attackSurface: ['Database backups', 'SQL injection leaks', 'Insider threats']
        },
        remediation: {
          whatChanged: 'Use a slow, salted adaptive hashing algorithm (Argon2id or bcrypt) with timing-safe comparison.',
          whyBetter: 'Even if the database is leaked, attackers cannot reverse the hashes without massive compute cost.',
          additionalSteps: 'Upgrade existing user records upon next successful login to salted cryptographic hashes.',
          lineExplanations: [
            {
              code: 'bcrypt.compare(password, hash)',
              part: 'Adaptive Hashing',
              explanation: 'Applies deliberate computational cost to prevent brute-force GPU cracking.'
            }
          ]
        },
        references: getEvidenceForCwe('CWE-798'),
        quiz: [
          {
            id: `q-plain-1-${lineNum}`,
            findingId: `auth-plain-${lineNum}`,
            question: 'What is the standard defense for storing user passwords safely?',
            type: 'fix-selection',
            category: 'fix',
            options: [
              { id: 'opt-p1', text: 'Store them in Base64 encoding', isCorrect: false },
              { id: 'opt-p2', text: 'Store them using salted adaptive hashing algorithms like Argon2id or bcrypt', isCorrect: true },
              { id: 'opt-p3', text: 'Store them in plain text inside an environment variable', isCorrect: false },
              { id: 'opt-p4', text: 'Encrypt them with a single symmetric key shared by all users', isCorrect: false },
            ],
            explanation: 'NIST SP 800-63B and OWASP mandate salted, computationally intensive one-way hashes (Argon2id, bcrypt, PBKDF2) for password storage.'
          }
        ],
        status: 'unresolved'
      });
    }
  });

  // Check for missing authentication mechanism warning (e.g. login endpoint without rate limiting or lockout)
  if (code.includes('/login') && !code.includes('rateLimit') && !code.includes('limiter') && !code.includes('throttle')) {
    findings.push({
      id: 'auth-missing-mechanism',
      reviewId: '',
      title: 'Missing Authentication Rate Limiting & Lockout Mechanism',
      description: 'The authentication endpoint does not implement rate limiting, IP throttling, or account lockout controls, making it vulnerable to automated brute-force attacks.',
      category: 'authentication',
      severity: 'medium',
      confidence: 90,
      confidenceReason: 'Authentication route (/login) defined without rate-limiting middleware or lockout logic.',
      file: fileName,
      lineStart: 1,
      vulnerableSnippet: 'app.post("/login", (req, res) => { ... })',
      recommendedSnippet: `const rateLimit = require("express-rate-limit");\nconst loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });\napp.post("/login", loginLimiter, (req, res) => { ... });`,
      simpleExplanation: {
        analogy: 'Imagine a physical lock that allows a thief to test 100,000 keys per second without sounding an alarm or locking the door.',
        whyCare: 'Attackers can use dictionary scripts to test millions of passwords against accounts until they find a match.',
        realWorldImpact: ['Credential stuffing account takeover', 'Denial of service on auth services']
      },
      technicalExplanation: {
        cweId: 'CWE-306',
        cweTitle: 'CWE-306: Missing Authentication & Rate-Limiting Controls',
        mechanism: 'Unthrottled HTTP POST endpoints permit high-frequency automated guessing attacks.',
        attackSurface: ['Public login APIs']
      },
      remediation: {
        whatChanged: 'Applied express-rate-limit middleware to cap login attempts to 5 per 15 minutes per IP address.',
        whyBetter: 'Renders automated credential stuffing computationally ineffective.',
        additionalSteps: 'Consider implementing progressive delays and CAPTCHA after consecutive failed attempts.',
        lineExplanations: [
          {
            code: 'max: 5, windowMs: 15 * 60 * 1000',
            part: 'Rate Window',
            explanation: 'Restricts the same client from attempting more than 5 attempts in a 15-minute rolling window.'
          }
        ]
      },
      references: getEvidenceForCwe('CWE-306'),
      quiz: [
        {
          id: 'q-rate-1',
          findingId: 'auth-missing-mechanism',
          question: 'What attack is prevented by adding rate limiting to a login endpoint?',
          type: 'reasoning',
          category: 'reasoning',
          options: [
            { id: 'opt-r1', text: 'Cross-Site Scripting (XSS)', isCorrect: false },
            { id: 'opt-r2', text: 'Automated brute-force and credential-stuffing attacks', isCorrect: true },
            { id: 'opt-r3', text: 'SQL Injection', isCorrect: false },
            { id: 'opt-r4', text: 'DNS Cache Poisoning', isCorrect: false },
          ],
          explanation: 'Rate limiting limits how many login attempts an attacker can submit, rendering rapid brute-force attacks useless.'
        }
      ],
      status: 'unresolved'
    });
  }

  return findings;
}
