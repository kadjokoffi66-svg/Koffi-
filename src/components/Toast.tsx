import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto w-full p-3.5 rounded-2xl shadow-xl border flex items-center justify-between text-xs font-semibold backdrop-blur-md transition-all animate-in slide-in-from-top duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-500/30'
              : toast.type === 'error'
              ? 'bg-rose-900/90 text-white border-rose-500/30'
              : toast.type === 'warning'
              ? 'bg-amber-900/90 text-white border-amber-500/30'
              : 'bg-slate-900/90 text-white border-slate-700'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span className="leading-snug">{toast.message}</span>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/60 hover:text-white ml-2 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
