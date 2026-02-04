import { cn } from '~/utils/shared/cn';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-slate-200 dark:bg-slate-700 rounded',
            className
          )}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="flex-1">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
      </div>
    </div>
  );
}

export function GenomeCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="flex-1 min-w-0">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
            <div className="flex gap-2 mb-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-16" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-24" />
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ReportCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
          </div>
        </div>
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-1" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48" />
      </div>
      <table className="min-w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        </div>
      ))}
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-32 mt-6" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-8 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4" />
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64" />
        </div>
      </div>
    </div>
  );
}
