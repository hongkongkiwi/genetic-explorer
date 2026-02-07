import { Link } from '@tanstack/react-router';
import { Card } from '~/components/ui/Card';
import { Palette, CheckCircle, ArrowRight } from 'lucide-react';

interface TraitsData {
  hasReport: boolean;
  interestingTraits: string[];
  totalTraits: number;
}

interface TraitsCardProps {
  traits?: TraitsData;
}

export function TraitsCard({ traits }: TraitsCardProps) {
  if (!traits?.hasReport) {
    return (
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white">Traits</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Fun facts about your DNA</p>
            <Link
              to="/traits"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-purple-700 hover:text-purple-800 dark:text-purple-400"
            >
              Discover
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
          <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 dark:text-white">Traits</h3>
          <div className="mt-2 space-y-1">
            {traits.interestingTraits.slice(0, 2).map((trait, i) => (
              <p key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-purple-500" />
                {trait}
              </p>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {traits.totalTraits} traits analyzed
          </p>
        </div>
      </div>
    </Card>
  );
}
