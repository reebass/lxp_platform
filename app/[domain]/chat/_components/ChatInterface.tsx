'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { dict } from '@/lib/i18n/dictionaries';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface ChatInterfaceProps {
  tenantId: string;
}

export const ChatInterface = ({ tenantId }: ChatInterfaceProps) => {
  const d = dict.uk.chat;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: d.greeting,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          question: userMessage,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || d.errorResponse,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch from AI backend:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: d.errorConnection,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full max-w-4xl mx-auto bg-background-content/50 border border-border/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
      {/* Chat header */}
      <div className="p-4 bg-background-content border-b border-border/40 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{d.headerTitle}</h2>
          <p className="text-xs text-muted-foreground">{d.headerSubtitle}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}

            <div
              className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
            >
              <div
                className={`py-3 px-4 rounded-2xl whitespace-pre-wrap ${msg.role === 'user'
                  ? 'bg-primary text-background rounded-tr-sm'
                  : 'bg-background border border-border/60 text-foreground rounded-tl-sm'
                  } text-sm leading-relaxed`}
              >
                {msg.content}
              </div>

              {/* Render sources if available */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.sources.map((source, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-background-content border border-border/50 text-[10px] text-muted-foreground"
                    >
                      <FileText className="w-3 h-3 text-primary/70" />
                      {source}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-background-content border border-border/60 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-foreground/60" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="py-3 px-4 rounded-2xl bg-background border border-border/60 text-muted-foreground rounded-tl-sm text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              {d.typing}
            </div>
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-background-content border-t border-border/40">
        <form
          onSubmit={handleSubmit}
          className="flex relative items-end gap-3 max-w-4xl mx-auto"
        >
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={d.inputPlaceholder}
              className="w-full bg-background border border-border/60 rounded-xl px-4 py-3.5 pr-14 
                text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 
                focus:border-primary disabled:opacity-50 transition-all font-medium"
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-[46px] w-[46px] rounded-xl flex items-center justify-center p-0 shrink-0"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
