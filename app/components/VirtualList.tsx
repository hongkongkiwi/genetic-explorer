/**
 * Virtual List Component
 * 
 * Efficiently renders large lists by only rendering visible items.
 * Uses the @tanstack/react-virtual library for virtualization.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '~/utils/shared/cn';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string;
  estimateSize?: number;
  itemHeight?: number; // Alias for estimateSize for backward compatibility
  overscan?: number;
  className?: string;
  itemClassName?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingSkeleton?: React.ReactNode;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
}

export function VirtualList<T>({
  items,
  renderItem,
  getItemKey,
  estimateSize = 50,
  itemHeight,
  overscan = 5,
  className,
  itemClassName,
  emptyMessage = 'No items to display',
  loading = false,
  loadingSkeleton,
  onEndReached,
  isLoadingMore,
  hasMore,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const endReachedRef = useRef(false);

  const sizeEstimate = itemHeight || estimateSize;

  useEffect(() => {
    setMounted(true);
  }, []);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => sizeEstimate,
    overscan,
    getItemKey: getItemKey ? (index) => getItemKey(items[index], index) : undefined,
  });

  // Handle end reached callback
  const virtualItems = virtualizer.getVirtualItems();
  useEffect(() => {
    if (!onEndReached || !hasMore || isLoadingMore) return;
    
    const [lastItem] = [...virtualItems].reverse();
    if (!lastItem) return;

    if (lastItem.index >= items.length - 1 && !endReachedRef.current) {
      endReachedRef.current = true;
      onEndReached();
    } else if (lastItem.index < items.length - 1) {
      endReachedRef.current = false;
    }
  }, [virtualItems, items.length, onEndReached, hasMore, isLoadingMore]);

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
        {isLoadingMore && (
          <div className="absolute bottom-0 left-0 w-full p-4 text-center">
            <div className="animate-pulse text-slate-500">Loading more...</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualList;
