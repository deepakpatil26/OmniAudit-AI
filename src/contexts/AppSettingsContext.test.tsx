import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppSettingsProvider, useAppSettings } from './AppSettingsContext';
import type { SuitePreferences } from '../types/app';

const initialPrefs: SuitePreferences = {
  highlightCriticalUpdates: false,
  condenseRoutineUpdates: false,
  autoOpenLatestReport: false,
  allowVisionAudits: true,
};

function Consumer() {
  const { settings, updateDarkMode, updatePreference, updateSuitePreferences } =
    useAppSettings();

  return (
    <div>
      <div>Dark: {settings.isDarkMode ? 'true' : 'false'}</div>
      <div>
        Auto Open Latest Report:{' '}
        {settings.suitePreferences.autoOpenLatestReport ? 'true' : 'false'}
      </div>
      <div>
        Vision Audits:{' '}
        {settings.suitePreferences.allowVisionAudits ? 'true' : 'false'}
      </div>
      <button onClick={() => updateDarkMode(!settings.isDarkMode)}>
        Toggle Theme
      </button>
      <button
        onClick={() =>
          updatePreference(
            'autoOpenLatestReport',
            !settings.suitePreferences.autoOpenLatestReport,
          )
        }>
        Toggle Auto Open
      </button>
      <button
        onClick={() =>
          updateSuitePreferences({
            ...settings.suitePreferences,
            allowVisionAudits: false,
          })
        }>
        Disable Vision Audits
      </button>
    </div>
  );
}

describe('AppSettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('provides default settings and updates theme state', () => {
    render(
      <AppSettingsProvider
        initialDarkMode={false}
        initialSuitePreferences={initialPrefs}>
        <Consumer />
      </AppSettingsProvider>,
    );

    expect(screen.getByText('Dark: false')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));

    expect(screen.getByText('Dark: true')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('updates a single suite preference and full preference object', () => {
    render(
      <AppSettingsProvider
        initialDarkMode={true}
        initialSuitePreferences={initialPrefs}>
        <Consumer />
      </AppSettingsProvider>,
    );

    expect(
      screen.getByText('Auto Open Latest Report: false'),
    ).toBeInTheDocument();
    expect(screen.getByText('Vision Audits: true')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /toggle auto open/i }));
    expect(
      screen.getByText('Auto Open Latest Report: true'),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /disable vision audits/i }),
    );
    expect(screen.getByText('Vision Audits: false')).toBeInTheDocument();
  });
});
