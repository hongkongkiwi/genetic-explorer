import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import { ImpactBadge } from '../components/ImpactBadge'
import { CategoryBadge } from '../components/CategoryBadge'
import { SNPBadge } from '../components/SNPBadge'
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
  ArrowUpDown
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import type { SNPResult, AnalysisResult } from '../types/genetics'

interface SNPUpdate {
  rsid: string
  status: 'new' | 'research-updated' | 'evidence-upgraded' | 'recommendation-changed' | 'major-update'
  date: string
}

interface FavoriteSNP {
  rsid: string
  notes?: string
  addedAt: string
}

type SortField = 'rsid' | 'gene' | 'chromosome' | 'category' | 'impact'
type SortDirection = 'asc' | 'desc'

export const Route = createFileRoute('/explorer')({
  component: SNPExplorerPage,
})

const ITEMS_PER_PAGE = 50

function SNPExplorerPage() {
  const searchParams = useSearch({ from: '/explorer' }) as { rsid?: string; genome?: string }
  const [searchQuery, setSearchQuery] = useState(searchParams.rsid || '')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedImpact, setSelectedImpact] = useState<string>('all')
  const [selectedGenome, setSelectedGenome] = useState<string>(searchParams.genome || '')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('rsid')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedChromosome, setSelectedChromosome] = useState<string>('all')

  // Fetch SNP updates
  const { data: snpUpdates = {} } = useQuery<Record<string, SNPUpdate>>({
    queryKey: ['snp-updates'],
    queryFn: async () => {
      const response = await fetch('/api/research/snp-updates')
      if (!response.ok) throw new Error('Failed to fetch SNP updates')
      const data = await response.json()
      return data.updates || {}
    },
  })

  // Fetch favorites
  const { data: favoritesData = [] } = useQuery<FavoriteSNP[]>({
    queryKey: ['snp-favorites'],
    queryFn: async () => {
      const response = await fetch('/api/snp-favorites')
      if (!response.ok) throw new Error('Failed to fetch favorites')
      const data = await response.json()
      return data.favorites || []
    },
  })

  useEffect(() => {
    setFavorites(new Set(favoritesData.map(f => f.rsid)))
  }, [favoritesData])

  // Fetch all genomes for selection
  const { data: genomes = [] } = useQuery({
    queryKey: ['genomes'],
    queryFn: async () => {
      const response = await fetch('/api/genomes')
      if (!response.ok) throw new Error('Failed to fetch genomes')
      return response.json()
    },
  })

  // Fetch analysis for selected genome
  const { data: analysis, isLoading, error } = useQuery<AnalysisResult>({
    queryKey: ['analysis', selectedGenome],
    queryFn: async () => {
      const response = await fetch(`/api/analyze/${selectedGenome}`)
      if (!response.ok) throw new Error('Failed to fetch analysis')
      return response.json()
    },
    enabled: !!selectedGenome,
    retry: 2,
  })

  // Display error if analysis fails
  useEffect(() => {
    if (error) {
      console.error('Analysis error:', error)
    }
  }, [error])

  // Get unique chromosomes
  const chromosomes = useMemo(() => {
    if (!analysis?.snps) return []
    const unique = [...new Set(analysis.snps.map((snp: SNPResult) => snp.chromosome))]
    return unique.sort((a, b) => {
      // Sort numerically, with X, Y, MT at the end
      const numA = parseInt(a)
      const numB = parseInt(b)
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB
      if (!isNaN(numA)) return -1
      if (!isNaN(numB)) return 1
      return a.localeCompare(b)
    })
  }, [analysis])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedAndFilteredSNPs = useMemo(() => {
    if (!analysis?.snps) return []
    
    let filtered = analysis.snps.filter((snp: SNPResult) => {
      const matchesSearch = 
        searchQuery === '' ||
        snp.rsid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snp.gene?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snp.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = 
        selectedCategory === 'all' ||
        snp.category === selectedCategory
      
      const matchesImpact = 
        selectedImpact === 'all' ||
        snp.clinicalImpact === selectedImpact

      const matchesChromosome =
        selectedChromosome === 'all' ||
        snp.chromosome === selectedChromosome

      const matchesFavorites =
        !showFavoritesOnly ||
        favorites.has(snp.rsid)
      
      return matchesSearch && matchesCategory && matchesImpact && matchesChromosome && matchesFavorites
    })

    // Sort
    filtered.sort((a: SNPResult, b: SNPResult) => {
      let comparison = 0
      switch (sortField) {
        case 'rsid':
          comparison = a.rsid.localeCompare(b.rsid)
          break
        case 'gene':
          comparison = (a.gene || '').localeCompare(b.gene || '')
          break
        case 'chromosome':
          const chrA = parseInt(a.chromosome)
          const chrB = parseInt(b.chromosome)
          if (!isNaN(chrA) && !isNaN(chrB)) comparison = chrA - chrB
          else if (!isNaN(chrA)) comparison = -1
          else if (!isNaN(chrB)) comparison = 1
          else comparison = a.chromosome.localeCompare(b.chromosome)
          break
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '')
          break
        case 'impact':
          const impactOrder = { high: 0, moderate: 1, low: 2, protective: 3 }
          comparison = (impactOrder[a.clinicalImpact as keyof typeof impactOrder] || 99) - 
                       (impactOrder[b.clinicalImpact as keyof typeof impactOrder] || 99)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [analysis, searchQuery, selectedCategory, selectedImpact, selectedChromosome, showFavoritesOnly, favorites, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(sortedAndFilteredSNPs.length / ITEMS_PER_PAGE)
  const paginatedSNPs = sortedAndFilteredSNPs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const categories = useMemo(() => {
    if (!analysis?.snps) return []
    return [...new Set(analysis.snps.map((snp: SNPResult) => snp.category).filter(Boolean))]
  }, [analysis])

  const toggleFavorite = async (rsid: string) => {
    const isFavorite = favorites.has(rsid)
    
    try {
      const response = await fetch('/api/snp-favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsid }),
      })
      
      if (response.ok) {
        setFavorites(prev => {
          const next = new Set(prev)
          if (isFavorite) {
            next.delete(rsid)
          } else {
            next.add(rsid)
          }
          return next
        })
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const exportToCSV = () => {
    if (!sortedAndFilteredSNPs.length) return
    
    const headers = ['RSID', 'Gene', 'Chromosome', 'Position', 'Genotype', 'Category', 'Impact', 'Summary', 'Is Favorite']
    const rows = sortedAndFilteredSNPs.map((snp: SNPResult) => [
      snp.rsid,
      snp.gene || 'N/A',
      snp.chromosome,
      snp.position,
      snp.genotype,
      snp.category,
      snp.clinicalImpact,
      snp.summary || 'N/A',
      favorites.has(snp.rsid) ? 'Yes' : 'No',
    ])
    
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `snp-explorer-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const exportToPDF = () => {
    // Generate a printable HTML page
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SNP Explorer Export</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: 600; }
            .favorite { color: #f59e0b; }
          </style>
        </head>
        <body>
          <h1>SNP Explorer Export</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>Genome: ${genomes.find((g: any) => g.id === selectedGenome)?.originalName || selectedGenome}</p>
          <table>
            <thead>
              <tr>
                <th>RSID</th>
                <th>Gene</th>
                <th>Location</th>
                <th>Genotype</th>
                <th>Category</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              ${sortedAndFilteredSNPs.map((snp: SNPResult) => `
                <tr>
                  <td>${snp.rsid} ${favorites.has(snp.rsid) ? '★' : ''}</td>
                  <td>${snp.gene || 'N/A'}</td>
                  <td>Chr${snp.chromosome}:${snp.position}</td>
                  <td>${snp.genotype}</td>
                  <td>${snp.category}</td>
                  <td>${snp.clinicalImpact}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">SNP Explorer</h1>
                <p className="text-slate-600 dark:text-slate-400">Search, filter, and analyze your genetic variants</p>
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
              setSelectedGenome(e.target.value)
              setCurrentPage(1)
            }}
            className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Choose a genome...</option>
            {genomes.map((genome: any) => (
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
                <label htmlFor="snp-search" className="sr-only">Search SNPs</label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="snp-search"
                  type="text"
                  placeholder="Search by RSID, gene, or description..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-label="Search SNPs by RSID, gene, or description"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Chromosome Filter */}
              <select
                value={selectedChromosome}
                onChange={(e) => {
                  setSelectedChromosome(e.target.value)
                  setCurrentPage(1)
                }}
                className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  setSelectedImpact(e.target.value)
                  setCurrentPage(1)
                }}
                className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Impacts</option>
                <option value="high">High Impact</option>
                <option value="moderate">Moderate Impact</option>
                <option value="low">Low Impact</option>
                <option value="protective">Protective</option>
              </select>

              {/* Favorites Toggle */}
              <button
                onClick={() => {
                  setShowFavoritesOnly(!showFavoritesOnly)
                  setCurrentPage(1)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showFavoritesOnly
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {showFavoritesOnly ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span className="hidden sm:inline">{showFavoritesOnly ? 'Favorites' : 'All'}</span>
              </button>

              {/* Export */}
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  disabled={!sortedAndFilteredSNPs.length}
                  className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={!sortedAndFilteredSNPs.length}
                  className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </button>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedCategory !== 'all' || selectedImpact !== 'all' || selectedChromosome !== 'all' || searchQuery || showFavoritesOnly) && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
                {searchQuery && (
                  <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                    Search: {searchQuery}
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                    Category: {selectedCategory}
                  </span>
                )}
                {selectedChromosome !== 'all' && (
                  <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                    Chr {selectedChromosome}
                  </span>
                )}
                {selectedImpact !== 'all' && (
                  <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                    Impact: {selectedImpact}
                  </span>
                )}
                {showFavoritesOnly && (
                  <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                    Favorites Only
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setSelectedImpact('all')
                    setSelectedChromosome('all')
                    setShowFavoritesOnly(false)
                    setCurrentPage(1)
                  }}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}
          </Card>
        )}

        {/* Results */}
        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading genetic data...</p>
          </Card>
        ) : selectedGenome && sortedAndFilteredSNPs.length > 0 ? (
          <>
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap justify-between items-center gap-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {paginatedSNPs.length} of {sortedAndFilteredSNPs.length} variants
                  {favorites.size > 0 && ` • ${favorites.size} favorites`}
                </span>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-slate-600 dark:text-slate-400 px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort('rsid')}
                      >
                        <div className="flex items-center gap-1">
                          RSID
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort('gene')}
                      >
                        <div className="flex items-center gap-1">
                          Gene
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort('chromosome')}
                      >
                        <div className="flex items-center gap-1">
                          Location
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Genotype
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center gap-1">
                          Category
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort('impact')}
                      >
                        <div className="flex items-center gap-1">
                          Impact
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Updates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    {paginatedSNPs.map((snp: SNPResult) => (
                      <tr key={snp.rsid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
                          {snpUpdates[snp.rsid] && (
                            <SNPBadge status={snpUpdates[snp.rsid].status} size="sm" />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleFavorite(snp.rsid)}
                            className={`p-2 rounded-lg transition-colors ${
                              favorites.has(snp.rsid)
                                ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title={favorites.has(snp.rsid) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {favorites.has(snp.rsid) ? (
                              <BookmarkCheck className="w-5 h-5" />
                            ) : (
                              <Bookmark className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Bottom Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </Card>

            {/* Favorites Summary */}
            {favorites.size > 0 && (
              <Card className="mt-6 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-5 h-5 text-amber-500" />
                    <span className="font-medium text-slate-900 dark:text-white">
                      {favorites.size} Favorite SNP{favorites.size !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowFavoritesOnly(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Show favorites only
                  </button>
                </div>
              </Card>
            )}
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
            <p className="text-slate-600 dark:text-slate-400 mb-4">Choose from your uploaded genetic data above</p>
            <Link to="/upload">
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload a Genome
              </Button>
            </Link>
          </Card>
        )}
      </main>
    </div>
  )
}
