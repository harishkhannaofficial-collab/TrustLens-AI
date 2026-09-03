import { runFullAnalysis } from './src/lib/analyzers/orchestrator.ts';
import { evaluateScamAdviserReputation } from './src/lib/analyzers/websiteDetector.ts';

console.log('=== TRUSTLENS AI: ScamAdviser Reputation Test ===\n');

// Test 1: ScamAdviser Reputation on Unauthorized Website
const phishUrl = 'https://paypal-verify-account.xyz/login?security_update=true';
console.log(`[Test 1] Testing ScamAdviser reputation evaluation on: ${phishUrl}`);
const rating = evaluateScamAdviserReputation(phishUrl);
console.log(`  - Domain: ${rating.domain}`);
console.log(`  - ScamAdviser Trust Score: ${rating.trustScore} / 100`);
console.log(`  - Trust Level: ${rating.trustLevel}`);
console.log(`  - Is Unauthorized: ${rating.isUnauthorized}`);
console.log(`  - Risk Factors:`, rating.riskFactors);

if (!rating.isUnauthorized || rating.trustScore > 30) {
  console.error('❌ Failed: Expected unauthorized flag and low trust score for impersonating domain');
  process.exit(1);
}
console.log('✓ Verified: ScamAdviser correctly flags unauthorized website with low trust score.\n');

// Test 2: Full Review Orchestration with Safety Score Anchoring
console.log(`[Test 2] Running full review analysis on unauthorized website...`);
const review = runFullAnalysis({
  projectType: 'website',
  title: 'Unauthorized Domain Audit: paypal-verify-account.xyz',
  sourceCode: phishUrl,
  fileName: 'URL',
  language: 'HTTP'
});

console.log(`  - Review ID: #${review.id}`);
console.log(`  - Safety Score: ${review.scores.safetyScore}%`);
console.log(`  - Safety Score Source: "${review.scores.safetyScoreSource}"`);
console.log(`  - Deployment Risk: ${review.scores.deploymentRisk}`);
console.log(`  - Deployment Reason: ${review.scores.deploymentRiskReason}`);

if (review.scores.safetyScore !== rating.trustScore) {
  console.error(`❌ Expected Safety Score (${review.scores.safetyScore}) to match ScamAdviser Trust Score (${rating.trustScore})`);
  process.exit(1);
}

if (!review.scores.safetyScoreSource?.includes('ScamAdviser')) {
  console.error('❌ Expected Safety Score source to be ScamAdviser');
  process.exit(1);
}

const scamFinding = review.findings.find(f => f.id === 'web-scamadviser-unauthorized');
if (!scamFinding) {
  console.error('❌ Expected web-scamadviser-unauthorized finding');
  process.exit(1);
}
console.log(`✓ Critical Finding Title: "${scamFinding.title}"`);
console.log(`✓ Finding Analogy: "${scamFinding.simpleExplanation.analogy.slice(0, 70)}..."`);
console.log(`✓ Quiz questions available: ${scamFinding.quiz.length}`);

console.log('\n======================================================');
console.log('🎉 SCAMADVISER SAFETY SCORE INTEGRATION TEST PASSED!');
console.log('======================================================\n');
