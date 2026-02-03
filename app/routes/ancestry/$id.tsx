/**
 * Ancestry Report Page
 * 
 * Comprehensive ancestry analysis report showing:
 * - Ethnicity composition charts
 * - Detailed population breakdowns
 * - Chromosome painting visualization
 * - Y-DNA and mtDNA haplogroup information
 * - Migration paths
 * - Neanderthal ancestry
 * - Population-specific health insights
 * - Share and export functionality
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Globe, 
  Download, 
  Share2,
  AlertCircle,
  Sparkles,
  Dna,
  User,
  Printer,
  FileText,
  History,
  Activity,
  Shield,
  Users,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Navbar } from '~/components/Navbar';
import { EthnicityChart, EthnicityChartCompact } from '~/components/ancestry/EthnicityChart';
import { ChromosomePainting, ChromosomePaintingCompact } from '~/components/ancestry/ChromosomePainting';
import { HaplogroupCard, HaplogroupCardCompact } from '~/components/ancestry/HaplogroupCard';
import { AncestrySummary, AncestrySummarySkeleton } from '~/components/ancestry/AncestrySummary';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/Card';
import { getGenome } from '~/utils/database';
import { generatePDF, printToPDF } from '~/utils/pdfExport';
import { cn } from '~/lib/utils';
import type { 
  AncestryReport, 
  AncestryResult, 
  PopulationEstimate,
  AncestryHealthInsight,
  AncestrySegment,
} from '~/types/ancestry';
import type { GenomeData } from '~/types/genetics';

// Mock analysis function - replace with actual implementation
async function analyzeAncestry(genome: GenomeData): Promise<AncestryReport> {
  // This is a mock implementation - replace with actual ancestry analysis
  const mockPopulations: PopulationEstimate[] = [
    {
      population: 'European',
      percentage: 62.5,
      confidence: 'high',
      region: 'Northwestern Europe',
      subPopulations: [
        { name: 'British & Irish', percentage: 28.3, region: 'British Isles', description: 'United Kingdom and Ireland' },
        { name: 'French & German', percentage: 18.7, region: 'Western Europe', description: 'France, Germany, Netherlands' },
        { name: 'Scandinavian', percentage: 10.2, region: 'Northern Europe', description: 'Norway, Sweden, Denmark' },
        { name: 'Broadly Northwestern European', percentage: 5.3, region: 'Western Europe', description: 'General Northwestern European ancestry' },
      ],
    },
    {
      population: 'East Asian',
      percentage: 24.8,
      confidence: 'high',
      region: 'East Asia',
      subPopulations: [
        { name: 'Chinese', percentage: 18.5, region: 'China', description: 'Han Chinese ancestry' },
        { name: 'Mongolian', percentage: 4.2, region: 'Mongolia', description: 'Mongolian ancestry' },
        { name: 'Broadly East Asian', percentage: 2.1, region: 'East Asia', description: 'General East Asian ancestry' },
      ],
    },
    {
      population: 'Native American',
      percentage: 8.2,
      confidence: 'medium',
      region: 'North America',
      subPopulations: [
        { name: 'Andean', percentage: 5.1, region: 'South America', description: 'Andean region ancestry' },
        { name: 'Broadly Native American', percentage: 3.1, region: 'Americas', description: 'General Native American ancestry' },
      ],
    },
    {
      population: 'African',
      percentage: 3.8,
      confidence: 'low',
      region: 'West Africa',
      subPopulations: [
        { name: 'West African', percentage: 3.8, region: 'West Africa', description: 'General West African ancestry' },
      ],
    },
    {
      population: 'Middle Eastern',
      percentage: 0.7,
      confidence: 'very_low',
      region: 'Middle East',
    },
  ];

  const mockSegments: AncestrySegment[] = [];
  const chromosomes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 
                       '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y'];
  
  for (const chrom of chromosomes) {
    const length = chrom === 'X' ? 155270560 : chrom === 'Y' ? 59373566 : 250000000;
    let position = 0;
    let segmentCount = 0;
    
    while (position < length && segmentCount < 20) {
      const segmentLength = Math.floor(Math.random() * 20000000) + 5000000;
      const population = mockPopulations[Math.floor(Math.random() * Math.min(3, mockPopulations.length))];
      
      mockSegments.push({
        chromosome: chrom,
        start: position,
        end: Math.min(position + segmentLength, length),
        population: population.population,
        confidence: Math.random() * 0.4 + 0.6,
        snpCount: Math.floor(Math.random() * 500) + 100,
      });
      
      position += segmentLength;
      segmentCount++;
    }
  }

  const ancestryResult: AncestryResult = {
    ethnicity: mockPopulations,
    yHaplogroup: {
      haplogroup: 'R1b1a2',
      name: 'R-M269',
      description: 'R-M269 is the most common Y-chromosome haplogroup in Western Europe, particularly prevalent in the British Isles, France, and the Iberian Peninsula. It originated around 4,000-8,000 years ago during the Bronze Age, likely associated with the expansion of Indo-European languages and the Bell Beaker culture.',
      origin: 'Western Eurasia',
      timeDepth: '~4,000-8,000 years ago',
      migrationPath: 'Western Eurasia → Pontic Steppe → Central Europe → Western Europe → British Isles',
      definingSnps: ['M269', 'L23', 'L11', 'P312', 'L21', 'M222'],
      confidence: 'high',
      subclade: 'R-L21 > R-M222',
      notableMembers: ['King Louis XVI of France', 'Napoleon Bonaparte', 'Numerous Irish clan chiefs'],
    },
    mtHaplogroup: {
      haplogroup: 'H1',
      name: 'Haplogroup H1',
      description: 'H1 is a subclade of haplogroup H, the most common mitochondrial DNA haplogroup in Europe. It originated around 9,000-11,000 years ago, likely in the Iberian Peninsula following the Last Glacial Maximum. It is particularly common in Western Europe and North Africa.',
      origin: 'Iberian Peninsula',
      timeDepth: '~9,000-11,000 years ago',
      migrationPath: 'Iberian Peninsula → Western Europe → British Isles → North America',
      definingVariants: ['7028C', '3010A', '16519C', 'H1-specific markers'],
      confidence: 'high',
      subclade: 'H1c',
      distribution: 'Most common in Western Europe, especially Portugal, Spain, and the British Isles. Also found in North Africa and the Americas due to migration.',
    },
    confidence: 0.87,
    snpsAnalyzed: 642831,
    analyzedAt: new Date(),
    version: '1.0.0',
  };

  const healthInsights: AncestryHealthInsight[] = [
    {
      category: 'Metabolism',
      title: 'Lactase Persistence',
      description: 'Your European ancestry suggests a high likelihood of lactase persistence into adulthood, allowing you to digest dairy products.',
      relatedPopulations: ['European'],
      riskLevel: 'protective',
    },
    {
      category: 'Skin Health',
      title: 'Vitamin D Synthesis',
      description: 'Higher latitude European ancestry may require more sun exposure for adequate vitamin D synthesis.',
      relatedPopulations: ['European'],
      recommendations: ['Consider vitamin D supplementation', 'Regular sunlight exposure'],
    },
    {
      category: 'Drug Response',
      title: 'Warfarin Sensitivity',
      description: 'East Asian ancestry may be associated with increased sensitivity to warfarin anticoagulation therapy.',
      relatedPopulations: ['East Asian'],
      riskLevel: 'moderate',
      recommendations: ['Discuss with healthcare provider before anticoagulant therapy', 'Genetic testing for CYP2C9 and VKORC1 variants'],
    },
    {
      category: 'Cardiovascular',
      title: 'Hypertension Risk',
      description: 'East Asian ancestry shows different patterns of hypertension risk and response to ACE inhibitors.',
      relatedPopulations: ['East Asian'],
      recommendations: ['Regular blood pressure monitoring', 'Discuss optimal antihypertensive medications'],
    },
  ];

  return {
    id: 'ancestry-' + Date.now(),
    genomeId: genome.id,
    generatedAt: new Date(),
    ancestry: ancestryResult,
    chromosomePainting: mockSegments,
    neanderthalAncestry: {
      percentage: 2.1,
      variantCount: 342,
      comparisonToAverage: 'higher',
      notableVariants: ['rs3917862', 'rs10962689', 'rs1691'],
    },
    healthInsights,
    recentAncestorLocations: [
      { location: 'London, UK', country: 'United Kingdom', confidence: 'high', timeframe: 'Within last 200 years', matchStrength: 0.92 },
      { location: 'County Cork, Ireland', country: 'Ireland', confidence: 'high', timeframe: 'Within last 300 years', matchStrength: 0.87 },
      { location: 'Guangdong Province', country: 'China', confidence: 'medium', timeframe: 'Within last 150 years', matchStrength: 0.74 },
    ],
    populationMatches: [
      { population: 'British', region: 'United Kingdom', geneticDistance: 0.05, similarity: 0.95, sampleSize: 5000 },
      { population: 'Irish', region: 'Ireland', geneticDistance: 0.08, similarity: 0.92, sampleSize: 3000 },
      { population: 'Han Chinese', region: 'China', geneticDistance: 0.18, similarity: 0.82, sampleSize: 8000 },
      { population: 'Peruvian', region: 'South America', geneticDistance: 0.25, similarity: 0.75, sampleSize: 1500 },
    ],
  };
}

export const Route = createFileRoute('/ancestry/$id')({
  component: AncestryReportPage,
});

function AncestryReportPage() {
  const { id } = Route.useParams();
  const [genome, setGenome] = useState<GenomeData | null>(null);
  const [report, setReport] = useState<AncestryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'chromosomes' | 'health'>('overview');

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      
      // Get genome data
      const genomeData = getGenome(id);
      if (!genomeData) {
        setError('Genome not found');
        return;
      }
      
      setGenome(genomeData);

      // Run ancestry analysis
      const result = await analyzeAncestry(genomeData);
      setReport(result);
    } catch (err) {
      console.error('Ancestry report generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate ancestry report');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    printToPDF();
  };

  const handleDownloadPDF = async () => {
    if (!report || !genome) return;
    
    try {
      // Generate HTML for PDF
      const htmlBlob = await generateAncestryPDF(report, genome);
      const url = URL.createObjectURL(htmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ancestry-report-${genome.filename.replace(/\.[^/.]+$/, '')}.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert('HTML report downloaded. Open in browser and print to PDF for best results.');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Try using Print instead.');
    }
  };

  const handleShare = async () => {
    if (!report) return;
    
    const shareText = `My Ancestry Report: ${report.ancestry.ethnicity[0]?.population} (${report.ancestry.ethnicity[0]?.percentage.toFixed(1)}%), ${report.ancestry.ethnicity[1]?.population} (${report.ancestry.ethnicity[1]?.percentage.toFixed(1)}%)\n\nY-DNA: ${report.ancestry.yHaplogroup?.haplogroup}\nmtDNA: ${report.ancestry.mtHaplogroup.haplogroup}\n\nAnalyzed with Genetic Explorer`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Ancestry Report',
          text: shareText,
        });
      } catch {
        // User cancelled
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      alert('Summary copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Analyzing Your Ancestry
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Processing ancestry-informative markers and comparing against reference populations...
              This may take 30-60 seconds.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Error Loading Report
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error || 'Ancestry report could not be generated'}
            </p>
            <Link
              to="/genomes"
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium"
            >
              Back to Genomes
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { ancestry, chromosomePainting, neanderthalAncestry, healthInsights, populationMatches } = report;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/genomes"
            className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Genomes
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Ancestry Report
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {genome?.filename} • Generated {new Date(report.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: Globe },
            { id: 'detailed', label: 'Detailed Breakdown', icon: FileText },
            { id: 'chromosomes', label: 'Chromosomes', icon: Dna },
            { id: 'health', label: 'Health Insights', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary */}
            <AncestrySummary ancestry={ancestry} variant="full" />

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Ethnicity Chart */}
              <EthnicityChart 
                populations={ancestry.ethnicity} 
                variant="donut"
                showSubPopulations
              />

              {/* Haplogroups */}
              <div className="space-y-4">
                {ancestry.yHaplogroup && (
                  <HaplogroupCardCompact
                    type="y-dna"
                    haplogroup={ancestry.yHaplogroup}
                  />
                )}
                <HaplogroupCardCompact
                  type="mtdna"
                  haplogroup={ancestry.mtHaplogroup}
                />
              </div>
            </div>

            {/* Neanderthal Ancestry */}
            {neanderthalAncestry && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-600" />
                    Ancient Ancestry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                        {neanderthalAncestry.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                        Neanderthal Ancestry
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        You have {neanderthalAncestry.percentage.toFixed(1)}% Neanderthal DNA, 
                        which is {neanderthalAncestry.comparisonToAverage} than average. 
                        This represents {neanderthalAncestry.variantCount} Neanderthal variants in your genome.
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Notable variants:</span>
                        {neanderthalAncestry.notableVariants?.map((v) => (
                          <code 
                            key={v}
                            className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400"
                          >
                            {v}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="space-y-8">
            {/* Full Ethnicity Chart */}
            <EthnicityChart 
              populations={ancestry.ethnicity}
              variant="donut"
              showConfidence
              showSubPopulations
            />

            {/* Population Matches */}
            {populationMatches && populationMatches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Reference Population Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {populationMatches.map((match, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">{match.population}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{match.region}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {(match.similarity * 100).toFixed(0)}%
                          </div>
                          <p className="text-xs text-slate-500">similarity</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Haplogroup Cards */}
            <div className="space-y-6">
              {ancestry.yHaplogroup && (
                <HaplogroupCard
                  type="y-dna"
                  haplogroup={ancestry.yHaplogroup}
                />
              )}
              <HaplogroupCard
                type="mtdna"
                haplogroup={ancestry.mtHaplogroup}
              />
            </div>
          </div>
        )}

        {activeTab === 'chromosomes' && chromosomePainting && (
          <div className="space-y-6">
            <ChromosomePainting
              segments={chromosomePainting}
              showChromosomeLabels
              allowZoom
            />
          </div>
        )}

        {activeTab === 'health' && healthInsights && (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  These insights are based on population-level associations and should not be considered 
                  medical advice. Always consult with a healthcare provider for personalized recommendations.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {healthInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'rounded-xl border-2 p-6',
                    insight.riskLevel === 'high' ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800' :
                    insight.riskLevel === 'moderate' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800' :
                    insight.riskLevel === 'protective' ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' :
                    'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          {insight.category}
                        </span>
                        {insight.riskLevel && (
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                            insight.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                            insight.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            insight.riskLevel === 'protective' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          )}>
                            {insight.riskLevel}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {insight.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {insight.description}
                      </p>
                      {insight.recommendations && insight.recommendations.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Recommendations:
                          </p>
                          <ul className="space-y-1">
                            {insight.recommendations.map((rec, i) => (
                              <li 
                                key={i}
                                className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"
                              >
                                <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-6"
        >
          <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Important Disclaimer
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            This ancestry report is for educational and informational purposes only. Ancestry estimates 
            are based on statistical models and reference populations, and results may vary between 
            different testing companies. Haplogroup assignments are probabilistic and depend on the 
            quality and completeness of your genetic data. For detailed genealogical research, 
            consider consulting with professional genetic genealogists.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

/**
 * Generate PDF HTML for ancestry report
 */
function generateAncestryPDF(report: AncestryReport, genome: GenomeData): Blob {
  const generatedDate = new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { margin: 40px; size: A4; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 30px; border-bottom: 3px solid #10b981; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 8px; }
        .title { font-size: 32px; font-weight: bold; color: #1e293b; margin: 0; }
        .subtitle { color: #64748b; margin-top: 8px; }
        .section { margin: 30px 0; }
        .section-title { font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
        .population-item { padding: 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 12px; }
        .population-name { font-weight: bold; color: #1e293b; }
        .population-percentage { font-size: 24px; color: #10b981; font-weight: bold; }
        .haplogroup-section { background: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .haplogroup-title { font-size: 18px; font-weight: bold; color: #047857; margin-bottom: 8px; }
        .disclaimer { background: #fef3c7; border: 2px solid #fbbf24; padding: 20px; border-radius: 12px; margin-top: 40px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🧬 Genetic Explorer</div>
        <h1 class="title">Ancestry Report</h1>
        <p class="subtitle">${genome.filename} • Generated ${generatedDate}</p>
      </div>

      <div class="section">
        <h2 class="section-title">Ethnicity Estimate</h2>
        ${report.ancestry.ethnicity.map(pop => `
          <div class="population-item">
            <div class="flex justify-between items-center">
              <span class="population-name">${pop.population}</span>
              <span class="population-percentage">${pop.percentage.toFixed(1)}%</span>
            </div>
            ${pop.region ? `<p style="color: #64748b; margin: 4px 0;">Region: ${pop.region}</p>` : ''}
          </div>
        `).join('')}
      </div>

      ${report.ancestry.yHaplogroup ? `
        <div class="haplogroup-section">
          <div class="haplogroup-title">Y-DNA Haplogroup: ${report.ancestry.yHaplogroup.haplogroup}</div>
          <p><strong>Origin:</strong> ${report.ancestry.yHaplogroup.origin}</p>
          <p><strong>Time Depth:</strong> ${report.ancestry.yHaplogroup.timeDepth}</p>
          <p>${report.ancestry.yHaplogroup.description}</p>
        </div>
      ` : ''}

      <div class="haplogroup-section" style="border-color: #ec4899; background: #fdf2f8;">
        <div class="haplogroup-title" style="color: #be185d;">mtDNA Haplogroup: ${report.ancestry.mtHaplogroup.haplogroup}</div>
        <p><strong>Origin:</strong> ${report.ancestry.mtHaplogroup.origin}</p>
        <p><strong>Time Depth:</strong> ${report.ancestry.mtHaplogroup.timeDepth}</p>
        <p>${report.ancestry.mtHaplogroup.description}</p>
      </div>

      ${report.neanderthalAncestry ? `
        <div class="section">
          <h2 class="section-title">Neanderthal Ancestry</h2>
          <p style="font-size: 24px; color: #d97706; font-weight: bold;">${report.neanderthalAncestry.percentage.toFixed(1)}%</p>
          <p>You have ${report.neanderthalAncestry.variantCount} Neanderthal variants in your genome, 
             which is ${report.neanderthalAncestry.comparisonToAverage} than average.</p>
        </div>
      ` : ''}

      <div class="disclaimer">
        <h3>Important Disclaimer</h3>
        <p>This ancestry report is for educational and informational purposes only. Ancestry estimates 
        are based on statistical models and reference populations, and results may vary between 
        different testing companies. For detailed genealogical research, consider consulting with 
        professional genetic genealogists.</p>
      </div>

      <div class="footer">
        <p>Generated by Genetic Explorer • ${generatedDate}</p>
        <p style="margin-top: 8px;">This report contains sensitive genetic information. Keep it secure.</p>
      </div>
    </body>
    </html>
  `;

  return new Blob([html], { type: 'text/html' });
}

export default AncestryReportPage;
