import { motion } from 'framer-motion';
import { DNALogo } from './DNALogo';

interface AnalysisProgressProps {
  stage: string;
  progress: number;
  message: string;
}

const stages = [
  { key: 'parsing', label: 'Parsing Genome' },
  { key: 'querying', label: 'Querying Databases' },
  { key: 'analyzing', label: 'Analyzing Variants' },
  { key: 'generating', label: 'Generating Report' },
];

export function AnalysisProgress({ stage, progress, message }: AnalysisProgressProps) {
  const currentStageIndex = stages.findIndex(s => stage.includes(s.key));

  return (
    <div className="glass-panel p-8 max-w-md mx-auto">
      <div className="flex flex-col items-center gap-6">
        <DNALogo size={60} animate />
        
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-200 mb-2">Analyzing Your Genome</h3>
          <p className="text-slate-400 text-sm">{message}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-dna-primary via-dna-secondary to-dna-accent animate-shimmer"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-center text-dna-primary font-medium mt-2">{progress}%</p>
        </div>

        {/* Stage indicators */}
        <div className="flex items-center gap-2 w-full">
          {stages.map((s, index) => (
            <div key={s.key} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  index <= currentStageIndex
                    ? 'bg-dna-primary'
                    : 'bg-slate-700'
                }`}
                animate={index === currentStageIndex ? {
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1],
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className={`text-xs ${
                index <= currentStageIndex ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
