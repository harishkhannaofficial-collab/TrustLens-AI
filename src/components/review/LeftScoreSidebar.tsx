import React from 'react';
import { ReviewType, DeploymentRiskLevel } from '../../types/review';
import { 
  Plus, 
  Code2, 
  Settings, 
  AlertTriangle, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  Brain, 
  BookOpen, 
  AlertOctagon,
  CheckCircle2
} from 'lucide-react';

import { ReviewType, DeploymentRiskLevel, ScamAdviserRating } from '../../types/review';

interface LeftScoreSidebarProps {
  activeReviewType: ReviewType;
  onSelectReviewType: (type: ReviewType) => void;
  onNewReviewClick: () => void;
  safetyScore: number;
  safetyScoreSource?: string;
  scamAdviserRating?: ScamAdviserRating;
  understandingScore: number; // -1 if not verified
  groundingScore: number;
  deploymentRisk: DeploymentRiskLevel;
  onSeeDetailsClick?: () => void;
}

export const LeftScoreSidebar: React.FC<LeftScoreSidebarProps> = ({
  activeReviewType,
  onSelectReviewType,
  onNewReviewClick,
  safetyScore,
  safetyScoreSource,
  scamAdviserRating,
  understandingScore,
  groundingScore,
  deploymentRisk,
  onSeeDetailsClick
}) => {
  const reviewTypes: { id: ReviewType; label: string; icon: React.ReactNode }[] = [
    { id: 'code', label: 'Code Review', icon: <Code2 className="w-4 h-4" /> },
    { id: 'configuration', label: 'Configuration', icon: <Settings className="w-4 h-4" /> },
    { id: 'message', label: 'Suspicious Message', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'website', label: 'Website / Link', icon: <Globe className="w-4 h-4" /> },
    { id: 'logic', label: 'Control Logic', icon: <Cpu className="w-4 h-4" /> },
  ];

  const riskColors: Record<DeploymentRiskLevel, { bg: string; border: string; text: string; iconBg: string; iconColor: string }> = {
    CRITICAL: {
      bg: 'bg-red-950/40',
      border: 'border-red-500/50',
      text: 'text-red-500',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-500'
    },
    HIGH: {
      bg: 'bg-red-950/30',
      border: 'border-red-500/50',
      text: 'text-red-500',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-500'
    },
    MEDIUM: {
      bg: 'bg-yellow-950/30',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400'
    },
    LOW: {
      bg: 'bg-emerald-950/30',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    }
  };

  const currentRisk = riskColors[deploymentRisk] || riskColors.HIGH;

  return (
    <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 flex flex-col gap-5 select-none">
      {/* Primary + New Review Button */}
      <button
        onClick={onNewReviewClick}
        className="liquid-btn-primary w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>New Review</span>
      </button>

      {/* Review Type Selector Section */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
          Select Review Type
        </span>
        <div className="flex flex-col gap-1">
          {reviewTypes.map((type) => {
            const isSelected = activeReviewType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => onSelectReviewType(type.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-dark-800 text-white border border-brand-500/40 shadow-sm shadow-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850/60 border border-transparent'
                }`}
              >
                <div className={`${isSelected ? 'text-brand-400' : 'text-slate-400'}`}>
                  {type.icon}
                </div>
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Your Scores Section */}
      <div className="flex flex-col gap-3 pt-2 border-t border-dark-750">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Your Scores
          </span>
          <button 
            onClick={onSeeDetailsClick}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            See Details
          </button>
        </div>

        {/* Safety Score Card */}
        <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700/80 flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
              safetyScore <= 35
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : safetyScore <= 60
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-300">Safety Score</span>
              <span className={`text-lg font-bold leading-none ${
                safetyScore <= 35 ? 'text-rose-400' : safetyScore <= 60 ? 'text-amber-400' : 'text-white'
              }`}>
                {safetyScore}%
              </span>
            </div>
          </div>
          <div className="w-full bg-dark-700/60 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                safetyScore <= 35
                  ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                  : safetyScore <= 60
                  ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, safetyScore))}%` }}
            />
          </div>
          {scamAdviserRating && (
            <div className="pt-1 border-t border-dark-750 flex items-center gap-1.5 text-[10px] text-rose-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
              <span>Based on ScamAdviser ({scamAdviserRating.trustScore}/100)</span>
            </div>
          )}
        </div>

        {/* Understanding Score Card */}
        <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700/80 flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Brain className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-300">Understanding Score</span>
              <span className="text-lg font-bold text-white leading-none">
                {understandingScore === -1 ? 'Not Verified' : `${understandingScore}%`}
              </span>
            </div>
          </div>
          <div className="w-full bg-dark-700/60 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-brand-600 to-brand-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${understandingScore === -1 ? 0 : Math.min(100, Math.max(5, understandingScore))}%` }}
            />
          </div>
        </div>

        {/* Grounding Score Card */}
        <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700/80 flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-purple/15 border border-accent-purple/30 flex items-center justify-center text-accent-purple">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-300">Grounding Score</span>
              <span className="text-lg font-bold text-white leading-none">{groundingScore}%</span>
            </div>
          </div>
          <div className="w-full bg-dark-700/60 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-accent-violet to-accent-purple h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, groundingScore))}%` }}
            />
          </div>
        </div>

        {/* Deployment Risk Card */}
        <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${currentRisk.bg} ${currentRisk.border} shadow-sm`}>
          <div className={`p-2 rounded-lg ${currentRisk.iconBg} ${currentRisk.iconColor}`}>
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Deployment Risk
            </span>
            <span className={`text-base font-extrabold tracking-wide ${currentRisk.text}`}>
              {deploymentRisk}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
