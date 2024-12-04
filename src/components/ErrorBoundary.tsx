import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950 text-black dark:text-white gap-4 p-4"
          >
            <p>„Ç¢„Éó„É™„Ç±„Éº„Ç∑„Éß„É≥„Åß„Ç®„É©„Éº„ÅåÁô∫Áîü„Åó„Åæ„Åó„Åü„Ä?/p>
            {this.state.error && (
              <pre className="bg-red-100 dark:bg-red-900/30 p-4 rounded text-sm max-w-xl overflow-auto text-red-800 dark:text-red-300">
                {this.state.error.message}
                {"\n"}
                {this.state.error.stack}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 min-w-[44px] min-h-[44px]"
            >
              ÂÜçË™≠„ÅøËæº„Å?
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
// updated: •®•È©`ïr§Œ•’•©©`•Î•–•√•ØUI∏ƒ…∆
