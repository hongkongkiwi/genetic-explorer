// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  // Navigation timing
  dnsLookup: number;
  tcpConnection: number;
  serverResponse: number;
  domProcessing: number;
  resourceLoading: number;
  totalLoadTime: number;

  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte

  // Custom metrics
  apiCallCount: number;
  apiErrorCount: number;
  cacheHitRate: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private apiCalls = { total: 0, cached: 0, errors: 0 };

  constructor() {
    if (typeof window === 'undefined') return;

    this.measureNavigationTiming();
    this.observeWebVitals();
    this.observeResourceTiming();
  }

  private measureNavigationTiming(): void {
    if (!('performance' in window)) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.metrics = {
            ...this.metrics,
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnection: navigation.connectEnd - navigation.connectStart,
            serverResponse: navigation.responseEnd - navigation.responseStart,
            domProcessing: navigation.domComplete - navigation.domLoading,
            resourceLoading: navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
            totalLoadTime: navigation.loadEventEnd - navigation.startTime,
            ttfb: navigation.responseStart - navigation.startTime,
          };

          this.logMetrics();
        }
      }, 0);
    });
  }

  private observeWebVitals(): void {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const firstEntry = list.getEntries()[0] as PerformanceEventTiming;
        this.metrics.fid = firstEntry.processingStart - firstEntry.startTime;
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      // FID not supported
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cls = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      // CLS not supported
    }

    // First Contentful Paint
    try {
      const paintObserver = new PerformanceObserver((list) => {
        const fcp = list.getEntriesByName('first-contentful-paint')[0];
        if (fcp) {
          this.metrics.fcp = fcp.startTime;
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (e) {
      // Paint not supported
    }
  }

  private observeResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log slow resources (> 1s)
          if (entry.duration > 1000) {
            console.warn('Slow resource:', entry.name, `${Math.round(entry.duration)}ms`);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (e) {
      // Resource timing not supported
    }
  }

  // Track API call performance
  trackApiCall(duration: number, cached: boolean, error: boolean): void {
    this.apiCalls.total++;
    if (cached) this.apiCalls.cached++;
    if (error) this.apiCalls.errors++;

    this.metrics.apiCallCount = this.apiCalls.total;
    this.metrics.apiErrorCount = this.apiCalls.errors;
    this.metrics.cacheHitRate = this.apiCalls.total > 0
      ? (this.apiCalls.cached / this.apiCalls.total) * 100
      : 0;

    // Log slow API calls (> 500ms)
    if (duration > 500 && !cached) {
      console.warn('Slow API call:', `${Math.round(duration)}ms`);
    }
  }

  // Measure function execution time
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    if (duration > 16) { // Longer than one frame (60fps)
      console.warn(`Slow operation: ${name}`, `${Math.round(duration)}ms`);
    }
    
    return result;
  }

  // Measure async function execution time
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    if (duration > 500) {
      console.warn(`Slow async operation: ${name}`, `${Math.round(duration)}ms`);
    }
    
    return result;
  }

  // Get current metrics
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  // Log metrics to console
  private logMetrics(): void {
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Performance Metrics');
      console.log('DNS Lookup:', `${Math.round(this.metrics.dnsLookup || 0)}ms`);
      console.log('TCP Connection:', `${Math.round(this.metrics.tcpConnection || 0)}ms`);
      console.log('Server Response:', `${Math.round(this.metrics.serverResponse || 0)}ms`);
      console.log('DOM Processing:', `${Math.round(this.metrics.domProcessing || 0)}ms`);
      console.log('Resource Loading:', `${Math.round(this.metrics.resourceLoading || 0)}ms`);
      console.log('Total Load Time:', `${Math.round(this.metrics.totalLoadTime || 0)}ms`);
      console.log('TTFB:', `${Math.round(this.metrics.ttfb || 0)}ms`);
      
      if (this.metrics.fcp) {
        console.log('FCP:', `${Math.round(this.metrics.fcp)}ms`);
      }
      if (this.metrics.lcp) {
        console.log('LCP:', `${Math.round(this.metrics.lcp)}ms`);
      }
      if (this.metrics.fid) {
        console.log('FID:', `${Math.round(this.metrics.fid)}ms`);
      }
      if (this.metrics.cls !== undefined) {
        console.log('CLS:', this.metrics.cls.toFixed(4));
      }
      console.groupEnd();
    }
  }

  // Cleanup
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render time
export function useRenderTime(componentName: string): void {
  const startTime = typeof window !== 'undefined' ? performance.now() : 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const renderTime = performance.now() - startTime;
    
    if (renderTime > 50) {
      console.warn(`Slow render: ${componentName}`, `${Math.round(renderTime)}ms`);
    }
  });
}

// Utility to mark and measure custom performance entries
export function mark(name: string): void {
  if ('performance' in window) {
    performance.mark(name);
  }
}

export function measure(name: string, startMark: string, endMark?: string): number {
  if (!('performance' in window)) return 0;

  try {
    const end = endMark || name + '-end';
    if (!endMark) {
      performance.mark(end);
    }
    
    performance.measure(name, startMark, end);
    const entries = performance.getEntriesByName(name, 'measure');
    const duration = entries[entries.length - 1]?.duration || 0;
    
    // Cleanup
    performance.clearMarks(startMark);
    performance.clearMarks(end);
    performance.clearMeasures(name);
    
    return duration;
  } catch (e) {
    return 0;
  }
}

// Lazy loading intersection observer
export function createLazyLoader(
  callback: () => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  });

  return observer;
}

// Prefetch on hover
export function prefetchOnHover(element: HTMLElement, url: string): () => void {
  let prefetchTriggered = false;

  const handleMouseEnter = () => {
    if (prefetchTriggered) return;
    prefetchTriggered = true;
    
    // Use requestIdleCallback for low priority prefetch
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    }
  };

  element.addEventListener('mouseenter', handleMouseEnter, { once: true });

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
  };
}
