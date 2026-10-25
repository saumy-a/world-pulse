import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore session handling', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('handles operative login and generates JWT token', async () => {
    const success = await useAuthStore.getState().login('operative@worldpulse.io');
    expect(success).toBe(true);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('operative@worldpulse.io');
    expect(state.user?.role).toBe('OPERATIVE');
    expect(state.token).toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
  });

  it('assigns ADMIN role when admin email is provided', async () => {
    await useAuthStore.getState().login('admin@worldpulse.io');
    const state = useAuthStore.getState();

    expect(state.user?.role).toBe('ADMIN');
  });

  it('clears session and tokens on logout', async () => {
    await useAuthStore.getState().login('analyst@worldpulse.io');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});
