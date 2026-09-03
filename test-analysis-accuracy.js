import { runFullAnalysis } from './src/lib/analyzers/orchestrator.ts';

console.log('=== TEST 1: Clean Code (Should have 0 findings, 100% Safety Score) ===');
const cleanCode = `import os
import mysql.connector

def get_user_profile(user_id):
    # Secure: reads from environment variable
    password = os.environ.get("DB_PASSWORD", "")
    conn = mysql.connector.connect(host="localhost", user="app_user", password=password)
    cursor = conn.cursor(prepared=True)
    # Secure: parameterized query
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    return cursor.fetchone()
`;

const cleanReview = runFullAnalysis({
  projectType: 'code',
  title: 'Clean Code Test',
  sourceCode: cleanCode,
  fileName: 'service.py',
  language: 'Python'
});

console.log('Findings count:', cleanReview.findings.length);
console.log('Safety score:', cleanReview.scores.safetyScore);
console.log('Deployment risk:', cleanReview.scores.deploymentRisk);
console.log('Ready to deploy checklist:', cleanReview.checklist.readyToDeploy);

if (cleanReview.findings.length !== 0) {
  console.error('FAILED: Clean code should have 0 findings! Found:', cleanReview.findings);
  process.exit(1);
}
if (cleanReview.scores.safetyScore !== 100) {
  console.error('FAILED: Clean code should have safety score 100! Got:', cleanReview.scores.safetyScore);
  process.exit(1);
}

console.log('\n=== TEST 2: Command Injection Code (CWE-78) ===');
const cmdCode = `const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/ping', (req, res) => {
  const host = req.query.host;
  exec("ping -c 1 " + host, (err, out) => {
    res.send(out);
  });
});
`;

const cmdReview = runFullAnalysis({
  projectType: 'code',
  title: 'Command Injection Test',
  sourceCode: cmdCode,
  fileName: 'server.js',
  language: 'JavaScript'
});

console.log('Findings count:', cmdReview.findings.length);
console.log('Detected findings:', cmdReview.findings.map(f => `${f.title} (line ${f.lineStart}, ${f.technicalExplanation.cweId})`));

const hasCmdInj = cmdReview.findings.some(f => f.technicalExplanation.cweId === 'CWE-78' && f.lineStart === 7);
if (!hasCmdInj) {
  console.error('FAILED: Should detect CWE-78 Command Injection at line 7!');
  process.exit(1);
}

console.log('\n=== TEST 3: Weak Crypto & Disabled TLS (CWE-327 & CWE-295) ===');
const cryptoTlsCode = `import hashlib
import requests

def verify_token(token):
    # Line 5: Broken MD5
    token_hash = hashlib.md5(token.encode()).hexdigest()
    # Line 7: Disabled SSL/TLS
    res = requests.get("https://api.internal/check?h=" + token_hash, verify=False)
    return res.json()
`;

const cryptoTlsReview = runFullAnalysis({
  projectType: 'code',
  title: 'Crypto & TLS Test',
  sourceCode: cryptoTlsCode,
  fileName: 'crypto.py',
  language: 'Python'
});

console.log('Findings count:', cryptoTlsReview.findings.length);
console.log('Detected findings:', cryptoTlsReview.findings.map(f => `${f.title} (line ${f.lineStart}, ${f.technicalExplanation.cweId})`));

const hasMd5 = cryptoTlsReview.findings.some(f => f.technicalExplanation.cweId === 'CWE-327' && f.lineStart === 6);
const hasTls = cryptoTlsReview.findings.some(f => f.technicalExplanation.cweId === 'CWE-295' && f.lineStart === 8);

if (!hasMd5) {
  console.error('FAILED: Should detect CWE-327 MD5 at line 6!');
  process.exit(1);
}
if (!hasTls) {
  console.error('FAILED: Should detect CWE-295 disabled TLS at line 8!');
  process.exit(1);
}

console.log('\n=== TEST 4: Hardcoded Password & SQL Injection (Original Screenshot Demo) ===');
const mysqlCode = `import mysql.connector

def authenticate(username, password):
    # Database connection with hardcoded credentials
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="admin123",
        database="users_db"
    )
    cursor = connection.cursor()
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    return cursor.fetchone()
`;

const mysqlReview = runFullAnalysis({
  projectType: 'code',
  title: 'MySQL Login Test',
  sourceCode: mysqlCode,
  fileName: 'login.py',
  language: 'Python'
});

console.log('Findings count:', mysqlReview.findings.length);
console.log('Detected findings:', mysqlReview.findings.map(f => `${f.title} (line ${f.lineStart}, ${f.technicalExplanation.cweId})`));

const hasPassword = mysqlReview.findings.some(f => f.technicalExplanation.cweId === 'CWE-798' && f.lineStart === 8);
const hasSqli = mysqlReview.findings.some(f => f.technicalExplanation.cweId === 'CWE-89' && f.lineStart === 12);

if (!hasPassword) {
  console.error('FAILED: Should detect CWE-798 password at line 8!');
  process.exit(1);
}
if (!hasSqli) {
  console.error('FAILED: Should detect CWE-89 SQL injection at line 12!');
  process.exit(1);
}

console.log('\n✅ ALL ACCURACY TESTS PASSED PERFECTLY!');
