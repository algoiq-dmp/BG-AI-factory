const fs = require('fs');
const path = require('path');

const tools = [
  // Discovery
  'Requirement Intelligence', 'Auto Research', 'Competitive Analysis', 'User Stories', 'MCQ Engine', 'Feature Engine', 'Knowledgebase', 'Master Document',
  // Architecture
  'Solution Architect', 'API Blueprint', 'Database Designer', 'Wireframe Planner', 'UI Preview', 'Dependency Graph',
  // Intelligence
  'AI Agents Manager', 'BG Modes', 'Prompt Workshop', 'Prompt Compiler', 'Auto Intelligence', 'Knowledge Memory',
  // Development
  'Dev Intelligence', 'Time Machine', 'Estimation', 'Sprint Planner', 'Meeting Intelligence',
  // Audit
  'Code Audit', 'Audit Center', 'Risk Analyzer', 'Testing Intelligence', 'Compliance', 'Skills Analyzer',
  // Deployment
  'Deploy Checklist', 'Client Proposal', 'SOP Generator', 'Changelog',
  // Maintenance
  'CR Dashboard', 'File CR Bug', 'Requirements Vault', 'Impact Analysis', 'Fix Prompts', 'CR Testing'
];

const basePath = path.join(__dirname, '..', 'src', 'app', '(tools)');

// Ensure base dir exists
if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

tools.forEach(tool => {
  const slug = tool.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const dirPath = path.join(basePath, slug);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const pagePath = path.join(dirPath, 'page.tsx');
  
  const content = `'use client';

import { Wrench } from 'lucide-react';

export default function ${slug.replace(/-/g, '')}Page() {
  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      <div className="glass-panel p-12 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-blue-500/20 text-accent-neon rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">${tool}</h1>
        <p className="text-gray-400 text-sm">
          This advanced intelligence module is currently being scaffolded for the BG Software Factory.
        </p>
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(pagePath, content);
  console.log(`Created route: /${slug}`);
});

console.log('Successfully scaffolded 40 tool routes.');
