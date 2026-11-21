import { create } from 'zustand';

export type SessionStatus = 'unknown' | 'signedOut' | 'locked' | 'signedIn';

interface SessionState {
  status: SessionStatus;
  /** El access token vive SOLO en memoria (nunca en disco). */
  accessToken?: string;
  customerName?: string;
  lastActivity: number;
  signIn(accessToken: string, customerName?: string): void;
  setAccessToken(token: string): void;
  lock(): void;
  signOut(): void;
  touch(): void;
}

export const useSession = create<SessionState>((set) => ({
  status: 'unknown',
  lastActivity: Date.now(),
  signIn: (accessToken, customerName) =>
    set({ status: 'signedIn', accessToken, customerName, lastActivity: Date.now() }),
  setAccessToken: (accessToken) => set({ accessToken }),
  lock: () => set({ status: 'locked', accessToken: undefined }),
  signOut: () => set({ status: 'signedOut', accessToken: undefined, customerName: undefined }),
  touch: () => set({ lastActivity: Date.now() }),
}));
