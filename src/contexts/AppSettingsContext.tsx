import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { SuitePreferences } from '../types/app';
import { useSuitePreferences } from '../hooks/useSuitePreferences';

interface AppSettings {
  isDarkMode: boolean;
  suitePreferences: SuitePreferences;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateDarkMode: (isDarkMode: boolean) => void;
  updateSuitePreferences: (preferences: SuitePreferences) => void;
  updatePreference: <K extends keyof SuitePreferences>(
    key: K,
    value: SuitePreferences[K],
  ) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(
  undefined,
);

export function AppSettingsProvider({
  children,
  initialDarkMode = true,
  initialSuitePreferences,
}: {
  children: React.ReactNode;
  initialDarkMode?: boolean;
  initialSuitePreferences?: SuitePreferences;
}) {
  const [storedPrefs, setStoredPrefs] = useSuitePreferences();
  const initialPrefs = initialSuitePreferences ?? storedPrefs;

  const [settings, setSettings] = useState<AppSettings>({
    isDarkMode: initialDarkMode,
    suitePreferences: initialPrefs,
  });

  // keep local hook storage in sync when provider preferences change
  useEffect(() => {
    setStoredPrefs(settings.suitePreferences);
  }, [settings.suitePreferences, setStoredPrefs]);

  const updateDarkMode = useCallback((isDarkMode: boolean) => {
    setSettings((prev) => ({ ...prev, isDarkMode }));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  // apply initial theme on mount
  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.isDarkMode]);

  const updateSuitePreferences = useCallback(
    (preferences: SuitePreferences) => {
      setSettings((prev) => ({ ...prev, suitePreferences: preferences }));
    },
    [],
  );

  const updatePreference = useCallback(
    <K extends keyof SuitePreferences>(key: K, value: SuitePreferences[K]) => {
      setSettings((prev) => ({
        ...prev,
        suitePreferences: {
          ...prev.suitePreferences,
          [key]: value,
        },
      }));
    },
    [],
  );

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        updateDarkMode,
        updateSuitePreferences,
        updatePreference,
      }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
}
