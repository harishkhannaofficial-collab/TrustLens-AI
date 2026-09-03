import { Finding } from '../../types/review';
import { getEvidenceForCwe } from '../evidence/registry';

export function detectConfigurationIssues(code: string, fileName: string = 'config.js'): Finding[] {
  const findings: Finding[] = [];
  const lines = code.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // Pattern 1: Unsafe CORS wildcard
    const isUnsafeCors = 
      /cors\s*\(\s*\{\s*origin\s*:\s*["']\*["']/i.test(lineText) ||
      /Access-Control-Allow-Origin['"]?\s*[:=]\s*['"]\*['"]/i.test(lineText) ||
      /app\.use\(cors\(\)\)/i.test(lineText);

    // Pattern 2: Debug mode enabled in production code
    const isDebugActive = 
      /(debug|DEBUG)\s*[:=]\s*(true|1|True)/i.test(lineText) ||
      /app\.run\(.*debug\s*=\s*True.*\)/i.test(lineText);

    if (isUnsafeCors) {
      findings.push({
        id: `conf-cors-${lineNum}`,
        reviewId: '',
        title: 'Unsafe Wildcard CORS Configuration (Origin: *)',
        description: `Line ${lineNum} configures Cross-Origin Resource Sharing (CORS) with an unrestricted wildcard origin ("*"). This permits arbitrary third-party websites to interact with your API.`,
        category: 'configuration',
        severity: 'medium',
        confidence: 93,
        confidenceReason: 'CORS configuration sets origin to unrestricted wildcard.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: `app.use(cors({\n  origin: ["https://yourdomain.com", "https://app.yourdomain.com"],\n  credentials: true\n}));`,
        simpleExplanation: {
          analogy: 'Imagine opening an office building and placing a sign on the door saying "Anyone on earth can enter and read any memo on any desk, no badge needed." Wildcard CORS allows any random website a user visits to make requests to your API.',
          whyCare: 'Malicious websites visited by your authenticated users can make requests to your backend and read private user data.',
          realWorldImpact: [
            'Cross-origin data exfiltration',
            'Cross-site request forgery facilitation',
            'Bypass of internal network boundary protections'
          ]
        },
        technicalExplanation: {
          cweId: 'CWE-942',
          cweTitle: 'CWE-942: Permissive Cross-Domain Policy with Untrusted Domains',
          mechanism: 'Broad wildcard Access-Control-Allow-Origin headers allow malicious third-party origins to read API responses.',
          attackSurface: ['Browser-based cross-origin fetch requests']
        },
        remediation: {
          whatChanged: 'Restricted allowed origins to an explicit whitelist array of known, trusted production domains.',
          whyBetter: 'Browsers will block malicious third-party origins from reading sensitive API responses.',
          additionalSteps: 'Ensure environment separation (allow localhost only in development mode, restrict to your verified production domain in deployment).',
          lineExplanations: [
            {
              code: 'origin: ["https://yourdomain.com"]',
              part: 'Domain Whitelist',
              explanation: 'Specifies strictly which domains are permitted to interact with this API.'
            }
          ]
        },
        references: getEvidenceForCwe('CWE-942'),
        quiz: [
          {
            id: `q-cors-1-${lineNum}`,
            findingId: `conf-cors-${lineNum}`,
            question: 'What is the risk of setting Access-Control-Allow-Origin to "*"?',
            type: 'reasoning',
            category: 'reasoning',
            options: [
              { id: 'opt-c1', text: 'It slows down DNS resolution', isCorrect: false },
              { id: 'opt-c2', text: 'Any third-party website can send requests and potentially read sensitive data via the user browser', isCorrect: true },
              { id: 'opt-c3', text: 'It forces HTTPS on all requests', isCorrect: false },
              { id: 'opt-c4', text: 'It prevents mobile apps from connecting', isCorrect: false },
            ],
            explanation: 'Wildcard CORS tells web browsers to allow any web page on the internet to read responses from your API.'
          }
        ],
        status: 'unresolved'
      });
    } else if (isDebugActive) {
      findings.push({
        id: `conf-debug-${lineNum}`,
        reviewId: '',
        title: 'Debug Mode Enabled in Application Configuration',
        description: `Line ${lineNum} sets debug mode to active ("${trimmed}"). When debug mode is active in deployment, frameworks expose interactive debuggers and detailed stack traces containing environment variables and code snippets.`,
        category: 'configuration',
        severity: 'high',
        confidence: 95,
        confidenceReason: 'Explicit debug flag is set to true or active in code/configuration.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: `const DEBUG = process.env.NODE_ENV === "development";`,
        simpleExplanation: {
          analogy: 'Imagine shipping a safe to a customer, but leaving the mechanic\'s inspection door wide open with all the inner gears, blueprints, and master combinations on display. Debug mode leaves your application\'s internal wiring visible to everyone.',
          whyCare: 'In frameworks like Flask or Werkzeug, debug mode gives anyone who triggers an error an interactive web terminal to execute arbitrary shell commands on your server.',
          realWorldImpact: [
            'Remote code execution through web debug consoles',
            'Full database and secret leakage via stack trace dumps',
            'Internal architecture reconnaissance for attackers'
          ]
        },
        technicalExplanation: {
          cweId: 'CWE-489',
          cweTitle: 'CWE-489: Active Debug Code in Production',
          mechanism: 'Debug interfaces bypass standard error handling and expose internal application state and interactive debug evaluators.',
          attackSurface: ['Public 500 error pages', 'Framework debug consoles']
        },
        remediation: {
          whatChanged: 'Tied the debug flag to the NODE_ENV / ENV runtime variable so it is automatically disabled in production.',
          whyBetter: 'Production errors show safe, generic messages while preserving detailed logging privately on the server.',
          additionalSteps: 'Never set DEBUG=true in production environment variables.',
          lineExplanations: [
            {
              code: 'process.env.NODE_ENV === "development"',
              part: 'Environment Guard',
              explanation: 'Only enables debug facilities when explicitly running in local development mode.'
            }
          ]
        },
        references: getEvidenceForCwe('CWE-798'),
        quiz: [
          {
            id: `q-dbg-1-${lineNum}`,
            findingId: `conf-debug-${lineNum}`,
            question: 'Why is leaving debug mode enabled in production dangerous?',
            type: 'reasoning',
            category: 'reasoning',
            options: [
              { id: 'opt-d1', text: 'It uses too much CSS', isCorrect: false },
              { id: 'opt-d2', text: 'It can expose server environment variables, source code, and even interactive shell consoles upon error', isCorrect: true },
              { id: 'opt-d3', text: 'It changes the server port automatically', isCorrect: false },
              { id: 'opt-d4', text: 'It deletes the database every 24 hours', isCorrect: false },
            ],
            explanation: 'Debug mode frequently displays full stack traces with secret keys and allows interactive remote code execution.'
          }
        ],
        status: 'unresolved'
      });
    }
  });

  return findings;
}
