import { Link } from '@tanstack/react-router';
import { Card } from '~/components/ui/Card';
import { Globe, ArrowRight } from 'lucide-react';

interface AncestryData {
  hasReport: boolean;
  topEthnicity: string;
  percentage: number;
  regions: number;
}

interface AncestryCardProps {
  ancestry?: AncestryData;
}

export function AncestryCard({ ancestry }: AncestryCardProps) {
  if (!ancestry?.hasReport) {
    return (
      <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <Globe className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white">Ancestry</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Discover your ethnic origins</p>
            <Link
              to="/ancestry"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
            >
              Explore
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
          <Globe className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 dark:text-white">Ancestry</h3>
          <div className="mt-2">
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {ancestry.percentage}%
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {ancestry.topEthnicity}
            </p>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">
            {ancestry.regions} regions detected
          </p>
        </div>
      </div>
    </Card>
  );
}
