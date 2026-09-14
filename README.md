# BPS Insight Hub

AI-powered work assistant untuk pegawai Badan Pusat Statistik (BPS) Indonesia.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, TanStack Router, Tailwind CSS 4, shadcn/ui |
| Charts | Recharts (bar, line, area, pie) |
| Math | KaTeX (LaTeX rendering) |
| API Server | Hono (mounted sebagai Vite dev server middleware) |
| AI | OpenAI-compatible API (streaming SSE) |
| Build | Vite 8, TypeScript 5.8 |
| Deploy | Vercel |

## Fitur

- **Streaming Chat** — respons AI real-time via SSE, auto-scroll, scroll-to-bottom button
- **Rich Output** — chart interaktif, gambar, file cards, embed YouTube, tabel markdown, rumus LaTeX
- **Markdown Lengkap** — bold, italic, code, heading, blockquote, horizontal rule, hyperlink
- **Conversation History** — sidebar dengan rename inline, load percakapan lama
- **Mobile Responsive** — sidebar drawer, adaptive layout
- **Dark/Light Mode** — toggle tema
- **Command Palette** — Ctrl+K untuk cari dataset, dokumen, percakapan

## Getting Started

```bash
# Install dependencies
bun install

# Setup environment
cp .env.example .env
# Edit .env → set AI_API_BASE, AI_API_MODEL, AI_API_KEY

# Development
bun run dev
```

## Konfigurasi

Buat file `.env` di root project:

```env
AI_API_BASE=http://localhost:20128/v1
AI_API_MODEL=yo
AI_API_KEY=sk-your-api-key
```

| Variabel | Deskripsi |
|----------|-----------|
| `AI_API_BASE` | Base URL API AI (OpenAI-compatible) |
| `AI_API_MODEL` | Nama model yang digunakan |
| `AI_API_KEY` | API key untuk autentikasi |

## Project Structure

```
api/                      # Hono API server (Vite dev middleware)
  index.ts                # Hono app entry
  routes/
    chat.ts               # Chat endpoints + system prompt
    conversations.ts      # Conversation management
    datasets.ts           # Dataset queries
src/
  components/
    chat/
      ai-blocks.tsx       # Block parser + renderers (chart, image, file, embed, math, table, text)
      chat-workspace.tsx  # Main chat UI: composer, scroll handling, compact header
      mock-engine.tsx     # Fallback mock responses
    ui/                   # shadcn/ui component library
  hooks/
    use-chat.tsx          # Chat state management & SSE streaming logic
  lib/
    api.ts                # Frontend API client + parseSSEStream generator
  routes/                 # TanStack Router file-based routes
```

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/chat/send` | Non-streaming chat |
| POST | `/api/chat/stream` | SSE streaming chat |
| POST | `/api/chat/upload` | Upload file + chat (FormData) |

## AI Output Format

AI merespons dengan markdown + code fence blocks:

````markdown
Teks biasa dengan **bold** dan $rumus$ LaTeX.

```chart:bar
{"title":"Judul","labels":["A","B"],"datasets":[{"label":"Seri","data":[10,20]}]}
```

```chart:pie
{"data":[{"name":"A","value":60},{"name":"B","value":40}]}
```

$$\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^{N}(x_i - \mu)^2}$$

| Kolom 1 | Kolom 2 |
|---------|---------|
| Data 1  | Data 2  |

[https://bps.go.id](https://bps.go.id)
````

Supported block types: `chart:bar`, `chart:line`, `chart:area`, `chart:pie`, `image`, `file`, `embed:youtube`, `math` (display), `$...$` (inline), markdown tables, horizontal rules (`---`), links.
