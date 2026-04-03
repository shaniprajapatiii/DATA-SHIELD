import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Shield, ChevronRight } from 'lucide-react';

const SUGGESTED = [
  'What is DataShield?',
  'How does the risk score work?',
  'What permissions are monitored?',
  'How do I scan a website?',
  'Is DataShield free to use?',
  'What is policy sentiment analysis?',
];

const SYSTEM_PROMPT = `You are DataShield AI Assistant — a concise, sharp, cybersecurity-focused chatbot for the DataShield platform.
DataShield is an intelligent privacy layer that:
- Scans privacy policies using NLP and gives a 0–100 risk score
- Monitors real-time app permissions (camera, mic, location, clipboard, contacts, storage)
- Summarizes TOS into 3 key bullets: what data is collected, who it's shared with, how long it's retained
- Provides sentiment analysis: Hostile / Neutral / Protective
- Allows side-by-side comparison of two apps
- Has a browser extension for real-time scanning
- Offers an Enterprise API and compliance dashboard
- Is GDPR/HIPAA compliant

Keep answers short, sharp, and use a cybersecurity/hacker tone. Use bullet points where helpful. Never be verbose.`;

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "DATASHIELD AI ONLINE.\n\nI can tell you everything about the platform — risk scores, permission monitoring, policy analysis, and more. What do you need?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Error fetching response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠ Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-sm border border-[rgba(0,245,255,0.4)] bg-shield-800 hover:bg-shield-700 transition-all duration-300 group"
        style={{ boxShadow: '0 0 20px rgba(0,245,255,0.2)' }}
      >
        {open
          ? <X size={20} className="text-[var(--accent)]" />
          : <MessageSquare size={20} className="text-[var(--accent)] group-hover:drop-shadow-[0_0_8px_#00f5ff] transition-all" />
        }
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--green)] rounded-full border-2 border-shield-900 animate-pulse" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] flex flex-col rounded-sm border border-[rgba(0,245,255,0.2)] bg-shield-800 shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(0,245,255,0.1), 0 20px 60px rgba(0,0,0,0.5)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(0,245,255,0.1)] bg-shield-900">
            <div className="relative">
              <Shield size={18} className="text-[var(--accent)]" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--green)] rounded-full border border-shield-900" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-white tracking-wider">DataShield AI</p>
              <p className="font-mono text-xs text-[var(--green)]">● ONLINE</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-sm text-xs font-mono leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[rgba(0,245,255,0.1)] border border-[rgba(0,245,255,0.25)] text-white'
                      : 'bg-shield-700 border border-[rgba(255,255,255,0.06)] text-slate-300'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-sm bg-shield-700 border border-[rgba(255,255,255,0.06)]">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                        style={{ animation: `blink 1s step-end ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3 flex flex-col gap-1.5">
              <p className="font-mono text-xs text-slate-600 mb-1">Suggested:</p>
              {SUGGESTED.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="flex items-center gap-2 text-left px-3 py-2 rounded-sm border border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.3)] text-slate-400 hover:text-white font-mono text-xs transition-all duration-200"
                >
                  <ChevronRight size={11} className="text-[var(--accent)] flex-shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-[rgba(0,245,255,0.1)] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about DataShield..."
              className="flex-1 bg-shield-900 border border-[rgba(0,245,255,0.15)] rounded-sm px-3 py-2 font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[rgba(0,245,255,0.4)] transition-colors"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-9 h-9 flex items-center justify-center rounded-sm border border-[rgba(0,245,255,0.3)] text-[var(--accent)] hover:bg-[rgba(0,245,255,0.1)] disabled:opacity-30 transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
