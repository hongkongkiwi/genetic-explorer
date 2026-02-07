import { Link } from '@tanstack/react-router';
import { Card } from '~/components/ui/Card';
import { Users2, ArrowRight } from 'lucide-react';

interface RelativesData {
  hasOptedIn: boolean;
  matchCount: number;
  closeMatches: number;
}

interface RelativesCardProps {
  relatives?: RelativesData;
}

export function RelativesCard({ relatives }: RelativesCardProps) {
  if (!relatives?.hasOptedIn) {
    return (
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Users2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white">DNA Relatives</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Connect with relatives</p>
            <Link
              to="/relatives"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400"
            >
              Learn More
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
          <Users2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 dark:text-white">DNA Relatives</h3>
          <div className="mt-2">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {relatives.matchCount}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              matches found
            </p>
          </div>
          {relatives.closeMatches > 0 && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {relatives.closeMatches} close matches
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
