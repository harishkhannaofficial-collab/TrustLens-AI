import { runFullAnalysis } from './src/lib/analyzers/orchestrator.ts';
import { SCREENSHOT_PYTHON_DEMO, NODE_EXPRESS_DEMO } from './src/lib/storage/demoProject.ts';
import { calculateSafetyScore } from './src/lib/scoring/safetyScorer.ts';
import { calculateUnderstandingScore } from './src/lib/scoring/understandingScorer.ts';
import { evaluateDeploymentRisk } from './src/lib/scoring/deploymentRiskEngine.ts';

console.log('=== TRUSTLENS AI: Automated Verification Test ===\n');

// 1. Run Analysis on Screenshot Demo Code
console.log('[Step 1] Running analysis on Python MySQL login code...');
const review = runFullAnalysis({
  projectType: 'code',
  title: 'Code Review – Login System',
  sourceCode: SCREENSHOT_PYTHON_DEMO,
  fileName: 'login.py',
  language: 'Python',
  aiOrigin: 'ChatGPT',
  aiRatio: 'Mostly AI generated',
  projectContext: 'Database authentication service connecting to MySQL'
});

console.log(`✓ Review created: #${review.id}`);
console.log(`✓ Total findings detected: ${review.findings.length}`);

// 2. Validate Findings
review.findings.forEach((f, i) => {
  console.log(`  Finding ${i + 1}: [${f.severity.toUpperCase()}] ${f.title} (Line ${f.lineStart})`);
  console.log(`    - Analogy: "${f.simpleExplanation.analogy.slice(0, 60)}..."`);
  console.log(`    - CWE Mapping: ${f.technicalExplanation.cweId} - ${f.technicalExplanation.cweTitle}`);
  console.log(`    - Evidence sources: ${f.references.map(r => `${r.organization} (${r.authorityLevel})`).join(', ')}`);
});

const hasHardcodedSecret = review.findings.some(f => f.title.includes('Hard-Coded') || f.title.includes('Credential'));
const hasSqlInjection = review.findings.some(f => f.title.includes('SQL Injection'));

if (!hasHardcodedSecret || !hasSqlInjection) {
  console.error('❌ Failed: Expected hardcoded secret and SQL injection findings!');
  process.exit(1);
}
console.log('✓ Verified: Critical findings detected correctly matching reference UI.\n');

// 3. Check Initial Scores
console.log('[Step 2] Validating Initial Score Calculation:');
console.log(`  - Safety Score: ${review.scores.safetyScore}%`);
console.log(`  - Grounding Score: ${review.scores.groundingScore}%`);
console.log(`  - Understanding Score: ${review.scores.understandingScore} (Not Verified)`);
console.log(`  - Deployment Risk: ${review.scores.deploymentRisk} (${review.scores.deploymentRiskReason})\n`);

if (review.scores.deploymentRisk !== 'CRITICAL' && review.scores.deploymentRisk !== 'HIGH') {
  console.error('❌ Expected HIGH or CRITICAL deployment risk for vulnerable code');
  process.exit(1);
}
console.log('✓ Verified: Deployment Risk Engine flagged unmitigated critical risks.\n');

// 4. Test Quiz Submission & Understanding Score Calculation
console.log('[Step 3] Simulating Quiz Answering:');
const firstFinding = review.findings[0];
const firstQuestion = firstFinding.quiz[0];
const correctOption = firstQuestion.options.find(o => o.isCorrect);

const quizAttempts = {
  [firstQuestion.id]: {
    questionId: firstQuestion.id,
    selectedOptionId: correctOption.id,
    isCorrect: true
  }
};

const underBreakdown = calculateUnderstandingScore(review.findings, quizAttempts);
console.log(`  - Questions attempted: ${underBreakdown.questionsAttempted} / ${underBreakdown.questionsTotal}`);
console.log(`  - Calculated Understanding Score: ${underBreakdown.score}%`);
console.log(`  - Level: ${underBreakdown.level} (${underBreakdown.badge})`);

if (underBreakdown.score <= 0) {
  console.error('❌ Understanding score should be > 0 after correct answer');
  process.exit(1);
}
console.log('✓ Verified: Understanding Score formula successfully updated dynamically.\n');

// 5. Test Finding Resolution & Safety Score Recalculation
console.log('[Step 4] Resolving First Critical Finding:');
const initialSafety = review.scores.safetyScore;
firstFinding.status = 'resolved';

const recalculatedSafety = calculateSafetyScore(review.findings);
console.log(`  - Safety Score changed from ${initialSafety}% -> ${recalculatedSafety}%`);

if (recalculatedSafety <= initialSafety) {
  console.error('❌ Safety score should improve after resolving a finding');
  process.exit(1);
}
console.log('✓ Verified: Safety Score increases upon resolving findings.\n');

// 6. Test Deployment Assessment with Full Resolution
console.log('[Step 5] Testing Fully Verified Ready State:');
review.findings.forEach(f => { f.status = 'resolved'; });
const allResolvedSafety = calculateSafetyScore(review.findings);

// Simulate all quiz questions answered correctly
review.findings.forEach(f => {
  f.quiz.forEach(q => {
    const corr = q.options.find(o => o.isCorrect);
    if (corr) {
      quizAttempts[q.id] = { questionId: q.id, selectedOptionId: corr.id, isCorrect: true };
    }
  });
});

const verifiedUnderstanding = calculateUnderstandingScore(review.findings, quizAttempts);
const verifiedAssessment = evaluateDeploymentRisk(review.findings, allResolvedSafety, verifiedUnderstanding.score, review.scores.groundingScore);

console.log(`  - Final Safety Score: ${allResolvedSafety}%`);
console.log(`  - Final Understanding Score: ${verifiedUnderstanding.score}%`);
console.log(`  - Final Grounding Score: ${review.scores.groundingScore}%`);
console.log(`  - Deployment Risk Level: ${verifiedAssessment.riskLevel}`);
console.log(`  - Readiness Percentage: ${verifiedAssessment.readinessPercentage}%`);
console.log(`  - Gate Passed: ${verifiedAssessment.gatePassed}`);
console.log(`  - Checklist:`, verifiedAssessment.checklist);

if (verifiedAssessment.riskLevel !== 'LOW' || !verifiedAssessment.gatePassed) {
  console.error('❌ Expected LOW risk and gatePassed = true when all critical issues are resolved and quizzes passed');
  process.exit(1);
}

console.log('\n======================================================');
console.log('🎉 ALL TRUSTLENS AI VERIFICATION TESTS PASSED SUCCESSFULLY!');
console.log('======================================================\n');
