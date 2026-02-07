import { Link } from '@tanstack/react-router';
import { Card } from '~/components/ui/Card';

const colors: Record<string, string> = {
  indigo: 'from-indigo-500 to-purple-600',
  blue: 'from-blue-500 to-cyan-600',
  green: 'from-green-500 to-emerald-600',
  purple: 'from-purple-500 to-pink-600',
};

interface QuickActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  color: string;
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  color,
}: QuickActionCardProps) {
  return (
    <Link to={href}>
      <Card className="p-4 transition-all hover:shadow-md group h-full">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white text-sm">{title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
