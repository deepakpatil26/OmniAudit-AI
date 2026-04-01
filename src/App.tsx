import React, { useState, useEffect, useMemo } from 'react';
import {
  auth,
  signIn,
  logout,
  onAuthStateChanged,
  User,
  db,
} from './lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Loader2, TrendingDown, Clock, ShieldCheck, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
import { AuditReport } from './types/audit';

// Hooks
import { useVoiceConsult } from './hooks/useVoiceConsult';
import { useAuditForm } from './hooks/useAuditForm';

// Components
import { Header } from './components/layout/Header';
import {
  ProfileSuite,
  StatutoryUpdates,
  SuitePreferences,
  SuiteSettings,
} from './components/account/AccountPanels';
import { Landing } from './components/layout/Landing';
import { Auth } from './components/layout/Auth';
import { AuditCard } from './components/audit/AuditCard';
import { UploadModal } from './components/audit/UploadModal';
import { ReportModal } from './components/audit/ReportModal';
import { LiveConsultOverlay } from './components/audit/LiveConsultOverlay';

// Services
import { fixImage } from './services/gemini';
import { generateAuditPDF } from './services/pdfGenerator';

export default function App() {
  type AppView =
    | 'landing'
    | 'auth'
    | 'dashboard'
    | 'profile'
    | 'updates'
    | 'settings';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<AuditReport | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLiveConsult, setShowLiveConsult] = useState(false);
  const [isFixing, setIsFixing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high-risk'>('all');
  const [view, setView] = useState<AppView>('landing');
  const [profileRefreshTick, setProfileRefreshTick] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [suitePreferences, setSuitePreferences] = useState<SuitePreferences>(
    () => {
      const saved = localStorage.getItem('suitePreferences');
      if (!saved) {
        return {
          emailAlerts: true,
          weeklyDigest: true,
          autoOpenLatestReport: false,
        };
      }

      try {
        return JSON.parse(saved) as SuitePreferences;
      } catch {
        return {
          emailAlerts: true,
          weeklyDigest: true,
          autoOpenLatestReport: false,
        };
      }
    },
  );

  // Logic Hooks
  const { transcript, aiResponse, isConsultantThinking } =
    useVoiceConsult(showLiveConsult);
  const form = useAuditForm(user, () => {
    setShowUploadModal(false);
    setView('dashboard');
  });

  // Theme Logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('suitePreferences', JSON.stringify(suitePreferences));
  }, [suitePreferences]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && view === 'auth') {
        setView('dashboard');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [view]);

  // Audits Listener
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'audits'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const auditData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AuditReport[];
        setAudits(auditData);
      });
      return () => unsubscribe();
    } else {
      setAudits([]);
      if (view !== 'landing' && view !== 'auth') setView('landing');
    }
  }, [user, view]);

  // Filtering Logic
  const filteredAudits = useMemo(() => {
    if (filter === 'all') return audits;
    return audits.filter((audit) =>
      audit.findings.some((f) => f.status === 'discrepancy'),
    );
  }, [audits, filter]);

  // Insight Stats
  const stats = useMemo(() => {
    const highRiskCount = audits.filter((a) =>
      a.findings.some((f) => f.status === 'discrepancy'),
    ).length;
    const avgScore =
      audits.length > 0
        ? Math.round(
            audits.reduce((acc, curr) => acc + (curr.complianceScore || 0), 0) /
              audits.length,
          )
        : 100;
    const regions = new Set(audits.map((a) => a.region)).size;
    return { highRiskCount, avgScore, regions };
  }, [audits]);

  const coveredRegions = useMemo(() => {
    return Array.from(
      new Set(audits.map((audit) => audit.region).filter(Boolean)),
    );
  }, [audits]);

  const handleStartAuditClick = () => {
    if (!user) {
      setView('auth');
    } else {
      setShowUploadModal(true);
    }
  };

  const handleDeleteAudit = async (id: string) => {
    if (!window.confirm('Terminate this statutory record permanently?')) return;
    try {
      await deleteDoc(doc(db, 'audits', id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSaveDisplayName = async (displayName: string) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName });
    setProfileRefreshTick((value) => value + 1);
  };

  const handleFixImage = async (findingIdx: number) => {
    if (!selectedAudit || !selectedAudit.productImage) return;
    const finding = selectedAudit.findings[findingIdx];
    if (!finding.visualFixPrompt) return;
    setIsFixing(findingIdx.toString());
    try {
      const fixedImage = await fixImage(
        selectedAudit.productImage,
        finding.visualFixPrompt,
      );
      const updatedFindings = [...selectedAudit.findings];
      updatedFindings[findingIdx] = {
        ...finding,
        status: 'verified',
        reasoning: `Visual correction applied: ${finding.reasoning}`,
        visualFixPrompt: undefined,
      };
      const updatedAudit = {
        ...selectedAudit,
        productImage: fixedImage,
        findings: updatedFindings,
        complianceScore: Math.min(100, selectedAudit.complianceScore + 10),
      };
      setSelectedAudit(updatedAudit);
      if (selectedAudit.id) {
        const auditRef = doc(db, 'audits', selectedAudit.id);
        await updateDoc(auditRef, {
          productImage: fixedImage,
          findings: updatedFindings,
          complianceScore: updatedAudit.complianceScore,
        });
      }
    } finally {
      setIsFixing(null);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-white dark:bg-[#0B0F19] flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-indigo-600' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-theme-secondary text-text-primary transition-colors duration-300'>
      {view !== 'auth' && (
        <Header
          onShowLiveConsult={() => setShowLiveConsult(true)}
          onShowUploadModal={handleStartAuditClick}
          onShowHistory={() => setView('dashboard')}
          onShowFeatures={() => setView('landing')}
          onOpenProfile={() => setView('profile')}
          onOpenUpdates={() => setView('updates')}
          onOpenSettings={() => setView('settings')}
          onLogout={logout}
          isLoggedIn={!!user}
          currentView={view}
          user={user}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      )}

      <AnimatePresence mode='wait'>
        {view === 'landing' && (
          <motion.div
            key='landing'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <Landing
              onStartAudit={handleStartAuditClick}
              isLoggedIn={!!user}
            />
          </motion.div>
        )}

        {view === 'auth' && (
          <motion.div
            key='auth'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}>
            <Auth
              onSignIn={signIn}
              onBack={() => setView('landing')}
            />
          </motion.div>
        )}

        {view === 'dashboard' && user && (
          <motion.main
            key='dashboard'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
            {/* Expert Insight Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
              <div className='bg-theme-primary p-6 rounded-[2rem] border border-border-primary shadow-sm'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400'>
                    <TrendingDown className='w-6 h-6' />
                  </div>
                  <div>
                    <div className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
                      Risk detections
                    </div>
                    <div className='text-3xl font-bold text-text-primary leading-none mt-1'>
                      {stats.highRiskCount}
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-theme-primary p-6 rounded-[2rem] border border-border-primary shadow-sm'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400'>
                    <ShieldCheck className='w-6 h-6' />
                  </div>
                  <div>
                    <div className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
                      Integrity Score
                    </div>
                    <div className='text-3xl font-bold text-text-primary leading-none mt-1'>
                      {stats.avgScore}%
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-theme-primary p-6 rounded-[2rem] border border-border-primary shadow-sm'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400'>
                    <Globe className='w-6 h-6' />
                  </div>
                  <div>
                    <div className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
                      Market Coverage
                    </div>
                    <div className='text-3xl font-bold text-text-primary leading-none mt-1'>
                      {stats.regions} Regions
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4'>
              <div>
                <h2 className='text-2xl font-bold text-text-primary tracking-tight leading-none'>
                  Expert Ledger
                </h2>
                <p className='text-sm text-text-secondary font-medium italic mt-2'>
                  Manage your statutory compliance reports.
                </p>
              </div>
              <div className='flex items-center gap-2 bg-theme-primary p-1 rounded-xl border border-border-primary shadow-sm'>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                    filter === 'all'
                      ? 'bg-theme-secondary text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}>
                  All Records
                </button>
                <button
                  onClick={() => setFilter('high-risk')}
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                    filter === 'high-risk'
                      ? 'bg-red-50 dark:bg-red-900/40 text-red-600'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}>
                  High Risk
                </button>
              </div>
            </div>

            {filteredAudits.length === 0 ? (
              <div className='bg-white dark:bg-gray-800/30 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-16 text-center'>
                <div className='w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6'>
                  <Clock className='text-indigo-400 dark:text-indigo-600 w-8 h-8' />
                </div>
                <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight'>
                  {filter === 'all'
                    ? 'Statutory Ledger Empty'
                    : 'No Critical Deviations Found'}
                </h3>
                <p className='text-gray-500 dark:text-gray-400 mb-10 max-w-sm mx-auto font-medium'>
                  Your compliance history is clear. Ready to initiate a new
                  statutory verification?
                </p>
                <button
                  onClick={handleStartAuditClick}
                  className='inline-flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-100 dark:shadow-none'>
                  Initiate Audit
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {filteredAudits.map((audit) => (
                  <AuditCard
                    key={audit.id}
                    audit={audit}
                    onViewReport={setSelectedAudit}
                    onDelete={handleDeleteAudit}
                  />
                ))}
              </div>
            )}
          </motion.main>
        )}

        {view === 'profile' && user && (
          <motion.div
            key='profile'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}>
            <ProfileSuite
              user={user}
              auditCount={audits.length}
              regionCount={coveredRegions.length}
              onBack={() => setView('dashboard')}
              onSaveDisplayName={handleSaveDisplayName}
            />
          </motion.div>
        )}

        {view === 'updates' && user && (
          <motion.div
            key='updates'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}>
            <StatutoryUpdates
              regions={coveredRegions}
              onBack={() => setView('dashboard')}
            />
          </motion.div>
        )}

        {view === 'settings' && user && (
          <motion.div
            key='settings'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}>
            <SuiteSettings
              preferences={suitePreferences}
              onBack={() => setView('dashboard')}
              onUpdatePreferences={setSuitePreferences}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        {...form}
      />
      <ReportModal
        audit={selectedAudit}
        onClose={() => setSelectedAudit(null)}
        onGeneratePDF={generateAuditPDF}
        onFixImage={handleFixImage}
        isFixing={isFixing}
      />
      <LiveConsultOverlay
        show={showLiveConsult}
        onClose={() => setShowLiveConsult(false)}
        transcript={transcript}
        aiResponse={aiResponse}
        isConsultantThinking={isConsultantThinking}
      />
    </div>
  );
}
