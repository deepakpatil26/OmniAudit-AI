import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface AuditReport {
  productName: string;
  complianceScore: number;
  riskSummary: string;
  findings: any[];
  thoughtSignature: string;
  createdAt: string;
  region: string;
  fssaiCategory?: string;
  shelfLife?: {
    mfgDate: string;
    expDate: string;
    remainingDays: number;
    status: 'fresh' | 'near-expiry' | 'expired';
  };
}

export const generateAuditPDF = async (audit: AuditReport) => {
  // Create a hidden container for the certificate
  const element = document.createElement('div');
  element.style.width = '800px';
  element.style.padding = '40px';
  element.style.background = '#ffffff';
  element.style.color = '#1e1b4b'; // indigo-950
  element.style.fontFamily = 'Inter, sans-serif';
  element.style.position = 'absolute';
  element.style.left = '-9999px';

  element.innerHTML = `
    <div style="border: 8px solid #4f46e5; padding: 40px; position: relative;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; font-weight: bold; margin-bottom: 8px;">
          Official Compliance Certificate
        </div>
        <h1 style="font-size: 32px; margin: 0; color: #1e1b4b; text-transform: uppercase;">OmniAudit AI Defender</h1>
        <div style="margin-top: 10px; font-size: 14px; color: #4338ca;">
          Automated Regulatory Verification Report
        </div>
      </div>

      <!-- Score Section -->
      <div style="display: flex; gap: 40px; margin-bottom: 40px; align-items: center; border-bottom: 2px solid #e0e7ff; padding-bottom: 40px;">
        <div style="flex: 1;">
          <div style="font-size: 12px; color: #6366f1; text-transform: uppercase; font-weight: bold;">Product Name</div>
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">${audit.productName}</div>
          
          <div style="font-size: 12px; color: #6366f1; text-transform: uppercase; font-weight: bold;">Verified Market</div>
          <div style="font-size: 16px; font-weight: medium; margin-bottom: 20px;">${audit.region || 'India (BIS/FSSAI)'}</div>
          
          ${
            audit.fssaiCategory
              ? `
            <div style="font-size: 12px; color: #059669; text-transform: uppercase; font-weight: bold;">Product Classification</div>
            <div style="display: inline-block; background: #ecfdf5; color: #059669; border: 1px solid #10b981; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: bold;">
              FSSAI CAT ${audit.fssaiCategory}
            </div>
          `
              : ''
          }
        </div>
        <div style="text-align: center; background: #4f46e5; color: white; padding: 30px; border-radius: 20px; min-width: 150px;">
          <div style="font-size: 10px; text-transform: uppercase;">Compliance Score</div>
          <div style="font-size: 48px; font-weight: bold;">${audit.complianceScore}</div>
          <div style="font-size: 12px;">OUT OF 100</div>
        </div>
      </div>

      <!-- Risk Summary & Shelf Life -->
      <div style="display: flex; gap: 30px; margin-bottom: 40px;">
        <div style="flex: 2;">
          <h3 style="font-size: 16px; color: #4338ca; text-transform: uppercase; margin-bottom: 12px;">Executive Risk Summary</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">${audit.riskSummary}</p>
        </div>
        ${
          audit.shelfLife
            ? `
          <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 10px;">Shelf-Life Guard</div>
            <div style="font-size: 14px; font-weight: bold; color: ${audit.shelfLife.status === 'expired' ? '#dc2626' : audit.shelfLife.status === 'near-expiry' ? '#d97706' : '#059669'}; margin-bottom: 5px;">
              ${audit.shelfLife.status.toUpperCase()}
            </div>
            <div style="font-size: 11px; color: #64748b;">EXP: ${audit.shelfLife.expDate}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 5px;">${audit.shelfLife.remainingDays} days remaining</div>
          </div>
        `
            : ''
        }
      </div>

      <!-- Findings Table -->
      <div style="margin-bottom: 40px;">
        <h3 style="font-size: 16px; color: #4338ca; text-transform: uppercase; margin-bottom: 12px;">Statutory Verification Findings</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="text-align: left; padding: 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0;">CLAIM</th>
              <th style="text-align: left; padding: 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0;">STATUS</th>
              <th style="text-align: left; padding: 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0;">LEGAL REF</th>
            </tr>
          </thead>
          <tbody>
            ${audit.findings
              .map(
                (f) => `
              <tr>
                <td style="padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9;">${f.claim}</td>
                <td style="padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; color: ${f.status === 'discrepancy' ? '#dc2626' : '#16a34a'}; font-weight: bold;">
                  ${f.status.toUpperCase()}
                </td>
                <td style="padding: 12px; font-size: 11px; border-bottom: 1px solid #f1f5f9; color: #64748b;">${f.legalReference}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Footer & Signature -->
      <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Certificate Hash: ${audit.thoughtSignature}</div>
          <div style="font-size: 11px; color: #94a3b8;">Issued On: ${new Date(audit.createdAt).toLocaleDateString()}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-style: italic; font-size: 16px; color: #4f46e5; margin-bottom: 4px;">OmniAudit AI</div>
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Automated Verification Engine</div>
        </div>
      </div>

      <!-- Verification Seal -->
      <div style="position: absolute; top: 30px; right: 30px; opacity: 0.1;">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#4f46e5" stroke-width="2" />
          <path d="M30 50L45 65L70 35" stroke="#4f46e5" stroke-width="8" fill="none" />
        </svg>
      </div>
    </div>
  `;

  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(
      `OmniAudit_Certificate_${audit.productName.replace(/\s+/g, '_')}.pdf`,
    );
  } catch (error) {
    console.error('PDF Generation failed:', error);
  } finally {
    document.body.removeChild(element);
  }
};
