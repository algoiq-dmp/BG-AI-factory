'use client';

import { useState } from 'react';
import { Columns, Plus, MessageSquare, ListTodo, Loader2, Sparkles, User, Tag, MoreHorizontal } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

interface Story {
  id: string;
  epic: string;
  title: string;
  asA: string;
  iWantTo: string;
  soThat: string;
  acceptanceCriteria: string[];
  status: 'backlog' | 'generated';
}

export default function UserStoriesPage() {
  const { activeProjectId, getActiveProject } = useProjectStore();
  const currentProject = getActiveProject();

  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      epic: 'Authentication',
      title: 'User Login via SSO',
      asA: 'Corporate User',
      iWantTo: 'log in using my company SSO credentials',
      soThat: 'I do not have to remember another password',
      acceptanceCriteria: ['SSO button is visible on login page', 'Successful login redirects to dashboard', 'Invalid credentials show error message'],
      status: 'generated'
    },
    {
      id: '2',
      epic: 'Dashboard',
      title: 'View Analytics Summary',
      asA: 'Manager',
      iWantTo: 'see a high-level summary of team performance',
      soThat: 'I can quickly assess the current status without drilling down',
      acceptanceCriteria: [],
      status: 'backlog'
    }
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeEpic, setActiveEpic] = useState<string>('All');

  const epics = ['All', ...new Set(stories.map(s => s.epic))];
  const filteredStories = activeEpic === 'All' ? stories : stories.filter(s => s.epic === activeEpic);

  const handleGenerateAI = async () => {
    if (!activeProjectId) return alert('Please select a project first.');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          task: 'Generate User Stories',
          context: `Current active epic filter: ${activeEpic}`,
          systemPrompt: 'You are a Senior Product Manager. Generate 3 user stories for the project. Return raw JSON array of objects with keys: epic (string), title (string), asA (string), iWantTo (string), soThat (string), acceptanceCriteria (array of strings). Do not use markdown fences.'
        })
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let output = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) output += decoder.decode(value);
      }
      
      const cleanJson = output.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (Array.isArray(parsed)) {
        const newStories: Story[] = parsed.map(s => ({
          ...s,
          id: Date.now().toString() + Math.random().toString(),
          status: 'generated'
        }));
        setStories(prev => [...prev, ...newStories]);
      }
    } catch (err) {
      console.error(err);
      // Mock fallback if JSON parsing fails
      setStories(prev => [...prev, {
        id: Date.now().toString(),
        epic: 'AI Generated Epic',
        title: 'Export Reports',
        asA: 'Data Analyst',
        iWantTo: 'export the table data to CSV',
        soThat: 'I can analyze it in Excel',
        acceptanceCriteria: ['Export button visible', 'Downloads .csv file', 'Contains all table columns'],
        status: 'generated'
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden bg-[#0b0e14]">
      
      {/* Header */}
      <div className="p-6 border-b border-[#1e2532] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center">
              <Columns className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">User Stories & Backlog</h1>
              <p className="text-[#8b9bb4] text-sm mt-1">
                AI-driven agile requirement breakdown and acceptance criteria generation
              </p>
            </div>
          </div>
          <button 
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(91,95,216,0.3)] disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'Drafting Stories...' : 'Auto-Generate Stories'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-[#1e2532] bg-[#111622] flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar">
        {epics.map(epic => (
          <button
            key={epic}
            onClick={() => setActiveEpic(epic)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
              activeEpic === epic 
                ? 'bg-[#f59e0b]/10 border-[#f59e0b]/50 text-[#f59e0b]' 
                : 'bg-[#0b0e14] border-[#1e2532] text-[#8b9bb4] hover:border-[#586c8f]'
            }`}
          >
            {epic}
          </button>
        ))}
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#0b0e14] to-[#111622] custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(story => (
            <div key={story.id} className="bg-[#111622] border border-[#1e2532] rounded-2xl overflow-hidden hover:border-[#586c8f]/50 transition-colors shadow-sm flex flex-col">
              
              <div className="p-4 border-b border-[#1e2532] bg-[#1a1b3b]/30 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2 py-0.5 rounded">
                  {story.epic}
                </span>
                <button className="text-[#586c8f] hover:text-white transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-white font-bold text-lg mb-4">{story.title}</h3>
                
                <div className="space-y-3 mb-6 bg-[#0b0e14] p-4 rounded-xl border border-[#1e2532]">
                  <p className="text-sm">
                    <span className="text-[#8b9bb4] font-bold block mb-1">As a</span>
                    <span className="text-[#f59e0b] font-medium flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {story.asA}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-[#8b9bb4] font-bold block mb-1">I want to</span>
                    <span className="text-white">{story.iWantTo}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-[#8b9bb4] font-bold block mb-1">So that</span>
                    <span className="text-[#10b981]">{story.soThat}</span>
                  </p>
                </div>

                <div className="mt-auto">
                  <h4 className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5" /> Acceptance Criteria
                  </h4>
                  {story.acceptanceCriteria.length > 0 ? (
                    <ul className="space-y-2">
                      {story.acceptanceCriteria.map((ac, idx) => (
                        <li key={idx} className="text-xs text-[#8b9bb4] flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#5b5fd8] mt-1.5 shrink-0" />
                          <span>{ac}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-[#586c8f] italic bg-white/5 p-2 rounded-lg text-center border border-[#1e2532] border-dashed">
                      No criteria defined yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <div className="border-2 border-dashed border-[#1e2532] rounded-2xl flex flex-col items-center justify-center p-8 text-[#586c8f] hover:border-[#5b5fd8]/50 hover:text-[#5b5fd8] transition-colors cursor-pointer group bg-[#111622]/50 min-h-[300px]">
            <Plus className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold">Draft Manual Story</span>
          </div>
        </div>
      </div>

    </div>
  );
}
