// DNA Relatives Page
// Main page for discovering and managing DNA relative matches

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Dna,
  Shield,
  ShieldCheck,
  Search,
  Settings,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff,
  MessageCircle,
  User,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { useAuth } from '~/hooks/useAuth';
import { Button } from '~/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '~/components/ui/Card';
import { Alert } from '~/components/ui/Alert';
import { Badge } from '~/components/ui/Badge';
import { Input } from '~/components/ui/Input';
import { RelativeList } from '~/components/relatives/RelativeList';
import { RelativeDetailModal } from '~/components/relatives/RelativeDetailModal';
import { OptInPanel } from '~/components/relatives/OptInPanel';
import { RelationshipGuide } from '~/components/relatives/RelationshipGuide';
import { RelativeMatchCard } from '~/components/RelativeMatchCard';
import type {
  RelativeMatch,
  RelativeMatchingPrivacy,
  GenomeComparison,
  MatchListResponse,
} from '~/types/relatives';

export const Route = createFileRoute('/relatives')({
  component: RelativesPage,
});

// Anonymous name generator
const ADJECTIVES = [
  'Crimson', 'Azure', 'Emerald', 'Golden', 'Silver', 'Crystal', 'Silent', 'Gentle',
  'Bold', 'Swift', 'Bright', 'Calm', 'Wise', 'Noble', 'Brave', 'Kind',
  'Mystic', 'Radiant', 'Stellar', 'Cosmic', 'Lunar', 'Solar', 'Shadow', 'Light',
  'Ancient', 'Hidden', 'Sacred', 'Eternal', 'Vivid', 'Serene', 'Tranquil', 'Vibrant',
];

const NOUNS = [
  'Phoenix', 'Dragon', 'Wolf', 'Eagle', 'Dolphin', 'Falcon', 'Tiger', 'Owl',
  'Raven', 'Whale', 'Bear', 'Lion', 'Fox', 'Hawk', 'Stag', 'Raven',
  'Willow', 'Oak', 'Pine', 'Rose', 'Lily', 'Daisy', 'Jasmine', 'Ivy',
  'River', 'Ocean', 'Mountain', 'Forest', 'Meadow', 'Star', 'Comet', 'Nebula',
];

/**
 * Generate an anonymous display name
 */
function generateAnonymousName(userId: string): string {
  // Use userId to deterministically pick words
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const adjective = ADJECTIVES[Math.abs(hash) % ADJECTIVES.length];
  const noun = NOUNS[Math.abs(hash >> 8) % NOUNS.length];
  const number = Math.abs(hash >> 16) % 1000;
  return `${adjective}${noun}${number}`;
}

function RelativesPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // State
  const [matches, setMatches] = useState<RelativeMatch[]>([]);
  const [privacy, setPrivacy] = useState<RelativeMatchingPrivacy>({
    optIn: false,
    showAncestry: true,
    allowContact: true,
    showRealName: false,
    shareEthnicity: false,
    hiddenMatches: [],
    showSidePredictions: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<RelativeMatch | null>(null);
  const [comparison, setComparison] = useState<GenomeComparison | null>(null);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [anonymousName, setAnonymousName] = useState('');
  const [stats, setStats] = useState({
    totalMatches: 0,
    closeMatches: 0,
    distantMatches: 0,
    pendingContact: 0,
  });

  // Generate anonymous name when user is available
  useEffect(() => {
    if (user?.id) {
      setAnonymousName(generateAnonymousName(user.id));
    }
  }, [user?.id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load matches and privacy settings
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load privacy settings
      const privacyRes = await fetch('/api/relatives/privacy');
      if (privacyRes.ok) {
        const privacyData = await privacyRes.json();
        setPrivacy(privacyData);
      }

      // Load matches if opted in
      if (privacy.optIn !== false) {
        const matchesRes = await fetch('/api/relatives/matches');
        if (matchesRes.ok) {
          const data: MatchListResponse = await matchesRes.json();
          setMatches(data.matches);
          setStats(data.summary);
        }
      }
    } catch (err) {
      setError('Failed to load DNA relatives data');
      console.error('Error loading relatives data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleOptInChange = useCallback(async (optIn: boolean) => {
    try {
      const response = await fetch('/api/relatives/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...privacy, optIn }),
      });

      if (response.ok) {
        setPrivacy((p) => ({ ...p, optIn }));
        if (optIn) {
          loadData(); // Reload to get matches
        } else {
          setMatches([]);
        }
      } else {
        setError('Failed to update privacy settings');
      }
    } catch (err) {
      setError('Failed to update privacy settings');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privacy]);

  const handlePrivacyChange = useCallback(async (updates: Partial<RelativeMatchingPrivacy>) => {
    const newPrivacy = { ...privacy, ...updates };
    try {
      const response = await fetch('/api/relatives/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrivacy),
      });

      if (response.ok) {
        setPrivacy(newPrivacy);
      } else {
        setError('Failed to update privacy settings');
      }
    } catch (err) {
      setError('Failed to update privacy settings');
    }
  }, [privacy]);

  const handleSelectMatch = useCallback((match: RelativeMatch) => {
    setSelectedMatch(match);
    setComparison(null); // Reset comparison
  }, []);

  const handleCompare = useCallback(async (match: RelativeMatch) => {
    setIsComparisonLoading(true);
    setSelectedMatch(match);

    try {
      const response = await fetch(`/api/relatives/compare/${match.relativeId}`);
      if (response.ok) {
        const data = await response.json();
        setComparison(data);
      } else {
        setError('Failed to load comparison');
      }
    } catch (err) {
      setError('Failed to load comparison');
    } finally {
      setIsComparisonLoading(false);
    }
  }, []);

  const handleMessage = useCallback((match: RelativeMatch) => {
    // Open message modal or navigate to messages
    alert(`Messaging ${match.relativeName} - Feature coming soon!`);
  }, []);

  const handleHideMatch = useCallback(async (matchId: string) => {
    try {
      const response = await fetch(`/api/relatives/matches/${matchId}/hide`, {
        method: 'POST',
      });

      if (response.ok) {
        setMatches((prev) =>
          prev.map((m) =>
            m.relativeId === matchId ? { ...m, isHidden: true } : m
          )
        );
        setSelectedMatch(null);
      } else {
        setError('Failed to hide match');
      }
    } catch (err) {
      setError('Failed to hide match');
    }
  }, []);

  const handleToggleVisibility = useCallback(async (matchId: string, hidden: boolean) => {
    try {
      const endpoint = hidden ? 'hide' : 'unhide';
      const response = await fetch(`/api/relatives/matches/${matchId}/${endpoint}`, {
        method: 'POST',
      });

      if (response.ok) {
        setMatches((prev) =>
          prev.map((m) =>
            m.relativeId === matchId ? { ...m, isHidden: hidden } : m
          )
        );
      } else {
        setError('Failed to update match visibility');
      }
    } catch (err) {
      setError('Failed to update match visibility');
    }
  }, []);

  const handleRegenerateName = useCallback(() => {
    if (user?.id) {
      // Generate a new random name
      const randomSuffix = Math.floor(Math.random() * 10000);
      const newName = generateAnonymousName(user.id + randomSuffix);
      setAnonymousName(newName);
    }
  }, [user?.id]);

  // Get closest match
  const closestMatch = useMemo(() => {
    if (matches.length === 0) return null;
    return matches.reduce((closest, match) =>
      match.sharedDNA.centimorgans > closest.sharedDNA.centimorgans ? match : closest
    );
  }, [matches]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Dna className="w-8 h-8 text-indigo-600" />
            DNA Relatives
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Discover and connect with your genetic relatives
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowGuide(!showGuide)}
            className="gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            {showGuide ? 'Hide Guide' : 'How it Works'}
          </Button>
          <Button
            variant="outline"
            onClick={loadData}
            isLoading={isLoading}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </Alert>
      )}

      {/* Not Opted In State */}
      {!privacy.optIn && (
        <div className="mb-8">
          <OptInPanel
            privacy={privacy}
            onOptInChange={handleOptInChange}
            onPrivacyChange={handlePrivacyChange}
          />
        </div>
      )}

      {privacy.optIn && (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Total Matches"
              value={stats.totalMatches}
              description="All relatives found"
              color="indigo"
            />
            <StatCard
              icon={ShieldCheck}
              label="Close Family"
              value={stats.closeMatches}
              description=">{200 cM shared"
              color="emerald"
            />
            <StatCard
              icon={Users}
              label="Distant Cousins"
              value={stats.distantMatches}
              description="<50 cM shared"
              color="amber"
            />
            <StatCard
              icon={MessageCircle}
              label="Pending Contact"
              value={stats.pendingContact}
              description="Awaiting response"
              color="blue"
            />
          </div>

          {/* Anonymous Name Generator */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Your Anonymous Display Name
                    </p>
                    <p className="font-mono font-medium text-slate-900 dark:text-white">
                      {anonymousName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                    This is how matches will see you
                  </p>
                  <Button variant="outline" size="sm" onClick={handleRegenerateName}>
                    Generate New
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Match List */}
            <div className="lg:col-span-2">
              <Card className="h-[700px] flex flex-col">
                <RelativeList
                  matches={matches}
                  isLoading={isLoading}
                  onSelectMatch={handleSelectMatch}
                  onCompare={handleCompare}
                  onMessage={handleMessage}
                  onToggleVisibility={handleToggleVisibility}
                  selectedMatchId={selectedMatch?.relativeId}
                  virtualize={matches.length > 20}
                />
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Closest Match */}
              {closestMatch && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      Closest Match
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RelativeMatchCard
                      match={closestMatch}
                      onClick={handleSelectMatch}
                      onCompare={handleCompare}
                      onMessage={handleMessage}
                      compact
                    />
                  </CardContent>
                </Card>
              )}

              {/* Privacy Panel */}
              <OptInPanel
                privacy={privacy}
                onOptInChange={handleOptInChange}
                onPrivacyChange={handlePrivacyChange}
                compact
              />

              {/* Relationship Guide */}
              <AnimatePresence>
                {showGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <RelationshipGuide compact />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <RelativeDetailModal
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onMessage={handleMessage}
        onHide={handleHideMatch}
        onCompare={handleCompare}
        comparison={comparison}
        isComparisonLoading={isComparisonLoading}
      />

      {/* Educational Content (when opted out) */}
      {!privacy.optIn && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <RelationshipGuide />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                Privacy First
              </CardTitle>
              <CardDescription>
                Your genetic data is protected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PrivacyFeature
                icon={EyeOff}
                title="Anonymous by Default"
                description="Use an anonymous display name instead of your real name"
              />
              <PrivacyFeature
                icon={Shield}
                title="Double Opt-In"
                description="Both you and your match must opt in to see each other"
              />
              <PrivacyFeature
                icon={User}
                title="No Raw Data Sharing"
                description="Your DNA file is never shared - only matching statistics"
              />
              <PrivacyFeature
                icon={Settings}
                title="Granular Controls"
                description="Choose exactly what information to share with matches"
              />
              <PrivacyFeature
                icon={RefreshCw}
                title="Easy Opt-Out"
                description="Remove yourself from matching at any time"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({
  icon: Icon,
  label,
  value,
  description,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  description: string;
  color: 'indigo' | 'emerald' | 'amber' | 'blue';
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  };

  return (
    <Card className={cn('overflow-hidden', colors[color])}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs opacity-70">{description}</p>
          </div>
          <Icon className="w-10 h-10 opacity-20" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Privacy Feature Component
 */
function PrivacyFeature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

export default RelativesPage;
