import { Finding } from '../../types/review';
import { getEvidenceForCwe } from '../evidence/registry';

export function detectPrivacyAndLoggingIssues(code: string, fileName: string = 'code.js'): Finding[] {
  const findings: Finding[] = [];
  const lines = code.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // Detect logging of sensitive variables like password, token, secret, creds
    const isSensitiveLog = 
      /(console\.log|print|logger\.(info|debug|error|warn))\s*\(.*(password|passwd|token|secret|credit_card|ssn).*\)/i.test(lineText);

    if (isSensitiveLog) {
      findings.push({
        id: `priv-log-${lineNum}`,
        reviewId: '',
        title: 'Sensitive Credential or Password Logged to Console/Log File',
        description: `Line ${lineNum} logs plaintext credentials ("${trimmed}"). Log output is frequently aggregated into third-party log servers and shared with team members.`,
        category: 'privacy',
        severity: 'high',
        confidence: 96,
        confidenceReason: 'Logging statement contains direct reference to a password or secret argument.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: lineText.includes('password') 
          ? `console.log("Login attempt for user:", username); // Passwords redacted from logs`
          : `logger.info("Operation completed for user:", userId);`,
        simpleExplanation: {
          analogy: 'Imagine shouting every customer\'s secret PIN into a crowded hallway so your coworkers can write it down in the visitor notebook. Even if the intention was just to record that a visitor arrived, their PIN is now visible to everyone who glances at the logbook.',
          whyCare: 'Log outputs are stored in log aggregators (Datadog, CloudWatch, Sentry, Splunk) where support engineers, contractors, or interns can read users\' actual passwords in plaintext.',
          realWorldImpact: [
            'Plaintext password leakage into monitoring systems',
            'Credential theft via compromised log aggregator access tokens',
            'Regulatory non-compliance with privacy mandates (GDPR, CCPA, ISO 27001)'
          ]
        },
        technicalExplanation: {
          cweId: 'CWE-532',
          cweTitle: 'CWE-532: Insertion of Sensitive Information into Log File',
          mechanism: 'Application streams unredacted credential payloads into standard out or disk-based logs.',
          attackSurface: ['Centralized log management (ELK, CloudWatch)', 'Terminal scrollbacks', 'Unsecured log files on server']
        },
        remediation: {
          whatChanged: 'Removed password from log arguments and recorded only non-sensitive contextual metadata (e.g. username or user ID).',
          whyBetter: 'Audit capability is preserved without creating a persistent plaintext credential leak in your logging infrastructure.',
          additionalSteps: 'Install automated log redaction filters or a structured logger (Pino, Winston) that automatically masks fields named "password".',
          lineExplanations: [
            {
              code: 'console.log("Login attempt:", username)',
              part: 'Redacted Logging',
              explanation: 'Logs the event without printing sensitive authentication credentials.'
            }
          ]
        },
        references: getEvidenceForCwe('CWE-532'),
        quiz: [
          {
            id: `q-log-1-${lineNum}`,
            findingId: `priv-log-${lineNum}`,
            question: 'Why should passwords never be printed with console.log or standard loggers?',
            type: 'reasoning',
            category: 'reasoning',
            options: [
              { id: 'opt-l1', text: 'It slows down JavaScript execution significantly', isCorrect: false },
              { id: 'opt-l2', text: 'Logs are stored in plain text and accessible to anyone with monitoring or server access', isCorrect: true },
              { id: 'opt-l3', text: 'Console logs automatically email the user', isCorrect: false },
              { id: 'opt-l4', text: 'Modern operating systems automatically reject logs containing the word password', isCorrect: false },
            ],
            explanation: 'System logs are frequently stored unencrypted across log aggregation platforms, making logged passwords accessible to unauthorized personnel.'
          }
        ],
        status: 'unresolved'
      });
    }
  });

  return findings;
}
