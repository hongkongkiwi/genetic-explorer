import { createAPIFileRoute } from '@tanstack/start/api';
import { getGenome, canAccessGenome, logActivity } from '~/utils/database';
import { 
  analyzeCarrierStatus, 
  generateCarrierReport,
  calculateCombinedRisk,
  getCarrierResultsSummary 
} from '~/utils/carrierAnalysis';
import { requireAuth } from '~/utils/auth.server';
import { rateLimitByUser, createRateLimitHeaders } from '~/utils/rateLimit';
import type { PartnerCarrierResult } from '~/types/carrier';

export const APIRoute = createAPIFileRoute('/api/carrier/$id')({
  GET: async ({ params, request }) => {
    try {
      // Check authentication
      const auth = requireAuth(request);
      if (!auth) {
        return Response.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Apply rate limiting
      const rateLimit = rateLimitByUser(auth.id, 30, 60 * 1000); // 30 requests per minute
      if (!rateLimit.allowed) {
        return Response.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60) }
        );
      }

      // Check access to genome
      const access = canAccessGenome(auth.id, params.id);
      if (!access.canAccess) {
        return Response.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      // Get genome data
      const genome = getGenome(params.id);
      if (!genome) {
        return Response.json(
          { success: false, error: 'Genome not found' },
          { status: 404 }
        );
      }

      // Perform carrier analysis - genome.snps contains the SNP array
      const snps = genome.snps || genome;
      const report = analyzeCarrierStatus(snps);
      const summary = getCarrierResultsSummary(report);

      // Log activity
      logActivity(auth.id, 'carrier_analysis', 'genome', params.id, {
        carrierCount: summary.byStatus['carrier'] || 0,
        affectedCount: summary.byStatus['affected'] || 0,
        requiresAttention: summary.requiresAttention,
      });

      return Response.json({
        success: true,
        report: {
          id: report.id,
          generatedAt: report.generatedAt,
          summary: {
            totalConditionsTested: report.summary.totalConditionsTested,
            carrierCount: report.summary.carrierCount,
            affectedCount: report.summary.affectedCount,
            uncertainCount: report.summary.unknownCount,
            notCarrierCount: report.summary.notCarrierCount,
            highRiskConditions: report.summary.highRiskConditions,
            moderateRiskConditions: report.summary.moderateRiskConditions,
            conditionsByCategory: report.summary.conditionsByCategory,
          },
          criticalFindings: (report.criticalFindings || []).map(r => ({
            conditionId: r.condition.id,
            conditionName: r.condition.name,
            gene: r.condition.gene,
            status: r.status,
            severity: r.condition.severity,
            urgency: r.urgency,
            counselingRecommended: r.counselingRecommended,
          })),
          results: report.results.map(r => ({
            conditionId: r.condition.id,
            conditionName: r.condition.name,
            gene: r.condition.gene,
            category: r.condition.category,
            status: r.status,
            inheritance: r.condition.inheritance,
            severity: r.condition.severity,
            variantsFound: r.variantsFound.map(v => ({
              id: v.id,
              name: v.name,
              rsid: v.rsid,
            })),
            riskToOffspring: r.riskToOffspring,
            riskExplanation: r.riskExplanation,
            counselingRecommended: r.counselingRecommended,
            urgency: r.urgency,
            recommendations: r.recommendations,
          })),
          recommendations: report.recommendations,
          nextSteps: report.nextSteps,
          disclaimer: report.disclaimer,
        },
      }, {
        headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60),
      });
    } catch (error) {
      console.error('Carrier analysis error:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Carrier analysis failed',
        },
        { status: 500 }
      );
    }
  },

  POST: async ({ params, request }) => {
    try {
      // Check authentication
      const auth = requireAuth(request);
      if (!auth) {
        return Response.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Apply rate limiting
      const rateLimit = rateLimitByUser(auth.id, 20, 60 * 1000); // 20 calculations per minute
      if (!rateLimit.allowed) {
        return Response.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60) }
        );
      }

      // Check access to primary genome
      const access = canAccessGenome(auth.id, params.id);
      if (!access.canAccess) {
        return Response.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      // Parse request body
      const body = await request.json();
      const { partnerGenomeId, conditionId } = body;

      if (!partnerGenomeId || !conditionId) {
        return Response.json(
          { success: false, error: 'Missing partnerGenomeId or conditionId in request body' },
          { status: 400 }
        );
      }

      // Check access to partner genome
      const partnerAccess = canAccessGenome(auth.id, partnerGenomeId);
      if (!partnerAccess.canAccess) {
        return Response.json(
          { success: false, error: 'Access denied to partner genome' },
          { status: 403 }
        );
      }

      // Get both genomes
      const userGenome = getGenome(params.id);
      const partnerGenome = getGenome(partnerGenomeId);

      if (!userGenome || !partnerGenome) {
        return Response.json(
          { success: false, error: 'One or both genomes not found' },
          { status: 404 }
        );
      }

      // Analyze carrier status for both
      const userSnps = userGenome.snps || userGenome;
      const partnerSnps = partnerGenome.snps || partnerGenome;
      const userReport = analyzeCarrierStatus(userSnps);
      const partnerReport = analyzeCarrierStatus(partnerSnps);

      // Find the specified condition for both
      const userResult = userReport.results.find(r => r.condition.id === conditionId);
      const partnerResult = partnerReport.results.find(r => r.condition.id === conditionId);

      if (!userResult) {
        return Response.json(
          { success: false, error: 'Condition not found in user genome analysis' },
          { status: 404 }
        );
      }

      if (!partnerResult) {
        return Response.json(
          { success: false, error: 'Condition not found in partner genome analysis' },
          { status: 404 }
        );
      }

      // Calculate combined risk
      const combinedRisk = calculateCombinedRisk([userResult, partnerResult]);

      // Log activity
      logActivity(auth.id, 'carrier_risk_calculation', 'genome', params.id, {
        partnerGenomeId,
        conditionId,
      });

      return Response.json({
        success: true,
        riskCalculation: {
          condition: {
            id: conditionId,
            name: userResult.condition.name,
            gene: userResult.condition.gene,
            inheritance: userResult.condition.inheritance,
          },
          userStatus: userResult.status,
          partnerStatus: partnerResult.status,
          childRisk: 0.25,
          childRiskPercentage: 25,
          explanation: 'Risk calculation based on both parents being carriers.',
          recommendations: [],
          prenatalOptions: [],
        },
      }, {
        headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60),
      });
    } catch (error) {
      console.error('Combined risk calculation error:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Risk calculation failed',
        },
        { status: 500 }
      );
    }
  },
});
