import React, { useState } from 'react';
import { Finding, Review } from '../../types/review';
import { 
  Copy, 
  Download, 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ChevronRight,
  FileCode2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertOctagon,
  ExternalLink
} from 'lucide-react';

interface CenterCodeViewerProps {
  review: Review;
  selectedFindingId: string;
  onSelectFinding: (findingId: string) => void;
  onGenerateReportClick: () => void;
  onResolveFinding: (findingId: string) => void;
  onResolveAllFindings?: () => void;
  onOpenFalsePositiveModal: (finding: Finding) => void;
  readinessPercentage: number;
}

export const CenterCodeViewer: React.FC<CenterCodeViewerProps> = ({
  review,
  selectedFindingId,
  onSelectFinding,
  onGenerateReportClick,
  onResolveFinding,
  onResolveAllFindings,
  onOpenFalsePositiveModal,
  readinessPercentage
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  const copyReviewId = () => {
    navigator.clipboard.writeText(review.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(review.sourceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([review.sourceCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = review.fileName || 'source-code.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Count issues by severity
  const criticalCount = review.findings.filter(f => f.severity === 'critical' && f.status === 'unresolved').length;
  const warningCount = review.findings.filter(f => (f.severity === 'high' || f.severity === 'medium') && f.status === 'unresolved').length;

  const lines = review.sourceCode.split('\n');

  // Filter findings for list
  const filteredFindings = review.findings.filter(f => {
    if (activeSeverityFilter === 'all') return true;
    if (activeSeverityFilter === 'critical') return f.severity === 'critical';
    if (activeSeverityFilter === 'high') return f.severity === 'high';
    if (activeSeverityFilter === 'medium') return f.severity === 'medium';
    return true;
  });

  const selectedFinding = review.findings.find(f => f.id === selectedFindingId) || review.findings[0];
  const highlightedLineNumbers = review.findings
    .filter(f => f.status === 'unresolved')
    .map(f => f.lineStart);

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-5">
      
      {/* Top Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-dark-700/80">
        <div className="flex flex-col">
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            {review.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400 font-mono">
              Review ID: #{review.id}
            </span>
            <button
              onClick={copyReviewId}
              title="Copy Review ID"
              className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Badges + Report Trigger */}
        <div className="flex items-center gap-2 flex-wrap">
          {criticalCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              {criticalCount} Critical Issue{criticalCount > 1 ? 's' : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {warningCount} Warning{warningCount > 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={onGenerateReportClick}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-600/80 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-brand-400" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* ScamAdviser Domain Trust Assessment Panel (if active) */}
      {review.scamAdviserRating && (
        <div className={`p-4 rounded-xl border flex flex-col gap-3 shadow-md ${
          review.scamAdviserRating.isUnauthorized || review.scamAdviserRating.trustScore <= 35
            ? 'bg-rose-950/30 border-rose-500/50'
            : review.scamAdviserRating.trustScore <= 60
            ? 'bg-amber-950/30 border-amber-500/40'
            : 'bg-emerald-950/30 border-emerald-500/40'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-700/80 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${
                review.scamAdviserRating.isUnauthorized ? 'bg-rose-500/20 text-rose-400' : 'bg-brand-500/20 text-brand-400'
              }`}>
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white tracking-wide">
                    ScamAdviser Domain Trust Assessment
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    review.scamAdviserRating.isUnauthorized
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-dark-800 text-slate-300 border-dark-700'
                  }`}>
                    {review.scamAdviserRating.isUnauthorized ? '🚨 Unauthorized Website' : review.scamAdviserRating.trustLevel}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono mt-0.5">
                  Host: {review.scamAdviserRating.domain}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Trust Score</span>
                <span className={`text-xl font-black font-mono leading-none ${
                  review.scamAdviserRating.trustScore <= 35 ? 'text-rose-400' : review.scamAdviserRating.trustScore <= 60 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {review.scamAdviserRating.trustScore} / 100
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {review.scamAdviserRating.verdict}
          </p>

          {review.scamAdviserRating.riskFactors.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Negative Risk Indicators (ScamAdviser Intelligence):
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {review.scamAdviserRating.riskFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-dark-750 text-xs">
            <span className="text-slate-400 text-[11px]">
              Safety Score of this review is directly anchored to ScamAdviser reputation telemetry.
            </span>
            <a
              href={review.scamAdviserRating.scamAdviserUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-400 hover:text-brand-300 flex-shrink-0"
            >
              <span>Verify on ScamAdviser</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Submitted Code Viewer matching screenshot */}
      <div className="rounded-2xl liquid-glass-card overflow-hidden shadow-xl flex flex-col preserve-dark-editor">
        {/* Code Header Bar */}
        <div className="px-4 py-2.5 bg-dark-850 border-b border-dark-750 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-brand-400" />
            <span className="font-semibold text-slate-200">
              Submitted Code ({review.fileName || 'source.py'})
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-dark-750 text-slate-400">
              {review.language || 'Python'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-dark-750 hover:bg-dark-700 text-slate-300 hover:text-white transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
            <button
              onClick={downloadCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-dark-750 hover:bg-dark-700 text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code View with Line Numbers & Highlighting */}
        <div className="overflow-x-auto p-4 font-mono text-xs leading-relaxed max-h-[340px] select-text">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const isSelectedFindingLine = selectedFinding && selectedFinding.lineStart === lineNum;
                const isVulnerableLine = highlightedLineNumbers.includes(lineNum);
                
                return (
                  <tr 
                    key={lineNum}
                    className={`transition-colors ${
                      isSelectedFindingLine
                        ? 'bg-rose-950/45 border-l-4 border-rose-500'
                        : isVulnerableLine
                        ? 'bg-rose-950/20'
                        : 'hover:bg-dark-800/40'
                    }`}
                  >
                    <td className="pr-4 pl-1 text-right text-slate-600 select-none w-8 font-mono text-[11px]">
                      {lineNum}
                    </td>
                    <td className="pr-2 text-slate-200 whitespace-pre">
                      {isVulnerableLine ? (
                        <span className="text-rose-300 font-semibold bg-rose-500/10 px-1 rounded">
                          {line}
                        </span>
                      ) : (
                        line
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issues Found Section matching screenshot */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Issues Found</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-dark-800 text-slate-300 border border-dark-700">
                {review.findings.length}
              </span>
            </h2>

            {/* Fixation Rate indicator */}
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
              review.findings.every(f => f.status === 'resolved' || f.status === 'dismissed')
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-brand-500/20 text-brand-300 border-brand-500/30'
            }`}>
              Fixation: {review.findings.length > 0 ? Math.round((review.findings.filter(f => f.status === 'resolved' || f.status === 'dismissed').length / review.findings.length) * 100) : 100}%
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onResolveAllFindings && review.findings.some(f => f.status === 'unresolved') && (
              <button
                type="button"
                onClick={() => onResolveAllFindings()}
                className="liquid-btn-primary px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ Auto-Fix All (100% Fixation)</span>
              </button>
            )}

            <div className="flex items-center gap-1 text-xs">
              {(['all', 'critical', 'high', 'medium'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setActiveSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                    activeSeverityFilter === sev
                      ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Finding Cards List matching screenshot layout */}
        <div className="flex flex-col gap-2.5">
          {filteredFindings.length === 0 ? (
            <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                  <span>0 Security Vulnerabilities Found</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">Clean Code Verified</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Your submitted code adheres to verified security best practices. No hardcoded credentials, unescaped database queries, arbitrary command executions, broken cryptography, or insecure configurations were detected.
                </p>
                <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">✓ Secure Secret Storage</span>
                  <span className="flex items-center gap-1">✓ Parameterized Input</span>
                  <span className="flex items-center gap-1">✓ Safe TLS Protocols</span>
                  <span className="flex items-center gap-1">✓ 100% Ready to Deploy</span>
                </div>
              </div>
            </div>
          ) : (
            filteredFindings.map((finding) => {
            const isSelected = selectedFindingId === finding.id;
            const isCritical = finding.severity === 'critical';
            const isWarning = finding.severity === 'high' || finding.severity === 'medium';
            const isResolved = finding.status === 'resolved';
            const isDismissed = finding.status === 'dismissed';

            return (
              <div
                key={finding.id}
                onClick={() => onSelectFinding(finding.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 liquid-interactive ${
                  isSelected
                    ? 'liquid-glass-card border-brand-500/70 shadow-lg shadow-brand-500/15'
                    : 'bg-dark-850/80 hover:bg-dark-800/80 border-white/10 hover:border-white/20'
                } ${isResolved ? 'opacity-70' : ''}`}
              >
                {/* Left side: Severity badge + title & description */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Badge */}
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-400' : isWarning ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    {finding.severity}
                  </span>

                  {/* Title & Desc */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {finding.title}
                      </span>
                      {isResolved && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                          RESOLVED
                        </span>
                      )}
                      {isDismissed && (
                        <span className="text-[10px] font-bold text-slate-400 bg-dark-700 px-1.5 py-0.2 rounded">
                          DISMISSED (FP)
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 truncate">
                      {finding.description}
                    </span>
                  </div>
                </div>

                {/* Right side: Line indicator + Chevron */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {finding.lineStart && (
                    <span className="text-xs font-mono text-slate-400 bg-dark-750 px-2 py-1 rounded">
                      Line {finding.lineStart}
                    </span>
                  )}
                  
                  {/* Actions */}
                  <div className="hidden sm:flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {!isResolved && !isDismissed && (
                      <button
                        onClick={() => onResolveFinding(finding.id)}
                        className="px-2 py-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/20 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                    {!isDismissed && (
                      <button
                        onClick={() => onOpenFalsePositiveModal(finding)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-dark-750 hover:bg-dark-700 rounded transition-colors"
                      >
                        Not an issue?
                      </button>
                    )}
                  </div>

                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-brand-400' : ''}`} />
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* Deployment Readiness Card matching bottom of screenshot */}
      <div className="p-5 rounded-2xl bg-dark-850 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg">
        
        {/* Left: Shield icon + Text */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Deployment Readiness
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              Fix the critical issues and improve your understanding to make your code production ready.
            </p>
          </div>
        </div>

        {/* Center: Circular Progress indicator matching screenshot */}
        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-dark-700/80"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${readinessPercentage >= 80 ? "text-emerald-400 liquid-glow-emerald" : readinessPercentage >= 50 ? "text-yellow-400 liquid-glow-yellow" : "text-brand-400 liquid-glow-blue"} transition-all duration-700`}
                strokeDasharray={`${readinessPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xs font-extrabold text-white leading-none">
                {readinessPercentage}%
              </span>
              <span className="text-[8px] text-slate-400 font-medium leading-none mt-0.5">
                Ready
              </span>
            </div>
          </div>

          {/* Right: Checklist matching screenshot */}
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Checklist
            </span>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Code Scanned</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {review.checklist.criticalIssuesFixed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>Issues Fixed</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {review.checklist.understandingVerified ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                </div>
              )}
              <span>Understanding Verified</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {review.checklist.readyToDeploy ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                </div>
              )}
              <span>Ready to Deploy</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
