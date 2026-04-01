import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowLeft,
  Bell,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  Globe2,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

export interface SuitePreferences {
  emailAlerts: boolean;
  weeklyDigest: boolean;
  autoOpenLatestReport: boolean;
}

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
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10'>
        <div>
          <button
            onClick={onBack}
            className='inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 hover:gap-3 transition-all'
          >
            <ArrowLeft className='w-3.5 h-3.5' />
            Back to Ledger
          </button>
          <div className='text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-500 mb-2'>
            {eyebrow}
          </div>
          <h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-text-primary'>
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
      onBack={onBack}
    >
      <div className='grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-8'>
        <section className='bg-theme-primary border border-border-primary rounded-[2.5rem] p-8 shadow-sm'>
          <div className='flex flex-col sm:flex-row sm:items-center gap-5 mb-8'>
            <div className='w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-xl shadow-indigo-100 dark:shadow-none'>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className='w-full h-full object-cover rounded-[2rem]'
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <div className='text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-500 mb-2'>
                Authenticated identity
              </div>
              <h2 className='text-2xl font-bold text-text-primary'>
                {user.displayName || 'Compliance Expert'}
              </h2>
              <p className='text-sm text-text-secondary font-medium mt-2'>
                {user.email}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
            <div className='bg-theme-secondary/50 border border-border-primary rounded-[1.75rem] p-5'>
              <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2'>
                Suite records
              </div>
              <div className='text-3xl font-bold text-text-primary'>{auditCount}</div>
            </div>
            <div className='bg-theme-secondary/50 border border-border-primary rounded-[1.75rem] p-5'>
              <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2'>
                Regions covered
              </div>
              <div className='text-3xl font-bold text-text-primary'>{regionCount}</div>
            </div>
          </div>

          <label className='block'>
            <span className='text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-3 block'>
              Display name
            </span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className='w-full p-4 bg-theme-secondary border border-border-primary rounded-xl text-sm font-medium text-text-primary focus:ring-2 focus:ring-indigo-500 transition-all outline-none'
              placeholder='Enter your name'
            />
          </label>

          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6'>
            <p className='text-sm text-text-secondary min-h-6'>
              {status || 'Your Google-authenticated account remains the source of truth.'}
            </p>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className='inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl shadow-gray-200 dark:shadow-none'
            >
              <Save className='w-4 h-4' />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </section>

        <section className='bg-theme-primary border border-border-primary rounded-[2.5rem] p-8 shadow-sm'>
          <div className='text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-500 mb-4'>
            Identity snapshot
          </div>
          <div className='space-y-4'>
            <div className='flex items-start gap-4 p-5 bg-theme-secondary/50 border border-border-primary rounded-[1.5rem]'>
              <UserRound className='w-5 h-5 text-indigo-500 mt-0.5' />
              <div>
                <div className='text-xs font-bold uppercase tracking-widest text-text-secondary mb-1'>
                  User ID
                </div>
                <div className='text-sm font-medium text-text-primary break-all'>{user.uid}</div>
              </div>
            </div>
            <div className='flex items-start gap-4 p-5 bg-theme-secondary/50 border border-border-primary rounded-[1.5rem]'>
              <ShieldCheck className='w-5 h-5 text-emerald-500 mt-0.5' />
              <div>
                <div className='text-xs font-bold uppercase tracking-widest text-text-secondary mb-1'>
                  Sign-in method
                </div>
                <div className='text-sm font-medium text-text-primary'>Google Identity Provider</div>
              </div>
            </div>
            <div className='flex items-start gap-4 p-5 bg-theme-secondary/50 border border-border-primary rounded-[1.5rem]'>
              <CheckCircle2 className='w-5 h-5 text-amber-500 mt-0.5' />
              <div>
                <div className='text-xs font-bold uppercase tracking-widest text-text-secondary mb-1'>
                  Verification state
                </div>
                <div className='text-sm font-medium text-text-primary'>
                  {user.emailVerified ? 'Verified contact email' : 'Email verification pending'}
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
}

interface StatutoryUpdatesProps {
  regions: string[];
  onBack: () => void;
}

export function StatutoryUpdates({ regions, onBack }: StatutoryUpdatesProps) {
  const [filter, setFilter] = useState<'all' | 'critical'>('all');

  const updates = useMemo<StatutoryUpdateItem[]>(() => {
    const normalizedRegions = regions.length > 0 ? regions : ['Global'];
    return normalizedRegions.map((region, index) => ({
      id: `${region}-${index}`,
      title: `${region} labeling review cadence`,
      summary:
        'Re-check packaging copy, market claims, and expiry disclosures before the next publishing cycle to avoid stale storefront data.',
      region,
      priority: index === 0 ? 'Critical' : 'Advisory',
      category: index === 0 ? 'Label Integrity' : 'Routine Review',
    }));
  }, [regions]);

  const visibleUpdates =
    filter === 'all'
      ? updates
      : updates.filter((item) => item.priority === 'Critical');

  return (
    <PanelShell
      title='Statutory Updates'
      eyebrow='Compliance Watch'
      description='Track regulation-facing reminders generated from the regions currently represented in your audit ledger.'
      onBack={onBack}
    >
      <div className='grid grid-cols-1 xl:grid-cols-[1.2fr,0.8fr] gap-8'>
        <section className='bg-theme-primary border border-border-primary rounded-[2.5rem] p-8 shadow-sm'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
            <div>
              <div className='text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-500 mb-2'>
                Update stream
              </div>
              <h2 className='text-2xl font-bold text-text-primary'>
                {visibleUpdates.length} active notice{visibleUpdates.length === 1 ? '' : 's'}
              </h2>
            </div>
            <div className='flex items-center gap-2 bg-theme-secondary/50 p-1 rounded-xl border border-border-primary shadow-sm'>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  filter === 'all'
                    ? 'bg-theme-primary text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                All Notices
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  filter === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/40 text-red-600'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Critical
              </button>
            </div>
          </div>

          <div className='space-y-4'>
            {visibleUpdates.map((item) => (
              <article
                key={item.id}
                className='border border-border-primary rounded-[1.75rem] p-5 bg-theme-secondary/40'
              >
                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3'>
                  <div>
                    <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2'>
                      {item.region} • {item.category}
                    </div>
                    <h3 className='text-lg font-bold text-text-primary'>{item.title}</h3>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      item.priority === 'Critical'
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600'
                        : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className='text-sm text-text-secondary font-medium leading-relaxed'>
                  {item.summary}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className='bg-theme-primary border border-border-primary rounded-[2.5rem] p-8 shadow-sm'>
          <div className='text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-500 mb-4'>
            Coverage summary
          </div>
          <div className='space-y-4'>
            <div className='p-5 bg-theme-secondary/50 border border-border-primary rounded-[1.5rem]'>
              <div className='flex items-center gap-3 mb-2'>
                <Globe2 className='w-5 h-5 text-indigo-500' />
                <span className='text-xs font-bold uppercase tracking-widest text-text-secondary'>
                  Regions monitored
                </span>
              </div>
              <div className='text-sm text-text-primary font-medium'>
                {regions.length > 0 ? regions.join(', ') : 'Global baseline'}
              </div>
            </div>
            <div className='p-5 bg-theme-secondary/50 border border-border-primary rounded-[1.5rem]'>
              <div className='flex items-center gap-3 mb-2'>
                <BookOpenCheck className='w-5 h-5 text-emerald-500' />
                <span className='text-xs font-bold uppercase tracking-widest text-text-secondary'>
                  Update logic
                </span>
              </div>
              <div className='text-sm text-text-primary font-medium'>
                Notices are now surfaced dynamically from your audit coverage instead of static menu text.
              </div>
            </div>
            <div className='p-5 bg-theme-secondary/50 border border-border-primary rounded-[1.5rem]'>
              <div className='flex items-center gap-3 mb-2'>
                <Bell className='w-5 h-5 text-amber-500' />
                <span className='text-xs font-bold uppercase tracking-widest text-text-secondary'>
                  Workflow hint
                </span>
              </div>
              <div className='text-sm text-text-primary font-medium'>
                Open `Suite Settings` to control whether update digests and alert notifications stay enabled.
              </div>
            </div>
          </div>
        </section>
      </div>
    </PanelShell>
  );
}

interface SuiteSettingsProps {
  preferences: SuitePreferences;
  onBack: () => void;
  onUpdatePreferences: (preferences: SuitePreferences) => void;
}

export function SuiteSettings({
  preferences,
  onBack,
  onUpdatePreferences,
}: SuiteSettingsProps) {
  return (
    <PanelShell
      title='Suite Settings'
      eyebrow='Workspace Preferences'
      description='Control the behavior of compliance alerts and dashboard convenience options for your signed-in workspace.'
      onBack={onBack}
    >
      <div className='grid grid-cols-1 xl:grid-cols-[1.15fr,0.85fr] gap-8'>
        <section className='bg-theme-primary border border-border-primary rounded-[2.5rem] p-8 shadow-sm'>
          <div className='space-y-4'>
            {[
              {
                key: 'emailAlerts',
                icon: Bell,
                title: 'Email Alerts',
                body: 'Keep update notifications enabled for future statutory reminders.',
              },
              {
                key: 'weeklyDigest',
                icon: Sparkles,
                title: 'Weekly Digest',
                body: 'Bundle routine notices into a calmer weekly review workflow.',
              },
              {
                key: 'autoOpenLatestReport',
                icon: Building2,
                title: 'Resume Latest Report',
                body: 'Prefer continuity by reopening your latest report context after sign-in.',
              },
            ].map((item) => {
              const Icon = item.icon;
              const enabled = preferences[item.key as keyof SuitePreferences];

              return (
                <button
                  key={item.key}
                  onClick={() =>
                    onUpdatePreferences({
                      ...preferences,
                      [item.key]: !enabled,
                    })
                  }
                  className='w-full text-left p-5 bg-theme-secondary/50 border border-border-primary rounded-[1.75rem] hover:bg-theme-secondary transition-colors'
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex items-start gap-4'>
                      <div className='w-11 h-11 rounded-2xl bg-theme-primary border border-border-primary flex items-center justify-center'>
                        <Icon className='w-5 h-5 text-indigo-500' />
                      </div>
                      <div>
                        <div className='text-sm font-bold text-text-primary'>{item.title}</div>
                        <div className='text-sm text-text-secondary font-medium mt-2'>{item.body}</div>
                      </div>
                    </div>
                    <div
                      className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
                        enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
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

        <section className='bg-theme-primary border border-border-primary rounded-[2.5rem] p-8 shadow-sm'>
          <div className='text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-500 mb-4'>
            Current profile
          </div>
          <div className='space-y-4'>
            <div className='p-5 bg-theme-secondary/50 border border-border-primary rounded-[1.5rem]'>
              <div className='text-xs font-bold uppercase tracking-widest text-text-secondary mb-2'>
                Active preferences
              </div>
              <div className='space-y-2 text-sm text-text-primary font-medium'>
                <div>Email alerts: {preferences.emailAlerts ? 'On' : 'Off'}</div>
                <div>Weekly digest: {preferences.weeklyDigest ? 'On' : 'Off'}</div>
                <div>Resume latest report: {preferences.autoOpenLatestReport ? 'On' : 'Off'}</div>
              </div>
            </div>
            <div className='p-5 bg-theme-secondary/50 border border-border-primary rounded-[1.5rem]'>
              <div className='text-xs font-bold uppercase tracking-widest text-text-secondary mb-2'>
                Persistence
              </div>
              <div className='text-sm text-text-primary font-medium'>
                Changes are stored locally in your browser so the account menu now controls real suite behavior.
              </div>
            </div>
          </div>
        </section>
      </div>
    </PanelShell>
  );
}
