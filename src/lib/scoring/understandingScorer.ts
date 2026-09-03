import { Finding } from '../../types/review';

export interface UnderstandingBreakdown {
  score: number; // -1 if not attempted yet
  level: string;
  levelColor: string;
  badge: string;
  identification: number; // 0 - 100
  reasoning: number;      // 0 - 100
  fixSelection: number;   // 0 - 100
  scenarioTransfer: number; // 0 - 100
  questionsAttempted: number;
  questionsTotal: number;
}

export function calculateUnderstandingScore(
  findings: Finding[],
  quizAttempts: Record<string, { questionId: string; selectedOptionId: string; isCorrect: boolean }>
): UnderstandingBreakdown {
  // Collect all questions across all findings
  const allQuestions = findings.flatMap(f => f.quiz || []);
  const totalQuestions = allQuestions.length;

  if (totalQuestions === 0) {
    return {
      score: -1,
      level: 'Not Verified',
      levelColor: 'text-slate-400',
      badge: '⚪ Not Verified',
      identification: 0,
      reasoning: 0,
      fixSelection: 0,
      scenarioTransfer: 0,
      questionsAttempted: 0,
      questionsTotal: 0
    };
  }

  const categoryStats: Record<'identification' | 'reasoning' | 'fix' | 'scenario', { correct: number; total: number }> = {
    identification: { correct: 0, total: 0 },
    reasoning: { correct: 0, total: 0 },
    fix: { correct: 0, total: 0 },
    scenario: { correct: 0, total: 0 }
  };

  let attemptedCount = 0;

  for (const q of allQuestions) {
    const cat = q.category || 'identification';
    categoryStats[cat].total += 1;

    const attempt = quizAttempts[q.id];
    if (attempt) {
      attemptedCount += 1;
      if (attempt.isCorrect) {
        categoryStats[cat].correct += 1;
      }
    }
  }

  if (attemptedCount === 0) {
    return {
      score: -1,
      level: 'Not Verified',
      levelColor: 'text-slate-400',
      badge: '⚪ Not Verified',
      identification: 0,
      reasoning: 0,
      fixSelection: 0,
      scenarioTransfer: 0,
      questionsAttempted: 0,
      questionsTotal: totalQuestions
    };
  }

  // Calculate percentage per category (default to 0 if none attempted)
  const calcPct = (cat: 'identification' | 'reasoning' | 'fix' | 'scenario') => {
    const s = categoryStats[cat];
    return s.total > 0 ? (s.correct / s.total) * 100 : 100;
  };

  const idScore = calcPct('identification');
  const reasonScore = calcPct('reasoning');
  const fixScore = calcPct('fix');
  const scenScore = calcPct('scenario');

  // Weighted formula: Identification 30%, Reasoning 25%, Fix Selection 25%, Scenario Transfer 20%
  const weightedScore = (idScore * 0.30) + (reasonScore * 0.25) + (fixScore * 0.25) + (scenScore * 0.20);
  
  // Scale down if user only answered a fraction of the quiz questions
  const coverageRatio = Math.min(1.0, attemptedCount / Math.max(1, totalQuestions));
  const finalScore = Math.round(weightedScore * coverageRatio);

  let level = 'Limited Understanding';
  let levelColor = 'text-rose-400';
  let badge = '🔴 Limited Understanding';

  if (finalScore >= 90) {
    level = 'TRUSTLENS Verified Understanding';
    levelColor = 'text-emerald-400';
    badge = '🟢 TRUSTLENS Verified';
  } else if (finalScore >= 80) {
    level = 'Strong Understanding';
    levelColor = 'text-emerald-400';
    badge = '🟢 Strong Understanding';
  } else if (finalScore >= 60) {
    level = 'Good Understanding';
    levelColor = 'text-amber-400';
    badge = '🟡 Good Understanding';
  } else if (finalScore >= 40) {
    level = 'Developing Understanding';
    levelColor = 'text-orange-400';
    badge = '🟠 Developing Understanding';
  }

  return {
    score: finalScore,
    level,
    levelColor,
    badge,
    identification: Math.round(idScore),
    reasoning: Math.round(reasonScore),
    fixSelection: Math.round(fixScore),
    scenarioTransfer: Math.round(scenScore),
    questionsAttempted: attemptedCount,
    questionsTotal: totalQuestions
  };
}
