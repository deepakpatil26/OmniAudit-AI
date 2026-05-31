import { useEffect, useState } from 'react';
import type { SuitePreferences } from '../types/app';

const DEFAULT_SUITE_PREFERENCES: SuitePreferences = {
  highlightCriticalUpdates: true,
  condenseRoutineUpdates: false,
  autoOpenLatestReport: false,
  allowVisionAudits: true,
};

export function useSuitePreferences() {
  const [preferences, setPreferences] = useState<SuitePreferences>(() => {
    const saved = localStorage.getItem('suitePreferences');
    if (!saved) {
      return DEFAULT_SUITE_PREFERENCES;
    }

    try {
      const parsed = JSON.parse(saved) as
        | SuitePreferences
        | {
            emailAlerts?: boolean;
            weeklyDigest?: boolean;
            autoOpenLatestReport?: boolean;
            allowVisionAudits?: boolean;
          };

      return {
        highlightCriticalUpdates:
          'highlightCriticalUpdates' in parsed
            ? !!parsed.highlightCriticalUpdates
            : (parsed.emailAlerts ?? true),
        condenseRoutineUpdates:
          'condenseRoutineUpdates' in parsed
            ? !!parsed.condenseRoutineUpdates
            : (parsed.weeklyDigest ?? false),
        autoOpenLatestReport: !!parsed.autoOpenLatestReport,
        allowVisionAudits:
          'allowVisionAudits' in parsed ? !!parsed.allowVisionAudits : true,
      };
    } catch {
      return DEFAULT_SUITE_PREFERENCES;
    }
  });

  useEffect(() => {
    localStorage.setItem('suitePreferences', JSON.stringify(preferences));
  }, [preferences]);

  return [preferences, setPreferences] as const;
}
