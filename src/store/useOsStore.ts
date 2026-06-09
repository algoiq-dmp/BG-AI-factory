import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OsMode = 'STARTUP' | 'ENTERPRISE';

interface OsState {
  mode: OsMode;
  toggleMode: () => void;
  setMode: (mode: OsMode) => void;
}

export const useOsStore = create<OsState>()(
  persist(
    (set) => ({
      mode: 'STARTUP',
      toggleMode: () => set((state) => ({ mode: state.mode === 'STARTUP' ? 'ENTERPRISE' : 'STARTUP' })),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'launch-iq-os-mode',
    }
  )
);
