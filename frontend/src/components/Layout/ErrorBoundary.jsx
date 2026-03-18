import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiAlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-slate-500 mb-6">
              Page loaded but encountered an error. Check browser console. Common causes: missing imports or API response mismatch.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full btn btn-primary"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full btn btn-secondary"
              >
                Go Back
              </button>
            </div>
            <details className="mt-6 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
              <summary className="font-medium cursor-pointer mb-2">Show error details</summary>
              <pre className="whitespace-pre-wrap text-slate-600">{this.state.error?.message}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

