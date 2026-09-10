import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TITAN_OS module error caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.moduleName !== this.props.moduleName && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="module-error-fallback" className="h-full w-full flex items-center justify-center p-6 bg-[#07090e]">
          <div className="max-w-xl w-full bg-[#0d1117] border border-red-500/40 rounded-xl p-6 shadow-2xl glow-amber">
            <div className="flex items-center gap-3 text-red-400 mb-4 pb-3 border-b border-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 animate-pulse" />
              <div>
                <h3 className="font-semibold text-lg tracking-wide uppercase">
                  {this.props.moduleName || 'Subsystem'} Fault Trapped
                </h3>
                <p className="text-xs text-zinc-400 font-mono">KERNEL EXCEPTION HANDLER ACTIVE</p>
              </div>
            </div>

            <div className="bg-[#05070a] rounded-lg p-4 font-mono text-xs text-zinc-300 border border-zinc-800 mb-5 overflow-auto max-h-48">
              <div className="text-red-400 font-bold mb-1">
                {this.state.error?.name}: {this.state.error?.message}
              </div>
              <div className="text-zinc-500 whitespace-pre-wrap">
                {this.state.errorInfo?.componentStack?.slice(0, 300) || this.state.error?.stack?.slice(0, 300)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Rest of workstation remains intact.</span>
              <button
                id="btn-recover-module"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset & Restart Module
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
