/**
 * AI-Powered Genetic Analysis
 * 
 * Uses LLMs to generate personalized insights from genetic data
 */

import { getSNPInfo, COMPREHENSIVE_SNP_DATABASE } from '~/data/comprehensiveSNPs';
import type { SNP, GenomeData, HealthReport } from '~/types/genetics';

// OpenAI API integration (requires OPENAI_API_KEY env var)
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface AIAnalysisInput {
  userSnps: SNP[];
  significantVariants: Array<{
    rsid: string;
    gene: string;
    genotype: string;
    impact: string;
    description: string;
    recommendations: string[];
  }>;
  categories: Record<string, number>;
  drugInteractions: string[];
}

interface AIReportSection {
  title: string;
  content: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actionItems: string[];
}

/**
 * Analyze genetic data using AI
 */
export async function generateAIHealthReport(input: AIAnalysisInput): Promise<{
  executiveSummary: string;
  sections: AIReportSection[];
  personalizedProtocol: {
    supplements: string[];
    diet: string[];
    lifestyle: string[];
    monitoring: string[];
  };
}> {
  // Check if OpenAI API key is available
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set, using fallback analysis');
    return generateFallbackReport(input);
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert genetic counselor and functional medicine practitioner. 
Analyze the user's genetic variants and provide personalized health recommendations.
Be evidence-based, cite specific genes/variants, and provide actionable advice.
Highlight any critical findings that need medical attention.`
          },
          {
            role: 'user',
            content: generatePrompt(input)
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('Empty AI response');
    }

    return parseAIResponse(aiResponse, input);
  } catch (error) {
    console.error('AI analysis failed:', error);
    return generateFallbackReport(input);
  }
}

/**
 * Generate prompt for AI analysis
 */
function generatePrompt(input: AIAnalysisInput): string {
  const variantSummary = input.significantVariants.map(v => 
    `- ${v.rsid} (${v.gene}): ${v.genotype} - ${v.impact} impact. ${v.description}`
  ).join('\n');

  const categorySummary = Object.entries(input.categories)
    .map(([cat, count]) => `- ${cat}: ${count} variants`)
    .join('\n');

  return `Please analyze the following genetic profile and provide a comprehensive health report:

## SIGNIFICANT VARIANTS (${input.significantVariants.length} total):
${variantSummary}

## VARIANTS BY CATEGORY:
${categorySummary}

## DRUG METABOLISM CONSIDERATIONS:
${input.drugInteractions.join(', ') || 'None detected'}

Please provide:
1. An executive summary (2-3 paragraphs)
2. Key health insights organized by category
3. A personalized health protocol with specific recommendations for:
   - Supplements (dosages if known)
   - Diet modifications
   - Lifestyle changes
   - Health monitoring (what to track, how often)
4. Any critical findings requiring medical attention

Format your response in JSON with the following structure:
{
  "executiveSummary": "...",
  "sections": [
    {
      "title": "Category Name",
      "content": "Detailed analysis...",
      "priority": "critical|high|medium|low",
      "actionItems": ["action 1", "action 2"]
    }
  ],
  "personalizedProtocol": {
    "supplements": [...],
    "diet": [...],
    "lifestyle": [...],
    "monitoring": [...]
  }
}`;
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(aiText: string, input: AIAnalysisInput): {
  executiveSummary: string;
  sections: AIReportSection[];
  personalizedProtocol: {
    supplements: string[];
    diet: string[];
    lifestyle: string[];
    monitoring: string[];
  };
} {
  try {
    // Try to extract JSON from response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        executiveSummary: parsed.executiveSummary || generateExecutiveSummary(input),
        sections: parsed.sections || [],
        personalizedProtocol: parsed.personalizedProtocol || generateFallbackProtocol(input),
      };
    }
  } catch {
    // JSON parsing failed, use text-based extraction
  }

  // Fallback: parse text manually
  return {
    executiveSummary: generateExecutiveSummary(input),
    sections: extractSectionsFromText(aiText),
    personalizedProtocol: generateFallbackProtocol(input),
  };
}

/**
 * Generate fallback report when AI is unavailable
 */
function generateFallbackReport(input: AIAnalysisInput) {
  return {
    executiveSummary: generateExecutiveSummary(input),
    sections: generateFallbackSections(input),
    personalizedProtocol: generateFallbackProtocol(input),
  };
}

function generateExecutiveSummary(input: AIAnalysisInput): string {
  const highImpact = input.significantVariants.filter(v => 
    v.impact === 'High' || v.impact === 'Very High'
  );
  
  const criticalGenes = [...new Set(highImpact.map(v => v.gene))];
  
  return `Your genetic analysis identified ${input.significantVariants.length} significant variants across ${Object.keys(input.categories).length} health categories. 

Key findings involve ${criticalGenes.join(', ')}. These variants affect drug metabolism, nutrient processing, disease risk, and fitness potential.

While genetics provide important insights, they represent predispositions rather than certainties. Environmental factors, lifestyle choices, and medical interventions can significantly influence outcomes.`;
}

function generateFallbackSections(input: AIAnalysisInput): AIReportSection[] {
  const sections: AIReportSection[] = [];

  // Drug metabolism section
  const drugVariants = input.significantVariants.filter(v => 
    v.category === 'Drug Metabolism'
  );
  if (drugVariants.length > 0) {
    sections.push({
      title: 'Drug Metabolism',
      content: `You have ${drugVariants.length} variants affecting drug metabolism. Key genes: ${drugVariants.map(v => v.gene).join(', ')}. These may affect how you process medications including pain relievers, antidepressants, and heart medications.`,
      priority: 'high',
      actionItems: [
        'Share this report with your doctor before starting new medications',
        'Ask about pharmacogenomic testing for confirmation',
        'Avoid codeine/tramadol if CYP2D6 poor metabolizer',
      ],
    });
  }

  // Methylation section
  const methylationVariants = input.significantVariants.filter(v => 
    v.category === 'Methylation'
  );
  if (methylationVariants.length > 0) {
    sections.push({
      title: 'Methylation Support',
      content: `MTHFR variants detected affecting folate metabolism. This impacts detoxification, neurotransmitter synthesis, and cardiovascular health.`,
      priority: 'high',
      actionItems: [
        'Use methylfolate (5-MTHF) instead of folic acid',
        'Monitor homocysteine levels annually',
        'Ensure adequate B12 (methylcobalamin)',
      ],
    });
  }

  // Cardiovascular section
  const cardioVariants = input.significantVariants.filter(v => 
    v.category === 'Cardiovascular'
  );
  if (cardioVariants.length > 0) {
    sections.push({
      title: 'Cardiovascular Health',
      content: `Variants in ${cardioVariants.map(v => v.gene).join(', ')} may affect cardiovascular risk. Key considerations include cholesterol metabolism and inflammation.`,
      priority: 'medium',
      actionItems: [
        'Monitor lipid panel annually',
        'Consider Mediterranean diet',
        'Optimize omega-3 intake',
      ],
    });
  }

  return sections;
}

function generateFallbackProtocol(input: AIAnalysisInput): {
  supplements: string[];
  diet: string[];
  lifestyle: string[];
  monitoring: string[];
} {
  const supplements: string[] = [];
  const diet: string[] = [];
  const lifestyle: string[] = [];
  const monitoring: string[] = [];

  // Check for specific variants
  const hasMTHFR = input.significantVariants.some(v => v.gene === 'MTHFR');
  const hasAPOE4 = input.significantVariants.some(v => v.rsid === 'rs429358');
  const hasFTO = input.significantVariants.some(v => v.gene === 'FTO');
  const hasCYP1A2Slow = input.significantVariants.some(v => 
    v.rsid === 'rs762551' && v.genotype === 'AA'
  );

  if (hasMTHFR) {
    supplements.push('Methylfolate (5-MTHF) 400-800mcg daily');
    supplements.push('Methylcobalamin (B12) 1000mcg');
    monitoring.push('Homocysteine levels annually');
  }

  if (hasAPOE4) {
    supplements.push('Omega-3 fish oil 2-3g EPA+DHA daily');
    diet.push('Mediterranean diet (high in olive oil, fish, vegetables)');
    monitoring.push('Cardiovascular screening every 6 months');
    monitoring.push('Cognitive baseline testing');
  }

  if (hasFTO) {
    diet.push('High-protein breakfast for satiety');
    diet.push('Avoid eating after 8 PM');
    lifestyle.push('Minimum 150 minutes exercise per week');
  }

  if (hasCYP1A2Slow) {
    lifestyle.push('Limit caffeine to 1 cup before 10 AM');
    supplements.push('Consider L-theanine with caffeine');
  }

  // Default recommendations
  if (supplements.length === 0) {
    supplements.push('High-quality multivitamin');
    supplements.push('Vitamin D3 2000 IU (verify levels)');
  }

  if (diet.length === 0) {
    diet.push('Mediterranean-style eating pattern');
    diet.push('Emphasize whole foods, minimize processed foods');
  }

  if (lifestyle.length === 0) {
    lifestyle.push('Regular physical activity (150+ min/week)');
    lifestyle.push('Prioritize 7-9 hours quality sleep');
    lifestyle.push('Stress management practice (meditation, yoga)');
  }

  if (monitoring.length === 0) {
    monitoring.push('Annual comprehensive metabolic panel');
    monitoring.push('Lipid panel annually');
    monitoring.push('Vitamin D levels annually');
  }

  return { supplements, diet, lifestyle, monitoring };
}

function extractSectionsFromText(text: string): AIReportSection[] {
  // Simple extraction logic
  const sections: AIReportSection[] = [];
  
  // Split by headers
  const parts = text.split(/(?:\n|^)#+\s+/);
  
  for (const part of parts) {
    if (part.trim().length < 50) continue;
    
    const lines = part.split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    
    if (title && content) {
      sections.push({
        title,
        content: content.substring(0, 500),
        priority: 'medium',
        actionItems: [],
      });
    }
  }

  return sections;
}

/**
 * Generate drug metabolism guidance
 */
export async function generateDrugGuidance(
  variants: Array<{ gene: string; phenotype: string }>
): Promise<{
  summary: string;
  drugSpecific: Array<{
    category: string;
    drugs: string[];
    guidance: string;
  }>;
}> {
  const genePhenotypes = variants.map(v => `${v.gene}: ${v.phenotype}`).join(', ');
  
  return {
    summary: `Your pharmacogenomic profile shows: ${genePhenotypes}. This affects how you process approximately 25% of prescribed medications.`,
    drugSpecific: [
      {
        category: 'Pain Medications',
        drugs: ['Codeine', 'Tramadol'],
        guidance: variants.some(v => v.gene === 'CYP2D6' && v.phenotype.includes('Poor'))
          ? 'AVOID: Reduced effectiveness due to CYP2D6 poor metabolism. Use morphine or oxycodone instead.'
          : 'Normal metabolism expected.',
      },
      {
        category: 'Antiplatelet',
        drugs: ['Clopidogrel (Plavix)'],
        guidance: variants.some(v => v.gene === 'CYP2C19' && v.phenotype.includes('Poor'))
          ? 'USE ALTERNATIVE: Prasugrel or ticagrelor recommended due to reduced clopidogrel activation.'
          : 'Standard dosing appropriate.',
      },
      {
        category: 'Stimulants/Caffeine',
        drugs: ['Caffeine'],
        guidance: variants.some(v => v.gene === 'CYP1A2' && v.phenotype.includes('Slow'))
          ? 'LIMIT: Slow metabolism may cause anxiety, insomnia. Keep under 100mg/day.'
          : 'Normal caffeine metabolism.',
      },
    ],
  };
}
