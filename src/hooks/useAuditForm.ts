import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { performAudit, quickCheck } from '../services/gemini';
import { User as FirebaseUser } from 'firebase/auth';

export const useAuditForm = (
  user: FirebaseUser | null,
  onAuditComplete: () => void,
) => {
  const [productDesc, setProductDesc] = useState('');
  const [quickCheckResult, setQuickCheckResult] = useState<{
    risk: 'high' | 'low';
    message: string;
  } | null>(null);
  const [region, setRegion] = useState('India');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [digitalImageFile, setDigitalImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [digitalImagePreview, setDigitalImagePreview] = useState<string | null>(
    null,
  );
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [auditStep, setAuditStep] = useState<
    'idle' | 'analyzing' | 'searching' | 'finalizing'
  >('idle');

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (productDesc.length > 10) {
        const result = await quickCheck(productDesc);
        setQuickCheckResult(result);
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
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
    setVideoFile(null);
    setPdfFiles([]);
    setImagePreview(null);
    setDigitalImagePreview(null);
    setVideoPreview(null);
    setRegion('India');
  };

  const handleStartAudit = async () => {
    if (!user || !productDesc) return;

    setIsUploading(true);
    setAuditStep('analyzing');
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

      if (videoFile) {
        const reader = new FileReader();
        const data = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(videoFile);
        });
        mediaItems.push({ data, mimeType: videoFile.type });
      }

      setAuditStep('searching');
      const dossierTexts = await Promise.all(
        pdfFiles.map(async (file) => {
          if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const text = await file.text();
            return `Supplier Document (${file.name}):\n${text}`;
          }
          return `Supplier Document: ${file.name} (Simulated 1M Token Context)`;
        }),
      );

      const report = await performAudit(
        productDesc,
        region,
        mediaItems,
        dossierTexts,
      );

      setAuditStep('finalizing');
      await addDoc(collection(db, 'audits'), {
        userId: user.uid,
        productName: report.productName || 'New Audit',
        productDescription: productDesc || '',
        region,
        complianceScore: report.complianceScore ?? 50,
        riskSummary: report.riskSummary || 'Audit summary missing.',
        status: 'completed',
        createdAt: new Date().toISOString(),
        findings: report.findings || [],
        thoughtSignature: report.thoughtSignature || 'OmniAudit AI',
        timestamp: serverTimestamp(),
        productImage: imagePreview || null,
        digitalImage: digitalImagePreview || null,
        twinMismatches: report.twinMismatches || [],
        fssaiCategory: report.fssaiCategory || null,
        categoryReasoning: report.categoryReasoning || null,
      });

      resetForm();
      onAuditComplete();
    } catch (error) {
      console.error('Audit failed:', error);
      alert('Audit failed. Please try again.');
    } finally {
      setIsUploading(false);
      setAuditStep('idle');
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
    videoPreview,
    pdfFiles,
    isUploading,
    auditStep,
    handleImageChange,
    handleDigitalImageChange,
    handleVideoChange,
    handlePdfChange,
    resetImage: () => {
      setImageFile(null);
      setImagePreview(null);
    },
    resetDigitalImage: () => {
      setDigitalImageFile(null);
      setDigitalImagePreview(null);
    },
    resetVideo: () => {
      setVideoFile(null);
      setVideoPreview(null);
    },
    resetPdfs: () => setPdfFiles([]),
    handleStartAudit,
  };
};
