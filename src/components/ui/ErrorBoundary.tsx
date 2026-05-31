import React, { Component, ReactNode } from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { logErrorBoundaryEvent } from '../../lib/errorLogging';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logErrorBoundaryEvent(error, errorInfo.componentStack, {
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex min-h-screen items-center justify-center bg-theme-secondary px-4 py-8'>
          <div className='max-w-md rounded-lg border border-border-primary bg-theme-primary p-8'>
            <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-red-500/10'>
              <AlertCircle className='h-8 w-8 text-red-500' />
            </div>
            <h1 className='font-display mb-3 text-2xl font-bold text-text-primary'>
              Something went wrong
            </h1>
            <p className='mb-6 text-sm font-medium text-text-secondary'>
              {this.state.error?.message ||
                'An unexpected error occurred. Please try again.'}
            </p>
            <div className='flex gap-3'>
              <button
                onClick={this.handleReset}
                className='flex flex-1 items-center justify-center gap-2 rounded bg-[var(--accent-primary)] px-4 py-3 text-sm font-bold text-black transition-all hover:bg-amber-400'>
                <ArrowLeft className='h-4 w-4' />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
