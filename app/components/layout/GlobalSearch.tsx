import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Dna, 
  FileText, 
  Users, 
  BookOpen,
  ArrowRight,
  Command,
  Loader2
} from 'lucide-react';
import { cn } from '~/utils/shared/cn';

interface SearchResult {
  id: string;
  type: 'genome' | 'snp' | 'report' | 'research' | 'user';
  title: string;
  subtitle?: string;
  href: string;
  icon?: any;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search API call
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
    setIsLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            navigate({ to: results[selectedIndex].href });
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'genome': return Dna;
      case 'snp': return Search;
      case 'report': return FileText;
      case 'research': return BookOpen;
      case 'user': return Users;
      default: return ArrowRight;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'genome': return 'Genome';
      case 'snp': return 'SNP';
      case 'report': return 'Report';
      case 'research': return 'Research';
      case 'user': return 'User';
      default: return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-32 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search genomes, SNPs, reports..."
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-lg"
            aria-label="Search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-autocomplete="list"
            aria-controls="search-results"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600">
              ESC
            </kbd>
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div 
          id="search-results"
          role="listbox"
          className="max-h-96 overflow-y-auto"
        >
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
              {query ? (
                <>
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No results found for "{query}"</p>
                </>
              ) : (
                <>
                  <Command className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-2">Start typing to search</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <SearchShortcut label="Genomes" shortcut="Ctrl+G" />
                    <SearchShortcut label="Reports" shortcut="Ctrl+R" />
                    <SearchShortcut label="Explorer" shortcut="Ctrl+E" />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = getIcon(result.type);
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={result.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      navigate({ to: result.href });
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-4 px-4 py-3 text-left transition-colors',
                      isSelected 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected 
                        ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white truncate">
                          {result.title}
                        </span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          isSelected
                            ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        )}>
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border">↑↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border">↵</kbd>
              to select
            </span>
          </div>
          <span>{results.length} results</span>
        </div>
      </motion.div>
    </div>
  );
}

function SearchShortcut({ label, shortcut }: { label: string; shortcut: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
      {label}
      <kbd className="font-mono text-slate-500">{shortcut}</kbd>
    </span>
  );
}

// Hook for global search shortcut
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
}
