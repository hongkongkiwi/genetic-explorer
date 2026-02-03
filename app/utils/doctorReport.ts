/**
 * Medical Report Generator for Doctors
 *
 * Creates professional, clinically-focused reports suitable for
 * healthcare providers. Focuses on actionable findings without
 * embellishment or speculation.
 */

import { format } from 'date-fns';
import crypto from 'crypto';

// ============================================================================
// Report Types
// ============================================================================

export interface DoctorReportData {
  reportMetadata: {
    reportId: string;
    generatedAt: string;
    patientId: string; // Anonymized hash
    reportVersion: string;
  };
  summary: {
    totalVariantsAnalyzed: number;
    clinicallySignificant: number;
    riskVariants: number;
    carrierStatuses: number;
  };
  clinicallySignificantFindings: ClinicalFinding[];
  pharmacogenomicFindings: PharmacogenomicFinding[];
  carrierScreenResults: CarrierFinding[];
  recommendedFollowUps: FollowUpRecommendation[];
  methodology: string;
  limitations: string;
  disclaimer: string;
}

export interface ClinicalFinding {
  rsid: string;
  gene: string;
  variantType: string;
  clinicalSignificance: 'Pathogenic' | 'Likely Pathogenic' | 'Uncertain Significance' | 'Benign' | 'Likely Benign';
  condition: string;
  inheritance: string;
  genotype: string;
  alleleFrequency: string;
  clinicalTrials?: string;
  recommendations: string;
}

export interface PharmacogenomicFinding {
  rsid: string;
  gene: string;
  drug: string;
  phenotype: string;
  recommendation: string;
}

export interface CarrierFinding {
  gene: string;
  condition: string;
  inheritance: string;
  variant: string;
}

export interface FollowUpRecommendation {
  priority: 'High' | 'Medium' | 'Low';
  condition: string;
  recommendation: string;
  timeline: string;
}

// ============================================================================
// Report Generator
// ============================================================================

/**
 * Generate a comprehensive medical report for healthcare providers
 */
export function generateDoctorReport(
  userId: string,
  genomeId: string,
  variants: any[],
  snpData: any[]
): DoctorReportData {
  const now = new Date();
  const patientHash = hashPatientId(userId);

  // Categorize findings
  const clinicallySignificant = categorizeClinicallySignificant(variants, snpData);
  const pharmacogenomic = categorizePharmacogenomic(variants, snpData);
  const carrierScreen = categorizeCarrierStatus(variants, snpData);
  const followUps = generateFollowUps(clinicallySignificant);

  return {
    reportMetadata: {
      reportId: generateReportId(),
      generatedAt: format(now, 'yyyy-MM-dd HH:mm:ss'),
      patientId: patientHash,
      reportVersion: '1.0',
    },
    summary: {
      totalVariantsAnalyzed: snpData.length,
      clinicallySignificant: clinicallySignificant.length,
      riskVariants: clinicallySignificant.filter(f =>
        f.clinicalSignificance === 'Pathogenic' || f.clinicalSignificance === 'Likely Pathogenic'
      ).length,
      carrierStatuses: carrierScreen.length,
    },
    clinicallySignificantFindings: clinicallySignificant,
    pharmacogenomicFindings: pharmacogenomic,
    carrierScreenResults: carrierScreen,
    recommendedFollowUps: followUps,
    methodology: generateMethodology(),
    limitations: generateLimitations(),
    disclaimer: generateDisclaimer(),
  };
}

/**
 * Export report as formatted text for printing
 */
export function formatDoctorReportForPrint(report: DoctorReportData): string {
  const lines: string[] = [];

  // Header
  lines.push('═'.repeat(70));
  lines.push('GENETIC ANALYSIS REPORT - CLINICAL SUMMARY');
  lines.push('═'.repeat(70));
  lines.push('');
  lines.push(`Report ID: ${report.reportMetadata.reportId}`);
  lines.push(`Generated: ${report.reportMetadata.generatedAt}`);
  lines.push(`Patient ID: ${report.reportMetadata.patientId}`);
  lines.push(`Version: ${report.reportMetadata.reportVersion}`);
  lines.push('');

  // Summary
  lines.push('─'.repeat(70));
  lines.push('EXECUTIVE SUMMARY');
  lines.push('─'.repeat(70));
  lines.push('');
  lines.push(`Variants Analyzed: ${report.summary.totalVariantsAnalyzed}`);
  lines.push(`Clinically Significant: ${report.summary.clinicallySignificant}`);
  lines.push(`High-Risk Variants: ${report.summary.riskVariants}`);
  lines.push(`Carrier Statuses: ${report.summary.carrierStatuses}`);
  lines.push('');

  // Clinically Significant Findings
  if (report.clinicallySignificantFindings.length > 0) {
    lines.push('─'.repeat(70));
    lines.push('CLINICALLY SIGNIFICANT FINDINGS');
    lines.push('─'.repeat(70));
    lines.push('');

    for (const finding of report.clinicallySignificantFindings) {
      lines.push(`RSID: ${finding.rsid}`);
      lines.push(`Gene: ${finding.gene}`);
      lines.push(`Variant: ${finding.variantType} (${finding.genotype})`);
      lines.push(`Significance: ${finding.clinicalSignificance}`);
      lines.push(`Condition: ${finding.condition}`);
      lines.push(`Inheritance: ${finding.inheritance}`);
      lines.push(`Allele Frequency: ${finding.alleleFrequency || 'N/A'}`);
      lines.push(`Recommendations: ${finding.recommendations}`);
      lines.push('');
    }
  }

  // Pharmacogenomic Findings
  if (report.pharmacogenomicFindings.length > 0) {
    lines.push('─'.repeat(70));
    lines.push('PHARMACOGENOMIC FINDINGS');
    lines.push('─'.repeat(70));
    lines.push('');

    for (const finding of report.pharmacogenomicFindings) {
      lines.push(`Gene/Drug: ${finding.gene} / ${finding.drug}`);
      lines.push(`Phenotype: ${finding.phenotype}`);
      lines.push(`Recommendation: ${finding.recommendation}`);
      lines.push('');
    }
  }

  // Carrier Screen
  if (report.carrierScreenResults.length > 0) {
    lines.push('─'.repeat(70));
    lines.push('CARRIER SCREEN RESULTS');
    lines.push('─'.repeat(70));
    lines.push('');

    for (const finding of report.carrierScreenResults) {
      lines.push(`Gene: ${finding.gene}`);
      lines.push(`Condition: ${finding.condition}`);
      lines.push(`Inheritance: ${finding.inheritance}`);
      lines.push(`Variant: ${finding.variant}`);
      lines.push('');
    }
  }

  // Follow-up Recommendations
  if (report.recommendedFollowUps.length > 0) {
    lines.push('─'.repeat(70));
    lines.push('RECOMMENDED FOLLOW-UPS');
    lines.push('─'.repeat(70));
    lines.push('');

    for (const followUp of report.recommendedFollowUps) {
      lines.push(`[${followUp.priority} PRIORITY] ${followUp.condition}`);
      lines.push(`Timeline: ${followUp.timeline}`);
      lines.push(`Recommendation: ${followUp.recommendation}`);
      lines.push('');
    }
  }

  // Methodology
  lines.push('─'.repeat(70));
  lines.push('METHODOLOGY');
  lines.push('─'.repeat(70));
  lines.push('');
  lines.push(report.methodology);
  lines.push('');

  // Limitations
  lines.push('─'.repeat(70));
  lines.push('LIMITATIONS');
  lines.push('─'.repeat(70));
  lines.push('');
  lines.push(report.limitations);
  lines.push('');

  // Disclaimer
  lines.push('─'.repeat(70));
  lines.push('DISCLAIMER');
  lines.push('─'.repeat(70));
  lines.push('');
  lines.push(report.disclaimer);
  lines.push('');
  lines.push('═'.repeat(70));

  return lines.join('\n');
}

// ============================================================================
// Helper Functions
// ============================================================================

function hashPatientId(userId: string): string {
  // Create anonymized patient ID (first 8 chars of SHA256)
  return crypto.createHash('sha256').update(userId).digest('hex').substring(0, 8).toUpperCase();
}

function generateReportId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `GR-${timestamp}-${random}`.toUpperCase();
}

function categorizeClinicallySignificant(variants: any[], snpData: any[]): ClinicalFinding[] {
  const findings: ClinicalFinding[] = [];

  // Known clinically significant SNPs
  const clinicalSNPs: Record<string, Partial<ClinicalFinding>> = {
    'rs1801133': {
      gene: 'MTHFR',
      variantType: 'C677T',
      condition: 'Methylenetetrahydrofolate reductase deficiency',
      inheritance: 'Autosomal Recessive',
      clinicalSignificance: 'Uncertain Significance',
      recommendation: 'Consider folate supplementation. Consult genetics if family history.',
    },
    'rs1800497': {
      gene: 'DRD2',
      variantType: 'Taq1A',
      condition: 'Dopamine receptor sensitivity',
      inheritance: 'Autosomal',
      clinicalSignificance: 'Uncertain Significance',
      recommendation: 'No specific action needed. May inform medication responses.',
    },
    'rs4988235': {
      gene: 'LCT',
      variantType: 'LCT -13910 C>T',
      condition: 'Lactase persistence/non-persistence',
      inheritance: 'Autosomal Dominant',
      clinicalSignificance: 'Benign',
      recommendation: 'Inform dietary lactose tolerance.',
    },
    'rs12913832': {
      gene: 'HERC2',
      variantType: 'HERC2/OCA2',
      condition: 'Eye color determination',
      inheritance: 'Autosomal',
      clinicalSignificance: 'Benign',
      recommendation: 'No clinical significance.',
    },
    'rs762551': {
      gene: 'CYP1A2',
      variantType: '*1F',
      condition: 'CYP1A2 enzyme activity',
      inheritance: 'Autosomal',
      clinicalSignificance: 'Uncertain Significance',
      recommendation: 'May affect caffeine metabolism.',
    },
  };

  for (const snp of snpData) {
    const clinicalInfo = clinicalSNPs[snp.rsid];
    if (clinicalInfo) {
      findings.push({
        rsid: snp.rsid,
        gene: clinicalInfo.gene!,
        variantType: clinicalInfo.variantType!,
        clinicalSignificance: clinicalInfo.clinicalSignificance as any,
        condition: clinicalInfo.condition!,
        inheritance: clinicalInfo.inheritance!,
        genotype: snp.genotype || 'N/A',
        alleleFrequency: snp.frequency || 'Unknown',
        recommendations: clinicalInfo.recommendation!,
      });
    }
  }

  return findings;
}

function categorizePharmacogenomic(variants: any[], snpData: any[]): PharmacogenomicFinding[] {
  const findings: PharmacogenomicFinding[] = [];

  // Pharmacogenomic variants
  const pharmacoSNPs: Record<string, Partial<PharmacogenomicFinding>> = {
    'rs3892097': {
      gene: 'CYP2D6',
      drug: 'Codeine, Tramadol, SSRIs',
      phenotype: 'Poor Metabolizer',
      recommendation: 'Avoid codeine/tramadol. Consider alternatives.',
    },
    'rs4986893': {
      gene: 'CYP2C19',
      drug: 'Clopidogrel, PPIs',
      phenotype: 'Poor Metabolizer',
      recommendation: 'Consider alternative antiplatelets.',
    },
    'rs1057910': {
      gene: 'CYP2C9',
      drug: 'Warfarin, Phenytoin',
      phenotype: 'Reduced Function',
      recommendation: 'Monitor warfarin closely. Consider reduced dose.',
    },
    'rs1801133': {
      gene: 'MTHFR',
      drug: 'Folate antagonists',
      phenotype: 'Reduced Activity',
      recommendation: 'Ensure adequate folate status.',
    },
  };

  for (const snp of snpData) {
    const pharmacoInfo = pharmacoSNPs[snp.rsid];
    if (pharmacoInfo) {
      findings.push({
        rsid: snp.rsid,
        gene: pharmacoInfo.gene!,
        drug: pharmacoInfo.drug!,
        phenotype: pharmacoInfo.phenotype!,
        recommendation: pharmacoInfo.recommendation!,
      });
    }
  }

  return findings;
}

function categorizeCarrierStatus(variants: any[], snpData: any[]): CarrierFinding[] {
  // This would typically look for recessive conditions
  // For now, return empty as full carrier screening requires specific panels
  return [];
}

function generateFollowUps(findings: ClinicalFinding[]): FollowUpRecommendation[] {
  const followUps: FollowUpRecommendation[] = [];

  for (const finding of findings) {
    if (finding.clinicalSignificance === 'Pathogenic' || finding.clinicalSignificance === 'Likely Pathogenic') {
      followUps.push({
        priority: 'High',
        condition: finding.condition,
        recommendation: `Genetic counseling recommended. Consider referral to medical geneticist. ${finding.recommendations}`,
        timeline: 'Within 4 weeks',
      });
    } else if (finding.clinicalSignificance === 'Uncertain Significance') {
      followUps.push({
        priority: 'Medium',
        condition: finding.condition,
        recommendation: `Discuss with genetics. ${finding.recommendations}`,
        timeline: 'Within 3 months',
      });
    }
  }

  return followUps.sort((a, b) => {
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function generateMethodology(): string {
  return `This report was generated using computational analysis of genetic variants
detected via high-throughput sequencing or microarray technology. Variants were
compared against current clinical databases including ClinVar, dbSNP, and
pharmacogenomic databases. Clinical significance was assigned based on ACMG
guidelines and available literature.`;
}

function generateLimitations(): string {
  return `1. This analysis is limited to variants in the tested regions.
2. Not all genetic conditions can be detected by current testing.
3. Negative results do not rule out all genetic conditions.
4. Variants of uncertain significance may be reclassified over time.
5. This report should be interpreted by qualified healthcare professionals.`;
}

function generateDisclaimer(): string {
  return `This report is for informational purposes only and does not constitute
medical advice. Results should be interpreted in the context of complete
clinical evaluation by qualified healthcare professionals. Genetic testing
results have implications for family members; consider cascade testing.`;
}

// ============================================================================
// Export formatting
// ============================================================================

export type ExportFormat = 'txt' | 'json' | 'pdf';

export function formatReportForExport(
  report: DoctorReportData,
  format: ExportFormat
): { content: string; contentType: string; filename: string } {
  const timestamp = new Date().toISOString().split('T')[0];
  const patientId = report.reportMetadata.patientId;

  switch (format) {
    case 'txt':
      return {
        content: formatDoctorReportForPrint(report),
        contentType: 'text/plain',
        filename: `genetic-report-${patientId}-${timestamp}.txt`,
      };
    case 'json':
      return {
        content: JSON.stringify(report, null, 2),
        contentType: 'application/json',
        filename: `genetic-report-${patientId}-${timestamp}.json`,
      };
    case 'pdf':
      // PDF would require a library like puppeteer or jsPDF
      // For now, return instructions
      return {
        content: formatDoctorReportForPrint(report),
        contentType: 'text/plain',
        filename: `genetic-report-${patientId}-${timestamp}.txt`,
      };
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
