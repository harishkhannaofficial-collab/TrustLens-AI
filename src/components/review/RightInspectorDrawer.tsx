import React, { useState } from 'react';
import { Finding, Review } from '../../types/review';
import { 
  Lightbulb, 
  BookOpen, 
  Wrench, 
  GraduationCap, 
  Microscope, 
  Laptop, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RightInspectorDrawerProps {
  finding: Finding | null;
  review: Review;
  onSubmitQuiz: (questionId: string, selectedOptionId: string) => void;
  onApplyFix: (finding: Finding) => void;
  onResolveAllFixes?: () => void;
}

export type InspectorTab = 'explain' | 'evidence' | 'fix' | 'verify' | 'practice' | 'technical';

export const RightInspectorDrawer: React.FC<RightInspectorDrawerProps> = ({
  finding,
  review,
  onSubmitQuiz,
  onApplyFix,
  onResolveAllFixes
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('explain');
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, string>>({});
  const [showLineBreakdown, setShowLineBreakdown] = useState(false);
  const [copiedFix, setCopiedFix] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);

  if (!finding) {
    const isCleanCode = review.findings.length === 0;

    return (
      <aside className="w-full lg:w-96 xl:w-[420px] flex-shrink-0 liquid-glass-card rounded-2xl p-6 flex flex-col gap-5 text-left text-slate-400 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isCleanCode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-500/20 text-brand-400'}`}>
            {isCleanCode ? <CheckCircle2 className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {isCleanCode ? 'Secure Architecture Verified' : 'Inspector Ready'}
            </h3>
            <span className="text-[11px] text-slate-400 block">
              {isCleanCode ? 'Zero Security Flaws Detected' : 'Select an issue to view guidance'}
            </span>
          </div>
        </div>

        {isCleanCode ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 text-xs text-slate-300 flex flex-col gap-2">
              <span className="font-bold text-white text-xs">🛡️ What TRUSTLENS Verified:</span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> No hardcoded passwords, tokens, or private keys
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Database queries are safely parameterized
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> No arbitrary OS shell executions (CWE-78)
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Transport layer security verification intact
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> No unsafe deserialization (CWE-502)
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 text-xs text-slate-400 flex flex-col gap-2">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                Pre-Deployment Checklist:
              </span>
              <p className="text-[11px] leading-relaxed">
                Before releasing to production, ensure runtime secrets are configured in your cloud environment (.env / Secret Manager), dependencies are scanned via npm/pip audit, and automated test suites pass.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 text-xs text-slate-400">
            Click any issue in the center list to view simple real-world analogies, authoritative evidence citations, safe remediation diffs, and understanding verification quizzes.
          </div>
        )}
      </aside>
    );
  }

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedQuizAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleCheckAnswer = (questionId: string) => {
    const selectedOptionId = selectedQuizAnswers[questionId];
    if (!selectedOptionId) return;

    onSubmitQuiz(questionId, selectedOptionId);

    // If answer is correct, trigger subtle celebratory confetti
    const question = finding.quiz?.find(q => q.id === questionId);
    const chosen = question?.options.find(o => o.id === selectedOptionId);
    if (chosen?.isCorrect) {
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // confetti fallback
      }
    }
  };

  const copyFix = () => {
    navigator.clipboard.writeText(finding.recommendedSnippet);
    setCopiedFix(true);
    setTimeout(() => setCopiedFix(false), 2000);
  };

  const checkPracticeAnswer = () => {
    if (practiceAnswer.toLowerCase().includes('process.env') || practiceAnswer.toLowerCase().includes('env') || practiceAnswer.toLowerCase().includes('getenv')) {
      setPracticeFeedback('✅ Excellent! You correctly identified that sensitive keys should be loaded from environment variables rather than embedded in code.');
    } else {
      setPracticeFeedback('💡 Hint: Sensitive API keys must be retrieved from runtime environment variables (e.g. process.env.KEY or os.environ.get). Try referencing an environment variable.');
    }
  };

  return (
    <aside className="w-full lg:w-96 xl:w-[430px] flex-shrink-0 flex flex-col gap-4">
      
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between liquid-glass-card p-1.5 rounded-2xl border border-white/10 text-xs overflow-x-auto shadow-md">
        <button
          onClick={() => setActiveTab('explain')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'explain'
              ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Explain</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'evidence'
              ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-accent-purple" />
          <span>Evidence</span>
        </button>

        <button
          onClick={() => setActiveTab('fix')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'fix'
              ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fix It</span>
        </button>

        <button
          onClick={() => setActiveTab('verify')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'verify'
              ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Test Me</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'practice'
              ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Laptop className="w-3.5 h-3.5 text-violet-400" />
          <span>Practice</span>
        </button>
      </div>

      {/* Tab 1: Explain It Simply matching screenshot */}
      {activeTab === 'explain' && (
        <div className="flex flex-col gap-4">
          
          {/* Main Explain Card */}
          <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Explain It Simply</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {finding.description}
            </p>

            {/* Analogy Box matching screenshot */}
            <div className="p-3.5 rounded-lg bg-dark-800/80 border border-brand-500/25 flex items-start gap-3">
              <div className="p-1 rounded bg-brand-500/20 text-brand-400 flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <p className="text-xs text-brand-200/90 leading-relaxed">
                {finding.simpleExplanation.analogy}
              </p>
            </div>

            {/* Why Should I Care Section */}
            <div className="pt-2 border-t border-dark-750 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-200">
                Why Should I Care?
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {finding.simpleExplanation.whyCare}
              </p>
            </div>

            {/* Real World Impact */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Real-World Impact:
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {finding.simpleExplanation.realWorldImpact.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Peek: Why Is This an Issue? matching screenshot right panel */}
          <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <BookOpen className="w-4 h-4 text-accent-purple" />
                <span>Why Is This an Issue?</span>
              </div>
              <button
                onClick={() => setActiveTab('evidence')}
                className="text-[11px] text-brand-400 hover:text-brand-300 font-medium"
              >
                View Citations
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              According to OWASP & Security Best Practices:
            </p>
            <ul className="space-y-1 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span>Never store credentials in source code.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span>Use environment variables or secure vaults.</span>
              </li>
            </ul>

            {finding.references[0] && (
              <a
                href={finding.references[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium mt-1 group"
              >
                <span>{finding.references[0].title}</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>

          {/* CTA to Fix & Verify */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('fix')}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>See Safe Fix</span>
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-brand-600/20 text-brand-400 border border-brand-500/30 hover:bg-brand-600/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Take Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Authoritative Evidence / Why is this an issue? */}
      {activeTab === 'evidence' && (
        <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
              <BookOpen className="w-4 h-4 text-accent-purple" />
              <span>Why Is TRUSTLENS Telling Me This?</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-dark-750 px-2 py-0.5 rounded">
              Grounding Engine
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Every finding in TRUSTLENS AI is backed by authoritative security guidance from official standards bodies, vendors, and security foundations.
          </p>

          <div className="flex flex-col gap-3">
            {finding.references.map((ref) => {
              const levelBadge = {
                LEVEL_A: { label: 'Level A: Standard', bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
                LEVEL_B: { label: 'Level B: Vendor Doc', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
                LEVEL_C: { label: 'Level C: OWASP', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                LEVEL_D: { label: 'Level D: Community', bg: 'bg-slate-500/20 text-slate-400 border-slate-500/30' }
              }[ref.authorityLevel];

              return (
                <div key={ref.id} className="p-3.5 rounded-xl bg-dark-800 border border-dark-700/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      {ref.organization}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${levelBadge.bg}`}>
                      {levelBadge.label}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-brand-300">
                    {ref.title}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ref.summary}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500 font-mono">
                      Verified: {ref.verifiedDate || '2024'}
                    </span>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold"
                    >
                      <span>View Official Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Recommended Fix matching screenshot */}
      {activeTab === 'fix' && (
        <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span>Recommended Fix</span>
            </div>
            <button
              onClick={copyFix}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-1 rounded bg-dark-750 transition-colors"
            >
              {copiedFix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFix ? 'Copied' : 'Copy Fix'}</span>
            </button>
          </div>

          {/* Unsafe vs Safe Comparison matching screenshot */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Unsafe Code */}
              <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-rose-950/25 border border-rose-500/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Unsafe Code
                </span>
                <pre className="font-mono text-xs text-rose-200 whitespace-pre-wrap overflow-x-auto">
                  {finding.vulnerableSnippet}
                </pre>
              </div>

              {/* Safe Code */}
              <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-emerald-950/25 border border-emerald-500/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Safe Code
                </span>
                <pre className="font-mono text-xs text-emerald-200 whitespace-pre-wrap overflow-x-auto">
                  {finding.recommendedSnippet}
                </pre>
              </div>
            </div>
          </div>

          {/* Explanation of Changes */}
          <div className="flex flex-col gap-1 text-xs text-slate-300">
            <span className="font-bold text-white">What Changed?</span>
            <p className="text-slate-400 leading-relaxed">
              {finding.remediation.whatChanged}
            </p>
          </div>

          <div className="flex flex-col gap-1 text-xs text-slate-300">
            <span className="font-bold text-white">Why Is This Better?</span>
            <p className="text-slate-400 leading-relaxed">
              {finding.remediation.whyBetter}
            </p>
          </div>

          {finding.remediation.additionalSteps && (
            <div className="p-2.5 rounded-lg bg-dark-800 border border-dark-700 text-xs">
              <span className="font-bold text-amber-400 block mb-0.5">Additional Step Required:</span>
              <p className="text-slate-400 leading-relaxed">
                {finding.remediation.additionalSteps}
              </p>
            </div>
          )}

          {/* Line-by-line breakdown toggle */}
          {finding.remediation.lineExplanations && finding.remediation.lineExplanations.length > 0 && (
            <div className="pt-2 border-t border-dark-750">
              <button
                onClick={() => setShowLineBreakdown(!showLineBreakdown)}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showLineBreakdown ? 'Hide Line Breakdown' : 'Explain Every Change Line-by-Line'}</span>
              </button>

              {showLineBreakdown && (
                <div className="mt-2 space-y-2">
                  {finding.remediation.lineExplanations.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-dark-800 border border-dark-700 text-xs flex flex-col gap-1">
                      <span className="font-mono text-brand-300 font-semibold">{item.code}</span>
                      <span className="text-slate-300 font-medium">{item.part}</span>
                      <p className="text-slate-400 text-[11px]">{item.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Live Fixation Progress Indicator */}
          <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>AI Fixation Rate:</span>
              </span>
              <span className={`font-mono font-bold ${
                (review.findings.length > 0 ? Math.round((review.findings.filter(f => f.status === 'resolved' || f.status === 'dismissed').length / review.findings.length) * 100) : 100) === 100 
                  ? 'text-emerald-400' 
                  : 'text-brand-400'
              }`}>
                {review.findings.length > 0 ? Math.round((review.findings.filter(f => f.status === 'resolved' || f.status === 'dismissed').length / review.findings.length) * 100) : 100}% ({review.findings.filter(f => f.status === 'resolved' || f.status === 'dismissed').length}/{review.findings.length} Fixed)
              </span>
            </div>
            <div className="w-full bg-dark-750 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  (review.findings.length > 0 ? Math.round((review.findings.filter(f => f.status === 'resolved' || f.status === 'dismissed').length / review.findings.length) * 100) : 100) === 100 
                    ? 'bg-emerald-500 liquid-glow-emerald' 
                    : 'bg-gradient-to-r from-brand-600 to-accent-violet'
                }`}
                style={{ width: `${Math.max(5, review.findings.length > 0 ? Math.round((review.findings.filter(f => f.status === 'resolved' || f.status === 'dismissed').length / review.findings.length) * 100) : 100)}%` }}
              />
            </div>
          </div>

          {/* Action Buttons: 100% Fixation Rate Auto-Fix + Single Finding Resolution */}
          <div className="flex flex-col gap-2 pt-1">
            {onResolveAllFixes && review.findings.some(f => f.status === 'unresolved') && (
              <button
                type="button"
                onClick={() => onResolveAllFixes()}
                className="liquid-btn-primary w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg text-xs flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>⚡ Apply All AI Fixes (Reach 100% Fixation Rate)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onApplyFix(finding)}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all active:scale-98 flex items-center justify-center gap-2 ${
                finding.status === 'resolved'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {finding.status === 'resolved' ? '✓ Marked Resolved & Recalculated' : 'Mark Resolved & Recalculate Query'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Verify Your Understanding (Interactive Quiz) matching screenshot */}
      {activeTab === 'verify' && (
        <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Verify Your Understanding</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded border border-brand-500/30">
              Interactive Test
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Answer the questions to demonstrate comprehension and unlock the <strong className="text-slate-200">TRUSTLENS Verified</strong> deployment readiness state.
          </p>

          {/* Quiz Question Cards */}
          <div className="flex flex-col gap-4">
            {finding.quiz && finding.quiz.map((q, qIndex) => {
              const attempt = review.quizAttempts[q.id];
              const selectedOptionId = selectedQuizAnswers[q.id] || attempt?.selectedOptionId;
              const hasAttempted = !!attempt;

              return (
                <div key={q.id} className="p-3.5 rounded-xl bg-dark-800 border border-dark-700 flex flex-col gap-3">
                  <span className="text-xs font-semibold text-slate-200 leading-snug">
                    {qIndex + 1}. {q.question}
                  </span>

                  {/* Options matching screenshot A, B, C, D */}
                  <div className="flex flex-col gap-1.5">
                    {q.options.map((opt, optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx] || `${optIdx + 1}`;
                      const isSelected = selectedOptionId === opt.id;
                      const isCorrect = opt.isCorrect;

                      let optClasses = 'border-dark-700 bg-dark-850/80 text-slate-300 hover:bg-dark-750';
                      
                      if (hasAttempted) {
                        if (isCorrect) {
                          optClasses = 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300 font-medium';
                        } else if (isSelected && !isCorrect) {
                          optClasses = 'border-rose-500/50 bg-rose-950/30 text-rose-300';
                        }
                      } else if (isSelected) {
                        optClasses = 'border-brand-500 bg-brand-600/20 text-white font-medium shadow-sm';
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => !hasAttempted && handleOptionSelect(q.id, opt.id)}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2.5 transition-all cursor-pointer ${optClasses}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-dark-750 flex items-center justify-center font-mono font-bold text-[11px] text-slate-300 flex-shrink-0">
                              {letter}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {hasAttempted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          )}
                          {hasAttempted && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Check Answer Button matching screenshot */}
                  {!hasAttempted ? (
                    <button
                      onClick={() => handleCheckAnswer(q.id)}
                      disabled={!selectedQuizAnswers[q.id]}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
                        selectedQuizAnswers[q.id]
                          ? 'bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet text-white active:scale-98 shadow-brand-600/25'
                          : 'bg-dark-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="p-3 rounded-lg bg-dark-850 border border-dark-700 text-xs flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {attempt.isCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct!
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Review Concept
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Practice Mode */}
      {activeTab === 'practice' && (
        <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
            <Laptop className="w-4 h-4 text-violet-400" />
            <span>Practice Similar Concept</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Test whether you can transfer this concept to a new, different codebase scenario.
          </p>

          <div className="p-3 rounded-lg bg-dark-800 border border-dark-700 flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-200">
              {finding.practiceScenario?.prompt || 'Another developer wrote this code. How should it be refactored?'}
            </span>
            <pre className="p-2.5 rounded bg-dark-900 font-mono text-xs text-amber-300 border border-dark-750 overflow-x-auto">
              {finding.practiceScenario?.unsafeSnippet || 'stripe_key = "sk_live_99887766"'}
            </pre>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              Your Safe Implementation / Proposed Fix:
            </label>
            <textarea
              value={practiceAnswer}
              onChange={(e) => setPracticeAnswer(e.target.value)}
              placeholder="e.g. stripe_key = process.env.STRIPE_KEY"
              rows={3}
              className="w-full p-2.5 rounded-lg bg-dark-900 border border-dark-700 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            onClick={checkPracticeAnswer}
            disabled={!practiceAnswer.trim()}
            className="w-full py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white disabled:bg-dark-700 disabled:text-slate-500 transition-colors"
          >
            Submit Practice Answer
          </button>

          {practiceFeedback && (
            <div className="p-3 rounded-lg bg-dark-800 border border-dark-700 text-xs text-slate-300 leading-relaxed">
              {practiceFeedback}
            </div>
          )}
        </div>
      )}

    </aside>
  );
};
