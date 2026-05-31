import React, {
  Suspense,
  lazy,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  auth,
  signIn,
  logout,
  onAuthStateChanged,
  User,
  db,
} from './lib/firebase';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  History,
  Layers3,
  LayoutDashboard,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuditReport } from './types/audit';
import { AppView, AuditSort, SuitePreferences } from './types/app';
import { ActionTask } from './lib/actionCenter';
import {
  addDaysToIso,
  DEFAULT_REVIEW_CADENCE_DAYS,
  ProductInsightDetail,
} from './lib/productIntelligence';
import { useDashboardData } from './hooks/useDashboardData';
import { useAppSettings } from './contexts/AppSettingsContext';
import { useVoiceConsult } from './hooks/useVoiceConsult';
import { useAuditForm } from './hooks/useAuditForm';
import { Header } from './components/layout/Header';
import { CopilotDock } from './components/ai/CopilotDock';
import { DashboardView } from './components/app/DashboardView';
import { LoadingFallback } from './components/ui/LoadingFallback';
import { RouteBoundary } from './components/ui/RouteBoundary';
import { fixImage } from './services/gemini';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { Toast } from './components/ui/Toast';

const Landing = lazy(() =>
  import('./components/layout/Landing').then((module) => ({
    default: module.Landing,
  })),
);
const Auth = lazy(() =>
  import('./components/layout/Auth').then((module) => ({
    default: module.Auth,
  })),
);
const ProfileSuite = lazy(() =>
  import('./components/account/AccountPanels').then((module) => ({
    default: module.ProfileSuite,
  })),
);
const StatutoryUpdates = lazy(() =>
  import('./components/account/AccountPanels').then((module) => ({
    default: module.StatutoryUpdates,
  })),
);
const SuiteSettings = lazy(() =>
  import('./components/account/AccountPanels').then((module) => ({
    default: module.SuiteSettings,
  })),
);
const UploadModal = lazy(() =>
  import('./components/audit/UploadModal').then((module) => ({
    default: module.UploadModal,
  })),
);
const ReportModal = lazy(() =>
  import('./components/audit/ReportModal').then((module) => ({
    default: module.ReportModal,
  })),
);
const LiveConsultOverlay = lazy(() =>
  import('./components/audit/LiveConsultOverlay').then((module) => ({
    default: module.LiveConsultOverlay,
  })),
);

type LedgerTab = 'overview' | 'actions' | 'products' | 'records';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState<AuditReport | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductInsightDetail | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLiveConsult, setShowLiveConsult] = useState(false);
  const [isFixing, setIsFixing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high-risk'>('all');
  const [view, setView] = useState<AppView>('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<AuditSort>('newest');
  const [ledgerTab, setLedgerTab] = useState<LedgerTab>('overview');
  // theme and suite preferences moved to AppSettingsContext
  const [toast, setToast] = useState<{
    message: string;
    tone: 'success' | 'error';
  } | null>(null);
  const [auditPendingDelete, setAuditPendingDelete] =
    useState<AuditReport | null>(null);
  const [resolvedActionIds, setResolvedActionIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('resolvedActionIds');
    if (!saved) return [];
    try {
      return JSON.parse(saved) as string[];
    } catch {
      return [];
    }
  });
  const autoOpenedLatestRef = useRef<string | null>(null);

  const { settings, updateDarkMode, updateSuitePreferences } = useAppSettings();
  const suitePreferences = settings.suitePreferences;

  const { transcript, aiResponse, isConsultantThinking } =
    useVoiceConsult(showLiveConsult);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const {
    audits,
    productProfiles,
    filteredAudits,
    stats,
    coveredRegions,
    actionTasks,
    actionStats,
    groupedActionTasks,
    productInsights,
  } = useDashboardData({
    user,
    view,
    deferredSearchQuery,
    filter,
    sortBy,
    resolvedActionIds,
  });

  const form = useAuditForm(user, suitePreferences.allowVisionAudits, () => {
    setShowUploadModal(false);
    setView('dashboard');
    setToast({
      message: 'Audit completed and saved to your ledger.',
      tone: 'success',
    });
  });

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // theme managed by AppSettingsContext

  useEffect(() => {
    localStorage.setItem(
      'resolvedActionIds',
      JSON.stringify(resolvedActionIds),
    );
  }, [resolvedActionIds]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && view === 'auth') {
        setView('dashboard');
      }
      if (!currentUser) {
        autoOpenedLatestRef.current = null;
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [view]);

  useEffect(() => {
    if (!user && view !== 'landing' && view !== 'auth') {
      setView('landing');
      setSelectedProduct(null);
    }
  }, [user, view]);

  useEffect(() => {
    if (
      !suitePreferences.autoOpenLatestReport ||
      view !== 'dashboard' ||
      selectedAudit ||
      audits.length === 0
    ) {
      return;
    }

    const latestAudit = audits[0];
    if (!latestAudit?.id || autoOpenedLatestRef.current === latestAudit.id) {
      return;
    }

    setSelectedAudit(latestAudit);
    autoOpenedLatestRef.current = latestAudit.id;
  }, [audits, selectedAudit, suitePreferences.autoOpenLatestReport, view]);

  useEffect(() => {
    if (!selectedProduct) return;
    const refreshed = productInsights.find(
      (insight) =>
        insight.profile.productKey === selectedProduct.profile.productKey,
    );
    if (refreshed) {
      setSelectedProduct(refreshed);
    }
  }, [productInsights, selectedProduct]);

  const copilotContextTitle = selectedAudit
    ? `${selectedAudit.productName} report`
    : selectedProduct
      ? `${selectedProduct.profile.productName} workspace`
      : view === 'dashboard'
        ? 'Audit ledger'
        : view === 'updates'
          ? 'Statutory updates'
          : view === 'settings'
            ? 'Suite settings'
            : 'OmniAudit workspace';

  const copilotContextPrompt = selectedAudit
    ? `You are helping with a compliance report for ${selectedAudit.productName} in ${selectedAudit.region}. Risk summary: ${selectedAudit.riskSummary}`
    : selectedProduct
      ? `You are helping with product memory for ${selectedProduct.profile.productName}. Latest summary: ${selectedProduct.profile.latestRiskSummary}. Reminder state: ${selectedProduct.reminderLabel}.`
      : view === 'dashboard'
        ? 'You are helping a user understand their OmniAudit compliance ledger, audit history, and risk signals.'
        : view === 'updates'
          ? 'You are helping a user understand update prioritization, routine reminders, and critical notices in OmniAudit.'
          : view === 'settings'
            ? 'You are helping a user understand real workspace settings and how they change behavior inside OmniAudit.'
            : 'You are helping a user understand how to use OmniAudit effectively.';

  const copilotPrompts = selectedAudit
    ? [
        'Why did this audit get this score?',
        'What should I fix first in this report?',
        'How should I explain these risks to my team?',
      ]
    : selectedProduct
      ? [
          'What changed for this product since the last audit?',
          'What should I review before the next audit?',
          'Why is this product on watchlist?',
        ]
      : view === 'dashboard'
        ? [
            'How should I prioritize the audits in this ledger?',
            'What usually leads to high-risk findings?',
            'What makes a strong audit package?',
          ]
        : [
            'How do I get the best result from OmniAudit?',
            'What should I upload before running an audit?',
            'What can the AI copilot help me with?',
          ];

  const showUpdatePulse = suitePreferences.highlightCriticalUpdates;

  const handleStartReaudit = (task: ActionTask) => {
    form.clearSubmitError();
    form.setRegion(task.audit.region as any);
    form.setProductDesc(task.audit.productDescription);
    setSelectedProduct(null);
    setShowUploadModal(true);
    setToast({
      message: `Re-audit draft prepared for ${task.audit.productName}.`,
      tone: 'success',
    });
  };

  const handleStartProductReaudit = (productInsight: ProductInsightDetail) => {
    form.clearSubmitError();
    form.setRegion(productInsight.profile.region as any);
    form.setProductDesc(
      productInsight.latestAudit?.productDescription ||
        productInsight.profile.latestRiskSummary,
    );
    setSelectedProduct(null);
    setShowUploadModal(true);
    setToast({
      message: `Re-audit draft prepared for ${productInsight.profile.productName}.`,
      tone: 'success',
    });
  };

  const handleResolveAction = (actionId: string) => {
    setResolvedActionIds((current) =>
      current.includes(actionId) ? current : [...current, actionId],
    );
  };

  const handleStartAuditClick = () => {
    if (!user) {
      setView('auth');
    } else {
      form.clearSubmitError();
      setShowUploadModal(true);
    }
  };

  const handleOpenAuditById = (auditId: string) => {
    const audit = audits.find((item) => item.id === auditId);
    if (audit) {
      setSelectedAudit(audit);
    }
  };

  const handleUpdateProductCadence = async (
    insight: ProductInsightDetail,
    cadenceDays: number,
  ) => {
    try {
      const baseDate =
        insight.profile.lastReviewedAt ||
        insight.profile.lastAuditAt ||
        new Date().toISOString();
      await updateDoc(doc(db, 'productProfiles', insight.profile.productKey), {
        reviewCadenceDays: cadenceDays,
        nextReviewAt: addDaysToIso(baseDate, cadenceDays),
        timestamp: serverTimestamp(),
      });
      setToast({
        message: `Review cadence updated to ${cadenceDays} days.`,
        tone: 'success',
      });
    } catch (error) {
      console.error('Cadence update failed:', error);
      setToast({
        message: 'Unable to update the review cadence right now.',
        tone: 'error',
      });
    }
  };

  const handleMarkProductReviewed = async (insight: ProductInsightDetail) => {
    try {
      const reviewedAt = new Date().toISOString();
      const cadenceDays =
        insight.profile.reviewCadenceDays || DEFAULT_REVIEW_CADENCE_DAYS;
      await updateDoc(doc(db, 'productProfiles', insight.profile.productKey), {
        lastReviewedAt: reviewedAt,
        nextReviewAt: addDaysToIso(reviewedAt, cadenceDays),
        timestamp: serverTimestamp(),
      });
      setToast({
        message: `${insight.profile.productName} marked reviewed.`,
        tone: 'success',
      });
    } catch (error) {
      console.error('Mark reviewed failed:', error);
      setToast({
        message: 'Unable to mark this product reviewed right now.',
        tone: 'error',
      });
    }
  };

  const handleConfirmDeleteAudit = async () => {
    if (!auditPendingDelete?.id) return;
    try {
      await deleteDoc(doc(db, 'audits', auditPendingDelete.id));
      setToast({
        message: 'Audit removed from your ledger.',
        tone: 'success',
      });
    } catch (error) {
      console.error('Delete failed:', error);
      setToast({
        message: 'Unable to remove this audit right now.',
        tone: 'error',
      });
    } finally {
      setAuditPendingDelete(null);
    }
  };

  const handleSaveDisplayName = async (displayName: string) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName });
      setUser((currentUser) =>
        currentUser ? ({ ...currentUser, displayName } as User) : currentUser,
      );
      setToast({
        message: 'Profile display name updated.',
        tone: 'success',
      });
    } catch (error) {
      console.error('Profile update failed:', error);
      setToast({
        message: 'Unable to update your profile right now.',
        tone: 'error',
      });
      throw error;
    }
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
      const { visualFixPrompt: _visualFixPrompt, ...findingWithoutPrompt } =
        finding;
      updatedFindings[findingIdx] = {
        ...findingWithoutPrompt,
        status: 'verified',
        reasoning: `Visual correction applied: ${finding.reasoning}`,
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
      setToast({
        message: 'Visual fix applied to the report preview.',
        tone: 'success',
      });
    } catch (error) {
      console.error('Visual fix failed:', error);
      setToast({
        message: 'Unable to apply the visual fix right now.',
        tone: 'error',
      });
    } finally {
      setIsFixing(null);
    }
  };

  const handleGeneratePDF = async (audit: AuditReport) => {
    try {
      const { generateAuditPDF } = await import('./services/pdfGenerator');
      await generateAuditPDF(audit);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setToast({
        message: 'Unable to generate the certificate right now.',
        tone: 'error',
      });
    }
  };

  const topAction = actionTasks[0];
  const topProduct = productInsights[0];
  const latestAudit = audits[0];

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-theme-secondary'>
        <Loader2 className='h-8 w-8 animate-spin text-[var(--accent-primary)]' />
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
          isDarkMode={settings.isDarkMode}
          onToggleDarkMode={() => updateDarkMode(!settings.isDarkMode)}
          showUpdatePulse={showUpdatePulse}
        />
      )}

      <AnimatePresence mode='wait'>
        {view === 'landing' && (
          <RouteBoundary
            key='landing'
            fallback={<LoadingFallback />}
            onReset={() => setView('landing')}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}>
              <Landing
                onStartAudit={handleStartAuditClick}
                isLoggedIn={!!user}
              />
            </motion.div>
          </RouteBoundary>
        )}

        {view === 'auth' && (
          <RouteBoundary
            key='auth'
            fallback={<LoadingFallback />}
            onReset={() => setView('landing')}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}>
              <Auth
                onSignIn={signIn}
                onBack={() => setView('landing')}
              />
            </motion.div>
          </RouteBoundary>
        )}

        {view === 'dashboard' && user && (
          <RouteBoundary
            key='dashboard'
            fallback={<LoadingFallback />}
            onReset={() => setView('landing')}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}>
              <DashboardView
                user={user}
                audits={audits}
                productProfiles={productProfiles}
                filteredAudits={filteredAudits}
                stats={stats}
                actionTasks={actionTasks}
                actionStats={actionStats}
                groupedActionTasks={groupedActionTasks}
                productInsights={productInsights}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
                onSelectAudit={setSelectedAudit}
                onOpenAuditById={handleOpenAuditById}
                onStartAuditClick={handleStartAuditClick}
                onStartReaudit={handleStartReaudit}
                onStartProductReaudit={handleStartProductReaudit}
                onResolveTask={handleResolveAction}
                onUpdateProductCadence={handleUpdateProductCadence}
                onMarkProductReviewed={handleMarkProductReviewed}
                setAuditPendingDelete={setAuditPendingDelete}
                filter={filter}
                searchQuery={searchQuery}
                sortBy={sortBy}
                ledgerTab={ledgerTab}
                setFilter={setFilter}
                setSearchQuery={setSearchQuery}
                setSortBy={setSortBy}
                setLedgerTab={setLedgerTab}
              />
            </motion.div>
          </RouteBoundary>
        )}

        {view === 'profile' && user && (
          <RouteBoundary
            key='profile'
            fallback={<LoadingFallback />}
            onReset={() => setView('dashboard')}>
            <motion.div
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
          </RouteBoundary>
        )}

        {view === 'updates' && user && (
          <RouteBoundary
            key='updates'
            fallback={<LoadingFallback />}
            onReset={() => setView('dashboard')}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}>
              <StatutoryUpdates
                audits={audits}
                regions={coveredRegions}
                onBack={() => setView('dashboard')}
              />
            </motion.div>
          </RouteBoundary>
        )}

        {view === 'settings' && user && (
          <RouteBoundary
            key='settings'
            fallback={<LoadingFallback />}
            onReset={() => setView('dashboard')}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}>
              <SuiteSettings onBack={() => setView('dashboard')} />
            </motion.div>
          </RouteBoundary>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <UploadModal
          show={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          {...form}
        />
      </Suspense>
      <Suspense fallback={null}>
        <ReportModal
          audit={selectedAudit}
          onClose={() => setSelectedAudit(null)}
          onGeneratePDF={handleGeneratePDF}
          onFixImage={handleFixImage}
          isFixing={isFixing}
          resolvedActionIds={resolvedActionIds}
          onResolveAction={handleResolveAction}
        />
      </Suspense>
      <Suspense fallback={null}>
        <LiveConsultOverlay
          show={showLiveConsult}
          onClose={() => setShowLiveConsult(false)}
          transcript={transcript}
          aiResponse={aiResponse}
          isConsultantThinking={isConsultantThinking}
        />
      </Suspense>

      <ConfirmDialog
        show={!!auditPendingDelete}
        title='Remove audit record?'
        description="This audit will be permanently removed from your ledger. You can't undo this after confirming."
        confirmLabel='Delete audit'
        onCancel={() => setAuditPendingDelete(null)}
        onConfirm={handleConfirmDeleteAudit}
      />
      <Toast
        message={toast?.message || null}
        tone={toast?.tone}
        onClose={() => setToast(null)}
      />
      {view !== 'auth' && (
        <CopilotDock
          contextTitle={copilotContextTitle}
          contextPrompt={copilotContextPrompt}
          suggestedPrompts={copilotPrompts}
        />
      )}
    </div>
  );
}
