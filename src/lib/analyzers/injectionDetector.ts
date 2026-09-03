import { Finding } from '../../types/review';
import { getEvidenceForCwe } from '../evidence/registry';

export function detectInjection(code: string, fileName: string = 'code.js'): Finding[] {
  const findings: Finding[] = [];
  const lines = code.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // Pattern 1: SQL Injection via Python f-string or JS template literal or string concatenation
    const isSqlConcat = 
      /SELECT\s+.*\s+FROM\s+.*WHERE\s+.*(\+|%|\{|\$\{|f["'])/i.test(lineText) ||
      /INSERT\s+INTO\s+.*VALUES\s*\(.*(\+|%|\{|\$\{)/i.test(lineText) ||
      /query\s*=\s*f?["']SELECT\s+.*["']/i.test(lineText) && (lineText.includes('{') || lineText.includes('+'));

    if (isSqlConcat) {
      findings.push({
        id: `inj-sql-${lineNum}`,
        reviewId: '',
        title: 'SQL Injection Risk via Dynamic Query Concatenation',
        description: `Line ${lineNum} dynamically injects raw variables directly into an SQL statement string without parameterization.`,
        category: 'injection',
        severity: 'critical',
        confidence: 96,
        confidenceReason: 'SQL statement contains unescaped variable concatenation or format string syntax.',
        file: fileName,
        lineStart: lineNum,
        lineEnd: lineNum,
        vulnerableSnippet: trimmed,
        recommendedSnippet: lineText.includes('f"') || lineText.includes("f'") 
          ? `query = "SELECT * FROM users WHERE username = %s"\ncursor.execute(query, (username,))`
          : `const query = "SELECT * FROM users WHERE username = ?";\ndb.query(query, [username]);`,
        simpleExplanation: {
          analogy: 'Imagine ordering a custom printed t-shirt with your name, but when you type "Bob\'; DROP TABLE orders; --" into the name box, the printing machine interprets it as a command and deletes all factory records. That is SQL injection.',
          whyCare: 'An attacker can supply malicious input (like "\' OR \'1\'=\'1") to bypass authentication, dump customer tables, or delete entire database clusters.',
          realWorldImpact: [
            'Complete database dumping (customer passwords, credit cards)',
            'Authentication bypass without valid credentials',
            'Arbitrary record modification or dropping of tables'
          ]
        },
        technicalExplanation: {
          cweId: 'CWE-89',
          cweTitle: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
          mechanism: 'Untrusted user input is directly concatenated into the SQL statement, altering the AST parser structure of the database engine.',
          attackSurface: ['Login forms', 'Search inputs', 'URL query parameters', 'Filter dropdowns']
        },
        remediation: {
          whatChanged: 'Replaced string interpolation with parameterized queries (placeholders %s or ?). The database driver sends the SQL command and parameters in separate channels.',
          whyBetter: 'The database treats user input strictly as literal values, completely neutralizing any SQL syntax or quotes inside the input.',
          additionalSteps: 'Never concatenate SQL queries with + or template literals. Always pass parameters as the second argument to execute().',
          lineExplanations: [
            {
              code: 'query = "SELECT ... WHERE user = %s"',
              part: 'Parameterized SQL',
              explanation: 'Uses a parameter placeholder (%s or ?) rather than inserting raw user strings.'
            },
            {
              code: 'cursor.execute(query, (username,))',
              part: 'Bound Parameters',
              explanation: 'Passes variables as a tuple to the database driver for safe escaped execution.'
            }
          ]
        },
        practiceScenario: {
          prompt: 'Look at this vulnerable query: db.query(`SELECT * FROM products WHERE category = "${cat}"`); How should it be fixed?',
          unsafeSnippet: `db.query(\`SELECT * FROM products WHERE category = "\${cat}"\`);`,
          safeSnippet: `db.query("SELECT * FROM products WHERE category = ?", [cat]);`,
          explanation: 'Parameterized queries ensure the SQL engine processes user parameters as data, not code.'
        },
        references: getEvidenceForCwe('CWE-89'),
        quiz: [
          {
            id: `q-sqli-1-${lineNum}`,
            findingId: `inj-sql-${lineNum}`,
            question: 'Why does string interpolation (e.g. f"SELECT ... {user}") cause SQL injection?',
            type: 'reasoning',
            category: 'reasoning',
            options: [
              { id: 'opt-sqli-1a', text: 'Because string interpolation takes more memory in Python', isCorrect: false },
              { id: 'opt-sqli-1b', text: 'Because user input can contain SQL syntax (like quotes and comments) that alters the query logic', isCorrect: true },
              { id: 'opt-sqli-1c', text: 'Because databases do not support strings', isCorrect: false },
              { id: 'opt-sqli-1d', text: 'Because Python f-strings are deprecated', isCorrect: false },
            ],
            explanation: 'When user input is placed directly into a query string, special characters like quotes allow attackers to inject their own SQL statements.'
          },
          {
            id: `q-sqli-2-${lineNum}`,
            findingId: `inj-sql-${lineNum}`,
            question: 'Which of the following is the PRIMARY recommended defense against SQL injection according to OWASP?',
            type: 'fix-selection',
            category: 'fix',
            options: [
              { id: 'opt-sqli-2a', text: 'Using client-side JavaScript regex validation', isCorrect: false },
              { id: 'opt-sqli-2b', text: 'Using parameterized queries / prepared statements', isCorrect: true },
              { id: 'opt-sqli-2c', text: 'Encoding all user inputs in Base64 before querying', isCorrect: false },
              { id: 'opt-sqli-2d', text: 'Removing spaces from the input string', isCorrect: false },
            ],
            explanation: 'Parameterized queries (prepared statements) ensure the database engine handles user input strictly as data, never executable SQL commands.'
          }
        ],
        status: 'unresolved'
      });
    }
  });

  return findings;
}
