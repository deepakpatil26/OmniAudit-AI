import { describe, it, expect, vi } from 'vitest';

vi.mock('../../lib/errorLogging', () => ({
  logErrorBoundaryEvent: vi.fn(),
}));

import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Recovered</div>;
}

function ControlledErrorBoundary() {
  const [shouldThrow, setShouldThrow] = useState(true);

  return (
    <ErrorBoundary onReset={() => setShouldThrow(false)}>
      <Bomb shouldThrow={shouldThrow} />
    </ErrorBoundary>
  );
}

describe('ErrorBoundary', () => {
  it('renders fallback UI and resets when Try Again is clicked', async () => {
    render(<ControlledErrorBoundary />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByText('Recovered')).toBeInTheDocument();
  });
});
