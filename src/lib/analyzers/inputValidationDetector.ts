import { Finding } from '../../types/review';
import { getEvidenceForCwe } from '../evidence/registry';

export function detectInputValidationIssues(code: string, fileName: string = 'code.js'): Finding[] {
  const findings: Finding[] = [];
  const lines = code.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // Pattern: directly taking req.body or req.query values without type/length checks
    // e.g. const username = req.body.username; const password = req.body.password;
    const hasUncheckedReqBody = 
      /const\s+\{?\s*(username|password|email|id|token)\s*\}?\s*=\s*req\.body/i.test(lineText) ||
      /const\s+(username|password)\s*=\s*req\.body\.(username|password)/i.test(lineText);

    if (hasUncheckedReqBody) {
      findings.push({
        id: `input-val-${lineNum}`,
        reviewId: '',
        title: 'Missing Input Validation & Schema Sanitation',
        description: `Line ${lineNum} extracts parameters from req.body without validating data types, string length, or null presence.`,
        category: 'security',
        severity: 'high',
        confidence: 91,
        confidenceReason: 'Request body parameters are processed directly without a schema validation library or type guard.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: `// Validate using Zod, Joi, or express-validator\nconst { username, password } = loginSchema.parse(req.body);`,
        simpleExplanation: {
          analogy: 'Imagine a bouncer at a club who asks for people\'s IDs, but accepts a crumpled napkin with "I am 21" scribbled in crayon without verifying it. Without input validation, your server blindly accepts whatever strange objects or giant data strings a client sends.',
          whyCare: 'Attackers can pass objects instead of strings (causing Type Confusion in MongoDB/NoSQL), giant 50MB strings (causing CPU denial of service), or undefined values that crash your server.',
          realWorldImpact: [
            'NoSQL Injection and Object Injection',
            'Denial of service via unbounded input memory allocation',
            'Unexpected application crashes on malformed payloads'
          ]
        },
        technicalExplanation: {
          cweId: 'CWE-20',
          cweTitle: 'CWE-20: Improper Input Validation',
          mechanism: 'Absence of schema validation permits unexpected types (e.g. { username: { $gt: "" } }) to reach internal database logic.',
          attackSurface: ['Public JSON request bodies', 'Form submissions']
        },
        remediation: {
          whatChanged: 'Added schema-based validation (using Zod or Joi) to assert string types, minimum/maximum lengths, and strip unknown properties.',
          whyBetter: 'Invalid, malformed, or hostile payloads are rejected immediately before reaching core business logic.',
          additionalSteps: 'Install Zod (npm i zod) and declare schemas for all incoming API routes.',
          lineExplanations: [
            {
              code: 'loginSchema.parse(req.body)',
              part: 'Schema Validation',
              explanation: 'Enforces strictly that username and password are non-empty strings of valid length.'
            }
          ]
        },
        references: getEvidenceForCwe('CWE-20'),
        quiz: [
          {
            id: `q-val-1-${lineNum}`,
            findingId: `input-val-${lineNum}`,
            question: 'What can happen if you do not validate that req.body.username is actually a string?',
            type: 'reasoning',
            category: 'reasoning',
            options: [
              { id: 'opt-v1', text: 'Nothing, JavaScript automatically converts all inputs to strings safely', isCorrect: false },
              { id: 'opt-v2', text: 'An attacker could pass an object (like {"$gt": ""}) causing NoSQL injection or server crashes', isCorrect: true },
              { id: 'opt-v3', text: 'The internet connection is terminated', isCorrect: false },
              { id: 'opt-v4', text: 'The user receives free administrative privileges automatically', isCorrect: false },
            ],
            explanation: 'In JavaScript backends (especially with MongoDB/NoSQL), passing an object instead of a string can trigger query operator injection.'
          }
        ],
        status: 'unresolved'
      });
    }
  });

  return findings;
}
