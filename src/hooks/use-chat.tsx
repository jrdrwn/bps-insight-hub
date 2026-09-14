import { api, parseSSEStream } from "@/lib/api";
import { useCallback, useRef, useState } from "react";

export type AiAnswer = {
  text: string;
  blocks: string[];
  insight?: string;
  sources: { kind: string; title: string; meta: string }[];
};

export type ChatMessage =
  | { id: string; role: "user"; text: string; attachment?: { name: string; type: string } }
  | { id: string; role: "assistant"; answer: AiAnswer };

export type ConversationItem = {
  id: string;
  title: string;
  createdAt: number;
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

/**
 * Custom hook to manage the BPS AI chat state.
 * Uses real AI API with streaming support.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stage, setStage] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  // Store messages per conversation (keyed by conversationId)
  const conversationsRef = useRef<Map<string, ChatMessage[]>>(new Map());

  // Auto-save messages when they change and we have a conversationId
  const activeConvId = useRef<string | undefined>();
  activeConvId.current = conversationId;
  if (conversationId && messages.length > 0) {
    conversationsRef.current.set(conversationId, messages);
  }

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || stage !== null) return;

      const userMsg: ChatMessage = { id: uid(), role: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setStage(0);

      try {
        // Build history AFTER adding user message
        const history = messages.map((m) => {
          if (m.role === "user") return { role: "user" as const, content: m.text };
          return { role: "assistant" as const, content: m.answer.text };
        });
        const apiMessages = [...history, { role: "user" as const, content: text }];

        const stream = await api.chat.stream(text, {
          conversationId,
          messages: apiMessages,
        });

        const reader = stream.getReader();
        let fullText = "";
        let convId = conversationId;
        let aiId: string | null = null;

        for await (const event of parseSSEStream(reader)) {
          if (event.type === "meta") {
            convId = event.conversationId;
          } else if (event.type === "token") {
            // Create AI placeholder on FIRST token (not before)
            if (!aiId) {
              aiId = uid();
              const aiMsg: ChatMessage = {
                id: aiId,
                role: "assistant",
                answer: { text: "", blocks: [], sources: [] },
              };
              setMessages((prev) => [...prev, aiMsg]);
              setStage(null); // Remove thinking block, streaming visible now
            }
            fullText += event.content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiId
                  ? { ...m, answer: { ...m.answer, text: fullText } }
                  : m,
              ),
            );
          }
        }

        setConversationId(convId);

        // Track conversation in history
        setConversationHistory((prev) => {
          const existing = prev.find((c) => c.id === convId);
          if (existing) return prev;
          const title = text.length > 40 ? text.slice(0, 40) + "…" : text;
          return [{ id: convId!, title, createdAt: Date.now() }, ...prev];
        });

        setStage(null);
      } catch (err) {
        console.error("Chat error:", err);
        const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan";
        if (aiId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    answer: {
                      text: `Maaf, terjadi kesalahan: ${errorMsg}\n\nSilakan coba lagi.`,
                      blocks: [],
                      sources: [],
                    },
                  }
                : m,
            ),
          );
        } else {
          // Error before first token — add error as AI message
          const errId = uid();
          setMessages((prev) => [
            ...prev,
            {
              id: errId,
              role: "assistant",
              answer: {
                text: `Maaf, terjadi kesalahan: ${errorMsg}\n\nSilakan coba lagi.`,
                blocks: [],
                sources: [],
              },
            },
          ]);
        }
        setStage(null);
      }
    },
    [stage, conversationId, messages],
  );

  /** Upload file/image then stream AI response */
  const sendFile = useCallback(
    async (file: File, message?: string) => {
      if (stage !== null) return;

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        text: message ?? `Mengunggah: ${file.name}`,
        attachment: { name: file.name, type: file.type },
      };
      setMessages((prev) => [...prev, userMsg]);
      setStage(0);

      try {
        const stream = await api.chat.upload(file, {
          message,
          conversationId,
        });

        const reader = stream.getReader();
        let fullText = "";
        let convId = conversationId;
        let aiId: string | null = null;

        for await (const event of parseSSEStream(reader)) {
          if (event.type === "meta") {
            convId = event.conversationId;
          } else if (event.type === "token") {
            if (!aiId) {
              aiId = uid();
              setMessages((prev) => [
                ...prev,
                { id: aiId!, role: "assistant", answer: { text: "", blocks: [], sources: [] } },
              ]);
              setStage(null);
            }
            fullText += event.content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiId
                  ? { ...m, answer: { ...m.answer, text: fullText } }
                  : m,
              ),
            );
          }
        }

        setConversationId(convId);
        setStage(null);
      } catch (err) {
        console.error("Upload error:", err);
        const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan";
        if (aiId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    answer: {
                      text: `Maaf, terjadi kesalahan saat memproses file: ${errorMsg}`,
                      blocks: [],
                      sources: [],
                    },
                  }
                : m,
            ),
          );
        } else {
          const errId = uid();
          setMessages((prev) => [
            ...prev,
            {
              id: errId,
              role: "assistant",
              answer: { text: `Maaf, terjadi kesalahan: ${errorMsg}`, blocks: [], sources: [] },
            },
          ]);
        }
        setStage(null);
      }
    },
    [stage, conversationId],
  );

  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    setStage(null);
    setMessages([]);
    setConversationId(undefined);
  }, []);

  const loadConversation = useCallback(
    (id: string) => {
      abortRef.current?.abort();
      setStage(null);
      const saved = conversationsRef.current.get(id);
      setMessages(saved ?? []);
      setConversationId(id);
    },
    [],
  );

  const renameConversation = useCallback((id: string, newTitle: string) => {
    setConversationHistory((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  }, []);

  return {
    messages,
    stage,
    loadingStageText: stage !== null
      ? ["Mengirim pesan...", "AI sedang berpikir...", "Menyusun jawaban..."][stage] ?? "Memproses..."
      : null,
    sendMessage,
    sendFile,
    resetChat,
    loadConversation,
    renameConversation,
    conversationHistory,
    isLoading: stage !== null,
  };
}
