import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'OPERATIVE';
  created_at?: string;
}

interface AuthStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY_USER = 'worldpulse_user';
const STORAGE_KEY_TOKEN = 'worldpulse_token';

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {
      // Ignore
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  },
};

function toBase64(str: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  if (typeof globalThis !== 'undefined' && 'Buffer' in globalThis) {
    return (globalThis as unknown as { Buffer: { from: (s: string) => { toString: (enc: string) => string } } }).Buffer.from(str).toString('base64');
  }
  return encodeURIComponent(str);
}

// Load stored session if exists
const storedUserJson = safeStorage.getItem(STORAGE_KEY_USER);
const storedToken = safeStorage.getItem(STORAGE_KEY_TOKEN);
const initialUser: User | null = storedUserJson ? JSON.parse(storedUserJson) : null;

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: initialUser,
  token: storedToken,
  isAuthenticated: Boolean(initialUser && storedToken),

  login: async (email: string) => {
    // Simulate / real auth flow with JWT storage
    const mockUser: User = {
      id: `usr_${Date.now().toString(36)}`,
      email,
      role: email.includes('admin') ? 'ADMIN' : 'OPERATIVE',
      created_at: new Date().toISOString(),
    };
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${toBase64(JSON.stringify(mockUser))}.signature`;

    safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    safeStorage.setItem(STORAGE_KEY_TOKEN, mockToken);

    set({ user: mockUser, token: mockToken, isAuthenticated: true });
    return true;
  },

  register: async (email: string) => {
    const mockUser: User = {
      id: `usr_${Date.now().toString(36)}`,
      email,
      role: 'OPERATIVE',
      created_at: new Date().toISOString(),
    };
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${toBase64(JSON.stringify(mockUser))}.signature`;

    safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    safeStorage.setItem(STORAGE_KEY_TOKEN, mockToken);

    set({ user: mockUser, token: mockToken, isAuthenticated: true });
    return true;
  },

  logout: () => {
    safeStorage.removeItem(STORAGE_KEY_USER);
    safeStorage.removeItem(STORAGE_KEY_TOKEN);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
