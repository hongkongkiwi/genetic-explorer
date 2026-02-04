import React, { useMemo } from 'react';
import { 
  calculateGenomeCoverage, 
  getGenomeHeatmap, 
  formatCoverage, 
  formatNumber,
  getCoverageIcon,
  type GenomeCoverage 
} from '../utils/genomeCoverage';
import type { SNP } from '../utils/genomeParser';
import { 
  Activity, 
  Dna, 
  Shield, 
  Globe, 
  Pill, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  Info
} from 'lucide-react';

interface GenomeCoverageVisualizationProps {
  snps: SNP[];
  previousCoverage?: GenomeCoverage; // For comparison
}

export function GenomeCoverageVisualization({ snps, previousCoverage }: GenomeCoverageVisualizationProps) {
  const coverage = useMemo(() => calculateGenomeCoverage(snps), [snps]);
  const heatmap = useMemo(() => getGenomeHeatmap(snps), [snps]);

  const gradeColors = {
    excellent: 'text-green-600 bg-green-50 border-green-200',
    good: 'text-blue-600 bg-blue-50 border-blue-200',
    fair: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    limited: 'text-orange-600 bg-orange-50 border-orange-200',
  };

  const getGradeBg = (grade: string) => {
    switch (grade) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'limited': return 'bg-orange-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Genome Coverage</h2>
        <p className="text-gray-600">
          Analysis of {formatNumber(coverage.snps.total)} genetic variants across your genome
        </p>
      </div>

      {/* Overall Coverage Score */}
      <div className={`rounded-2xl border-2 p-8 ${gradeColors[coverage.overall.grade]}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getCoverageIcon(coverage.overall.grade)}</span>
            <div>
              <div className="text-lg font-medium opacity-80">Overall Coverage</div>
              <div className="text-4xl font-bold">
                {formatCoverage(coverage.overall.percentage)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold capitalize">{coverage.overall.grade}</div>
            <div className="text-sm opacity-80">Quality Rating</div>
          </div>
        </div>
        <p className="text-lg">{coverage.overall.description}</p>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-4 bg-black/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current transition-all duration-1000"
              style={{ width: `${Math.min(100, coverage.overall.percentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-2 opacity-70">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* SNPs */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Dna className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total SNPs</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(coverage.snps.total)}</div>
          <div className="text-sm text-gray-500 mt-1">
            of ~85M known variants
          </div>
        </div>

        {/* Clinical */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Clinical SNPs</span>
          </div>
          <div className="text-2xl font-bold">{coverage.clinical.clinicalSnpsPresent}</div>
          <div className="text-sm text-gray-500 mt-1">
            medically relevant variants
          </div>
        </div>

        {/* Ancestry */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Ancestry Markers</span>
          </div>
          <div className="text-2xl font-bold">{coverage.ancestry.informativeMarkers}</div>
          <div className="text-sm text-gray-500 mt-1">
            ethnicity indicators
          </div>
        </div>

        {/* Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Health Variants</span>
          </div>
          <div className="text-2xl font-bold">{coverage.health.actionableVariants}</div>
          <div className="text-sm text-gray-500 mt-1">
            actionable insights
          </div>
        </div>
      </div>

      {/* Chromosome Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Dna className="w-5 h-5" />
          Chromosome Coverage
        </h3>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>Excellent (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-lime-500 rounded" />
            <span>Good (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span>Fair (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded" />
            <span>Limited (20-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span>Minimal (&lt;20%)</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-11 gap-2">
          {heatmap.map(({ chromosome, coverage: cov, color }) => (
            <div
              key={chromosome}
              className="flex flex-col items-center"
              title={`Chromosome ${chromosome}: ${cov.toFixed(1)}%`}
            >
              <div
                className="w-full aspect-square rounded-lg transition-all hover:scale-110 cursor-pointer"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs mt-1 font-medium">{chromosome}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Chromosome Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Detailed Chromosome Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Chromosome</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">SNPs</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Coverage</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coverage.chromosomes.map(chr => (
                <tr key={chr.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{chr.name}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(chr.snpCount)}</td>
                  <td className="px-4 py-3 text-right">{chr.coverage.toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getGradeBg(chr.grade)} text-white`}>
                      {chr.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Importance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5" />
          Clinical Coverage
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">
              {coverage.clinical.clinicalSnpsPresent}
            </div>
            <div className="text-sm text-green-600">
              Clinically relevant variants detected
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700">
              {coverage.health.pharmacogenomics}
            </div>
            <div className="text-sm text-blue-600">
              Pharmacogenomic variants (drug response)
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-700">
              {coverage.health.carrierStatusVariants}
            </div>
            <div className="text-sm text-purple-600">
              Carrier status variants detected
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {coverage.recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            Recommendations
          </h3>
          <ul className="space-y-3">
            {coverage.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-yellow-800">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comparison with previous */}
      {previousCoverage && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-900">
            <TrendingUp className="w-5 h-5" />
            Comparison with Previous Genome
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Previous Coverage</div>
              <div className="text-2xl font-bold">{formatCoverage(previousCoverage.overall.percentage)}</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Current Coverage</div>
              <div className="text-2xl font-bold">{formatCoverage(coverage.overall.percentage)}</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Change</div>
              <div className={`text-2xl font-bold ${
                coverage.overall.percentage > previousCoverage.overall.percentage 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {(coverage.overall.percentage - previousCoverage.overall.percentage).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <p className="flex items-center justify-center gap-2">
          <Info className="w-4 h-4" />
          Coverage estimates are approximate and based on the number of SNPs relative to known genome size.
        </p>
        <p className="mt-2">
          Actual genome coverage depends on the distribution and quality of variants tested.
        </p>
      </div>
    </div>
  );
}

// Compact version for dashboard
export function GenomeCoverageSummary({ snps }: { snps: SNP[] }) {
  const coverage = useMemo(() => calculateGenomeCoverage(snps), [snps]);

  const gradeColors = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    fair: 'text-yellow-600',
    limited: 'text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{getCoverageIcon(coverage.overall.grade)}</div>
          <div>
            <div className="text-sm text-gray-600">Genome Coverage</div>
            <div className={`text-3xl font-bold ${gradeColors[coverage.overall.grade]}`}>
              {formatCoverage(coverage.overall.percentage)}
            </div>
            <div className="text-sm text-gray-500">
              {formatNumber(coverage.snps.total)} SNPs analyzed
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xl font-semibold capitalize ${gradeColors[coverage.overall.grade]}`}>
            {coverage.overall.grade}
          </div>
          <div className="text-sm text-gray-500">
            {coverage.clinical.clinicalSnpsPresent} clinical SNPs
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              coverage.overall.grade === 'excellent' ? 'bg-green-500' :
              coverage.overall.grade === 'good' ? 'bg-blue-500' :
              coverage.overall.grade === 'fair' ? 'bg-yellow-500' :
              'bg-orange-500'
            }`}
            style={{ width: `${Math.min(100, coverage.overall.percentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default GenomeCoverageVisualization;
