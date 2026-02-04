import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ReportCard } from '~/components/ReportCard';
import { Breadcrumb, predefinedBreadcrumbs } from '~/components/Breadcrumb';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Share2,
  AlertCircle,
  Sparkles,
  Dna,
  Shield,
  Activity,
  Printer,
  Globe,
  Palette,
  Heart,
  ChevronRight,
  Users2
} from 'lucide-react';
import { analyzeGenomeComprehensive, generateQuickSummary } from '~/utils/comprehensiveAnalysis';
import { getGenome } from '~/utils/database';
// Lazy load PDF export to reduce initial bundle size
const loadPDFExport = () => import('~/utils/pdfExport').then(m => ({
  downloadPDF: m.downloadPDF,
  printToPDF: m.printToPDF,
}));
import type { GenomeData, HealthReport } from '~/types/genetics';
import { cn } from '~/utils/shared/cn';

export const Route = createFileRoute('/report/$id')({
  component: ReportPage,
});

function ReportPage() {
  const { id } = Route.useParams();
  const [genome, setGenome] = useState<GenomeData | null>(null);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'drugs' | 'protocol'>('all');

  // Mock data for related reports availability
  const [relatedReports] = useState({
    ancestry: { available: true, href: `/ancestry/${id}` },
    traits: { available: true, href: `/traits/${id}` },
    carrier: { available: false, href: `/carrier/${id}` },
    relatives: { available: false, href: `/relatives` },
  });

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

      // Run comprehensive analysis
      const result = await analyzeGenomeComprehensive(genomeData);
      setReport(result.report);
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
    const { printToPDF } = await loadPDFExport();
    printToPDF();
  };

  const handleDownloadPDF = async () => {
    if (!report || !genome) return;
    
    try {
      setIsLoading(true);
      const { downloadPDF } = await loadPDFExport();
      await downloadPDF(report, genome);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Try using Print instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genetic-report-${id}.json`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full mx-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Generating Your Report</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Analyzing your genetic variants against our comprehensive database...
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
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 pb-safe">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Report</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error || 'Report could not be generated'}</p>
            <Link
              to="/genomes"
              className="text-indigo-700 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              Back to Genomes
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Filter sections based on active tab
  const filteredSections = report.sections.filter(section => {
    if (activeTab === 'all') return true;
    if (activeTab === 'critical') return section.priority === 'critical' || section.priority === 'high';
    if (activeTab === 'drugs') return section.type === 'drug';
    if (activeTab === 'protocol') return section.type === 'protocol';
    return true;
  });

  const criticalCount = report.sections.filter(s => s.priority === 'critical' || s.priority === 'high').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={predefinedBreadcrumbs.report(genome?.filename)} />
        </div>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/genomes"
            className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-700 dark:text-slate-400 dark:hover:text-indigo-400 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Genomes
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Genetic Health Report</h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {genome?.filename} • Generated {new Date(report.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Related Reports Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Other Reports:</span>
            <div className="flex flex-wrap gap-2">
              <RelatedReportLink
                to={relatedReports.ancestry.href}
                icon={Globe}
                label="Ancestry"
                available={relatedReports.ancestry.available}
              />
              <RelatedReportLink
                to={relatedReports.traits.href}
                icon={Palette}
                label="Traits"
                available={relatedReports.traits.available}
              />
              <RelatedReportLink
                to={relatedReports.carrier.href}
                icon={Heart}
                label="Carrier Status"
                available={relatedReports.carrier.available}
              />
              <RelatedReportLink
                to={relatedReports.relatives.href}
                icon={Users2}
                label="DNA Relatives"
                available={relatedReports.relatives.available}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Overview - Mobile responsive grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <StatCard
            icon={Dna}
            label="Variants Analyzed"
            value={report.summary.totalVariants.toString()}
            color="indigo"
          />
          <StatCard
            icon={AlertCircle}
            label="High Impact"
            value={report.summary.highImpact.toString()}
            color="orange"
          />
          <StatCard
            icon={Shield}
            label="Risk Assessments"
            value={report.diseaseRisks.length.toString()}
            color="red"
          />
          <StatCard
            icon={Activity}
            label="Categories"
            value={Object.keys(report.summary.categories).length.toString()}
            color="green"
          />
        </motion.div>

        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 mb-6 sm:mb-8 text-white"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Executive Summary</h2>
              <p className="text-indigo-100 text-sm sm:text-lg leading-relaxed">
                {report.executiveSummary}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Links to Full Reports */}
        {(relatedReports.ancestry.available || relatedReports.traits.available) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid sm:grid-cols-2 gap-4 mb-8"
          >
            {relatedReports.ancestry.available && (
              <Link
                to={relatedReports.ancestry.href}
                className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">View Full Ancestry Report</h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">Explore your ethnic origins and genetic history</p>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            {relatedReports.traits.available && (
              <Link
                to={relatedReports.traits.href}
                className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-300">View Your Traits</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-400">Discover fun and unique genetic traits</p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>
        )}

        {/* Critical Alert */}
        {criticalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-900 dark:text-red-300 mb-1">
                  {criticalCount} Critical Finding{criticalCount > 1 ? 's' : ''} Detected
                </h3>
                <p className="text-red-700 dark:text-red-400">
                  Some variants may require medical attention. Please consult with a healthcare provider.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'all', label: 'All Sections', count: report.sections.length },
            { id: 'critical', label: 'Critical', count: criticalCount },
            { id: 'drugs', label: 'Drug Response', count: report.drugMetabolism?.length || 0 },
            { id: 'protocol', label: 'Protocol', count: 1 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.id ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Report Sections */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredSections.map((section, index) => (
            <ReportCard
              key={section.id}
              section={section}
              index={index}
            />
          ))}
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6"
        >
          <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Important Disclaimer
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-400">
            This report is for educational and informational purposes only. It is not intended to diagnose, 
            treat, or replace professional medical advice. Always consult with a qualified healthcare provider 
            before making any medical decisions. Genetic risk factors represent predispositions, not certainties, 
            and environmental and lifestyle factors play significant roles in health outcomes.
          </p>
        </motion.div>
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
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
    red: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  };

  return (
    <div className={`rounded-xl border-2 p-4 ${colors[color]}`}>
      <Icon className="w-6 h-6 mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

function RelatedReportLink({ 
  to, 
  icon: Icon, 
  label, 
  available 
}: { 
  to: string; 
  icon: any; 
  label: string; 
  available: boolean;
}) {
  if (!available) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 cursor-not-allowed">
        <Icon className="w-4 h-4" />
        {label}
        <span className="text-xs opacity-60">Soon</span>
      </span>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      <ChevronRight className="w-3 h-3" />
    </Link>
  );
}
