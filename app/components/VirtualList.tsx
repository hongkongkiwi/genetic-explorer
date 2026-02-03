import { useRef, useState, useEffect, useCallback, memo, useMemo } from 'react';
import { cn } from '~/utils/cn';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  emptyComponent?: React.ReactNode;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
}

interface VisibleRange {
  startIndex: number;
  endIndex: number;
}

// Memoized list item to prevent unnecessary re-renders
const VirtualListItem = memo(function VirtualListItem<T>({
  item,
  index,
  renderItem,
  style,
}: {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  style: React.CSSProperties;
}) {
  return (
    <div style={style} className="absolute left-0 right-0">
      {renderItem(item, index)}
    </div>
  );
});

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 5,
  className,
  onEndReached,
  endReachedThreshold = 200,
  isLoadingMore,
  hasMore,
  emptyComponent,
  headerComponent,
  footerComponent,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const endReachedCalledRef = useRef(false);

  // Calculate visible range
  const visibleRange: VisibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  // Total height of all items
  const totalHeight = useMemo(
    () => items.length * itemHeight,
    [items.length, itemHeight]
  );

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newScrollTop = target.scrollTop;
    setScrollTop(newScrollTop);

    // Check if we've reached the end
    if (onEndReached && hasMore && !isLoadingMore) {
      const scrollBottom = newScrollTop + target.clientHeight;
      const threshold = totalHeight - endReachedThreshold;

      if (scrollBottom >= threshold && !endReachedCalledRef.current) {
        endReachedCalledRef.current = true;
        onEndReached();
      } else if (scrollBottom < threshold) {
        endReachedCalledRef.current = false;
      }
    }
  }, [onEndReached, hasMore, isLoadingMore, totalHeight, endReachedThreshold]);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Generate visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    const result: { item: T; index: number; style: React.CSSProperties }[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
      if (i >= 0 && i < items.length) {
        result.push({
          item: items[i],
          index: i,
          style: {
            top: i * itemHeight,
            height: itemHeight,
          },
        });
      }
    }

    return result;
  }, [visibleRange, items, itemHeight]);

  if (items.length === 0 && emptyComponent) {
    return (
      <div ref={containerRef} className={cn('overflow-auto', className)}>
        {headerComponent}
        {emptyComponent}
        {footerComponent}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('overflow-auto relative', className)}
      style={{ willChange: 'transform' }}
    >
      {headerComponent}
      
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {visibleItems.map(({ item, index, style }) => (
          <VirtualListItem
            key={index}
            item={item}
            index={index}
            renderItem={renderItem}
            style={style}
          />
        ))}
      </div>

      {isLoadingMore && (
        <div className="py-4 text-center">
          <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="py-4 text-center text-sm text-slate-500">
          No more items
        </div>
      )}

      {footerComponent}
    </div>
  );
}

// Optimized table with virtualization
interface VirtualTableProps<T> {
  items: T[];
  columns: Array<{
    key: string;
    header: React.ReactNode;
    width?: number | string;
    render: (item: T, index: number) => React.ReactNode;
  }>;
  rowHeight?: number;
  headerHeight?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  keyExtractor: (item: T, index: number) => string;
}

export function VirtualTable<T>({
  items,
  columns,
  rowHeight = 60,
  headerHeight = 48,
  className,
  onRowClick,
  keyExtractor,
}: VirtualTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor((scrollTop - headerHeight) / rowHeight));
    const visibleCount = Math.ceil(containerHeight / rowHeight);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + 2);
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, rowHeight, headerHeight, items.length]);

  const totalHeight = items.length * rowHeight;

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, i) => ({
      item,
      index: startIndex + i,
      key: keyExtractor(item, startIndex + i),
    }));
  }, [visibleRange, items, keyExtractor]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('overflow-auto', className)}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex"
        style={{ height: headerHeight }}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider flex-shrink-0"
            style={{ width: col.width, minWidth: col.width }}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, key }) => (
          <div
            key={key}
            className={cn(
              'absolute left-0 right-0 flex border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50',
              onRowClick && 'cursor-pointer'
            )}
            style={{
              top: index * rowHeight,
              height: rowHeight,
            }}
            onClick={() => onRowClick?.(item, index)}
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="px-6 py-4 flex items-center flex-shrink-0 overflow-hidden"
                style={{ width: col.width, minWidth: col.width }}
              >
                {col.render(item, index)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Windowed list for non-uniform heights
interface WindowedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  estimateHeight: (item: T, index: number) => number;
  className?: string;
  overscan?: number;
}

export function WindowedList<T>({
  items,
  renderItem,
  estimateHeight,
  className,
  overscan = 3,
}: WindowedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [measuredHeights, setMeasuredHeights] = useState<Map<number, number>>(new Map());

  // Calculate cumulative heights
  const { cumulativeHeights, totalHeight } = useMemo(() => {
    const cumulative: number[] = [];
    let sum = 0;

    for (let i = 0; i < items.length; i++) {
      cumulative.push(sum);
      const height = measuredHeights.get(i) ?? estimateHeight(items[i], i);
      sum += height;
    }

    return { cumulativeHeights: cumulative, totalHeight: sum };
  }, [items, measuredHeights, estimateHeight]);

  // Find start index based on scroll position
  const startIndex = useMemo(() => {
    let low = 0;
    let high = items.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (cumulativeHeights[mid] < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return Math.max(0, low - 1 - overscan);
  }, [scrollTop, cumulativeHeights, items.length, overscan]);

  // Find end index
  const endIndex = useMemo(() => {
    const containerHeight = containerRef.current?.clientHeight ?? 0;
    const target = scrollTop + containerHeight;
    
    let low = 0;
    let high = items.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (cumulativeHeights[mid] < target) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return Math.min(items.length - 1, low + overscan);
  }, [scrollTop, cumulativeHeights, items.length, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Measure actual heights after render
  useEffect(() => {
    if (!containerRef.current) return;

    const newHeights = new Map(measuredHeights);
    let changed = false;

    for (let i = startIndex; i <= endIndex; i++) {
      const element = containerRef.current.querySelector(`[data-index="${i}"]`) as HTMLElement;
      if (element) {
        const height = element.getBoundingClientRect().height;
        if (height !== measuredHeights.get(i)) {
          newHeights.set(i, height);
          changed = true;
        }
      }
    }

    if (changed) {
      setMeasuredHeights(newHeights);
    }
  }, [startIndex, endIndex, items]);

  const visibleItems = useMemo(() => {
    const result: { item: T; index: number; style: React.CSSProperties }[] = [];

    for (let i = startIndex; i <= endIndex && i < items.length; i++) {
      result.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute',
          top: cumulativeHeights[i],
          left: 0,
          right: 0,
        },
      });
    }

    return result;
  }, [startIndex, endIndex, items, cumulativeHeights]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('overflow-auto relative', className)}
      style={{ willChange: 'transform' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} data-index={index}>
            {renderItem(item, index, style)}
          </div>
        ))}
      </div>
    </div>
  );
}
