/**
 * Virtual List Component
 * 
 * Efficiently renders large lists by only rendering visible items.
 * Uses the @tanstack/react-virtual library for virtualization.
 */

import { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '~/utils/shared/cn';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T, index: number) => string;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  itemClassName?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingSkeleton?: React.ReactNode;
}

export function VirtualList<T>({
  items,
  renderItem,
  getItemKey,
  estimateSize = 50,
  overscan = 5,
  className,
  itemClassName,
  emptyMessage = 'No items to display',
  loading = false,
  loadingSkeleton,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: (index) => getItemKey(items[index], index),
  });

  if (!mounted) {
    return (
      <div className={cn("h-96 overflow-hidden", className)}>
        {loadingSkeleton || (
          <div className="p-4 text-center text-slate-500">Loading...</div>
        )}
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className={cn("h-96 flex items-center justify-center", className)}>
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", className)}
      style={{ height: '100%', maxHeight: '600px' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className={cn("absolute top-0 left-0 w-full", itemClassName)}
              style={{
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualList;
