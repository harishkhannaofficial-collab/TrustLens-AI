import { Evidence, AuthorityLevel } from '../../types/review';

export interface GroundingSourceDefinition extends Evidence {
  category: string;
  tags: string[];
}

export const TRUSTED_EVIDENCE_REGISTRY: Record<string, GroundingSourceDefinition> = {
  'cwe-798': {
    id: 'cwe-798',
    organization: 'MITRE CWE',
    title: 'CWE-798: Use of Hard-coded Credentials',
    url: 'https://cwe.mitre.org/data/definitions/798.html',
    authorityLevel: 'LEVEL_A',
    summary: 'The software embeds authentication credentials such as passwords, cryptographic keys, or API tokens directly inside its source code, making them discoverable to anyone with read access to the code, binary, or version control history.',
    cweMapping: 'CWE-798',
    verifiedDate: '2024-05-15',
    category: 'secrets',
    tags: ['hardcoded', 'credentials', 'passwords', 'api-keys']
  },
  'owasp-secrets': {
    id: 'owasp-secrets',
    organization: 'OWASP Foundation',
    title: 'OWASP Secrets Management Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html',
    authorityLevel: 'LEVEL_C',
    summary: 'Secrets must never be stored in source code, committed configuration files, or image layers. Applications should ingest credentials via runtime environment variables, external vaults (e.g. HashiCorp Vault, AWS Secrets Manager), or injected secret mounts.',
    cweMapping: 'CWE-798',
    verifiedDate: '2024-04-10',
    category: 'secrets',
    tags: ['owasp', 'secrets-management', 'environment-variables']
  },
  'nist-sp-800-63b': {
    id: 'nist-sp-800-63b',
    organization: 'NIST',
    title: 'NIST SP 800-63B: Digital Identity Guidelines - Authentication & Lifecycle',
    url: 'https://pages.nist.gov/800-63-4/sp800-63b.html',
    authorityLevel: 'LEVEL_A',
    summary: 'Federal guidelines on secure password storage, salted cryptographic hashing (PBKDF2, Argon2, scrypt), resistance against brute-force attacks, rate limiting, and secure transmission protocols.',
    cweMapping: 'CWE-256',
    verifiedDate: '2024-02-01',
    category: 'authentication',
    tags: ['nist', 'identity', 'password-storage', 'hashing']
  },
  'cwe-89': {
    id: 'cwe-89',
    organization: 'MITRE CWE',
    title: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command (\'SQL Injection\')',
    url: 'https://cwe.mitre.org/data/definitions/89.html',
    authorityLevel: 'LEVEL_A',
    summary: 'The software constructs all or part of an SQL command using externally-influenced input from an upstream component, without neutralizing special elements that could modify the intended query structure.',
    cweMapping: 'CWE-89',
    verifiedDate: '2024-05-15',
    category: 'injection',
    tags: ['sql-injection', 'cwe-89', 'database']
  },
  'owasp-sqli': {
    id: 'owasp-sqli',
    organization: 'OWASP Foundation',
    title: 'OWASP SQL Injection Prevention Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
    authorityLevel: 'LEVEL_C',
    summary: 'Primary defenses: Use parameterized queries (prepared statements) across all SQL queries or use an ORM properly. Secondary defenses: Stored procedures and input validation.',
    cweMapping: 'CWE-89',
    verifiedDate: '2024-03-20',
    category: 'injection',
    tags: ['owasp', 'sql-injection', 'prepared-statements']
  },
  'cwe-532': {
    id: 'cwe-532',
    organization: 'MITRE CWE',
    title: 'CWE-532: Insertion of Sensitive Information into Log File',
    url: 'https://cwe.mitre.org/data/definitions/532.html',
    authorityLevel: 'LEVEL_A',
    summary: 'The software prints sensitive data such as passwords, session tokens, or personal identity numbers into system log files or console streams where unauthorized administrators or centralized log collectors can inspect them.',
    cweMapping: 'CWE-532',
    verifiedDate: '2024-04-18',
    category: 'privacy',
    tags: ['logging', 'privacy', 'passwords-in-logs']
  },
  'nodejs-security-best-practices': {
    id: 'nodejs-security-best-practices',
    organization: 'Node.js Official Documentation',
    title: 'Node.js Security Best Practices - Secrets & Process Environment',
    url: 'https://nodejs.org/en/learn/getting-started/security-best-practices',
    authorityLevel: 'LEVEL_B',
    summary: 'Official Node.js guidance on managing secrets through process.env, sanitizing log output to prevent credential leakage, avoiding child_process command injection, and using rate-limiters.',
    cweMapping: 'CWE-798',
    verifiedDate: '2024-06-01',
    category: 'code-quality',
    tags: ['nodejs', 'process-env', 'best-practices']
  },
  'mdn-cors': {
    id: 'mdn-cors',
    organization: 'Mozilla Developer Network (MDN)',
    title: 'Cross-Origin Resource Sharing (CORS) Security & Configuration',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
    authorityLevel: 'LEVEL_B',
    summary: 'Wildcard origins Access-Control-Allow-Origin: * combined with credentials or authenticated endpoints can allow third-party websites to extract sensitive API responses through the user\'s browser.',
    cweMapping: 'CWE-942',
    verifiedDate: '2024-05-10',
    category: 'configuration',
    tags: ['cors', 'headers', 'mdn', 'browser-security']
  },
  'cwe-306': {
    id: 'cwe-306',
    organization: 'MITRE CWE',
    title: 'CWE-306: Missing Authentication for Critical Function',
    url: 'https://cwe.mitre.org/data/definitions/306.html',
    authorityLevel: 'LEVEL_A',
    summary: 'The software does not perform any authentication checks for functionalities that require identity verification, allowing anonymous actors to invoke administrative or sensitive operations.',
    cweMapping: 'CWE-306',
    verifiedDate: '2024-05-01',
    category: 'authentication',
    tags: ['auth', 'cwe-306', 'missing-authentication']
  },
  'cwe-20': {
    id: 'cwe-20',
    organization: 'MITRE CWE',
    title: 'CWE-20: Improper Input Validation',
    url: 'https://cwe.mitre.org/data/definitions/20.html',
    authorityLevel: 'LEVEL_A',
    summary: 'The product receives input or data, but does not validate or incorrectly validates that the input has the properties required to process the data safely and correctly.',
    cweMapping: 'CWE-20',
    verifiedDate: '2024-05-01',
    category: 'security',
    tags: ['validation', 'cwe-20', 'sanitization']
  },
  'cwe-78': {
    id: 'cwe-78',
    organization: 'MITRE CWE',
    title: 'CWE-78: Improper Neutralization of Special Elements used in an OS Command (\'OS Command Injection\')',
    url: 'https://cwe.mitre.org/data/definitions/78.html',
    authorityLevel: 'LEVEL_A',
    summary: 'The software constructs an operating system command using externally-influenced input, allowing attackers to execute arbitrary system shell commands with the privileges of the application.',
    cweMapping: 'CWE-78',
    verifiedDate: '2024-05-15',
    category: 'injection',
    tags: ['command-injection', 'os-system', 'shell', 'cwe-78']
  },
  'cwe-79': {
    id: 'cwe-79',
    organization: 'MITRE CWE',
    title: 'CWE-79: Improper Neutralization of Input During Web Page Generation (\'Cross-site Scripting\')',
    url: 'https://cwe.mitre.org/data/definitions/79.html',
    authorityLevel: 'LEVEL_A',
    summary: 'The software does not neutralize or incorrectly neutralizes user-controllable input before it is placed in output that is used as a web page that is served to other users, leading to arbitrary script execution.',
    cweMapping: 'CWE-79',
    verifiedDate: '2024-05-15',
    category: 'injection',
    tags: ['xss', 'dom', 'innerHTML', 'dangerouslySetInnerHTML', 'cwe-79']
  },
  'cwe-22': {
    id: 'cwe-22',
    organization: 'MITRE CWE',
    title: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory (\'Path Traversal\')',
    url: 'https://cwe.mitre.org/data/definitions/22.html',
    authorityLevel: 'LEVEL_A',
    summary: 'The software uses external input to construct a pathname intended to identify a file or directory that is located underneath a restricted directory, but does not properly neutralize sequences such as .. that can resolve to a location outside the directory.',
    cweMapping: 'CWE-22',
    verifiedDate: '2024-05-15',
    category: 'security',
    tags: ['path-traversal', 'file-access', 'directory-traversal', 'cwe-22']
  },
  'cwe-327': {
    id: 'cwe-327',
    organization: 'MITRE CWE',
    title: 'CWE-327: Use of a Broken or Risky Cryptographic Algorithm',
    url: 'https://cwe.mitre.org/data/definitions/327.html',
    authorityLevel: 'LEVEL_A',
    summary: 'The use of a broken or risky cryptographic algorithm such as MD5 or SHA1, or using non-cryptographic PRNGs like Math.random(), exposes confidential data or leads to forged tokens.',
    cweMapping: 'CWE-327',
    verifiedDate: '2024-05-15',
    category: 'cryptography',
    tags: ['crypto', 'md5', 'sha1', 'weak-hashing', 'cwe-327']
  },
  'cwe-295': {
    id: 'cwe-295',
    organization: 'MITRE CWE',
    title: 'CWE-295: Improper Certificate Validation',
    url: 'https://cwe.mitre.org/data/definitions/295.html',
    authorityLevel: 'LEVEL_A',
    summary: 'Disabling SSL/TLS certificate verification (such as verify=False or rejectUnauthorized: false) allows man-in-the-middle (MitM) attackers to spoof the destination server and intercept or modify traffic.',
    cweMapping: 'CWE-295',
    verifiedDate: '2024-05-15',
    category: 'security',
    tags: ['ssl', 'tls', 'certificate', 'verify-false', 'cwe-295']
  },
  'cwe-502': {
    id: 'cwe-502',
    organization: 'MITRE CWE',
    title: 'CWE-502: Deserialization of Untrusted Data',
    url: 'https://cwe.mitre.org/data/definitions/502.html',
    authorityLevel: 'LEVEL_A',
    summary: 'The application deserializes untrusted data using unsafe mechanisms like Python pickle or unsafe YAML loaders, allowing arbitrary code execution when maliciously crafted serialized objects are processed.',
    cweMapping: 'CWE-502',
    verifiedDate: '2024-05-15',
    category: 'security',
    tags: ['deserialization', 'pickle', 'yaml', 'rce', 'cwe-502']
  }
};

export function getEvidenceForCwe(cweId: string): Evidence[] {
  const normalized = cweId.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return Object.values(TRUSTED_EVIDENCE_REGISTRY).filter(item => 
    item.cweMapping?.toLowerCase() === cweId.toLowerCase() ||
    item.id.includes(normalized) ||
    item.tags.some(t => normalized.includes(t))
  );
}
