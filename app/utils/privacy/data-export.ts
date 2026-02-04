/**
 * GDPR-compliant data export utility
 * Provides complete user data export and deletion functionality
 */

import { getDb } from '~/db';
import JSZip from 'jszip';

interface UserDataExport {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    createdAt: string;
    lastLoginAt: string | null;
    emailVerified: boolean;
  };
  profile: {
    bio: string | null;
    birthDate: string | null;
    sex: string | null;
    ancestry: string | null;
    timezone: string;
    privacySettings: Record<string, unknown>;
    notificationPreferences: Record<string, unknown>;
  } | null;
  genomes: Array<{
    id: string;
    filename: string;
    source: string;
    snpCount: number;
    processedAt: string;
    status: string;
    snps: Array<{
      rsid: string;
      chromosome: string;
      position: number;
      genotype: string;
    }>;
  }>;
  reports: Array<{
    id: string;
    genomeId: string;
    reportType: string;
    generatedAt: string;
    content: Record<string, unknown>;
  }>;
  activityLog: Array<{
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    details: Record<string, unknown> | null;
    createdAt: string;
  }>;
  sharingPermissions: Array<{
    permissionLevel: string;
    status: string;
    createdAt: string;
    sharedWithEmail: string | null;
  }>;
  notifications: Array<{
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
  snpFavorites: Array<{
    rsid: string;
    notes: string | null;
    createdAt: string;
  }>;
  exportMetadata: {
    exportDate: string;
    version: string;
    format: string;
    dataCategories: string[];
  };
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<UserDataExport> {
  const db = getDb();
  
  // Get user basic info
  const user = db.prepare(`
    SELECT id, email, display_name, created_at, last_login_at, email_verified
    FROM users WHERE id = ?
  `).get(userId) as any;

  if (!user) {
    throw new Error('User not found');
  }

  // Get profile
  const profile = db.prepare(`
    SELECT bio, birth_date, sex, ancestry, timezone, 
           privacy_settings, notification_preferences
    FROM profiles WHERE user_id = ?
  `).get(userId) as any;

  // Get genomes with SNPs
  const genomes = db.prepare(`
    SELECT id, filename, source, snp_count, processed_at, status
    FROM genomes WHERE user_id = ?
  `).all(userId) as any[];

  const genomesWithSnps = genomes.map(genome => {
    const snps = db.prepare(`
      SELECT rsid, chromosome, position, genotype
      FROM snps WHERE genome_id = ?
    `).all(genome.id);
    
    return {
      ...genome,
      snps,
    };
  });

  // Get reports
  const reports = db.prepare(`
    SELECT id, genome_id, report_type, generated_at, content
    FROM reports WHERE genome_id IN (
      SELECT id FROM genomes WHERE user_id = ?
    )
  `).all(userId) as any[];

  // Get activity log
  const activityLog = db.prepare(`
    SELECT action, resource_type, resource_id, details, created_at
    FROM activity_log WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as any[];

  // Get sharing permissions
  const sharingPermissions = db.prepare(`
    SELECT permission_level, status, created_at, shared_with_email
    FROM sharing_permissions WHERE owner_id = ?
  `).all(userId) as any[];

  // Get notifications
  const notifications = db.prepare(`
    SELECT type, title, message, is_read, created_at
    FROM notifications WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as any[];

  // Get SNP favorites
  const snpFavorites = db.prepare(`
    SELECT rsid, notes, created_at
    FROM snp_favorites WHERE user_id = ?
  `).all(userId) as any[];

  // Parse JSON fields
  const parsedProfile = profile ? {
    ...profile,
    privacySettings: JSON.parse(profile.privacy_settings || '{}'),
    notificationPreferences: JSON.parse(profile.notification_preferences || '{}'),
  } : null;

  const parsedReports = reports.map(r => ({
    ...r,
    content: JSON.parse(r.content || '{}'),
  }));

  const parsedActivityLog = activityLog.map(a => ({
    ...a,
    details: a.details ? JSON.parse(a.details) : null,
  }));

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      emailVerified: !!user.email_verified,
    },
    profile: parsedProfile,
    genomes: genomesWithSnps,
    reports: parsedReports,
    activityLog: parsedActivityLog,
    sharingPermissions,
    notifications,
    snpFavorites,
    exportMetadata: {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      format: 'json',
      dataCategories: [
        'user_account',
        'profile',
        'genetic_data',
        'reports',
        'activity',
        'sharing',
        'notifications',
        'preferences',
      ],
    },
  };
}

/**
 * Export user data as a ZIP archive
 */
export async function exportUserDataAsZip(userId: string): Promise<Blob> {
  const data = await exportUserData(userId);
  const zip = new JSZip();
  
  // Add main data file
  zip.file('user-data.json', JSON.stringify(data, null, 2));
  
  // Add human-readable README
  zip.file('README.txt', generateReadme(data));
  
  // Add separate files for large datasets
  const genomesFolder = zip.folder('genomes');
  data.genomes.forEach((genome, index) => {
    genomesFolder?.file(
      `genome-${index + 1}-${genome.id}.json`,
      JSON.stringify(genome, null, 2)
    );
    
    // Add SNPs as CSV for easier analysis
    const csv = convertSnpsToCsv(genome.snps);
    genomesFolder?.file(`genome-${index + 1}-snps.csv`, csv);
  });
  
  // Add reports
  const reportsFolder = zip.folder('reports');
  data.reports.forEach((report, index) => {
    reportsFolder?.file(
      `report-${index + 1}-${report.reportType}.json`,
      JSON.stringify(report, null, 2)
    );
  });
  
  // Add activity log as CSV
  zip.file('activity-log.csv', convertActivityToCsv(data.activityLog));
  
  // Add data usage report
  zip.file('data-usage-report.txt', generateDataUsageReport(data));
  
  const content = await zip.generateAsync({ type: 'blob' });
  return content;
}

/**
 * Delete all user data (GDPR "right to be forgotten")
 */
export async function deleteAllUserData(userId: string): Promise<{
  success: boolean;
  deletedItems: Record<string, number>;
  errors: string[];
}> {
  const db = getDb();
  const errors: string[] = [];
  const deletedItems: Record<string, number> = {};
  
  // Use transaction for atomic deletion
  const deleteOperations = [
    { table: 'snp_favorites', name: 'SNP Favorites' },
    { table: 'notifications', name: 'Notifications' },
    { table: 'sharing_permissions', name: 'Sharing Permissions' },
    { table: 'activity_log', name: 'Activity Log' },
    { table: 'reports', name: 'Reports' },
    { table: 'snps', name: 'SNPs', condition: 'genome_id IN (SELECT id FROM genomes WHERE user_id = ?)' },
    { table: 'genomes', name: 'Genomes' },
    { table: 'profiles', name: 'Profile' },
    { table: 'users', name: 'User Account' },
  ];
  
  try {
    db.transaction(() => {
      for (const op of deleteOperations) {
        try {
          let query: string;
          if (op.condition) {
            query = `DELETE FROM ${op.table} WHERE ${op.condition}`;
          } else {
            query = `DELETE FROM ${op.table} WHERE ${op.table === 'sharing_permissions' ? 'owner_id' : 'user_id'} = ?`;
          }
          
          const result = db.prepare(query).run(op.condition ? [userId] : userId);
          deletedItems[op.name] = result.changes;
        } catch (error) {
          errors.push(`Failed to delete ${op.name}: ${error}`);
        }
      }
    })();
    
    return {
      success: errors.length === 0,
      deletedItems,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      deletedItems,
      errors: [...errors, `Transaction failed: ${error}`],
    };
  }
}

/**
 * Generate human-readable README
 */
function generateReadme(data: UserDataExport): string {
  return `Genetic Explorer - Data Export
================================

Export Date: ${data.exportMetadata.exportDate}
Format Version: ${data.exportMetadata.version}

This archive contains all your personal data stored in Genetic Explorer,
exported in compliance with GDPR Article 15 (Right of Access).

CONTENTS
--------
- user-data.json: Complete export in JSON format
- genomes/: Individual genome files and SNP data
- reports/: Generated analysis reports
- activity-log.csv: Account activity history
- data-usage-report.txt: Summary of data usage

DATA CATEGORIES
---------------
${data.exportMetadata.dataCategories.map(cat => `- ${cat}`).join('\n')}

YOUR ACCOUNT
------------
Email: ${data.user.email}
Display Name: ${data.user.displayName || 'Not set'}
Account Created: ${data.user.createdAt}
Last Login: ${data.user.lastLoginAt || 'Never'}

DATA SUMMARY
------------
- Genomes: ${data.genomes.length}
- Reports: ${data.reports.length}
- Activity Entries: ${data.activityLog.length}
- Sharing Permissions: ${data.sharingPermissions.length}
- SNP Favorites: ${data.snpFavorites.length}

QUESTIONS?
----------
Contact: support@geneticexplorer.com

This export is for your personal records. Please keep it secure.
`;
}

/**
 * Convert SNPs to CSV format
 */
function convertSnpsToCsv(snps: Array<{ rsid: string; chromosome: string; position: number; genotype: string }>): string {
  const headers = ['RSID', 'Chromosome', 'Position', 'Genotype'];
  const rows = snps.map(snp => [
    snp.rsid,
    snp.chromosome,
    snp.position,
    snp.genotype,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Convert activity log to CSV
 */
function convertActivityToCsv(activityLog: Array<{
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}>): string {
  const headers = ['Date', 'Action', 'Resource Type', 'Resource ID', 'Details'];
  const rows = activityLog.map(activity => [
    activity.createdAt,
    activity.action,
    activity.resourceType || '',
    activity.resourceId || '',
    JSON.stringify(activity.details) || '',
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Generate data usage report
 */
function generateDataUsageReport(data: UserDataExport): string {
  let totalSnps = 0;
  data.genomes.forEach(g => totalSnps += g.snps.length);
  
  return `Data Usage Report
=================

Generated: ${new Date().toISOString()}

STORAGE BREAKDOWN
-----------------
User Account: ~${estimateSize(data.user)} bytes
Profile: ~${estimateSize(data.profile)} bytes
Genomes: ~${estimateSize(data.genomes)} bytes (${totalSnps} SNPs)
Reports: ~${estimateSize(data.reports)} bytes
Activity Log: ~${estimateSize(data.activityLog)} bytes
Notifications: ~${estimateSize(data.notifications)} bytes
Sharing: ~${estimateSize(data.sharingPermissions)} bytes
Favorites: ~${estimateSize(data.snpFavorites)} bytes

THIRD-PARTY SHARING
-------------------
- OpenAI: Genetic analysis (processed securely)
- Resend/SMTP: Email delivery (optional)

RETENTION PERIODS
-----------------
- Activity Log: 90 days
- Deleted Data: 30 days (soft delete)
- Backups: 30 days

YOUR RIGHTS (GDPR)
------------------
1. Right to Access (this export)
2. Right to Rectification
3. Right to Erasure (delete account)
4. Right to Restrict Processing
5. Right to Data Portability
6. Right to Object

Contact support@geneticexplorer.com for any data-related requests.
`;
}

function estimateSize(data: unknown): number {
  return JSON.stringify(data).length;
}
