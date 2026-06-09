import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  deepseekApiKey: string;
  ollamaUrl: string;
  ollamaAuthToken: string;
  setDeepseekApiKey: (key: string) => void;
  setOllamaUrl: (url: string) => void;
  setOllamaAuthToken: (token: string) => void;
  clearSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      deepseekApiKey: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaAuthToken: '',
      setDeepseekApiKey: (key) => set({ deepseekApiKey: key }),
      setOllamaUrl: (url) => set({ ollamaUrl: url }),
      setOllamaAuthToken: (token) => set({ ollamaAuthToken: token }),
      clearSettings: () => set({ deepseekApiKey: '', ollamaUrl: 'http://localhost:11434', ollamaAuthToken: '' }),
    }),
    {
      name: 'bg-factory-settings',
    }
  )
);
