import fs from 'fs';
import path from 'path';
import { AIModel } from '../ai/router';
import { encryptApiKey, decryptApiKey } from '../security';

export type ProjectApiKeys = Partial<Record<AIModel, string>>;

export interface ProjectSettings {
  apiKeys: ProjectApiKeys;
  updatedAt: string;
}

const SETTINGS_FILE = path.join(process.cwd(), '.data', 'project-settings.json');

// Ensure the .data directory exists
const ensureDataDir = () => {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({}), 'utf-8');
  }
};

export const getProjectApiKeys = async (projectId: string): Promise<ProjectApiKeys> => {
  ensureDataDir();
  const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  
  // If the project doesn't have specific keys yet, fallback to system ENV variables
  // to ensure smooth onboarding if they already have them in .env
  const rawProjectKeys: ProjectApiKeys = data[projectId]?.apiKeys || {};
  
  const decryptedKeys: ProjectApiKeys = {};
  for (const [key, value] of Object.entries(rawProjectKeys)) {
    if (value) {
      decryptedKeys[key as AIModel] = decryptApiKey(value as string);
    }
  }

  return {
    deepseek: decryptedKeys.deepseek || process.env.DEEPSEEK_API_KEY,
    gpt4: decryptedKeys.gpt4 || process.env.OPENAI_API_KEY,
    claude: decryptedKeys.claude || process.env.ANTHROPIC_API_KEY,
    gemini: decryptedKeys.gemini || process.env.GEMINI_API_KEY,
    kimi: decryptedKeys.kimi || process.env.MOONSHOT_API_KEY,
    ollama: 'local', // Ollama doesn't require a key usually
  };
};

export const saveProjectApiKeys = async (projectId: string, keys: ProjectApiKeys): Promise<void> => {
  ensureDataDir();
  const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  
  if (!data[projectId]) {
    data[projectId] = { apiKeys: {}, updatedAt: new Date().toISOString() };
  }
  
  const encryptedKeys: ProjectApiKeys = {};
  for (const [key, value] of Object.entries(keys)) {
    if (value) {
      encryptedKeys[key as AIModel] = encryptApiKey(value as string);
    }
  }

  data[projectId].apiKeys = { ...data[projectId].apiKeys, ...encryptedKeys };
  data[projectId].updatedAt = new Date().toISOString();
  
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
};
