import { Finding } from '../../types/review';

export function calculateSafetyScore(findings: Finding[]): number {
  if (!findings || findings.length === 0) return 100;

  let score = 100;

  for (const finding of findings) {
    if (finding.status === 'dismissed') {
      // False positive marked - no penalty
      continue;
    }

    if (finding.status === 'resolved') {
      // Small residual tracking penalty (e.g. 1 point) or 0
      continue;
    }

    // Confidence multiplier: e.g. 97% confidence = 0.97
    const confidenceMultiplier = (finding.confidence || 85) / 100;

    let penalty = 0;
    switch (finding.severity) {
      case 'critical':
        penalty = 25 * confidenceMultiplier;
        break;
      case 'high':
        penalty = 15 * confidenceMultiplier;
        break;
      case 'medium':
        penalty = 7 * confidenceMultiplier;
        break;
      case 'low':
        penalty = 3 * confidenceMultiplier;
        break;
    }

    score -= penalty;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
