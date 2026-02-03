/**
 * Carrier Report Summary Component
 * 
 * Displays a comprehensive summary of carrier screening results
 * with statistics, risk distribution, and action items.
 */

import { motion } from 'framer-motion';
import {
  Dna,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  Users,
  Activity,
  Shield,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/Card';
import { Alert } from '~/components/ui/Alert';
import { Badge } from '~/components/ui/Badge';
import type { CarrierReport, CarrierResult } from '~/types/carrier';

interface CarrierReportSummaryProps {
  report: CarrierReport;
  onFilterByStatus?: (status: string) => void;
}

export function CarrierReportSummary({ report, onFilterByStatus }: CarrierReportSummaryProps) {
  const { summary } = report;
  
  const stats = [
    {
      label: 'Conditions Tested',
      value: summary.totalConditionsTested,
      icon: Dna,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      hoverColor: 'hover:bg-slate-200',
    },
    {
      label: 'Not a Carrier',
      value: summary.notCarrierCount,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      hoverColor: 'hover:bg-emerald-100',
      filter: 'not_carrier',
    },
    {
      label: 'Carrier',
      value: summary.carrierCount,
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      hoverColor: 'hover:bg-amber-100',
      filter: 'carrier',
      alert: summary.carrierCount > 0,
    },
    {
      label: 'Critical Findings',
      value: summary.affectedCount + summary.highRiskConditions,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-700 border-red-200',
      hoverColor: 'hover:bg-red-100',
      filter: 'critical',
      alert: summary.affectedCount > 0 || summary.highRiskConditions > 0,
    },
  ];

  // Calculate percentages for risk distribution
  const total = summary.totalConditionsTested || 1;
  const riskDistribution = [
    { 
      label: 'High Risk', 
      value: summary.highRiskConditions, 
      percent: Math.round((summary.highRiskConditions / total) * 100),
      color: 'bg-red-500' 
    },
    { 
      label: 'Moderate Risk', 
      value: summary.moderateRiskConditions, 
      percent: Math.round((summary.moderateRiskConditions / total) * 100),
      color: 'bg-amber-500' 
    },
    { 
      label: 'Low Risk', 
      value: summary.notCarrierCount - summary.moderateRiskConditions, 
      percent: Math.round(((summary.notCarrierCount - summary.moderateRiskConditions) / total) * 100),
      color: 'bg-emerald-500' 
    },
  ].filter(r => r.value > 0);

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => stat.filter && onFilterByStatus?.(stat.filter)}
            className={stat.filter ? 'cursor-pointer' : ''}
          >
            <Card className={`${stat.color} ${stat.filter ? stat.hoverColor : ''} transition-all border-2`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs font-medium uppercase tracking-wide opacity-80 mt-1">
                      {stat.label}
                    </p>
                  </div>
                  <stat.icon className="w-8 h-8 opacity-60" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Carrier Status Overview</CardTitle>
                <CardDescription>
                  Generated {report.generatedAt.toLocaleDateString()} • Version {report.version}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Risk Distribution Bar */}
            {summary.totalConditionsTested > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Risk Level Distribution
                </h4>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                  {riskDistribution.map((risk) => (
                    <div
                      key={risk.label}
                      className={`${risk.color} h-full transition-all`}
                      style={{ width: `${risk.percent}%` }}
                      title={`${risk.label}: ${risk.value} (${risk.percent}%)`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  {riskDistribution.map((risk) => (
                    <div key={risk.label} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${risk.color}`} />
                      <span className="text-sm text-slate-600">
                        {risk.label}: <strong>{risk.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Breakdown */}
            {Object.keys(summary.conditionsByCategory).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Conditions by Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(summary.conditionsByCategory).map(([category, count]) => (
                    <Badge key={category} variant="default" size="md">
                      {category}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Recommended Actions
              </h4>
              <ul className="space-y-2">
                {report.recommendations.slice(0, 4).map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Alert */}
            {(summary.affectedCount > 0 || summary.highRiskConditions > 0) && (
              <Alert variant="destructive">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Important Medical Findings</p>
                    <p className="text-sm opacity-90 mt-1">
                      {summary.affectedCount > 0 
                        ? `You have ${summary.affectedCount} condition(s) that require immediate medical attention. `
                        : ''}
                      {summary.counselingRecommended.length > 0 
                        ? `${summary.counselingRecommended.length} result(s) recommend genetic counseling.` 
                        : ''}
                      Please consult with a healthcare provider or genetic counselor.
                    </p>
                  </div>
                </div>
              </Alert>
            )}

            {/* Partner Screening Recommendation */}
            {summary.carrierCount > 0 && summary.affectedCount === 0 && (
              <Alert variant="info">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Partner Screening Recommended</p>
                    <p className="text-sm opacity-90 mt-1">
                      You are a carrier for {summary.carrierCount} condition(s). If you are planning 
                      a family, consider sharing these results with your partner and discussing 
                      carrier screening for them as well.
                    </p>
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Compact summary for use in other components
 */
interface CompactCarrierSummaryProps {
  results: CarrierResult[];
}

export function CompactCarrierSummary({ results }: CompactCarrierSummaryProps) {
  const carrierCount = results.filter(r => r.status === 'carrier').length;
  const affectedCount = results.filter(r => r.status === 'affected').length;
  const counselingCount = results.filter(r => r.counselingRecommended).length;

  return (
    <div className="flex flex-wrap gap-3">
      <Badge variant="success" size="md">
        <CheckCircle className="w-3 h-3 mr-1" />
        {results.length - carrierCount - affectedCount} Clear
      </Badge>
      
      {carrierCount > 0 && (
        <Badge variant="warning" size="md">
          <AlertCircle className="w-3 h-3 mr-1" />
          {carrierCount} Carrier
        </Badge>
      )}
      
      {affectedCount > 0 && (
        <Badge variant="error" size="md">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {affectedCount} Critical
        </Badge>
      )}
      
      {counselingCount > 0 && (
        <Badge variant="primary" size="md">
          <Stethoscope className="w-3 h-3 mr-1" />
          {counselingCount} Need Counseling
        </Badge>
      )}
    </div>
  );
}

export default CarrierReportSummary;
