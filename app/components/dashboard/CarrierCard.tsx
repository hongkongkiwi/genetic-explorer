import { Link } from '@tanstack/react-router';
import { Card } from '~/components/ui/Card';
import { Heart, AlertCircle, CheckCircle, Info, ArrowRight } from 'lucide-react';

interface CarrierData {
  hasReport: boolean;
  relevantVariants: number;
  shouldConsultDoctor: boolean;
}

interface CarrierCardProps {
  carrier?: CarrierData;
}

export function CarrierCard({ carrier }: CarrierCardProps) {
  if (!carrier?.hasReport) {
    return (
      <Card className="p-4 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border-rose-200 dark:border-rose-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white">Carrier Status</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Check carrier variants</p>
            <Link
              to="/carrier"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              View Report
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  if (carrier.shouldConsultDoctor) {
    return (
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white">Carrier Status</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              {carrier.relevantVariants} variants detected
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Consult recommended
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 dark:text-white">Carrier Status</h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
            No carrier variants
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            All clear - review details
          </p>
        </div>
      </div>
    </Card>
  );
}
