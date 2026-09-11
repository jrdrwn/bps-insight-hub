import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

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
        content: "Ubah pertanyaan statistik menjadi analisis, grafik, dan insight.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <ChatWorkspace />
    </div>
  );
}
