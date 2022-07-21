import create from 'zustand';

interface IStore {
  token: string | null;
  setToken(token: string | null): void;
  session: any;
  setSession(session: any): void;
  loadingSession: boolean;
  setLoadingSession(isLoading: boolean): void;
}

export const useStore = create<IStore>((set) => ({
  // Token
  token: null,
  setToken: (input) => {
    set({ token: input });
  },
  // Session
  session: null,
  setSession: (session) => {
    set({ session: session });
  },
  loadingSession: false,
  setLoadingSession: (isLoading) => {
    set({ loadingSession: isLoading });
  },
}));
