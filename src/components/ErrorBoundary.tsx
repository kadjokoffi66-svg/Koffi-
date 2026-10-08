import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-white">Une erreur est survenue</h1>
            <p className="text-xs text-slate-300">
              L'application a rencontré une interruption temporaire. Vous pouvez réinitialiser les données locales pour continuer normalement.
            </p>
            {this.state.error?.message && (
              <div className="bg-slate-950 text-rose-300 font-mono text-[11px] p-3 rounded-xl text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-98 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réinitialiser et recharger</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
