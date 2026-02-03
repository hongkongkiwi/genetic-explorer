/**
 * Carrier Status Card Component
 * 
 * Displays carrier status results for a genetic condition with
 * clear visual indicators, explanations, and recommendations.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dna, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  Heart,
  Baby,
  User,
  AlertTriangle,
  Stethoscope,
  FileText,
  Phone,
  Shield,
  Activity,
  Thermometer,
  Pill,
  Users,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import type { CarrierResult, CarrierStatus } from '~/types/carrier';
import { InheritancePattern } from '~/types/carrier';
import { Badge } from './ui/Badge';
import { Alert } from './ui/Alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';

interface CarrierStatusCardProps {
  result: CarrierResult;
  index?: number;
  showDetailed?: boolean;
}

const statusConfig: Record<CarrierStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof CheckCircle;
  description: string;
}> = {
  carrier: {
    label: 'Carrier',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: AlertCircle,
    description: 'You carry one copy of a pathogenic variant',
  },
  affected: {
    label: 'Affected',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
    description: 'You have two pathogenic variants - medical attention needed',
  },
  not_carrier: {
    label: 'Not a Carrier',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle,
    description: 'No pathogenic variants detected',
  },
  uncertain: {
    label: 'Uncertain',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Info,
    description: 'Results are inconclusive - further testing may be needed',
  },
  not_tested: {
    label: 'Not Tested',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    icon: Info,
    description: 'Required genetic markers not found in your data',
  },
};

const severityConfig = {
  critical: { 
    label: 'Critical', 
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertTriangle 
  },
  high: { 
    label: 'High', 
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: AlertCircle 
  },
  moderate: { 
    label: 'Moderate', 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Info 
  },
  low: { 
    label: 'Low', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Shield 
  },
};

const urgencyConfig = {
  immediate: { color: 'bg-red-500', label: 'Immediate Action Required' },
  high: { color: 'bg-orange-500', label: 'High Priority' },
  moderate: { color: 'bg-yellow-500', label: 'Moderate Priority' },
  low: { color: 'bg-blue-500', label: 'Low Priority' },
  none: { color: 'bg-slate-300', label: 'No Action Needed' },
};

const inheritanceLabels: Record<InheritancePattern, string> = {
  [InheritancePattern.AUTOSOMAL_RECESSIVE]: 'Autosomal Recessive',
  [InheritancePattern.AUTOSOMAL_DOMINANT]: 'Autosomal Dominant',
  [InheritancePattern.X_LINKED_RECESSIVE]: 'X-Linked Recessive',
  [InheritancePattern.X_LINKED_DOMINANT]: 'X-Linked Dominant',
  [InheritancePattern.Y_LINKED]: 'Y-Linked',
  [InheritancePattern.MITOCHONDRIAL]: 'Mitochondrial',
  [InheritancePattern.MULTIFACTORIAL]: 'Multifactorial',
};

export function CarrierStatusCard({ result, index = 0, showDetailed = false }: CarrierStatusCardProps) {
  const [isExpanded, setIsExpanded] = useState(showDetailed);
  const [showInheritanceInfo, setShowInheritanceInfo] = useState(false);
  
  const status = statusConfig[result.status];
  const StatusIcon = status.icon;
  const severity = severityConfig[result.condition.severity];
  const SeverityIcon = severity.icon;
  const urgency = urgencyConfig[result.urgency];
  
  const isHighRisk = result.status === 'affected' || 
                     result.condition.severity === 'critical' || 
                     result.counselingRecommended;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={cn(
        'overflow-hidden transition-all duration-200',
        isHighRisk ? 'ring-2 ring-red-200' : '',
        status.borderColor
      )}>
        {/* Header Section */}
        <CardHeader className={cn('pb-4', status.bgColor)}>
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <div className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
              status.bgColor,
              status.borderColor,
              'border-2'
            )}>
              <StatusIcon className={cn('w-7 h-7', status.color)} />
            </div>
            
            {/* Title and Badges */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CardTitle className="text-xl font-bold text-slate-900">
                  {result.condition.name}
                </CardTitle>
                
                {/* Status Badge */}
                <Badge 
                  variant={result.status === 'not_carrier' ? 'success' : 
                           result.status === 'carrier' ? 'warning' :
                           result.status === 'affected' ? 'error' : 'default'}
                  size="md"
                >
                  {status.label}
                </Badge>
                
                {/* Severity Badge */}
                <Badge 
                  variant={result.condition.severity === 'critical' ? 'error' :
                           result.condition.severity === 'high' ? 'warning' : 'info'}
                  size="sm"
                >
                  <SeverityIcon className="w-3 h-3 mr-1" />
                  {severity.label}
                </Badge>
              </div>
              
              {/* Gene and Category */}
              <CardDescription className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Dna className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">{result.condition.gene}</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">{result.condition.category}</span>
              </CardDescription>
            </div>
            
            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </button>
          </div>
          
          {/* Urgency Indicator */}
          {result.urgency !== 'none' && (
            <div className="mt-3 flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', urgency.color)} />
              <span className={cn('text-xs font-medium', status.color)}>
                {urgency.label}
              </span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-4">
          {/* Status Summary */}
          <p className={cn('text-sm font-medium mb-3', status.color)}>
            {status.description}
          </p>
          
          {/* Quick Info Row */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
            <button
              onClick={() => setShowInheritanceInfo(!showInheritanceInfo)}
              className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{inheritanceLabels[result.condition.inheritance]}</span>
              <Info className="w-3 h-3 text-slate-400" />
            </button>
            
            {result.variantsFound.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Dna className="w-4 h-4" />
                {result.variantsFound.length} variant{result.variantsFound.length > 1 ? 's' : ''} found
              </span>
            )}
            
            {result.condition.prenatalTestingAvailable && (
              <span className="flex items-center gap-1.5">
                <Baby className="w-4 h-4" />
                Prenatal testing available
              </span>
            )}
          </div>
          
          {/* Inheritance Explanation */}
          <AnimatePresence>
            {showInheritanceInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm">
                  <InheritanceExplanation pattern={result.condition.inheritance} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-slate-200 space-y-6">
                  
                  {/* Description */}
                  <section>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      About This Condition
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {result.condition.description}
                    </p>
                  </section>
                  
                  {/* Variants Found */}
                  {result.variantsFound.length > 0 && (
                    <section>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <Dna className="w-4 h-4 text-slate-500" />
                        Variants Detected
                      </h4>
                      <div className="space-y-2">
                        {result.variantsFound.map((variant, i) => (
                          <div 
                            key={i}
                            className="bg-slate-50 rounded-lg p-3 text-sm"
                          >
                            <div className="font-medium text-slate-900">{variant.name}</div>
                            {variant.rsid && (
                              <div className="text-slate-500 text-xs mt-0.5">
                                {variant.rsid}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* User's Genotypes */}
                      {result.userGenotypes.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                            Your Genotypes
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {result.userGenotypes.map((gt, i) => (
                              <code 
                                key={i}
                                className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700"
                              >
                                {gt.rsid}: {gt.genotype}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  )}
                  
                  {/* Explanation */}
                  <section>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-slate-500" />
                      What This Means For You
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {result.explanation}
                    </p>
                  </section>
                  
                  {/* Risk to Offspring */}
                  <section>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Baby className="w-4 h-4 text-slate-500" />
                      Family Planning Considerations
                    </h4>
                    <div className={cn(
                      'rounded-lg p-4 text-sm',
                      result.riskToOffspring === 'high' ? 'bg-red-50 text-red-800' :
                      result.riskToOffspring === 'depends_on_partner' ? 'bg-amber-50 text-amber-800' :
                      'bg-emerald-50 text-emerald-800'
                    )}>
                      <p className="font-medium mb-1">
                        Risk Level: {result.riskToOffspring.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="opacity-90">{result.riskExplanation}</p>
                    </div>
                  </section>
                  
                  {/* Symptoms */}
                  <section>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-slate-500" />
                      Symptoms & Effects
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.condition.symptoms.slice(0, 6).map((symptom, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </section>
                  
                  {/* Treatment Options */}
                  {result.condition.treatments.length > 0 && (
                    <section>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-slate-500" />
                        Treatment Options
                      </h4>
                      <ul className="space-y-1">
                        {result.condition.treatments.slice(0, 4).map((treatment, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            {treatment}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  
                  {/* Recommendations */}
                  <section>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-500" />
                      Recommended Actions
                    </h4>
                    <ul className="space-y-2">
                      {result.recommendations.slice(0, 5).map((rec, i) => (
                        <li 
                          key={i} 
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  
                  {/* Resources */}
                  {result.resources.length > 0 && (
                    <section>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                        Learn More
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.resources.slice(0, 3).map((resource, i) => (
                          <a
                            key={i}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                          >
                            {resource.title}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </section>
                  )}
                  
                  {/* Analysis Date */}
                  <p className="text-xs text-slate-400">
                    Analyzed: {result.analyzedAt.toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        {/* Footer with Counseling Prompt */}
        {result.counselingRecommended && (
          <CardFooter className="bg-red-50 border-t border-red-100">
            <div className="w-full">
              <Alert variant="destructive" className="mb-3">
                <div className="flex items-start gap-3">
                  <Stethoscope className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Genetic Counseling Recommended</p>
                    <p className="text-sm opacity-90 mt-1">
                      Due to the {result.condition.severity === 'critical' ? 'serious' : 'significant'} nature 
                      of {result.condition.name}, we strongly recommend speaking with a genetic counselor 
                      to understand your results and discuss your options.
                    </p>
                  </div>
                </div>
              </Alert>
              
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.nsgc.org/find-a-genetic-counselor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Find a Genetic Counselor
                </a>
                <a
                  href="https://www.genome.gov/about-genomics/fact-sheets/Genetic-Counseling-Fact-Sheet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Info className="w-4 h-4" />
                  Learn About Genetic Counseling
                </a>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

/**
 * Component to explain inheritance patterns
 */
function InheritanceExplanation({ pattern }: { pattern: InheritancePattern }) {
  const explanations: Record<InheritancePattern, { title: string; text: string }> = {
    [InheritancePattern.AUTOSOMAL_RECESSIVE]: {
      title: 'Autosomal Recessive Inheritance',
      text: 'Both parents must be carriers for a child to be affected. If both parents are carriers, there is a 25% chance with each pregnancy of having an affected child, 50% chance of a carrier child, and 25% chance of a non-carrier child.',
    },
    [InheritancePattern.AUTOSOMAL_DOMINANT]: {
      title: 'Autosomal Dominant Inheritance',
      text: 'Only one copy of the variant is needed to cause the condition. An affected parent has a 50% chance of passing the condition to each child. Males and females are equally affected.',
    },
    [InheritancePattern.X_LINKED_RECESSIVE]: {
      title: 'X-Linked Recessive Inheritance',
      text: 'The gene is on the X chromosome. Males have one X and are more commonly affected. Females with one variant are carriers. A carrier mother has a 50% chance of passing the variant to each child.',
    },
    [InheritancePattern.X_LINKED_DOMINANT]: {
      title: 'X-Linked Dominant Inheritance',
      text: 'The gene is on the X chromosome. Both males and females can be affected, though symptoms may differ. An affected parent has a 50% chance of passing the condition to each child.',
    },
    [InheritancePattern.Y_LINKED]: {
      title: 'Y-Linked Inheritance',
      text: 'The gene is on the Y chromosome. Only males are affected, and all sons of an affected father will inherit the condition.',
    },
    [InheritancePattern.MITOCHONDRIAL]: {
      title: 'Mitochondrial Inheritance',
      text: 'The genetic variant is in mitochondrial DNA. Only mothers can pass mitochondrial conditions to their children. All children of an affected mother will inherit the variant.',
    },
    [InheritancePattern.MULTIFACTORIAL]: {
      title: 'Multifactorial Inheritance',
      text: 'The condition results from a combination of genetic and environmental factors. The risk to family members is lower than single-gene disorders but higher than the general population.',
    },
  };
  
  const explanation = explanations[pattern];
  
  return (
    <div>
      <p className="font-medium text-slate-900 mb-1">{explanation.title}</p>
      <p className="text-slate-600">{explanation.text}</p>
    </div>
  );
}

/**
 * Summary card showing overall carrier status
 */
interface CarrierSummaryCardProps {
  totalConditions: number;
  carrierCount: number;
  affectedCount: number;
  counselingCount: number;
}

export function CarrierSummaryCard({
  totalConditions,
  carrierCount,
  affectedCount,
  counselingCount,
}: CarrierSummaryCardProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          Carrier Status Summary
        </CardTitle>
        <CardDescription>
          Overview of your genetic carrier screening results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{totalConditions}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">
              Conditions Tested
            </div>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-700">
              {totalConditions - carrierCount - affectedCount}
            </div>
            <div className="text-xs text-emerald-600 uppercase tracking-wide mt-1">
              Not a Carrier
            </div>
          </div>
          
          <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-2xl font-bold text-amber-700">{carrierCount}</div>
            <div className="text-xs text-amber-600 uppercase tracking-wide mt-1">
              Carrier
            </div>
          </div>
          
          {affectedCount > 0 && (
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{affectedCount}</div>
              <div className="text-xs text-red-600 uppercase tracking-wide mt-1">
                Affected
              </div>
            </div>
          )}
        </div>
        
        {counselingCount > 0 && (
          <Alert variant="warning" className="mt-4">
            <div className="flex items-start gap-3">
              <Stethoscope className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Genetic Counseling Recommended</p>
                <p className="text-sm opacity-90 mt-1">
                  {counselingCount} of your results recommend speaking with a genetic counselor. 
                  They can help you understand your results and discuss family planning options.
                </p>
              </div>
            </div>
          </Alert>
        )}
        
        {/* Medical Disclaimer */}
        <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
          <p className="font-medium text-slate-700 mb-1">Important Medical Disclaimer:</p>
          <p>
            This screening is for educational purposes only and is not a substitute for professional 
            medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider 
            or genetic counselor about your results. This analysis may not detect all disease-causing 
            variants. A negative result does not completely eliminate the risk of being a carrier.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default CarrierStatusCard;
