import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DemoBadge, PageHeader, SourceCard, StatisticCard, TrustNote } from "@/components/common";
import {
  ChartCard,
  GrowthLineChart,
  MoversBarChart,
  SectorDonutChart,
} from "@/components/charts";
import { datasets, growthSeries, pdrbTable, regionMovers, sectorShare } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/data/$datasetId")({
  loader: ({ params }) => {
    const dataset = datasets.find((d) => d.id === params.datasetId);
    if (!dataset) throw notFound();
    return { dataset };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Dataset tidak tersedia" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = `${loaderData.dataset.title} — BPS AI Assistant`;
    return {
      meta: [
        { title: t },
        { name: "description", content: loaderData.dataset.description },
        { property: "og:title", content: t },
        { property: "og:description", content: loaderData.dataset.description },
      ],
    };
  },
  component: DatasetDetail,
});

function DatasetDetail() {
  const { dataset } = Route.useLoaderData();

  const meta = [
    { label: "Periode", value: dataset.period },
    { label: "Wilayah", value: dataset.region },
    { label: "Variabel", value: String(dataset.variables) },
    { label: "Baris", value: dataset.rows },
    { label: "Diperbarui", value: dataset.updated },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/data">Data</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[340px] truncate">{dataset.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={dataset.title}
        subtitle={dataset.description}
        action={
          <Button asChild>
            <Link to="/chat">
              <MessageSquare className="mr-1.5 h-4 w-4" /> Ask AI About This Dataset
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {meta.map((m) => (
          <div key={m.label} className="panel p-4">
            <div className="text-xs text-muted-foreground">{m.label}</div>
            <div className="mt-1.5 text-sm font-semibold">{m.value}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="ai">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatisticCard label="Nilai Terkini" value="5,42%" delta="+0,62" tone="green" />
            <StatisticCard label="Rata-rata Periode" value="4,76%" delta="stabil" tone="blue" />
            <StatisticCard label="Nilai Tertinggi" value="6,10%" delta="2022" tone="orange" />
            <StatisticCard label="Nilai Terendah" value="-1,40%" delta="2020" tone="orange" />
          </div>
          <div className="panel p-5">
            <h3 className="text-base font-semibold">Tentang dataset ini</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {dataset.description} Dataset disusun untuk keperluan prototipe dan berisi angka
              simulasi. Struktur tabel, metadata, dan variabel mengikuti pola penyajian data BPS.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
              <span className="text-sm font-semibold">Tabel Data</span>
              <DemoBadge full />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Wilayah</TableHead>
                    <TableHead className="text-right">2023</TableHead>
                    <TableHead className="text-right">2024</TableHead>
                    <TableHead className="text-right">2025</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pdrbTable.map((r) => (
                    <TableRow key={r.kode}>
                      <TableCell className="text-muted-foreground">{r.kode}</TableCell>
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
        </TabsContent>

        <TabsContent value="visualization" className="mt-6 space-y-6">
          <ChartCard title="Tren 2020–2025" subtitle="Persen (y-on-y)">
            <GrowthLineChart data={growthSeries} />
          </ChartCard>
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Perubahan per Wilayah" subtitle="Selisih poin 2020 → 2025">
              <MoversBarChart data={regionMovers} />
            </ChartCard>
            <ChartCard title="Distribusi Lapangan Usaha" subtitle="Kontribusi (%)">
              <SectorDonutChart data={sectorShare} />
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-6 space-y-4">
          <div className="panel p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-bps-blue">
              AI Analysis
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              Nilai indikator bergerak naik secara konsisten sejak 2021 setelah kontraksi pada
              2020. Perubahan terbesar tercatat pada 2022, sedangkan tiga tahun terakhir
              memperlihatkan pola yang lebih stabil dengan rentang perubahan yang menyempit.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Tren jangka menengah: naik moderat.</li>
              <li>• Volatilitas: menurun sejak 2023.</li>
              <li>• Wilayah dengan pergerakan terbesar: Kotawaringin Timur.</li>
            </ul>
          </div>
          <SourceCard
            kind="Official Dataset"
            title="BPS Provinsi Kalimantan Tengah"
            meta={`${dataset.code} · Statistical Table`}
          />
          <TrustNote />
        </TabsContent>
      </Tabs>
    </div>
  );
}
