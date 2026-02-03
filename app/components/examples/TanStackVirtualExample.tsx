import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/Card';

interface VirtualItem {
  id: string;
  rsid: string;
  gene: string;
  impact: string;
  description: string;
}

// Generate sample data
const generateData = (count: number): VirtualItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    rsid: `rs${1000000 + i}`,
    gene: ['MTHFR', 'APOE', 'CYP1A2', 'COMT', 'FTO', 'ACTN3'][i % 6],
    impact: ['High', 'Moderate', 'Low', 'Protective'][i % 4],
    description: `Genetic variant with ${['significant', 'moderate', 'minor', 'protective'][i % 4]} impact on health outcomes.`,
  }));
};

const data = generateData(10000);

export function TanStackVirtualExample() {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height
    overscan: 5, // Number of items to render outside viewport
  });

  const items = virtualizer.getVirtualItems();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>TanStack Virtual Example</CardTitle>
        <CardDescription>
          Virtualized list rendering 10,000 items using @tanstack/react-virtual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={parentRef}
          className="h-[400px] overflow-auto rounded-md border"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {items.map((virtualItem) => {
              const item = data[virtualItem.index];
              const impactColors: Record<string, string> = {
                'High': 'border-l-red-500',
                'Moderate': 'border-l-yellow-500',
                'Low': 'border-l-blue-500',
                'Protective': 'border-l-green-500',
              };

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className={`p-4 border-b border-l-4 bg-card ${impactColors[item.impact]} hover:bg-muted/50 transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{item.rsid}</span>
                        <span className="text-sm text-muted-foreground">|</span>
                        <span className="font-medium">{item.gene}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            item.impact === 'High'
                              ? 'bg-red-100 text-red-700'
                              : item.impact === 'Moderate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : item.impact === 'Protective'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {item.impact}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      #{virtualItem.index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Rendering {items.length} of {data.length.toLocaleString()} items
        </p>
      </CardContent>
    </Card>
  );
}
