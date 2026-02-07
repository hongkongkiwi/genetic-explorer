import { Link } from '@tanstack/react-router';
import { Card } from '~/components/ui/Card';

const colors: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  href: string;
  highlight?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
  highlight = false,
}: StatCardProps) {
  const content = (
    <Card className={`p-4 transition-all hover:shadow-md ${highlight ? 'ring-2 ring-amber-400' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </Card>
  );

  return href ? (
    <Link to={href} className="block">
      {content}
    </Link>
  ) : content;
}
