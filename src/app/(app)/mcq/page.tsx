'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, TrendingUp, Sparkles, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

interface Option {
  id: string;
  text: string;
  isAiRec?: boolean;
}

interface Question {
  id: number;
  priority: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  category: string;
  text: string;
  options: Option[];
  selectedOptionId?: string;
  isCorrect?: boolean;
  correctOptionIndex: number;
}

export default function MCQPage() {
  const { activeProjectId, getActiveProject } = useProjectStore();
  const currentProject = getActiveProject();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!activeProjectId) {
      setLoading(false);
      return;
    }

    const loadAssessment = async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/mcq?projectId=${activeProjectId}`);
        const d = await r.json();
        
        if (d.success && d.assessment && d.assessment.questions && d.assessment.questions.length > 0) {
          // Format from DB format to our UI format
          const formatted = d.assessment.questions.map((q: any, i: number) => ({
            id: q.id || i,
            priority: ['HIGH', 'CRITICAL', 'MEDIUM'][i % 3] as any,
            category: q.category || 'General',
            text: q.question,
            options: q.options.map((opt: string, oi: number) => ({
              id: `o${oi}`,
              text: opt,
              isAiRec: oi === q.correct && i % 2 === 0 // Mock AI rec
            })),
            correctOptionIndex: q.correct
          }));
          setQuestions(formatted);
          setSubmitted(true);
        } else {
          // Generate new assessment
          generateAssessment();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    loadAssessment();
  }, [activeProjectId]);

  const generateAssessment = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          task: 'Generate MCQ Assessment',
          context: 'Generate an AI readiness interrogation quiz for the project.',
          systemPrompt: 'Generate exactly 8 multiple choice questions for a software project assessment as a raw JSON array. Each object MUST have: id (number), priority ("HIGH", "CRITICAL", or "MEDIUM"), category (string like "Data Flow" or "Security"), text (the question string), options (array of exactly 4 strings), correct (number: 0-3 representing index of correct option). Return ONLY the JSON array, no markdown fences.'
        })
      });
      
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let finalContent = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          finalContent += decoder.decode(value);
        }
      }

      const cleanJson = finalContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (Array.isArray(parsed)) {
        const formatted = parsed.map((q: any) => ({
          id: q.id,
          priority: q.priority || 'MEDIUM',
          category: q.category || 'General',
          text: q.text || q.question,
          options: (q.options || []).map((opt: string, oi: number) => ({
            id: `o${oi}`,
            text: opt,
            isAiRec: oi === q.correct
          })),
          correctOptionIndex: q.correct
        }));
        setQuestions(formatted);
      }
    } catch (err) {
      console.error("Error generating MCQ:", err);
      // Fallback if AI stream parsing fails
      setQuestions([
        {
          id: 1,
          priority: 'HIGH',
          category: 'Architecture',
          text: "If the application requires high availability, which architectural pattern is most suitable?",
          options: [
            { id: 'o0', text: 'Monolith with single database' },
            { id: 'o1', text: 'Microservices with load balancing', isAiRec: true },
            { id: 'o2', text: 'Desktop application' },
            { id: 'o3', text: 'Serverless functions only' },
          ],
          correctOptionIndex: 1
        },
        {
          id: 2,
          priority: 'CRITICAL',
          category: 'Security',
          text: "How should sensitive user data be stored in the database?",
          options: [
            { id: 'o0', text: 'Plain text for fast retrieval' },
            { id: 'o1', text: 'Base64 encoded' },
            { id: 'o2', text: 'Hashed and salted', isAiRec: true },
            { id: 'o3', text: 'In localStorage' },
          ],
          correctOptionIndex: 2
        }
      ]);
    } finally {
      setGenerating(false);
    }
  };

  const selectOption = (qId: number, oId: string) => {
    if (submitted) return;
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, selectedOptionId: oId } : q));
  };

  const handleSubmit = async () => {
    // Mark as correct based on selected option index
    const evaluated = questions.map(q => {
      const selectedIndex = parseInt(q.selectedOptionId?.replace('o', '') || '-1');
      return {
        ...q,
        isCorrect: selectedIndex === q.correctOptionIndex
      };
    });
    setQuestions(evaluated);
    setSubmitted(true);

    const correctCount = evaluated.filter(q => q.isCorrect).length;
    const score = Math.round((correctCount / evaluated.length) * 100);

    if (activeProjectId) {
      await fetch('/api/mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          score: score,
          total: evaluated.length,
          questions: evaluated.map(q => ({
            id: q.id,
            category: q.category,
            question: q.text,
            options: q.options.map(o => o.text),
            correct: q.correctOptionIndex
          })),
          gaps: []
        })
      });
    }
  };

  if (!activeProjectId) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <HelpCircle className="w-16 h-16 text-[#586c8f] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Project Selected</h2>
          <p className="text-[#8b9bb4]">Please select a project from the top right dropdown to view or generate its AI Interrogation Quiz.</p>
        </div>
      </div>
    );
  }

  if (loading || generating) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#5b5fd8] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{generating ? 'Generating AI Assessment...' : 'Loading Quiz...'}</h2>
          <p className="text-[#8b9bb4]">Analyzing project requirements and building dynamic knowledge gap questions.</p>
        </div>
      </div>
    );
  }

  const answeredCount = questions.filter(q => q.selectedOptionId).length;
  const isAllAnswered = answeredCount === questions.length;
  const correctCount = questions.filter(q => q.isCorrect).length;
  const currentScore = submitted ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto w-full overflow-y-auto">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#5b5fd8]/10 flex items-center justify-center border border-[#5b5fd8]/30">
              <Sparkles className="w-4 h-4 text-[#5b5fd8]" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">MCQ Round 8</h1>
            {submitted && (
              <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> All Done
              </span>
            )}
          </div>
          <p className="text-[#8b9bb4] text-xs ml-11">
            <span className="text-[#5b5fd8] font-bold">{currentProject?.name || 'Project Assessment'}</span> • {questions.length} questions this round • Powered by deepseek
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-lg text-sm font-bold">
            Score: {submitted ? `${currentScore}%` : '---'}
          </span>
          <span className="bg-[#5b5fd8]/10 text-[#5b5fd8] border border-[#5b5fd8]/20 px-3 py-1 rounded-lg text-sm font-bold">
            Round 8 of ∞
          </span>
        </div>
      </div>

      {/* Progress Banner */}
      <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#8b9bb4]" />
            <div>
              <h2 className="text-white font-bold">{questions.length} Questions in this Round</h2>
              <p className="text-[#586c8f] text-xs">{answeredCount} of {questions.length} answered</p>
            </div>
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <div className="text-2xl font-black text-[#5b5fd8]">{questions.length}</div>
              <div className="text-[9px] uppercase tracking-widest text-[#586c8f] font-bold">TOTAL MCQS</div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#10b981]">{answeredCount}</div>
              <div className="text-[9px] uppercase tracking-widest text-[#586c8f] font-bold">ANSWERED</div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#f59e0b]">8</div>
              <div className="text-[9px] uppercase tracking-widest text-[#586c8f] font-bold">ROUNDS</div>
            </div>
          </div>
        </div>

        <div className="h-1.5 w-full bg-[#1e2532] rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-[#10b981] transition-all duration-500" 
            style={{ width: `${(answeredCount / (questions.length || 1)) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-[#10b981] font-bold">
            <Check className="w-3 h-3 inline-block mr-1" />
            {isAllAnswered ? 'All questions answered — click "Submit & Continue" to proceed' : 'Please answer all questions to proceed'}
          </p>
          {!submitted && isAllAnswered && (
             <button 
                onClick={handleSubmit}
                className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
             >
               Submit & Continue
             </button>
          )}
        </div>
      </div>

      {/* Goal Banner */}
      <div className="bg-[#5b5fd8]/5 border-l-4 border-[#5b5fd8] rounded-r-xl p-5 mb-8">
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp className="w-5 h-5 text-[#5b5fd8]" />
          <h3 className="text-white font-bold text-sm">To improve score to 90% — answer the following questions</h3>
        </div>
        <p className="text-[#8b9bb4] text-xs ml-8">Each answer fills a gap in the project KB. The closer you get to 90%, the stronger your prompts will be.</p>
      </div>

      {/* Questions List */}
      <div className="space-y-8">
        {questions.map((q, idx) => (
          <div key={q.id} className="relative pl-10">
            {/* Number Indicator */}
            <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
              submitted 
                ? (q.isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400')
                : 'bg-green-500/10 border-green-500/30 text-green-400'
            }`}>
              {idx + 1}
            </div>
            
            {/* Tags */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                q.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                q.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {q.priority}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1e2532] text-[#8b9bb4] border border-[#2a3441]">
                {q.category}
              </span>
              {submitted && (
                 q.isCorrect ? <CheckCircle2 className="w-4 h-4 text-[#10b981] ml-auto" /> : <AlertCircle className="w-4 h-4 text-red-400 ml-auto" />
              )}
            </div>

            {/* Question Text */}
            <h3 className="text-white font-bold mb-4 text-base leading-relaxed">
              {q.text}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {q.options.map((opt, oidx) => {
                const isSelected = q.selectedOptionId === opt.id;
                const isCorrectOption = oidx === q.correctOptionIndex;
                
                let btnClass = 'bg-[#111622] border-[#1e2532] hover:border-[#586c8f] hover:bg-white/5';
                let circleClass = 'border-[#586c8f]';
                
                if (submitted) {
                   if (isCorrectOption) {
                      btnClass = 'bg-[#10b981]/10 border-[#10b981]/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
                      circleClass = 'border-[#10b981]';
                   } else if (isSelected && !isCorrectOption) {
                      btnClass = 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
                      circleClass = 'border-red-500';
                   } else {
                      btnClass = 'bg-[#0b0e14] border-[#1e2532] opacity-50';
                      circleClass = 'border-[#1e2532]';
                   }
                } else if (isSelected) {
                   btnClass = 'bg-[#5b5fd8]/10 border-[#5b5fd8]/50 shadow-[0_0_15px_rgba(91,95,216,0.1)]';
                   circleClass = 'border-[#5b5fd8]';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => selectOption(q.id, opt.id)}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-xl border flex items-start gap-3 transition-all ${btnClass}`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${circleClass}`}>
                      {isSelected && <div className={`w-2 h-2 rounded-full ${submitted && !q.isCorrect ? 'bg-red-500' : (submitted && q.isCorrect ? 'bg-[#10b981]' : 'bg-[#5b5fd8]')}`} />}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm ${(isSelected || (submitted && isCorrectOption)) ? 'text-white' : 'text-[#8b9bb4]'}`}>{opt.text}</span>
                    </div>
                    {opt.isAiRec && (
                      <span className="shrink-0 flex items-center gap-1 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest">
                        <Sparkles className="w-2.5 h-2.5" /> AI REC
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
