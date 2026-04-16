"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Bot, User, SendHorizonal, X } from "lucide-react";
import { dict } from "@/lib/i18n/dictionaries";
import { usePathname } from "next/navigation";


interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

interface SpotlightChatProps {
  tenantId?: string | null;
}

export function SpotlightChat({ tenantId }: SpotlightChatProps) {
  const pathname = usePathname();
  // Visibility rules revised:
  // HIDE on exact root path pathname === '/'
  // SHOW on /admin/data-hub explicitly
  // HIDE on all other /admin routes
  // Still HIDE on /login and /register
  const isHiddenRoute = pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    (pathname.startsWith('/admin') && pathname !== '/admin/data-hub' && pathname !== '/admin/course-builder');

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const d = dict.uk.ai_assistant; // TODO: handle dynamic locale

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: d.greeting,
    },
  ]);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll when messages change or loading state turns on
  useEffect(() => {
    if (isOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle Spotlight custom open event
  useEffect(() => {
    if (isHiddenRoute) return;
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-spotlight", handleOpen);
    return () => window.removeEventListener("open-spotlight", handleOpen);
  }, [isHiddenRoute]);

  // Handle Cmd+K / Ctrl+K / Ctrl+Space and Escape
  useEffect(() => {
    if (isHiddenRoute) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Respond strictly to Ctrl + Space or Cmd + Space
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => !prev);
        return;
      }

      // Close on Escape
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isHiddenRoute]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: query },
    ]);

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, question: query }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || d.error,
          sources: data.sources,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: d.error },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isHiddenRoute || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-background/50 backdrop-blur-md transition-all duration-300 animate-in fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[10vh] md:pt-[15vh] px-4 pointer-events-none">

        {/* Modal Window */}
        <div
          className="w-full max-w-2xl bg-content border border-border/60 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.2)] overflow-hidden pointer-events-auto flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200"
          style={{ maxHeight: '70vh' }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">Spotlight AI</h2>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 cursor-pointer hover:text-primary rounded-md text-muted-foreground transition-colors transition-all focus:text-primary"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar-thin scrollbar-thumb-muted">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div className={`max-w-[85%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`py-3 px-4 rounded-2xl whitespace-pre-wrap text-[15px] leading-relaxed shadow-sm ${msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/50 border border-border/50 text-foreground rounded-tl-sm"
                      }`}
                  >
                    {msg.content}
                  </div>

                  {/* Sources tag if available */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.sources.map((source, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-background border border-border/60 text-muted-foreground">
                          <Search className="w-3 h-3" />
                          {source}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading / Typing Indicator */}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="py-3 px-4 rounded-2xl bg-muted/50 border border-border/50 text-muted-foreground rounded-tl-sm text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  {d.typing}
                </div>
              </div>
            )}

            <div ref={endOfMessagesRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border/40 bg-content backdrop-blur-sm">
            <form onSubmit={handleSend} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder={d.placeholder}
                className="w-full bg-background border border-border/60 rounded-xl pl-12 pr-16 py-4 
                  text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 
                  focus:border-primary/60 transition-all font-medium shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-1.5 cursor-pointer bg-primary/50 text-muted-foreground  hover:text-primary hover:bg-primary/30 rounded-lg transition-colors transition-background disabled:opacity-50"
                  title="Send"
                >
                  <SendHorizonal className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
