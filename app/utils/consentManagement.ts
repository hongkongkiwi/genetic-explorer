/**
 * Granular Consent Management System
 * 
 * Manages user consent for different processing purposes
 * Required for GDPR, LGPD, and other privacy regulations
 */

import { getDb } from '~/db';
import { v4 as uuidv4 } from 'uuid';

export type ConsentPurpose = 
  | 'CORE_SERVICES'           // Essential for service operation
  | 'GENETIC_ANALYSIS'        // Analyze genetic data
  | 'HEALTH_INSIGHTS'         // Generate health reports
  | 'ANCESTRY_ANALYSIS'       // Ancestry and ethnicity
  | 'RELATIVE_MATCHING'       // DNA relative matching
  | 'RESEARCH_PARTICIPATION'  // Participate in research
  | 'MARKETING'               // Marketing communications
  | 'PRODUCT_UPDATES'         // Product updates and news
  | 'THIRD_PARTY_SHARING'     // Share with third parties
  | 'DATA_RETENTION_EXTENDED' // Keep data longer than default
  | 'AUTOMATED_DECISIONS'     // Allow automated decision-making
  | 'CROSS_BORDER_TRANSFER';  // Transfer data internationally

export type ConsentStatus = 'GRANTED' | 'WITHDRAWN' | 'PENDING' | 'EXPIRED';

interface ConsentPurposeConfig {
  id: ConsentPurpose;
  name: string;
  description: string;
  required: boolean;
  category: 'ESSENTIAL' | 'FUNCTIONAL' | 'ANALYTICS' | 'MARKETING';
  defaultValue: boolean;
  legalBasis: 'CONSENT' | 'LEGITIMATE_INTEREST' | 'CONTRACT' | 'LEGAL_OBLIGATION';
  jurisdiction: string[];
  version: string;
}

interface UserConsent {
  id: string;
  userId: string;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  grantedAt?: string;
  withdrawnAt?: string;
  expiresAt?: string;
  updatedAt?: string;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  mechanism: 'UI' | 'API' | 'IMPORT';
  proofOfConsent?: string; // Hash of consent record for audit
}

// ============================================================================
// Consent Purpose Definitions
// ============================================================================

export const CONSENT_PURPOSES: ConsentPurposeConfig[] = [
  {
    id: 'CORE_SERVICES',
    name: 'Core Services',
    description: 'Essential processing required to provide genetic analysis services, including account management, security, and service delivery.',
    required: true,
    category: 'ESSENTIAL',
    defaultValue: true,
    legalBasis: 'CONTRACT',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA', 'POPIA', 'AU_PRIVACY', 'PIPL', 'APPI', 'DPDP'],
    version: '1.0',
  },
  {
    id: 'GENETIC_ANALYSIS',
    name: 'Genetic Analysis',
    description: 'Process your genetic data to identify variants, traits, and genetic markers.',
    required: true,
    category: 'ESSENTIAL',
    defaultValue: true,
    legalBasis: 'CONTRACT',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA', 'POPIA', 'AU_PRIVACY', 'PIPL', 'APPI', 'DPDP'],
    version: '1.0',
  },
  {
    id: 'HEALTH_INSIGHTS',
    name: 'Health Insights',
    description: 'Generate personalized health reports based on your genetic data, including disease risk assessments.',
    required: false,
    category: 'FUNCTIONAL',
    defaultValue: true,
    legalBasis: 'CONSENT',
    jurisdiction: ['GDPR', 'LGPD', 'PIPEDA', 'POPIA'],
    version: '1.0',
  },
  {
    id: 'ANCESTRY_ANALYSIS',
    name: 'Ancestry Analysis',
    description: 'Analyze your genetic data to determine ethnicity, migration patterns, and ancestral origins.',
    required: false,
    category: 'FUNCTIONAL',
    defaultValue: true,
    legalBasis: 'CONSENT',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA', 'POPIA', 'AU_PRIVACY'],
    version: '1.0',
  },
  {
    id: 'RELATIVE_MATCHING',
    name: 'DNA Relative Matching',
    description: 'Compare your DNA with other users to find genetic relatives and enable connection requests.',
    required: false,
    category: 'FUNCTIONAL',
    defaultValue: false,
    legalBasis: 'CONSENT',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA'],
    version: '1.0',
  },
  {
    id: 'RESEARCH_PARTICIPATION',
    name: 'Research Participation',
    description: 'Allow your anonymized genetic data to be used for scientific research studies. You can withdraw at any time.',
    required: false,
    category: 'ANALYTICS',
    defaultValue: false,
    legalBasis: 'CONSENT',
    jurisdiction: ['GDPR', 'LGPD', 'PIPEDA'],
    version: '1.0',
  },
  {
    id: 'MARKETING',
    name: 'Marketing Communications',
    description: 'Receive promotional emails, special offers, and marketing communications about our services.',
    required: false,
    category: 'MARKETING',
    defaultValue: false,
    legalBasis: 'CONSENT',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA'],
    version: '1.0',
  },
  {
    id: 'PRODUCT_UPDATES',
    name: 'Product Updates',
    description: 'Receive notifications about new features, improvements, and important service updates.',
    required: false,
    category: 'FUNCTIONAL',
    defaultValue: true,
    legalBasis: 'LEGITIMATE_INTEREST',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA', 'POPIA'],
    version: '1.0',
  },
  {
    id: 'THIRD_PARTY_SHARING',
    name: 'Third-Party Sharing',
    description: 'Share your data with carefully vetted third-party partners for additional services (e.g., genetic counseling).',
    required: false,
    category: 'FUNCTIONAL',
    defaultValue: false,
    legalBasis: 'CONSENT',
    jurisdiction: ['GDPR', 'CCPA', 'LGPD'],
    version: '1.0',
  },
  {
    id: 'DATA_RETENTION_EXTENDED',
    name: 'Extended Data Retention',
    description: 'Keep your genetic data for extended periods beyond standard retention for long-term research and improved analysis.',
    required: false,
    category: 'ANALYTICS',
    defaultValue: false,
    legalBasis: 'CONSENT',
    jurisdiction: ['GDPR', 'LGPD'],
    version: '1.0',
  },
  {
    id: 'AUTOMATED_DECISIONS',
    name: 'Automated Decision-Making',
    description: 'Allow automated processing of your genetic data to generate insights and recommendations without human intervention.',
    required: false,
    category: 'FUNCTIONAL',
    defaultValue: true,
    legalBasis: 'CONSENT',
    jurisdiction: ['GDPR', 'LGPD'],
    version: '1.0',
  },
  {
    id: 'CROSS_BORDER_TRANSFER',
    name: 'International Data Transfer',
    description: 'Transfer your data to servers and processing facilities located outside your country of residence.',
    required: true,
    category: 'ESSENTIAL',
    defaultValue: true,
    legalBasis: 'CONTRACT',
    jurisdiction: ['GDPR', 'LGPD', 'PIPL', 'APPI'],
    version: '1.0',
  },
];

// ============================================================================
// Database Functions
// ============================================================================

/**
 * Initialize consent management tables
 */
export function initConsentTables(): void {
  const db = getDb();
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_consents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      purpose TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('GRANTED', 'WITHDRAWN', 'PENDING', 'EXPIRED')),
      granted_at DATETIME,
      withdrawn_at DATETIME,
      expires_at DATETIME,
      version TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      mechanism TEXT NOT NULL,
      proof_of_consent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, purpose)
    )
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_consents_user_id 
    ON user_consents(user_id)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_consents_purpose 
    ON user_consents(purpose)
  `);
  
  // Consent audit log
  db.exec(`
    CREATE TABLE IF NOT EXISTS consent_audit_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      consent_id TEXT NOT NULL,
      action TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT,
      ip_address TEXT,
      user_agent TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

/**
 * Record user consent for a specific purpose
 */
export function recordConsent(
  userId: string,
  purpose: ConsentPurpose,
  granted: boolean,
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    mechanism?: 'UI' | 'API' | 'IMPORT';
  } = {}
): UserConsent {
  initConsentTables();
  
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const purposeConfig = CONSENT_PURPOSES.find(p => p.id === purpose);
  
  if (!purposeConfig) {
    throw new Error(`Unknown consent purpose: ${purpose}`);
  }
  
  const consent: UserConsent = {
    id,
    userId,
    purpose,
    status: granted ? 'GRANTED' : 'WITHDRAWN',
    grantedAt: granted ? now : undefined,
    withdrawnAt: granted ? undefined : now,
    version: purposeConfig.version,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    mechanism: metadata.mechanism || 'UI',
  };
  
  // Calculate proof of consent (hash for audit)
  const consentString = JSON.stringify({
    userId,
    purpose,
    granted,
    version: purposeConfig.version,
    timestamp: now,
  });
  consent.proofOfConsent = require('crypto')
    .createHash('sha256')
    .update(consentString)
    .digest('hex');
  
  // Get previous status for audit
  const previous = db.prepare(`
    SELECT status FROM user_consents WHERE user_id = ? AND purpose = ?
  `).get(userId, purpose) as { status: string } | undefined;
  
  // Insert or update consent
  db.prepare(`
    INSERT INTO user_consents 
    (id, user_id, purpose, status, granted_at, withdrawn_at, version, ip_address, user_agent, mechanism, proof_of_consent, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, purpose) DO UPDATE SET
      status = excluded.status,
      granted_at = excluded.granted_at,
      withdrawn_at = excluded.withdrawn_at,
      version = excluded.version,
      ip_address = excluded.ip_address,
      user_agent = excluded.user_agent,
      mechanism = excluded.mechanism,
      proof_of_consent = excluded.proof_of_consent,
      updated_at = excluded.updated_at
  `).run(
    id,
    userId,
    purpose,
    consent.status,
    consent.grantedAt,
    consent.withdrawnAt,
    consent.version,
    consent.ipAddress,
    consent.userAgent,
    consent.mechanism,
    consent.proofOfConsent,
    now
  );
  
  // Log to audit trail
  db.prepare(`
    INSERT INTO consent_audit_log (id, user_id, consent_id, action, previous_status, new_status, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    userId,
    id,
    granted ? 'GRANT' : 'WITHDRAW',
    previous?.status || 'NEW',
    consent.status,
    metadata.ipAddress,
    metadata.userAgent
  );
  
  return consent;
}

/**
 * Get all consents for a user
 */
export function getUserConsents(userId: string): UserConsent[] {
  initConsentTables();
  
  const db = getDb();
  const consents = db.prepare(`
    SELECT * FROM user_consents WHERE user_id = ?
  `).all(userId) as UserConsent[];
  
  return consents;
}

/**
 * Check if user has granted consent for a specific purpose
 */
export function hasConsent(userId: string, purpose: ConsentPurpose): boolean {
  initConsentTables();
  
  const db = getDb();
  const result = db.prepare(`
    SELECT status FROM user_consents 
    WHERE user_id = ? AND purpose = ?
  `).get(userId, purpose) as { status: ConsentStatus } | undefined;
  
  return result?.status === 'GRANTED';
}

/**
 * Withdraw consent for a specific purpose
 */
export function withdrawConsent(
  userId: string,
  purpose: ConsentPurpose,
  metadata: {
    ipAddress?: string;
    userAgent?: string;
  } = {}
): void {
  initConsentTables();
  
  const db = getDb();
  const now = new Date().toISOString();
  
  // Get current consent
  const current = db.prepare(`
    SELECT id, status FROM user_consents 
    WHERE user_id = ? AND purpose = ?
  `).get(userId, purpose) as { id: string; status: string } | undefined;
  
  if (!current || current.status !== 'GRANTED') {
    return; // Nothing to withdraw
  }
  
  // Update consent
  db.prepare(`
    UPDATE user_consents 
    SET status = 'WITHDRAWN', withdrawn_at = ?, updated_at = ?
    WHERE user_id = ? AND purpose = ?
  `).run(now, now, userId, purpose);
  
  // Log to audit
  db.prepare(`
    INSERT INTO consent_audit_log (id, user_id, consent_id, action, previous_status, new_status, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    userId,
    current.id,
    'WITHDRAW',
    'GRANTED',
    'WITHDRAWN',
    metadata.ipAddress,
    metadata.userAgent
  );
  
  // Handle post-withdrawal actions
  handleConsentWithdrawal(userId, purpose);
}

/**
 * Handle actions required after consent withdrawal
 */
function handleConsentWithdrawal(userId: string, purpose: ConsentPurpose): void {
  const db = getDb();
  
  switch (purpose) {
    case 'MARKETING':
      // Unsubscribe from marketing lists
      console.log(`User ${userId} unsubscribed from marketing`);
      break;
      
    case 'RESEARCH_PARTICIPATION':
      // Remove from active research studies
      console.log(`User ${userId} withdrawn from research participation`);
      break;
      
    case 'RELATIVE_MATCHING':
      // Disable relative matching
      db.prepare(`
        UPDATE relative_matching_preferences 
        SET enabled = 0, updated_at = datetime('now')
        WHERE user_id = ?
      `).run(userId);
      break;
      
    case 'HEALTH_INSIGHTS':
      // Mark health reports as unavailable
      console.log(`User ${userId} withdrawn from health insights`);
      break;
      
    case 'THIRD_PARTY_SHARING':
      // Revoke third-party access
      console.log(`User ${userId} revoked third-party sharing`);
      break;
  }
}

/**
 * Get consent status for all purposes
 */
export function getConsentStatus(userId: string): Array<{
  purpose: ConsentPurpose;
  config: typeof CONSENT_PURPOSES[0];
  granted: boolean;
  canWithdraw: boolean;
  lastUpdated?: string;
}> {
  const userConsents = getUserConsents(userId);
  
  return CONSENT_PURPOSES.map(config => {
    const userConsent = userConsents.find(c => c.purpose === config.id);
    
    return {
      purpose: config.id,
      config,
      granted: userConsent?.status === 'GRANTED' || (!userConsent && config.defaultValue),
      canWithdraw: !config.required,
      lastUpdated: userConsent?.updatedAt,
    };
  });
}

/**
 * Initialize default consents for new user
 */
export function initializeDefaultConsents(
  userId: string,
  metadata: {
    ipAddress?: string;
    userAgent?: string;
  } = {}
): void {
  for (const purpose of CONSENT_PURPOSES) {
    if (purpose.defaultValue) {
      recordConsent(userId, purpose.id, true, metadata);
    }
  }
}

/**
 * Get consent audit trail for a user
 */
export function getConsentAuditTrail(userId: string): Array<{
  action: string;
  purpose: string;
  previousStatus?: string;
  newStatus?: string;
  timestamp: string;
  ipAddress?: string;
}> {
  initConsentTables();
  
  const db = getDb();
  const audit = db.prepare(`
    SELECT 
      cal.action,
      uc.purpose,
      cal.previous_status,
      cal.new_status,
      cal.timestamp,
      cal.ip_address
    FROM consent_audit_log cal
    JOIN user_consents uc ON cal.consent_id = uc.id
    WHERE cal.user_id = ?
    ORDER BY cal.timestamp DESC
  `).all(userId) as Array<{
    action: string;
    purpose: string;
    previous_status: string;
    new_status: string;
    timestamp: string;
    ip_address: string;
  }>;
  
  return audit.map(a => ({
    action: a.action,
    purpose: a.purpose,
    previousStatus: a.previous_status,
    newStatus: a.new_status,
    timestamp: a.timestamp,
    ipAddress: a.ip_address,
  }));
}

/**
 * Verify consent is valid (not expired)
 */
export function isConsentValid(userId: string, purpose: ConsentPurpose): boolean {
  initConsentTables();
  
  const db = getDb();
  const consent = db.prepare(`
    SELECT status, expires_at FROM user_consents 
    WHERE user_id = ? AND purpose = ?
  `).get(userId, purpose) as { status: string; expires_at?: string } | undefined;
  
  if (!consent || consent.status !== 'GRANTED') {
    return false;
  }
  
  // Check expiration
  if (consent.expires_at) {
    return new Date(consent.expires_at) > new Date();
  }
  
  return true;
}

export default {
  CONSENT_PURPOSES,
  recordConsent,
  getUserConsents,
  hasConsent,
  withdrawConsent,
  getConsentStatus,
  initializeDefaultConsents,
  getConsentAuditTrail,
  isConsentValid,
};
