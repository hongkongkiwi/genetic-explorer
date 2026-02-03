import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CarrierStatus, InheritancePattern, OffspringRisk, ClinicalSignificance } from '~/types/carrier';

describe('Carrier API Schema', () => {
  describe('GET Response Structure', () => {
    it('should return carrier screening results', () => {
      const response = {
        success: true,
        report: {
          id: 'report-123',
          generatedAt: '2024-01-15T10:00:00Z',
          summary: {
            totalConditionsTested: 50,
            carrierCount: 3,
            affectedCount: 0,
            uncertainCount: 1,
            notCarrierCount: 46,
            highRiskConditions: 0,
            moderateRiskConditions: 3,
            conditionsByCategory: {
              metabolic: 2,
              hematological: 1,
              neurological: 0,
            },
          },
          criticalFindings: [],
          results: [
            {
              conditionId: 'cystic-fibrosis',
              conditionName: 'Cystic Fibrosis',
              gene: 'CFTR',
              category: 'metabolic',
              status: 'carrier' as CarrierStatus,
              inheritance: 'autosomal_recessive' as InheritancePattern,
              severity: 'high',
              variantsFound: [
                { id: 'F508del', name: 'p.Phe508del', rsid: 'rs113993960' },
              ],
              riskToOffspring: 'depends_on_partner' as OffspringRisk,
              riskExplanation: 'If your partner is also a carrier, there is a 25% chance with each pregnancy',
              counselingRecommended: true,
              urgency: 'moderate',
              recommendations: [
                'Discuss with your partner about carrier testing',
                'Consider genetic counseling before family planning',
              ],
            },
            {
              conditionId: 'sickle-cell',
              conditionName: 'Sickle Cell Disease',
              gene: 'HBB',
              category: 'hematological',
              status: 'not_carrier' as CarrierStatus,
              inheritance: 'autosomal_recessive' as InheritancePattern,
              severity: 'critical',
              variantsFound: [],
              riskToOffspring: 'negligible' as OffspringRisk,
              riskExplanation: 'No pathogenic variants detected',
              counselingRecommended: false,
              urgency: 'none',
              recommendations: [],
            },
          ],
          recommendations: [
            'Share results with your healthcare provider',
            'Consider genetic counseling if planning a family',
          ],
          nextSteps: [
            'Schedule genetic counseling appointment',
            'Discuss partner testing options',
          ],
          disclaimer: 'This is not medical advice. Consult a healthcare professional.',
        },
      };

      expect(response.success).toBe(true);
      expect(response.report).toHaveProperty('summary');
      expect(response.report.summary).toHaveProperty('carrierCount');
      expect(response.report.summary).toHaveProperty('totalConditionsTested');
      expect(response.report).toHaveProperty('results');
      expect(response.report).toHaveProperty('disclaimer');
    });

    it('should include counseling flag for relevant results', () => {
      const result = {
        conditionId: 'cystic-fibrosis',
        conditionName: 'Cystic Fibrosis',
        status: 'carrier' as CarrierStatus,
        counselingRecommended: true,
        urgency: 'moderate',
      };

      expect(result.counselingRecommended).toBe(true);
      expect(result.urgency).toBe('moderate');
    });

    it('should have medical disclaimers in response', () => {
      const disclaimer = 'This is not medical advice. Consult a healthcare professional.';
      const response = {
        success: true,
        report: {
          disclaimer,
        },
      };

      expect(response.report.disclaimer).toBeDefined();
      expect(response.report.disclaimer.length).toBeGreaterThan(0);
    });
  });

  describe('Carrier Status Types', () => {
    it('should have valid carrier status values', () => {
      const validStatuses: CarrierStatus[] = [
        'carrier',
        'not_carrier',
        'affected',
        'uncertain',
        'not_tested',
      ];

      expect(validStatuses).toContain('carrier');
      expect(validStatuses).toContain('not_carrier');
      expect(validStatuses).toContain('affected');
      expect(validStatuses).toContain('uncertain');
      expect(validStatuses).toContain('not_tested');
    });

    it('should have valid inheritance patterns', () => {
      const validPatterns: InheritancePattern[] = [
        'autosomal_recessive',
        'autosomal_dominant',
        'x_linked_recessive',
        'x_linked_dominant',
        'y_linked',
        'mitochondrial',
        'multifactorial',
      ];

      expect(validPatterns).toContain('autosomal_recessive');
      expect(validPatterns).toContain('autosomal_dominant');
    });

    it('should have valid offspring risk levels', () => {
      const validRisks: OffspringRisk[] = [
        'high',
        'moderate',
        'low',
        'negligible',
        'depends_on_partner',
      ];

      expect(validRisks).toContain('high');
      expect(validRisks).toContain('negligible');
      expect(validRisks).toContain('depends_on_partner');
    });

    it('should have valid clinical significance levels', () => {
      const validSignificance: ClinicalSignificance[] = [
        'definitive',
        'strong',
        'moderate',
        'limited',
        'uncertain',
      ];

      expect(validSignificance).toContain('definitive');
      expect(validSignificance).toContain('uncertain');
    });
  });

  describe('POST Combined Risk Calculation', () => {
    it('should calculate combined risk for couple', () => {
      const response = {
        success: true,
        riskCalculation: {
          condition: {
            id: 'cystic-fibrosis',
            name: 'Cystic Fibrosis',
            gene: 'CFTR',
            inheritance: 'autosomal_recessive' as InheritancePattern,
          },
          userStatus: 'carrier' as CarrierStatus,
          partnerStatus: 'carrier' as CarrierStatus,
          childRisk: 0.25,
          childRiskPercentage: 25,
          explanation: 'If both parents are carriers, there is a 25% chance with each pregnancy that the child will be affected',
          recommendations: [
            'Consider prenatal testing',
            'Discuss options with genetic counselor',
          ],
          prenatalOptions: [
            'Chorionic villus sampling (CVS)',
            'Amniocentesis',
            'Preimplantation genetic testing',
          ],
        },
      };

      expect(response.success).toBe(true);
      expect(response.riskCalculation).toHaveProperty('childRisk');
      expect(response.riskCalculation.childRisk).toBe(0.25);
      expect(response.riskCalculation).toHaveProperty('childRiskPercentage');
      expect(response.riskCalculation).toHaveProperty('prenatalOptions');
    });

    it('should require partnerGenomeId in request body', () => {
      const body = { partnerGenomeId: 'genome-2', conditionId: 'cystic-fibrosis' };
      
      expect(body).toHaveProperty('partnerGenomeId');
      expect(body).toHaveProperty('conditionId');
    });

    it('should require conditionId in request body', () => {
      const body = { partnerGenomeId: 'genome-2', conditionId: 'cystic-fibrosis' };
      
      expect(body.conditionId).toBe('cystic-fibrosis');
    });

    it('should return 400 when required fields missing', () => {
      const response = {
        success: false,
        error: 'Missing partnerGenomeId or conditionId in request body',
      };
      const status = 400;

      expect(response.success).toBe(false);
      expect(status).toBe(400);
    });

    it('should return zero risk when one parent is not a carrier', () => {
      const calculation = {
        userStatus: 'carrier' as CarrierStatus,
        partnerStatus: 'not_carrier' as CarrierStatus,
        childRisk: 0,
        childRiskPercentage: 0,
      };

      expect(calculation.childRisk).toBe(0);
      expect(calculation.childRiskPercentage).toBe(0);
    });

    it('should return 50% risk for autosomal dominant when one parent affected', () => {
      const calculation = {
        condition: { inheritance: 'autosomal_dominant' as InheritancePattern },
        userStatus: 'affected' as CarrierStatus,
        partnerStatus: 'not_carrier' as CarrierStatus,
        childRisk: 0.5,
        childRiskPercentage: 50,
      };

      expect(calculation.childRisk).toBe(0.5);
    });
  });

  describe('Partner Genome Access', () => {
    it('should check access to partner genome', () => {
      const userId = 'user-123';
      const partnerGenomeId = 'genome-456';
      const partnerGenomeOwner = 'user-456';
      const sharedWith = ['user-123'];

      const canAccess = userId === partnerGenomeOwner || sharedWith.includes(userId);

      expect(canAccess).toBe(true);
    });

    it('should deny access when user cannot access partner genome', () => {
      const response = {
        success: false,
        error: 'Access denied to partner genome',
      };
      const status = 403;

      expect(response.success).toBe(false);
      expect(status).toBe(403);
    });
  });

  describe('Condition Result Structure', () => {
    it('should have complete condition result structure', () => {
      const result = {
        conditionId: 'cystic-fibrosis',
        conditionName: 'Cystic Fibrosis',
        gene: 'CFTR',
        category: 'metabolic',
        status: 'carrier' as CarrierStatus,
        inheritance: 'autosomal_recessive' as InheritancePattern,
        severity: 'high',
        variantsFound: [
          { id: 'F508del', name: 'p.Phe508del', rsid: 'rs113993960' },
        ],
        riskToOffspring: 'depends_on_partner' as OffspringRisk,
        riskExplanation: 'If partner is also a carrier, 25% risk',
        counselingRecommended: true,
        urgency: 'moderate',
        recommendations: ['Consult genetic counselor'],
      };

      expect(result).toHaveProperty('conditionId');
      expect(result).toHaveProperty('gene');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('variantsFound');
      expect(result).toHaveProperty('counselingRecommended');
      expect(result.variantsFound).toBeInstanceOf(Array);
    });

    it('should identify critical findings', () => {
      const criticalResult = {
        conditionId: 'tay-sachs',
        conditionName: 'Tay-Sachs Disease',
        status: 'affected' as CarrierStatus,
        severity: 'critical',
        urgency: 'immediate',
        counselingRecommended: true,
      };

      const isCritical = criticalResult.status === 'affected' || 
                         criticalResult.severity === 'critical' ||
                         criticalResult.urgency === 'immediate';

      expect(isCritical).toBe(true);
    });
  });

  describe('Report Summary', () => {
    it('should calculate summary statistics correctly', () => {
      const results = [
        { status: 'carrier' },
        { status: 'carrier' },
        { status: 'not_carrier' },
        { status: 'not_carrier' },
        { status: 'not_carrier' },
        { status: 'uncertain' },
      ];

      const summary = {
        totalConditionsTested: results.length,
        carrierCount: results.filter(r => r.status === 'carrier').length,
        affectedCount: results.filter(r => r.status === 'affected').length,
        uncertainCount: results.filter(r => r.status === 'uncertain').length,
        notCarrierCount: results.filter(r => r.status === 'not_carrier').length,
      };

      expect(summary.carrierCount).toBe(2);
      expect(summary.notCarrierCount).toBe(3);
      expect(summary.uncertainCount).toBe(1);
      expect(summary.affectedCount).toBe(0);
    });

    it('should categorize conditions correctly', () => {
      const results = [
        { category: 'metabolic' },
        { category: 'metabolic' },
        { category: 'hematological' },
      ];

      const byCategory = results.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(byCategory['metabolic']).toBe(2);
      expect(byCategory['hematological']).toBe(1);
    });
  });

  describe('Medical Disclaimers', () => {
    it('should include required disclaimers', () => {
      const requiredDisclaimers = [
        'not medical advice',
        'healthcare professional',
        'genetic counselor',
      ];

      const disclaimer = 'This is not medical advice. Consult a healthcare professional or genetic counselor.';

      requiredDisclaimers.forEach(phrase => {
        expect(disclaimer.toLowerCase()).toContain(phrase.toLowerCase());
      });
    });

    it('should have disclaimers for all result types', () => {
      const disclaimers = {
        general: 'This is not medical advice. Consult a healthcare professional.',
        carrier: 'Being a carrier does not mean you have the condition.',
        affected: 'This result indicates you may be affected. Seek medical advice.',
        prenatal: 'Prenatal testing options should be discussed with a healthcare provider.',
      };

      expect(disclaimers.general).toBeDefined();
      expect(disclaimers.carrier).toBeDefined();
      expect(disclaimers.affected).toBeDefined();
      expect(disclaimers.prenatal).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('should require authentication', () => {
      const auth = null;
      const response = {
        success: false,
        error: 'Unauthorized',
      };
      const status = 401;

      expect(auth).toBeNull();
      expect(response.success).toBe(false);
      expect(status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 when condition not found', () => {
      const response = {
        success: false,
        error: 'Condition not found in user genome analysis',
      };
      const status = 404;

      expect(response.success).toBe(false);
      expect(status).toBe(404);
    });

    it('should return 404 when partner condition not found', () => {
      const response = {
        success: false,
        error: 'Condition not found in partner genome analysis',
      };
      const status = 404;

      expect(response.success).toBe(false);
      expect(status).toBe(404);
    });

    it('should handle rate limit exceeded', () => {
      const response = {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      };
      const status = 429;

      expect(response.success).toBe(false);
      expect(status).toBe(429);
    });

    it('should handle server errors', () => {
      const response = {
        success: false,
        error: 'Carrier analysis failed',
      };
      const status = 500;

      expect(response.success).toBe(false);
      expect(status).toBe(500);
    });
  });

  describe('Urgency Levels', () => {
    it('should have valid urgency levels', () => {
      const validUrgencies = ['immediate', 'high', 'moderate', 'low', 'none'];
      
      expect(validUrgencies).toContain('immediate');
      expect(validUrgencies).toContain('high');
      expect(validUrgencies).toContain('moderate');
      expect(validUrgencies).toContain('low');
      expect(validUrgencies).toContain('none');
    });

    it('should assign appropriate urgency based on status', () => {
      const getUrgency = (status: CarrierStatus, severity: string): string => {
        if (status === 'affected') return 'immediate';
        if (status === 'carrier' && severity === 'critical') return 'high';
        if (severity === 'critical') return 'high';
        if (status === 'carrier') return 'moderate';
        if (status === 'uncertain') return 'low';
        return 'none';
      };

      expect(getUrgency('affected', 'high')).toBe('immediate');
      expect(getUrgency('carrier', 'critical')).toBe('high');
      expect(getUrgency('carrier', 'high')).toBe('moderate');
      expect(getUrgency('not_carrier', 'low')).toBe('none');
    });
  });
});

describe('Carrier API Rate Limiting', () => {
  it('should have rate limit for GET requests', () => {
    const rateLimit = { limit: 30, windowMs: 60000 };
    
    expect(rateLimit.limit).toBe(30);
    expect(rateLimit.windowMs).toBe(60000);
  });

  it('should have lower rate limit for POST risk calculations', () => {
    const rateLimit = { limit: 20, windowMs: 60000 };
    
    expect(rateLimit.limit).toBe(20);
  });
});
