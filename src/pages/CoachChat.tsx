import { useState, useRef, useEffect } from "react";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileNav from "@/components/MobileNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`;

const starterPrompts = [
  "I feel stuck but I can't explain why.",
  "Help me figure out what I really want.",
  "I keep repeating the same patterns.",
  "I have a big decision to make.",
];

const CoachChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const context = (location.state as { context?: string } | null)?.context || null;
  const { user } = useAuth();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useMouseGlow(containerRef);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send initial greeting based on context
  useEffect(() => {
    if (context && messages.length === 0 && user) {
      sendMessage("I just completed my clarity session. What do you see?", true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (text: string, isInitial = false) => {
    const userMsg: Msg = { role: "user", content: text };
    const newMessages = isInitial ? [userMsg] : [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ messages: newMessages, context }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        if (resp.status === 429) {
          toast({
            title: "Slow down",
            description: "Rate limited. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (resp.status === 402) {
          toast({
            title: "Credits needed",
            description: "AI credits exhausted. Please add funds to continue.",
            variant: "destructive",
          });
        } else {
          toast({ title: "Error", description: errData.error || "Something went wrong.", variant: "destructive" });
        }
        setIsLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      toast({
        title: "Connection error",
        description: "Failed to connect to Coach Kay. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading || cooldown) return;
    sendMessage(input.trim());
    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden grain-overlay flex flex-col">
      <SEOHead
        title="Talk to Coach Kay — Personalized Clarity Coaching"
        description="Chat with Coach Kay for personalized clarity insights. Get real coaching, challenge your thinking, and unlock deeper self-awareness."
        path="/coach"
        noIndex
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Coach Kay",
          provider: { "@type": "Person", name: "Coach Kay", jobTitle: "Master Certified Life Coach" },
          description: "Personalized clarity coaching conversations",
        }}
      />
      <div className="mouse-glow" />
      <FloatingOrbs />

      {/* Header */}
      <div className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back home"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="font-heading text-lg font-light">
          <span className="text-primary">Coach</span> Kay
        </div>
        <MobileNav />
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-primary/30 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-light mb-3">Talk to Coach Kay</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Share what's on your mind. I'm here to help you see clearly and move with purpose.
              </p>

              {/* Starter prompts */}
              {user && (
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="px-4 py-2.5 rounded-full border border-border/60 bg-card/30 backdrop-blur-sm text-sm text-foreground/80 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === "user"
                    ? "bg-primary/15 border border-primary/20 text-foreground"
                    : "bg-card/40 border border-border backdrop-blur-sm text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="coach-prose prose prose-sm prose-invert max-w-none [&_p]:text-foreground/90 [&_strong]:text-primary [&_li]:text-foreground/80 [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_blockquote]:border-primary/30 [&_blockquote]:text-foreground/70">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-card/40 border border-border backdrop-blur-sm rounded-lg px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/60 font-mono-label">Coach Kay is thinking</span>
                  <div className="flex gap-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input */}
      <div
        className="relative z-10 shrink-0 border-t border-border/30 bg-background/50 backdrop-blur-sm px-6 py-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-2xl mx-auto flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={user ? "Share what's on your mind..." : "Sign in to chat with Coach Kay"}
            disabled={!user}
            className="bg-card/30 border-border text-foreground placeholder:text-muted-foreground/70 min-h-[48px] max-h-[120px] resize-none focus:border-primary/40"
            rows={1}
            aria-label="Message input"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || cooldown || !user}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 shrink-0"
            size="icon"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
