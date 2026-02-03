import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SNPBadge } from '~/components/SNPBadge';
import { 
  Database, 
  Search, 
  RefreshCw, 
  FileText, 
  Activity,
  Pill,
  Dna,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCcw
} from 'lucide-react';

interface ResearchStats {
  snpCount: number;
  clinvarCount: number;
  paperCount: number;
  drugInteractionCount: number;
  geneCount: number;
  gwasCount: number;
  lastSyncBySource: Record<string, string>;
}

interface SyncStatus {
  id: number;
  source: string;
  syncType: string;
  recordsProcessed: number;
  recordsAdded: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
}

export const Route = createFileRoute('/research')({
  component: ResearchAdminPage,
});

function ResearchAdminPage() {
  const [stats, setStats] = useState<ResearchStats | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'sync'>('overview');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [statsRes, syncRes] = await Promise.all([
        fetch('/api/research/stats'),
        fetch('/api/research/sync'),
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }
      
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        if (syncData.success) {
          setSyncHistory(syncData.recentSyncs);
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (type: 'full' | 'incremental') => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/research/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: type }),
      });
      
      if (response.ok) {
        loadStats();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(`/api/research/snp?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.results || []);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Research Database</h1>
          <p className="text-slate-600">
            Manage and explore genetic research data from ClinVar, PubMed, PharmGKB, and GWAS Catalog.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-8 w-fit">
          {(['overview', 'search', 'sync'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard
                    icon={Dna}
                    label="SNPs"
                    value={stats.snpCount.toLocaleString()}
                    color="indigo"
                  />
                  <StatCard
                    icon={Activity}
                    label="ClinVar Records"
                    value={stats.clinvarCount.toLocaleString()}
                    color="red"
                  />
                  <StatCard
                    icon={FileText}
                    label="PubMed Papers"
                    value={stats.paperCount.toLocaleString()}
                    color="blue"
                  />
                  <StatCard
                    icon={Pill}
                    label="Drug Interactions"
                    value={stats.drugInteractionCount.toLocaleString()}
                    color="green"
                  />
                  <StatCard
                    icon={Database}
                    label="Genes"
                    value={stats.geneCount.toLocaleString()}
                    color="purple"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="GWAS Studies"
                    value={stats.gwasCount.toLocaleString()}
                    color="orange"
                  />
                </div>

                {/* Last Sync Times */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Last Sync Times</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.lastSyncBySource).length > 0 ? (
                      Object.entries(stats.lastSyncBySource).map(([source, date]) => (
                        <div key={source} className="flex items-center justify-between">
                          <span className="text-slate-600 capitalize">{source}</span>
                          <span className="text-sm text-slate-600">
                            {new Date(date).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">No sync history available</p>
                    )}
                  </div>
                </div>

                {/* Recent Updates Banner */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          Recent Database Updates
                        </h3>
                        <p className="text-slate-600 mb-4">
                          Stay informed about the latest research, new SNPs, and updated recommendations in our database.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            to="/whats-new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                          >
                            View All Updates
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <SNPBadge status="new" size="sm" />
                            <span>2 new SNPs</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <SNPBadge status="research-updated" size="sm" />
                            <span>3 research updates</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-500" />
                        <span>8 SNPs added this month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4 text-blue-500" />
                        <span>23 papers indexed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleSync('full')}
                      disabled={isSyncing}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      Full Sync
                    </button>
                    <Link
                      to="/explorer"
                      className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    >
                      <Search className="w-4 h-4" />
                      Explore SNPs
                    </Link>
                    <Link
                      to="/whats-new"
                      className="flex items-center gap-2 px-4 py-2 border border-amber-300 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100"
                    >
                      <Sparkles className="w-4 h-4" />
                      What's New
                    </Link>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search SNPs by rsID, gene, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Search
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">
                    {searchResults.length} Results
                  </h3>
                </div>
                <div className="divide-y divide-slate-200">
                  {searchResults.map((result) => (
                    <div key={result.rsid} className="p-6 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            to={`/api/research/snp/${result.rsid}`}
                            className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            {result.rsid}
                          </Link>
                          {result.geneSymbol && (
                            <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-600 text-sm rounded">
                              {result.geneSymbol}
                            </span>
                          )}
                          <p className="text-slate-600 mt-1">{result.geneName}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            Chromosome {result.chromosome}:{result.position}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {result.sourceDatabases?.map((db: string) => (
                            <span
                              key={db}
                              className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded"
                            >
                              {db}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Sync History</h3>
              <button
                onClick={() => handleSync('full')}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Run Full Sync
              </button>
            </div>
            <div className="divide-y divide-slate-200">
              {syncHistory.length > 0 ? (
                syncHistory.map((sync) => (
                  <div key={sync.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 capitalize">
                            {sync.source}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            sync.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : sync.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {sync.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {sync.syncType} sync • {sync.recordsProcessed} records processed
                          {sync.recordsAdded > 0 && ` • ${sync.recordsAdded} added`}
                        </p>
                      </div>
                      <span className="text-sm text-slate-400">
                        {new Date(sync.startedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No sync history available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  color: string;
}) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
