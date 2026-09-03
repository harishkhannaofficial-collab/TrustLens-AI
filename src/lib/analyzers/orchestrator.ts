import { Review, ReviewType, Finding, ScamAdviserRating } from '../../types/review';
import { scanSourceCode } from './universalCodeScanner';
import { detectSecrets } from './secretDetector';
import { detectInjection } from './injectionDetector';
import { detectAuthenticationIssues } from './authenticationDetector';
import { detectPrivacyAndLoggingIssues } from './privacyDetector';
import { detectConfigurationIssues } from './configurationDetector';
import { detectInputValidationIssues } from './inputValidationDetector';
import { analyzeSuspiciousMessage } from './suspiciousMessageDetector';
import { analyzeWebsiteUrl, evaluateScamAdviserReputation } from './websiteDetector';
import { calculateSafetyScore } from '../scoring/safetyScorer';
import { calculateUnderstandingScore } from '../scoring/understandingScorer';
import { calculateGroundingScore } from '../evidence/groundingCalculator';
import { evaluateDeploymentRisk } from '../scoring/deploymentRiskEngine';

export interface RunAnalysisParams {
  projectType: ReviewType;
  title: string;
  sourceCode: string;
  fileName?: string;
  language?: string;
  aiOrigin?: string;
  aiRatio?: string;
  projectContext?: string;
}

export function runFullAnalysis(params: RunAnalysisParams): Review {
  const {
    projectType,
    title,
    sourceCode,
    fileName = projectType === 'code' ? 'login.py' : projectType === 'website' ? 'URL' : 'config.env',
    language = projectType === 'website' ? 'HTTP' : 'Python',
    aiOrigin = 'ChatGPT',
    aiRatio = 'Mostly AI generated',
    projectContext = 'Technical verification & risk analysis'
  } = params;

  let allFindings: Finding[] = [];
  let scamAdviserRating: ScamAdviserRating | undefined = undefined;

  if (projectType === 'message') {
    allFindings = analyzeSuspiciousMessage(sourceCode);
    const urlMatch = sourceCode.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      scamAdviserRating = evaluateScamAdviserReputation(urlMatch[0]);
    }
  } else if (projectType === 'website') {
    const webResult = analyzeWebsiteUrl(sourceCode);
    allFindings = webResult.findings;
    scamAdviserRating = webResult.scamAdviserRating;
  } else {
    // Code or Configuration: Execute precision universal vulnerability scanner
    const scanned = scanSourceCode(sourceCode, fileName);
    const validations = detectInputValidationIssues(sourceCode, fileName);

    // Combine and deduplicate by lineStart and cweId
    const seenMap = new Set<string>();
    const combined = [...scanned, ...validations];
    for (const f of combined) {
      const key = `${f.lineStart}-${f.technicalExplanation.cweId}`;
      if (!seenMap.has(key)) {
        seenMap.add(key);
        allFindings.push(f);
      }
    }
  }

  // Deduplicate and assign reviewId
  const reviewId = `TLR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
  allFindings.forEach((f, i) => {
    f.reviewId = reviewId;
    f.id = f.id || `find-${i + 1}`;
  });

  let safetyScore = calculateSafetyScore(allFindings);
  let safetyScoreSource: string | undefined = undefined;

  // KEY REQUIREMENT: If an unauthorized / untrusted website is detected, show safety score based on ScamAdviser
  if (scamAdviserRating && (scamAdviserRating.isUnauthorized || scamAdviserRating.trustScore < 60)) {
    safetyScore = scamAdviserRating.trustScore;
    safetyScoreSource = 'ScamAdviser Domain Reputation Engine';
  }

  const groundingScore = calculateGroundingScore(allFindings);
  const deploymentAssessment = evaluateDeploymentRisk(allFindings, safetyScore, -1, groundingScore);

  let finalRisk = deploymentAssessment.riskLevel;
  let finalReason = deploymentAssessment.reason;

  if (scamAdviserRating?.isUnauthorized) {
    finalRisk = 'CRITICAL';
    finalReason = `ScamAdviser flagged unauthorized domain (${scamAdviserRating.domain}) with Trust Score of ${scamAdviserRating.trustScore}/100. High risk of brand impersonation and credential theft.`;
  }

  const review: Review = {
    id: reviewId,
    title,
    projectType,
    language,
    aiOrigin,
    aiRatio,
    projectContext,
    sourceCode,
    fileName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    findings: allFindings,
    scamAdviserRating,
    scores: {
      safetyScore,
      safetyScoreSource,
      understandingScore: -1, // Initial state is Not Verified until quizzes are taken
      groundingScore,
      deploymentRisk: finalRisk,
      deploymentRiskReason: finalReason
    },
    checklist: {
      codeScanned: true,
      criticalIssuesFixed: allFindings.filter(f => f.severity === 'critical').length === 0,
      understandingVerified: allFindings.length === 0,
      readyToDeploy: allFindings.length === 0
    },
    quizAttempts: {}
  };

  return review;
}
