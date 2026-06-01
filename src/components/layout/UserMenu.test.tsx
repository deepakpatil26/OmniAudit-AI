import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { UserMenu } from './UserMenu';
import { User } from 'firebase/auth';

const mockUser = {
  uid: 'test-user',
  displayName: 'Jane Doe',
  email: 'jane@example.com',
  photoURL: '',
} as unknown as User;

describe('UserMenu', () => {
  it('opens the menu, supports arrow navigation, and closes with Escape', async () => {
    const onLogout = vi.fn();
    const onToggleDarkMode = vi.fn();
    const onOpenProfile = vi.fn();
    const onOpenUpdates = vi.fn();
    const onOpenSettings = vi.fn();

    render(
      <UserMenu
        user={mockUser}
        onLogout={onLogout}
        isDarkMode={false}
        onToggleDarkMode={onToggleDarkMode}
        onOpenProfile={onOpenProfile}
        onOpenUpdates={onOpenUpdates}
        onOpenSettings={onOpenSettings}
        showUpdatePulse={true}
      />,
    );

    const toggleButton = screen.getByRole('button', {
      name: /open user menu/i,
    });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('menu')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', { name: /profile suite/i }),
      ).toHaveFocus();
    });

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    expect(
      screen.getByRole('menuitemcheckbox', { name: /dark protocol/i }),
    ).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    await waitFor(() => {
      expect(toggleButton).toHaveFocus();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
