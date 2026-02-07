import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { AlertCircle } from 'lucide-react';

interface DashboardErrorProps {
  onRetry: () => void;
}

export function DashboardError({ onRetry }: DashboardErrorProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <Card className="p-8 text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Failed to Load Dashboard
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          We couldn&apos;t load your dashboard data. Please try again.
        </p>
        <Button onClick={onRetry}>
          Try Again
        </Button>
      </Card>
    </div>
  );
}
