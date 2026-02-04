/**
 * Terms and Privacy Policy Management
 * 
 * This module handles:
 * - Version tracking for Terms of Service and Privacy Policy
 * - User acceptance tracking
 * - Requiring re-acceptance when terms change
 */

import { getDb } from '~/db';

// Current version numbers - increment these when terms change
export const CURRENT_TERMS_VERSION = '1.0.0';
export const CURRENT_PRIVACY_VERSION = '1.0.0';

// Terms change history for audit purposes
interface TermsChange {
  version: string;
  effectiveDate: string;
  changes: string[];
}

export const TERMS_CHANGE_HISTORY: TermsChange[] = [
  {
    version: '1.0.0',
    effectiveDate: '2024-01-01',
    changes: ['Initial release of Terms of Service'],
  },
];

export const PRIVACY_CHANGE_HISTORY: TermsChange[] = [
  {
    version: '1.0.0',
    effectiveDate: '2024-01-01',
    changes: ['Initial release of Privacy Policy'],
  },
];

export interface UserTermsAcceptance {
  userId: string;
  termsVersion: string;
  privacyVersion: string;
  acceptedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface TermsStatus {
  hasAcceptedCurrentTerms: boolean;
  hasAcceptedCurrentPrivacy: boolean;
  currentTermsVersion: string;
  currentPrivacyVersion: string;
  userTermsVersion?: string;
  userPrivacyVersion?: string;
  acceptedAt?: string;
  requiresReacceptance: boolean;
}

/**
 * Initialize terms acceptance tables in the database
 */
export function initTermsTables(): void {
  const db = getDb();

  // Table for tracking terms versions
  db.exec(`
    CREATE TABLE IF NOT EXISTS terms_versions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('terms', 'privacy')),
      version TEXT NOT NULL,
      content TEXT NOT NULL,
      effective_date DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(type, version)
    )
  `);

  // Table for tracking user acceptances
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_terms_acceptances (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      terms_version TEXT NOT NULL,
      privacy_version TEXT NOT NULL,
      accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id)
    )
  `);

  // Table for tracking acceptance history (audit trail)
  db.exec(`
    CREATE TABLE IF NOT EXISTS terms_acceptance_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      terms_version TEXT NOT NULL,
      privacy_version TEXT NOT NULL,
      accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_user_terms_acceptances_user_id ON user_terms_acceptances(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_terms_acceptance_history_user_id ON terms_acceptance_history(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_terms_versions_type ON terms_versions(type)`);

  // Insert current versions if they don't exist
  const insertVersion = db.prepare(`
    INSERT OR IGNORE INTO terms_versions (id, type, version, content, effective_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  const termsContent = getTermsContent();
  const privacyContent = getPrivacyContent();

  insertVersion.run(
    `terms-${CURRENT_TERMS_VERSION}`,
    'terms',
    CURRENT_TERMS_VERSION,
    termsContent,
    TERMS_CHANGE_HISTORY[0].effectiveDate
  );

  insertVersion.run(
    `privacy-${CURRENT_PRIVACY_VERSION}`,
    'privacy',
    CURRENT_PRIVACY_VERSION,
    privacyContent,
    PRIVACY_CHANGE_HISTORY[0].effectiveDate
  );
}

/**
 * Get the current terms of service content
 */
function getTermsContent(): string {
  return JSON.stringify({
    title: 'Terms of Service',
    version: CURRENT_TERMS_VERSION,
    sections: [
      {
        title: '1. Acceptance of Terms',
        content: 'By accessing and using Genetic Explorer, you agree to be bound by these Terms of Service.'
      },
      {
        title: '2. Description of Service',
        content: 'Genetic Explorer provides AI-powered genetic analysis tools for educational and research purposes.'
      },
      {
        title: '3. User Accounts',
        content: 'You are responsible for maintaining the confidentiality of your account credentials.'
      },
      {
        title: '4. Acceptable Use',
        content: 'You agree not to misuse the service or attempt to access data belonging to other users.'
      },
      {
        title: '5. Data Ownership',
        content: 'You retain ownership of your genetic data. We do not sell your data to third parties.'
      },
      {
        title: '6. Disclaimer',
        content: 'This service is for educational and research purposes only. Not for medical diagnosis.'
      }
    ]
  });
}

/**
 * Get the current privacy policy content
 */
function getPrivacyContent(): string {
  return JSON.stringify({
    title: 'Privacy Policy',
    version: CURRENT_PRIVACY_VERSION,
    sections: [
      {
        title: '1. Information We Collect',
        content: 'We collect your email, genetic data, and usage information to provide our services.'
      },
      {
        title: '2. How We Use Your Data',
        content: 'Your data is used to provide genetic analysis and improve our services.'
      },
      {
        title: '3. Data Security',
        content: 'We use encryption and security best practices to protect your data.'
      },
      {
        title: '4. Data Sharing',
        content: 'We do not sell your data. Data is only shared with your explicit consent.'
      },
      {
        title: '5. Your Rights',
        content: 'You have the right to access, export, or delete your data at any time.'
      },
      {
        title: '6. Retention',
        content: 'We retain your data until you delete your account or request deletion.'
      }
    ]
  });
}

/**
 * Record user acceptance of terms and privacy policy
 */
export function acceptTerms(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): { success: boolean; error?: string } {
  try {
    const db = getDb();
    const crypto = require('crypto');

    // Check if user has already accepted
    const existing = db.prepare(`
      SELECT id FROM user_terms_acceptances WHERE user_id = ?
    `).get(userId) as { id: string } | undefined;

    const now = new Date().toISOString();

    if (existing) {
      // Update existing acceptance
      db.prepare(`
        UPDATE user_terms_acceptances 
        SET terms_version = ?, privacy_version = ?, accepted_at = ?, ip_address = ?, user_agent = ?
        WHERE user_id = ?
      `).run(CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION, now, ipAddress || null, userAgent || null, userId);
    } else {
      // Insert new acceptance
      db.prepare(`
        INSERT INTO user_terms_acceptances (id, user_id, terms_version, privacy_version, accepted_at, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        crypto.randomUUID(),
        userId,
        CURRENT_TERMS_VERSION,
        CURRENT_PRIVACY_VERSION,
        now,
        ipAddress || null,
        userAgent || null
      );
    }

    // Record in history for audit
    db.prepare(`
      INSERT INTO terms_acceptance_history (id, user_id, terms_version, privacy_version, accepted_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      userId,
      CURRENT_TERMS_VERSION,
      CURRENT_PRIVACY_VERSION,
      now,
      ipAddress || null,
      userAgent || null
    );

    return { success: true };
  } catch (error) {
    console.error('Error accepting terms:', error);
    return { success: false, error: 'Failed to record terms acceptance' };
  }
}

/**
 * Check if a user has accepted the current terms
 */
export function getUserTermsStatus(userId: string): TermsStatus {
  try {
    const db = getDb();

    const acceptance = db.prepare(`
      SELECT terms_version, privacy_version, accepted_at 
      FROM user_terms_acceptances 
      WHERE user_id = ?
    `).get(userId) as {
      terms_version: string;
      privacy_version: string;
      accepted_at: string;
    } | undefined;

    const hasAcceptedCurrentTerms = acceptance?.terms_version === CURRENT_TERMS_VERSION;
    const hasAcceptedCurrentPrivacy = acceptance?.privacy_version === CURRENT_PRIVACY_VERSION;

    return {
      hasAcceptedCurrentTerms,
      hasAcceptedCurrentPrivacy,
      currentTermsVersion: CURRENT_TERMS_VERSION,
      currentPrivacyVersion: CURRENT_PRIVACY_VERSION,
      userTermsVersion: acceptance?.terms_version,
      userPrivacyVersion: acceptance?.privacy_version,
      acceptedAt: acceptance?.accepted_at,
      requiresReacceptance: !hasAcceptedCurrentTerms || !hasAcceptedCurrentPrivacy,
    };
  } catch (error) {
    console.error('Error getting user terms status:', error);
    return {
      hasAcceptedCurrentTerms: false,
      hasAcceptedCurrentPrivacy: false,
      currentTermsVersion: CURRENT_TERMS_VERSION,
      currentPrivacyVersion: CURRENT_PRIVACY_VERSION,
      requiresReacceptance: true,
    };
  }
}

/**
 * Check if a user needs to re-accept terms before logging in
 */
export function userRequiresTermsAcceptance(userId: string): boolean {
  const status = getUserTermsStatus(userId);
  return status.requiresReacceptance;
}

/**
 * Get the current terms content for display
 */
export function getCurrentTerms(): {
  version: string;
  effectiveDate: string;
  sections: Array<{ title: string; content: string }>;
  changeHistory: TermsChange[];
} {
  const content = JSON.parse(getTermsContent());
  return {
    version: content.version,
    effectiveDate: TERMS_CHANGE_HISTORY[0].effectiveDate,
    sections: content.sections,
    changeHistory: TERMS_CHANGE_HISTORY,
  };
}

/**
 * Get the current privacy policy content for display
 */
export function getCurrentPrivacy(): {
  version: string;
  effectiveDate: string;
  sections: Array<{ title: string; content: string }>;
  changeHistory: TermsChange[];
} {
  const content = JSON.parse(getPrivacyContent());
  return {
    version: content.version,
    effectiveDate: PRIVACY_CHANGE_HISTORY[0].effectiveDate,
    sections: content.sections,
    changeHistory: PRIVACY_CHANGE_HISTORY,
  };
}

/**
 * Get both terms and privacy for the acceptance page
 */
export function getTermsAndPrivacy(): {
  terms: ReturnType<typeof getCurrentTerms>;
  privacy: ReturnType<typeof getCurrentPrivacy>;
} {
  return {
    terms: getCurrentTerms(),
    privacy: getCurrentPrivacy(),
  };
}

/**
 * Add a new version of terms or privacy policy (admin function)
 */
export function addNewVersion(
  type: 'terms' | 'privacy',
  version: string,
  content: string,
  changes: string[],
  effectiveDate?: string
): { success: boolean; error?: string } {
  try {
    const db = getDb();
    const crypto = require('crypto');

    const effective = effectiveDate || new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO terms_versions (id, type, version, content, effective_date)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      type,
      version,
      content,
      effective
    );

    // Add to change history
    if (type === 'terms') {
      TERMS_CHANGE_HISTORY.unshift({ version, effectiveDate: effective, changes });
    } else {
      PRIVACY_CHANGE_HISTORY.unshift({ version, effectiveDate: effective, changes });
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding new version:', error);
    return { success: false, error: 'Failed to add new version' };
  }
}

/**
 * Get all versions of terms or privacy policy
 */
export function getVersionHistory(type: 'terms' | 'privacy'): Array<{
  version: string;
  effectiveDate: string;
  createdAt: string;
}> {
  try {
    const db = getDb();

    const versions = db.prepare(`
      SELECT version, effective_date, created_at
      FROM terms_versions
      WHERE type = ?
      ORDER BY effective_date DESC
    `).all(type) as Array<{
      version: string;
      effective_date: string;
      created_at: string;
    }>;

    return versions.map(v => ({
      version: v.version,
      effectiveDate: v.effective_date,
      createdAt: v.created_at,
    }));
  } catch (error) {
    console.error('Error getting version history:', error);
    return [];
  }
}
