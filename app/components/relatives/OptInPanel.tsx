// Opt-In Panel Component
// Privacy-focused component for DNA matching opt-in

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Users,
  Lock,
  Eye,
  EyeOff,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '~/components/ui/Card';
import type { RelativeMatchingPrivacy } from '~/types/relatives';

interface OptInPanelProps {
  /** Current privacy settings */
  privacy: RelativeMatchingPrivacy;
  /** Callback when opt-in status changes */
  onOptInChange: (optIn: boolean) => void;
  /** Callback when privacy settings change */
  onPrivacyChange: (privacy: Partial<RelativeMatchingPrivacy>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether the panel is in a compact mode */
  compact?: boolean;
}

/**
 * Opt-In Panel
 *
 * Privacy-focused component that:
 * - Explains DNA matching benefits and risks
 * - Provides clear opt-in/opt-out toggle
 * - Shows what data is shared
 * - Explains privacy protections
 * - Allows granular privacy controls
 */
export function OptInPanel({
  privacy,
  onOptInChange,
  onPrivacyChange,
  className,
  compact = false,
}: OptInPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleOptIn = async () => {
    setIsConfirming(true);
    try {
      await onOptInChange(true);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOptOut = async () => {
    if (confirm('Are you sure you want to opt out? You will no longer see DNA matches or be visible to others.')) {
      await onOptInChange(false);
    }
  };

  if (compact) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              privacy.optIn
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            )}>
              {privacy.optIn ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 dark:text-white">
                DNA Matching {privacy.optIn ? 'Enabled' : 'Disabled'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {privacy.optIn
                  ? 'You can see matches and matches can see you'
                  : 'Opt in to discover genetic relatives'}
              </p>
            </div>
            <Button
              variant={privacy.optIn ? 'outline' : 'default'}
              size="sm"
              onClick={privacy.optIn ? handleOptOut : handleOptIn}
              isLoading={isConfirming}
            >
              {privacy.optIn ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            privacy.optIn
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          )}>
            {privacy.optIn ? <ShieldCheck className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">DNA Relative Matching</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {privacy.optIn
                ? 'You are opted in to DNA matching. You can see your genetic relatives and they can see you.'
                : 'Opt in to discover genetic relatives who share DNA with you.'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Enable DNA Matching</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Find and connect with genetic relatives
              </p>
            </div>
          </div>
          <button
            onClick={privacy.optIn ? handleOptOut : handleOptIn}
            disabled={isConfirming}
            className={cn(
              'relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
              privacy.optIn ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            )}
            aria-pressed={privacy.optIn}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center',
                privacy.optIn && 'translate-x-7'
              )}
            >
              {privacy.optIn ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="w-2 h-2 bg-slate-400 rounded-full" />
              )}
            </span>
          </button>
        </div>

        {/* Privacy Controls */}
        <AnimatePresence>
          {privacy.optIn && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Privacy Settings
                </h4>

                <div className="space-y-3">
                  <PrivacyToggle
                    label="Show Ancestry Regions"
                    description="Share your ethnicity estimate with matches"
                    checked={privacy.showAncestry}
                    onChange={(checked) => onPrivacyChange({ showAncestry: checked })}
                    icon={Eye}
                  />
                  <PrivacyToggle
                    label="Allow Contact"
                    description="Let matches send you messages"
                    checked={privacy.allowContact}
                    onChange={(checked) => onPrivacyChange({ allowContact: checked })}
                    icon={privacy.allowContact ? Users : Lock}
                  />
                  <PrivacyToggle
                    label="Show Real Name"
                    description="Display your name instead of an anonymous ID"
                    checked={privacy.showRealName}
                    onChange={(checked) => onPrivacyChange({ showRealName: checked })}
                    icon={privacy.showRealName ? Eye : EyeOff}
                  />
                  <PrivacyToggle
                    label="Share Ethnicity Estimate"
                    description="Show detailed ethnicity breakdown to matches"
                    checked={privacy.shareEthnicity}
                    onChange={(checked) => onPrivacyChange({ shareEthnicity: checked })}
                    icon={Info}
                  />
                  <PrivacyToggle
                    label="Show Side Predictions"
                    description="Show maternal/paternal side predictions"
                    checked={privacy.showSidePredictions}
                    onChange={(checked) => onPrivacyChange({ showSidePredictions: checked })}
                    icon={Users}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expandable Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showDetails ? 'Hide details' : 'How it works & what\'s shared'}
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-white mb-2">What You Get</h5>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Discover relatives you didn't know about</li>
                    <li>Visualize shared DNA segments</li>
                    <li>Learn about your genetic connections</li>
                    <li>Build your family tree with DNA evidence</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-slate-900 dark:text-white mb-2">What Data Is Shared</h5>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Your display name or anonymous ID</li>
                    <li>Shared DNA amount and segments</li>
                    <li>Optional: ancestry regions, ethnicity estimate</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-slate-900 dark:text-white mb-2">Privacy Protections</h5>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Your raw DNA data is never shared</li>
                    <li>You control what information is visible</li>
                    <li>You can hide or block any match at any time</li>
                    <li>Opt out anytime to remove yourself from matching</li>
                    <li>All matches are double opt-in</li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs">
                    By opting in, you agree to our{' '}
                    <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>{' '}
                    and{' '}
                    <a href="/terms" className="text-indigo-600 hover:underline">Terms of Service</a>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {privacy.optIn && (
        <CardFooter className="bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleOptOut}
          >
            Opt Out of DNA Matching
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Individual privacy toggle
 */
interface PrivacyToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ComponentType<{ className?: string }>;
}

function PrivacyToggle({ label, description, checked, onChange, icon: Icon }: PrivacyToggleProps) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={cn(
        'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
        checked
          ? 'bg-indigo-500 border-indigo-500'
          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
      )}>
        {checked && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <Icon className={cn(
        'w-5 h-5 flex-shrink-0',
        checked ? 'text-indigo-500' : 'text-slate-400'
      )} />
    </label>
  );
}

export default OptInPanel;
