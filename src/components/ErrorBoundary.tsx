import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1
    });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-screen flex items-center justify-center bg-slate-800 text-white p-4">
          <div className="max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <div className="text-slate-400 mb-4 text-sm">
              <p>Error: {this.state.error?.message}</p>
              {this.state.retryCount < 3 && (
                <p className="mt-2">
                  You can try to recover by retrying the operation or refreshing the page.
                </p>
              )}
            </div>
            <div className="space-x-4">
              {this.state.retryCount < 3 && (
                <button 
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                  onClick={this.handleRetry}
                >
                  Retry
                </button>
              )}
              <button 
                className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                onClick={this.handleRefresh}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
