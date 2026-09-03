import React, { useEffect, useState } from 'react';
import { Shield, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisLoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  projectTitle: string;
}

const ANALYSIS_STAGES = [
  'Stage 1: Scanning code structure & syntax trees...',
  'Stage 2: Searching for exposed secrets, tokens & API keys...',
  'Stage 3: Checking authentication logic & password handling...',
  'Stage 4: Checking authorization controls & access boundaries...',
  'Stage 5: Checking input validation & query parameters...',
  'Stage 6: Checking dangerous functions & command injection vectors...',
  'Stage 7: Comparing against trusted security guidance (NIST, OWASP, CWE)...',
  'Stage 8: Building beginner-friendly explanations & real-world analogies...',
  'Stage 9: Generating interactive understanding verification questions...',
  'Stage 10: Generating deployment risk assessment & readiness score...'
];

export const AnalysisLoadingModal: React.FC<AnalysisLoadingModalProps> = ({
  isOpen,
  onComplete,
  projectTitle
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIdx(0);
      setProgress(10);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStageIdx(prev => {
        if (prev < ANALYSIS_STAGES.length - 1) {
          const next = prev + 1;
          setProgress(Math.round(((next + 1) / ANALYSIS_STAGES.length) * 100));
          return next;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return prev;
        }
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-dark-900 border border-dark-700 shadow-2xl flex flex-col gap-6">
        
        {/* Header Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-accent-violet flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Analyzing with TRUSTLENS AI
            </h3>
            <span className="text-xs text-slate-400">
              Project: {projectTitle || 'AI-Generated Work'}
            </span>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-brand-400 font-mono">
              Stage {currentStageIdx + 1} of 10
            </span>
            <span className="text-white font-mono text-sm">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-dark-800 rounded-full h-2.5 overflow-hidden border border-dark-700">
            <div
              className="bg-gradient-to-r from-brand-600 via-accent-violet to-emerald-400 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Active Stage & Past Log */}
        <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex flex-col gap-2.5 max-h-48 overflow-y-auto font-mono text-xs">
          {ANALYSIS_STAGES.slice(0, currentStageIdx + 1).map((stage, idx) => {
            const isLatest = idx === currentStageIdx;
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-2 transition-all ${
                  isLatest ? 'text-white font-semibold' : 'text-slate-500'
                }`}
              >
                {isLatest ? (
                  <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                )}
                <span className="truncate">{stage}</span>
              </div>
            );
          })}
        </div>

        <div className="text-center text-[11px] text-slate-500">
          Synthesizing authoritative security guidance from NIST, OWASP & MITRE CWE...
        </div>

      </div>
    </div>
  );
};
