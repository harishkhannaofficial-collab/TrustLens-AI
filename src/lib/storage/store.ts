import { Review, FindingStatus } from '../../types/review';
import { getInitialDemoReview } from './demoProject';
import { calculateSafetyScore } from '../scoring/safetyScorer';
import { calculateUnderstandingScore } from '../scoring/understandingScorer';
import { calculateGroundingScore } from '../evidence/groundingCalculator';
import { evaluateDeploymentRisk } from '../scoring/deploymentRiskEngine';

const STORAGE_KEY_REVIEWS = 'trustlens_reviews_v1';
const STORAGE_KEY_ACTIVE_ID = 'trustlens_active_id_v1';

export interface ConceptMastery {
  category: string;
  name: string;
  percentage: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export function loadAllReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!raw) {
      const initial = [getInitialDemoReview()];
      saveAllReviews(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [getInitialDemoReview()];
  } catch (e) {
    return [getInitialDemoReview()];
  }
}

export function saveAllReviews(reviews: Review[]) {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error('Error saving reviews to local storage', e);
  }
}

export function getActiveReviewId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || 'TLR-2024-05-25-001';
  } catch (e) {
    return 'TLR-2024-05-25-001';
  }
}

export function setActiveReviewId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (e) {
    console.error('Error saving active review id', e);
  }
}

import { resolveSingleFinding, applyAllAiFixes, computeFixationRate } from '../scoring/aiRemediationEngine';

export function updateReviewFindingStatus(
  reviewId: string,
  findingId: string,
  newStatus: FindingStatus,
  dismissalReason?: string
): Review | null {
  const reviews = loadAllReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  if (index === -1) return null;

  const review = reviews[index];
  const finding = review.findings.find(f => f.id === findingId);
  if (!finding) return null;

  finding.status = newStatus;
  if (dismissalReason) {
    finding.dismissalReason = dismissalReason;
  }

  if (newStatus === 'resolved') {
    resolveSingleFinding(review, findingId);
  } else {
    // Recalculate scores for dismissed or reset
    review.scores.safetyScore = calculateSafetyScore(review.findings);
    review.scores.groundingScore = calculateGroundingScore(review.findings);
    review.scores.fixationRate = computeFixationRate(review.findings);
    
    const underBreakdown = calculateUnderstandingScore(review.findings, review.quizAttempts);
    review.scores.understandingScore = underBreakdown.score;

    const riskAssess = evaluateDeploymentRisk(
      review.findings,
      review.scores.safetyScore,
      review.scores.understandingScore,
      review.scores.groundingScore
    );
    review.scores.deploymentRisk = riskAssess.riskLevel;
    review.scores.deploymentRiskReason = riskAssess.reason;
    review.checklist = riskAssess.checklist;
    review.updatedAt = new Date().toISOString();
  }

  reviews[index] = review;
  saveAllReviews(reviews);
  return review;
}

/**
 * Applies full AI auto-remediation to all findings in a review, guaranteeing 100% Fixation Rate.
 */
export function applyAiAutoFixAll(reviewId: string): Review | null {
  const reviews = loadAllReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  if (index === -1) return null;

  const review = reviews[index];
  applyAllAiFixes(review);

  reviews[index] = review;
  saveAllReviews(reviews);
  return review;
}

export function submitQuizAnswer(
  reviewId: string,
  questionId: string,
  selectedOptionId: string
): { review: Review; isCorrect: boolean; explanation: string } | null {
  const reviews = loadAllReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  if (index === -1) return null;

  const review = reviews[index];
  
  // Find question
  let targetQuestion = null;
  for (const f of review.findings) {
    const q = f.quiz?.find(item => item.id === questionId);
    if (q) {
      targetQuestion = q;
      break;
    }
  }

  if (!targetQuestion) return null;

  const selectedOpt = targetQuestion.options.find(o => o.id === selectedOptionId);
  const isCorrect = selectedOpt ? selectedOpt.isCorrect : false;

  review.quizAttempts[questionId] = {
    questionId,
    selectedOptionId,
    isCorrect,
    timestamp: new Date().toISOString()
  };

  // Recalculate Understanding Score
  const underBreakdown = calculateUnderstandingScore(review.findings, review.quizAttempts);
  review.scores.understandingScore = underBreakdown.score;

  // Recalculate Deployment Risk
  const riskAssess = evaluateDeploymentRisk(
    review.findings,
    review.scores.safetyScore,
    review.scores.understandingScore,
    review.scores.groundingScore
  );
  review.scores.deploymentRisk = riskAssess.riskLevel;
  review.scores.deploymentRiskReason = riskAssess.reason;
  review.checklist = riskAssess.checklist;
  review.updatedAt = new Date().toISOString();

  reviews[index] = review;
  saveAllReviews(reviews);

  return {
    review,
    isCorrect,
    explanation: targetQuestion.explanation
  };
}

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', title: 'First Review', description: 'Run your first code or config scan with TRUSTLENS', icon: '🔍', unlocked: true, unlockedDate: 'Today' },
  { id: 'ach-2', title: 'Secret Spotter', description: 'Identify and understand an exposed credential risk', icon: '🛡️', unlocked: true, unlockedDate: 'Today' },
  { id: 'ach-3', title: 'Injection Defender', description: 'Complete SQL injection knowledge verification quiz', icon: '⚔️', unlocked: false },
  { id: 'ach-4', title: 'Evidence Explorer', description: 'Inspect authoritative citations from NIST or OWASP', icon: '📚', unlocked: true, unlockedDate: 'Today' },
  { id: 'ach-5', title: 'Understanding Verified', description: 'Reach >= 80% Understanding Score on a project', icon: '🎓', unlocked: false },
  { id: 'ach-6', title: 'Safe Deployer', description: 'Achieve TRUSTLENS Verified Ready state for production', icon: '🚀', unlocked: false },
];

export const DEFAULT_CONCEPT_MASTERY: ConceptMastery[] = [
  { category: 'secrets', name: 'Secrets & Key Management', percentage: 90 },
  { category: 'authentication', name: 'Authentication Mechanisms', percentage: 72 },
  { category: 'validation', name: 'Input Validation & Sanitation', percentage: 68 },
  { category: 'injection', name: 'Injection Prevention', percentage: 55 },
  { category: 'api', name: 'API & Configuration Security', percentage: 41 },
];
