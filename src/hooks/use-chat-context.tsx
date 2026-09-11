import { createContext, useContext } from "react";
import { useChat, type ChatMessage } from "@/hooks/use-chat";

export type ChatContextValue = ReturnType<typeof useChat>;

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return ctx;
}
