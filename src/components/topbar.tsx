import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { conversations, datasets, documents } from "@/lib/mock-data";
import { useNavigate } from "@tanstack/react-router";
import { Moon, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const insights = [
  { id: "trend-penduduk", title: "Pertumbuhan penduduk meningkat" },
  { id: "anomali", title: "3 pola tidak biasa terdeteksi" },
  { id: "movers", title: "Sektor A mencatat perubahan terbesar" },
];

export function Topbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    void navigate({ to });
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-surface/85 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-semibold">BPS AI Assistant</p>
        <p className="truncate text-[11px] text-muted-foreground">AI Work Assistant</p>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 min-w-0 flex-1 max-w-md items-center gap-2 rounded-[10px] border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-bps-blue/40"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Cari dataset, dokumen, percakapan...</span>
        <kbd className="ml-auto hidden rounded border px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto h-9 w-9 shrink-0"
        onClick={toggleTheme}
        title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
        aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-bps-blue" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Cari: kemiskinan Kalimantan Tengah..." />
        <CommandList>
          <CommandEmpty>Tidak ada hasil. Coba kata kunci lain.</CommandEmpty>
          <CommandGroup heading="DATASETS">
            {datasets.map((d) => (
              <CommandItem key={d.id} value={d.title} onSelect={() => go(`/data/${d.id}`)}>
                {d.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="DOCUMENTS">
            {documents.map((d) => (
              <CommandItem key={d.id} value={d.name} onSelect={() => go(`/dokumen/${d.id}`)}>
                {d.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="CONVERSATIONS">
            {conversations.map((c) => (
              <CommandItem key={c.id} value={c.title} onSelect={() => go("/chat")}>
                {c.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="INSIGHTS">
            {insights.map((i) => (
              <CommandItem key={i.id} value={i.title} onSelect={() => go("/insight")}>
                {i.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
