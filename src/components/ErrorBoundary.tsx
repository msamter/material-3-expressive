import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--md-surface)] text-[var(--md-on-surface)] p-6">
          <div className="max-w-sm w-full rounded-[28px] border border-[var(--md-outline-variant)] bg-[var(--md-surface-container-low)] p-6 text-center space-y-4">
            <h1 className="font-display text-lg font-semibold">Something went wrong</h1>
            <p className="text-sm text-[var(--md-on-surface-variant)]">
              The interface encountered an unexpected rendering error.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-full bg-[var(--md-primary)] text-[var(--md-on-primary)] font-display text-sm font-semibold cursor-pointer"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
