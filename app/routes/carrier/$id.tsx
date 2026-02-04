/**
 * Carrier Status Report Page
 * 
 * Displays comprehensive carrier screening results with filtering,
 * sorting, and detailed information about each condition.
 * Includes prominent medical disclaimers and genetic counseling CTAs.
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb, predefinedBreadcrumbs } from '~/components/Breadcrumb';
import { CarrierStatusCard, CarrierSummaryCard } from '~/components/CarrierStatusCard';
import { CarrierReportSummary } from '~/components/carrier/CarrierReportSummary';
import { GeneticCounselingCTA } from '~/components/carrier/GeneticCounselingCTA';
import { Button } from '~/components/ui/Button';
import { Alert } from '~/components/ui/Alert';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card';
import {
  Dna,
  ArrowLeft,
  Download,
  Share2,
  Printer,
  AlertCircle,
  AlertTriangle,
  Filter,
  ChevronDown,
  FileText,
  Users,
  BookOpen,
  ExternalLink,
  Stethoscope,
  Shield,
  Info,
  X,
  CheckCircle,
  Heart,
  Baby,
} from 'lucide-react';
import type { CarrierReport, CarrierResult, CarrierStatus, InheritancePattern } from '~/types/carrier';

// Mock data for demonstration - replace with actual API call
const mockCarrierReport: CarrierReport = {
  id: 'carrier-report-001',
  genomeId: 'genome-001',
  userId: 'user-001',
  generatedAt: new Date(),
  version: '1.0.0',
  summary: {
    totalConditionsTested: 287,
    carrierCount: 3,
    affectedCount: 0,
    uncertainCount: 1,
    notCarrierCount: 283,
    highRiskConditions: 1,
    moderateRiskConditions: 2,
    conditionsByCategory: {
      'Metabolic': 45,
      'Hematologic': 32,
      'Neurological': 28,
      'Sensory': 18,
      'Other': 164,
    },
  },
  results: [],
  criticalFindings: [],
  counselingRecommended: [],
  recommendations: [
    'Discuss results with your healthcare provider',
    'Consider partner screening if planning a family',
    'Keep results for your medical records',
    'Update screening as new tests become available',
  ],
  disclaimer: 'This screening is for educational purposes only...',
  nextSteps: ['Consult genetic counselor', 'Share with physician'],
};

// Generate mock results for demonstration
const generateMockResults = (): CarrierResult[] => {
  const conditions: CarrierResult[] = [
    {
      condition: {
        id: 'cystic-fibrosis',
        name: 'Cystic Fibrosis',
        gene: 'CFTR',
        geneFullName: 'Cystic Fibrosis Transmembrane Conductance Regulator',
        inheritance: 'autosomal_recessive' as InheritancePattern,
        description: 'Cystic fibrosis is a genetic disorder that affects the lungs, pancreas, and other organs. It causes thick, sticky mucus to build up in the lungs and digestive system.',
        symptoms: ['Chronic cough', 'Frequent lung infections', 'Poor growth', 'Digestive problems'],
        treatments: ['Airway clearance', 'Enzyme replacement', 'Antibiotics', 'CFTR modulators'],
        pathogenicVariants: [],
        associatedSNPs: ['rs113993960', 'rs199422239'],
        prevalence: { 'european': '1 in 25', 'general': '1 in 31' },
        clinicalSignificance: 'definitive',
        severity: 'critical',
        recommendations: ['Genetic counseling', 'Partner screening', 'Prenatal testing options'],
        resources: [
          { title: 'Cystic Fibrosis Foundation', url: 'https://www.cff.org', type: 'website' },
          { title: 'Genetics Home Reference', url: 'https://ghr.nlm.nih.gov', type: 'article' },
        ],
        category: 'Respiratory',
        ageOfOnset: 'Childhood',
        prenatalTestingAvailable: true,
        newbornScreeningAvailable: true,
      },
      status: 'carrier',
      variantsFound: [{ id: 'F508del', name: 'p.Phe508del', pathogenicGenotypes: ['CT', 'TT'], rsid: 'rs113993960' }],
      userGenotypes: [{ rsid: 'rs113993960', genotype: 'CT' }],
      explanation: 'You carry one copy of the most common CFTR variant (F508del). You are a carrier but will not develop cystic fibrosis.',
      riskToOffspring: 'depends_on_partner',
      riskExplanation: 'If your partner is also a carrier, there is a 25% chance with each pregnancy of having a child with CF.',
      recommendations: ['Partner screening recommended', 'Genetic counseling', 'Discuss prenatal options'],
      resources: [{ title: 'CF Foundation', url: 'https://www.cff.org', type: 'website' }],
      analyzedAt: new Date(),
      counselingRecommended: true,
      urgency: 'high',
    },
    {
      condition: {
        id: 'sickle-cell',
        name: 'Sickle Cell Disease',
        gene: 'HBB',
        geneFullName: 'Hemoglobin Subunit Beta',
        inheritance: 'autosomal_recessive' as InheritancePattern,
        description: 'Sickle cell disease is a group of inherited red blood cell disorders. The abnormal hemoglobin causes red blood cells to become rigid and sickle-shaped.',
        symptoms: ['Anemia', 'Pain episodes', 'Swelling in extremities', 'Frequent infections'],
        treatments: ['Pain management', 'Blood transfusions', 'Hydroxyurea', 'Bone marrow transplant'],
        pathogenicVariants: [],
        associatedSNPs: ['rs334'],
        prevalence: { 'african': '1 in 13', 'general': '1 in 365' },
        clinicalSignificance: 'definitive',
        severity: 'critical',
        recommendations: ['Genetic counseling', 'Pain management plan', 'Infection prevention'],
        resources: [
          { title: 'Sickle Cell Disease Association', url: 'https://www.sicklecelldisease.org', type: 'website' },
        ],
        category: 'Hematologic',
        ageOfOnset: 'Infancy',
        prenatalTestingAvailable: true,
        newbornScreeningAvailable: true,
      },
      status: 'not_carrier',
      variantsFound: [],
      userGenotypes: [{ rsid: 'rs334', genotype: 'AA' }],
      explanation: 'No pathogenic variants detected in the HBB gene. You are not a carrier for sickle cell disease.',
      riskToOffspring: 'negligible',
      riskExplanation: 'Unless your partner has sickle cell disease or is a carrier, your children will not be affected.',
      recommendations: ['No action needed'],
      resources: [],
      analyzedAt: new Date(),
      counselingRecommended: false,
      urgency: 'none',
    },
    {
      condition: {
        id: 'tay-sachs',
        name: 'Tay-Sachs Disease',
        gene: 'HEXA',
        geneFullName: 'Hexosaminidase Subunit Alpha',
        inheritance: 'autosomal_recessive' as InheritancePattern,
        description: 'Tay-Sachs disease is a rare inherited disorder that destroys nerve cells in the brain and spinal cord.',
        symptoms: ['Progressive neurodegeneration', 'Loss of motor skills', 'Seizures', 'Vision and hearing loss'],
        treatments: ['Supportive care', 'Seizure management', 'Nutritional support'],
        pathogenicVariants: [],
        associatedSNPs: ['rs76173981'],
        prevalence: { 'ashkenazi': '1 in 27', 'general': '1 in 300' },
        clinicalSignificance: 'definitive',
        severity: 'critical',
        recommendations: ['Genetic counseling essential', 'Prenatal diagnosis options', 'Family testing'],
        resources: [
          { title: 'National Tay-Sachs Association', url: 'https://www.ntsad.org', type: 'website' },
        ],
        category: 'Neurological',
        ageOfOnset: 'Infancy',
        prenatalTestingAvailable: true,
        newbornScreeningAvailable: true,
      },
      status: 'carrier',
      variantsFound: [{ id: '1278insTATC', name: 'c.1274_1277dupTATC', pathogenicGenotypes: ['CT', 'TT'] }],
      userGenotypes: [{ rsid: 'rs76173981', genotype: 'CT' }],
      explanation: 'You carry one variant in the HEXA gene associated with Tay-Sachs disease. You are a carrier and will not develop the condition.',
      riskToOffspring: 'depends_on_partner',
      riskExplanation: 'If both parents are carriers, there is a 25% risk of having an affected child with each pregnancy.',
      recommendations: ['Partner screening strongly recommended', 'Genetic counseling', 'Consider preimplantation genetic diagnosis'],
      resources: [{ title: 'NTSAD', url: 'https://www.ntsad.org', type: 'website' }],
      analyzedAt: new Date(),
      counselingRecommended: true,
      urgency: 'high',
    },
    {
      condition: {
        id: 'hemochromatosis',
        name: 'Hereditary Hemochromatosis',
        gene: 'HFE',
        geneFullName: 'Homeostatic Iron Regulator',
        inheritance: 'autosomal_recessive' as InheritancePattern,
        description: 'Hereditary hemochromatosis is a disorder that causes the body to absorb too much iron from the diet.',
        symptoms: ['Fatigue', 'Joint pain', 'Abdominal pain', 'Skin discoloration'],
        treatments: ['Regular phlebotomy', 'Iron chelation', 'Dietary modifications'],
        pathogenicVariants: [],
        associatedSNPs: ['rs1800562', 'rs1799945'],
        prevalence: { 'european': '1 in 200', 'general': '1 in 300' },
        clinicalSignificance: 'definitive',
        severity: 'moderate',
        recommendations: ['Serum ferritin monitoring', 'Regular phlebotomy if needed'],
        resources: [
          { title: 'Iron Disorders Institute', url: 'https://www.irondisorders.org', type: 'website' },
        ],
        category: 'Metabolic',
        ageOfOnset: 'Adulthood',
        prenatalTestingAvailable: false,
        newbornScreeningAvailable: false,
      },
      status: 'carrier',
      variantsFound: [{ id: 'H63D', name: 'p.His63Asp', pathogenicGenotypes: ['CT', 'TT'], rsid: 'rs1799945' }],
      userGenotypes: [{ rsid: 'rs1799945', genotype: 'CT' }],
      explanation: 'You carry one copy of the H63D variant. As a carrier, you have a slightly increased risk of mild iron overload but typically do not develop hemochromatosis.',
      riskToOffspring: 'low',
      riskExplanation: 'Risk to children is low unless your partner carries a hemochromatosis variant.',
      recommendations: ['Monitor iron levels periodically', 'Discuss with physician if symptoms develop'],
      resources: [],
      analyzedAt: new Date(),
      counselingRecommended: false,
      urgency: 'low',
    },
    {
      condition: {
        id: 'gaucher',
        name: 'Gaucher Disease',
        gene: 'GBA',
        geneFullName: 'Glucosylceramidase Beta',
        inheritance: 'autosomal_recessive' as InheritancePattern,
        description: 'Gaucher disease is an inherited disorder that affects many of the body\'s organs and tissues.',
        symptoms: ['Enlarged liver and spleen', 'Bone pain', 'Low blood counts', 'Fatigue'],
        treatments: ['Enzyme replacement therapy', 'Substrate reduction therapy', 'Bone marrow transplant'],
        pathogenicVariants: [],
        associatedSNPs: ['rs76763715'],
        prevalence: { 'ashkenazi': '1 in 15', 'general': '1 in 100' },
        clinicalSignificance: 'definitive',
        severity: 'high',
        recommendations: ['Genetic counseling', 'Enzyme level testing', 'Bone density monitoring'],
        resources: [
          { title: 'Gaucher Foundation', url: 'https://www.gaucherdisease.org', type: 'website' },
        ],
        category: 'Metabolic',
        ageOfOnset: 'Variable',
        prenatalTestingAvailable: true,
        newbornScreeningAvailable: false,
      },
      status: 'uncertain',
      variantsFound: [{ id: 'N370S', name: 'p.Asn370Ser', pathogenicGenotypes: ['CT', 'TT'] }],
      userGenotypes: [{ rsid: 'rs76763715', genotype: 'CT' }],
      explanation: 'A variant of uncertain significance was detected. This variant may or may not affect carrier status. Further testing may be needed.',
      riskToOffspring: 'moderate',
      riskExplanation: 'Due to the uncertain nature of this finding, genetic counseling is recommended to discuss implications.',
      recommendations: ['Genetic counseling', 'Consider confirmatory testing'],
      resources: [],
      analyzedAt: new Date(),
      counselingRecommended: true,
      urgency: 'moderate',
    },
  ];
  
  // Add more mock results to reach the summary count
  for (let i = 0; i < 282; i++) {
    conditions.push({
      condition: {
        id: `condition-${i}`,
        name: `Genetic Condition ${i + 1}`,
        gene: `GENE${i}`,
        inheritance: 'autosomal_recessive' as InheritancePattern,
        description: 'A genetic condition that can be passed to offspring.',
        symptoms: ['Symptom 1', 'Symptom 2'],
        treatments: ['Treatment 1'],
        pathogenicVariants: [],
        associatedSNPs: [],
        prevalence: { general: '1 in 1000' },
        clinicalSignificance: 'limited',
        severity: 'low',
        recommendations: ['No action needed'],
        resources: [],
        category: 'Other',
        prenatalTestingAvailable: false,
        newbornScreeningAvailable: false,
      },
      status: 'not_carrier',
      variantsFound: [],
      userGenotypes: [],
      explanation: 'No pathogenic variants detected. You are not a carrier for this condition.',
      riskToOffspring: 'negligible',
      riskExplanation: 'No increased risk to offspring.',
      recommendations: ['No action needed'],
      resources: [],
      analyzedAt: new Date(),
      counselingRecommended: false,
      urgency: 'none',
    });
  }
  
  return conditions;
};

export const Route = createFileRoute('/carrier/$id')({
  component: CarrierReportPage,
});

function CarrierReportPage() {
  const { id } = Route.useParams();
  const [report, setReport] = useState<CarrierReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<CarrierStatus | 'all'>('all');
  const [inheritanceFilter, setInheritanceFilter] = useState<InheritancePattern | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'name' | 'status'>('severity');
  const [showFilters, setShowFilters] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      // In production, this would be an API call
      // const response = await fetch(`/api/carrier-reports/${id}`);
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockResults = generateMockResults();
      setReport({
        ...mockCarrierReport,
        id,
        results: mockResults,
        criticalFindings: mockResults.filter(r => r.status === 'affected' || r.condition.severity === 'critical'),
        counselingRecommended: mockResults.filter(r => r.counselingRecommended),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort results
  const filteredResults = useMemo(() => {
    if (!report) return [];
    
    let results = [...report.results];
    
    // Apply filters
    if (statusFilter !== 'all') {
      results = results.filter(r => r.status === statusFilter);
    }
    if (inheritanceFilter !== 'all') {
      results = results.filter(r => r.condition.inheritance === inheritanceFilter);
    }
    if (severityFilter !== 'all') {
      results = results.filter(r => r.condition.severity === severityFilter);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      if (sortBy === 'severity') {
        const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
        if (severityOrder[a.condition.severity] !== severityOrder[b.condition.severity]) {
          return severityOrder[a.condition.severity] - severityOrder[b.condition.severity];
        }
      }
      if (sortBy === 'name') {
        return a.condition.name.localeCompare(b.condition.name);
      }
      if (sortBy === 'status') {
        const statusOrder = { affected: 0, carrier: 1, uncertain: 2, not_tested: 3, not_carrier: 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });
    
    return results;
  }, [report, statusFilter, inheritanceFilter, severityFilter, sortBy]);

  const handleDownloadPDF = () => {
    // In production, this would generate a PDF
    alert('PDF download functionality will be implemented. This would generate a medical-grade carrier screening report.');
  };

  const handleShareWithPartner = () => {
    setShareModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Your Carrier Status</h2>
            <p className="text-slate-600 max-w-md mx-auto">
              Screening your genetic data for carrier conditions...
              This may take 1-2 minutes.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Report</h2>
            <p className="text-slate-600 mb-4">{error || 'Report could not be loaded'}</p>
            <Link
              to="/carrier"
              className="text-blue-700 hover:text-blue-800 font-medium"
            >
              Back to Carrier Screening
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const hasPositiveFindings = report.summary.carrierCount > 0 || report.summary.affectedCount > 0;
  const needsCounseling = report.counselingRecommended.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={predefinedBreadcrumbs.carrier(report?.condition)} />
        </div>
        
        {/* Prominent Medical Disclaimer - Top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert variant="warning" className="border-2 border-amber-300">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Important Medical Disclaimer</p>
                <p className="text-sm text-amber-800 mt-1">
                  This carrier screening report is for educational purposes only and is not a substitute 
                  for professional medical advice, diagnosis, or treatment. Always consult with a qualified 
                  healthcare provider or genetic counselor about your results. This analysis may not detect 
                  all disease-causing variants. A negative result does not completely eliminate the risk 
                  of being a carrier. Results should be interpreted in the context of your personal and 
                  family medical history.
                </p>
              </div>
            </div>
          </Alert>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/genomes"
            className="inline-flex items-center text-sm text-slate-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Genomes
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Dna className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Carrier Status Report</h1>
                <p className="text-slate-600">
                  {report.summary.totalConditionsTested} conditions tested • Generated {report.generatedAt.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download PDF</span>
              </Button>
              <Button
                onClick={handleShareWithPartner}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share with Partner</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Genetic Counseling CTA */}
        {needsCounseling && (
          <div className="mb-8">
            <GeneticCounselingCTA results={report.results} variant="full" />
          </div>
        )}

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <CarrierReportSummary 
            report={report} 
            onFilterByStatus={(status) => {
              setStatusFilter(status as CarrierStatus);
              window.scrollTo({ top: 600, behavior: 'smooth' });
            }}
          />
        </motion.div>

        {/* Critical Findings Alert */}
        {hasPositiveFindings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-2">
                      {report.summary.carrierCount > 0 && `${report.summary.carrierCount} Carrier Finding${report.summary.carrierCount > 1 ? 's' : ''} Detected`}
                      {report.summary.carrierCount > 0 && report.summary.affectedCount > 0 && ' • '}
                      {report.summary.affectedCount > 0 && `${report.summary.affectedCount} Condition${report.summary.affectedCount > 1 ? 's' : ''} Requiring Medical Attention`}
                    </h3>
                    <p className="text-red-700 mb-4">
                      Please review your results carefully and consider consulting with a genetic 
                      counselor or healthcare provider to understand the implications for you and your family.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => window.open('https://www.nsgc.org/find-a-genetic-counselor', '_blank')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Find Genetic Counselor
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setStatusFilter('carrier')}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        View Carrier Results
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 lg:w-auto w-full justify-center"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(statusFilter !== 'all' || inheritanceFilter !== 'all' || severityFilter !== 'all') && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Active
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

              {/* Active Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    Status: {statusFilter.replace('_', ' ')}
                    <button onClick={() => setStatusFilter('all')} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {inheritanceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    Inheritance: {inheritanceFilter.replace(/_/g, ' ')}
                    <button onClick={() => setInheritanceFilter('all')} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {severityFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    Severity: {severityFilter}
                    <button onClick={() => setSeverityFilter('all')} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="lg:ml-auto flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="severity">Severity (High to Low)</option>
                  <option value="status">Status (Risk Level)</option>
                  <option value="name">Condition Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Carrier Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as CarrierStatus | 'all')}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="carrier">Carrier</option>
                        <option value="not_carrier">Not a Carrier</option>
                        <option value="affected">Affected</option>
                        <option value="uncertain">Uncertain</option>
                      </select>
                    </div>

                    {/* Inheritance Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Inheritance Pattern
                      </label>
                      <select
                        value={inheritanceFilter}
                        onChange={(e) => setInheritanceFilter(e.target.value as InheritancePattern | 'all')}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Patterns</option>
                        <option value="autosomal_recessive">Autosomal Recessive</option>
                        <option value="autosomal_dominant">Autosomal Dominant</option>
                        <option value="x_linked_recessive">X-Linked Recessive</option>
                        <option value="x_linked_dominant">X-Linked Dominant</option>
                        <option value="mitochondrial">Mitochondrial</option>
                      </select>
                    </div>

                    {/* Severity Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Severity Level
                      </label>
                      <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="moderate">Moderate</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(statusFilter !== 'all' || inheritanceFilter !== 'all' || severityFilter !== 'all') && (
                    <div className="pt-4 mt-4 border-t border-slate-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStatusFilter('all');
                          setInheritanceFilter('all');
                          setSeverityFilter('all');
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-slate-600">
          Showing {filteredResults.length} of {report.summary.totalConditionsTested} conditions
        </div>

        {/* Results List */}
        <div className="space-y-6">
          {filteredResults.slice(0, 50).map((result, index) => (
            <CarrierStatusCard
              key={result.condition.id}
              result={result}
              index={index}
              showDetailed={result.counselingRecommended}
            />
          ))}
          
          {filteredResults.length > 50 && (
            <div className="text-center py-8">
              <p className="text-slate-500">
                {filteredResults.length - 50} more results not displayed. 
                Use filters to narrow down results.
              </p>
            </div>
          )}
          
          {filteredResults.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Results Match Your Filters</h3>
              <p className="text-slate-600 mb-4">Try adjusting your filter criteria to see more results.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('all');
                  setInheritanceFilter('all');
                  setSeverityFilter('all');
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Educational Resources Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Educational Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Understanding Carrier Screening',
                    description: 'Learn the basics of genetic carrier screening and what your results mean.',
                    url: 'https://www.genome.gov/about-genomics/fact-sheets/Genetic-Counseling-Fact-Sheet',
                    icon: Info,
                  },
                  {
                    title: 'Family Planning with Genetics',
                    description: 'Information about reproductive options for carrier couples.',
                    url: 'https://www.acog.org/womens-health/faqs/carrier-screening',
                    icon: Baby,
                  },
                  {
                    title: 'Find a Genetic Counselor',
                    description: 'Search for certified genetic counselors in your area.',
                    url: 'https://www.nsgc.org/find-a-genetic-counselor',
                    icon: Users,
                  },
                  {
                    title: 'Genetic Privacy Guide',
                    description: 'Learn about GINA and your rights regarding genetic information.',
                    url: 'https://www.genome.gov/about-genomics/policy-issues/Genetic-Discrimination',
                    icon: Shield,
                  },
                  {
                    title: 'Support Groups',
                    description: 'Connect with others who have similar genetic conditions.',
                    url: 'https://www.geneticalliance.org',
                    icon: Heart,
                  },
                  {
                    title: 'Medical Literature',
                    description: 'Access peer-reviewed research on genetic conditions.',
                    url: 'https://pubmed.ncbi.nlm.nih.gov',
                    icon: FileText,
                  },
                ].map((resource) => (
                  <a
                    key={resource.title}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 p-4 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                      <resource.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1">
                        {resource.title}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">{resource.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Final Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-amber-50 border-2 border-amber-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Medical Disclaimer</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                This carrier screening report is provided for educational and informational purposes only. 
                It is not intended to diagnose, treat, or replace professional medical advice. The results 
                presented are based on the genetic data provided and our current understanding of genetic 
                variants. Not all disease-causing variants may be detected. A negative result does not 
                completely eliminate the risk of being a carrier. Always consult with a qualified healthcare 
                provider or board-certified genetic counselor before making any medical decisions. Genetic 
                testing has limitations and results should be interpreted in the context of your personal 
                and family medical history. If you have concerns about your results, please seek professional 
                medical guidance.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <ShareModal onClose={() => setShareModalOpen(false)} report={report} />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Share Modal Component
 */
function ShareModal({ onClose, report }: { onClose: () => void; report: CarrierReport }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    // In production, this would send an invitation
    setShared(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Share with Partner</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg" aria-label="Close">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {shared ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <p className="text-slate-900 font-medium">Invitation Sent!</p>
            <p className="text-sm text-slate-600 mt-1">
              Your partner will receive an email with instructions to view your carrier report.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Partner&apos;s Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I wanted to share my carrier screening results with you..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <Alert variant="info" className="mb-4">
              <p className="text-sm">
                Your partner will need to create an account to view your report. 
                They will only see your carrier screening results, not your full genetic data.
              </p>
            </Alert>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleShare} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!email}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default CarrierReportPage;
