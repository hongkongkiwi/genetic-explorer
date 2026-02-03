import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
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
  ArrowRight,
  Globe,
  Dna,
  Heart,
  Users2,
  CheckCircle,
  Bell,
  Rocket
} from 'lucide-react';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { memo } from 'react';

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
              <span className="text-sm text-slate-600 flex items-center gap-1">
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
                    className="text-sm text-indigo-700 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 group/link"
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
                    className="text-sm text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1"
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
  colorClass,
  href
}: { 
  icon: typeof Sparkles; 
  title: string; 
  description: string;
  colorClass: string;
  href?: string;
}) {
  const content = (
    <Card className="p-6 h-full hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      {href && (
        <div className="mt-3 flex items-center gap-1 text-sm text-indigo-700 dark:text-indigo-400 font-medium">
          Explore <ArrowRight className="w-3 h-3" />
        </div>
      )}
    </Card>
  );

  if (href) {
    return (
      <motion.div variants={itemVariants}>
        <Link to={href} className="block h-full">
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      {content}
    </motion.div>
  );
});

// New Feature Announcement Component
const NewFeatureBanner = memo(function NewFeatureBanner({
  icon: Icon,
  title,
  description,
  ctaText,
  ctaHref,
  colorClass,
  bgClass
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-6"
    >
      <Card className={`p-6 ${bgClass} border-0`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={`w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium text-white">
                NEW
              </span>
              <h3 className="font-bold text-white text-lg">{title}</h3>
            </div>
            <p className="text-white/80 text-sm">{description}</p>
          </div>
          <Link
            to={ctaHref}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
            style={{ color: 'inherit' }}
          >
            {ctaText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
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

  // Static feature announcements
  const featureAnnouncements = [
    {
      icon: Globe,
      title: 'Ancestry Analysis',
      description: 'Discover your ethnic origins with detailed breakdowns across 150+ regions worldwide. Includes haplogroups and chromosome painting.',
      ctaText: 'Explore Ancestry',
      ctaHref: '/ancestry',
      colorClass: 'bg-emerald-500',
      bgClass: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    },
    {
      icon: Dna,
      title: 'Genetic Traits',
      description: 'Learn about the fun and unique genetic traits that make you, you. From earwax type to cilantro preference.',
      ctaText: 'View Your Traits',
      ctaHref: '/traits',
      colorClass: 'bg-purple-500',
      bgClass: 'bg-gradient-to-r from-purple-600 to-pink-600',
    },
    {
      icon: Heart,
      title: 'Carrier Status',
      description: 'Understand if you carry genetic variants for certain inherited conditions. Important information for family planning.',
      ctaText: 'Check Carrier Status',
      ctaHref: '/carrier',
      colorClass: 'bg-rose-500',
      bgClass: 'bg-gradient-to-r from-rose-600 to-red-600',
    },
    {
      icon: Users2,
      title: 'DNA Relatives',
      description: 'Connect with genetic relatives who have also opted in. Discover new family connections and expand your family tree.',
      ctaText: 'Find Relatives',
      ctaHref: '/relatives',
      colorClass: 'bg-blue-500',
      bgClass: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">What's New</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Latest updates, features, and research additions
              </p>
            </div>
          </div>

          {lastUpdated && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
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

        {/* New Feature Announcements */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Major Feature Releases
            </h2>
          </motion.div>

          {featureAnnouncements.map((feature, index) => (
            <NewFeatureBanner key={feature.title} {...feature} />
          ))}
        </section>

        {/* Feature Highlights Grid */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-12"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Explore Features
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureHighlight
              icon={Globe}
              title="Ancestry"
              description="Discover your ethnic origins and genetic heritage"
              colorClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              href="/ancestry"
            />
            <FeatureHighlight
              icon={Dna}
              title="Traits"
              description="Learn about your unique genetic characteristics"
              colorClass="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              href="/traits"
            />
            <FeatureHighlight
              icon={Heart}
              title="Carrier Status"
              description="Check carrier status for inherited conditions"
              colorClass="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
              href="/carrier"
            />
            <FeatureHighlight
              icon={Users2}
              title="DNA Relatives"
              description="Connect with genetic relatives"
              colorClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              href="/relatives"
            />
          </div>
        </motion.section>

        {/* Other Highlights */}
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
                    <span className="text-sm text-slate-500 dark:text-slate-400">
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
                <Bell className="w-8 h-8" />
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
