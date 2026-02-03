'use client';

import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { memo, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscanCount?: number;
  className?: string;
  keyExtractor: (item: T, index: number) => string;
}

function VirtualListInner<T>({ 
  items, 
  itemHeight, 
  renderItem, 
  overscanCount = 5, 
  className,
  keyExtractor 
}: VirtualListProps<T>) {
  const Row = useMemo(() => 
    memo(({ index, style }: ListChildComponentProps) => (
      <div style={style}>
        {renderItem(items[index], index)}
      </div>
    ), (prev, next) => prev.index === next.index),
    [items, renderItem]
  );

  return (
    <div className={className}>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List
            height={height}
            itemCount={items.length}
            itemSize={itemHeight}
            width={width}
            overscanCount={overscanCount}
            itemKey={(index) => keyExtractor(items[index], index)}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

export const VirtualList = memo(VirtualListInner) as <T>(props: VirtualListProps<T>) => JSX.Element;

// Virtual Table Component
interface Column<T> {
  key: string;
  header: React.ReactNode;
  width: number;
  render: (item: T, index: number) => React.ReactNode;
}

interface VirtualTableProps<T> {
  items: T[];
  columns: Column<T>[];
  rowHeight?: number;
  className?: string;
  keyExtractor: (item: T, index: number) => string;
  headerClassName?: string;
  rowClassName?: string;
}

function VirtualTableInner<T>({
  items,
  columns,
  rowHeight = 60,
  className,
  keyExtractor,
  headerClassName = 'bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700',
  rowClassName = 'border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
}: VirtualTableProps<T>) {
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

  const Row = useMemo(() => 
    memo(({ index, style }: ListChildComponentProps) => {
      const item = items[index];
      return (
        <div 
          style={{
            ...style,
            display: 'flex',
            width: totalWidth,
          }}
          className={rowClassName}
        >
          {columns.map((col) => (
            <div 
              key={col.key} 
              style={{ width: col.width }}
              className="px-4 py-3 flex items-center"
            >
              {col.render(item, index)}
            </div>
          ))}
        </div>
      );
    }, (prev, next) => prev.index === next.index),
    [items, columns, totalWidth, rowClassName]
  );

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className={`flex ${headerClassName}`} style={{ width: totalWidth }}>
        {columns.map((col) => (
          <div 
            key={col.key} 
            style={{ width: col.width }}
            className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Virtual List */}
      <div className="flex-1">
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              height={Math.max(height - 48, 100)} // Subtract header height
              itemCount={items.length}
              itemSize={rowHeight}
              width={Math.max(width, totalWidth)}
              overscanCount={3}
              itemKey={(index) => keyExtractor(items[index], index)}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
}

export const VirtualTable = memo(VirtualTableInner) as <T>(props: VirtualTableProps<T>) => JSX.Element;

// Virtual Grid Component (for card layouts)
interface VirtualGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columnCount: number;
  itemHeight: number;
  gap?: number;
  className?: string;
  keyExtractor: (item: T, index: number) => string;
}

function VirtualGridInner<T>({
  items,
  renderItem,
  columnCount,
  itemHeight,
  gap = 16,
  className,
  keyExtractor,
}: VirtualGridProps<T>) {
  const rowCount = Math.ceil(items.length / columnCount);

  const Row = useMemo(() => 
    memo(({ index, style }: ListChildComponentProps) => {
      const startIdx = index * columnCount;
      const rowItems = items.slice(startIdx, startIdx + columnCount);
      
      return (
        <div 
          style={{
            ...style,
            display: 'flex',
            gap,
            padding: `0 ${gap / 2}px`,
          }}
        >
          {rowItems.map((item, i) => (
            <div 
              key={keyExtractor(item, startIdx + i)}
              style={{ 
                flex: `0 0 calc((100% - ${(columnCount - 1) * gap}px) / ${columnCount})`,
              }}
            >
              {renderItem(item, startIdx + i)}
            </div>
          ))}
        </div>
      );
    }, (prev, next) => prev.index === next.index),
    [items, columnCount, gap, renderItem, keyExtractor]
  );

  return (
    <div className={className}>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List
            height={height}
            itemCount={rowCount}
            itemSize={itemHeight + gap}
            width={width}
            overscanCount={2}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

export const VirtualGrid = memo(VirtualGridInner) as <T>(props: VirtualGridProps<T>) => JSX.Element;
