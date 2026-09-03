import React from 'react';
import { Review } from '../../types/review';
import { Logo } from '../layout/Logo';
import { X, Printer, Download, Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  review: Review;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  review,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(review, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Actions Bar (Hidden in print) */}
        <div className="px-6 py-3.5 bg-dark-850 border-b border-dark-750 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span>TRUSTLENS Technical Verification Report</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-750 text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON' : 'Export JSON'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible space-y-8 bg-dark-900 print:bg-white text-slate-200 print:text-slate-900">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-dark-750 print:border-slate-300">
            <Logo size="lg" />
            <div className="flex flex-col sm:text-right text-xs text-slate-400 print:text-slate-600 leading-relaxed font-mono">
              <span>Report ID: #{review.id}</span>
              <span>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
              <span>Review Type: {review.projectType.toUpperCase()} ({review.language})</span>
            </div>
          </div>

          {/* Project Title & Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white print:text-slate-900 tracking-tight">
                {review.title}
              </h1>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                Context: {review.projectContext || 'General Application Module'} • File: {review.fileName}
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-dark-800 print:bg-slate-100 border border-dark-700 print:border-slate-300 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-500 block">
                Deployment Risk
              </span>
              <span className={`text-base font-extrabold ${
                review.scores.deploymentRisk === 'LOW'
                  ? 'text-emerald-400 print:text-emerald-700'
                  : review.scores.deploymentRisk === 'MEDIUM'
                  ? 'text-yellow-400 print:text-yellow-700'
                  : 'text-red-500 print:text-red-700'
              }`}>
                {review.scores.deploymentRisk}
              </span>
            </div>
          </div>

          {/* 4 Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-dark-850 print:bg-slate-50 border border-dark-750 print:border-slate-200 text-center">
              <span className="text-[11px] font-medium text-slate-400 print:text-slate-600 block">Safety Score</span>
              <span className="text-2xl font-extrabold text-white print:text-slate-900 mt-1 block">{review.scores.safetyScore}%</span>
            </div>
            <div className="p-4 rounded-xl bg-dark-850 print:bg-slate-50 border border-dark-750 print:border-slate-200 text-center">
              <span className="text-[11px] font-medium text-slate-400 print:text-slate-600 block">Understanding Score</span>
              <span className="text-2xl font-extrabold text-white print:text-slate-900 mt-1 block">
                {review.scores.understandingScore === -1 ? 'Not Verified' : `${review.scores.understandingScore}%`}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-dark-850 print:bg-slate-50 border border-dark-750 print:border-slate-200 text-center">
              <span className="text-[11px] font-medium text-slate-400 print:text-slate-600 block">Grounding Score</span>
              <span className="text-2xl font-extrabold text-white print:text-slate-900 mt-1 block">{review.scores.groundingScore}%</span>
            </div>
            <div className="p-4 rounded-xl bg-dark-850 print:bg-slate-50 border border-dark-750 print:border-slate-200 text-center">
              <span className="text-[11px] font-medium text-slate-400 print:text-slate-600 block">Detected Issues</span>
              <span className="text-2xl font-extrabold text-white print:text-slate-900 mt-1 block">{review.findings.length}</span>
            </div>
          </div>

          {/* Detected Issues Details */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white print:text-slate-900 border-b border-dark-750 print:border-slate-200 pb-2">
              Detected Technical Risks & Recommended Fixes
            </h2>

            <div className="space-y-4">
              {review.findings.map((f, i) => (
                <div key={f.id} className="p-4 rounded-xl bg-dark-850 print:bg-white border border-dark-750 print:border-slate-300 space-y-3 print-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        f.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 print:text-rose-700' : 'bg-amber-500/20 text-amber-400 print:text-amber-700'
                      }`}>
                        {f.severity}
                      </span>
                      <h3 className="text-sm font-bold text-white print:text-slate-900">
                        {i + 1}. {f.title} (Line {f.lineStart})
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400 print:text-slate-600">
                      Status: {f.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                    {f.simpleExplanation.analogy}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/20 print:bg-rose-50">
                      <span className="text-[10px] font-bold text-rose-400 block mb-1">Unsafe Code:</span>
                      <span className="text-rose-200 print:text-rose-900">{f.vulnerableSnippet}</span>
                    </div>
                    <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/20 print:bg-emerald-50">
                      <span className="text-[10px] font-bold text-emerald-400 block mb-1">Recommended Fix:</span>
                      <span className="text-emerald-200 print:text-emerald-900">{f.recommendedSnippet}</span>
                    </div>
                  </div>

                  {f.references[0] && (
                    <div className="text-xs text-slate-400 print:text-slate-600 pt-1 border-t border-dark-750/60 print:border-slate-200 flex items-center justify-between">
                      <span>Evidence: {f.references[0].organization} – {f.references[0].title}</span>
                      <span className="font-semibold">{f.references[0].authorityLevel}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Responsible Security Disclaimer */}
          <div className="p-4 rounded-xl bg-dark-800/80 print:bg-slate-100 border border-dark-700 print:border-slate-300 text-xs text-slate-400 print:text-slate-600 leading-relaxed">
            <strong className="text-slate-200 print:text-slate-800 block mb-1">
              Important Responsible Security Statement:
            </strong>
            TRUSTLENS AI provides technical verification and educational guidance. Automated review cannot guarantee complete security. Critical systems should undergo independent professional penetration testing and security architecture review prior to deployment.
          </div>

        </div>

      </div>
    </div>
  );
};
