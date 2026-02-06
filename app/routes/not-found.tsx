/**
 * 404 Not Found Page
 * 
 * Displayed when a user navigates to a non-existent route
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { FileQuestion, Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '~/components/ui/Button';

export const Route = createFileRoute('/not-found' as any)({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <FileQuestion className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
          </div>
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-2 -right-2 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center"
          >
            <span className="text-2xl">🔍</span>
          </motion.div>
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-bold text-slate-200 dark:text-slate-800 mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you may have entered the wrong URL.
        </p>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <Button variant="secondary" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Suggested Links */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Looking for something else?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link 
              to="/dashboard" 
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-slate-300">•</span>
            <Link 
              to="/reports" 
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Reports
            </Link>
            <span className="text-slate-300">•</span>
            <Link 
              to="/upload" 
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Upload
            </Link>
            <span className="text-slate-300">•</span>
            <Link 
              to="/settings" 
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8">
          <Link 
            to="/explorer" 
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search for genetic variants
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
