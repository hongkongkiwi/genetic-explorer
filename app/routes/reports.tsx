import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '~/components/Navbar';
import { FileText, Clock, AlertCircle, Dna, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Report {
  id: string;
  genome_id: string;
  generated_at: string;
}

export const Route = createFileRoute('/reports')({
  component: ReportsPage,
});

function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analysis Reports</h1>
          <p className="text-slate-600">
            View all your generated genetic analysis reports.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Reports Yet</h3>
            <p className="text-slate-600 mb-6">Upload a genome and run analysis to generate your first report.</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all"
            >
              <Dna className="w-5 h-5" />
              Upload Genome
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/report/${report.genome_id}`}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all block group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Genetic Analysis Report</h3>
                        <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(report.generated_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
