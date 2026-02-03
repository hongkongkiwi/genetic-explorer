import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Dna, 
  FileText, 
  Users, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  Upload,
  Search,
  Bell,
  Activity,
  Clock,
  Shield,
  ArrowRight,
  Globe,
  Heart,
  Users2,
  Dna as DnaIcon,
  Lightbulb,
  Palette,
  CheckCircle,
  Info
} from 'lucide-react';
import { useAuth } from '~/hooks/useAuth';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { SNPBadge } from '~/components/SNPBadge';
import { formatDistanceToNow } from 'date-fns';

interface DashboardData {
  stats: {
    totalGenomes: number;
    totalReports: number;
    sharedWithMe: number;
    sharedByMe: number;
    recentUpdates: number;
  };
  recentGenomes: Array<{
    id: string;
    filename: string;
    snpCount: number;
    processedAt: string;
  }>;
  recentReports: Array<{
    id: string;
    genomeId: string;
    genomeName: string;
    generatedAt: string;
  }>;
  updates: Array<{
    id: string;
    type: 'new' | 'research-updated' | 'evidence-upgraded' | 'recommendation-changed' | 'major-update';
    title: string;
    description: string;
    rsid?: string;
    date: string;
    affectsUser?: boolean;
  }>;
  recommendations: string[];
  // New feature data
  ancestry?: {
    hasReport: boolean;
    topEthnicity: string;
    percentage: number;
    regions: number;
  };
  traits?: {
    hasReport: boolean;
    interestingTraits: string[];
    totalTraits: number;
  };
  carrierStatus?: {
    hasReport: boolean;
    relevantVariants: number;
    shouldConsultDoctor: boolean;
  };
  relatives?: {
    hasOptedIn: boolean;
    matchCount: number;
    closeMatches: number;
  };
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/dashboard?range=${selectedTimeRange}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return <DashboardError onRetry={fetchDashboardData} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Here's what's happening with your genetic data
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    selectedTimeRange === range
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8"
        >
          <StatCard
            icon={Dna}
            label="Genomes"
            value={data.stats.totalGenomes}
            color="indigo"
            href="/genomes"
          />
          <StatCard
            icon={FileText}
            label="Reports"
            value={data.stats.totalReports}
            color="purple"
            href="/reports"
          />
          <StatCard
            icon={Users}
            label="Shared With Me"
            value={data.stats.sharedWithMe}
            color="blue"
            href="/sharing"
          />
          <StatCard
            icon={Shield}
            label="My Shares"
            value={data.stats.sharedByMe}
            color="green"
            href="/sharing"
          />
          <StatCard
            icon={Sparkles}
            label="New Updates"
            value={data.stats.recentUpdates}
            color="amber"
            href="/whats-new"
            highlight={data.stats.recentUpdates > 0}
          />
        </motion.div>

        {/* New Feature Highlights - Ancestry, Traits, Carrier, Relatives */}
        {data.stats.totalGenomes > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Your Genetic Insights
              </h2>
              <Link
                to="/reports"
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
              >
                View All Reports
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AncestryCard ancestry={data.ancestry} />
              <TraitsCard traits={data.traits} />
              <CarrierCard carrier={data.carrierStatus} />
              <RelativesCard relatives={data.relatives} />
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Activity & Updates */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <QuickActionCard
                  icon={Upload}
                  title="Upload Genome"
                  description="Add new genetic data"
                  href="/upload"
                  color="indigo"
                />
                <QuickActionCard
                  icon={Search}
                  title="Explore SNPs"
                  description="Search your variants"
                  href="/explorer"
                  color="blue"
                />
                <QuickActionCard
                  icon={Globe}
                  title="View Ancestry"
                  description="Explore your origins"
                  href="/ancestry"
                  color="green"
                />
                <QuickActionCard
                  icon={DnaIcon}
                  title="Your Traits"
                  description="Discover unique traits"
                  href="/traits"
                  color="purple"
                />
              </div>
            </motion.div>

            {/* Recent Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent Database Updates
                </h2>
                <Link
                  to="/whats-new"
                  className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              {data.updates.length === 0 ? (
                <Card className="p-8 text-center">
                  <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No new updates in the selected time range
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {data.updates.slice(0, 5).map((update, index) => (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <Card className={`p-4 transition-all hover:shadow-md ${
                        update.affectsUser ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10' : ''
                      }`}>
                        <div className="flex items-start gap-4">
                          <SNPBadge status={update.type} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-slate-900 dark:text-white">
                                {update.title}
                              </h3>
                              {update.affectsUser && (
                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full">
                                  Affects Your Genome
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {update.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              {update.rsid && (
                                <Link
                                  to={`/explorer?rsid=${update.rsid}`}
                                  className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-mono"
                                >
                                  {update.rsid}
                                </Link>
                              )}
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(update.date), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Genomes */}
            {data.recentGenomes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Recent Genomes
                  </h2>
                  <Link
                    to="/genomes"
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {data.recentGenomes.slice(0, 4).map((genome, index) => (
                    <motion.div
                      key={genome.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <Link to={`/report/${genome.id}`}>
                        <Card className="p-4 hover:shadow-md transition-all group">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Dna className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-900 dark:text-white truncate">
                                {genome.filename}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {genome.snpCount.toLocaleString()} SNPs • {formatDistanceToNow(new Date(genome.processedAt), { addSuffix: true })}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Recommendations & Activity */}
          <div className="space-y-8">
            {/* Recommendations */}
            {data.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Recommended Actions
                </h2>
                <Card className="p-4">
                  <ul className="space-y-3">
                    {data.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}

            {/* Recent Reports */}
            {data.recentReports.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Recent Reports
                </h2>
                <Card className="p-0 overflow-hidden">
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {data.recentReports.slice(0, 5).map((report) => (
                      <Link
                        key={report.id}
                        to={`/report/${report.genomeId}`}
                        className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {report.genomeName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDistanceToNow(new Date(report.generatedAt), { addSuffix: true })}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Get Started CTA (for new users) */}
            {data.stats.totalGenomes === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Dna className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      Start Your Journey
                    </h3>
                    <p className="text-indigo-100 mb-4">
                      Upload your genetic data to unlock personalized insights
                    </p>
                    <Link
                      to="/upload"
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your First Genome
                    </Link>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color,
  href,
  highlight = false
}: { 
  icon: any; 
  label: string; 
  value: number; 
  color: string;
  href: string;
  highlight?: boolean;
}) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  };

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

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  color
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-pink-600',
  };

  return (
    <Link to={href}>
      <Card className="p-4 transition-all hover:shadow-md group h-full">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white text-sm">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// New Feature Cards
function AncestryCard({ ancestry }: { ancestry?: DashboardData['ancestry'] }) {
  if (!ancestry?.hasReport) {
    return (
      <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white">Ancestry</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Discover your ethnic origins</p>
            <Link 
              to="/ancestry"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
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
          <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            {ancestry.regions} regions detected
          </p>
        </div>
      </div>
    </Card>
  );
}

function TraitsCard({ traits }: { traits?: DashboardData['traits'] }) {
  if (!traits?.hasReport) {
    return (
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white">Traits</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Fun facts about your DNA</p>
            <Link 
              to="/traits"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
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

function CarrierCard({ carrier }: { carrier?: DashboardData['carrierStatus'] }) {
  if (!carrier?.hasReport) {
    return (
      <Card className="p-4 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border-rose-200 dark:border-rose-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white">Carrier Status</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Check carrier variants</p>
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
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white">Carrier Status</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              {carrier.relevantVariants} variants detected
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 flex items-center gap-1">
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
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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

function RelativesCard({ relatives }: { relatives?: DashboardData['relatives'] }) {
  if (!relatives?.hasOptedIn) {
    return (
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Users2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-white">DNA Relatives</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Connect with relatives</p>
            <Link 
              to="/relatives"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
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
          <Users2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-8" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
            <div className="space-y-8">
              <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <Card className="p-8 text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Failed to Load Dashboard
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          We couldn't load your dashboard data. Please try again.
        </p>
        <Button onClick={onRetry}>
          Try Again
        </Button>
      </Card>
    </div>
  );
}
