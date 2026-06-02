import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { callAIAgent } from "@/lib/ai-agent.server";
import { ChatMessage } from "./ChatMessage";
import type { LocalMessage } from "./ChatMessage";

// ─── Suggestion prompts shown on first load ───────────────────────────────────

const SUGGESTIONS = [
  "Quais equipamentos temos disponíveis?",
  "Adicionar 2 caixas de som JBL no depósito",
  "Resumo do inventário",
  "Listar equipamentos em manutenção",
];

// ─── Welcome message ──────────────────────────────────────────────────────────

const WELCOME: LocalMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Olá! Sou seu assistente de inventário.\n\nDescreva o equipamento que quer adicionar, pergunte sobre o estoque, ou peça para gerenciar itens — tudo em linguagem natural, sem formulários.",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AIChat() {
  const [messages, setMessages] = useState<LocalMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build history for the AI (exclude loading/welcome messages)
  const buildHistory = useCallback(() => {
    return messages
      .filter((m) => m.id !== "welcome" && !m.loading)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setInput("");

      const userMsg: LocalMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const loadingMsg: LocalMessage = {
        id: "loading",
        role: "assistant",
        content: "",
        loading: true,
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setLoading(true);

      try {
        const result = await callAIAgent({
          data: { history: buildHistory(), message: trimmed },
        });

        const aiMsg: LocalMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: result.message,
          action: result.action,
        };

        setMessages((prev) => [...prev.filter((m) => m.id !== "loading"), aiMsg]);

        // Invalidate queries so the equipment list refreshes automatically
        if (result.action && ["added", "updated", "removed"].includes(result.action.type)) {
          queryClient.invalidateQueries({ queryKey: ["equipments"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        }
      } catch {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== "loading"),
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "⚠️ Erro ao processar. Verifique sua conexão e tente novamente.",
          },
        ]);
      } finally {
        setLoading(false);
        // Refocus input after response
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [loading, buildHistory, queryClient]
  );

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function handleSuggestion(s: string) {
    send(s);
  }

  function clearChat() {
    setMessages([WELCOME]);
  }

  const isFirstMessage = messages.length === 1;

  return (
    <div className="flex flex-col h-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/90 backdrop-blur-sm shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-none">Assistente de Inventário</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">IA · Linguagem natural</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Online
          </div>
          {!isFirstMessage && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={clearChat}
              title="Limpar conversa"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* ── Suggestion chips (first load only) ── */}
      {isFirstMessage && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 shrink-0">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="p-3 border-t border-border bg-card/60 shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ex: adicionar 3 microfones Shure SM58 no estúdio..."
            className="min-h-[44px] max-h-[120px] resize-none text-sm py-2.5 leading-snug"
            disabled={loading}
            rows={1}
          />
          <Button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-[44px] w-[44px] shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground text-center select-none">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
