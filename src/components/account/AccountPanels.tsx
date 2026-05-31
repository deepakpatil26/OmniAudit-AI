import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowLeft,
  Bell,
  BookOpenCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  Filter,
  Globe2,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import type { AuditReport } from '../../types/audit';
import type { SuitePreferences } from '../../types/app';
import { useAppSettings } from '../../contexts/AppSettingsContext';
import { formatRegionLabel } from '../../lib/auditConfig';

interface SharedPanelProps {
  title: string;
  eyebrow: string;
  description: string;
  onBack: () => void;
  children: React.ReactNode;
}

function PanelShell({
  title,
  eyebrow,
  description,
  onBack,
  children,
}: SharedPanelProps) {
  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10'>
        <div>
          <button
            onClick={onBack}
            className='mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)] transition-all hover:gap-3'>
            <ArrowLeft className='w-3.5 h-3.5' />
            Back to Ledger
          </button>
          <div className='mb-2 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
            {eyebrow}
          </div>
          <h1 className='font-display text-3xl font-bold text-text-primary sm:text-4xl'>
            {title}
          </h1>
          <p className='text-sm text-text-secondary font-medium mt-3 max-w-2xl'>
            {description}
          </p>
        </div>
      </div>

      {children}
    </main>
  );
}

interface ProfileSuiteProps {
  user: User;
  auditCount: number;
  regionCount: number;
  onBack: () => void;
  onSaveDisplayName: (displayName: string) => Promise<void>;
}

export function ProfileSuite({
  user,
  auditCount,
  regionCount,
  onBack,
  onSaveDisplayName,
}: ProfileSuiteProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayName(user.displayName || '');
  }, [user.displayName]);

  const initials = useMemo(() => {
    const source = user.displayName || user.email || 'User';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user.displayName, user.email]);

  const handleSave = async () => {
    const nextName = displayName.trim();
    if (!nextName) {
      setStatus('Display name cannot be empty.');
      return;
    }

    try {
      setIsSaving(true);
      setStatus(null);
      await onSaveDisplayName(nextName);
      setStatus('Profile suite updated successfully.');
    } catch (error) {
      console.error('Profile update failed:', error);
      setStatus('Unable to update your profile right now.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PanelShell
      title='Profile Suite'
      eyebrow='Account Control'
      description='Review your authenticated account details and update how your profile appears across the OmniAudit workspace.'
      onBack={onBack}>
      <div className='grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-6 lg:gap-8'>
        <section className='oa-panel p-5 sm:p-8'>
          <div className='flex flex-col sm:flex-row sm:items-center gap-5 mb-8'>
            <div className='flex h-20 w-20 items-center justify-center rounded border border-amber-500/30 bg-[var(--accent-primary)] text-2xl font-bold text-black'>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className='h-full w-full rounded object-cover'
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <div className='mb-2 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                Authenticated identity
              </div>
              <h2 className='font-display text-2xl font-bold text-text-primary'>
                {user.displayName || 'Compliance Expert'}
              </h2>
              <p className='text-sm text-text-secondary font-medium mt-2'>
                {user.email}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
            <div className='rounded border border-border-primary bg-theme-secondary p-5'>
              <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2'>
                Suite records
              </div>
              <div className='font-display text-3xl font-bold text-text-primary'>
                {auditCount}
              </div>
            </div>
            <div className='rounded border border-border-primary bg-theme-secondary p-5'>
              <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2'>
                Regions covered
              </div>
              <div className='font-display text-3xl font-bold text-text-primary'>
                {regionCount}
              </div>
            </div>
          </div>

          <label className='block'>
            <span className='text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-3 block'>
              Display name
            </span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className='w-full rounded border border-border-primary bg-theme-secondary p-4 text-sm font-medium text-text-primary outline-none transition-all focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20'
              placeholder='Enter your name'
            />
          </label>

          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6'>
            <p className='text-sm text-text-secondary min-h-6'>
              {status ||
                'Your Google-authenticated account remains the source of truth.'}
            </p>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className='oa-button-primary px-6 py-3 disabled:opacity-50'>
              <Save className='w-4 h-4' />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </section>

        <section className='oa-panel p-5 sm:p-8'>
          <div className='mb-4 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
            Identity snapshot
          </div>
          <div className='space-y-4'>
            <div className='flex items-start gap-4 rounded border border-border-primary bg-theme-secondary p-5'>
              <UserRound className='mt-0.5 h-5 w-5 text-[var(--accent-primary)]' />
              <div>
                <div className='text-xs font-bold uppercase tracking-widest text-text-secondary mb-1'>
                  User ID
                </div>
                <div className='text-sm font-medium text-text-primary break-all'>
                  {user.uid}
                </div>
              </div>
            </div>
            <div className='flex items-start gap-4 rounded border border-border-primary bg-theme-secondary p-5'>
              <ShieldCheck className='w-5 h-5 text-emerald-500 mt-0.5' />
              <div>
                <div className='text-xs font-bold uppercase tracking-widest text-text-secondary mb-1'>
                  Sign-in method
                </div>
                <div className='text-sm font-medium text-text-primary'>
                  Google Identity Provider
                </div>
              </div>
            </div>
            <div className='flex items-start gap-4 rounded border border-border-primary bg-theme-secondary p-5'>
              <CheckCircle2 className='w-5 h-5 text-amber-500 mt-0.5' />
              <div>
                <div className='text-xs font-bold uppercase tracking-widest text-text-secondary mb-1'>
                  Verification state
                </div>
                <div className='text-sm font-medium text-text-primary'>
                  {user.emailVerified
                    ? 'Verified contact email'
                    : 'Email verification pending'}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PanelShell>
  );
}

interface StatutoryUpdateItem {
  id: string;
  title: string;
  summary: string;
  region: string;
  priority: 'Critical' | 'Advisory';
  category: string;
  dueLabel: string;
}

interface StatutoryUpdatesProps {
  audits: AuditReport[];
  regions: string[];
  onBack: () => void;
}

export function StatutoryUpdates({
  audits,
  regions,
  onBack,
}: StatutoryUpdatesProps) {
  const { settings } = useAppSettings();
  const preferences = settings.suitePreferences;
  const [filter, setFilter] = useState<'all' | 'critical'>('all');

  const updates = useMemo<StatutoryUpdateItem[]>(() => {
    if (audits.length === 0) {
      return [
        {
          id: 'global-baseline',
          title: 'Create your first audit briefing',
          summary:
            'Run an initial audit to unlock market-specific reminders, discrepancy tracking, and storefront review timing.',
          region: 'Global',
          priority: 'Advisory',
          category: 'Onboarding',
          dueLabel: 'Ready now',
        },
      ];
    }

    return audits.slice(0, 8).map((audit, index) => {
      const hasDiscrepancy = audit.findings.some(
        (finding) => finding.status === 'discrepancy',
      );
      const hasShelfLifeRisk =
        audit.shelfLife?.status === 'expired' ||
        audit.shelfLife?.status === 'near-expiry';

      return {
        id: audit.id || `${audit.region}-${index}`,
        title: hasDiscrepancy
          ? `${audit.productName} needs claim review`
          : `${audit.productName} routine storefront check`,
        summary: hasShelfLifeRisk
          ? `Shelf-life tracking flagged ${audit.shelfLife?.status}. Re-check expiry disclosures and marketplace freshness messaging before the next sales cycle.`
          : hasDiscrepancy
            ? audit.riskSummary
            : 'Schedule a lightweight verification pass to confirm storefront copy, imagery, and classification details still match the physical label.',
        region: audit.region || 'Global',
        priority: hasDiscrepancy || hasShelfLifeRisk ? 'Critical' : 'Advisory',
        category: hasDiscrepancy ? 'Label Integrity' : 'Routine Review',
        dueLabel: hasDiscrepancy ? 'Review today' : 'This week',
      };
    });
  }, [audits]);

  const visibleUpdates =
    preferences.condenseRoutineUpdates && filter === 'all'
      ? updates.filter((item) => item.priority === 'Critical')
      : filter === 'all'
        ? updates
        : updates.filter((item) => item.priority === 'Critical');

  return (
    <PanelShell
      title='Statutory Updates'
      eyebrow='Compliance Watch'
      description='Track regulation-facing reminders generated from the regions currently represented in your audit ledger.'
      onBack={onBack}>
      <div className='grid grid-cols-1 xl:grid-cols-[1.2fr,0.8fr] gap-6 lg:gap-8'>
        <section className='oa-panel p-5 sm:p-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
            <div>
              <div className='mb-2 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                Update stream
              </div>
              <h2 className='text-2xl font-bold text-text-primary'>
                {visibleUpdates.length} active notice
                {visibleUpdates.length === 1 ? '' : 's'}
              </h2>
            </div>
            <div className='flex items-center gap-2 rounded border border-border-primary bg-theme-secondary p-1'>
              <button
                onClick={() => setFilter('all')}
                className={`rounded px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filter === 'all'
                    ? 'bg-accent-primary-soft text-[var(--accent-primary)]'
                    : 'text-text-secondary hover:text-text-primary'
                }`}>
                All Notices
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`rounded px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filter === 'critical'
                    ? 'bg-red-500/10 text-red-500'
                    : 'text-text-secondary hover:text-text-primary'
                }`}>
                Critical
              </button>
            </div>
          </div>

          <div className='space-y-4'>
            {visibleUpdates.map((item) => (
              <article
                key={item.id}
                className='rounded border border-border-primary bg-theme-secondary p-5'>
                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3'>
                  <div>
                    <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2'>
                      {formatRegionLabel(item.region)} | {item.category}
                    </div>
                    <h3 className='text-lg font-bold text-text-primary'>
                      {item.title}
                    </h3>
                  </div>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span
                      className={`inline-flex items-center rounded px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        item.priority === 'Critical'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                      {item.priority}
                    </span>
                    <span className='inline-flex items-center gap-2 rounded border border-border-primary bg-theme-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      <CalendarClock className='w-3 h-3' />
                      {item.dueLabel}
                    </span>
                  </div>
                </div>
                <p className='text-sm text-text-secondary font-medium leading-relaxed'>
                  {item.summary}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className='oa-panel p-5 sm:p-8'>
          <div className='mb-4 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
            Coverage summary
          </div>
          <div className='space-y-4'>
            <div className='rounded border border-border-primary bg-theme-secondary p-5'>
              <div className='flex items-center gap-3 mb-2'>
                <Globe2 className='h-5 w-5 text-[var(--accent-primary)]' />
                <span className='text-xs font-bold uppercase tracking-widest text-text-secondary'>
                  Regions monitored
                </span>
              </div>
              <div className='text-sm text-text-primary font-medium'>
                {regions.length > 0
                  ? regions
                      .map((region) => formatRegionLabel(region))
                      .join(', ')
                  : 'Global baseline'}
              </div>
            </div>
            <div className='rounded border border-border-primary bg-theme-secondary p-5'>
              <div className='flex items-center gap-3 mb-2'>
                <BookOpenCheck className='w-5 h-5 text-emerald-500' />
                <span className='text-xs font-bold uppercase tracking-widest text-text-secondary'>
                  Update logic
                </span>
              </div>
              <div className='text-sm text-text-primary font-medium'>
                Notices now respond to saved audits, mismatch risk, and
                shelf-life severity instead of static placeholder text.
              </div>
            </div>
            <div className='rounded border border-border-primary bg-theme-secondary p-5'>
              <div className='flex items-center gap-3 mb-2'>
                <Filter className='w-5 h-5 text-amber-500' />
                <span className='text-xs font-bold uppercase tracking-widest text-text-secondary'>
                  Delivery mode
                </span>
              </div>
              <div className='text-sm text-text-primary font-medium'>
                {preferences.highlightCriticalUpdates
                  ? preferences.condenseRoutineUpdates
                    ? 'Urgent updates stay highlighted, while routine notices are condensed so this feed stays focused on the highest-risk work.'
                    : 'Urgent updates stay highlighted across the workspace, and advisory notices remain visible for a full review pass.'
                  : 'Update highlighting is muted in settings, so notices remain available here without persistent visual emphasis.'}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PanelShell>
  );
}

interface SuiteSettingsProps {
  onBack: () => void;
}

export function SuiteSettings({ onBack }: SuiteSettingsProps) {
  const { settings, updateSuitePreferences } = useAppSettings();
  const preferences = settings.suitePreferences;
  return (
    <PanelShell
      title='Suite Settings'
      eyebrow='Workspace Preferences'
      description='Control the behavior of real in-app compliance signals, dashboard convenience options, and AI routing for your signed-in workspace.'
      onBack={onBack}>
      <div className='grid grid-cols-1 xl:grid-cols-[1.15fr,0.85fr] gap-6 lg:gap-8'>
        <section className='oa-panel p-5 sm:p-8'>
          <div className='space-y-4'>
            {[
              {
                key: 'highlightCriticalUpdates',
                icon: Bell,
                title: 'Highlight Critical Updates',
                body: 'Show stronger in-app emphasis for urgent findings and keep the account bell pulse active.',
              },
              {
                key: 'condenseRoutineUpdates',
                icon: Sparkles,
                title: 'Condense Routine Updates',
                body: 'Prioritize critical notices first and collapse lower-priority reminders into a calmer review flow.',
              },
              {
                key: 'autoOpenLatestReport',
                icon: Building2,
                title: 'Resume Latest Report',
                body: 'Prefer continuity by reopening your latest report context after sign-in.',
              },
              {
                key: 'allowVisionAudits',
                icon: Globe2,
                title: 'Enable Vision Audits',
                body: 'Allow image-based audits to use the separate vision model when packaging or listing screenshots are attached.',
              },
            ].map((item) => {
              const Icon = item.icon;
              const enabled = preferences[item.key as keyof SuitePreferences];
              const labelId = `suite-preference-label-${item.key}`;
              const descriptionId = `suite-preference-description-${item.key}`;

              return (
                <button
                  key={item.key}
                  type='button'
                  role='switch'
                  aria-checked={enabled}
                  aria-labelledby={labelId}
                  aria-describedby={descriptionId}
                  onClick={() =>
                    updateSuitePreferences({
                      ...preferences,
                      [item.key]: !enabled,
                    })
                  }
                  className='w-full rounded border border-border-primary bg-theme-secondary p-5 text-left transition-colors hover:bg-accent-primary-soft focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-theme-secondary'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex items-start gap-4'>
                      <div className='flex h-11 w-11 items-center justify-center rounded border border-border-primary bg-theme-primary'>
                        <Icon className='h-5 w-5 text-[var(--accent-primary)]' />
                      </div>
                      <div>
                        <div
                          id={labelId}
                          className='text-sm font-bold text-text-primary'>
                          {item.title}
                        </div>
                        <div
                          id={descriptionId}
                          className='text-sm text-text-secondary font-medium mt-2'>
                          {item.body}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`relative h-6 w-11 shrink-0 rounded transition-colors ${
                        enabled ? 'bg-[var(--accent-primary)]' : 'bg-gray-700'
                      }`}>
                      <div
                        className={`absolute top-1 h-4 w-4 rounded bg-black transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className='oa-panel p-5 sm:p-8'>
          <div className='mb-4 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
            Current profile
          </div>
          <div className='space-y-4'>
            <div className='rounded border border-border-primary bg-theme-secondary p-5'>
              <div className='text-xs font-bold uppercase tracking-widest text-text-secondary mb-2'>
                Active preferences
              </div>
              <div className='space-y-2 text-sm text-text-primary font-medium'>
                <div>
                  Highlight critical updates:{' '}
                  {preferences.highlightCriticalUpdates ? 'On' : 'Off'}
                </div>
                <div>
                  Condense routine updates:{' '}
                  {preferences.condenseRoutineUpdates ? 'On' : 'Off'}
                </div>
                <div>
                  Resume latest report:{' '}
                  {preferences.autoOpenLatestReport ? 'On' : 'Off'}
                </div>
                <div>
                  Enable vision audits:{' '}
                  {preferences.allowVisionAudits ? 'On' : 'Off'}
                </div>
              </div>
            </div>
            <div className='rounded border border-border-primary bg-theme-secondary p-5'>
              <div className='text-xs font-bold uppercase tracking-widest text-text-secondary mb-2'>
                Persistence
              </div>
              <div className='text-sm text-text-primary font-medium'>
                Changes are stored locally in your browser and each toggle now
                maps to visible workspace behavior instead of placeholder email
                settings.
              </div>
            </div>
            {/* Removed static AI routing policy display to keep settings focused on functional toggles only. */}
          </div>
        </section>
      </div>
    </PanelShell>
  );
}
