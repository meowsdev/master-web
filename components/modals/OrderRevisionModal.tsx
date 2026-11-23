'use client';

import React from 'react';
import { RotateCcw, X } from 'lucide-react';

interface OrderRevisionModalProps {
  isOpen: boolean;
  orderId?: string | null;
  issueDescription?: string;
  revisionDesc?: string;
  onIssueDescriptionChange?: (text: string) => void;
  onDescChange?: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isPending?: boolean;
  isDarkMode?: boolean;
}

export function OrderRevisionModal({
  isOpen,
  orderId,
  issueDescription,
  revisionDesc,
  onIssueDescriptionChange,
  onDescChange,
  onClose,
  onSubmit,
  isSubmitting,
  isPending,
  isDarkMode = false,
}: OrderRevisionModalProps) {
  if (!isOpen) return null;

  const desc = issueDescription ?? revisionDesc ?? '';
  const setDesc = onIssueDescriptionChange ?? onDescChange ?? (() => {});
  const submitting = isSubmitting ?? isPending ?? false;

  const textSecondary = isDarkMode ? 'text-muted' : 'text-muted';

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl border space-y-4 ${
          isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-line'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary dark:text-[#38C792] font-bold text-sm">
            <RotateCcw className="w-4 h-4" />
            <span>7-Day Warranty Revision</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className={`text-xs ${textSecondary}`}>
          If the completed work has any defect or needs re-servicing, describe the issue below. The order will be reopened in the Running tab for the technician to rework.
        </p>

        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Describe what needs to be fixed or re-done..."
          rows={3}
          className={`w-full p-3 rounded-xl text-xs border outline-none resize-none ${
            isDarkMode
              ? 'bg-[#111b21] border-[#2f3b43] text-white placeholder:text-muted'
              : 'bg-surface border-line text-black placeholder:text-muted'
          }`}
        />

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!desc.trim() || submitting}
            onClick={onSubmit}
            className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary dark:bg-[#38C792] dark:hover:bg-[#38C792] text-white dark:text-[#111b21] text-xs font-bold transition-all disabled:bg-primary-disabled cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Submit Revision'}
          </button>
        </div>
      </div>
    </div>
  );
}
