import { useCallback, useState } from "react";
import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { useChat } from "@/hooks/use-chat";
import { ChatContext } from "@/hooks/use-chat-context";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  const chat = useChat();
  const location = useLocation();
  const [activeConversation, setActiveConversation] = useState<string | undefined>();

  // Chat page renders its own header (ChatWorkspace), so skip the Topbar there
  // to avoid a duplicated header.
  const isChatPage = location.pathname.startsWith("/chat");

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
            {!isChatPage && <Topbar />}
            <main className="flex min-h-0 flex-1 flex-col">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ChatContext.Provider>
  );
}
