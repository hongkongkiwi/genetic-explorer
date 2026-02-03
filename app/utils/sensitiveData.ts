/**
 * Sensitive Data Protection System
 *
 * Features:
 * - Hide sensitive/genetic markers until user agrees to disclaimer
 * - User preference for showing sensitive information
 * - Sharing controls for different data sensitivity levels
 */

import { getDb } from './database';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Sensitivity Categories
// ============================================================================

export type SensitivityLevel = 'normal' | 'sensitive' | 'highly_sensitive';

export interface SensitivityCategory {
  id: string;
  name: string;
  description: string;
  level: SensitivityLevel;
  examples: string[];
  requiresDisclaimer: boolean;
}

export const SENSITIVITY_CATEGORIES: SensitivityCategory[] = [
  {
    id: 'carrier',
    name: 'Carrier Status',
    description: 'Indicates if you carry genetic variants for certain conditions',
    level: 'sensitive',
    examples: ['Cystic fibrosis carrier', 'Sickle cell trait'],
    requiresDisclaimer: true,
  },
  {
    id: 'psychiatric',
    name: 'Psychiatric/Behavioral',
    description: 'Variants associated with mental health conditions',
    level: 'highly_sensitive',
    examples: ['Schizophrenia risk', 'Bipolar disorder markers'],
    requiresDisclaimer: true,
  },
  {
    id: 'neurodegenerative',
    name: 'Neurodegenerative',
    description: 'Variants associated with progressive neurological conditions',
    level: 'highly_sensitive',
    examples: ['Alzheimer\'s risk', 'Parkinson\'s markers'],
    requiresDisclaimer: true,
  },
  {
    id: 'pharmacogenomics',
    name: 'Pharmacogenomic',
    description: 'Drug metabolism and response variants',
    level: 'normal',
    examples: ['CYP2D6 metabolism', 'Warfarin sensitivity'],
    requiresDisclaimer: false,
  },
  {
    id: 'cancer_risk',
    name: 'Cancer Risk',
    description: 'Variants associated with increased cancer risk',
    level: 'highly_sensitive',
    examples: ['BRCA1/2', 'Lynch syndrome'],
    requiresDisclaimer: true,
  },
  {
    id: 'metabolic',
    name: 'Metabolic',
    description: 'Variants affecting metabolism and nutrition',
    level: 'normal',
    examples: ['Lactose tolerance', 'Caffeine metabolism'],
    requiresDisclaimer: false,
  },
];

// ============================================================================
// User Preferences
// ============================================================================

export interface SensitiveDataSettings {
  showSensitiveData: boolean;
  disclaimerAgreedAt: string | null;
  defaultShareLevel: SensitivityLevel;
  confirmBeforeViewingSensitive: boolean;
}

export function getSensitiveDataSettings(userId: string): SensitiveDataSettings {
  const db = getDb();

  const settings = db.prepare(`
    SELECT
      show_sensitive_data as showSensitiveData,
      disclaimer_agreed_at as disclaimerAgreedAt,
      default_share_level as defaultShareLevel,
      confirm_before_viewing as confirmBeforeViewingSensitive
    FROM user_privacy_settings
    WHERE user_id = ?
  `).get(userId) as any;

  if (!settings) {
    // Default settings
    return {
      showSensitiveData: false,
      disclaimerAgreedAt: null,
      defaultShareLevel: 'normal',
      confirmBeforeViewingSensitive: true,
    };
  }

  return {
    showSensitiveData: settings.showSensitiveData === 1,
    disclaimerAgreedAt: settings.disclaimerAgreedAt,
    defaultShareLevel: (settings.defaultShareLevel as SensitivityLevel) || 'normal',
    confirmBeforeViewingSensitive: settings.confirmBeforeViewingSensitive === 1,
  };
}

export function saveSensitiveDataSettings(
  userId: string,
  settings: Partial<SensitiveDataSettings>
): void {
  const db = getDb();
  const now = new Date().toISOString();

  // Check if settings exist
  const existing = db.prepare(`
    SELECT user_id FROM user_privacy_settings WHERE user_id = ?
  `).get(userId);

  if (existing) {
    // Update
    const updates: string[] = [];
    const values: any[] = [];

    if (settings.showSensitiveData !== undefined) {
      updates.push('show_sensitive_data = ?');
      values.push(settings.showSensitiveData ? 1 : 0);
    }
    if (settings.defaultShareLevel !== undefined) {
      updates.push('default_share_level = ?');
      values.push(settings.defaultShareLevel);
    }
    if (settings.confirmBeforeViewingSensitive !== undefined) {
      updates.push('confirm_before_viewing = ?');
      values.push(settings.confirmBeforeViewingSensitive ? 1 : 0);
    }

    if (updates.length > 0) {
      values.push(userId);
      db.prepare(`
        UPDATE user_privacy_settings
        SET ${updates.join(', ')}, updated_at = ?
        WHERE user_id = ?
      `).run(...values);
    }
  } else {
    // Insert
    db.prepare(`
      INSERT INTO user_privacy_settings (
        user_id, show_sensitive_data, disclaimer_agreed_at,
        default_share_level, confirm_before_viewing, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      settings.showSensitiveData ? 1 : 0,
      settings.disclaimerAgreedAt || null,
      settings.defaultShareLevel || 'normal',
      settings.confirmBeforeViewingSensitive ? 1 : 0,
      now,
      now
    );
  }
}

/**
 * Agree to the sensitive data disclaimer
 */
export function agreeToDisclaimer(userId: string): void {
  const db = getDb();
  const now = new Date().toISOString();

  const existing = db.prepare(`
    SELECT user_id FROM user_privacy_settings WHERE user_id = ?
  `).get(userId);

  if (existing) {
    db.prepare(`
      UPDATE user_privacy_settings
      SET disclaimer_agreed_at = ?, show_sensitive_data = 1, updated_at = ?
      WHERE user_id = ?
    `).run(now, now, userId);
  } else {
    db.prepare(`
      INSERT INTO user_privacy_settings (
        user_id, show_sensitive_data, disclaimer_agreed_at,
        default_share_level, confirm_before_viewing, created_at, updated_at
      ) VALUES (?, 1, ?, 'normal', 1, ?, ?)
    `).run(userId, now, now, now);
  }
}

/**
 * Revoke disclaimer agreement (hide sensitive data)
 */
export function revokeDisclaimer(userId: string): void {
  const db = getDb();

  db.prepare(`
    UPDATE user_privacy_settings
    SET show_sensitive_data = 0, updated_at = ?
    WHERE user_id = ?
  `).run(new Date().toISOString(), userId);
}

// ============================================================================
// Share Level Control
// ============================================================================

export interface ShareLevel {
  level: SensitivityLevel;
  name: string;
  description: string;
  includes: SensitivityLevel[];
}

export const SHARE_LEVELS: ShareLevel[] = [
  {
    level: 'normal',
    name: 'Normal Only',
    description: 'Share only non-sensitive genetic information',
    includes: ['normal'],
  },
  {
    level: 'sensitive',
    name: 'Normal + Sensitive',
    description: 'Share normal and carrier status information',
    includes: ['normal', 'sensitive'],
  },
  {
    level: 'highly_sensitive',
    name: 'All Information',
    description: 'Share all genetic information including high-risk markers',
    includes: ['normal', 'sensitive', 'highly_sensitive'],
  },
];

export function canViewSensitivityLevel(
  userId: string,
  requiredLevel: SensitivityLevel
): boolean {
  const settings = getSensitiveDataSettings(userId);

  if (!settings.showSensitiveData) {
    return false;
  }

  const levelOrder: SensitivityLevel[] = ['normal', 'sensitive', 'highly_sensitive'];
  const userLevelIndex = levelOrder.indexOf(settings.defaultShareLevel);
  const requiredIndex = levelOrder.indexOf(requiredLevel);

  return userLevelIndex >= requiredIndex;
}

// ============================================================================
// Data Filtering
// ============================================================================

export interface FilteredSNP {
  rsid: string;
  gene: string;
  genotype: string;
  category: string;
  sensitivityLevel: SensitivityLevel;
  isHidden: boolean;
  reason?: string;
}

export function filterSNPsBySensitivity(
  snps: Array<{ rsid: string; gene: string; genotype: string; category: string }>,
  userId: string,
  viewingOwnData: boolean = true
): FilteredSNP[] {
  const settings = getSensitiveDataSettings(userId);
  const canViewAll = viewingOwnData || settings.showSensitiveData;

  return snps.map((snp) => {
    const category = SENSITIVITY_CATEGORIES.find((c) =>
      c.examples.some((e) =>
        snp.gene.toLowerCase().includes(e.toLowerCase()) ||
        snp.rsid.toLowerCase().includes(e.toLowerCase())
      )
    );

    const sensitivityLevel = category?.level || 'normal';
    const isHidden = category?.requiresDisclaimer && !canViewAll;

    return {
      rsid: snp.rsid,
      gene: snp.gene,
      genotype: snp.genotype,
      category: snp.category,
      sensitivityLevel,
      isHidden,
      reason: isHidden
        ? `This ${sensitivityLevel} information requires acknowledgment of the data sensitivity disclaimer.`
        : undefined,
    };
  });
}

// ============================================================================
// Disclaimer Content
// ============================================================================

export const SENSITIVE_DATA_DISCLAIMER = `
## Genetic Information Disclaimer

Before viewing sensitive genetic information, please read and understand the following:

### What is Sensitive Genetic Information?
Some genetic variants are classified as sensitive because they may:
- Indicate increased risk for serious health conditions
- Reveal carrier status for hereditary disorders
- Have implications for family members
- Affect insurance or employment considerations

### Important Considerations

1. **Risk ≠ Diagnosis**: Having a risk variant does not mean you will develop a condition.
2. **Context matters**: Most genetic risk variants have modest effects and interact with lifestyle and environment.
3. **Consult professionals**: Discuss concerning results with genetic counselors or healthcare providers.
4. **Family implications**: Genetic information may have implications for biological relatives.
5. **Mental health**: Some users may find this information distressing.

### Recommendations
- Consider viewing with a support person present
- Take breaks if needed
- Focus on actionable information
- Consult with qualified healthcare providers

### Your Control
- You can choose to hide sensitive information at any time
- Sharing settings allow you to control what others can see
- These settings can be changed in Privacy settings
`;

// ============================================================================
// Settings UI Schema
// ============================================================================

export interface PrivacySettingsSchema {
  showSensitiveData: {
    type: 'boolean';
    label: 'Show Sensitive Information';
    description: 'Display genetic variants that may be distressing or have serious health implications';
    requiresReload: boolean;
  };
  confirmBeforeViewing: {
    type: 'boolean';
    label: 'Confirm Before Viewing';
    description: 'Show a reminder each time you access sensitive information';
    default: true;
  };
  defaultShareLevel: {
    type: 'enum';
    label: 'Default Share Level';
    description: 'What information to share when granting access to your data';
    options: Array<{
      value: SensitivityLevel;
      label: string;
      description: string;
    }>;
  };
}

export function getPrivacySettingsSchema(): PrivacySettingsSchema {
  return {
    showSensitiveData: {
      type: 'boolean',
      label: 'Show Sensitive Information',
      description: 'Display genetic variants that may be distressing or have serious health implications',
      requiresReload: true,
    },
    confirmBeforeViewing: {
      type: 'boolean',
      label: 'Confirm Before Viewing',
      description: 'Show a reminder each time you access sensitive information',
      default: true,
    },
    defaultShareLevel: {
      type: 'enum',
      label: 'Default Share Level',
      description: 'What information to share when granting access to your data',
      options: SHARE_LEVELS.map((sl) => ({
        value: sl.level,
        label: sl.name,
        description: sl.description,
      })),
    },
  };
}

export default {
  SENSITIVITY_CATEGORIES,
  SENSITIVE_DATA_DISCLAIMER,
  SHARE_LEVELS,
  getSensitiveDataSettings,
  saveSensitiveDataSettings,
  agreeToDisclaimer,
  revokeDisclaimer,
  canViewSensitivityLevel,
  filterSNPsBySensitivity,
  getPrivacySettingsSchema,
};
