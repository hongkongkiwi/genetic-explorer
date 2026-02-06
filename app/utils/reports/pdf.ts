/**
 * PDF Report Export
 * 
 * Generates beautiful PDF reports from health reports
 * Uses jsPDF and html2canvas for client-side PDF generation
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'isomorphic-dompurify';
import type { HealthReport, GenomeData } from '~/types/genetics';
import { sanitizePlainText, escapeHtml } from '~/utils/xss';

/**
 * Generate HTML content for PDF report preview
 */
export function generateReportHTML(report: HealthReport, genome: GenomeData): string {
  const generatedDate = new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build sections HTML - all user content is escaped to prevent XSS
  const sectionsHTML = report.sections.map(section => {
    const priorityColor = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#ca8a04',
      low: '#2563eb',
    }[section.priority] || '#475569';

    const priorityBg = {
      critical: '#fef2f2',
      high: '#fff7ed',
      medium: '#fefce8',
      low: '#eff6ff',
    }[section.priority] || '#f8fafc';

    let detailsHTML = '';
    
    if (section.type === 'protocol' && section.protocol) {
      detailsHTML = `
        <div style="margin-top: 16px;">
          ${section.protocol.supplements?.length ? `
            <h4 style="color: #047857; margin-bottom: 8px;">💊 Supplements</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${section.protocol.supplements.map(item => `<li style="margin-bottom: 4px; color: #334155;">${escapeHtml(item)}</li>`).join('')}
            </ul>
          ` : ''}
          ${section.protocol.diet?.length ? `
            <h4 style="color: #9a3412; margin: 16px 0 8px;">🥗 Diet</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${section.protocol.diet.map(item => `<li style="margin-bottom: 4px; color: #334155;">${escapeHtml(item)}</li>`).join('')}
            </ul>
          ` : ''}
          ${section.protocol.lifestyle?.length ? `
            <h4 style="color: #1d4ed8; margin: 16px 0 8px;">🏃 Lifestyle</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${section.protocol.lifestyle.map(item => `<li style="margin-bottom: 4px; color: #334155;">${escapeHtml(item)}</li>`).join('')}
            </ul>
          ` : ''}
          ${section.protocol.monitoring?.length ? `
            <h4 style="color: #6d28d9; margin: 16px 0 8px;">📊 Monitoring</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${section.protocol.monitoring.map(item => `<li style="margin-bottom: 4px; color: #334155;">${escapeHtml(item)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `;
    }

    if (section.type === 'drug' && section.details) {
      detailsHTML = `
        <div style="margin-top: 16px;">
          ${section.details.map((detail: any) => `
            <div style="margin-bottom: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
              <strong style="color: #0f172a;">${escapeHtml(detail.category)}</strong>
              <p style="margin: 4px 0; color: #475569;">${escapeHtml(detail.drugs.join(', '))}</p>
              <p style="margin: 4px 0; color: ${priorityColor}; font-weight: 500;">${escapeHtml(detail.guidance)}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (section.actionItems && section.actionItems.length > 0) {
      detailsHTML += `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <h4 style="color: #0f172a; margin-bottom: 8px;">Recommended Actions</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${section.actionItems.map(item => `<li style="margin-bottom: 4px; color: #475569;">${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    return `
      <div style="margin-bottom: 24px; padding: 20px; background: ${priorityBg}; border-radius: 12px; border: 2px solid ${priorityColor}30;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <h3 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 600;">${escapeHtml(section.title)}</h3>
          <span style="background: ${priorityColor}20; color: ${priorityColor}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
            ${section.priority}
          </span>
        </div>
        <p style="color: #475569; line-height: 1.6; margin: 0;">${escapeHtml(section.content)}</p>
        ${detailsHTML}
      </div>
    `;
  }).join('');

  // Build disease risks HTML - all user content escaped
  const risksHTML = report.diseaseRisks?.slice(0, 5).map(risk => {
    const riskColor = {
      high: '#dc2626',
      moderate: '#ea580c',
      low: '#16a34a',
      protective: '#2563eb',
    }[risk.riskLevel] || '#475569';

    const riskBg = {
      high: '#fef2f2',
      moderate: '#fff7ed',
      low: '#f0fdf4',
      protective: '#eff6ff',
    }[risk.riskLevel] || '#f8fafc';

    return `
      <div style="margin-bottom: 12px; padding: 16px; background: ${riskBg}; border-radius: 8px; border-left: 4px solid ${riskColor};">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="background: ${riskColor}20; color: ${riskColor}; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
            ${risk.riskLevel.toUpperCase()}
          </span>
          <strong style="color: #0f172a;">${escapeHtml(risk.condition)}</strong>
        </div>
        <p style="margin: 0; color: #475569; font-size: 14px;">${escapeHtml(risk.description || '')}</p>
      </div>
    `;
  }).join('') || '<p style="color: #475569;">No significant disease risks identified.</p>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page {
          margin: 40px;
          size: A4;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #0f172a;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
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
          color: #0f172a;
          margin: 0;
        }
        .subtitle {
          color: #475569;
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
          border: 1px solid #e2e8f0;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #4f46e5;
        }
        .stat-label {
          font-size: 12px;
          color: #475569;
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
          color: white;
        }
        .executive-summary p {
          margin: 0;
          line-height: 1.8;
          opacity: 0.95;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #0f172a;
          margin: 30px 0 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }
        .disclaimer {
          background: #fefce8;
          border: 2px solid #facc15;
          padding: 20px;
          border-radius: 12px;
          margin-top: 40px;
        }
        .disclaimer h3 {
          color: #713f12;
          margin-top: 0;
        }
        .disclaimer p {
          color: #713f12;
          margin: 0;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #475569;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🧬 Genetic Explorer</div>
        <h1 class="title">Genetic Health Report</h1>
        <p class="subtitle">
          ${escapeHtml(genome.filename)} • Generated ${generatedDate}
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
        <p>${escapeHtml(report.executiveSummary)}</p>
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
 * Generate PDF from health report using jsPDF and html2canvas
 */
export async function generatePDF(
  report: HealthReport,
  genome: GenomeData
): Promise<Blob> {
  // Generate HTML content
  const html = generateReportHTML(report, genome);
  
  // Create a temporary container to render the HTML
  // Sanitize HTML before insertion to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'span', 'h1', 'h2', 'h3', 'h4', 'p', 'br', 'hr', 'strong', 'em', 'b', 'i', 'u', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'ul', 'ol', 'li', 'img', 'style'],
    ALLOWED_ATTR: ['class', 'id', 'style', 'src', 'alt', 'width', 'height'],
  });
  const container = document.createElement('div');
  container.innerHTML = sanitizedHtml;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.background = 'white';
  document.body.appendChild(container);
  
  try {
    // Wait for fonts to load
    await document.fonts.ready;
    
    // Use html2canvas to render the content
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
    });
    
    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add title
    pdf.setProperties({
      title: `Genetic Health Report - ${genome.filename}`,
      subject: 'Genetic Health Analysis Report',
      author: 'Genetic Explorer',
      creator: 'Genetic Explorer',
    });
    
    let heightLeft = imgHeight;
    let position = 0;
    
    // Get image data
    const imgData = canvas.toDataURL('image/png');
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if content overflows
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Return as blob
    return pdf.output('blob');
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
}

/**
 * Download PDF report
 */
export async function downloadPDF(
  report: HealthReport,
  genome: GenomeData
): Promise<void> {
  const blob = await generatePDF(report, genome);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `genetic-report-${genome.filename.replace(/\.[^/.]+$/, '')}-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Alternative: Print to PDF using browser's print function
 */
export function printToPDF(): void {
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
 * Export report data as JSON
 */
export function exportReportJSON(
  report: HealthReport,
  genome: GenomeData
): Blob {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '1.0',
      source: 'Genetic Explorer',
    },
    genome: {
      id: genome.id,
      filename: genome.filename,
      uploadDate: (genome as any).uploadDate,
      assembly: (genome as any).assembly,
    },
    report: {
      id: report.id,
      generatedAt: report.generatedAt,
      summary: report.summary,
      executiveSummary: report.executiveSummary,
      keyFindings: report.keyFindings,
      diseaseRisks: report.diseaseRisks,
      actionableProtocol: report.actionableProtocol,
      sections: report.sections,
    },
  };
  
  return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
}

/**
 * Download report as JSON
 */
export function downloadReportJSON(
  report: HealthReport,
  genome: GenomeData
): void {
  const blob = exportReportJSON(report, genome);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `genetic-report-${genome.filename.replace(/\.[^/.]+$/, '')}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * API endpoint for PDF generation (server-side)
 * This would be implemented on the server using puppeteer
 */
export async function generatePDFOnServer(
  report: HealthReport,
  genome: GenomeData
): Promise<Blob> {
  const response = await fetch('/api/export/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report, genome }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate PDF on server');
  }
  
  return response.blob();
}
