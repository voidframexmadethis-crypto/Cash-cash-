import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white p-6 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Something went wrong.</h1>
          <p className="text-zinc-400 mb-2 font-mono text-sm">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <pre className="text-red-300 text-xs bg-zinc-900 p-4 rounded-lg mb-6 max-w-2xl overflow-auto text-left">
            {this.state.error?.stack}
          </pre>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
