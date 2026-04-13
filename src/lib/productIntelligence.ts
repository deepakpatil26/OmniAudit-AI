import { AuditReport, ProductProfile } from '../types/audit';

export type ReminderState =
  | 'overdue'
  | 'due-today'
  | 'due-this-week'
  | 'on-track';

export interface ProductDiffSummary {
  scoreDelta: number | null;
  discrepancyDelta: number | null;
  newRiskClaims: string[];
  resolvedRiskClaims: string[];
  changedAttributes: string[];
  shelfLifeChange: string | null;
  riskSummaryChanged: boolean;
  riskSummaryShift: string;
  changeSummary: string;
}

export interface ProductInsightDetail extends ProductDiffSummary {
  profile: ProductProfile;
  latestAudit: AuditReport | null;
  previousAudit: AuditReport | null;
  recentAudits: AuditReport[];
  latestTwinMismatchAttributes: string[];
  previousTwinMismatchAttributes: string[];
  openActionCount: number;
  reminderState: ReminderState;
  reminderLabel: string;
}

export const REVIEW_CADENCE_OPTIONS = [7, 14, 30, 60, 90] as const;
export const DEFAULT_REVIEW_CADENCE_DAYS = 30;

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function addDaysToIso(baseIso: string, days: number) {
  const next = new Date(baseIso);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export function deriveProductStatus(audit: AuditReport | null) {
  if (!audit) return 'active' as const;
  const hasCriticalFindings = audit.findings.some(
    (finding) => finding.status === 'discrepancy',
  );
  const hasShelfLifeRisk =
    audit.shelfLife?.status === 'expired' ||
    audit.shelfLife?.status === 'near-expiry';
  const hasMismatch = (audit.twinMismatches?.length || 0) > 0;

  if (hasCriticalFindings || hasShelfLifeRisk || hasMismatch) {
    return 'watchlist' as const;
  }
  if (audit.complianceScore >= 85) {
    return 'stable' as const;
  }
  return 'active' as const;
}

export function getReminderState(nextReviewAt: string | undefined) {
  if (!nextReviewAt) return 'on-track' as const;

  const today = startOfToday();
  const target = new Date(nextReviewAt);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) return 'overdue' as const;
  if (diffDays === 0) return 'due-today' as const;
  if (diffDays <= 7) return 'due-this-week' as const;
  return 'on-track' as const;
}

export function getReminderLabel(nextReviewAt: string | undefined) {
  switch (getReminderState(nextReviewAt)) {
    case 'overdue':
      return 'Overdue';
    case 'due-today':
      return 'Due today';
    case 'due-this-week':
      return 'Due this week';
    case 'on-track':
    default:
      return 'On track';
  }
}

function getShelfLifeChange(latest: AuditReport | null, previous: AuditReport | null) {
  const latestStatus = latest?.shelfLife?.status;
  const previousStatus = previous?.shelfLife?.status;
  if (!latestStatus && !previousStatus) return null;
  if (!previousStatus) return `Shelf-life baseline is ${latestStatus}.`;
  if (latestStatus === previousStatus) return `Shelf-life remains ${latestStatus}.`;
  return `Shelf-life changed from ${previousStatus} to ${latestStatus}.`;
}

function getRiskSummaryShift(latest: AuditReport | null, previous: AuditReport | null) {
  if (!latest) return 'No audit summary available yet.';
  if (!previous) return 'Baseline captured. Run one more audit to unlock summary comparisons.';
  if (latest.riskSummary.trim() === previous.riskSummary.trim()) {
    return 'Risk summary is stable versus the previous audit.';
  }
  return 'Risk summary changed since the previous audit.';
}

export function buildProductInsights(
  audits: AuditReport[],
  productProfiles: ProductProfile[],
  openActionCountByProduct: Record<string, number>,
): ProductInsightDetail[] {
  return productProfiles
    .map((profile) => {
      const relatedAudits = audits
        .filter((audit) => audit.productName === profile.productName)
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
        );
      const latest = relatedAudits[0] || null;
      const previous = relatedAudits[1] || null;
      const latestDiscrepancies = latest
        ? latest.findings.filter((finding) => finding.status === 'discrepancy')
        : [];
      const previousDiscrepancies = previous
        ? previous.findings.filter((finding) => finding.status === 'discrepancy')
        : [];
      const scoreDelta =
        latest && previous
          ? latest.complianceScore - previous.complianceScore
          : null;
      const discrepancyDelta =
        latest && previous
          ? latestDiscrepancies.length - previousDiscrepancies.length
          : null;
      const previousClaims = new Set(
        previousDiscrepancies.map((finding) => finding.claim),
      );
      const latestClaims = new Set(
        latestDiscrepancies.map((finding) => finding.claim),
      );
      const newRiskClaims = latestDiscrepancies
        .map((finding) => finding.claim)
        .filter((claim) => !previousClaims.has(claim))
        .slice(0, 3);
      const resolvedRiskClaims = previousDiscrepancies
        .map((finding) => finding.claim)
        .filter((claim) => !latestClaims.has(claim))
        .slice(0, 3);
      const latestTwinMismatchAttributes = Array.from(
        new Set(
          (latest?.twinMismatches || []).map((mismatch) => mismatch.attribute),
        ),
      );
      const previousTwinMismatchAttributes = Array.from(
        new Set(
          (previous?.twinMismatches || []).map(
            (mismatch) => mismatch.attribute,
          ),
        ),
      );
      const changedAttributes = Array.from(
        new Set([
          ...latestTwinMismatchAttributes,
          ...previousTwinMismatchAttributes,
        ]),
      ).slice(0, 3);
      const shelfLifeChange = getShelfLifeChange(latest, previous);
      const riskSummaryShift = getRiskSummaryShift(latest, previous);
      const riskSummaryChanged =
        !!latest &&
        !!previous &&
        latest.riskSummary.trim() !== previous.riskSummary.trim();

      const changeSummary = !previous
        ? 'Baseline captured. Run one more audit later to unlock exact change comparisons.'
        : newRiskClaims.length > 0
          ? `New risk surfaced in ${newRiskClaims.join(' and ')}.`
          : resolvedRiskClaims.length > 0
            ? `Improvement detected: ${resolvedRiskClaims.join(' and ')} no longer appear as discrepancies.`
            : shelfLifeChange &&
                latest?.shelfLife?.status !== previous?.shelfLife?.status
              ? shelfLifeChange
              : changedAttributes.length > 0
                ? `Cross-channel evidence changed around ${changedAttributes.join(' and ')}.`
                : riskSummaryChanged
                  ? 'Narrative risk summary changed since the previous audit.'
                  : 'Latest audit is broadly stable compared with the previous check.';

      return {
        profile,
        latestAudit: latest,
        previousAudit: previous,
        recentAudits: relatedAudits.slice(0, 3),
        scoreDelta,
        discrepancyDelta,
        newRiskClaims,
        resolvedRiskClaims,
        changedAttributes,
        shelfLifeChange,
        riskSummaryChanged,
        riskSummaryShift,
        changeSummary,
        latestTwinMismatchAttributes,
        previousTwinMismatchAttributes,
        openActionCount: openActionCountByProduct[profile.productName] || 0,
        reminderState: getReminderState(profile.nextReviewAt),
        reminderLabel: getReminderLabel(profile.nextReviewAt),
      };
    })
    .slice(0, 6);
}
