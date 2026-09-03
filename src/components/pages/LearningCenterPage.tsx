import React, { useState, useRef } from 'react';
import { LEARNING_TOPICS } from '../../lib/storage/learningTopics';
import { LearningTopic, Review } from '../../types/review';
import { extractReviewedVulnerabilities, ExtractedVulnerabilityItem } from '../../lib/learning/reviewVulnerabilityExtractor';
import { loadAllReviews } from '../../lib/storage/store';
import { 
  BookOpen, 
  Search, 
  Lightbulb, 
  Layers, 
  Laptop, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  ChevronRight,
  AlertOctagon,
  ShieldCheck,
  Code2,
  FileCode2,
  BookmarkPlus
} from 'lucide-react';

interface LearningCenterPageProps {
  reviews?: Review[];
  activeReview?: Review | null;
  onNavigateToReview?: (reviewId: string) => void;
}

export const LearningCenterPage: React.FC<LearningCenterPageProps> = ({
  reviews: propReviews,
  activeReview,
  onNavigateToReview
}) => {
  // Load reviews from props or fallback to local storage
  const allReviews: Review[] = propReviews && propReviews.length > 0 ? propReviews : loadAllReviews();
  
  // Extract all vulnerabilities into natural study sentences
  const reviewedVulnerabilities = extractReviewedVulnerabilities(allReviews);

  const [selectedTopic, setSelectedTopic] = useState<LearningTopic>(LEARNING_TOPICS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStep, setActiveStep] = useState<'discover' | 'understand' | 'see' | 'practice' | 'verify' | 'apply'>('understand');
  const [selectedQuizOpt, setSelectedQuizOpt] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showPracticeSolution, setShowPracticeSolution] = useState(false);
  const [selectedFileFilter, setSelectedFileFilter] = useState<string>('all');

  const studyModuleRef = useRef<HTMLDivElement>(null);

  // Filter distinct file names for the filter chips
  const distinctFiles = Array.from(new Set(reviewedVulnerabilities.map(v => v.fileName)));

  const filteredVulnerabilities = reviewedVulnerabilities.filter(v => {
    if (selectedFileFilter !== 'all' && v.fileName !== selectedFileFilter) return false;
    return true;
  });

  const filteredTopics = LEARNING_TOPICS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.cwe.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTopic = (t: LearningTopic) => {
    setSelectedTopic(t);
    setSelectedQuizOpt(null);
    setQuizSubmitted(false);
    setShowPracticeSolution(false);
  };

  const handleStudyFinding = (item: ExtractedVulnerabilityItem) => {
    const matched = LEARNING_TOPICS.find(t => t.id === item.studyTopicId);
    if (matched) {
      handleSelectTopic(matched);
      setActiveStep('understand');
      // Scroll to the active study module smoothly
      if (studyModuleRef.current) {
        studyModuleRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-750 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/15 border border-accent-purple/30 text-accent-purple text-xs font-semibold mb-2 shadow-sm">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Continuous Educational Verification</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            TRUSTLENS Learning Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review-grounded security education: study the exact vulnerabilities identified in your submitted code snippets.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts or CWE..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-900 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-inner"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURED SECTION: Vulnerabilities Found in Reviewed Code & Study Topics   */}
      {/* ========================================================================= */}
      <section className="flex flex-col gap-4 p-6 rounded-2xl liquid-glass-card shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0 shadow-inner">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Vulnerabilities Found in Your Reviewed Code</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono border border-brand-500/30">
                  {reviewedVulnerabilities.length} Finding{reviewedVulnerabilities.length !== 1 ? 's' : ''}
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Each finding from your reviewed code is summarized into an exact sentence, with recommended topics to study for deep technical understanding.
              </p>
            </div>
          </div>

          {/* Quick File Filter Pills */}
          {distinctFiles.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => setSelectedFileFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedFileFilter === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-dark-800/80 text-slate-400 hover:text-white border border-dark-700'
                }`}
              >
                All Files ({reviewedVulnerabilities.length})
              </button>
              {distinctFiles.map(file => {
                const count = reviewedVulnerabilities.filter(v => v.fileName === file).length;
                return (
                  <button
                    key={file}
                    type="button"
                    onClick={() => setSelectedFileFilter(file)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                      selectedFileFilter === file
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-dark-800/80 text-slate-400 hover:text-white border border-dark-700'
                    }`}
                  >
                    {file} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Stack of Vulnerability Finding Sentences & Study Callouts */}
        <div className="flex flex-col gap-3.5">
          {filteredVulnerabilities.length === 0 ? (
            <div className="p-6 rounded-xl bg-dark-850/60 border border-dark-750 text-center flex flex-col items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-400" />
              <p className="text-xs text-slate-400">
                No reviewed code findings match the current filter.
              </p>
            </div>
          ) : (
            filteredVulnerabilities.map((item) => (
              <div
                key={item.findingId}
                className="p-4 rounded-xl bg-dark-850/80 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col gap-3 shadow-md liquid-interactive"
              >
                {/* Header Row: File Name + Severity Badge + CWE */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-800 border border-dark-700 text-xs font-mono text-slate-200">
                      <FileCode2 className="w-3.5 h-3.5 text-brand-400" />
                      <strong>{item.fileName}</strong>
                      {item.lineStart > 0 && <span className="text-slate-400">#L{item.lineStart}</span>}
                    </span>

                    <span className="text-xs text-slate-400 font-medium">
                      from review <strong className="text-slate-200">{item.reviewTitle}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.cweId && item.cweId !== 'CLEAN' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 border border-dark-700 text-slate-400">
                        {item.cweId}
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      item.isCleanCode
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : item.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : item.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {item.isCleanCode ? 'Clean Code' : item.severity}
                    </span>
                  </div>
                </div>

                {/* The Extracted Vulnerability Sentence */}
                <div className="p-3 rounded-lg bg-dark-900/90 border border-dark-750 text-xs font-medium text-slate-200 leading-relaxed font-sans">
                  {item.findingSentence}
                </div>

                {/* The Guided Study Recommendation Callout */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-accent-violet dark:text-brand-300">
                    <BookmarkPlus className="w-4 h-4 flex-shrink-0 text-brand-400" />
                    <span>{item.studyRecommendation}</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {onNavigateToReview && (
                      <button
                        type="button"
                        onClick={() => onNavigateToReview(item.reviewId)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-dark-800 hover:bg-dark-750 border border-dark-700 transition-colors flex items-center gap-1"
                      >
                        <span>View Review</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleStudyFinding(item)}
                      className="liquid-btn-primary px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <span>Study This Topic</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6-STAGE INTERACTIVE STUDY MODULE & TOPICS EXPLORER                        */}
      {/* ========================================================================= */}
      <div ref={studyModuleRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        
        {/* Left Column: Topics Catalog (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Security Study Modules ({filteredTopics.length})
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {filteredTopics.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'liquid-glass-card border-brand-500/70 shadow-lg shadow-brand-500/15'
                      : 'bg-dark-900 border-dark-750 hover:bg-dark-850 hover:border-dark-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                      {topic.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-dark-750 px-1.5 py-0.5 rounded">
                      {topic.cwe}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active 6-Stage Learning Walkthrough (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Active Module Header */}
          <div className="p-6 rounded-2xl liquid-glass-card flex flex-col gap-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-750 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                  {selectedTopic.category} • {selectedTopic.difficulty} Level
                </span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
                  {selectedTopic.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-dark-800 text-slate-300 border border-dark-700">
                  {selectedTopic.cwe}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedTopic.description}
            </p>

            {/* 6-Stage Learning Cycle Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-dark-750">
              {[
                { id: 'discover', label: '1. Discover', icon: <Search className="w-3.5 h-3.5" /> },
                { id: 'understand', label: '2. Understand', icon: <Lightbulb className="w-3.5 h-3.5" /> },
                { id: 'see', label: '3. See the Risk', icon: <Layers className="w-3.5 h-3.5" /> },
                { id: 'practice', label: '4. Practice', icon: <Laptop className="w-3.5 h-3.5" /> },
                { id: 'verify', label: '5. Verify', icon: <GraduationCap className="w-3.5 h-3.5" /> },
                { id: 'apply', label: '6. Apply', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
              ].map((step) => {
                const isActive = activeStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                        : 'bg-dark-800 text-slate-400 hover:text-white hover:bg-dark-750'
                    }`}
                  >
                    {step.icon}
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Dynamic Content Container */}
          <div className="p-6 rounded-2xl liquid-glass-card flex flex-col gap-4 shadow-xl">
            
            {/* Step 1: Discover */}
            {activeStep === 'discover' && (
              <div className="flex flex-col gap-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-brand-400" />
                  <span>How This Problem Originates in AI-Generated Code</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {selectedTopic.steps.discover}
                </p>
                <div className="p-4 rounded-xl bg-dark-850/80 border border-dark-750 text-xs text-slate-400">
                  💡 <strong className="text-white">Why AI models make this mistake:</strong> Generative LLMs optimize for syntactic brevity and simplicity rather than zero-trust defense. Without explicit security instructions, they take shortcuts like string concatenation and placeholder passwords.
                </div>
              </div>
            )}

            {/* Step 2: Understand (Analogy & Why Care) */}
            {activeStep === 'understand' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Beginner-Friendly Concept Analogy</span>
                  </h3>
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed">
                    "{selectedTopic.steps.understand.analogy}"
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Why You Must Understand This Before Deploying:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {selectedTopic.steps.understand.whyCare}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: See the Risk (Unsafe Code vs Fix) */}
            {activeStep === 'see' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-rose-400" />
                  <span>Vulnerable Code Pattern Breakdown</span>
                </h3>

                <div className="rounded-xl bg-dark-950 border border-dark-750 overflow-hidden font-mono text-xs">
                  <div className="px-4 py-2 bg-dark-900 border-b border-dark-750 text-slate-400 text-[11px] flex items-center justify-between">
                    <span>Unsafe Code Example</span>
                    <span className="text-rose-400 font-semibold">Flagged Line #{selectedTopic.steps.see.problemLine}</span>
                  </div>
                  <pre className="p-4 text-rose-300 overflow-x-auto leading-relaxed">
                    {selectedTopic.steps.see.unsafeCode}
                  </pre>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedTopic.steps.see.explanation}
                </p>
              </div>
            )}

            {/* Step 4: Practice Challenge */}
            {activeStep === 'practice' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-brand-400" />
                  <span>Interactive Refactoring Challenge</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300">
                  {selectedTopic.steps.practice.challengePrompt}
                </p>

                <div className="rounded-xl bg-dark-950 border border-dark-750 overflow-hidden font-mono text-xs">
                  <pre className="p-4 text-slate-200 overflow-x-auto">
                    {selectedTopic.steps.practice.sampleCode}
                  </pre>
                </div>

                <div className="p-3 rounded-lg bg-dark-850 border border-dark-700 text-xs text-slate-400">
                  💡 <strong className="text-slate-200">Hint:</strong> {selectedTopic.steps.practice.hint}
                </div>

                <button
                  type="button"
                  onClick={() => setShowPracticeSolution(!showPracticeSolution)}
                  className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs font-semibold text-brand-400 self-start transition-colors"
                >
                  {showPracticeSolution ? 'Hide Verified Solution' : 'Reveal Verified Solution'}
                </button>

                {showPracticeSolution && (
                  <div className="rounded-xl bg-dark-950 border border-emerald-500/40 overflow-hidden font-mono text-xs">
                    <div className="px-4 py-1.5 bg-emerald-950/40 border-b border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                      ✓ Recommended Secure Solution
                    </div>
                    <pre className="p-4 text-emerald-300 overflow-x-auto">
                      {selectedTopic.steps.practice.solution}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Verification Quiz */}
            {activeStep === 'verify' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-accent-purple" />
                  <span>Knowledge Verification Check</span>
                </h3>

                <p className="text-xs sm:text-sm font-semibold text-slate-200">
                  {selectedTopic.steps.verify.question}
                </p>

                <div className="flex flex-col gap-2">
                  {selectedTopic.steps.verify.options.map((opt, idx) => {
                    const isSelected = selectedQuizOpt === idx;
                    const isCorrect = idx === selectedTopic.steps.verify.correctIndex;
                    return (
                      <button
                        key={idx}
                        disabled={quizSubmitted}
                        onClick={() => setSelectedQuizOpt(idx)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all ${
                          quizSubmitted
                            ? isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                              : isSelected
                              ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                              : 'bg-dark-850/50 border-dark-750 text-slate-500'
                            : isSelected
                            ? 'bg-brand-600/20 border-brand-500 text-white'
                            : 'bg-dark-850 border-dark-750 text-slate-300 hover:bg-dark-800'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button
                    type="button"
                    disabled={selectedQuizOpt === null}
                    onClick={() => setQuizSubmitted(true)}
                    className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-bold text-white self-start disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 flex flex-col gap-1.5 text-xs">
                    <span className="font-bold text-white">
                      {selectedQuizOpt === selectedTopic.steps.verify.correctIndex
                        ? '🎉 Correct! Understanding Verified.'
                        : '❌ Incorrect. Review the explanation below:'}
                    </span>
                    <p className="text-slate-300">
                      {selectedTopic.steps.verify.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Apply to Production */}
            {activeStep === 'apply' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Production Deployment Standard</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {selectedTopic.steps.apply}
                </p>

                <div className="flex flex-col gap-2 pt-2 border-t border-dark-750">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Authoritative MITRE & OWASP References:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {selectedTopic.references.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700 flex items-center justify-between text-xs text-slate-200 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{ref.title}</span>
                          <span className="text-[10px] text-slate-400">{ref.organization} • {ref.level}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
