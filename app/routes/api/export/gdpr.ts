/**
 * GDPR Data Export API
 * 
 * Provides comprehensive data export for user data portability (GDPR Article 20)
 * Exports all user data in machine-readable format (JSON)
 */

import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth.server';
import {
  getUserById,
  getUserSessions,
  getUserActivity,
  getAncestryResult,
  getMyShares,
  getUserGenomes,
} from '~/utils/database';

export const APIRoute = createAPIFileRoute('/api/export/gdpr')({
  GET: async ({ request }: { request: Request }) => {
    try {
      const auth = requireAuth(request);
      
      if (!auth) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const userId = auth.id;

      // Collect all user data
      const user = getUserById(userId);
      if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }

      // Get all related data
      const [
        sessions,
        activityLogs,
        genomes,
        myShares,
      ] = await Promise.all([
        getUserSessions(userId),
        getUserActivity(userId, 1000),
        getUserGenomes(userId),
        getMyShares(userId),
      ]);

      // Get all reports for each genome
      const genomeData = await Promise.all(
        genomes.map(async (genome) => {
          const ancestryResult = getAncestryResult(genome.id);
          
          return {
            genome: {
              id: genome.id,
              filename: genome.original_filename,
              uploadDate: genome.processed_at,
              assembly: genome.source,
              fileSize: genome.file_size,
              status: genome.status,
            },
            reports: {
              ancestry: ancestryResult || null,
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
          name: user.displayName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        security: {
          twoFactorEnabled: false,
          passkeyEnabled: false,
          connectedAccounts: [],
        },
        sessions: sessions.map((s) => ({
          id: s.id,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          userAgent: (s as unknown as Record<string, unknown>).userAgent,
          ipAddress: (s as unknown as Record<string, unknown>).ipAddress,
        })),
        activityLogs: activityLogs.map((log) => ({
          action: log.action,
          timestamp: (log as Record<string, unknown>).createdAt || new Date().toISOString(),
          metadata: (log as Record<string, unknown>).details,
        })),
        geneticData: {
          genomes: genomeData,
          totalGenomes: genomes.length,
        },
        sharingPermissions: myShares.map((p) => ({
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

      return Response.json(exportData, { headers });
    } catch (error) {
      console.error('GDPR export error:', error);
      return Response.json(
        { error: 'Failed to generate data export' },
        { status: 500 }
      );
    }
  },
});
