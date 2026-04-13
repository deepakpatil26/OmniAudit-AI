export interface AuditFinding {
  claim: string;
  evidence: string;
  status:
    | 'verified'
    | 'discrepancy'
    | 'unverified'
    | 'compliant'
    | 'inconclusive';
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

export interface AuditReport {
  productName: string;
  complianceScore: number;
  riskSummary: string;
  findings: AuditFinding[];
  thoughtSignature: string;
  fssaiCategory?: string;
  categoryReasoning?: string;
  shelfLife?: {
    mfgDate: string;
    expDate: string;
    remainingDays: number;
    status: 'fresh' | 'near-expiry' | 'expired';
  };
  twinMismatches?: Array<{
    attribute: string;
    physicalValue: string;
    digitalValue: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

interface JsonResponse<T> {
  data?: T;
  error?: string;
}

async function postJSON<TRequest, TResponse>(
  url: string,
  body: TRequest,
): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as JsonResponse<TResponse>;
  if (!response.ok || payload.error) {
    throw new Error(payload.error || 'Request failed.');
  }

  if (payload.data === undefined) {
    throw new Error('The server returned an empty response.');
  }

  return payload.data;
}

export async function performAudit(
  productDescription: string,
  region: string,
  mediaItems: { data: string; mimeType: string; label?: string }[] = [],
  dossierTexts: string[] = [],
): Promise<AuditReport> {
  return postJSON('/api/audit', {
    productDescription,
    region,
    mediaItems,
    dossierTexts,
  });
}

export async function getConsultationResponse(query: string): Promise<string> {
  const data = await postJSON<{ query: string }, { message: string }>(
    '/api/consult',
    { query },
  );

  return data.message;
}

export async function getReportConsultationResponse(
  question: string,
  reportContext: string,
): Promise<string> {
  const data = await postJSON<
    { query: string; context: string },
    { message: string }
  >('/api/report-chat', {
    query: question,
    context: reportContext,
  });

  return data.message;
}

export async function getFindingRewriteSuggestion(input: {
  claim: string;
  reasoning: string;
  legalReference: string;
  region: string;
  productName: string;
  correctiveAction?: string;
}): Promise<FindingRewriteSuggestion> {
  return postJSON<typeof input, FindingRewriteSuggestion>(
    '/api/rewrite-finding',
    input,
  );
}

export async function quickCheck(
  text: string,
): Promise<{ risk: 'high' | 'low'; message: string } | null> {
  if (text.length < 10) return null;

  return postJSON('/api/quick-check', { text });
}

export async function fixImage(
  imageBase64: string,
  fixPrompt: string,
): Promise<string> {
  const response = await fetch('/api/fix-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageBase64, fixPrompt }),
  });

  const payload = (await response.json()) as JsonResponse<{ imageUrl: string }>;
  if (!response.ok || payload.error || !payload.data?.imageUrl) {
    throw new Error(payload.error || 'Unable to generate a visual fix.');
  }

  return payload.data.imageUrl;
}
