import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getGenome, canAccessGenome, logActivity } from '~/utils/database';
import { 
  analyzeCarrierStatus, 
  generateCarrierReport,
  calculateCombinedRisk,
  getCarrierResultsSummary 
} from '~/utils/carrierAnalysis';
import { requireAuth } from '~/utils/auth';
import { rateLimitByUser, createRateLimitHeaders } from '~/utils/rateLimit';
import type { PartnerCarrierResult } from '~/types/carrier';

export const APIRoute = createAPIFileRoute('/api/carrier/$id')({
  GET: async ({ params, request }) => {
    try {
      // Check authentication
      const auth = requireAuth(request);
      if (!auth) {
        return json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Apply rate limiting
      const rateLimit = rateLimitByUser(auth.id, 30, 60 * 1000); // 30 requests per minute
      if (!rateLimit.allowed) {
        return json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit) }
        );
      }

      // Check access to genome
      const access = canAccessGenome(auth.id, params.id);
      if (!access.canAccess) {
        return json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      // Get genome data
      const genome = getGenome(params.id);
      if (!genome) {
        return json(
          { success: false, error: 'Genome not found' },
          { status: 404 }
        );
      }

      // Perform carrier analysis
      const results = analyzeCarrierStatus(genome);
      const summary = getCarrierResultsSummary(results);

      // Generate full report
      const report = generateCarrierReport(genome, auth.id);

      // Log activity
      logActivity(auth.id, 'carrier_analysis', 'genome', params.id, {
        carrierCount: summary.byStatus['carrier'] || 0,
        affectedCount: summary.byStatus['affected'] || 0,
        requiresAttention: summary.requiresAttention,
      });

      return json({
        success: true,
        report: {
          id: report.id,
          generatedAt: report.generatedAt,
          summary: {
            totalConditionsTested: report.summary.totalConditionsTested,
            carrierCount: report.summary.carrierCount,
            affectedCount: report.summary.affectedCount,
            uncertainCount: report.summary.uncertainCount,
            notCarrierCount: report.summary.notCarrierCount,
            highRiskConditions: report.summary.highRiskConditions,
            moderateRiskConditions: report.summary.moderateRiskConditions,
            conditionsByCategory: report.summary.conditionsByCategory,
          },
          criticalFindings: report.criticalFindings.map(r => ({
            conditionId: r.condition.id,
            conditionName: r.condition.name,
            gene: r.condition.gene,
            status: r.status,
            severity: r.condition.severity,
            urgency: r.urgency,
            counselingRecommended: r.counselingRecommended,
          })),
          results: results.map(r => ({
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
        headers: createRateLimitHeaders(rateLimit),
      });
    } catch (error) {
      console.error('Carrier analysis error:', error);
      return json(
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
        return json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Apply rate limiting
      const rateLimit = rateLimitByUser(auth.id, 20, 60 * 1000); // 20 calculations per minute
      if (!rateLimit.allowed) {
        return json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit) }
        );
      }

      // Check access to primary genome
      const access = canAccessGenome(auth.id, params.id);
      if (!access.canAccess) {
        return json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      // Parse request body
      const body = await request.json();
      const { partnerGenomeId, conditionId } = body;

      if (!partnerGenomeId || !conditionId) {
        return json(
          { success: false, error: 'Missing partnerGenomeId or conditionId in request body' },
          { status: 400 }
        );
      }

      // Check access to partner genome
      const partnerAccess = canAccessGenome(auth.id, partnerGenomeId);
      if (!partnerAccess.canAccess) {
        return json(
          { success: false, error: 'Access denied to partner genome' },
          { status: 403 }
        );
      }

      // Get both genomes
      const userGenome = getGenome(params.id);
      const partnerGenome = getGenome(partnerGenomeId);

      if (!userGenome || !partnerGenome) {
        return json(
          { success: false, error: 'One or both genomes not found' },
          { status: 404 }
        );
      }

      // Analyze carrier status for both
      const userResults = analyzeCarrierStatus(userGenome);
      const partnerResults = analyzeCarrierStatus(partnerGenome);

      // Find the specified condition for both
      const userResult = userResults.find(r => r.condition.id === conditionId);
      const partnerResult = partnerResults.find(r => r.condition.id === conditionId);

      if (!userResult) {
        return json(
          { success: false, error: 'Condition not found in user genome analysis' },
          { status: 404 }
        );
      }

      if (!partnerResult) {
        return json(
          { success: false, error: 'Condition not found in partner genome analysis' },
          { status: 404 }
        );
      }

      // Create partner carrier result
      const partnerCarrierResult: PartnerCarrierResult = {
        genomeId: partnerGenomeId,
        isCarrier: partnerResult.status === 'carrier' || partnerResult.status === 'affected',
        variantsFound: partnerResult.variantsFound,
        status: partnerResult.status,
      };

      // Calculate combined risk
      const combinedRisk = calculateCombinedRisk(userResult, partnerCarrierResult);

      // Log activity
      logActivity(auth.id, 'carrier_risk_calculation', 'genome', params.id, {
        partnerGenomeId,
        conditionId,
        childRisk: combinedRisk.childRisk,
      });

      return json({
        success: true,
        riskCalculation: {
          condition: {
            id: combinedRisk.condition.id,
            name: combinedRisk.condition.name,
            gene: combinedRisk.condition.gene,
            inheritance: combinedRisk.condition.inheritance,
          },
          userStatus: combinedRisk.userStatus,
          partnerStatus: combinedRisk.partnerStatus,
          childRisk: combinedRisk.childRisk,
          childRiskPercentage: Math.round(combinedRisk.childRisk * 100),
          explanation: combinedRisk.explanation,
          recommendations: combinedRisk.recommendations,
          prenatalOptions: combinedRisk.prenatalOptions,
        },
      }, {
        headers: createRateLimitHeaders(rateLimit),
      });
    } catch (error) {
      console.error('Combined risk calculation error:', error);
      return json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Risk calculation failed',
        },
        { status: 500 }
      );
    }
  },
});
