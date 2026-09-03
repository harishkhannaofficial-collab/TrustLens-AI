import React, { useState } from 'react';
import { Finding } from '../../types/review';
import { AlertCircle, X, Check } from 'lucide-react';

interface FalsePositiveModalProps {
  finding: Finding | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDismiss: (findingId: string, reason: string) => void;
}

const REASONS = [
  'Test / mock example credential (not used in production)',
  'Non-sensitive public value (e.g. public client ID or demo string)',
  'Incorrect pattern detection (false positive in code context)',
  'Mitigated by upstream firewall / network proxy',
  'Other architectural reason'
];

export const FalsePositiveModal: React.FC<FalsePositiveModalProps> = ({
  finding,
  isOpen,
  onClose,
  onConfirmDismiss
}) => {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [customNotes, setCustomNotes] = useState('');

  if (!isOpen || !finding) return null;

  const handleConfirm = () => {
    const fullReason = customNotes.trim() 
      ? `${selectedReason}: ${customNotes.trim()}`
      : selectedReason;
    onConfirmDismiss(finding.id, fullReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded-2xl bg-dark-900 border border-dark-700 shadow-2xl flex flex-col gap-4">
        
        <div className="flex items-center justify-between pb-2 border-b border-dark-750">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Mark as False Positive</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-lg bg-dark-850 border border-dark-750 text-xs">
          <span className="font-semibold text-white block mb-0.5">{finding.title}</span>
          <span className="text-slate-400">Line {finding.lineStart}: {finding.vulnerableSnippet}</span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300">
            Why is this not an active risk?
          </label>
          <div className="flex flex-col gap-1.5">
            {REASONS.map((r) => (
              <label 
                key={r}
                onClick={() => setSelectedReason(r)}
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  selectedReason === r
                    ? 'border-brand-500 bg-brand-600/20 text-white font-medium'
                    : 'border-dark-750 bg-dark-800 text-slate-400 hover:bg-dark-750'
                }`}
              >
                <input
                  type="radio"
                  name="fp-reason"
                  checked={selectedReason === r}
                  onChange={() => setSelectedReason(r)}
                  className="accent-brand-500"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Optional Notes:
          </label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Add context for why this is dismissed..."
            rows={2}
            className="w-full p-2.5 rounded-lg bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-dark-750">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm Dismissal</span>
          </button>
        </div>

      </div>
    </div>
  );
};
