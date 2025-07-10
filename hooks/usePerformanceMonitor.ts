import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentRenderTime: number;
  memoryUsage?: number;
  renderCount: number;
}

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;

      // Log performance in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }

      // Collect metrics for monitoring
      const metrics: PerformanceMetrics = {
        componentRenderTime: renderTime,
        renderCount: renderCount.current,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      };

      // In production, send to monitoring service
      if (process.env.NODE_ENV === 'production' && renderTime > 50) {
        // Example: Analytics.track('performance_warning', { component: componentName, ...metrics });
      }
    };
  });

  return {
    renderCount: renderCount.current
  };
}

// Hook for detecting memory leaks
export function useMemoryMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const checkMemory = () => {
        if ((performance as any).memory) {
          const memory = (performance as any).memory;
          const used = Math.round(memory.usedJSHeapSize / 1048576);
          const total = Math.round(memory.totalJSHeapSize / 1048576);
          
          if (used > 100) { // Warn if memory usage > 100MB
            console.warn(`High memory usage detected: ${used}MB / ${total}MB`);
          }
        }
      };

      const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);
}