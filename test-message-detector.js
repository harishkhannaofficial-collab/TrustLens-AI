import { analyzeSuspiciousMessage } from './src/lib/analyzers/suspiciousMessageDetector.ts';
import { runFullAnalysis } from './src/lib/analyzers/orchestrator.ts';

console.log('=== TEST 1: SMS Smishing (USPS Parcel Delivery On Hold) ===');
const smsMessage = `[USPS Alert]: Your package is on hold at our distribution terminal due to an incomplete address.
Action required now within 24 hours to avoid package return: http://usps-redelivery-tracking.xyz/update`;
const smsFindings = analyzeSuspiciousMessage(smsMessage);
console.log('SMS findings detected:', smsFindings.length);
smsFindings.forEach(f => console.log(`  - [${f.severity}] ${f.title} (line ${f.lineStart}): ${f.vulnerableSnippet}`));
if (smsFindings.length < 2) {
  console.error('FAILED: Expected urgency + delivery smish + link findings!');
  process.exit(1);
}

console.log('\n=== TEST 2: WhatsApp Relative Impersonation Scam ===');
const waMessage = `Hi mum, I dropped my phone in the water and broke it.
This is my new number, please save this.
Can you transfer $450 urgently via Zelle to pay this invoice for me?`;
const waFindings = analyzeSuspiciousMessage(waMessage);
console.log('WhatsApp findings detected:', waFindings.length);
waFindings.forEach(f => console.log(`  - [${f.severity}] ${f.title} (line ${f.lineStart}): ${f.vulnerableSnippet}`));
if (!waFindings.some(f => f.title.includes('Relative') || f.title.includes('Impersonation'))) {
  console.error('FAILED: WhatsApp family emergency scam not detected!');
  process.exit(1);
}

console.log('\n=== TEST 3: Telegram Task Scam & Crypto Airdrop ===');
const tgMessage = `Part-time job opportunity! Earn $500 daily by reviewing apps and liking YouTube videos.
No experience needed. Contact our HR on Telegram @manager_crypto.
Claim free 5,000 USDT airdrop now: t.me/airdrop_claim_bot`;
const tgFindings = analyzeSuspiciousMessage(tgMessage);
console.log('Telegram findings detected:', tgFindings.length);
tgFindings.forEach(f => console.log(`  - [${f.severity}] ${f.title} (line ${f.lineStart}): ${f.vulnerableSnippet}`));
if (tgFindings.length < 2) {
  console.error('FAILED: Telegram task scam or crypto airdrop not detected!');
  process.exit(1);
}

console.log('\n=== TEST 4: Corporate Email BEC / Password Expiry ===');
const emailMessage = `From: IT Helpdesk <support@company-portal-update.com>
Subject: Immediate Action Required: Your Microsoft 365 password will expire today
Mailbox quota exceeded. Please review document and keep current password within 2 hours:
http://bit.ly/m365-pass-keep`;
const emailFindings = analyzeSuspiciousMessage(emailMessage);
console.log('Email findings detected:', emailFindings.length);
emailFindings.forEach(f => console.log(`  - [${f.severity}] ${f.title} (line ${f.lineStart}): ${f.vulnerableSnippet}`));
if (!emailFindings.some(f => f.title.includes('Business Email Compromise') || f.title.includes('BEC'))) {
  console.error('FAILED: Email corporate phishing not detected!');
  process.exit(1);
}

console.log('\n=== TEST 5: Clean Benign Message (Zero False Positives) ===');
const cleanMessage = `Hey Alice, hope you are having a wonderful Friday!
Please check the shared project deck before our Monday sync.
Let me know if you want to grab lunch after the meeting. Best, David`;
const cleanFindings = analyzeSuspiciousMessage(cleanMessage);
console.log('Clean message findings count:', cleanFindings.length);
if (cleanFindings.length !== 0) {
  console.error('FAILED: Clean message triggered false positives!');
  process.exit(1);
}

console.log('\n=== TEST 6: Full Orchestrator Integration with ScamAdviser URL Scoring ===');
const review = runFullAnalysis({
  projectType: 'message',
  title: 'Smishing Check',
  sourceCode: smsMessage
});
console.log('Orchestrator Safety Score:', review.scores.safetyScore);
console.log('Orchestrator Deployment Risk:', review.scores.deploymentRisk);
console.log('ScamAdviser Rating Domain:', review.scamAdviserRating?.domain);
console.log('ScamAdviser Trust Score:', review.scamAdviserRating?.trustScore);

if (review.scores.deploymentRisk !== 'CRITICAL' && review.scores.deploymentRisk !== 'HIGH') {
  console.error('FAILED: Malicious message should have CRITICAL or HIGH risk!');
  process.exit(1);
}

console.log('\n✅ ALL SUSPICIOUS MESSAGE DETECTION TESTS PASSED WITH 100% ACCURACY!');
