/**
 * PDF Report Export
 * 
 * Generates beautiful PDF reports from health reports
 * Uses puppeteer for high-quality rendering
 */

import type { HealthReport, GenomeData } from '~/types/genetics';

/**
 * Generate HTML content for PDF
 */
function generateReportHTML(report: HealthReport, genome: GenomeData): string {
  const generatedDate = new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build sections HTML
  const sectionsHTML = report.sections.map(section => {
    const priorityColor = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#eab308',
      low: '#3b82f6',
    }[section.priority] || '#6b7280';

    let detailsHTML = '';
    
    if (section.type === 'protocol' && section.protocol) {
      detailsHTML = `
        <div style="margin-top: 16px;">
          ${section.protocol.supplements?.length ? `
            <h4 style="color: #059669; margin-bottom: 8px;">💊 Supplements</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${section.protocol.supplements.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
            </ul>
          ` : ''}
          ${section.protocol.diet?.length ? `
            <h4 style="color: #ea580c; margin: 16px 0 8px;">🥗 Diet</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${section.protocol.diet.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
            </ul>
          ` : ''}
          ${section.protocol.lifestyle?.length ? `
            <h4 style="color: #2563eb; margin: 16px 0 8px;">🏃 Lifestyle</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${section.protocol.lifestyle.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
            </ul>
          ` : ''}
          ${section.protocol.monitoring?.length ? `
            <h4 style="color: #7c3aed; margin: 16px 0 8px;">📊 Monitoring</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${section.protocol.monitoring.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `;
    }

    if (section.type === 'drug' && section.details) {
      detailsHTML = `
        <div style="margin-top: 16px;">
          ${section.details.map((detail: any) => `
            <div style="margin-bottom: 12px; padding: 12px; background: #f8fafc; border-radius: 8px;">
              <strong style="color: #1e293b;">${detail.category}</strong>
              <p style="margin: 4px 0; color: #475569;">${detail.drugs.join(', ')}</p>
              <p style="margin: 4px 0; color: ${priorityColor}; font-weight: 500;">${detail.guidance}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (section.actionItems && section.actionItems.length > 0) {
      detailsHTML += `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <h4 style="color: #1e293b; margin-bottom: 8px;">Recommended Actions</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${section.actionItems.map(item => `<li style="margin-bottom: 4px; color: #475569;">${item}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    return `
      <div style="margin-bottom: 24px; padding: 20px; background: #ffffff; border-radius: 12px; border: 2px solid ${priorityColor}20;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <h3 style="margin: 0; color: #1e293b; font-size: 18px;">${section.title}</h3>
          <span style="background: ${priorityColor}20; color: ${priorityColor}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
            ${section.priority}
          </span>
        </div>
        <p style="color: #475569; line-height: 1.6; margin: 0;">${section.content}</p>
        ${detailsHTML}
      </div>
    `;
  }).join('');

  // Build disease risks HTML
  const risksHTML = report.diseaseRisks?.slice(0, 5).map(risk => {
    const riskColor = {
      high: '#ef4444',
      moderate: '#f97316',
      low: '#22c55e',
      protective: '#3b82f6',
    }[risk.riskLevel] || '#6b7280';

    return `
      <div style="margin-bottom: 12px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid ${riskColor};">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="background: ${riskColor}20; color: ${riskColor}; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
            ${risk.riskLevel.toUpperCase()}
          </span>
          <strong style="color: #1e293b;">${risk.condition}</strong>
        </div>
        <p style="margin: 0; color: #475569; font-size: 14px;">${risk.description || ''}</p>
      </div>
    `;
  }).join('') || '<p style="color: #64748b;">No significant disease risks identified.</p>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          margin: 40px;
          size: A4;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding-bottom: 30px;
          border-bottom: 3px solid #4f46e5;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 8px;
        }
        .title {
          font-size: 32px;
          font-weight: bold;
          color: #1e293b;
          margin: 0;
        }
        .subtitle {
          color: #64748b;
          margin-top: 8px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #4f46e5;
        }
        .stat-label {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }
        .executive-summary {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 30px;
          border-radius: 16px;
          margin-bottom: 30px;
        }
        .executive-summary h2 {
          margin-top: 0;
          font-size: 20px;
        }
        .executive-summary p {
          margin: 0;
          line-height: 1.8;
          opacity: 0.95;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1e293b;
          margin: 30px 0 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }
        .disclaimer {
          background: #fef3c7;
          border: 2px solid #fbbf24;
          padding: 20px;
          border-radius: 12px;
          margin-top: 40px;
        }
        .disclaimer h3 {
          color: #92400e;
          margin-top: 0;
        }
        .disclaimer p {
          color: #78350f;
          margin: 0;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🧬 Genetic Explorer</div>
        <h1 class="title">Genetic Health Report</h1>
        <p class="subtitle">
          ${genome.filename} • Generated ${generatedDate}
        </p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${report.summary.totalVariants}</div>
          <div class="stat-label">Variants Analyzed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.summary.highImpact}</div>
          <div class="stat-label">High Impact</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.diseaseRisks?.length || 0}</div>
          <div class="stat-label">Risk Assessments</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Object.keys(report.summary.categories).length}</div>
          <div class="stat-label">Categories</div>
        </div>
      </div>

      <div class="executive-summary">
        <h2>Executive Summary</h2>
        <p>${report.executiveSummary}</p>
      </div>

      <h2 class="section-title">Disease Risk Assessment</h2>
      ${risksHTML}

      <h2 class="section-title">Detailed Findings</h2>
      ${sectionsHTML}

      <div class="disclaimer">
        <h3>Important Disclaimer</h3>
        <p>
          This report is for educational and informational purposes only. It is not intended to diagnose, 
          treat, or replace professional medical advice. Always consult with a qualified healthcare provider 
          before making any medical decisions. Genetic risk factors represent predispositions, not certainties, 
          and environmental and lifestyle factors play significant roles in health outcomes.
        </p>
      </div>

      <div class="footer">
        <p>Generated by Genetic Explorer • ${generatedDate}</p>
        <p style="margin-top: 8px;">This report contains sensitive genetic information. Keep it secure.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate PDF from health report
 * Note: In a server environment, you'd use puppeteer
 * For client-side, we'll use a simpler approach
 */
export async function generatePDF(
  report: HealthReport,
  genome: GenomeData
): Promise<Blob> {
  const html = generateReportHTML(report, genome);
  
  // Create a blob from the HTML
  const htmlBlob = new Blob([html], { type: 'text/html' });
  
  // In a real implementation, you'd send this to a server endpoint
  // that uses puppeteer to convert to PDF
  // For now, we'll return the HTML as a downloadable file
  // and the user can print to PDF
  
  return htmlBlob;
}

/**
 * Alternative: Print to PDF using browser's print function
 */
export function printToPDF() {
  window.print();
}

/**
 * Generate a shareable summary
 */
export function generateShareableSummary(report: HealthReport): string {
  const lines = [
    '🧬 My Genetic Health Summary',
    '',
    `📊 ${report.summary.totalVariants} variants analyzed`,
    `⚠️ ${report.summary.highImpact} high-impact findings`,
    '',
    '🎯 Top Findings:',
    ...report.keyFindings.slice(0, 3).map(f => `• ${f.substring(0, 100)}...`),
    '',
    '💊 My Protocol:',
    ...report.actionableProtocol.supplements.slice(0, 3).map(s => `• ${s}`),
    '',
    'Generated by Genetic Explorer',
  ];
  
  return lines.join('\n');
}

/**
 * API endpoint for PDF generation
 */
export async function generatePDFOnServer(
  report: HealthReport,
  genome: GenomeData
): Promise<Buffer> {
  // This would be implemented on the server using puppeteer
  // Example:
  // const puppeteer = require('puppeteer');
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.setContent(html);
  // const pdf = await page.pdf({ format: 'A4' });
  // await browser.close();
  // return pdf;
  
  throw new Error('Server-side PDF generation requires puppeteer setup');
}
