import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Database, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DemoBadge, EmptyState, PageHeader } from "@/components/common";
import {
  datasetRegions,
  datasetTopics,
  datasetTypes,
  datasetYears,
  datasets,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/data/")({
  head: () => ({
    meta: [
      { title: "Dataset Explorer — BPS AI Assistant" },
      {
        name: "description",
        content:
          "Telusuri dan saring dataset statistik BPS berdasarkan topik, wilayah, tahun, dan tipe dataset.",
      },
      { property: "og:title", content: "Dataset Explorer — BPS AI Assistant" },
      { property: "og:description", content: "Find and explore statistical datasets." },
    ],
  }),
  component: DataExplorer,
});

function DataExplorer() {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState(datasetTopics[0]);
  const [region, setRegion] = useState(datasetRegions[0]);
  const [year, setYear] = useState(datasetYears[0]);
  const [type, setType] = useState(datasetTypes[0]);

  const results = useMemo(
    () =>
      datasets.filter((d) => {
        const matchQ = (d.title + d.description + d.code).toLowerCase().includes(q.toLowerCase());
        const matchTopic = topic === datasetTopics[0] || d.topic === topic;
        const matchRegion = region === datasetRegions[0] || d.region === region;
        const matchType = type === datasetTypes[0] || d.type === type;
        const matchYear = year === datasetYears[0] || d.period.includes(year.slice(2));
        return matchQ && matchTopic && matchRegion && matchType && matchYear;
      }),
    [q, topic, region, year, type],
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
      <PageHeader
        title="Dataset Explorer"
        subtitle="Find and explore statistical datasets."
        action={<DemoBadge full />}
      />

      <div className="panel space-y-4 p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search datasets..."
            className="h-11 rounded-[10px] pl-9"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Topik" value={topic} onChange={setTopic} options={datasetTopics} />
          <FilterSelect
            label="Wilayah"
            value={region}
            onChange={setRegion}
            options={datasetRegions}
          />
          <FilterSelect label="Tahun" value={year} onChange={setYear} options={datasetYears} />
          <FilterSelect label="Tipe" value={type} onChange={setType} options={datasetTypes} />
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Database}
          title="Belum ada dataset yang dipilih."
          description="Ubah kata kunci atau filter untuk menemukan dataset lain."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {results.map((d) => (
            <div key={d.id} className="panel hover-lift animate-fade-up flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-bps-blue">
                  {d.code}
                </span>
                <DemoBadge />
              </div>
              <h3 className="mt-2 text-[17px] font-semibold leading-snug">{d.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {d.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-md">
                  {d.period}
                </Badge>
                <Badge variant="secondary" className="rounded-md">
                  {d.region}
                </Badge>
                <Badge variant="secondary" className="rounded-md">
                  {d.variables} variabel
                </Badge>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link to="/data/$datasetId" params={{ datasetId: d.id }}>
                    Open Dataset
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/chat">Ask AI</Link>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link
                    to="/data/$datasetId"
                    params={{ datasetId: d.id }}
                    search={{ tab: "visualization" }}
                  >
                    Visualize
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 rounded-[10px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
