// Performance Monitoring System
'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Custom metrics
  routeTransitionTime?: number;
  modalOpenTime?: number;
  scrollPerformance?: number;
  memoryUsage?: number;
  
  // Navigation timing
  pageLoadTime?: number;
  domContentLoaded?: number;
  resourceLoadTime?: number;
}

interface PerformanceMonitorProps {
  enableWebVitals?: boolean;
  enableCustomMetrics?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) =\u003e void;
}

export function PerformanceMonitor({
  enableWebVitals = true,
  enableCustomMetrics = true,
  onMetrics,
}: PerformanceMonitorProps) {
  const routeStartTime = useRef\u003cnumber\u003e(0);

  // Web Vitals monitoring
  useEffect(() =\u003e {
    if (!enableWebVitals) return;

    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) =\u003e {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      
      if (lastEntry) {
        const metrics: PerformanceMetrics = { lcp: lastEntry.startTime };
        onMetrics?.(metrics);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) =\u003e {
      for (const entry of list.getEntries()) {
        const firstInputEntry = entry as PerformanceEventTiming;
        const metrics: PerformanceMetrics = { fid: firstInputEntry.processingStart - firstInputEntry.startTime };
        onMetrics?.(metrics);
      }
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) =\u003e {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as LayoutShift;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }
      const metrics: PerformanceMetrics = { cls: clsValue };
      onMetrics?.(metrics);
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () =\u003e {
      observer.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [enableWebVitals, onMetrics]);

  // Route transition timing
  useEffect(() =\u003e {
    if (!enableCustomMetrics) return;

    routeStartTime.current = performance.now();

    return () =\u003e {
      if (routeStartTime.current) {
        const routeTransitionTime = performance.now() - routeStartTime.current;
        const metrics: PerformanceMetrics = { routeTransitionTime };
        onMetrics?.(metrics);
      }
    };
  }, [enableCustomMetrics, onMetrics]);

  return null;
}

// Custom hooks for performance tracking
export const usePerformanceTracking = () =\u003e {
  const trackModalOpen = useCallback(() =\u003e {
    return performance.now();
  }, []);

  const trackModalClose = useCallback((startTime: number) =\u003e {
    const modalOpenTime = performance.now() - startTime;
    return modalOpenTime;
  }, []);

  const trackScrollPerformance = useCallback((callback: () =\u003e void) =\u003e {
    const startTime = performance.now();
    callback();
    const scrollPerformance = performance.now() - startTime;
    return scrollPerformance;
  }, []);

  const getMemoryUsage = useCallback(() =\u003e {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      return memoryInfo.usedJSHeapSize;
    }
    return null;
  }, []);

  return {
    trackModalOpen,
    trackModalClose,
    trackScrollPerformance,
    getMemoryUsage,
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () =\u003e {
  const metricsRef = useRef\u003cPerformanceMetrics\u003e({});
  const { trackModalOpen, trackModalClose, getMemoryUsage } = usePerformanceTracking();

  const trackRouteTransition = useCallback(() =\u003e {
    const startTime = performance.now();
    return () =\u003e {
      const routeTransitionTime = performance.now() - startTime;
      metricsRef.current.routeTransitionTime = routeTransitionTime;
    };
  }, []);

  const trackModalPerformance = useCallback(() =\u003e {
    const startTime = trackModalOpen();
    return () =\u003e {
      const modalOpenTime = trackModalClose(startTime);
      metricsRef.current.modalOpenTime = modalOpenTime;
    };
  }, [trackModalOpen, trackModalClose]);

  const updateMemoryUsage = useCallback(() =\u003e {
    const memoryUsage = getMemoryUsage();
    if (memoryUsage) {
      metricsRef.current.memoryUsage = memoryUsage;
    }
  }, [getMemoryUsage]);

  const getMetrics = useCallback(() =\u003e {
    return { ...metricsRef.current };
  }, []);

  return {
    trackRouteTransition,
    trackModalPerformance,
    updateMemoryUsage,
    getMetrics,
  };
};

// Performance boundary component
interface PerformanceBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface PerformanceBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class PerformanceBoundary extends React.Component\u003c
  PerformanceBoundaryProps,
  PerformanceBoundaryState
\u003e {
  constructor(props: PerformanceBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Performance Boundary Error:', error, errorInfo);
    
    // Track performance errors
    if (typeof performance !== 'undefined' \u0026\u0026 performance.mark) {
      performance.mark('performance-error');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          \u003cdiv className="text-center py-12"\u003e
            \u003ch2 className="text-xl font-semibold text-red-600 mb-2"\u003eBir sorun oluştu\u003c/h2\u003e
            \u003cp className="text-slate-600 mb-4"\u003eSayfa yüklenirken beklenmeyen bir hata oldu.\u003c/p\u003e
            \u003cbutton
              onClick={() =\u003e window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            \u003e
              Sayfayı Yenile
            \u003c/button\u003e
          \u003c/div\u003e
        )
      );
    }

    return this.props.children;
  }
}

// FPS Monitor for real-time performance tracking
export const useFPSMonitor = (enabled = true) =\u003e {
  const fpsRef = useRef\u003cnumber\u003e(60);
  const frameCountRef = useRef\u003cnumber\u003e(0);
  const lastTimeRef = useRef\u003cnumber\u003e(0);

  useEffect(() =\u003e {
    if (!enabled) return;

    lastTimeRef.current = performance.now();

    const measureFPS = () =\u003e {
      frameCountRef.current++;
      
      const currentTime = performance.now();
      if (currentTime - lastTimeRef.current \u003e= 1000) {
        fpsRef.current = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    const animationId = requestAnimationFrame(measureFPS);

    return () =\u003e {
      cancelAnimationFrame(animationId);
    };
  }, [enabled]);

  const getFPS = useCallback(() =\u003e {
    return fpsRef.current;
  }, []);

  const isGoodPerformance = useCallback(() =\u003e {
    return fpsRef.current \u003e= 55; // Good performance threshold
  }, []);

  return {
    getFPS,
    isGoodPerformance,
  };
};

// Performance optimized console logger
export const perfLog = {
  info: (message: string, data?: any) =\u003e {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [PERF] ${message}`, data);
    }
  },
  
  warn: (message: string, data?: any) =\u003e {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ [PERF] ${message}`, data);
    }
  },
  
  error: (message: string, data?: any) =\u003e {
    console.error(`❌ [PERF] ${message}`, data);
  },
};