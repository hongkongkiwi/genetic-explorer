/**
 * Doctor Report Generator
 * 
 * Generates clinical-grade reports for healthcare providers.
 */

import type { SNP } from '~/types/genetics';
import { analyzeCarrierStatus, type CarrierResult } from './carrierAnalysis';

export interface DoctorReport {
  patientInfo: {
    id: string;
    generatedAt: string;
    reportVersion: string;
  };
  clinicalSummary: {
    totalVariantsAnalyzed: number;
    clinicallySignificant: number;
    carrierConditions: number;
    pharmacogenomicVariants: number;
  };
  carrierResults: CarrierResult[];
  pharmacogenomics: PharmacogenomicResult[];
  recommendations: ClinicalRecommendation[];
  limitations: string[];
}

export interface PharmacogenomicResult {
  gene: string;
  rsid: string;
  genotype: string;
  phenotype: string;
  medications: {
    affected: string[];
    recommendation: string;
  }[];
}

export interface ClinicalRecommendation {
  category: 'screening' | 'lifestyle' | 'medication' | 'referral';
  priority: 'high' | 'moderate' | 'low';
  description: string;
  rationale: string;
}

/**
 * Generate a clinical report for healthcare providers
 */
export function generateDoctorReport(
  patientId: string,
  snps: SNP[]
): DoctorReport {
  const carrierReport = analyzeCarrierStatus(snps);
  
  // Filter for clinically significant results
  const significantCarriers = carrierReport.results.filter(
    r => r.status === 'carrier' || r.status === 'affected'
  );
  
  // Analyze pharmacogenomic variants
  const pharmacogenomics = analyzePharmacogenomics(snps);
  
  // Generate recommendations
  const recommendations = generateClinicalRecommendations(
    significantCarriers,
    pharmacogenomics
  );

  return {
    patientInfo: {
      id: patientId,
      generatedAt: new Date().toISOString(),
      reportVersion: '1.0.0',
    },
    clinicalSummary: {
      totalVariantsAnalyzed: snps.length,
      clinicallySignificant: significantCarriers.length + pharmacogenomics.length,
      carrierConditions: significantCarriers.filter(r => r.status === 'carrier').length,
      pharmacogenomicVariants: pharmacogenomics.length,
    },
    carrierResults: significantCarriers,
    pharmacogenomics,
    recommendations,
    limitations: getClinicalLimitations(),
  };
}

/**
 * Analyze pharmacogenomic variants
 */
function analyzePharmacogenomics(snps: SNP[]): PharmacogenomicResult[] {
  const results: PharmacogenomicResult[] = [];
  
  // CYP2D6 - Drug metabolism
  const cyp2d6 = snps.find(s => s.rsid === 'rs3892097');
  if (cyp2d6) {
    const isPoorMetabolizer = cyp2d6.genotype === 'AA' || cyp2d6.genotype === 'TT';
    results.push({
      gene: 'CYP2D6',
      rsid: 'rs3892097',
      genotype: cyp2d6.genotype,
      phenotype: isPoorMetabolizer ? 'Poor metabolizer' : 'Normal metabolizer',
      medications: [
        {
          affected: ['Codeine', 'Tramadol', 'Tamoxifen'],
          recommendation: isPoorMetabolizer 
            ? 'Avoid codeine; reduced efficacy expected. Consider alternative analgesics.'
            : 'Standard dosing appropriate.',
        },
      ],
    });
  }
  
  // CYP2C19 - Clopidogrel metabolism
  const cyp2c19 = snps.find(s => s.rsid === 'rs4244285');
  if (cyp2c19) {
    const isPoorMetabolizer = cyp2c19.genotype === 'AA' || cyp2c19.genotype === 'GG';
    results.push({
      gene: 'CYP2C19',
      rsid: 'rs4244285',
      genotype: cyp2c19.genotype,
      phenotype: isPoorMetabolizer ? 'Poor metabolizer' : 'Normal/rapid metabolizer',
      medications: [
        {
          affected: ['Clopidogrel (Plavix)'],
          recommendation: isPoorMetabolizer
            ? 'Reduced antiplatelet effect. Consider alternative antiplatelet therapy.'
            : 'Standard clopidogrel dosing appropriate.',
        },
      ],
    });
  }
  
  // SLCO1B1 - Statin myopathy risk
  const slco1b1 = snps.find(s => s.rsid === 'rs4149056');
  if (slco1b1) {
    const hasRiskAllele = slco1b1.genotype.includes('T');
    results.push({
      gene: 'SLCO1B1',
      rsid: 'rs4149056',
      genotype: slco1b1.genotype,
      phenotype: hasRiskAllele ? 'Increased statin myopathy risk' : 'Normal risk',
      medications: [
        {
          affected: ['Simvastatin', 'Atorvastatin'],
          recommendation: hasRiskAllele
            ? 'Start with lower statin dose; monitor for muscle symptoms closely.'
            : 'Standard statin dosing appropriate.',
        },
      ],
    });
  }
  
  return results;
}

/**
 * Generate clinical recommendations
 */
function generateClinicalRecommendations(
  carrierResults: CarrierResult[],
  pharmacogenomics: PharmacogenomicResult[]
): ClinicalRecommendation[] {
  const recommendations: ClinicalRecommendation[] = [];
  
  // Carrier-related recommendations
  const severeCarriers = carrierResults.filter(
    r => r.status === 'carrier' && r.condition.severity === 'severe'
  );
  
  if (severeCarriers.length > 0) {
    recommendations.push({
      category: 'referral',
      priority: 'high',
      description: 'Refer for genetic counseling regarding carrier status for severe conditions.',
      rationale: `Patient is carrier for ${severeCarriers.map(c => c.condition.name).join(', ')}.`,
    });
  }
  
  // Pharmacogenomic recommendations
  for (const pgx of pharmacogenomics) {
    if (pgx.phenotype.includes('Poor') || pgx.phenotype.includes('risk')) {
      recommendations.push({
        category: 'medication',
        priority: 'high',
        description: `Consider ${pgx.gene} genotype when prescribing affected medications.`,
        rationale: pgx.medications[0]?.recommendation || '',
      });
    }
  }
  
  // Factor V Leiden
  const factorV = carrierResults.find(r => r.condition.id === 'factor-v-leiden');
  if (factorV) {
    recommendations.push({
      category: 'lifestyle',
      priority: 'high',
      description: 'Counsel regarding venous thromboembolism prophylaxis.',
      rationale: 'Increased risk of blood clots. Avoid prolonged immobility, stay hydrated.',
    });
  }
  
  return recommendations;
}

/**
 * Get clinical limitations disclaimer
 */
function getClinicalLimitations(): string[] {
  return [
    'This report is based on direct-to-consumer genetic data and may not include all clinically relevant variants.',
    'A negative result does not rule out carrier status for all variants in these genes.',
    'Genetic counseling is recommended for interpretation of these results.',
    'Clinical confirmation testing may be required before making medical decisions.',
    'Environmental and lifestyle factors also contribute to disease risk.',
    'This test does not detect all possible mutations in the genes analyzed.',
  ];
}

/**
 * Export report as JSON for EHR integration
 */
export function exportReportForEHR(report: DoctorReport): string {
  return JSON.stringify({
    resourceType: 'DiagnosticReport',
    status: 'final',
    code: {
      text: 'Genetic Carrier Screening',
    },
    subject: {
      reference: `Patient/${report.patientInfo.id}`,
    },
    effectiveDateTime: report.patientInfo.generatedAt,
    result: report.carrierResults.map(r => ({
      observation: r.condition.name,
      interpretation: r.status,
    })),
    conclusion: `Clinically significant variants identified: ${report.clinicalSummary.clinicallySignificant}`,
  }, null, 2);
}

/**
 * Generate PDF report (placeholder)
 */
export function generatePDFReport(report: DoctorReport): {
  success: boolean;
  error?: string;
} {
  // PDF generation would require a library like PDFKit or puppeteer
  return {
    success: false,
    error: 'PDF generation requires additional dependencies (PDFKit or Puppeteer)',
  };
}

/**
 * Format report for export
 */
export function formatReportForExport(report: DoctorReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Format doctor report for printing
 */
export function formatDoctorReportForPrint(report: DoctorReport): string {
  const lines: string[] = [
    'GENETIC EXPLORER - CLINICAL REPORT',
    '==================================',
    '',
    `Patient ID: ${report.patientInfo.id}`,
    `Generated: ${new Date(report.patientInfo.generatedAt).toLocaleString()}`,
    `Version: ${report.patientInfo.reportVersion}`,
    '',
    'CLINICAL SUMMARY',
    '----------------',
    `Total Variants Analyzed: ${report.clinicalSummary.totalVariantsAnalyzed}`,
    `Clinically Significant: ${report.clinicalSummary.clinicallySignificant}`,
    `Carrier Conditions: ${report.clinicalSummary.carrierConditions}`,
    `Pharmacogenomic Variants: ${report.clinicalSummary.pharmacogenomicVariants}`,
    '',
    'SIGNIFICANT FINDINGS',
    '--------------------',
  ];
  
  // Add carrier results
  const significantCarriers = report.carrierResults.filter(
    r => r.status === 'carrier' || r.status === 'affected'
  );
  
  if (significantCarriers.length === 0) {
    lines.push('No significant carrier variants detected.');
  } else {
    for (const result of significantCarriers) {
      lines.push(`\n${result.condition.name}`);
      lines.push(`  Status: ${result.status}`);
      lines.push(`  Gene: ${result.condition.gene}`);
      lines.push(`  Genotype: ${result.genotype}`);
      lines.push(`  Risk Level: ${result.riskLevel}`);
    }
  }
  
  lines.push('', 'CLINICAL RECOMMENDATIONS', '------------------------');
  for (const rec of report.recommendations) {
    lines.push(`\n[${rec.priority.toUpperCase()}] ${rec.category}`);
    lines.push(`  ${rec.description}`);
  }
  
  lines.push('', 'LIMITATIONS', '-----------');
  for (const limitation of report.limitations) {
    lines.push(`• ${limitation}`);
  }
  
  return lines.join('\n');
}

/**
 * Get clinically significant findings
 */
export function getClinicallySignificantFindings(report: DoctorReport): {
  carriers: typeof report.carrierResults;
  pharmacogenomics: typeof report.pharmacogenomics;
  highRiskRecommendations: typeof report.recommendations;
} {
  return {
    carriers: report.carrierResults.filter(r => r.status === 'carrier' || r.status === 'affected'),
    pharmacogenomics: report.pharmacogenomics,
    highRiskRecommendations: report.recommendations.filter(r => r.priority === 'high'),
  };
}
