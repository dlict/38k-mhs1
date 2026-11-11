/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl shrink-0 ${
                isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900 leading-snug">
                {title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-xs cursor-pointer active:scale-95 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
