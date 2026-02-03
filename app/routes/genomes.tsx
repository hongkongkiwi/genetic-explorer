import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '~/components/Navbar';
import { ReportComparison } from '~/components/ReportComparison';
import { GenomeCardSkeleton } from '~/components/Skeleton';
import { 
  Dna, 
  Trash2, 
  FileText, 
  AlertCircle, 
  Clock, 
  Database, 
  FileArchive,
  Shield,
  HardDrive,
  CheckCircle,
  Upload,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type SortField = 'filename' | 'date' | 'snps' | 'size';
type SortDirection = 'asc' | 'desc';

interface Genome {
  id: string;
  filename: string;
  internalFilename: string;
  source: string;
  snpCount: number;
  storedSnps: number;
  fileSize: string;
  compressionType: string | null;
  checksum: string;
  processedAt: string;
  status: string;
}

interface Stats {
  totalGenomes: number;
  totalSNPs: number;
  totalReports: number;
  averageSnpsPerGenome: number;
}

export const Route = createFileRoute('/genomes')({
  component: GenomesPage,
});

function GenomesPage() {
  const [genomes, setGenomes] = useState<Genome[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchGenomes();
  }, []);

  const fetchGenomes = async () => {
    try {
      const response = await fetch('/api/genomes');
      const data = await response.json();
      
      if (data.success) {
        setGenomes(data.genomes);
        setStats(data.stats);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to fetch genomes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedGenomes = genomes
    .filter(g => 
      g.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.source.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'filename':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'date':
          comparison = new Date(a.processedAt).getTime() - new Date(b.processedAt).getTime();
          break;
        case 'snps':
          comparison = a.storedSnps - b.storedSnps;
          break;
        case 'size':
          comparison = parseFloat(a.fileSize) - parseFloat(b.fileSize);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const deleteGenome = async (id: string) => {
    if (!confirm('Are you sure you want to delete this genome and all its reports?')) return;

    try {
      const response = await fetch(`/api/genomes?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGenomes(genomes.filter(g => g.id !== id));
      }
    } catch {
      setError('Failed to delete genome');
    }
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      '23andme': '23andMe',
      'ancestry': 'AncestryDNA',
      'myheritage': 'MyHeritage',
      'other': 'Other',
    };
    return labels[source] || source;
  };

  const getCompressionBadge = (type: string | null) => {
    if (!type) return null;
    
    const styles: Record<string, string> = {
      'gzip': 'bg-purple-100 text-purple-700',
      'zip': 'bg-blue-100 text-blue-700',
    };
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type] || 'bg-slate-100 text-slate-600'}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Genomes</h1>
          <p className="text-slate-600">
            Manage your uploaded genetic data and view analysis reports.
          </p>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              icon={Dna}
              label="Total Genomes"
              value={stats.totalGenomes.toString()}
              color="indigo"
            />
            <StatCard
              icon={Database}
              label="Total SNPs"
              value={stats.totalSNPs.toLocaleString()}
              color="blue"
            />
            <StatCard
              icon={FileText}
              label="Reports"
              value={stats.totalReports.toString()}
              color="green"
            />
            <StatCard
              icon={HardDrive}
              label="Avg SNPs/Genome"
              value={stats.averageSnpsPerGenome.toLocaleString()}
              color="purple"
            />
          </motion.div>
        )}

        {/* Search and Actions */}
        {!isLoading && !error && genomes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search genomes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Sort by:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="date">Date</option>
                <option value="filename">Name</option>
                <option value="snps">SNPs</option>
                <option value="size">Size</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <ArrowUpDown className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <ReportComparison genomes={genomes} />
            <Link
              to="/upload"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </Link>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <GenomeCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : genomes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Dna className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Genomes Yet</h3>
            <p className="text-slate-600 mb-6">Upload your first genome to get started with genetic analysis.</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all"
            >
              <Upload className="w-5 h-5" />
              Upload Genome
            </Link>
          </div>
        ) : filteredAndSortedGenomes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No genomes found</h3>
            <p className="text-slate-600">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedGenomes.map((genome, index) => (
              <motion.div
                key={genome.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Dna className="w-7 h-7 text-indigo-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 text-lg truncate">
                          {genome.filename}
                        </h3>
                        {getCompressionBadge(genome.compressionType)}
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-xs">
                          {getSourceLabel(genome.source)}
                        </span>
                        {genome.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Database className="w-4 h-4" />
                          {genome.storedSnps.toLocaleString()} SNPs stored
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <HardDrive className="w-4 h-4" />
                          {genome.fileSize}
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(genome.processedAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Shield className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-slate-500 font-mono">
                          SHA256: {genome.checksum}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      to={`/report/${genome.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">View Report</span>
                    </Link>
                    <button
                      onClick={() => deleteGenome(genome.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete genome"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
