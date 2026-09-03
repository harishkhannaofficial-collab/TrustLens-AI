import { runFullAnalysis } from './src/lib/analyzers/orchestrator.ts';
import { applyAllAiFixes, resolveSingleFinding, computeFixationRate } from './src/lib/scoring/aiRemediationEngine.ts';

console.log('=== TEST 1: Initial Analysis of Vulnerable Python Login ===');
const mysqlCode = `import mysql.connector

def authenticate(username, password):
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

const review = runFullAnalysis({
  projectType: 'code',
  title: 'Fixation Test',
  sourceCode: mysqlCode,
  fileName: 'login.py',
  language: 'Python'
});

console.log('Initial findings count:', review.findings.length);
console.log('Initial safety score:', review.scores.safetyScore);
console.log('Initial fixation rate:', computeFixationRate(review.findings) + '%');

console.log('\n=== TEST 2: Resolving Single Finding (Partial Fixation) ===');
const f1 = review.findings[0];
resolveSingleFinding(review, f1.id);

console.log('Finding 1 status:', f1.status);
console.log('Post-single resolve safety score:', review.scores.safetyScore);
console.log('Post-single resolve fixation rate:', review.scores.fixationRate + '%');

console.log('\n=== TEST 3: Applying 100% AI Auto-Fixation ===');
applyAllAiFixes(review);

console.log('All findings resolved?:', review.findings.every(f => f.status === 'resolved'));
console.log('Final Fixation Rate:', review.scores.fixationRate + '%');
console.log('Final Safety Score:', review.scores.safetyScore + '%');
console.log('Final Deployment Risk:', review.scores.deploymentRisk);
console.log('Ready to Deploy:', review.checklist.readyToDeploy);
console.log('Remediated Source Code contains password="admin123"?:', review.sourceCode.includes('password="admin123"'));
console.log('Remediated Source Code contains parameterized query?:', review.sourceCode.includes('%s'));

if (review.scores.fixationRate !== 100) {
  console.error('FAILED: Fixation rate must be 100%!');
  process.exit(1);
}
if (review.scores.safetyScore !== 100) {
  console.error('FAILED: Safety score must be 100%!');
  process.exit(1);
}
if (review.scores.deploymentRisk !== 'LOW') {
  console.error('FAILED: Deployment risk must be LOW!');
  process.exit(1);
}
if (review.sourceCode.includes('password="admin123"')) {
  console.error('FAILED: Source code should have been remediated!');
  process.exit(1);
}

console.log('\n✅ ALL 100% FIXATION RATE TESTS PASSED PERFECTLY!');
