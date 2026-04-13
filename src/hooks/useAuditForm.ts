import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { performAudit, quickCheck } from '../services/gemini';
import { User as FirebaseUser } from 'firebase/auth';
import { DEFAULT_AUDIT_REGION } from '../lib/auditConfig';
import type { AuditLifecycleStatus } from '../types/audit';
import {
  addDaysToIso,
  DEFAULT_REVIEW_CADENCE_DAYS,
  deriveProductStatus,
} from '../lib/productIntelligence';

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Audit failed. Please try again.';
}

function createProductKey(userId: string, productName: string) {
  const normalizedName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return `${userId}__${normalizedName || 'product'}`;
}

export const useAuditForm = (
  user: FirebaseUser | null,
  allowVisionAudits: boolean,
  onAuditComplete: () => void,
) => {
  const [productDesc, setProductDesc] = useState('');
  const [quickCheckResult, setQuickCheckResult] = useState<{
    risk: 'high' | 'low';
    message: string;
  } | null>(null);
  const [region, setRegion] = useState(DEFAULT_AUDIT_REGION);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [digitalImageFile, setDigitalImageFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [digitalImagePreview, setDigitalImagePreview] = useState<string | null>(
    null,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [auditStep, setAuditStep] = useState<AuditLifecycleStatus>('queued');

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (productDesc.length > 10) {
        try {
          const result = await quickCheck(productDesc);
          setQuickCheckResult(result);
        } catch {
          setQuickCheckResult(null);
        }
      } else {
        setQuickCheckResult(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [productDesc]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDigitalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDigitalImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setDigitalImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPdfFiles((prev) => [...prev, ...files]);
    }
  };

  const resetForm = () => {
    setProductDesc('');
    setImageFile(null);
    setDigitalImageFile(null);
    setPdfFiles([]);
    setImagePreview(null);
    setDigitalImagePreview(null);
    setRegion(DEFAULT_AUDIT_REGION);
    setSubmitError(null);
    setAuditStep('queued');
  };

  const handleStartAudit = async () => {
    if (!user || !productDesc) return;

    if (!allowVisionAudits && (imageFile || digitalImageFile)) {
      setSubmitError(
        'Vision audits are turned off in Suite Settings. Remove images for a text-only audit or enable vision audits to compare packaging and listing assets.',
      );
      return;
    }

    setSubmitError(null);
    setIsUploading(true);
    setAuditStep('preparing');
    let didFail = false;
    try {
      const mediaItems: { data: string; mimeType: string; label?: string }[] =
        [];

      if (imageFile) {
        const reader = new FileReader();
        const data = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
        mediaItems.push({
          data,
          mimeType: imageFile.type,
          label: 'Physical Label Ground Truth',
        });
      }

      if (digitalImageFile) {
        const reader = new FileReader();
        const data = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(digitalImageFile);
        });
        mediaItems.push({
          data,
          mimeType: digitalImageFile.type,
          label: 'Digital Listing Screenshot',
        });
      }

      setAuditStep('cross-checking');
      const dossierTexts = await Promise.all(
        pdfFiles.map(async (file) => {
          if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const text = await file.text();
            return `Supplier Document (${file.name}):\n${text}`;
          }
          return `Supplier Document: ${file.name} (Simulated 1M Token Context)`;
        }),
      );

      setAuditStep('analyzing');
      const report = await performAudit(
        productDesc,
        region,
        mediaItems,
        dossierTexts,
      );

      setAuditStep('finalizing');
      const createdAtIso = new Date().toISOString();
      const auditDoc = await addDoc(collection(db, 'audits'), {
        userId: user.uid,
        productName: report.productName || 'New Audit',
        productDescription: productDesc || '',
        region,
        complianceScore: report.complianceScore ?? 50,
        riskSummary: report.riskSummary || 'Audit summary missing.',
        createdAt: createdAtIso,
        findings: report.findings || [],
        thoughtSignature: report.thoughtSignature || 'OmniAudit AI',
        timestamp: serverTimestamp(),
        productImage: imagePreview || null,
        digitalImage: digitalImagePreview || null,
        shelfLife: report.shelfLife || null,
        twinMismatches: report.twinMismatches || [],
        fssaiCategory: report.fssaiCategory || null,
        categoryReasoning: report.categoryReasoning || null,
        status: 'completed',
      });

      const productKey = createProductKey(
        user.uid,
        report.productName || 'New Audit',
      );
      const profileRef = doc(db, 'productProfiles', productKey);
      const productStatus = deriveProductStatus({
        ...report,
        productDescription: productDesc,
        region,
        createdAt: createdAtIso,
      });

      let profileSyncWarning: string | null = null;

      try {
        const existingProfile = await getDoc(profileRef);
        const existingData = existingProfile.data();
        const nextAuditCount = existingProfile.exists()
          ? Math.max(1, (existingData?.auditCount || 0) + 1)
          : 1;
        const reviewCadenceDays =
          existingData?.reviewCadenceDays || DEFAULT_REVIEW_CADENCE_DAYS;

        await setDoc(
          profileRef,
          {
            userId: user.uid,
            productKey,
            productName: report.productName || 'New Audit',
            region,
            auditCount: nextAuditCount,
            lastAuditAt: createdAtIso,
            lastReviewedAt: createdAtIso,
            nextReviewAt: addDaysToIso(createdAtIso, reviewCadenceDays),
            reviewCadenceDays,
            productStatus,
            lastAuditId: auditDoc.id,
            lastComplianceScore: report.complianceScore ?? 50,
            latestRiskSummary: report.riskSummary || 'Audit summary missing.',
            openFindingsCount: (report.findings || []).filter(
              (finding) => finding.status === 'discrepancy',
            ).length,
            timestamp: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (profileError) {
        console.error('Product profile sync failed:', profileError);
        profileSyncWarning =
          'Audit saved, but Product Memory could not sync. This is usually caused by an older profile record with legacy permissions. You can keep auditing, and we can clean the legacy productProfiles entry separately if needed.';
      }

      resetForm();
      if (profileSyncWarning) {
        setSubmitError(profileSyncWarning);
      }
      onAuditComplete();
    } catch (error) {
      console.error('Audit failed:', error);
      setSubmitError(getErrorMessage(error));
      setAuditStep('failed');
      didFail = true;
    } finally {
      setIsUploading(false);
      if (!didFail) {
        setAuditStep('queued');
      }
    }
  };

  return {
    productDesc,
    setProductDesc,
    region,
    setRegion,
    quickCheckResult,
    imagePreview,
    digitalImagePreview,
    pdfFiles,
    allowVisionAudits,
    isUploading,
    submitError,
    auditStep,
    handleImageChange,
    handleDigitalImageChange,
    handlePdfChange,
    clearSubmitError: () => setSubmitError(null),
    resetImage: () => {
      setImageFile(null);
      setImagePreview(null);
    },
    resetDigitalImage: () => {
      setDigitalImageFile(null);
      setDigitalImagePreview(null);
    },
    resetPdfs: () => setPdfFiles([]),
    handleStartAudit,
  };
};
