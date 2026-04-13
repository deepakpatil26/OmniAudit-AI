export type AuditLifecycleStatus =
  | 'queued'
  | 'preparing'
  | 'analyzing'
  | 'cross-checking'
  | 'finalizing'
  | 'completed'
  | 'failed';

export interface AuditFinding {
  claim: string;
  evidence: string;
  status:
    | 'discrepancy'
    | 'compliant'
    | 'inconclusive'
    | 'verified'
    | 'unverified';
  reasoning: string;
  legalReference: string;
  correctiveAction?: string;
  visualFixPrompt?: string;
}

export interface FindingRewriteSuggestion {
  suggestedCopy: string;
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ProductProfile {
  id?: string;
  userId: string;
  productKey: string;
  productName: string;
  region: string;
  auditCount: number;
  lastAuditAt: string;
  lastAuditId?: string;
  lastComplianceScore: number;
  latestRiskSummary: string;
  openFindingsCount: number;
  reviewCadenceDays: number;
  nextReviewAt: string;
  lastReviewedAt?: string;
  productStatus: 'active' | 'watchlist' | 'stable';
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
  status?: AuditLifecycleStatus;
  timestamp?: any;
}
