import { AuditReport, ProductProfile } from '../types/audit';
import {
  getReminderLabel,
  getReminderState,
  ReminderState,
} from './productIntelligence';

export interface ActionTask {
  id: string;
  auditId?: string;
  audit: AuditReport;
  title: string;
  description: string;
  priority: 'critical' | 'advisory';
  category: 'claim' | 'shelf-life' | 'mismatch';
  dueLabel: string;
  nextStepLabel: string;
  reminderState?: ReminderState;
  reminderLabel?: string;
}

export interface ActionStats {
  total: number;
  resolved: number;
  openCritical: number;
  completionPct: number;
}

export function getFindingActionId(audit: AuditReport, index: number) {
  return `${audit.id || audit.productName}-finding-${index}`;
}

export function getShelfLifeActionId(audit: AuditReport) {
  return `${audit.id || audit.productName}-shelf-life-${audit.shelfLife?.status || 'unknown'}`;
}

export function getTwinMismatchActionId(audit: AuditReport) {
  return `${audit.id || audit.productName}-twin-mismatch`;
}

export function formatActionDueLabel(
  priority: 'critical' | 'advisory',
  category: 'claim' | 'shelf-life' | 'mismatch',
) {
  if (category === 'shelf-life' && priority === 'critical') {
    return 'Review today';
  }
  if (priority === 'critical') {
    return 'Within 48h';
  }
  return 'This week';
}

export function formatActionNextStep(category: ActionTask['category']) {
  switch (category) {
    case 'claim':
      return 'Rewrite and re-check the listing copy';
    case 'shelf-life':
      return 'Review freshness messaging and plan a re-audit';
    case 'mismatch':
      return 'Align package and marketplace evidence';
    default:
      return 'Review and resolve';
  }
}

export function buildActionTasks(
  audits: AuditReport[],
  productProfiles: ProductProfile[],
) {
  return audits.flatMap((audit) => {
    const tasks: ActionTask[] = [];
    const productProfile = productProfiles.find(
      (profile) => profile.productName === audit.productName,
    );
    const reminderLabel = productProfile
      ? getReminderLabel(productProfile.nextReviewAt)
      : undefined;
    const reminderState = productProfile
      ? getReminderState(productProfile.nextReviewAt)
      : undefined;

    audit.findings.forEach((finding, index) => {
      if (finding.status === 'discrepancy') {
        tasks.push({
          id: getFindingActionId(audit, index),
          auditId: audit.id,
          audit,
          title: `Rewrite risky claim in ${audit.productName}`,
          description:
            finding.correctiveAction ||
            `Review "${finding.claim}" and replace it with safer region-aware copy.`,
          priority: 'critical',
          category: 'claim',
          dueLabel: formatActionDueLabel('critical', 'claim'),
          nextStepLabel: formatActionNextStep('claim'),
          reminderLabel,
          reminderState,
        });
      }
    });

    if (audit.shelfLife?.status === 'expired') {
      tasks.push({
        id: getShelfLifeActionId(audit),
        auditId: audit.id,
        audit,
        title: `Escalate shelf-life risk for ${audit.productName}`,
        description:
          'This product is marked expired. Review marketplace freshness messaging and remove unsafe inventory claims.',
        priority: 'critical',
        category: 'shelf-life',
        dueLabel: formatActionDueLabel('critical', 'shelf-life'),
        nextStepLabel: formatActionNextStep('shelf-life'),
        reminderLabel,
        reminderState,
      });
    } else if (audit.shelfLife?.status === 'near-expiry') {
      tasks.push({
        id: getShelfLifeActionId(audit),
        auditId: audit.id,
        audit,
        title: `Review near-expiry messaging for ${audit.productName}`,
        description:
          'Double-check expiry disclosures, listing freshness wording, and whether a re-audit is needed soon.',
        priority: 'advisory',
        category: 'shelf-life',
        dueLabel: formatActionDueLabel('advisory', 'shelf-life'),
        nextStepLabel: formatActionNextStep('shelf-life'),
        reminderLabel,
        reminderState,
      });
    }

    if ((audit.twinMismatches?.length || 0) > 0) {
      tasks.push({
        id: getTwinMismatchActionId(audit),
        auditId: audit.id,
        audit,
        title: `Resolve package/listing mismatch in ${audit.productName}`,
        description:
          'Compare the physical label and digital listing, then correct any mismatched weights, claims, or identifiers.',
        priority: 'critical',
        category: 'mismatch',
        dueLabel: formatActionDueLabel('critical', 'mismatch'),
        nextStepLabel: formatActionNextStep('mismatch'),
        reminderLabel,
        reminderState,
      });
    }

    return tasks;
  });
}

export function buildActionStats(
  allActionTasks: ActionTask[],
  actionTasks: ActionTask[],
  resolvedActionIds: string[],
): ActionStats {
  const total = allActionTasks.length;
  const resolved = allActionTasks.filter((task) =>
    resolvedActionIds.includes(task.id),
  ).length;
  const openCritical = actionTasks.filter(
    (task) => task.priority === 'critical',
  ).length;
  const completionPct = total > 0 ? Math.round((resolved / total) * 100) : 100;

  return { total, resolved, openCritical, completionPct };
}
