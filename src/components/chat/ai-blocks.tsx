import { useMemo, useState } from "react";
import katex from "katex";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Cell,
} from "recharts";
import { Download, ExternalLink, FileText, Image as ImageIcon, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──
type AiBlock =
  | { type: "text"; content: string }
  | { type: "chart"; chartType: string; data: ChartData }
  | { type: "image"; url: string; alt: string; caption?: string }
  | { type: "file"; name: string; fileType?: string; size?: string; url?: string; description?: string }
  | { type: "embed"; embedType: string; url: string; title?: string }
  | { type: "math"; formula: string; display: boolean }
  | { type: "partial"; typeLine: string; body: string };

type ChartData = {
  title?: string;
  subtitle?: string;
  labels?: string[];
  datasets?: { label: string; data: number[]; color?: string }[];
  data?: Record<string, any>[];
};

const CHART_COLORS = [
  "var(--bps-blue)",
  "var(--bps-orange)",
  "var(--bps-green)",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

const axisProps = {
  stroke: "var(--color-muted-foreground)",
  tickLine: false,
  axisLine: false,
  fontSize: 12,
};

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--color-border)",
    background: "var(--color-popover)",
    color: "var(--color-popover-foreground)",
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  labelStyle: { color: "var(--color-popover-foreground)" },
  itemStyle: { color: "var(--color-popover-foreground)" },
  cursor: { stroke: "var(--color-border)" },
};

// ── Parser ──
const KNOWN_BLOCK_TYPES = /^(chart:\w+|image|file|embed:\w+|math)$/;

function parseAiBlocks(text: string): AiBlock[] {
  const blocks: AiBlock[] = [];

  // Step 1: Split text into segments by ``` fences
  // Uses a regex that matches opening ``` (with optional type) but NOT closing ```
  // We manually track open/close pairs to handle streaming (incomplete blocks)
  const segments: { type: "complete" | "partial"; raw: string; typeLine?: string; body?: string }[] = [];
  let remaining = text;
  let safety = 0;

  while (remaining.length > 0 && safety < 500) {
    safety++;
    const openIdx = remaining.indexOf("```");
    if (openIdx === -1) {
      // No more code fences — rest is text
      if (remaining.trim()) segments.push({ type: "complete", raw: remaining });
      break;
    }

    // Text before the fence
    const before = remaining.slice(0, openIdx);
    if (before.trim()) segments.push({ type: "complete", raw: before });

    // Find matching close fence
    const afterOpen = remaining.slice(openIdx + 3);
    const firstNewline = afterOpen.indexOf("\n");
    const typeLine = (firstNewline === -1 ? afterOpen : afterOpen.slice(0, firstNewline)).trim();
    const bodyStart = firstNewline === -1 ? afterOpen.length : firstNewline + 1;
    const bodyCandidate = afterOpen.slice(bodyStart);
    const closeIdx = bodyCandidate.indexOf("```");

    if (closeIdx === -1) {
      // No closing fence — this is a partial block (streaming)
      segments.push({ type: "partial", raw: "```" + afterOpen, typeLine, body: bodyCandidate });
      break;
    }

    // Complete block
    const body = bodyCandidate.slice(0, closeIdx);
    segments.push({ type: "complete", raw: "```" + typeLine + "\n" + body + "```", typeLine, body });
    remaining = bodyCandidate.slice(closeIdx + 3);
    // Skip trailing newline after closing fence
    if (remaining.startsWith("\n")) remaining = remaining.slice(1);
  }

  // Step 2: Convert segments to AiBlocks
  for (const seg of segments) {
    if (seg.type === "partial") {
      // Show partial block as loading indicator
      if (seg.typeLine && KNOWN_BLOCK_TYPES.test(seg.typeLine)) {
        blocks.push({ type: "partial", typeLine: seg.typeLine, body: seg.body ?? "" });
      } else {
        blocks.push({ type: "text", content: seg.raw });
      }
      continue;
    }

    const { typeLine = "", body = "" } = seg;

    // chart:bar, chart:line, chart:area, chart:pie
    const chartMatch = typeLine.match(/^chart:(\w+)$/);
    if (chartMatch) {
      try {
        const data = JSON.parse(body) as ChartData;
        blocks.push({ type: "chart", chartType: chartMatch[1], data });
      } catch {
        blocks.push({ type: "text", content: seg.raw });
      }
      continue;
    }

    if (typeLine === "image") {
      try {
        const data = JSON.parse(body) as { url: string; alt?: string; caption?: string };
        blocks.push({ type: "image", url: data.url, alt: data.alt ?? "", caption: data.caption });
      } catch {
        const url = body.trim();
        if (url) blocks.push({ type: "image", url, alt: "" });
      }
      continue;
    }

    if (typeLine === "file") {
      try {
        const data = JSON.parse(body) as {
          name: string; type?: string; size?: string; url?: string; description?: string;
        };
        blocks.push({
          type: "file", name: data.name, fileType: data.type,
          size: data.size, url: data.url, description: data.description,
        });
      } catch {
        blocks.push({ type: "text", content: seg.raw });
      }
      continue;
    }

    const embedMatch = typeLine.match(/^embed:(\w+)$/);
    if (embedMatch) {
      try {
        const data = JSON.parse(body) as { url: string; title?: string };
        blocks.push({ type: "embed", embedType: embedMatch[1], url: data.url, title: data.title });
      } catch {
        blocks.push({ type: "text", content: seg.raw });
      }
      continue;
    }

    // math block: ```math\n...\n```
    if (typeLine === "math") {
      blocks.push({ type: "math", formula: body.trim(), display: true });
      continue;
    }

    // Unknown code block → render as code
    blocks.push({ type: "text", content: seg.raw });
  }

  // Step 3: Merge text blocks & scan for inline images + math
  const merged: AiBlock[] = [];
  for (const block of blocks) {
    if (block.type !== "text") { merged.push(block); continue; }

    // Split text by: inline images, display math ($$), inline math ($), and partial blocks
    const scanRegex = /(!\[.*?\]\(.*?\))|(\$\$[\s\S]*?\$\$)|(\$[^$\n]+\$)/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = scanRegex.exec(block.content)) !== null) {
      // Text before match
      const before = block.content.slice(lastIdx, match.index);
      if (before.trim()) merged.push({ type: "text", content: before });

      if (match[1]) {
        // Markdown image
        const imgMatch = match[1].match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) merged.push({ type: "image", url: imgMatch[2], alt: imgMatch[1] });
      } else if (match[2]) {
        // Display math: $$...$$
        const formula = match[2].slice(2, -2).trim();
        merged.push({ type: "math", formula, display: true });
      } else if (match[3]) {
        // Inline math: $...$
        const formula = match[3].slice(1, -1).trim();
        merged.push({ type: "math", formula, display: false });
      }
      lastIdx = match.index + match[0].length;
    }

    const rest = block.content.slice(lastIdx);
    if (rest.trim()) merged.push({ type: "text", content: rest });
  }

  // Step 4: Merge consecutive text blocks
  const final_: AiBlock[] = [];
  for (const block of merged) {
    if (block.type === "text" && final_.length > 0 && final_[final_.length - 1].type === "text") {
      (final_[final_.length - 1] as { content: string }).content += block.content;
    } else {
      final_.push(block);
    }
  }
  return final_;
}

// ── Chart Renderer ──
function ChartRenderer({ chartType, data }: { chartType: string; data: ChartData }) {
  const chartData = useMemo(() => {
    // Pie charts always need {name, value} format for Recharts
    if (chartType === "pie") {
      // 1. data array: find name-like key and value-like key
      if (data.data && data.data.length > 0) {
        const row = data.data[0];
        const nameKey = Object.keys(row).find((k) => /^(name|label|kategori|kategori|.nama|category|group)$/i.test(k)) ?? Object.keys(row)[0];
        const valueKey = Object.keys(row).find((k) => /^(value|jumlah|total|count|frekuensi|angka)$/i.test(k)) ?? Object.keys(row).find((k) => k !== nameKey) ?? Object.keys(row)[1];
        return data.data.map((obj) => ({
          name: String(obj[nameKey] ?? ""),
          value: Number(obj[valueKey]) || 0,
        }));
      }
      // 2. labels + datasets → single dataset = pie slices
      if (data.labels && data.datasets && data.datasets.length > 0) {
        return data.labels.map((label, i) => ({
          name: label,
          value: data.datasets![0].data[i] ?? 0,
        }));
      }
      return [];
    }
    // Non-pie charts: original logic
    if (data.data && data.data.length > 0) return data.data;
    if (data.labels && data.datasets) {
      return data.labels.map((label, i) => {
        const row: Record<string, unknown> = { name: label };
        for (const ds of data.datasets!) row[ds.label] = ds.data[i];
        return row;
      });
    }
    return [];
  }, [data, chartType]);

  const dataKeys = useMemo(() => {
    if (chartType === "pie") return ["value"];
    if (data.datasets) return data.datasets.map((ds) => ds.label);
    if (chartData.length > 0) return Object.keys(chartData[0]).filter((k) => k !== "name");
    return [];
  }, [data.datasets, chartData, chartType]);

  if (chartData.length === 0) {
    return <div className="panel p-5 text-sm text-muted-foreground">Data chart tidak tersedia</div>;
  }

  const chart = (() => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              {dataKeys.length > 1 && <Legend />}
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              {dataKeys.length > 1 && <Legend />}
              {dataKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS[i % CHART_COLORS.length] }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              {dataKeys.length > 1 && <Legend />}
              {dataKeys.map((key, i) => (
                <Area key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.15} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey={dataKeys[0] ?? "value"} nameKey="name">
                {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="panel p-5 text-sm text-muted-foreground">Tipe chart "{chartType}" belum didukung</div>;
    }
  })();

  return (
    <div className="panel animate-fade-up overflow-hidden p-5">
      {(data.title || data.subtitle) && (
        <div className="mb-4">
          {data.title && <h3 className="text-[15px] font-semibold">{data.title}</h3>}
          {data.subtitle && <p className="mt-0.5 text-[12px] text-muted-foreground">{data.subtitle}</p>}
        </div>
      )}
      {chart}
    </div>
  );
}

// ── Image Renderer ──
function ImageRenderer({ url, alt, caption }: { url: string; alt: string; caption?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="panel flex items-center gap-3 p-4 text-sm text-muted-foreground">
        <ImageIcon className="h-5 w-5 shrink-0" />
        <span>Gagal memuat gambar: {alt || url}</span>
      </div>
    );
  }

  return (
    <figure className="panel overflow-hidden p-0">
      <div className="relative bg-muted">
        {!loaded && (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-bps-blue border-t-transparent" />
          </div>
        )}
        <img
          src={url}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn("w-full rounded-t-lg object-cover transition-opacity", loaded ? "opacity-100" : "absolute opacity-0")}
          style={{ maxHeight: 400 }}
        />
      </div>
      {(alt || caption) && (
        <figcaption className="px-4 py-3 text-[12px] text-muted-foreground">{caption || alt}</figcaption>
      )}
    </figure>
  );
}

// ── File Renderer ──
function FileRenderer({ name, fileType, size, url, description }: {
  name: string; fileType?: string; size?: string; url?: string; description?: string;
}) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const iconColor: Record<string, string> = {
    pdf: "text-red-500 bg-red-50 dark:bg-red-950",
    xlsx: "text-green-600 bg-green-50 dark:bg-green-950",
    csv: "text-green-600 bg-green-50 dark:bg-green-950",
    docx: "text-blue-500 bg-blue-50 dark:bg-blue-950",
    pptx: "text-orange-500 bg-orange-50 dark:bg-orange-950",
    json: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
  };

  return (
    <div className="panel hover-lift flex items-start gap-3 p-4 transition-all">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", iconColor[ext] ?? "text-muted-foreground bg-muted")}>
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-foreground">{name}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted-foreground">
          {fileType && <span className="uppercase">{fileType}</span>}
          {fileType && size && <span>·</span>}
          {size && <span>{size}</span>}
        </div>
        {description && <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted" title="Download">
          <Download className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

// ── Embed Renderer ──
function EmbedRenderer({ embedType, url, title }: { embedType: string; url: string; title?: string }) {
  if (embedType === "youtube") {
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = ytMatch?.[1];
    if (videoId) {
      return (
        <div className="panel overflow-hidden p-0">
          <div className="relative aspect-video">
            <iframe src={`https://www.youtube.com/embed/${videoId}`} title={title ?? "YouTube video"} className="absolute inset-0 h-full w-full" allowFullScreen />
          </div>
          {title && <div className="px-4 py-3 text-[13px] font-medium">{title}</div>}
        </div>
      );
    }
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="panel hover-lift flex items-center gap-3 p-4 transition-all">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Play className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-foreground">{title ?? url}</div>
        <div className="truncate text-[12px] text-muted-foreground">{url}</div>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  );
}

// ── Table Renderer ──
function TableRenderer({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="panel overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b bg-muted/50">
              {headers.map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold text-foreground">{inlineMd(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b last:border-b-0">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-muted-foreground">{inlineMd(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Inline Markdown ──
function inlineMd(text: string): React.ReactNode {
  const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, i) => {
    // [text](url) → link
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-bps-blue underline underline-offset-2 hover:text-bps-blue/80">
          {linkMatch[1]}
        </a>
      );
    }
    // bare url
    const urlMatch = part.match(/^(https?:\/\/[^\s]+)$/);
    if (urlMatch) {
      return (
        <a key={i} href={urlMatch[1]} target="_blank" rel="noopener noreferrer" className="text-bps-blue underline underline-offset-2 hover:text-bps-blue/80">
          {urlMatch[1]}
        </a>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="rounded bg-muted px-1 py-0.5 text-[13px]">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

// ── Text Block Renderer (markdown) ──
function TextBlockRenderer({ content }: { content: string }) {
  const elements = useMemo(() => {
    const lines = content.split("\n");
    const result: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Markdown table
      if (line.includes("|") && i + 1 < lines.length && /^\|?[\s:-]+(\|[\s:-]+)+\|?\s*$/.test(lines[i + 1])) {
        const headers = line.split("|").map((s) => s.trim()).filter(Boolean);
        const rows: string[][] = [];
        i += 2; // skip header + separator
        while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
          rows.push(lines[i].split("|").map((s) => s.trim()).filter(Boolean));
          i++;
        }
        result.push(<TableRenderer key={`tbl-${result.length}`} headers={headers} rows={rows} />);
        continue;
      }

      // Horizontal rule
      if (/^[\s]*[-*_]{3,}\s*$/.test(line)) {
        result.push(<hr key={`hr-${result.length}`} className="my-3 border-t border-border" />);
        i++;
        continue;
      }

      // Empty
      if (line.trim() === "") { result.push(<div key={`br-${result.length}`} className="h-2" />); i++; continue; }

      // Headers
      if (line.startsWith("### ")) { result.push(<h4 key={`h-${result.length}`} className="mt-3 text-[15px] font-semibold">{inlineMd(line.slice(4))}</h4>); i++; continue; }
      if (line.startsWith("## ")) { result.push(<h3 key={`h-${result.length}`} className="mt-4 text-[16px] font-bold">{inlineMd(line.slice(3))}</h3>); i++; continue; }
      if (line.startsWith("# ")) { result.push(<h2 key={`h-${result.length}`} className="mt-4 text-[18px] font-bold">{inlineMd(line.slice(2))}</h2>); i++; continue; }

      // Bullet list
      if (/^[\s]*[-*]\s/.test(line)) {
        const items: React.ReactNode[] = [];
        while (i < lines.length && /^[\s]*[-*]\s/.test(lines[i])) {
          const content = lines[i].replace(/^[\s]*[-*]\s/, "");
          items.push(
            <div key={items.length} className="flex gap-2 pl-1">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-bps-blue" />
              <span>{inlineMd(content)}</span>
            </div>,
          );
          i++;
        }
        result.push(<div key={`ul-${result.length}`} className="space-y-1">{items}</div>);
        continue;
      }

      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        const items: React.ReactNode[] = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          const match = lines[i].match(/^(\d+)\.\s(.*)/);
          items.push(
            <div key={items.length} className="flex gap-2 pl-1">
              <span className="shrink-0 text-[13px] font-semibold text-bps-blue">{match?.[1]}.</span>
              <span>{inlineMd(match?.[2] ?? "")}</span>
            </div>,
          );
          i++;
        }
        result.push(<div key={`ol-${result.length}`} className="space-y-1">{items}</div>);
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        result.push(
          <blockquote key={`bq-${result.length}`} className="border-l-2 border-bps-blue/30 pl-3 text-muted-foreground italic">
            {inlineMd(line.slice(2))}
          </blockquote>,
        );
        i++;
        continue;
      }

      // Regular paragraph
      result.push(<p key={`p-${result.length}`}>{inlineMd(line)}</p>);
      i++;
    }
    return result;
  }, [content]);

  return <>{elements}</>;
}

// ── Math Renderer ──
function MathRenderer({ formula, display }: { formula: string; display: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `<code class="text-red-500">${formula}</code>`;
    }
  }, [formula, display]);

  if (display) {
    return (
      <div className="panel overflow-x-auto p-4 text-center">
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ── Partial Block (streaming indicator) ──
function PartialBlock({ typeLine }: { typeLine: string }) {
  const labels: Record<string, string> = {
    "chart:bar": "📊 Membuat chart bar…",
    "chart:line": "📈 Membuat chart line…",
    "chart:area": "📉 Membuat chart area…",
    "chart:pie": "🥧 Membuat pie chart…",
    image: "🖼️ Memuat gambar…",
    file: "📎 Menyiapkan file…",
    math: "🔢 Menyiapkan rumus…",
  };
  const label = labels[typeLine] ?? `Memuat ${typeLine}…`;
  return (
    <div className="panel flex items-center gap-2.5 border-dashed p-4 text-[13px] text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-bps-blue" />
      <span>{label}</span>
    </div>
  );
}

// ── Main Export: Render AI Blocks ──
export function AiBlockRenderer({ text }: { text: string }) {
  const blocks = useMemo(() => parseAiBlocks(text), [text]);

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "chart":
            return <ChartRenderer key={i} chartType={block.chartType} data={block.data} />;
          case "image":
            return <ImageRenderer key={i} url={block.url} alt={block.alt} caption={block.caption} />;
          case "file":
            return <FileRenderer key={i} name={block.name} fileType={block.fileType} size={block.size} url={block.url} description={block.description} />;
          case "embed":
            return <EmbedRenderer key={i} embedType={block.embedType} url={block.url} title={block.title} />;
          case "math":
            return <MathRenderer key={i} formula={block.formula} display={block.display} />;
          case "partial":
            return <PartialBlock key={i} typeLine={block.typeLine} />;
          case "text":
            return <TextBlockRenderer key={i} content={block.content} />;
          default:
            return null;
        }
      })}
    </div>
  );
}