import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { useState, useCallback, useMemo, memo } from 'react';
import { Navbar } from '../components/Navbar';
import { VirtualTable } from '../components/VirtualList';
import { ImpactBadge } from '../components/ImpactBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { SNPBadge } from '../components/SNPBadge';
import { usePaginatedQuery } from '../hooks/useOptimizedQuery';
import { performanceMonitor } from '../utils/performance';
import { 
  Dna, 
  Search, 
  Filter, 
  Download, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { SNPResult, SNPFilterParams } from '../types/api';

export const Route = createFileRoute('/explorer-optimized')({
  component: SNPExplorerOptimizedPage,
});

type SortField = 'rsid' | 'gene' | 'chromosome' | 'category' | 'impact';
type SortDirection = 'asc' | 'desc';

// Memoized table row component
const SNPTableRow = memo(function SNPTableRow({
  snp,
  index,
  isFavorite,
  onToggleFavorite,
}: {
  snp: SNPResult;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (rsid: string) => void;
}) {
  return (
    <>
      <td className="px-6 py-4 whitespace-nowrap">
        <a
          href={`https://www.ncbi.nlm.nih.gov/snp/${snp.rsid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
        >
          {snp.rsid}
        </a>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="font-mono text-sm text-slate-900 dark:text-slate-300">
          {snp.gene || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
        Chr{snp.chromosome}:{snp.position}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono">
          {snp.genotype}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <CategoryBadge category={snp.category} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ImpactBadge impact={snp.clinicalImpact} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleFavorite(snp.rsid)}
          className={`p-2 rounded-lg transition-colors ${
            isFavorite
              ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-900/20'
              : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </td>
    </>
  );
});

function SNPExplorerOptimizedPage() {
  const searchParams = useSearch({ from: '/explorer-optimized' }) as { rsid?: string; genome?: string };
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.rsid || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [selectedGenome, setSelectedGenome] = useState<string>(searchParams.genome || '');
  const [selectedChromosome, setSelectedChromosome] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('rsid');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Fetch genomes for selector
  const { data: genomesData } = usePaginatedQuery({
    queryKey: 'genomes-list',
    queryFn: async () => {
      const response = await fetch('/api/genomes');
      if (!response.ok) throw new Error('Failed to fetch genomes');
      return response.json();
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch SNPs with pagination
  const {
    data: snpsData,
    isLoading,
    isFetching,
    page,
    setPage,
  } = usePaginatedQuery({
    queryKey: `snps-${selectedGenome}-${searchQuery}-${selectedCategory}-${selectedImpact}`,
    queryFn: async ({ page, limit }) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        genomeId: selectedGenome,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedImpact !== 'all' && { impact: selectedImpact }),
        ...(selectedChromosome !== 'all' && { chromosome: selectedChromosome }),
        ...(showFavoritesOnly && { favoritesOnly: 'true' }),
        sortBy: sortField,
        sortDirection,
      });

      const startTime = performance.now();
      const response = await fetch(`/api/snps?${params}`);
      const duration = performance.now() - startTime;
      
      performanceMonitor.trackApiCall(duration, false, !response.ok);
      
      if (!response.ok) throw new Error('Failed to fetch SNPs');
      return response.json();
    },
    enabled: !!selectedGenome,
    page: 1,
    limit: 100,
    staleTime: 30 * 1000,
  });

  const snps = snpsData?.items || [];
  const totalItems = snpsData?.total || 0;
  const totalPages = Math.ceil(totalItems / 100);
  const categories = snpsData?.filters?.categories || [];
  const chromosomes = snpsData?.filters?.chromosomes || [];

  const handleSort = useCallback((field: SortField) => {
    setSortField(prev => {
      if (prev === field) {
        setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        return prev;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  const toggleFavorite = useCallback(async (rsid: string) => {
    // Optimistic update handled by parent
    try {
      const response = await fetch('/api/snp-favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsid }),
      });
      
      if (!response.ok) throw new Error('Failed to toggle favorite');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, []);

  const exportToCSV = useCallback(() => {
    if (!snps.length) return;
    
    const headers = ['RSID', 'Gene', 'Chromosome', 'Position', 'Genotype', 'Category', 'Impact'];
    const rows = snps.map((snp: SNPResult) => [
      snp.rsid,
      snp.gene || 'N/A',
      snp.chromosome,
      snp.position,
      snp.genotype,
      snp.category,
      snp.clinicalImpact,
    ]);
    
    const csv = [headers.join(','), ...rows.map((row: (string | number)[]) => row.map((cell: string | number) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snp-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }, [snps]);

  // Table columns configuration
  const columns = useMemo(() => [
    { 
      key: 'rsid', 
      header: (
        <button onClick={() => handleSort('rsid')} className="flex items-center gap-1">
          RSID <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      width: 120,
    },
    { 
      key: 'gene', 
      header: (
        <button onClick={() => handleSort('gene')} className="flex items-center gap-1">
          Gene <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      width: 100,
    },
    { 
      key: 'location', 
      header: 'Location',
      width: 150,
    },
    { key: 'genotype', header: 'Genotype', width: 100 },
    { 
      key: 'category', 
      header: (
        <button onClick={() => handleSort('category')} className="flex items-center gap-1">
          Category <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      width: 150,
    },
    { 
      key: 'impact', 
      header: (
        <button onClick={() => handleSort('impact')} className="flex items-center gap-1">
          Impact <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      width: 100,
    },
    { key: 'actions', header: 'Actions', width: 80 },
  ], [handleSort]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Dna className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">SNP Explorer (Optimized)</h1>
                <p className="text-slate-600 dark:text-slate-400">High-performance variant analysis with virtual scrolling</p>
              </div>
            </div>
            <Link
              to="/whats-new"
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors border border-amber-200 dark:border-amber-800"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Recent Updates</span>
            </Link>
          </div>
        </div>

        {/* Genome Selection */}
        <Card className="p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select Genome to Explore
          </label>
          <select
            value={selectedGenome}
            onChange={(e) => {
              setSelectedGenome(e.target.value);
              setPage(1);
            }}
            className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Choose a genome...</option>
            {genomesData?.genomes?.map((genome: any) => (
              <option key={genome.id} value={genome.id}>
                {genome.originalName} - {new Date(genome.uploadedAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </Card>

        {/* Filters */}
        {selectedGenome && (
          <Card className="p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by RSID, gene..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2"
              >
                <option value="all">All Categories</option>
                {categories.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Chromosome Filter */}
              <select
                value={selectedChromosome}
                onChange={(e) => {
                  setSelectedChromosome(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2"
              >
                <option value="all">All Chromosomes</option>
                {chromosomes.map((chr: string) => (
                  <option key={chr} value={chr}>Chr {chr}</option>
                ))}
              </select>

              {/* Impact Filter */}
              <select
                value={selectedImpact}
                onChange={(e) => {
                  setSelectedImpact(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2"
              >
                <option value="all">All Impacts</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
                <option value="protective">Protective</option>
              </select>

              {/* Favorites Toggle */}
              <button
                onClick={() => {
                  setShowFavoritesOnly(!showFavoritesOnly);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showFavoritesOnly
                    ? 'bg-amber-100 text-amber-700'
                    : 'border border-slate-300 text-slate-700'
                }`}
              >
                {showFavoritesOnly ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                Favorites
              </button>

              {/* Export */}
              <Button
                onClick={exportToCSV}
                disabled={!snps.length}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </Card>
        )}

        {/* Results */}
        {isLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-slate-600 dark:text-slate-400">Loading genetic data...</p>
          </Card>
        ) : selectedGenome && snps.length > 0 ? (
          <>
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {snps.length} of {totalItems.toLocaleString()} variants
                  {isFetching && <span className="ml-2 text-indigo-600">(updating...)</span>}
                </span>
              </div>

              {/* Virtual Table */}
              <div className="h-[600px]">
                <VirtualTable
                  items={snps}
                  columns={columns.map(col => ({
                    ...col,
                    render: (snp: SNPResult, index: number) => {
                      if (col.key === 'rsid') {
                        return (
                          <a
                            href={`https://www.ncbi.nlm.nih.gov/snp/${snp.rsid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            {snp.rsid}
                          </a>
                        );
                      }
                      if (col.key === 'gene') {
                        return <span className="font-mono text-sm">{snp.gene || 'N/A'}</span>;
                      }
                      if (col.key === 'location') {
                        return <span className="text-sm text-slate-600">Chr{snp.chromosome}:{snp.position}</span>;
                      }
                      if (col.key === 'genotype') {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 font-mono">
                            {snp.genotype}
                          </span>
                        );
                      }
                      if (col.key === 'category') {
                        return <CategoryBadge category={snp.category} />;
                      }
                      if (col.key === 'impact') {
                        return <ImpactBadge impact={snp.clinicalImpact} />;
                      }
                      if (col.key === 'actions') {
                        return (
                          <button
                            onClick={() => toggleFavorite(snp.rsid)}
                            className="p-2 rounded-lg hover:bg-slate-100"
                          >
                            <Bookmark className="w-4 h-4 text-slate-400" />
                          </button>
                        );
                      }
                      return null;
                    },
                  }))}
                  rowHeight={60}
                  keyExtractor={(snp, i) => `${snp.rsid}-${i}`}
                />
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm rounded-lg border border-slate-300 disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-slate-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-slate-600 px-4">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-slate-300 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-3 py-2 text-sm rounded-lg border border-slate-300 disabled:opacity-50"
                  >
                    Last
                  </button>
                </div>
              </div>
            </Card>
          </>
        ) : selectedGenome ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No variants found</h3>
            <p className="text-slate-600 dark:text-slate-400">Try adjusting your search or filters</p>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <Dna className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Select a genome to explore</h3>
            <p className="text-slate-600 dark:text-slate-400">Choose from your uploaded genetic data above</p>
          </Card>
        )}
      </main>
    </div>
  );
}
