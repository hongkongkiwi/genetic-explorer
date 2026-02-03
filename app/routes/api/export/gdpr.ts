/**
 * GDPR Data Export API
 * 
 * Provides comprehensive data export for user data portability (GDPR Article 20)
 * Exports all user data in machine-readable format (JSON)
 */

import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { requireAuth } from '~/middleware/auth';
import {
  getUser,
  getUserSessions,
  getUserActivity,
  getHealthReport,
  getAncestryReport,
  getMyShares,
  listGenomes,
} from '~/utils/database';

export const APIRoute = createAPIFileRoute('/api/export/gdpr')({
  GET: requireAuth(async ({ request }) => {
    try {
      const userId = (request as any).user?.id;
      
      if (!userId) {
        return json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Collect all user data
      const user = await getUser(userId);
      if (!user) {
        return json({ error: 'User not found' }, { status: 404 });
      }

      // Get all related data
      const [
        sessions,
        activityLogs,
        genomes,
        myShares,
      ] = await Promise.all([
        getUserSessions(userId),
        getUserActivity(userId, { limit: 1000 }),
        listGenomes(userId),
        getMyShares(userId),
      ]);

      // Get all reports for each genome
      const genomeData = await Promise.all(
        genomes.map(async (genome) => {
          const healthReport = await getHealthReport(genome.id);
          const ancestryReport = await getAncestryReport(genome.id);
          
          return {
            genome: {
              id: genome.id,
              filename: genome.filename,
              uploadDate: genome.uploadDate,
              assembly: genome.assembly,
              fileSize: genome.fileSize,
              status: genome.status,
              // Note: We don't include raw genetic data for privacy/security
              // It can be downloaded separately if needed
            },
            reports: {
              health: healthReport ? {
                id: healthReport.id,
                generatedAt: healthReport.generatedAt,
                summary: healthReport.summary,
                executiveSummary: healthReport.executiveSummary,
                keyFindings: healthReport.keyFindings,
                diseaseRisks: healthReport.diseaseRisks,
                actionableProtocol: healthReport.actionableProtocol,
                sections: healthReport.sections,
              } : null,
              ancestry: ancestryReport ? {
                id: ancestryReport.id,
                generatedAt: ancestryReport.generatedAt,
                ethnicityEstimate: ancestryReport.ethnicityEstimate,
                migrationPaths: ancestryReport.migrationPaths,
                ancientConnections: ancestryReport.ancientConnections,
                neanderthalPercent: ancestryReport.neanderthalPercent,
                dnaRelatives: ancestryReport.dnaRelatives?.map(r => ({
                  id: r.id,
                  relationship: r.relationship,
                  sharedCm: r.sharedCm,
                  sharedSegments: r.sharedSegments,
                  confidence: r.confidence,
                })),
              } : null,
            },
          };
        })
      );

      // Build comprehensive export
      const exportData = {
        exportMetadata: {
          version: '1.0',
          exportDate: new Date().toISOString(),
          format: 'GDPR Article 20 Data Portability',
          description: 'Complete export of your personal data from Genetic Explorer',
        },
        userProfile: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: user.profile,
          preferences: user.preferences,
        },
        security: {
          twoFactorEnabled: user.twoFactorSecret !== null,
          passkeyEnabled: user.passkeyId !== null,
          connectedAccounts: user.connectedAccounts?.map(a => ({
            provider: a.provider,
            connectedAt: a.connectedAt,
          })),
        },
        sessions: sessions.map(s => ({
          id: s.id,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          userAgent: s.userAgent,
          ipAddress: s.ipAddress,
          isCurrent: s.isCurrent,
        })),
        activityLogs: activityLogs.map(log => ({
          action: log.action,
          timestamp: log.timestamp,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          metadata: log.metadata,
        })),
        geneticData: {
          genomes: genomeData,
          totalGenomes: genomes.length,
        },
        sharingPermissions: myShares.map(p => ({
          id: p.id,
          genomeId: p.genomeId,
          sharedWithEmail: p.sharedWithEmail,
          permissionLevel: p.permissionLevel,
          createdAt: p.createdAt,
          expiresAt: p.expiresAt,
        })),
        dataUsage: {
          purposes: [
            'Genetic analysis and health insights',
            'Ancestry and ethnicity estimation',
            'DNA relative matching',
            'Research participation (if opted in)',
            'Account security and fraud prevention',
          ],
          thirdParties: [
            'No genetic data is shared with third parties without explicit consent',
            'Secure cloud hosting providers (AWS/GCP)',
            'Analytics services (anonymized usage data only)',
          ],
          retention: {
            geneticData: 'Until account deletion',
            logs: '90 days',
            backups: '30 days after deletion',
          },
        },
      };

      // Set headers for file download
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.set(
        'Content-Disposition',
        `attachment; filename="gdpr-export-${user.id}-${new Date().toISOString().split('T')[0]}.json"`
      );

      return json(exportData, { headers });
    } catch (error) {
      console.error('GDPR export error:', error);
      return json(
        { error: 'Failed to generate data export' },
        { status: 500 }
      );
    }
  }),
});

