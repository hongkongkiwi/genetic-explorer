/**
 * Genetic Counseling CTA Component
 * 
 * Displays a prominent call-to-action when genetic counseling is recommended
 * based on carrier screening results. Includes educational content and
 * resources for finding qualified genetic counselors.
 */

import { motion } from 'framer-motion';
import {
  Stethoscope,
  AlertTriangle,
  Phone,
  ExternalLink,
  Info,
  Users,
  Heart,
  Calendar,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import type { CarrierResult } from '~/types/carrier';

interface GeneticCounselingCTAProps {
  results: CarrierResult[];
  variant?: 'full' | 'compact' | 'inline';
}

export function GeneticCounselingCTA({ results, variant = 'full' }: GeneticCounselingCTAProps) {
  // Filter results that recommend counseling
  const counselingResults = results.filter(r => r.counselingRecommended);
  
  if (counselingResults.length === 0) {
    return null;
  }

  // Count by severity
  const criticalCount = counselingResults.filter(
    r => r.condition.severity === 'critical' || r.status === 'affected'
  ).length;

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-50 border border-red-200 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">
              Genetic Counseling Recommended
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {counselingResults.length} result{counselingResults.length > 1 ? 's' : ''} suggest 
              speaking with a genetic counselor.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <a
                href="https://www.nsgc.org/find-a-genetic-counselor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Find a Counselor
              </a>
              <a
                href="https://www.genome.gov/about-genomics/fact-sheets/Genetic-Counseling-Fact-Sheet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                Learn More
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">
          <strong>Genetic counseling recommended</strong> for {counselingResults.length} condition
          {counselingResults.length > 1 ? 's' : ''}.
        </span>
        <a
          href="https://www.nsgc.org/find-a-genetic-counselor"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium underline hover:no-underline ml-auto whitespace-nowrap"
        >
          Find a counselor
        </a>
      </div>
    );
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-2 border-red-200 overflow-hidden">
        {/* Warning Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Genetic Counseling Recommended
              </h2>
              <p className="text-red-100 mt-1">
                {criticalCount > 0 
                  ? `${criticalCount} critical finding(s) require professional medical guidance.`
                  : `${counselingResults.length} result(s) suggest consultation with a genetic counselor.`}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* What is Genetic Counseling */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500" />
              What is Genetic Counseling?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Genetic counseling is a process where trained professionals help you understand 
              your genetic test results, assess your risks, and make informed decisions about 
              your health and family planning. Counselors provide personalized guidance based 
              on your specific results and family history.
            </p>
          </div>

          {/* Conditions Requiring Counseling */}
          {counselingResults.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-slate-500" />
                Results Requiring Discussion
              </h3>
              <div className="space-y-2">
                {counselingResults.slice(0, 5).map((result, index) => (
                  <div 
                    key={result.condition.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{result.condition.name}</p>
                      <p className="text-xs text-slate-500">{result.condition.gene}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      result.status === 'affected' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {result.status === 'affected' ? 'Affected' : 'Carrier'}
                    </span>
                  </div>
                ))}
                {counselingResults.length > 5 && (
                  <p className="text-sm text-slate-500 text-center">
                    +{counselingResults.length - 5} more conditions
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">Family Planning</p>
                <p className="text-xs text-slate-600">
                  Understand reproductive risks and testing options
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">Early Detection</p>
                <p className="text-xs text-slate-600">
                  Learn about screening and prevention strategies
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">Personalized Care</p>
                <p className="text-xs text-slate-600">
                  Get tailored recommendations for your situation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">Local Resources</p>
                <p className="text-xs text-slate-600">
                  Connect with specialists in your area
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
            <a
              href="https://www.nsgc.org/find-a-genetic-counselor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="destructive" fullWidth size="lg">
                <Phone className="w-4 h-4 mr-2" />
                Find a Genetic Counselor
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </a>
            <a
              href="https://www.genome.gov/about-genomics/fact-sheets/Genetic-Counseling-Fact-Sheet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" fullWidth size="lg">
                <Info className="w-4 h-4 mr-2" />
                Learn About Genetic Counseling
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>

          {/* Insurance Note */}
          <div className="bg-slate-50 rounded-lg p-4 text-sm">
            <p className="text-slate-600">
              <strong>Insurance Coverage:</strong> Many health insurance plans cover genetic 
              counseling, especially when recommended by a physician. Contact your insurance 
              provider to verify coverage. Some genetic counselors also offer sliding scale 
              fees for uninsured patients.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Inline counseling notice for specific conditions
 */
interface ConditionCounselingNoticeProps {
  conditionName: string;
  reason?: string;
}

export function ConditionCounselingNotice({ conditionName, reason }: ConditionCounselingNoticeProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
      <Stethoscope className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-amber-900">
          Genetic Counseling Recommended for {conditionName}
        </p>
        {reason && (
          <p className="text-xs text-amber-700 mt-1">{reason}</p>
        )}
        <a
          href="https://www.nsgc.org/find-a-genetic-counselor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900 mt-2 underline"
        >
          Find a genetic counselor
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export default GeneticCounselingCTA;
