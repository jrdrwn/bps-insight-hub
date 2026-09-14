import { BpsWordmark } from "@/components/bps-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, Plus, Settings, User } from "lucide-react";

type HistoryItem = {
  id: string;
  title: string;
};

type HistoryGroup = {
  label: string;
  items: HistoryItem[];
};

const historyGroups: HistoryGroup[] = [
  {
    label: "Hari ini",
    items: [
      { id: "pertumbuhan-ekonomi", title: "Analisis pertumbuhan ekonomi" },
      { id: "data-kemiskinan", title: "Data kemiskinan Kalteng" },
      { id: "inflasi", title: "Pertanyaan tentang inflasi" },
    ],
  },
  {
    label: "Kemarin",
    items: [{ id: "metodologi-survei", title: "Metodologi survei" }],
  },
  {
    label: "Minggu ini",
    items: [{ id: "statistik-penduduk", title: "Ringkasan statistik penduduk" }],
  },
];

export function AppSidebar({
  onNewChat,
  onSelectConversation,
  activeConversationId,
}: {
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  activeConversationId?: string;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <BpsWordmark collapsed={collapsed} />
      </SidebarHeader>

      <SidebarContent>
        {/* New Chat Button */}
        <div className="px-3 pt-1">
          <button
            onClick={onNewChat}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl border border-dashed border-bps-blue/30 bg-bps-blue-soft/40 px-3 py-2.5 text-sm font-medium text-bps-blue transition-all hover:border-bps-blue/60 hover:bg-bps-blue-soft/70",
              collapsed && "justify-center px-0",
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Percakapan Baru</span>}
          </button>
        </div>

        {/* Chat History */}
        <div className="mt-4 px-3">
          {!collapsed && (
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Percakapan Terbaru
            </div>
          )}
        </div>

        {historyGroups.map((group) => (
          <SidebarGroup key={group.label} className="pt-0">
            {!collapsed && (
              <SidebarGroupLabel className="text-[11px] text-muted-foreground/70">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectConversation(item.id)}
                      isActive={activeConversationId === item.id}
                      tooltip={item.title}
                      className={cn(
                        "text-[13px]",
                        activeConversationId === item.id &&
                          "bg-bps-blue-soft/60 text-bps-blue-deep",
                      )}
                    >
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-xl border bg-surface-2 p-2 transition-all hover:bg-surface-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bps-blue text-xs font-semibold text-primary-foreground">
                PB
              </div>
              {!collapsed && (
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-[13px] font-medium">Pegawai BPS</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    BPS Kalimantan Tengah
                  </div>
                </div>
              )}
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Pegawai BPS</p>
                <p className="text-xs text-muted-foreground">BPS Kalimantan Tengah</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void navigate({ to: "/" })}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
