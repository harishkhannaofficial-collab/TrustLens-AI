import { Finding, AuthorityLevel } from '../../types/review';

const AUTHORITY_WEIGHTS: Record<AuthorityLevel, number> = {
  LEVEL_A: 1.0,  // NIST, MITRE, CISA
  LEVEL_B: 0.85, // Official vendor / framework docs (MDN, Node.js, Python, AWS)
  LEVEL_C: 0.75, // OWASP
  LEVEL_D: 0.50, // Community / secondary
};

export function calculateGroundingScore(findings: Finding[]): number {
  if (!findings || findings.length === 0) return 100;

  let totalWeight = 0;
  let accumulatedScore = 0;

  for (const finding of findings) {
    if (!finding.references || finding.references.length === 0) {
      // Unbacked finding pulls grounding down
      totalWeight += 1;
      accumulatedScore += 0.3; // Low baseline for ungrounded claims
      continue;
    }

    // Find best authority source for this finding
    let maxAuthorityWeight = 0;
    for (const ref of finding.references) {
      const weight = AUTHORITY_WEIGHTS[ref.authorityLevel] || 0.5;
      if (weight > maxAuthorityWeight) {
        maxAuthorityWeight = weight;
      }
    }

    // Multi-source bonus: if backed by both Level A and Level C (e.g. CWE + OWASP)
    const hasMultipleLevels = new Set(finding.references.map(r => r.authorityLevel)).size > 1;
    const completenessBonus = hasMultipleLevels ? 0.05 : 0;

    const findingScore = Math.min(1.0, maxAuthorityWeight + completenessBonus);
    
    // Weight critical and high findings more heavily in grounding assessment
    const findingImportance = finding.severity === 'critical' ? 1.5 : finding.severity === 'high' ? 1.2 : 1.0;
    
    accumulatedScore += findingScore * findingImportance;
    totalWeight += findingImportance;
  }

  if (totalWeight === 0) return 90;

  const score = Math.round((accumulatedScore / totalWeight) * 100);
  return Math.max(10, Math.min(100, score));
}
