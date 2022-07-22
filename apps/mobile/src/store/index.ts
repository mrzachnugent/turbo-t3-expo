import create from 'zustand';

interface IStore {
  isAppReady: boolean;
  setIsAppReady(isAppReady: boolean): void;
  hasInternetConnection: boolean;
  setHasInternetConnection(hasInternetConnection: boolean): void;
  token: string | null;
  setToken(token: string | null): void;
  session: any;
  setSession(session: any): void;
  loadingSession: boolean;
  setLoadingSession(loadingSession: boolean): void;
}

export const useStore = create<IStore>((set) => ({
  // App
  isAppReady: false,
  setIsAppReady: (isAppReady) => {
    set({ isAppReady });
  },
  // Device
  hasInternetConnection: false,
  setHasInternetConnection: (hasInternetConnection) => {
    set({ hasInternetConnection });
  },
  // Token
  token: null,
  setToken: (token) => {
    set({ token });
  },
  // Session
  session: null,
  setSession: (session) => {
    set({ session });
  },
  loadingSession: false,
  setLoadingSession: (loadingSession) => {
    set({ loadingSession });
  },
}));
