/**
 * React Hook für Client-seitige Error Learning Integration
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ClientError {
  type: 'REACT' | 'NETWORK' | 'VALIDATION' | 'NAVIGATION' | 'PERFORMANCE';
  message: string;
  component: string;
  context: string;
  stackTrace?: string;
}

// Globaler Error Store für Client-seitige Fehler
class ClientErrorLearning {
  private errors: ClientError[] = [];
  private patterns: Map<string, number> = new Map();

  logError(error: ClientError): void {
    this.errors.push({
      ...error,
      timestamp: new Date().toISOString()
    } as any);

    // Pattern-Tracking
    const patternKey = `${error.type}_${error.component}`;
    const count = this.patterns.get(patternKey) || 0;
    this.patterns.set(patternKey, count + 1);

    // Nach 3 Fehlern Warnung
    if (count + 1 >= 3) {
      console.warn(`⚠️ CLIENT-SIDE WIEDERHOLUNGSFEHLER: ${patternKey} (${count + 1}x)`);
    }

    // An Backend senden für zentrale Analyse
    this.sendToBackend(error);
  }

  private async sendToBackend(error: ClientError): Promise<void> {
    try {
      await fetch('/api/admin/error-learning/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: error.type,
          message: error.message,
          file: error.component,
          context: `Client-side: ${error.context}`
        })
      });
    } catch (err) {
      console.error('Failed to send error to backend:', err);
    }
  }

  getStats() {
    return {
      totalErrors: this.errors.length,
      patterns: Array.from(this.patterns.entries()).map(([key, count]) => ({
        pattern: key,
        count
      }))
    };
  }
}

const clientErrorLearning = new ClientErrorLearning();

/**
 * Hook für Error Learning Integration
 */
export function useErrorLearning() {
  // Error Boundary Integration
  useEffect(() => {
    // Global Error Handler für unhandled Promise Rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      clientErrorLearning.logError({
        type: 'NETWORK',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        component: 'Global',
        context: 'Promise rejection outside try-catch',
        stackTrace: event.reason?.stack
      });
    };

    // Global Error Handler für JavaScript Errors
    const handleError = (event: ErrorEvent) => {
      clientErrorLearning.logError({
        type: 'REACT',
        message: event.message,
        component: event.filename || 'Unknown',
        context: `Line ${event.lineno}:${event.colno}`,
        stackTrace: event.error?.stack
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Performance Monitoring
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Langsame Navigation/Resources loggen
        if (entry.duration > 3000) { // 3 Sekunden
          clientErrorLearning.logError({
            type: 'PERFORMANCE',
            message: `Slow ${entry.entryType}: ${entry.duration}ms`,
            component: entry.name,
            context: `Performance issue detected`
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });

    return () => observer.disconnect();
  }, []);

  // Manual Error Logging Functions
  const logReactError = (error: Error, componentName: string, context: string) => {
    clientErrorLearning.logError({
      type: 'REACT',
      message: error.message,
      component: componentName,
      context,
      stackTrace: error.stack
    });
  };

  const logNetworkError = (error: Error, endpoint: string) => {
    clientErrorLearning.logError({
      type: 'NETWORK',
      message: error.message,
      component: endpoint,
      context: 'API call failed'
    });
  };

  const logValidationError = (message: string, formName: string, fieldName: string) => {
    clientErrorLearning.logError({
      type: 'VALIDATION',
      message,
      component: formName,
      context: `Field validation failed: ${fieldName}`
    });
  };

  const logNavigationError = (error: string, route: string) => {
    clientErrorLearning.logError({
      type: 'NAVIGATION',
      message: error,
      component: 'Router',
      context: `Navigation to ${route} failed`
    });
  };

  return {
    logReactError,
    logNetworkError,
    logValidationError,
    logNavigationError,
    getStats: () => clientErrorLearning.getStats()
  };
}

/**
 * React Error Boundary mit Error Learning
 */
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo?: any;
}

export class ErrorLearningBoundary extends React.Component<
  { children: React.ReactNode; componentName: string },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error Learning integrieren
    clientErrorLearning.logError({
      type: 'REACT',
      message: error.message,
      component: this.props.componentName,
      context: `React Error Boundary: ${errorInfo.componentStack?.slice(0, 200)}`,
      stackTrace: error.stack
    });

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">Fehler in {this.props.componentName}</h3>
          <p className="text-red-600 text-sm mt-2">
            Ein unerwarteter Fehler ist aufgetreten. Das Problem wurde automatisch geloggt.
          </p>
          <button 
            className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded text-sm"
            onClick={() => this.setState({ hasError: false })}
          >
            Erneut versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC für automatische Error Learning Integration
 */
export function withErrorLearning<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function ErrorLearningWrapper(props: P) {
    return (
      <ErrorLearningBoundary componentName={componentName}>
        <Component {...props} />
      </ErrorLearningBoundary>
    );
  };
}