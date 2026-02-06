import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  FileText, 
  Shield, 
  ArrowRight, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ScrollText
} from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { DNALogo } from '~/components/DNALogo';

interface TermsSection {
  title: string;
  content: string;
}

interface TermsData {
  terms: {
    version: string;
    effectiveDate: string;
    sections: TermsSection[];
  };
  privacy: {
    version: string;
    effectiveDate: string;
    sections: TermsSection[];
  };
}

export const Route = createFileRoute('/accept-terms' as any)({
  component: AcceptTermsPage,
  head: () => ({
    meta: [
      { title: 'Accept Terms - Genetic Explorer' },
      { name: 'description', content: 'Please review and accept our Terms of Service and Privacy Policy to continue.' },
    ],
  }),
});

function AcceptTermsPage() {
  const navigate = useNavigate();
  const [termsData, setTermsData] = useState<TermsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check for pending user ID from login flow
    const searchParams = new URLSearchParams(window.location.search);
    const userId = searchParams.get('userId');
    if (userId) {
      setPendingUserId(userId);
    }

    // Fetch current terms
    fetch('/api/terms/current')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTermsData(data.data);
        } else {
          setError('Failed to load terms. Please try again.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load terms. Please try again.');
        setLoading(false);
      });
  }, []);

  const handleAccept = async () => {
    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Please accept both the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      const response = await fetch('/api/terms/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pendingUserId: pendingUserId || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // If we had a pending user ID, we need to complete the login
        if (pendingUserId) {
          // Redirect to login to complete the flow
          navigate({ to: '/login', search: { termsAccepted: 'true' } });
        } else {
          // User was already logged in, just needed to accept new terms
          navigate({ to: '/' });
        }
      } else {
        setError(data.error || 'Failed to accept terms. Please try again.');
        setAccepting(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setAccepting(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading terms...</p>
        </div>
      </div>
    );
  }

  const allAccepted = acceptedTerms && acceptedPrivacy;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <DNALogo size={64} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Terms of Service & Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We've updated our terms. Please review and accept to continue using Genetic Explorer.
          </p>
        </motion.div>

        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              Action Required
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              You must accept the updated Terms of Service and Privacy Policy before you can access your account.
            </p>
          </div>
        </motion.div>

        {/* Terms Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6"
        >
          <button
            onClick={() => toggleSection('terms')}
            className="w-full px-6 py-4 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ScrollText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <div className="text-left">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Terms of Service
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Version {termsData?.terms.version} • Effective {termsData?.terms.effectiveDate}
                </p>
              </div>
            </div>
            {expandedSection === 'terms' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {expandedSection === 'terms' && (
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                {termsData?.terms.sections.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {section.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                I have read and agree to the{' '}
                <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  Terms of Service
                </Link>
              </span>
            </label>
          </div>
        </motion.div>

        {/* Privacy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-8"
        >
          <button
            onClick={() => toggleSection('privacy')}
            className="w-full px-6 py-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <div className="text-left">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Privacy Policy
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Version {termsData?.privacy.version} • Effective {termsData?.privacy.effectiveDate}
                </p>
              </div>
            </div>
            {expandedSection === 'privacy' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {expandedSection === 'privacy' && (
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                {termsData?.privacy.sections.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {section.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                I have read and agree to the{' '}
                <Link to="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={handleAccept}
            disabled={!allAccepted || accepting}
            className="flex-1 flex items-center justify-center gap-2 py-4 text-lg"
          >
            {accepting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Accept and Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
          
          <Link
            to="/"
            className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium rounded-xl border border-slate-300 dark:border-slate-600 hover:border-slate-400 transition-colors"
          >
            Cancel and Return Home
          </Link>
        </motion.div>

        {/* Help Text */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          By accepting, you acknowledge that you have read and understood our terms. 
          You can review the full documents at any time from our{' '}
          <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Privacy Policy
          </Link>{' '}
          pages.
        </p>
      </div>
    </div>
  );
}
