import fs from 'fs';
import path from 'path';

export interface SwarmLesson {
  id: string;
  projectId: string;
  phaseId: number;
  issue: string; // bugs, delays, rework
  solution: string; // how the swarm fixed it
  improvement: string; // rule to apply to future projects
  timestamp: string;
}

export interface SwarmMemoryData {
  lessons: SwarmLesson[];
  promotedAgents: string[]; // IDs of agents promoted to permanent status
}

const MEMORY_FILE = path.join(process.cwd(), '.data', 'swarm-memory.json');

const ensureMemoryDir = () => {
  const dir = path.dirname(MEMORY_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify({ lessons: [], promotedAgents: [] }), 'utf-8');
  }
};

export const getSwarmMemory = (): SwarmMemoryData => {
  ensureMemoryDir();
  return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
};

export const logSwarmLesson = (lesson: Omit<SwarmLesson, 'id' | 'timestamp'>) => {
  const memory = getSwarmMemory();
  const newLesson: SwarmLesson = {
    ...lesson,
    id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString()
  };
  
  memory.lessons.push(newLesson);
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf-8');
  return newLesson;
};

export const promoteAgent = (agentId: string) => {
  const memory = getSwarmMemory();
  if (!memory.promotedAgents.includes(agentId)) {
    memory.promotedAgents.push(agentId);
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf-8');
  }
};
