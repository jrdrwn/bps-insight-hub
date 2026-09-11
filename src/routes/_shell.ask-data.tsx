import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, FileSpreadsheet, Lightbulb, Table2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoBadge, ErrorState, PageHeader } from "@/components/common";
import { ChartCard, GrowthLineChart } from "@/components/charts";
import { growthSeries, pdrbTable } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_shell/ask-data")({
  head: () => ({
    meta: [
      { title: "Ask Your Data — BPS AI Assistant" },
      {
        name: "description",
        content:
          "Simulasi unggah dataset CSV atau XLSX lalu ajukan pertanyaan dengan bahasa alami untuk mendapat analisis instan.",
      },
      { property: "og:title", content: "Ask Your Data — BPS AI Assistant" },
      {
        property: "og:description",
        content: "Upload CSV or XLSX and ask questions using natural language.",
      },
    ],
  }),
  component: AskYourData,
});

function AskYourData() {
  const [state, setState] = useState<"empty" | "loading" | "ready">("empty");
  const [q, setQ] = useState("");
  const [answered, setAnswered] = useState(false);
  const [view, setView] = useState<"none" | "table" | "chart" | "insight">("none");

  const upload = () => {
    setState("loading");
    setTimeout(() => setState("ready"), 1200);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-8">
      <PageHeader
        title="Ask Your Data"
        subtitle="Unggah dataset Anda dan ajukan pertanyaan dengan bahasa alami."
      />

      {state === "empty" && (
        <div className="panel flex flex-col items-center justify-center border-dashed px-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bps-blue-soft text-bps-blue">
            <Upload className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-semibold">Upload your dataset</h2>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            Upload CSV or XLSX and ask questions using natural language.
          </p>
          <Button className="mt-6" onClick={upload}>
            + Upload Dataset
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Prototipe — berkas tidak benar-benar diunggah atau diproses.
          </p>
        </div>
      )}

      {state === "loading" && (
        <div className="panel space-y-3 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-bps-blue dot-pulse" /> Menganalisis
            dataset...
          </div>
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      )}

      {state === "ready" && (
        <div className="space-y-6">
          <div className="panel animate-fade-up p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-bps-green-soft text-bps-green">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">PDRB_Kalimantan_Tengah.xlsx</div>
                  <div className="flex items-center gap-1.5 text-xs text-bps-green">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Dataset berhasil dianalisis
                  </div>
                </div>
              </div>
              <DemoBadge full />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[
                ["Baris", "12.450"],
                ["Kolom", "18"],
                ["Periode", "2020–2025"],
                ["Wilayah", "14"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border bg-surface-2 p-4">
                  <div className="text-xs text-muted-foreground">{k}</div>
                  <div className="mt-1 text-lg font-semibold">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-base font-semibold">Ask your data</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Contoh: Kabupaten mana yang memiliki pertumbuhan tertinggi?"
                className="h-11 min-w-[240px] flex-1 rounded-[10px]"
              />
              <Button className="h-11" onClick={() => setAnswered(true)}>
                Tanya
              </Button>
            </div>

            {answered && (
              <div className="animate-fade-up mt-5 space-y-4">
                <div className="rounded-xl border border-bps-blue/25 bg-bps-blue-soft/60 p-4 text-sm leading-relaxed">
                  Kotawaringin Timur mencatat nilai tertinggi pada 2025 sebesar 29,02 dengan
                  pertumbuhan 5,9% dibanding tahun sebelumnya. Palangka Raya menyusul dengan
                  pertumbuhan 6,1% dari basis yang lebih kecil.
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setView("table")}>
                    <Table2 className="mr-1.5 h-4 w-4" /> View Table
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setView("chart")}>
                    <BarChart3 className="mr-1.5 h-4 w-4" /> View Chart
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setView("insight")}>
                    <Lightbulb className="mr-1.5 h-4 w-4" /> Generate Insight
                  </Button>
                </div>
              </div>
            )}
          </div>

          {view === "table" && (
            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b px-5 py-3.5">
                <span className="text-sm font-semibold">Cuplikan Tabel</span>
                <DemoBadge full />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wilayah</TableHead>
                      <TableHead className="text-right">2023</TableHead>
                      <TableHead className="text-right">2024</TableHead>
                      <TableHead className="text-right">2025</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pdrbTable.map((r) => (
                      <TableRow key={r.kode}>
                        <TableCell className="font-medium">{r.wilayah}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.y2023}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.y2024}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.y2025}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {view === "chart" && (
            <ChartCard title="Pertumbuhan 2020–2025" subtitle="Persen (y-on-y)">
              <GrowthLineChart data={growthSeries} />
            </ChartCard>
          )}

          {view === "insight" && (
            <div className="panel space-y-2 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">AI Insight</h3>
                <DemoBadge full />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Pertumbuhan terkonsentrasi pada wilayah dengan basis ekonomi besar. Selisih antar
                wilayah menyempit sejak 2023, mengindikasikan penyebaran pertumbuhan yang lebih
                merata pada periode terakhir.
              </p>
            </div>
          )}

          <ErrorState onRetry={() => toast("Demo: proses analisis diulang.")} />
        </div>
      )}
    </div>
  );
}
