import { Finding, DeploymentRiskLevel } from '../../types/review';

export interface DeploymentAssessment {
  riskLevel: DeploymentRiskLevel;
  riskColor: string;
  badgeText: string;
  reason: string;
  recommendedAction: string;
  readinessPercentage: number;
  gatePassed: boolean;
  checklist: {
    codeScanned: boolean;
    issuesFixed: boolean;
    understandingVerified: boolean;
    readyToDeploy: boolean;
  };
  metrics: {
    unresolvedCritical: number;
    unresolvedHigh: number;
    unresolvedMedium: number;
    unresolvedLow: number;
    resolvedCount: number;
  };
}

export function evaluateDeploymentRisk(
  findings: Finding[],
  safetyScore: number,
  understandingScore: number, // -1 if not attempted
  groundingScore: number
): DeploymentAssessment {
  const unresolved = findings.filter(f => f.status === 'unresolved');
  const unresolvedCritical = unresolved.filter(f => f.severity === 'critical').length;
  const unresolvedHigh = unresolved.filter(f => f.severity === 'high').length;
  const unresolvedMedium = unresolved.filter(f => f.severity === 'medium').length;
  const unresolvedLow = unresolved.filter(f => f.severity === 'low').length;
  const resolvedCount = findings.filter(f => f.status === 'resolved' || f.status === 'dismissed').length;

  const isUnderstandingVerified = understandingScore >= 80;
  const areCriticalAndHighResolved = (unresolvedCritical === 0 && unresolvedHigh === 0);

  // Calculate readiness percentage (0 - 100)
  // Scanned = 25%, Issues resolved = 35%, Understanding verified = 40%
  let readiness = 25; // Base for scanned
  if (findings.length === 0) {
    readiness = 100;
  } else {
    const totalIssues = findings.length;
    const issueResolutionRatio = resolvedCount / totalIssues;
    readiness += Math.round(issueResolutionRatio * 35);
    
    if (understandingScore > 0) {
      readiness += Math.round((Math.min(100, understandingScore) / 100) * 40);
    }
  }

  // Determine Risk Level
  let riskLevel: DeploymentRiskLevel = 'LOW';
  let riskColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
  let badgeText = '🟢 LOW DEPLOYMENT RISK';
  let reason = 'No critical or high issues remain. Security posture and understanding appear aligned.';
  let recommendedAction = 'Proceed with standard staging deployment and continuous monitoring.';

  if (unresolvedCritical > 0) {
    riskLevel = 'CRITICAL';
    riskColor = 'text-red-500 bg-red-950/40 border-red-500/40';
    badgeText = '🚨 CRITICAL DEPLOYMENT RISK';
    reason = `${unresolvedCritical} critical security vulnerability${unresolvedCritical > 1 ? 'ies' : ''} detected that could lead to immediate unauthorized access or compromise.`;
    recommendedAction = 'Do not deploy. Remediate critical vulnerabilities and verify understanding before deploying.';
  } else if (unresolvedHigh > 0 || (understandingScore !== -1 && understandingScore < 50)) {
    riskLevel = 'HIGH';
    riskColor = 'text-red-500 bg-red-950/30 border-red-500/30';
    badgeText = '🔴 HIGH DEPLOYMENT RISK';
    const issuesPart = unresolvedHigh > 0 ? `${unresolvedHigh} high-severity issue${unresolvedHigh > 1 ? 's remain' : ' remains'} unresolved.` : '';
    const underPart = (understandingScore !== -1 && understandingScore < 50) ? `Understanding score is low (${understandingScore}%).` : 'Understanding has not been sufficiently verified.';
    reason = `${issuesPart} ${underPart}`.trim();
    recommendedAction = 'Resolve high-severity findings and complete understanding verification quizzes before deployment.';
  } else if (unresolvedMedium > 0 || safetyScore < 80 || (understandingScore !== -1 && understandingScore < 75)) {
    riskLevel = 'MEDIUM';
    riskColor = 'text-yellow-400 bg-yellow-950/30 border-yellow-500/30';
    badgeText = '🟡 MEDIUM DEPLOYMENT RISK';
    reason = `${unresolvedMedium} medium-priority issue${unresolvedMedium > 1 ? 's remain' : ' remains'} unresolved. Code review recommended.`;
    recommendedAction = 'Review remaining recommendations and complete knowledge checks.';
  }

  // Verification Gate condition:
  // Critical = 0, High = 0, Safety >= 85, Understanding >= 80, Grounding >= 75
  const gatePassed = (
    unresolvedCritical === 0 &&
    unresolvedHigh === 0 &&
    safetyScore >= 85 &&
    understandingScore >= 80 &&
    groundingScore >= 75
  );

  return {
    riskLevel,
    riskColor,
    badgeText,
    reason,
    recommendedAction,
    readinessPercentage: Math.min(100, Math.max(10, readiness)),
    gatePassed,
    checklist: {
      codeScanned: true,
      issuesFixed: areCriticalAndHighResolved,
      understandingVerified: isUnderstandingVerified,
      readyToDeploy: gatePassed,
    },
    metrics: {
      unresolvedCritical,
      unresolvedHigh,
      unresolvedMedium,
      unresolvedLow,
      resolvedCount,
    }
  };
}
