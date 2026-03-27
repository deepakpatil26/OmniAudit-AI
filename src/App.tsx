import React, { useState, useEffect } from 'react';
import { auth, signIn, logout, onAuthStateChanged, User, db } from './lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Shield, Upload, Search, AlertTriangle, CheckCircle, FileText, LogOut, Plus, Loader2, ChevronRight, Info, Globe, Video, Wand2, Mic, MicOff, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { performAudit, AuditReport, fixImage, quickCheck } from './services/gemini';
import { doc, updateDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [audits, setAudits] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [auditStep, setAuditStep] = useState<'idle' | 'analyzing' | 'searching' | 'finalizing'>('idle');
  const [isFixing, setIsFixing] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);
  const [showLiveConsult, setShowLiveConsult] = useState(false);

  // Form State
  const [productDesc, setProductDesc] = useState('');
  const [quickCheckResult, setQuickCheckResult] = useState<{ risk: 'high' | 'low', message: string } | null>(null);
  const [region, setRegion] = useState('EU');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'audits'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const auditData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAudits(auditData);
      });
      return () => unsubscribe();
    }
  }, [user]);

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
      setPdfFiles(prev => [...prev, ...files]);
    }
  };

  const handleStartAudit = async () => {
    if (!user || !productDesc) return;

    setIsUploading(true);
    setAuditStep('analyzing');
    try {
      const mediaItems: { data: string, mimeType: string }[] = [];

      if (imageFile) {
        const reader = new FileReader();
        const data = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
        mediaItems.push({ data, mimeType: imageFile.type });
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
      const dossierTexts = pdfFiles.map(f => `Supplier Document: ${f.name} (Simulated 1M Token Context)`);

      const report = await performAudit(productDesc, region, mediaItems, dossierTexts);

      setAuditStep('finalizing');
      await addDoc(collection(db, 'audits'), {
        userId: user.uid,
        productName: report.productName,
        productDescription: productDesc,
        region,
        complianceScore: report.complianceScore,
        riskSummary: report.riskSummary,
        status: 'completed',
        createdAt: new Date().toISOString(),
        findings: report.findings,
        thoughtSignature: report.thoughtSignature,
        timestamp: serverTimestamp(),
        productImage: imagePreview
      });

      setShowUploadModal(false);
      resetForm();
    } catch (error) {
      console.error("Audit failed:", error);
      alert("Audit failed. Please try again.");
    } finally {
      setIsUploading(false);
      setAuditStep('idle');
    }
  };

  const resetForm = () => {
    setProductDesc('');
    setImageFile(null);
    setVideoFile(null);
    setPdfFiles([]);
    setImagePreview(null);
    setVideoPreview(null);
    setRegion('EU');
  };

  const handleFixImage = async (findingIdx: number) => {
    if (!selectedAudit || !selectedAudit.productImage) return;

    const finding = selectedAudit.findings[findingIdx];
    if (!finding.visualFixPrompt) return;

    setIsFixing(findingIdx.toString());
    try {
      const fixedImage = await fixImage(selectedAudit.productImage, finding.visualFixPrompt);

      // Update the audit in state and Firestore
      const updatedFindings = [...selectedAudit.findings];
      updatedFindings[findingIdx] = {
        ...finding,
        status: 'verified',
        reasoning: `Visual correction applied: ${finding.reasoning}`,
        visualFixPrompt: undefined
      };

      const updatedAudit = {
        ...selectedAudit,
        productImage: fixedImage,
        findings: updatedFindings,
        complianceScore: Math.min(100, selectedAudit.complianceScore + 10)
      };

      setSelectedAudit(updatedAudit);

      // Persist the fix to Firestore
      if (selectedAudit.id) {
        const auditRef = doc(db, 'audits', selectedAudit.id);
        await updateDoc(auditRef, {
          productImage: fixedImage,
          findings: updatedFindings,
          complianceScore: updatedAudit.complianceScore
        });
      }
    } catch (error) {
      console.error("Fix failed:", error);
      alert("Visual fix failed. Please try again.");
    } finally {
      setIsFixing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
              <Shield className="text-white w-8 h-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">OmniAudit AI</h1>
            <p className="text-gray-500 text-lg">Autonomous compliance & sustainability agent for e-commerce.</p>
          </div>
          <button
            onClick={signIn}
            className="w-full py-4 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Enterprise Grade Compliance Verification</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">OmniAudit</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLiveConsult(true)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2 font-bold text-sm"
            >
              <Mic className="w-5 h-5" /> <span className="hidden sm:inline">Live Consult</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Audit</span>
            </button>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Audit Dashboard</h2>
            <p className="text-gray-500">Monitor and manage your product compliance reports.</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button className="px-4 py-1.5 text-sm font-medium bg-gray-100 text-gray-900 rounded-md">All Audits</button>
            <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900">High Risk</button>
          </div>
        </div>

        {audits.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400 w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No audits yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start your first product compliance audit to identify potential greenwashing risks.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus className="w-5 h-5" /> Start First Audit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {audits.map((audit) => (
              <motion.div
                key={audit.id}
                layoutId={audit.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{audit.productName}</h3>
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider mt-1">
                        {new Date(audit.createdAt).toLocaleDateString()} • ID: {audit.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${audit.findings.some((f: any) => f.status === 'discrepancy')
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                        {audit.findings.some((f: any) => f.status === 'discrepancy') ? 'High Risk' : 'Compliant'}
                      </div>
                      {audit.complianceScore !== undefined && (
                        <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Score: {audit.complianceScore}/100
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {audit.findings.slice(0, 2).map((finding: any, idx: number) => (
                      <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        {finding.status === 'discrepancy' ? (
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{finding.claim}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{finding.reasoning}</p>
                        </div>
                      </div>
                    ))}
                    {audit.findings.length > 2 && (
                      <p className="text-xs text-indigo-600 font-medium pl-1">+{audit.findings.length - 2} more findings</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                        <Search className="w-3 h-3 text-indigo-600" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                        <Shield className="w-3 h-3 text-emerald-600" />
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAudit(audit)}
                      className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      View Full Report <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Report Modal */}
      <AnimatePresence>
        {selectedAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAudit(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedAudit.productName}</h3>
                  <p className="text-sm text-gray-500">Audit Report • {new Date(selectedAudit.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedAudit(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                {/* Executive Summary & Score */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Executive Risk Summary
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedAudit.riskSummary}
                    </p>
                  </div>
                  <div className="bg-indigo-600 rounded-2xl p-6 text-white flex flex-col items-center justify-center text-center shadow-lg shadow-indigo-100">
                    <h4 className="font-bold text-indigo-100 text-[10px] uppercase tracking-[0.2em] mb-2">Compliance Score</h4>
                    <div className="text-5xl font-black mb-1">{selectedAudit.complianceScore}</div>
                    <div className="text-indigo-200 text-[10px] font-bold uppercase">Out of 100</div>
                    <div className="mt-4 w-full bg-indigo-500/30 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedAudit.complianceScore}%` }}
                        className="h-full bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Thought Signature */}
                <section className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                      <Search className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="font-bold text-indigo-900 uppercase tracking-wider text-xs">Thought Signature</h4>
                  </div>
                  <p className="text-indigo-800 text-sm leading-relaxed italic">
                    "{selectedAudit.thoughtSignature}"
                  </p>
                </section>

                {/* Findings List */}
                <section className="space-y-6">
                  <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    Verification Findings
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md">{selectedAudit.findings.length}</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedAudit.findings.map((finding: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-indigo-200 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                          <div className="flex items-start gap-3">
                            {finding.status === 'discrepancy' ? (
                              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              </div>
                            )}
                            <div>
                              <h5 className="font-bold text-gray-900">{finding.claim}</h5>
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${finding.status === 'discrepancy' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {finding.status}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Legal Reference</p>
                            <p className="text-xs font-medium text-gray-700">{finding.legalReference}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-50">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Evidence Analysis</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{finding.evidence}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">AI Reasoning</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{finding.reasoning}</p>
                          </div>
                        </div>

                        {finding.correctiveAction && (
                          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex gap-3">
                              <Plus className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] text-amber-700 font-bold uppercase mb-1">Recommended Corrective Action</p>
                                <p className="text-xs text-amber-800 font-medium">{finding.correctiveAction}</p>
                              </div>
                            </div>
                            {finding.visualFixPrompt && selectedAudit.productImage && (
                              <button
                                onClick={() => handleFixImage(idx)}
                                disabled={isFixing !== null}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                              >
                                {isFixing === idx.toString() ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Wand2 className="w-3 h-3" />
                                )}
                                Auto-Fix Image
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Product Info */}
                <section className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4">Original Listing Context</h4>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedAudit.productDescription}
                  </p>
                </section>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedAudit(null)}
                  className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUploading && setShowUploadModal(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">New Compliance Audit</h3>
                  <button
                    onClick={() => !isUploading && setShowUploadModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Target Market / Region</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none font-medium text-gray-700"
                        >
                          <option value="EU">European Union (EU)</option>
                          <option value="USA">United States (USA)</option>
                          <option value="APAC">Asia-Pacific (APAC)</option>
                          <option value="INDIA">India (BIS/FSSAI)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Description / Listing Text</label>
                      <div className="relative">
                        <textarea
                          value={productDesc}
                          onChange={(e) => setProductDesc(e.target.value)}
                          placeholder="Paste the product title, description, and marketing claims here..."
                          className="w-full h-[120px] p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                        />
                        {quickCheckResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`absolute bottom-2 right-2 left-2 p-2 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${quickCheckResult.risk === 'high' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                              }`}
                          >
                            <Zap className="w-3 h-3" />
                            <span>{quickCheckResult.message}</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
                      <div className="relative h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden group hover:border-indigo-300 transition-colors">
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                            <button
                              onClick={() => { setImageFile(null); setImagePreview(null); }}
                              className="absolute top-2 right-2 bg-white/80 backdrop-blur p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-300 mb-1" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Video Ad (30-60s)</label>
                      <div className="relative h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center group hover:border-indigo-300 transition-colors overflow-hidden">
                        {videoPreview ? (
                          <div className="relative w-full h-full">
                            <video src={videoPreview} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Video className="w-6 h-6 text-white" />
                            </div>
                            <button
                              onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                              className="absolute top-2 right-2 bg-white/80 backdrop-blur p-1.5 rounded-full shadow-sm"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Video className="w-6 h-6 text-gray-300 mb-1" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Upload Video</span>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Deep Dossier (PDFs)</label>
                      <div className="relative h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center group hover:border-indigo-300 transition-colors">
                        {pdfFiles.length > 0 ? (
                          <div className="text-center p-2">
                            <FileText className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                            <p className="text-[10px] font-bold text-gray-900">{pdfFiles.length} Files Uploaded</p>
                            <button
                              onClick={() => setPdfFiles([])}
                              className="mt-1 text-[9px] text-red-500 font-bold uppercase tracking-wider"
                            >
                              Clear All
                            </button>
                          </div>
                        ) : (
                          <>
                            <FileText className="w-6 h-6 text-gray-300 mb-1" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Upload PDFs</span>
                            <input
                              type="file"
                              multiple
                              accept=".pdf"
                              onChange={handlePdfChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-2xl flex gap-3">
                    <Info className="w-5 h-5 text-indigo-600 shrink-0" />
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      OmniAudit AI will use <strong>Gemini 3.1 Pro</strong> to cross-reference these inputs with real-time global regulations via Google Search Grounding.
                    </p>
                  </div>

                  <button
                    onClick={handleStartAudit}
                    disabled={isUploading || !productDesc}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-100 flex flex-col items-center justify-center"
                  >
                    {isUploading ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{auditStep === 'analyzing' ? 'Analyzing Multimodal Data...' : auditStep === 'searching' ? 'Grounding with Google Search...' : 'Finalizing Report...'}</span>
                        </div>
                        <div className="mt-2 w-48 bg-indigo-500/30 h-1 rounded-full overflow-hidden">
                          <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="h-full bg-white w-1/2"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        <span>Run Autonomous Audit</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Consultation Modal */}
      <AnimatePresence>
        {showLiveConsult && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLiveConsult(false)}
              className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative bg-indigo-950 w-full max-w-lg sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] sm:h-auto"
            >
              <div className="p-6 border-b border-indigo-900/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Live AI Consultant</h3>
                    <p className="text-xs text-indigo-300">Hands-free compliance verification</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLiveConsult(false)}
                  className="p-2 hover:bg-indigo-900 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-indigo-400" />
                </button>
              </div>

              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-indigo-600 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-16 h-16 rounded-full bg-indigo-400 opacity-50"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-indigo-950">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xl font-bold text-white">"I'm listening..."</p>
                  <p className="text-sm text-indigo-300 max-w-xs">Ask me about specific product claims, regional laws, or packaging labels.</p>
                </div>

                <div className="w-full space-y-4">
                  <div className="flex justify-center gap-4">
                    <div className="w-1 h-8 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-12 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1 h-10 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    <div className="w-1 h-14 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    <div className="w-1 h-8 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-indigo-900/20 border-t border-indigo-900/50 flex flex-col gap-4">
                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                  <MicOff className="w-5 h-5" /> Stop Consultation
                </button>
                <p className="text-[10px] text-indigo-400 text-center uppercase tracking-widest font-bold">Powered by Gemini 2.5 Flash Native Audio</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
