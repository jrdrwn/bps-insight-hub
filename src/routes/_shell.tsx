import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { useChat } from "@/hooks/use-chat";
import { ChatContext } from "@/hooks/use-chat-context";
import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellInner() {
  const chat = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const [activeConversation, setActiveConversation] = useState<string | undefined>();

  const closeMobileSidebar = useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  const isChatPage = location.pathname.startsWith("/chat");

  const handleNewChat = useCallback(() => {
    chat.resetChat();
    setActiveConversation(undefined);
    closeMobileSidebar();
    void navigate({ to: "/chat" });
  }, [chat, navigate, closeMobileSidebar]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      chat.loadConversation(id);
      setActiveConversation(id);
      closeMobileSidebar();
      if (!location.pathname.startsWith("/chat")) {
        void navigate({ to: "/chat" });
      }
    },
    [chat, navigate, location.pathname, closeMobileSidebar],
  );

  return (
    <ChatContext.Provider value={chat}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onRenameConversation={chat.renameConversation}
          activeConversationId={activeConversation}
          conversations={chat.conversationHistory}
        />
        <SidebarInset className="min-w-0">
          {!isChatPage && <Topbar />}
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </ChatContext.Provider>
  );
}

function ShellLayout() {
  return (
    <SidebarProvider>
      <ShellInner />
    </SidebarProvider>
  );
}
