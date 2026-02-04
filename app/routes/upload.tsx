import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Breadcrumb, predefinedBreadcrumbs } from '~/components/Breadcrumb';
import { UploadZone } from '~/components/UploadZone';
import { AnalysisProgress } from '~/components/AnalysisProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, FileText, Info } from 'lucide-react';
import type { DnaFileValidation } from '~/utils/genome/dna-validation';

export const Route = createFileRoute('/upload')({
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadedGenomeId, setUploadedGenomeId] = useState<string | null>(null);

  const handleUpload = async (file: File, validation: DnaFileValidation) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('validation', JSON.stringify(validation));

      const response = await fetch('/api/genomes', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || data.errors?.join(', ') || 'Upload failed');
      }

      setUploadedGenomeId(data.genomeId);

      // Start analysis
      setTimeout(() => {
        setAnalysisStage('parsing');
        startAnalysis(data.genomeId);
      }, 500);

    } catch (err) {
      setIsUploading(false);
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const startAnalysis = async (genomeId: string) => {
    const stages = [
      { key: 'querying', delay: 1500, progress: 30 },
      { key: 'analyzing', delay: 3000, progress: 60 },
      { key: 'generating', delay: 2500, progress: 90 },
    ];

    let currentProgress = 0;

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      setAnalysisStage(stage.key);
      currentProgress = stage.progress;
      setUploadProgress(currentProgress);
    }

    // Trigger analysis
    try {
      const response = await fetch(`/api/analyze/${genomeId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        setTimeout(() => {
          navigate({ to: `/report/${genomeId}` });
        }, 500);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err) {
      setIsUploading(false);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 pb-safe">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={predefinedBreadcrumbs.upload()} />
        </div>
        
        <div className="min-h-[calc(100vh-4rem)] py-6 sm:py-12">
          <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Upload Your Genome</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto px-2 sm:px-0">
            Upload your raw genetic data file from 23andMe, AncestryDNA, or other providers. 
            We support most major genotyping services.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isUploading ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <UploadZone
                onUpload={handleUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              {/* Info cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                <div className="glass-panel p-3 sm:p-4 flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-200 mb-0.5 sm:mb-1 text-sm sm:text-base">Supported Formats</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      23andMe (.txt), AncestryDNA (.txt), MyHeritage, and more.
                    </p>
                  </div>
                </div>

                <div className="glass-panel p-3 sm:p-4 flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-200 mb-0.5 sm:mb-1 text-sm sm:text-base">Privacy First</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Your data is stored locally and never shared with third parties.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to get your data */}
              <div className="glass-panel p-4 sm:p-6 mt-6 sm:mt-8">
                <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-3 sm:mb-4 text-sm sm:text-base">How to Get Your Raw DNA Data</h3>
                <div className="space-y-2 sm:space-y-4">
                  {[
                    { service: '23andMe', steps: 'Sign in → Browse Raw Data → Download' },
                    { service: 'AncestryDNA', steps: 'DNA → Settings → Download Raw DNA Data' },
                    { service: 'MyHeritage', steps: 'Manage DNA Kits → Download Raw Data' },
                  ].map((item) => (
                    <div key={item.service} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg gap-1 sm:gap-0">
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{item.service}</span>
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-500">{item.steps}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnalysisProgress
                stage={analysisStage}
                progress={uploadProgress}
                message={
                  analysisStage === 'parsing' ? 'Parsing your genome file...' :
                  analysisStage === 'querying' ? 'Querying ClinVar and PharmGKB databases...' :
                  analysisStage === 'analyzing' ? 'Analyzing genetic variants with AI...' :
                  analysisStage === 'generating' ? 'Generating your personalized report...' :
                  'Processing your genome...'
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
