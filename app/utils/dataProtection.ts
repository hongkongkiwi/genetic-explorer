/**
 * Global Data Protection Compliance
 * 
 * Supports GDPR (EU), CCPA/CPRA (California), LGPD (Brazil), PIPEDA (Canada),
 * POPIA (South Africa), Australian Privacy Act, PIPL (China), APPI (Japan),
 * and DPDP (India).
 */

export type Jurisdiction = 
  | 'GDPR'      // EU/EEA/UK
  | 'CCPA'      // California
  | 'LGPD'      // Brazil
  | 'PIPEDA'    // Canada
  | 'POPIA'     // South Africa
  | 'AU_PRIVACY' // Australia
  | 'PIPL'      // China
  | 'APPI'      // Japan
  | 'DPDP'      // India
  | 'OTHER';

export type DataSubjectRight =
  | 'ACCESS'           // Right to access personal data
  | 'RECTIFICATION'    // Right to correct inaccurate data
  | 'ERASURE'          // Right to be forgotten
  | 'PORTABILITY'      // Right to data portability
  | 'RESTRICTION'      // Right to restrict processing
  | 'OBJECTION'        // Right to object to processing
  | 'AUTOMATED_DECISION' // Right regarding automated decision-making
  | 'CONSENT_WITHDRAWAL' // Right to withdraw consent
  | 'NON_DISCRIMINATION' // CCPA specific
  | 'SALE_OPT_OUT';    // CCPA specific - opt out of data sale

interface DataSubjectRequest {
  id: string;
  userId: string;
  jurisdiction: Jurisdiction;
  right: DataSubjectRight;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requestDate: Date;
  completionDate?: Date;
  deadlineDate: Date;
  rejectionReason?: string;
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'ADDITIONAL_INFO_REQUIRED';
  requestDetails?: Record<string, any>;
  responseData?: any;
}

interface RetentionPolicy {
  dataType: string;
  retentionPeriod: string;
  legalBasis: string;
  jurisdiction: Jurisdiction[];
  autoDelete: boolean;
  extensionConditions?: string[];
}

interface ConsentRecord {
  id: string;
  userId: string;
  purpose: string;
  legalBasis: 'CONSENT' | 'CONTRACT' | 'LEGAL_OBLIGATION' | 'VITAL_INTERESTS' | 'PUBLIC_TASK' | 'LEGITIMATE_INTERESTS';
  granted: boolean;
  grantedAt?: Date;
  withdrawnAt?: Date;
  version: string;
  jurisdiction: Jurisdiction;
  mechanism: 'CLICKWRAP' | 'SIGNATURE' | 'VERBAL' | 'IMPLIED';
  ipAddress?: string;
  userAgent?: string;
}

interface ProcessingRecord {
  id: string;
  activity: string;
  purposes: string[];
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retentionPeriod: string;
  securityMeasures: string[];
  legalBasis: string;
  dpiaRequired: boolean;
  dpiaCompleted?: boolean;
  crossBorderTransfer: boolean;
  safeguards?: string;
}

// ============================================================================
// Jurisdiction-Specific Configurations
// ============================================================================

export const JURISDICTION_CONFIG: Record<Jurisdiction, {
  name: string;
  responseTimeDays: number;
  extensionDays: number;
  requiresDPO: boolean;
  dpoThreshold?: number;
  requiresRecordsOfProcessing: boolean;
  ropaThreshold?: number;
  specialCategories: string[];
  crossBorderTransferMechanism: string[];
}> = {
  GDPR: {
    name: 'General Data Protection Regulation (EU/EEA/UK)',
    responseTimeDays: 30,
    extensionDays: 60,
    requiresDPO: true,
    dpoThreshold: 1, // Always required for genetic data
    requiresRecordsOfProcessing: true,
    ropaThreshold: 250, // Employees, or if processing is not occasional
    specialCategories: ['genetic', 'health', 'biometric', 'racial', 'ethnic'],
    crossBorderTransferMechanism: ['SCC', 'BCR', 'ADEQUACY_DECISION', 'DEROGATION'],
  },
  CCPA: {
    name: 'California Consumer Privacy Act / CPRA',
    responseTimeDays: 45,
    extensionDays: 90,
    requiresDPO: false,
    requiresRecordsOfProcessing: true,
    specialCategories: ['genetic', 'health', 'biometric', 'precise_geolocation'],
    crossBorderTransferMechanism: ['NOTICE_AT_COLLECTION', 'SERVICE_PROVIDER_AGREEMENT'],
  },
  LGPD: {
    name: 'Lei Geral de Proteção de Dados (Brazil)',
    responseTimeDays: 15,
    extensionDays: 15,
    requiresDPO: true,
    requiresRecordsOfProcessing: true,
    specialCategories: ['genetic', 'health', 'biometric', 'racial', 'ethnic'],
    crossBorderTransferMechanism: ['ADEQUACY_DECISION', 'SCC', 'BCR', 'CONSENT'],
  },
  PIPEDA: {
    name: 'Personal Information Protection and Electronic Documents Act (Canada)',
    responseTimeDays: 30,
    extensionDays: 30,
    requiresDPO: false,
    requiresRecordsOfProcessing: true,
    specialCategories: ['health', 'biometric', 'financial'],
    crossBorderTransferMechanism: ['CONSENT', 'SIMILAR_PROTECTION'],
  },
  POPIA: {
    name: 'Protection of Personal Information Act (South Africa)',
    responseTimeDays: 30,
    extensionDays: 30,
    requiresDPO: true,
    requiresRecordsOfProcessing: true,
    specialCategories: ['health', 'biometric', 'religious', 'political'],
    crossBorderTransferMechanism: ['ADEQUACY', 'SCC', 'CONSENT', 'BINDING_CORPORATE_RULES'],
  },
  AU_PRIVACY: {
    name: 'Privacy Act (Australia)',
    responseTimeDays: 30,
    extensionDays: 30,
    requiresDPO: false,
    requiresRecordsOfProcessing: true,
    specialCategories: ['health', 'biometric', 'genetic', 'racial'],
    crossBorderTransferMechanism: ['APP_8', 'CONSENT', 'CONTRACT'],
  },
  PIPL: {
    name: 'Personal Information Protection Law (China)',
    responseTimeDays: 15,
    extensionDays: 15,
    requiresDPO: true,
    requiresRecordsOfProcessing: true,
    specialCategories: ['biometric', 'religious', 'specific_identity', 'medical_health', 'financial', 'location_tracking'],
    crossBorderTransferMechanism: ['SECURITY_ASSESSMENT', 'CERTIFICATION', 'SCC'],
  },
  APPI: {
    name: 'Act on the Protection of Personal Information (Japan)',
    responseTimeDays: 30,
    extensionDays: 30,
    requiresDPO: false,
    requiresRecordsOfProcessing: true,
    specialCategories: ['race', 'creed', 'social_status', 'medical_history', 'criminal_record'],
    crossBorderTransferMechanism: ['CONSENT', 'ADEQUACY', 'SCC'],
  },
  DPDP: {
    name: 'Digital Personal Data Protection Act (India)',
    responseTimeDays: 30,
    extensionDays: 30,
    requiresDPO: true,
    requiresRecordsOfProcessing: true,
    specialCategories: ['biometric', 'genetic', 'health', 'religious', 'political'],
    crossBorderTransferMechanism: ['ADEQUACY_DECISION', 'SCC', 'CERTIFICATION'],
  },
  OTHER: {
    name: 'Other Jurisdictions',
    responseTimeDays: 30,
    extensionDays: 30,
    requiresDPO: false,
    requiresRecordsOfProcessing: false,
    specialCategories: [],
    crossBorderTransferMechanism: ['SCC'],
  },
};

// ============================================================================
// Data Retention Policies
// ============================================================================

export const RETENTION_POLICIES: RetentionPolicy[] = [
  {
    dataType: 'genetic_data',
    retentionPeriod: 'until_account_deletion',
    legalBasis: 'user_consent',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA', 'POPIA', 'AU_PRIVACY', 'PIPL', 'APPI', 'DPDP'],
    autoDelete: false,
    extensionConditions: ['legal_hold', 'ongoing_research_consent'],
  },
  {
    dataType: 'account_data',
    retentionPeriod: 'until_account_deletion_plus_30_days',
    legalBasis: 'contract_performance',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA', 'POPIA', 'AU_PRIVACY', 'PIPL', 'APPI', 'DPDP'],
    autoDelete: true,
    extensionConditions: ['legal_obligation', 'tax_requirements'],
  },
  {
    dataType: 'activity_logs',
    retentionPeriod: '90_days',
    legalBasis: 'legitimate_interest_security',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA', 'POPIA', 'AU_PRIVACY', 'PIPL', 'APPI', 'DPDP'],
    autoDelete: true,
    extensionConditions: ['security_incident_investigation'],
  },
  {
    dataType: 'backup_data',
    retentionPeriod: '30_days_after_deletion',
    legalBasis: 'disaster_recovery',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA', 'POPIA', 'AU_PRIVACY', 'PIPL', 'APPI', 'DPDP'],
    autoDelete: true,
  },
  {
    dataType: 'consent_records',
    retentionPeriod: 'until_account_deletion_plus_7_years',
    legalBasis: 'legal_obligation',
    jurisdiction: ['GDPR', 'LGPD', 'PIPEDA'],
    autoDelete: false,
    extensionConditions: ['regulatory_investigation'],
  },
  {
    dataType: 'marketing_data',
    retentionPeriod: '2_years_or_until_consent_withdrawal',
    legalBasis: 'consent',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD'],
    autoDelete: true,
  },
  {
    dataType: 'failed_login_attempts',
    retentionPeriod: '30_days',
    legalBasis: 'legitimate_interest_security',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA'],
    autoDelete: true,
  },
  {
    dataType: 'deletion_requests',
    retentionPeriod: '7_years',
    legalBasis: 'legal_obligation',
    jurisdiction: ['GDPR', 'LGPD'],
    autoDelete: false,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get response deadline for a data subject request
 */
export function getResponseDeadline(jurisdiction: Jurisdiction, requestDate: Date): Date {
  const config = JURISDICTION_CONFIG[jurisdiction];
  const deadline = new Date(requestDate);
  deadline.setDate(deadline.getDate() + config.responseTimeDays);
  return deadline;
}

/**
 * Check if request is overdue
 */
export function isRequestOverdue(request: DataSubjectRequest): boolean {
  return new Date() > request.deadlineDate && request.status !== 'COMPLETED';
}

/**
 * Get retention period for data type
 */
export function getRetentionPeriod(dataType: string, jurisdiction?: Jurisdiction): string {
  const policy = RETENTION_POLICIES.find(p => 
    p.dataType === dataType && 
    (!jurisdiction || p.jurisdiction.includes(jurisdiction))
  );
  return policy?.retentionPeriod || 'until_account_deletion';
}

/**
 * Check if data type requires special handling
 */
export function isSpecialCategory(dataType: string, jurisdiction: Jurisdiction): boolean {
  const config = JURISDICTION_CONFIG[jurisdiction];
  return config.specialCategories.includes(dataType.toLowerCase());
}

/**
 * Get applicable jurisdictions based on user location
 */
export function getApplicableJurisdictions(userLocation: {
  country: string;
  region?: string;
}): Jurisdiction[] {
  const jurisdictions: Jurisdiction[] = [];
  
  // EU/EEA countries
  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'CH', 'UK'];
  
  if (euCountries.includes(userLocation.country)) {
    jurisdictions.push('GDPR');
  }
  
  // California
  if (userLocation.country === 'US' && userLocation.region === 'CA') {
    jurisdictions.push('CCPA');
  }
  
  // Brazil
  if (userLocation.country === 'BR') {
    jurisdictions.push('LGPD');
  }
  
  // Canada
  if (userLocation.country === 'CA') {
    jurisdictions.push('PIPEDA');
  }
  
  // South Africa
  if (userLocation.country === 'ZA') {
    jurisdictions.push('POPIA');
  }
  
  // Australia
  if (userLocation.country === 'AU') {
    jurisdictions.push('AU_PRIVACY');
  }
  
  // China
  if (userLocation.country === 'CN') {
    jurisdictions.push('PIPL');
  }
  
  // Japan
  if (userLocation.country === 'JP') {
    jurisdictions.push('APPI');
  }
  
  // India
  if (userLocation.country === 'IN') {
    jurisdictions.push('DPDP');
  }
  
  return jurisdictions.length > 0 ? jurisdictions : ['OTHER'];
}

/**
 * Format retention period for display
 */
export function formatRetentionPeriod(period: string): string {
  const formats: Record<string, string> = {
    'until_account_deletion': 'Until you delete your account',
    'until_account_deletion_plus_30_days': '30 days after account deletion',
    'until_account_deletion_plus_7_years': '7 years after account deletion (legal requirement)',
    '90_days': '90 days',
    '30_days': '30 days',
    '30_days_after_deletion': '30 days after data deletion',
    '2_years_or_until_consent_withdrawal': '2 years or until you withdraw consent',
    '7_years': '7 years (legal requirement)',
  };
  return formats[period] || period;
}

export default {
  JURISDICTION_CONFIG,
  RETENTION_POLICIES,
  getResponseDeadline,
  isRequestOverdue,
  getRetentionPeriod,
  isSpecialCategory,
  getApplicableJurisdictions,
  formatRetentionPeriod,
};
