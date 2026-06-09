'use client';
import { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, Loader2, FolderOpen, CheckCircle2, XCircle, RotateCcw, Brain } from 'lucide-react';

const categories = ['Requirements', 'Architecture', 'Security', 'Performance', 'Scalability', 'UX'];

// No mock questions - dynamically generated

export default function MCQPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'questions' | 'results' | 'recommendations'>('questions');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    const id = localStorage.getItem('activeProjectId'); 
    if(id) setProjectId(id); 
    fetch('/api/projects').then(r=>r.json()).then(d=>{if(d.success)setProjects(d.projects)}).catch(()=>{}); 
  }, []);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetch(`/api/mcq?projectId=${projectId}`)
        .then(r => r.json())
        .then(async d => {
          if (d.success && d.assessment) {
            setQuestions(d.assessment.questions);
            setSubmitted(true);
            setActiveTab('results');
          } else {
            setSubmitted(false);
            setAnswers({});
            setActiveTab('questions');
            setIsGenerating(true);
            try {
              const res = await fetch('/api/tools/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  task: 'Generate MCQ',
                  context: 'Project requirements',
                  systemPrompt: 'Generate exactly 5 multiple choice questions for a software project assessment as a raw JSON array. Each object should have: id (number), category (string: Requirements, Architecture, Security, Performance, Scalability, or UX), question (string), options (array of exactly 4 strings), correct (number: 0-3 representing index of correct option). Return ONLY the JSON array, no markdown fences.'
                })
              });
              const rawData = await res.json();
              let content = rawData.result || rawData.output || rawData.text || rawData.message || '';
              content = content.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(content);
              if (Array.isArray(parsed)) {
                setQuestions(parsed);
              }
            } catch (err) {
              console.error(err);
            } finally {
              setIsGenerating(false);
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  const filtered = selectedCategory ? questions.filter(q => q.category === selectedCategory) : questions;
  const answered = Object.keys(answers).length;
  const correct = submitted ? questions.filter(q => answers[q.id] === q.correct).length : 0;
  const score = submitted ? Math.round((correct / (questions.length || 1)) * 100) : 0;
  const gaps = submitted ? questions.filter(q => answers[q.id] !== q.correct).map(q => q.category) : [];
  const uniqueGaps = [...new Set(gaps)];

  const handleSubmit = async () => { 
    setSubmitted(true); 
    setActiveTab('results'); 
    
    if (projectId && questions.length > 0) {
      const g = [...new Set(questions.filter(q => answers[q.id] !== q.correct).map(q => q.category))];
      const s = Math.round((questions.filter(q => answers[q.id] === q.correct).length / questions.length) * 100);
      await fetch('/api/mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          score: s,
          total: questions.length,
          questions: questions,
          gaps: g
        })
      });
    }
  };
  const handleReset = () => { setAnswers({}); setSubmitted(false); setActiveTab('questions'); setAiRecommendations(''); };

  const handleGenerateRecs = async () => {
    setIsGenerating(true); setAiRecommendations(''); setActiveTab('recommendations');
    const gapList = uniqueGaps.join(', ');
    try {
      const res = await fetch('/api/tools/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'Gap Analysis', context: `Knowledge gaps in: ${gapList}. Score: ${score}%. ${correct}/${questions.length} correct.`, systemPrompt: `You are a Senior Technical Consultant. The user scored ${score}% with gaps in: ${gapList}. For each gap, provide: what they misunderstand, key concepts, resources, project impact. Then overall readiness assessment. Output markdown.` }) });
      if (!res.body) throw new Error('No body');
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let done = false;
      while (!done) { const { value, done: d } = await reader.read(); done = d; if (value) setAiRecommendations(p => p + decoder.decode(value)); }
    } catch { setAiRecommendations('Error. Check API keys.'); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 flex items-center justify-center"><HelpCircle className="w-6 h-6 text-orange-400" /></div>
          <div><h1 className="text-2xl font-bold text-white tracking-tight">AI Interrogation Quiz</h1><p className="text-[#8b9bb4] text-sm mt-1">MCQ-based knowledge gap analysis for your project</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111622] border border-[#1e2532] rounded-lg px-3 py-1.5"><FolderOpen className="w-4 h-4 text-[#586c8f]"/><select value={projectId||''} onChange={e=>{setProjectId(e.target.value);localStorage.setItem('activeProjectId',e.target.value)}} className="bg-transparent text-sm text-white font-bold focus:outline-none">{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          {!submitted ? (
            <button onClick={handleSubmit} disabled={answered===0} className="bg-[#f97316] hover:bg-[#ea580c] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 text-sm"><CheckCircle2 className="w-4 h-4"/>Submit ({answered}/{questions.length})</button>
          ) : (
            <button onClick={handleReset} className="bg-[#111622] border border-[#1e2532] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all text-sm"><RotateCcw className="w-4 h-4"/>Reset</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-4 text-center"><div className="text-2xl font-black text-white">{questions.length}</div><div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Questions</div></div>
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-4 text-center"><div className="text-2xl font-black text-[#5b5fd8]">{answered}</div><div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Answered</div></div>
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-4 text-center"><div className={`text-2xl font-black ${submitted?(score>=80?'text-green-400':score>=50?'text-yellow-400':'text-red-400'):'text-[#586c8f]'}`}>{submitted?`${score}%`:'—'}</div><div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Score</div></div>
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-4 text-center"><div className="text-2xl font-black text-red-400">{submitted?uniqueGaps.length:'—'}</div><div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Gaps</div></div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['questions','results','recommendations'] as const).map(tab=>(<button key={tab} onClick={()=>setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeTab===tab?'bg-orange-500/20 border border-orange-500/30 text-white':'bg-[#111622] border border-[#1e2532] text-[#8b9bb4] hover:text-white'}`}>{tab}</button>))}
        {submitted&&<button onClick={handleGenerateRecs} disabled={isGenerating} className="ml-auto bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-xs disabled:opacity-50">{isGenerating?<Loader2 className="w-3 h-3 animate-spin"/>:<Brain className="w-3 h-3"/>}AI Gap Analysis</button>}
      </div>

      {activeTab==='questions'&&<div className="flex gap-2 mb-4 flex-wrap"><button onClick={()=>setSelectedCategory(null)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${!selectedCategory?'bg-orange-500/20 border border-orange-500/30 text-white':'bg-[#111622] border border-[#1e2532] text-[#8b9bb4]'}`}>All</button>{categories.map(c=>(<button key={c} onClick={()=>setSelectedCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${selectedCategory===c?'bg-orange-500/20 border border-orange-500/30 text-white':'bg-[#111622] border border-[#1e2532] text-[#8b9bb4]'}`}>{c}</button>))}</div>}

      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {activeTab==='questions'&&filtered.map((q,i)=>(<div key={q.id} className={`bg-[#111622] border rounded-xl p-5 ${submitted?(answers[q.id]===q.correct?'border-green-500/30':answers[q.id]!==undefined?'border-red-500/30':'border-yellow-500/30'):'border-[#1e2532]'}`}><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-3"><span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">{q.category}</span><span className="text-xs text-[#586c8f]">Q{i+1}</span></div>{submitted&&(answers[q.id]===q.correct?<CheckCircle2 className="w-5 h-5 text-green-400"/>:answers[q.id]!==undefined?<XCircle className="w-5 h-5 text-red-400"/>:<HelpCircle className="w-5 h-5 text-yellow-400"/>)}</div><p className="text-white font-medium text-sm mb-4">{q.question}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{q.options.map((opt: string,oi: number)=>(<button key={oi} onClick={()=>!submitted&&setAnswers(prev=>({...prev,[q.id]:oi}))} disabled={submitted} className={`text-left p-3 rounded-lg text-sm transition-all ${submitted?(oi===q.correct?'bg-green-500/10 border border-green-500/30 text-green-300':oi===answers[q.id]?'bg-red-500/10 border border-red-500/30 text-red-300':'bg-[#0b0e14] border border-[#1e2532] text-[#586c8f]'):(answers[q.id]===oi?'bg-[#5b5fd8]/20 border border-[#5b5fd8]/40 text-white':'bg-[#0b0e14] border border-[#1e2532] text-[#8b9bb4] hover:border-[#5b5fd8]/30')}`}><span className="font-mono text-xs text-[#586c8f] mr-2">{String.fromCharCode(65+oi)}.</span>{opt}</button>))}</div></div>))}
        {activeTab==='results'&&submitted&&<div className="space-y-4"><div className="bg-[#111622] border border-[#1e2532] rounded-xl p-6 text-center"><div className={`text-6xl font-black mb-2 ${score>=80?'text-green-400':score>=50?'text-yellow-400':'text-red-400'}`}>{score}%</div><div className="text-white font-bold text-lg mb-1">{score>=80?'Excellent!':score>=50?'Needs Improvement':'Critical Gaps'}</div><div className="text-[#8b9bb4] text-sm">{correct}/{questions.length} correct</div></div>{uniqueGaps.length>0&&<div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5"><h3 className="text-sm font-bold text-red-400 mb-3">Gaps Detected</h3><div className="flex flex-wrap gap-2">{uniqueGaps.map(g=>(<span key={g} className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold">{g}</span>))}</div></div>}</div>}
        {activeTab==='recommendations'&&<div className="bg-[#0b0e14] border border-[#1e2532] rounded-xl p-6">{aiRecommendations?<div className="text-[#e2e8f0] font-mono text-sm whitespace-pre-wrap">{aiRecommendations}</div>:<div className="text-center py-12 opacity-50"><Brain className="w-16 h-16 text-[#586c8f] mx-auto mb-4"/><p className="text-[#8b9bb4] font-bold">{isGenerating?'Analyzing...':'Submit quiz then click AI Gap Analysis'}</p></div>}</div>}
      </div>
    </div>
  );
}
