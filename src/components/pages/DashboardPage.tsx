import React, { useState } from 'react';
import { Review } from '../../types/review';
import { DEFAULT_ACHIEVEMENTS, DEFAULT_CONCEPT_MASTERY } from '../../lib/storage/store';
import { 
  LayoutDashboard, 
  Search, 
  ShieldCheck, 
  Brain, 
  Clock, 
  AlertOctagon, 
  ChevronRight, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Trash2
} from 'lucide-react';

import { User } from '../../types/user';

interface DashboardPageProps {
  reviews: Review[];
  onOpenReview: (reviewId: string) => void;
  onNewReviewClick: () => void;
  onDeleteReview?: (reviewId: string) => void;
  currentUser?: User | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  reviews,
  onOpenReview,
  onNewReviewClick,
  onDeleteReview,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Filter reviews
  const filteredReviews = reviews.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.findings.some(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.technicalExplanation.cweId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (severityFilter === 'all') return matchesSearch;
    if (severityFilter === 'critical') return matchesSearch && r.scores.deploymentRisk === 'CRITICAL';
    if (severityFilter === 'high') return matchesSearch && r.scores.deploymentRisk === 'HIGH';
    if (severityFilter === 'low') return matchesSearch && r.scores.deploymentRisk === 'LOW';
    return matchesSearch;
  });

  const avgSafety = reviews.length > 0 
    ? Math.round(reviews.reduce((acc, r) => acc + r.scores.safetyScore, 0) / reviews.length)
    : 82;

  const verifiedReviewsCount = reviews.filter(r => r.checklist.readyToDeploy).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Developer Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Welcome back, {currentUser ? currentUser.name : 'Developer'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser ? (
              <span>Signed in as <strong className="text-brand-400 font-semibold">{currentUser.role}</strong> (@{currentUser.username}) • </span>
            ) : null}
            Track technical risk mitigation, knowledge verification milestones, and deployment readiness across your projects.
          </p>
        </div>

        <button
          onClick={onNewReviewClick}
          className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet shadow-lg shadow-brand-600/25 transition-all text-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Start New Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top 4 Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-dark-900 border border-dark-750 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-brand-500/15 text-brand-400">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Total Reviews</span>
            <span className="text-xl font-extrabold text-white">{reviews.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-dark-900 border border-dark-750 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Avg Safety Score</span>
            <span className="text-xl font-extrabold text-white">{avgSafety}%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-dark-900 border border-dark-750 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Concept Mastery</span>
            <span className="text-xl font-extrabold text-white">68%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-dark-900 border border-dark-750 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-accent-purple/15 text-accent-purple">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Verified Ready</span>
            <span className="text-xl font-extrabold text-white">{verifiedReviewsCount} / {reviews.length}</span>
          </div>
        </div>
      </div>

      {/* Concept Mastery & Professional Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 7 cols: Recent Reviews Table matching Section 33 */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Recent Reviews</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-dark-800 text-slate-400">
                {filteredReviews.length}
              </span>
            </h2>

            {/* Search + Filter */}
            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search project or CWE..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-dark-900 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg bg-dark-900 border border-dark-750 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Risks</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="flex flex-col gap-2.5">
            {filteredReviews.map((r) => {
              const isVerified = r.checklist.readyToDeploy;
              const underScoreText = r.scores.understandingScore === -1 ? 'Not Verified' : `${r.scores.understandingScore}%`;

              return (
                <div
                  key={r.id}
                  onClick={() => onOpenReview(r.id)}
                  className="p-4 rounded-xl bg-dark-900 border border-dark-750 hover:bg-dark-850 hover:border-dark-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                        {r.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-700">
                        {r.projectType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>#{r.id}</span>
                      <span>•</span>
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{r.findings.length} Issue{r.findings.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-3 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Safety</span>
                        <span className="font-bold text-emerald-400">{r.scores.safetyScore}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Understand</span>
                        <span className="font-bold text-brand-400">{underScoreText}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Risk</span>
                        <span className={`font-bold text-[11px] ${
                          r.scores.deploymentRisk === 'LOW'
                            ? 'text-emerald-400'
                            : r.scores.deploymentRisk === 'MEDIUM'
                            ? 'text-yellow-400'
                            : 'text-red-500'
                        }`}>
                          {r.scores.deploymentRisk}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 cols: Concept Mastery & Achievements */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Concept Mastery Section (Section 61) */}
          <div className="p-5 rounded-2xl bg-dark-900 border border-dark-750 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <span>Concepts Learned</span>
            </div>

            <div className="space-y-3">
              {DEFAULT_CONCEPT_MASTERY.map((cm, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cm.name}</span>
                    <span className="text-brand-400 font-bold">{cm.percentage}%</span>
                  </div>
                  <div className="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-600 to-accent-violet h-1.5 rounded-full"
                      style={{ width: `${cm.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gamified Achievements (Section 60) */}
          <div className="p-5 rounded-2xl bg-dark-900 border border-dark-750 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Achievements</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEFAULT_ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border text-xs flex items-center gap-3 ${
                    ach.unlocked
                      ? 'bg-dark-850 border-dark-700 text-slate-200'
                      : 'bg-dark-950 border-dark-800 text-slate-500 opacity-60'
                  }`}
                >
                  <span className="text-xl">{ach.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white truncate">{ach.title}</span>
                    <span className="text-[11px] text-slate-400 truncate">{ach.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
