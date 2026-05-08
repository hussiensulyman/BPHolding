"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="section-padding flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-slate-500">
              Failed to load section. Please refresh the page.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="btn-primary text-sm"
            >
              Retry
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
