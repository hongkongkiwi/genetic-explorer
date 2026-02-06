// Relationship Guide Component
// Educational component explaining DNA relationships

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Info,
  Dna,
  ChevronDown,
  ChevronUp,
  Target,
  User,
  Heart,
  Share2,
  HelpCircle,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import type { RelationshipRange, RelationshipType } from '~/types/relatives';

interface RelationshipGuideProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show in compact mode */
  compact?: boolean;
}

// Relationship data with ranges and descriptions
const relationshipData: RelationshipRange[] = [
  {
    type: 'identical_twin',
    displayName: 'Identical Twin',
    description: 'Genetically identical - 100% DNA shared',
    cMRange: { min: 3300, max: 3700, average: 3400 },
    percentageRange: { min: 99.9, max: 100 },
    possibleAlternatives: [],
  },
  {
    type: 'parent_child',
    displayName: 'Parent/Child',
    description: 'Direct parent-child relationship - 50% DNA shared',
    cMRange: { min: 3300, max: 3700, average: 3500 },
    percentageRange: { min: 49, max: 51 },
    possibleAlternatives: [],
  },
  {
    type: 'full_sibling',
    displayName: 'Full Sibling',
    description: 'Share both parents - average 50% DNA shared',
    cMRange: { min: 2300, max: 2900, average: 2600 },
    percentageRange: { min: 38, max: 61 },
    possibleAlternatives: ['Half Sibling (rare)'],
  },
  {
    type: 'grandparent',
    displayName: 'Grandparent/Grandchild',
    description: 'Share 25% DNA on average',
    cMRange: { min: 1300, max: 2300, average: 1750 },
    percentageRange: { min: 17, max: 34 },
    possibleAlternatives: ['Aunt/Uncle', 'Half Sibling'],
  },
  {
    type: 'half_sibling',
    displayName: 'Half Sibling',
    description: 'Share one parent - average 25% DNA shared',
    cMRange: { min: 1300, max: 2300, average: 1750 },
    percentageRange: { min: 17, max: 34 },
    possibleAlternatives: ['Aunt/Uncle', 'Grandparent/Grandchild'],
  },
  {
    type: 'aunt_uncle',
    displayName: 'Aunt/Uncle/Niece/Nephew',
    description: "Parent's sibling or sibling's child - 25% shared",
    cMRange: { min: 1300, max: 2300, average: 1750 },
    percentageRange: { min: 17, max: 34 },
    possibleAlternatives: ['Half Sibling', 'Grandparent'],
  },
  {
    type: 'first_cousin',
    displayName: 'First Cousin',
    description: 'Share grandparents - average 12.5% DNA shared',
    cMRange: { min: 575, max: 1330, average: 880 },
    percentageRange: { min: 7.3, max: 16.6 },
    possibleAlternatives: ['Great-Aunt/Uncle', 'Half Aunt/Uncle'],
  },
  {
    type: 'first_cousin_once_removed',
    displayName: 'First Cousin Once Removed',
    description: 'First cousin of your parent, or child of your first cousin',
    cMRange: { min: 220, max: 680, average: 450 },
    percentageRange: { min: 3.3, max: 8.5 },
    possibleAlternatives: ['Half First Cousin'],
  },
  {
    type: 'second_cousin',
    displayName: 'Second Cousin',
    description: 'Share great-grandparents - average 3.125% DNA shared',
    cMRange: { min: 180, max: 640, average: 230 },
    percentageRange: { min: 2.2, max: 8.5 },
    possibleAlternatives: ['First Cousin Twice Removed'],
  },
  {
    type: 'second_cousin_once_removed',
    displayName: 'Second Cousin Once Removed',
    description: 'Child of second cousin or second cousin of parent',
    cMRange: { min: 60, max: 250, average: 130 },
    percentageRange: { min: 0.6, max: 3.3 },
    possibleAlternatives: ['Half Second Cousin'],
  },
  {
    type: 'third_cousin',
    displayName: 'Third Cousin',
    description: 'Share great-great-grandparents - ~0.781% DNA shared',
    cMRange: { min: 30, max: 120, average: 74 },
    percentageRange: { min: 0.3, max: 1.5 },
    possibleAlternatives: ['Second Cousin Twice Removed'],
  },
  {
    type: 'distant_cousin',
    displayName: 'Distant Cousin',
    description: 'Share distant ancestors - less than 0.5% DNA shared',
    cMRange: { min: 6, max: 50, average: 25 },
    percentageRange: { min: 0.05, max: 0.7 },
    possibleAlternatives: ['Third Cousin Once Removed', 'Fourth Cousin'],
  },
];

/**
 * Relationship Guide
 *
 * Educational component that explains:
 * - Different relationship types
 * - Expected DNA sharing ranges
 * - Visual family tree examples
 * - How to interpret match results
 */
export function RelationshipGuide({ className, compact = false }: RelationshipGuideProps) {
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipType | null>(null);
  const [showFamilyTree, setShowFamilyTree] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('ranges');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (compact) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 dark:text-white">Relationship Guide</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Learn how DNA connections work
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {relationshipData.slice(0, 3).map((rel) => (
              <div
                key={rel.type}
                className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                  {rel.displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ~{((rel.percentageRange.min + rel.percentageRange.max) / 2).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Understanding DNA Relationships</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Learn how shared DNA percentages indicate relationships
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatBox
            icon={Dna}
            label="Closest Match"
            value="50%"
            description="Parent/Child"
          />
          <StatBox
            icon={Share2}
            label="Siblings"
            value="~50%"
            description="Average sharing"
          />
          <StatBox
            icon={Target}
            label="Distant"
            value="<1%"
            description="3rd+ cousins"
          />
        </div>

        {/* Relationship Ranges */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('ranges')}
            className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Dna className="w-5 h-5 text-indigo-500" />
              <span className="font-medium text-slate-900 dark:text-white">
                Shared DNA Ranges
              </span>
            </div>
            {expandedSection === 'ranges' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSection === 'ranges' && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {relationshipData.map((rel) => (
                    <RelationshipRow
                      key={rel.type}
                      relationship={rel}
                      isSelected={selectedRelationship === rel.type}
                      onClick={() => setSelectedRelationship(
                        selectedRelationship === rel.type ? null : rel.type
                      )}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Family Tree Visualization */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('familyTree')}
            className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span className="font-medium text-slate-900 dark:text-white">
                Example Family Tree
              </span>
            </div>
            {expandedSection === 'familyTree' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSection === 'familyTree' && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4">
                  <SimpleFamilyTree />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* How It Works */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('howItWorks')}
            className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <span className="font-medium text-slate-900 dark:text-white">
                How DNA Matching Works
              </span>
            </div>
            {expandedSection === 'howItWorks' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSection === 'howItWorks' && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    DNA matching works by comparing segments of your genome with other users.
                    When you share a continuous stretch of DNA with someone, it's called an
                    IBD (Identity by Descent) segment - meaning you inherited it from a
                    common ancestor.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard
                      icon={Target}
                      title="IBD Segments"
                      description="Shared DNA segments inherited from a common ancestor"
                    />
                    <InfoCard
                      icon={Share2}
                      title="Centimorgans (cM)"
                      description="Unit measuring genetic linkage - higher = closer relationship"
                    />
                    <InfoCard
                      icon={Heart}
                      title="Confidence Levels"
                      description="Based on amount of shared DNA and segment quality"
                    />
                    <InfoCard
                      icon={Info}
                      title="Predictions"
                      description="Statistical estimates based on population averages"
                    />
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    <p className="text-amber-800 dark:text-amber-200">
                      <strong>Note:</strong> DNA percentages are averages. Actual sharing can
                      vary due to random inheritance. Some relationships may have overlapping
                      ranges, making them harder to distinguish without additional information.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Relationship row component
 */
interface RelationshipRowProps {
  relationship: RelationshipRange;
  isSelected: boolean;
  onClick: () => void;
}

function RelationshipRow({ relationship, isSelected, onClick }: RelationshipRowProps) {
  const maxCM = 3700; // Maximum for scaling
  const barWidth = (relationship.cMRange.max / maxCM) * 100;
  const barLeft = (relationship.cMRange.min / maxCM) * 100;

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg cursor-pointer transition-all',
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-medium text-slate-900 dark:text-white">
            {relationship.displayName}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {relationship.description}
          </p>
        </div>
        <Badge variant="primary" size="sm">
          ~{((relationship.percentageRange.min + relationship.percentageRange.max) / 2).toFixed(1)}%
        </Badge>
      </div>

      {/* Visual bar showing range */}
      <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-indigo-500 rounded-full"
          style={{
            left: `${barLeft}%`,
            width: `${Math.max(barWidth - barLeft, 2)}%`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
        <span>{relationship.cMRange.min} cM</span>
        <span>Avg: {relationship.cMRange.average} cM</span>
        <span>{relationship.cMRange.max} cM</span>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isSelected && relationship.possibleAlternatives.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Could also be:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {relationship.possibleAlternatives.map((alt, i) => (
                  <Badge key={i} variant="default" size="sm">
                    {alt}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Simple family tree visualization
 */
function SimpleFamilyTree() {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Grandparents */}
      <div className="flex gap-8">
        <PersonNode label="Grandparent" shared="25%" />
        <PersonNode label="Grandparent" shared="25%" />
        <div className="w-20" />
        <PersonNode label="Grandparent" shared="25%" />
        <PersonNode label="Grandparent" shared="25%" />
      </div>

      {/* Parents */}
      <div className="flex gap-16">
        <PersonNode label="Parent" shared="50%" variant="primary" />
        <PersonNode label="Parent" shared="50%" variant="primary" />
      </div>

      {/* You */}
      <PersonNode label="You" shared="100%" variant="highlight" />

      {/* Siblings */}
      <div className="flex gap-8">
        <PersonNode label="Full Sibling" shared="~50%" />
        <PersonNode label="Full Sibling" shared="~50%" />
      </div>

      {/* Children */}
      <div className="flex gap-8">
        <PersonNode label="Child" shared="50%" variant="secondary" />
        <PersonNode label="Child" shared="50%" variant="secondary" />
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span>Primary</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Secondary</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>Other</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Person node for family tree
 */
interface PersonNodeProps {
  label: string;
  shared: string;
  variant?: 'default' | 'primary' | 'secondary' | 'highlight';
}

function PersonNode({ label, shared, variant = 'default' }: PersonNodeProps) {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    primary: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    secondary: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    highlight: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400',
  };

  return (
    <div className={cn(
      'px-4 py-2 rounded-lg text-center min-w-[100px]',
      variants[variant]
    )}>
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs opacity-75">{shared}</p>
    </div>
  );
}

/**
 * Stat box component
 */
function StatBox({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <Icon className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

/**
 * Info card component
 */
function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <Icon className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

export default RelationshipGuide;
