'use client';

import { useState, useEffect } from 'react';
import { 
  Send, Bot, User, Sparkles, FolderOpen, Loader2, BrainCircuit,
  Copy, RefreshCcw
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: '🙏 Namaste! I am your **Bhagvat Gita AI Assistant**.\n\nI have access to your project\'s entire Knowledge Base — requirements, architecture, code, and documentation.\n\nAsk me anything about your project, and I will answer using the full context of your AI Software Factory pipeline.\n\n**Try asking:**\n- "What is the current architecture of my project?"\n- "Generate a user story for the login module"\n- "What risks should I watch out for?"\n- "Summarize all documents generated so far"', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('activeProjectId');
    setProjectId(id);
    fetch('/api/projects').then(r => r.json()).then(d => {
      if (d.success) setProjects(d.projects);
    });
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: input,
          context: `You are a helpful AI assistant for the Bhagvat Gita Software Factory. Answer the user's question using the project knowledge base context. Be concise, professional, and actionable.`,
          systemPrompt: 'You are Krishna, the AI advisor of the Bhagvat Gita Software Factory. Respond in clear, professional markdown. Be helpful and specific.'
        })
      });

      if (!res.body) throw new Error('No response');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      const assistantId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullResponse } : m));
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: '⚠️ Failed to connect to AI. Please check your API keys in Settings.', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="p-4 border-b border-[#1e2532] bg-[#0b0e14] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/5 border border-[#f59e0b]/30 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Krishna AI Chat</h1>
            <p className="text-[10px] text-[#586c8f] uppercase tracking-wider font-bold">Context-Aware Project Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#111622] border border-[#1e2532] rounded-lg px-3 py-1.5">
          <FolderOpen className="w-4 h-4 text-[#586c8f]" />
          <select value={projectId || ''} onChange={e => { setProjectId(e.target.value); localStorage.setItem('activeProjectId', e.target.value); }}
            className="bg-transparent text-sm text-white font-bold focus:outline-none">
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-[#f59e0b]" />
              </div>
            )}
            <div className={`max-w-[70%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-[#5b5fd8] text-white rounded-tr-sm' 
                : 'bg-[#111622] border border-[#1e2532] text-gray-300 rounded-tl-sm'
            }`}>
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{msg.content}</pre>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                <span className="text-[10px] opacity-50">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.role === 'assistant' && msg.content && (
                  <button onClick={() => navigator.clipboard.writeText(msg.content)} className="opacity-30 hover:opacity-100 transition-opacity">
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#5b5fd8]/20 border border-[#5b5fd8]/30 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-[#5b5fd8]" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <div className="bg-[#111622] border border-[#1e2532] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#586c8f] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#586c8f] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#586c8f] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1e2532] bg-[#0b0e14]">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Krishna about your project..."
            className="flex-1 bg-[#111622] border border-[#1e2532] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#5b5fd8] transition-colors"
          />
          <button onClick={sendMessage} disabled={isTyping || !input.trim()}
            className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white p-3 rounded-xl transition-all disabled:opacity-50">
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
