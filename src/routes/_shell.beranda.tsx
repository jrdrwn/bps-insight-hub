import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronRight,
  Database,
  FileText,
  LineChart,
  Mic,
  Paperclip,
  SendHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, SectionTitle, StatisticCard } from "@/components/common";
import { kpis, recentActivity } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/beranda")({
  head: () => ({
    meta: [
      { title: "Beranda — BPS AI Assistant" },
      {
        name: "description",
        content:
          "Ruang kerja harian pegawai BPS: aksi cepat AI, ringkasan statistik, dan aktivitas terbaru.",
      },
      { property: "og:title", content: "Beranda — BPS AI Assistant" },
      {
        property: "og:description",
        content: "Aksi cepat AI, ringkasan statistik, dan aktivitas terbaru.",
      },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  {
    title: "Analisis Data",
    desc: "Temukan pola dan insight dari dataset",
    icon: BarChart3,
    to: "/ask-data",
  },
  {
    title: "Ringkas Dokumen",
    desc: "Ringkas dokumen secara otomatis",
    icon: FileText,
    to: "/dokumen",
  },
  {
    title: "Cari Dataset",
    desc: "Temukan dataset BPS yang relevan",
    icon: Database,
    to: "/data",
  },
  {
    title: "Buat Visualisasi",
    desc: "Ubah data menjadi grafik",
    icon: LineChart,
    to: "/insight",
  },
] as const;

function Dashboard() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-8">
      <PageHeader
        title="Selamat siang, Pegawai BPS 👋"
        subtitle="Apa yang ingin Anda kerjakan hari ini?"
      />

      <div className="panel animate-fade-up p-3">
        <Textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void navigate({ to: "/chat" });
            }
          }}
          placeholder="Tanyakan data, dokumen, atau pekerjaan Anda..."
          className="min-h-[64px] resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between px-1 pb-1">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => toast("Demo: lampirkan berkas.")}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => toast("Demo: input suara belum aktif.")}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => void navigate({ to: "/chat" })}>
            Kirim <SendHorizontal className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>

      <section>
        <SectionTitle>Aksi Cepat</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link key={a.title} to={a.to} className="panel hover-lift group block p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-bps-blue-soft text-bps-blue">
                <a.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{a.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{a.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Ringkasan Statistik</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <StatisticCard key={k.label} {...k} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/riwayat">
                Lihat semua <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          Aktivitas Terbaru
        </SectionTitle>
        <div className="panel divide-y overflow-hidden">
          {recentActivity.map((r) => (
            <Link
              key={r.title}
              to="/chat"
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{r.title}</div>
                <div className="truncate text-xs text-muted-foreground">{r.meta}</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
