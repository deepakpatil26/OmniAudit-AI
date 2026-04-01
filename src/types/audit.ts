export interface AuditFinding {
  claim: string;
  evidence: string;
  status: 'discrepancy' | 'compliant' | 'inconclusive' | 'verified';
  reasoning: string;
  legalReference: string;
  correctiveAction: string;
  visualFixPrompt?: string;
}

export interface TwinMismatch {
  attribute: string;
  physicalValue: string;
  digitalValue: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AuditReport {
  id?: string;
  userId?: string;
  productName: string;
  productDescription: string;
  region: string;
  complianceScore: number;
  riskSummary: string;
  findings: AuditFinding[];
  thoughtSignature: string;
  fssaiCategory?: string;
  categoryReasoning?: string;
  twinMismatches?: TwinMismatch[];
  shelfLife?: {
    mfgDate: string;
    expDate: string;
    remainingDays: number;
    status: 'fresh' | 'near-expiry' | 'expired';
  };
  productImage?: string | null;
  digitalImage?: string | null;
  createdAt: string;
  timestamp?: any;
}
