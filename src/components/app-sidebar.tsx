import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bookmark,
  Database,
  FileText,
  History,
  Home,
  Lightbulb,
  MessageSquare,
  Settings,
  Sparkle,
} from "lucide-react";
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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { BpsWordmark } from "@/components/bps-logo";

const mainNav = [
  { title: "Beranda", url: "/beranda", icon: Home },
  { title: "AI Chat", url: "/chat", icon: MessageSquare },
  { title: "Data", url: "/data", icon: Database },
  { title: "Dokumen", url: "/dokumen", icon: FileText },
  { title: "Insight", url: "/insight", icon: Lightbulb },
  { title: "Alat AI", url: "/tools", icon: Sparkle },
] as const;

const libraryNav = [
  { title: "Riwayat", url: "/riwayat", icon: History },
  { title: "Saved", url: "/saved", icon: Bookmark },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link to="/beranda">
          <BpsWordmark collapsed={collapsed} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Pustaka</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraryNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/pengaturan")} tooltip="Pengaturan">
              <Link to="/pengaturan">
                <Settings />
                <span>Pengaturan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center gap-2.5 rounded-xl border bg-surface-2 p-2">
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
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
