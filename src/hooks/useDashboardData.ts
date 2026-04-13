import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { AuditReport, ProductProfile } from '../types/audit';
import { AuditSort } from '../types/app';
import { buildActionStats, buildActionTasks } from '../lib/actionCenter';
import {
  addDaysToIso,
  buildProductInsights,
  DEFAULT_REVIEW_CADENCE_DAYS,
} from '../lib/productIntelligence';

interface UseDashboardDataArgs {
  user: User | null;
  view: string;
  deferredSearchQuery: string;
  filter: 'all' | 'high-risk';
  sortBy: AuditSort;
  resolvedActionIds: string[];
}

export function useDashboardData({
  user,
  view,
  deferredSearchQuery,
  filter,
  sortBy,
  resolvedActionIds,
}: UseDashboardDataArgs) {
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [productProfiles, setProductProfiles] = useState<ProductProfile[]>([]);

  useEffect(() => {
    if (user) {
      const auditsQuery = query(
        collection(db, 'audits'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
      );
      const unsubscribe = onSnapshot(auditsQuery, (snapshot) => {
        const auditData = snapshot.docs.map((documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        })) as AuditReport[];
        setAudits(auditData);
      });
      return () => unsubscribe();
    }

    setAudits([]);
    setProductProfiles([]);
  }, [user, view]);

  useEffect(() => {
    if (!user) return;

    const profilesQuery = query(
      collection(db, 'productProfiles'),
      where('userId', '==', user.uid),
    );

    const unsubscribe = onSnapshot(profilesQuery, (snapshot) => {
      const nowIso = new Date().toISOString();
      const profileData = snapshot.docs.map((documentSnapshot) => {
        const data = documentSnapshot.data() as Partial<ProductProfile>;
        const lastAuditAt = data.lastAuditAt || nowIso;
        const reviewCadenceDays =
          data.reviewCadenceDays || DEFAULT_REVIEW_CADENCE_DAYS;

        return {
          id: documentSnapshot.id,
          ...data,
          lastAuditAt,
          reviewCadenceDays,
          nextReviewAt:
            data.nextReviewAt || addDaysToIso(lastAuditAt, reviewCadenceDays),
          productStatus: data.productStatus || 'active',
        } as ProductProfile;
      });
      profileData.sort(
        (left: ProductProfile, right: ProductProfile) =>
          new Date(right.lastAuditAt || 0).getTime() -
          new Date(left.lastAuditAt || 0).getTime(),
      );
      setProductProfiles(profileData);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredAudits = useMemo(() => {
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase();

    const matches = audits.filter((audit) => {
      const matchesRisk =
        filter === 'all' ||
        audit.findings.some((finding) => finding.status === 'discrepancy');

      if (!matchesRisk) return false;
      if (!normalizedSearch) return true;

      return [
        audit.productName,
        audit.productDescription,
        audit.region,
        audit.riskSummary,
        ...audit.findings.map((finding) => finding.claim),
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    });

    return [...matches].sort((left, right) => {
      switch (sortBy) {
        case 'oldest':
          return (
            new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime()
          );
        case 'highest-score':
          return right.complianceScore - left.complianceScore;
        case 'lowest-score':
          return left.complianceScore - right.complianceScore;
        case 'newest':
        default:
          return (
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
          );
      }
    });
  }, [audits, deferredSearchQuery, filter, sortBy]);

  const stats = useMemo(() => {
    const highRiskCount = audits.filter((audit) =>
      audit.findings.some((finding) => finding.status === 'discrepancy'),
    ).length;
    const avgScore =
      audits.length > 0
        ? Math.round(
            audits.reduce(
              (accumulator, currentAudit) =>
                accumulator + (currentAudit.complianceScore || 0),
              0,
            ) / audits.length,
          )
        : 100;
    const regions = new Set(audits.map((audit) => audit.region)).size;
    return { highRiskCount, avgScore, regions };
  }, [audits]);

  const coveredRegions = useMemo(() => {
    return Array.from(
      new Set(audits.map((audit) => audit.region).filter(Boolean)),
    );
  }, [audits]);

  const allActionTasks = useMemo(
    () => buildActionTasks(audits, productProfiles),
    [audits, productProfiles],
  );

  const actionTasks = useMemo(
    () =>
      allActionTasks
        .filter((task) => !resolvedActionIds.includes(task.id))
        .sort((left, right) => {
          const priorityScore = { critical: 0, advisory: 1 };
          const reminderScore = {
            overdue: 0,
            'due-today': 1,
            'due-this-week': 2,
            'on-track': 3,
            undefined: 4,
          };
          const categoryScore = { 'shelf-life': 0, mismatch: 1, claim: 2 };
          return (
            priorityScore[left.priority] - priorityScore[right.priority] ||
            reminderScore[left.reminderState] - reminderScore[right.reminderState] ||
            categoryScore[left.category] - categoryScore[right.category]
          );
        })
        .slice(0, 6),
    [allActionTasks, resolvedActionIds],
  );

  const actionStats = useMemo(
    () => buildActionStats(allActionTasks, actionTasks, resolvedActionIds),
    [allActionTasks, actionTasks, resolvedActionIds],
  );

  const groupedActionTasks = useMemo(
    () => ({
      critical: actionTasks.filter((task) => task.priority === 'critical'),
      advisory: actionTasks.filter((task) => task.priority === 'advisory'),
    }),
    [actionTasks],
  );

  const openActionCountByProduct = useMemo(
    () =>
      actionTasks.reduce<Record<string, number>>((accumulator, task) => {
        accumulator[task.audit.productName] =
          (accumulator[task.audit.productName] || 0) + 1;
        return accumulator;
      }, {}),
    [actionTasks],
  );

  const productInsights = useMemo(
    () => buildProductInsights(audits, productProfiles, openActionCountByProduct),
    [audits, productProfiles, openActionCountByProduct],
  );

  return {
    audits,
    productProfiles,
    filteredAudits,
    stats,
    coveredRegions,
    actionTasks,
    actionStats,
    groupedActionTasks,
    productInsights,
  };
}
