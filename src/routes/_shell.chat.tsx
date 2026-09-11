import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { useChatContext } from "@/hooks/use-chat-context";

export const Route = createFileRoute("/_shell/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — BPS AI Assistant" },
      {
        name: "description",
        content:
          "Ruang percakapan AI untuk pertanyaan statistik: KPI, visualisasi, insight, dan sumber referensi BPS.",
      },
      { property: "og:title", content: "AI Chat — BPS AI Assistant" },
      {
        property: "og:description",
        content:
          "AI Work Assistant untuk pegawai BPS — cari data, pahami statistik, dan bantu pekerjaan.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const chat = useChatContext();

  return (
    <div className="h-screen">
      <ChatWorkspace
        messages={chat.messages}
        stage={chat.stage}
        loadingStageText={chat.loadingStageText}
        onSend={chat.sendMessage}
      />
    </div>
  );
}
