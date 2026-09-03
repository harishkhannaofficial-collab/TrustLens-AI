import { Finding } from '../../types/review';
import { getEvidenceForCwe } from '../evidence/registry';

export function detectSecrets(code: string, fileName: string = 'code.js'): Finding[] {
  const findings: Finding[] = [];
  const lines = code.split('\n');

  // Patterns for hardcoded credentials, API keys, passwords
  const secretPatterns = [
    {
      regex: /(password|passwd|pwd|db_pass|db_password|database_password)\s*[:=]\s*["']([^"']{3,})["']/i,
      title: 'Hard-Coded Database / Account Password',
      severity: 'critical' as const,
      cwe: 'CWE-798',
      confidence: 97,
      confidenceReason: 'Variable name explicitly identifies a password assignment containing a literal string.',
      analogy: 'Think about writing your ATM PIN on the front of your wallet. Anyone who gets the wallet can immediately see the PIN. Your database or user password is currently exposed in a similar way.',
      whyCare: 'An attacker who obtains this password could potentially connect to your database or administrative services, leading to full data theft or tampering.',
      impact: ['Unauthorized database or account access', 'Immediate data exposure or deletion', 'Credential reuse across interconnected cloud services'],
      cweTitle: 'CWE-798: Use of Hard-coded Credentials',
      mechanism: 'The application embeds authentication credentials directly inside its source code. Credentials stored in source code can accidentally be exposed through Git repositories, source archives, logs, screenshots, deployment bundles, and shared project files.',
      attackSurface: ['Public GitHub commits', 'CI/CD pipeline build logs', 'Client-side bundle inspection', 'Docker image layer caching'],
      whatChanged: 'The plaintext password was removed from the source code. Instead, the application reads it from an environment variable at runtime.',
      whyBetter: 'Sensitive values are isolated from the codebase, preventing leaks in version control and enabling painless secret rotation without modifying code.',
      additionalSteps: 'Define DB_PASSWORD in your environment (.env excluded from git, or cloud secrets manager like AWS Secrets Manager or GCP Secret Manager).',
      sampleFixLine: (varName: string) => `const ${varName} = process.env.${varName.toUpperCase()} || "";`,
      quiz: [
        {
          id: 'q-secret-1',
          question: 'Why is hardcoding a password in code dangerous?',
          type: 'mcq' as const,
          category: 'reasoning' as const,
          options: [
            { id: 'opt-1', text: 'It makes the code execute slower.', isCorrect: false },
            { id: 'opt-2', text: 'Anyone who sees or clones the code can access the password.', isCorrect: true },
            { id: 'opt-3', text: 'It helps the database connect automatically without credentials.', isCorrect: false },
            { id: 'opt-4', text: 'It is required by modern cloud platforms.', isCorrect: false },
          ],
          explanation: 'Source code is frequently committed to Git, shared with teammates, and bundled into public packages. Hardcoding secrets exposes them to everyone with read access.'
        },
        {
          id: 'q-secret-2',
          question: 'What is the safest place to store production database credentials?',
          type: 'fix-selection' as const,
          category: 'fix' as const,
          options: [
            { id: 'opt-2a', text: 'Inside a public config.json file in your GitHub repo', isCorrect: false },
            { id: 'opt-2b', text: 'Inside secure runtime environment variables or a secret vault', isCorrect: true },
            { id: 'opt-2c', text: 'In a code comment labeled "// private"', isCorrect: false },
            { id: 'opt-2d', text: 'Encoded in Base64 within the source code', isCorrect: false },
          ],
          explanation: 'Environment variables and dedicated secret vaults (AWS Secrets Manager, HashiCorp Vault) keep credentials decoupled from the codebase.'
        },
        {
          id: 'q-secret-3',
          question: 'Scenario: Another developer writes: API_KEY = "sk_live_123456". What is the safest approach?',
          type: 'scenario' as const,
          category: 'scenario' as const,
          options: [
            { id: 'opt-3a', text: 'Keep it because the application needs the key to run', isCorrect: false },
            { id: 'opt-3b', text: 'Rename the variable to secretKey to obfuscate it', isCorrect: false },
            { id: 'opt-3c', text: 'Store the key outside source code using secure secret management', isCorrect: true },
            { id: 'opt-3d', text: 'Add a comment saying "// please do not copy"', isCorrect: false },
          ],
          explanation: 'Renaming or commenting variables does not hide the key from attackers. Secure external secret management is required.'
        }
      ]
    },
    {
      regex: /(api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token)\s*[:=]\s*["'](sk_[a-zA-Z0-9_\-]{16,}|ghp_[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_\-]{30,}|[a-zA-Z0-9]{24,})["']/i,
      title: 'Exposed API Key / Access Token',
      severity: 'critical' as const,
      cwe: 'CWE-798',
      confidence: 98,
      confidenceReason: 'Pattern matches live vendor API key format (e.g. Stripe, GitHub, or generic high-entropy token).',
      analogy: 'Imagine sticking your credit card to your car bumper. Anyone passing by can copy the numbers and make charges. An API key in source code is exposed in the same manner.',
      whyCare: 'Compromised API keys can allow automated attackers to drain cloud balances, access confidential customer data, or send malicious requests on your behalf.',
      impact: ['Financial loss from compute/API abuse', 'Data exfiltration', 'Account takeover'],
      cweTitle: 'CWE-798: Use of Hard-coded Credentials',
      mechanism: 'Third-party service authentication tokens are embedded statically, violating the principle of externalized credential management.',
      attackSurface: ['Automated GitHub scanners', 'Public web scrapers', 'Decompiled application packages'],
      whatChanged: 'Removed static token string and replaced with secure process environment variable lookup.',
      whyBetter: 'Enables instant token revocation and rotation without redeploying modified code.',
      additionalSteps: 'Immediately revoke the exposed key in your vendor dashboard if previously pushed to git.',
      sampleFixLine: (varName: string) => `const ${varName} = process.env.API_KEY;`,
      quiz: [
        {
          id: 'q-api-1',
          question: 'If you accidentally commit an API key to a public repository, what is the FIRST step you must take?',
          type: 'mcq' as const,
          category: 'reasoning' as const,
          options: [
            { id: 'opt-api-1a', text: 'Simply delete the line in a new commit', isCorrect: false },
            { id: 'opt-api-1b', text: 'Immediately revoke/rotate the key in the provider console and remove it from git history', isCorrect: true },
            { id: 'opt-api-1c', text: 'Make the repository private and keep using the same key', isCorrect: false },
            { id: 'opt-api-1d', text: 'Nothing, public keys are harmless', isCorrect: false },
          ],
          explanation: 'Git preserves all past commit history. Simply deleting the line in a subsequent commit leaves the secret readable in past commits. The key must be immediately revoked.'
        }
      ]
    }
  ];

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    // Skip comments
    if (lineText.trim().startsWith('//') || lineText.trim().startsWith('#') || lineText.trim().startsWith('*')) {
      return;
    }

    for (const pattern of secretPatterns) {
      const match = lineText.match(pattern.regex);
      if (match) {
        const varName = match[1] || 'SECRET';
        const rawSecret = match[2] || '';
        
        // Mask secret for UI security
        const masked = rawSecret.length > 8 
          ? rawSecret.slice(0, 3) + '•'.repeat(Math.min(10, rawSecret.length - 6)) + rawSecret.slice(-3)
          : '••••••••';

        const safeCodeLine = pattern.sampleFixLine(varName);

        findings.push({
          id: `sec-${lineNum}-${Date.now() % 10000}`,
          reviewId: '',
          title: pattern.title,
          description: `Line ${lineNum} embeds a credential directly inside the source code: "${lineText.trim()}"`,
          category: 'security',
          severity: pattern.severity,
          confidence: pattern.confidence,
          confidenceReason: pattern.confidenceReason,
          file: fileName,
          lineStart: lineNum,
          lineEnd: lineNum,
          vulnerableSnippet: lineText.trim(),
          recommendedSnippet: safeCodeLine,
          isRedacted: true,
          unmaskedValue: rawSecret,
          simpleExplanation: {
            analogy: pattern.analogy,
            whyCare: pattern.whyCare,
            realWorldImpact: pattern.impact,
          },
          technicalExplanation: {
            cweId: pattern.cwe,
            cweTitle: pattern.cweTitle,
            mechanism: pattern.mechanism,
            attackSurface: pattern.attackSurface,
          },
          remediation: {
            whatChanged: pattern.whatChanged,
            whyBetter: pattern.whyBetter,
            additionalSteps: pattern.additionalSteps,
            lineExplanations: [
              {
                code: 'process.env',
                part: 'Environment Variables',
                explanation: 'Reads runtime configuration supplied by the host operating system or container environment.'
              },
              {
                code: varName.toUpperCase(),
                part: 'Config Key',
                explanation: 'The standard uppercase key referencing the injected runtime secret.'
              }
            ]
          },
          practiceScenario: {
            prompt: 'Identify the problem in the following code snippet and determine how to make it safe:',
            unsafeSnippet: `const STRIPE_SECRET = "sk_live_9988776655443322";`,
            safeSnippet: `const STRIPE_SECRET = process.env.STRIPE_SECRET;`,
            explanation: 'Remove the hardcoded secret and reference an environment variable instead.'
          },
          references: getEvidenceForCwe(pattern.cwe),
          quiz: pattern.quiz.map(q => ({ ...q, findingId: `sec-${lineNum}` })),
          status: 'unresolved'
        });
        break;
      }
    }
  });

  return findings;
}
