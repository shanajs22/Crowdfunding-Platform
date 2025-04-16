import React, { ReactNode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Define types for error boundary
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error boundary for entire app
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("React error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="bg-destructive text-destructive-foreground p-4 rounded-md max-w-md">
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p>{this.state.error?.message || "An unexpected error occurred"}</p>
            <button 
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md"
              onClick={() => window.location.reload()}
            >
              Reload the page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add try-catch for initial rendering
try {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} catch (error) {
  console.error("Fatal error rendering React application:", error);
  
  // Display error to user instead of blank page
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; font-family: sans-serif;">
        <div style="background-color: #ef4444; color: white; padding: 1rem; border-radius: 0.5rem; max-width: 28rem;">
          <h1 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">Application Failed to Start</h1>
          <p>${error instanceof Error ? error.message : "An unexpected error occurred"}</p>
          <button 
            style="margin-top: 1rem; background-color: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer;"
            onclick="window.location.reload()"
          >
            Reload the page
          </button>
        </div>
      </div>
    `;
  }
}
