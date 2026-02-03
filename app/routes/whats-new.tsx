import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowLeft, 
  BookOpen, 
  Database, 
  Code2, 
  Lightbulb,
  ExternalLink,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ReactNode, memo } from 'react';

const researchUpdatesQueryOptions = {
  queryKey: ['whats-new'],
  queryFn: async () => {
    const response = await fetch('/api/whats-new');
    if (!response.ok) throw new Error('Failed to fetch updates');
    return response.json();
  },
};

export const Route = createFileRoute('/whats-new')({
  component: WhatsNewPage,
  loader: ({ context }: { context: any }) => {
    context.queryClient?.prefetchQuery(researchUpdatesQueryOptions);
  },
});

// Animation variants
const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

// Update category icons
const categoryIcons: Record<string, typeof Sparkles> = {
  feature: Sparkles,
  database: Database,
  research: BookOpen,
  technical: Code2,
  improvement: Lightbulb,
};

const categoryColors: Record<string, string> = {
  feature: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  database: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  research: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  technical: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  improvement: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
};

// Memoized update card component
const UpdateCard = memo(function UpdateCard({ update }: { update: any }) {
  const Icon = categoryIcons[update.category] || Sparkles;
  const categoryColor = categoryColors[update.category] || categoryColors.feature;
  
  return (
    <motion.div variants={itemVariants}>
      <Card className="p-6 hover:shadow-lg transition-shadow duration-300 group">
        <div className="flex gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${categoryColor}`}>
            <Icon className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Badge className={categoryColor}>
                {update.category.charAt(0).toUpperCase() + update.category.slice(1)}
              </Badge>
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(update.date).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {update.title}
            </h3>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
              {update.description}
            </p>

            {/* Links */}
            {(update.learnMoreUrl || update.documentationUrl) && (
              <div className="flex items-center gap-4">
                {update.learnMoreUrl && (
                  <a
                    href={update.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 group/link"
                  >
                    Learn more
                    <ExternalLink className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
                  </a>
                )}
                {update.documentationUrl && (
                  <a
                    href={update.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1"
                  >
                    Documentation
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

// Feature highlight component
const FeatureHighlight = memo(function FeatureHighlight({ 
  icon: Icon, 
  title, 
  description,
  colorClass
}: { 
  icon: typeof Sparkles; 
  title: string; 
  description: string;
  colorClass: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="p-6 h-full">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </Card>
    </motion.div>
  );
});

function WhatsNewPage() {
  const { data: updatesData } = useSuspenseQuery(researchUpdatesQueryOptions);
  const { updates = [], lastUpdated } = updatesData || {};

  // Group updates by month
  const groupedUpdates = updates.reduce((groups: Record<string, any[]>, update: any) => {
    const month = new Date(update.date).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric'
    });
    if (!groups[month]) groups[month] = [];
    groups[month].push(update);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">What's New</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Latest updates, features, and research additions
              </p>
            </div>
          </div>

          {lastUpdated && (
            <p className="text-sm text-slate-500">
              Last updated: {new Date(lastUpdated).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          )}
        </motion.div>

        {/* Feature Highlights */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-12"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recent Highlights
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <FeatureHighlight
              icon={Sparkles}
              title="New Features"
              description="Explore the latest tools and capabilities added to Genetic Explorer"
              colorClass="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            />
            <FeatureHighlight
              icon={Database}
              title="Database Updates"
              description="Fresh research data and expanded variant annotations"
              colorClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            />
            <FeatureHighlight
              icon={BookOpen}
              title="Research Papers"
              description="New studies integrated into our knowledge base"
              colorClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            />
          </div>
        </motion.section>

        {/* Updates Timeline */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Update Timeline
          </h2>

          <div className="space-y-8">
            {Object.entries(groupedUpdates).map(([month, monthUpdates]) => {
              const updates = monthUpdates as any[];
              return (
                <div key={month}>
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">{month}</h3>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    <span className="text-sm text-slate-500">
                      {updates.length} update{updates.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {updates.map((update) => (
                      <UpdateCard key={update.id} update={update} />
                    ))}
                  </div>
                </div>
              );
            })}

            {updates.length === 0 && (
              <Card className="p-12 text-center">
                <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No updates yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Check back soon for new features and research updates
                </p>
              </Card>
            )}
          </div>
        </motion.section>

        {/* Newsletter/Subscribe Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
                <p className="text-indigo-100">
                  New features and research are added regularly. Enable notifications in your profile settings to get alerts about major updates.
                </p>
              </div>
              <Link
                to="/settings"
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors shrink-0"
              >
                Go to Settings
              </Link>
            </div>
          </Card>
        </motion.section>
      </main>
    </div>
  );
}

export default WhatsNewPage;
