import { useCallback, useState } from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useChat } from "@/hooks/use-chat";
import { ChatContext } from "@/hooks/use-chat-context";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  const chat = useChat();
  const [activeConversation, setActiveConversation] = useState<string | undefined>();

  const handleNewChat = useCallback(() => {
    chat.resetChat();
    setActiveConversation(undefined);
  }, [chat]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      chat.loadConversation(id);
      setActiveConversation(id);
    },
    [chat],
  );

  return (
    <ChatContext.Provider value={chat}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
            activeConversationId={activeConversation}
          />
          <SidebarInset className="min-w-0">
            <main className="min-h-0 flex-1">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ChatContext.Provider>
  );
}
