'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface OrderRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisionDesc: string;
  onDescChange: (val: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function OrderRevisionModal({
  isOpen,
  onClose,
  revisionDesc,
  onDescChange,
  onSubmit,
  isPending,
}: OrderRevisionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-emerald-600" />
          Claim 3-Day Warranty Revision
        </h3>
        <p className="text-xs text-zinc-500">
          Describe the unresolved issue. The provider will re-visit at zero extra cost.
        </p>

        <textarea
          value={revisionDesc}
          onChange={(e) => onDescChange(e.target.value)}
          placeholder="E.g., The AC cooling stopped again after 1 day..."
          rows={4}
          className="w-full p-3 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
          required
        />

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!revisionDesc.trim() || isPending}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {isPending ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
