export interface SuitePreferences {
  highlightCriticalUpdates: boolean;
  condenseRoutineUpdates: boolean;
  autoOpenLatestReport: boolean;
  allowVisionAudits: boolean;
}

export type AuditSort = 'newest' | 'oldest' | 'highest-score' | 'lowest-score';

export type AppView =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'profile'
  | 'updates'
  | 'settings';
