import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Search, 
  FileText, 
  Users, 
  Sparkles,
  CheckCircle,
  Dna
} from 'lucide-react';
import { Button } from './ui/Button';
import { Link } from '@tanstack/react-router';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action?: {
    label: string;
    href: string;
  };
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Genetic Explorer',
    description: 'Your personal genetic analysis platform. Upload your DNA data to unlock personalized health insights powered by AI.',
    icon: Sparkles,
  },
  {
    id: 'upload',
    title: 'Upload Your Genome',
    description: 'Start by uploading your raw genetic data from 23andMe, AncestryDNA, or other providers. We support compressed files too!',
    icon: Upload,
    action: { label: 'Upload Now', href: '/upload' },
  },
  {
    id: 'explore',
    title: 'Explore Your Variants',
    description: 'Use our SNP Explorer to search through your genetic variants. Filter by category, impact, and bookmark important SNPs.',
    icon: Search,
    action: { label: 'Explore', href: '/explorer' },
  },
  {
    id: 'reports',
    title: 'Get Your Reports',
    description: 'Generate comprehensive health reports including disease risks, drug metabolism, and personalized recommendations.',
    icon: FileText,
    action: { label: 'View Reports', href: '/reports' },
  },
  {
    id: 'share',
    title: 'Share with Family',
    description: 'Securely share your genetic profiles with family members and healthcare providers with granular permissions.',
    icon: Users,
    action: { label: 'Manage Sharing', href: '/sharing' },
  },
];

const STORAGE_KEY = 'genetic-explorer-onboarding-completed';

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasGenome, setHasGenome] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setIsOpen(true);
    }

    // Check if user has genomes
    fetch('/api/genomes')
      .then(res => res.json())
      .then(data => {
        setHasGenome(data.genomes?.length > 0);
      })
      .catch((error) => {
        // Silently ignore - user might not be authenticated
        if (process.env.NODE_ENV === 'development') {
          console.debug('Failed to check genomes:', error);
        }
      });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const Icon = currentStepData.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
          aria-label="Close onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-700">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {currentStepData.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {currentStepData.description}
              </p>

              {currentStepData.action && (
                <Link to={currentStepData.action.href} onClick={handleClose}>
                  <Button size="lg" className="gap-2">
                    {currentStepData.action.label}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-indigo-600'
                    : index < currentStep
                    ? 'bg-indigo-300'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleSkip}
              className="text-sm text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious} className="gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button onClick={handleNext} className="gap-1">
                {currentStep === ONBOARDING_STEPS.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Progress checklist for the dashboard
export function OnboardingChecklist() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Load completed steps from localStorage
    const saved = localStorage.getItem('genetic-explorer-checklist');
    if (saved) {
      setCompleted(JSON.parse(saved));
    }
  }, []);

  const toggleItem = (id: string) => {
    const newCompleted = completed.includes(id)
      ? completed.filter(c => c !== id)
      : [...completed, id];
    setCompleted(newCompleted);
    localStorage.setItem('genetic-explorer-checklist', JSON.stringify(newCompleted));
  };

  const checklistItems = [
    { id: 'upload', label: 'Upload your first genome', icon: Upload, href: '/upload' },
    { id: 'explore', label: 'Explore your SNPs', icon: Search, href: '/explorer' },
    { id: 'report', label: 'Generate a report', icon: FileText, href: '/reports' },
    { id: 'favorite', label: 'Bookmark a SNP', icon: Dna, href: '/explorer' },
    { id: 'share', label: 'Share with family', icon: Users, href: '/sharing' },
  ];

  const progress = Math.round((completed.length / checklistItems.length) * 100);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Getting Started
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Complete these steps to get the most out of Genetic Explorer
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          aria-label="Dismiss checklist"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-600 dark:text-slate-400">{progress}% complete</span>
          <span className="text-indigo-700 dark:text-indigo-400 font-medium">
            {completed.length}/{checklistItems.length}
          </span>
        </div>
        <div className="h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {checklistItems.map((item) => {
          const isCompleted = completed.includes(item.id);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isCompleted
                  ? 'bg-white/50 dark:bg-slate-800/50'
                  : 'bg-white dark:bg-slate-800 hover:shadow-md'
              }`}
              onClick={(e) => {
                e.preventDefault();
                toggleItem(item.id);
                // Navigate after a short delay
                setTimeout(() => {
                  window.location.href = item.href;
                }, 200);
              }}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                }`}
              >
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`flex-1 ${
                  isCompleted
                    ? 'text-slate-600 dark:text-slate-400 line-through'
                    : 'text-slate-900 dark:text-slate-200'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
