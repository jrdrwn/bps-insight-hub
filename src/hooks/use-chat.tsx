import { useCallback, useRef, useState } from "react";
import {
  type AiAnswer,
  answerFor,
  loadingStages,
  presetConversations,
} from "@/components/chat/mock-engine";

export type ChatMessage =
  { id: string; role: "user"; text: string } | { id: string; role: "assistant"; answer: AiAnswer };

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

/**
 * Custom hook to manage the BPS AI chat state.
 * Provides send, reset, and loadConversation functionality.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stage, setStage] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const sendMessage = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      if (!text || stage !== null) return;

      const userMsg: ChatMessage = { id: uid(), role: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setStage(0);

      const t1 = setTimeout(() => setStage(1), 650);
      const t2 = setTimeout(() => setStage(2), 1300);
      const t3 = setTimeout(() => {
        setStage(null);
        const answer = answerFor(text);
        const aiMsg: ChatMessage = {
          id: uid(),
          role: "assistant",
          answer,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 2000);

      timers.current = [t1, t2, t3];
    },
    [stage],
  );

  const resetChat = useCallback(() => {
    clearTimers();
    setStage(null);
    setMessages([]);
  }, [clearTimers]);

  const loadConversation = useCallback(
    (id: string) => {
      clearTimers();
      setStage(null);
      const preset = presetConversations[id];
      if (preset) {
        setMessages(preset);
      }
    },
    [clearTimers],
  );

  return {
    messages,
    stage,
    loadingStageText: stage !== null ? loadingStages[stage] : null,
    sendMessage,
    resetChat,
    loadConversation,
    isLoading: stage !== null,
  };
}
