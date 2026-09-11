import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Copy,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  SendHorizontal,
  ThumbsDown,
  ThumbsUp,
  Mic,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BpsMark } from "@/components/bps-logo";
import { DemoBadge, SourceCard, StatisticCard, TrustNote } from "@/components/common";
import {
  ChartCard,
  GrowthLineChart,
  MoversBarChart,
  PovertyAreaChart,
} from "@/components/charts";
import { cn } from "@/lib/utils";
import { answerData, answerFor, loadingStages, suggestedQuestions } from "./mock-engine";
import type { AiAnswer } from "./mock-engine";

type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; answer: AiAnswer };

const seed: Msg[] = [
  {
    id: "u1",
    role: "user",
    text: "Bagaimana perkembangan pertumbuhan ekonomi Kalimantan Tengah selama 5 tahun terakhir?",
  },
  {
    id: "a1",
    role: "assistant",
    answer: answerFor("pertumbuhan ekonomi kalimantan tengah"),
  },
];

export function ChatWorkspace({
  title = "BPS Assistant",
  context = "BPS Statistical Data",
  initial = seed,
  emptyMessage = "Mulai percakapan dengan BPS Assistant.",
}: {
  title?: string;
  context?: string;
  initial?: Msg[];
  emptyMessage?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, stage]);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || stage !== null) return;
    setInput("");
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text }]);
    setStage(0);
    const t1 = setTimeout(() => setStage(1), 650);
    const t2 = setTimeout(() => setStage(2), 1300);
    const t3 = setTimeout(() => {
      setStage(null);
      setMessages((m) => [
        ...m,
        { id: `a${Date.now()}`, role: "assistant", answer: answerFor(text) },
      ]);
    }, 2000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-4 border-b bg-surface px-6 py-3.5">
        <div className="flex items-center gap-3">
          <BpsMark className="h-8 w-8" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-muted-foreground">Context: {context}</div>
          </div>
        </div>
        <Badge variant="secondary" className="rounded-md bg-bps-green-soft text-bps-green">
          Online · Demo
        </Badge>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          {messages.length === 0 && (
            <div className="py-12 text-center">
              <BpsMark className="mx-auto h-10 w-10" />
              <h3 className="mt-4 text-base font-semibold">{emptyMessage}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Pilih salah satu contoh pertanyaan di bawah untuk memulai.
              </p>
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="animate-fade-up max-w-[80%] rounded-2xl rounded-br-md bg-bps-blue px-4 py-2.5 text-sm text-primary-foreground">
                  {m.text}
                </div>
              </div>
            ) : (
              <AssistantMessage key={m.id} answer={m.answer} />
            ),
          )}

          {stage !== null && <ThinkingBlock stage={stage} />}

          <div className="flex flex-wrap gap-2 pt-2">
            {suggestedQuestions.slice(0, 4).map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="hover-lift rounded-lg border bg-surface px-3 py-1.5 text-xs text-muted-foreground"
              >
                {q}
              </button>
            ))}
          </div>
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t bg-surface px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-xl border bg-background p-2 focus-within:border-bps-blue">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask BPS Assistant..."
              className="min-h-[52px] resize-none border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toast("Demo: pemilihan lampiran akan muncul di sini.")}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toast("Demo: input suara belum aktif pada prototipe.")}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Button size="sm" onClick={() => send()} disabled={stage !== null}>
                Kirim
                <SendHorizontal className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            AI-generated responses should be verified against official BPS sources.
          </p>
        </div>
      </div>
    </div>
  );
}

function ThinkingBlock({ stage }: { stage: number }) {
  return (
    <div className="animate-fade-up flex gap-3">
      <BpsMark className="mt-0.5 h-8 w-8" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-bps-blue dot-pulse" />
          {loadingStages[stage]}
        </div>
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

function AssistantMessage({ answer }: { answer: AiAnswer }) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  return (
    <div className="animate-fade-up flex gap-3">
      <BpsMark className="mt-0.5 h-8 w-8" />
      <div className="min-w-0 flex-1 space-y-4">
        <p className="text-sm leading-relaxed">{answer.text}</p>

        {answer.blocks.includes("kpi") && (
          <div className="grid gap-3 sm:grid-cols-2">
            <StatisticCard
              label="Pertumbuhan Ekonomi"
              value="5,42%"
              delta="+0,62"
              tone="green"
            />
            <StatisticCard label="Rata-rata 5 Tahun" value="4,76%" delta="stabil" tone="blue" />
          </div>
        )}

        {answer.blocks.includes("line") && (
          <ChartCard title="Pertumbuhan Ekonomi 2020–2025" subtitle="Persen (y-on-y)">
            <GrowthLineChart data={answerData.growthSeries} />
          </ChartCard>
        )}

        {answer.blocks.includes("area") && (
          <ChartCard title="Tingkat Kemiskinan 2020–2025" subtitle="Persen penduduk miskin">
            <PovertyAreaChart data={answerData.povertySeries} />
          </ChartCard>
        )}

        {answer.blocks.includes("bar") && (
          <ChartCard title="Perubahan Terbesar per Wilayah" subtitle="Selisih poin 2020 → 2025">
            <MoversBarChart data={answerData.regionMovers} />
          </ChartCard>
        )}

        {answer.blocks.includes("table") && <MoversTable />}
        {answer.blocks.includes("dataset") && <InlineDatasetCard />}
        {answer.blocks.includes("summary") && <SummaryBlock />}

        {answer.insight && (
          <div className="rounded-xl border border-bps-blue/25 bg-bps-blue-soft/60 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-bps-blue">
              AI Insight
            </div>
            <p className="mt-1.5 text-sm leading-relaxed">{answer.insight}</p>
          </div>
        )}

        {answer.sources.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sumber & Referensi
            </div>
            {answer.sources.map((s) => (
              <SourceCard key={s.title} {...s} />
            ))}
            <TrustNote />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1 pt-1">
          <ActionBtn
            icon={copied ? Check : Copy}
            label={copied ? "Disalin" : "Copy"}
            onClick={() => {
              setCopied(true);
              toast("Demo: teks jawaban disalin.");
              setTimeout(() => setCopied(false), 1500);
            }}
          />
          <ActionBtn
            icon={ThumbsUp}
            label="Helpful"
            active={vote === "up"}
            onClick={() => setVote("up")}
          />
          <ActionBtn
            icon={ThumbsDown}
            label="Not Helpful"
            active={vote === "down"}
            onClick={() => setVote("down")}
          />
          <ActionBtn
            icon={RefreshCw}
            label="Regenerate"
            onClick={() => toast("Demo: jawaban akan dibuat ulang.")}
          />
          <ActionBtn
            icon={MoreHorizontal}
            label="More"
            onClick={() => toast("Demo: opsi tambahan.")}
          />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "bg-bps-blue-soft text-bps-blue",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function MoversTable() {
  const min = Math.min(...answerData.regionMovers.map((r) => r.delta));
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <span className="text-sm font-semibold">Perubahan Menurut Wilayah</span>
        <DemoBadge full />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Wilayah</TableHead>
              <TableHead className="text-right">2020</TableHead>
              <TableHead className="text-right">2025</TableHead>
              <TableHead className="text-right">Perubahan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {answerData.regionMovers.map((r) => (
              <TableRow key={r.region} className={cn(r.delta === min && "bg-bps-orange-soft/60")}>
                <TableCell className="font-medium">{r.region}</TableCell>
                <TableCell className="text-right tabular-nums">{r.y2020.toFixed(2)}</TableCell>
                <TableCell className="text-right tabular-nums">{r.y2025.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium tabular-nums text-bps-green">
                  {r.delta.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function InlineDatasetCard() {
  const d = answerData.povertyDataset;
  return (
    <div className="panel hover-lift p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-bps-blue">
        {d.code}
      </div>
      <h4 className="mt-1 text-base font-semibold">{d.title}</h4>
      <p className="mt-1.5 text-sm text-muted-foreground">{d.description}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
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
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" asChild>
          <Link to="/data/$datasetId" params={{ datasetId: d.id }}>
            Analyze
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/data/$datasetId" params={{ datasetId: d.id }}>
            Open Dataset
          </Link>
        </Button>
      </div>
    </div>
  );
}

function SummaryBlock() {
  return (
    <div className="panel space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">Ringkasan AI</h4>
        <DemoBadge full />
      </div>
      <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li>• Tingkat kemiskinan turun dari 5,26% (2020) menjadi 4,52% (2025).</li>
        <li>• Penurunan tercatat pada seluruh 14 kabupaten/kota yang diamati.</li>
        <li>• Kotawaringin Timur mencatat penurunan terbesar (-1,23 poin).</li>
        <li>• Pertumbuhan ekonomi pada periode yang sama mencapai 5,42% pada 2025.</li>
      </ul>
      <Button size="sm" variant="outline" asChild>
        <Link to="/brief">Generate Executive Brief</Link>
      </Button>
    </div>
  );
}
