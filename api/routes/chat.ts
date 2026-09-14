import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// ── Env config ──
const AI_BASE = process.env.AI_API_BASE ?? "http://localhost:20128/v1";
const AI_MODEL = process.env.AI_API_MODEL ?? "default";
const AI_KEY = process.env.AI_API_KEY ?? "";

function aiHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (AI_KEY) h["Authorization"] = `Bearer ${AI_KEY}`;
  return h;
}

const chatRoutes = new Hono();

// ── Schemas ──
const textContentSchema = z.object({ type: z.literal("text"), text: z.string() });
const imageContentSchema = z.object({
  type: z.literal("image_url"),
  image_url: z.object({ url: z.string(), detail: z.string().optional() }).optional(),
});
const contentPartSchema = z.union([textContentSchema, imageContentSchema]);

const sendMessageSchema = z.object({
  message: z.string().min(1).optional(),
  conversationId: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.union([z.string(), z.array(contentPartSchema)]),
      }),
    )
    .optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().positive().optional(),
});

// ── POST /chat/send  (non-streaming) ──
chatRoutes.post(
  "/send",
  zValidator("json", sendMessageSchema),
  async (c) => {
    const body = c.req.valid("json");
    const conversationId = body.conversationId ?? crypto.randomUUID();

    // Build messages array: use provided history or create from single message
    const messages = buildMessages(body);

    const res = await fetch(`${AI_BASE}/chat/completions`, {
      method: "POST",
      headers: aiHeaders(),
      body: JSON.stringify({
        model: body.model ?? AI_MODEL,
        messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 4096,
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return c.json({ error: `AI API error: ${res.status}`, detail: err }, 502);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    const text = data.choices?.[0]?.message?.content ?? "";

    return c.json({
      id: crypto.randomUUID(),
      conversationId,
      text,
      usage: data.usage ?? null,
      createdAt: new Date().toISOString(),
    });
  },
);

// ── POST /chat/stream  (SSE streaming) ──
chatRoutes.post(
  "/stream",
  zValidator("json", sendMessageSchema),
  async (c) => {
    const body = c.req.valid("json");
    const conversationId = body.conversationId ?? crypto.randomUUID();
    const messages = buildMessages(body);

    const aiRes = await fetch(`${AI_BASE}/chat/completions`, {
      method: "POST",
      headers: aiHeaders(),
      body: JSON.stringify({
        model: body.model ?? AI_MODEL,
        messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 4096,
        stream: true,
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text();
      return c.json({ error: `AI API error: ${aiRes.status}`, detail: err }, 502);
    }

    // Stream SSE from AI → client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        const decoder = new TextDecoder();
        // Send conversation ID as first event
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ conversationId })}\n\n`),
        );
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  },
);

// ── POST /chat/upload  (file/image → text extraction + chat) ──
chatRoutes.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  const message = (formData.get("message") as string) ?? "";
  const conversationId = (formData.get("conversationId") as string) ?? crypto.randomUUID();
  const model = (formData.get("model") as string) ?? AI_MODEL;

  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  const isImage = file.type.startsWith("image/");
  const contentParts: Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }> = [];

  if (isImage) {
    // Convert image to base64 data URL for vision models
    const arrayBuf = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
    const dataUrl = `data:${file.type};base64,${base64}`;

    if (message) {
      contentParts.push({ type: "text", text: message });
    }
    contentParts.push({
      type: "image_url",
      image_url: { url: dataUrl, detail: "auto" },
    });
  } else {
    // Text-based file: read content as text
    const text = await file.text();
    const filePreview = text.length > 8000 ? text.slice(0, 8000) + "\n... (dipotong)" : text;
    const userMsg = message
      ? `${message}\n\n---\nIsi file "${file.name}":\n${filePreview}`
      : `Tolong analisis file "${file.name}" berikut:\n${filePreview}`;
    contentParts.push({ type: "text", text: userMsg });
  }

  const messages = [
    {
      role: "system" as const,
      content:
        "Anda adalah asisten AI BPS (Badan Pusat Statistik). Bantu pengguna menganalisis data, dokumen, atau pertanyaan terkait statistik Indonesia.",
    },
    { role: "user" as const, content: contentParts },
  ];

  const aiRes = await fetch(`${AI_BASE}/chat/completions`, {
    method: "POST",
    headers: aiHeaders(),
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    }),
  });

  if (!aiRes.ok) {
    const err = await aiRes.text();
    return c.json({ error: `AI API error: ${aiRes.status}`, detail: err }, 502);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = aiRes.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify({ conversationId })}\n\n`),
      );
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

// ── Helpers ──

const SYSTEM_PROMPT = `Anda adalah asisten AI BPS (Badan Pusat Statistik).
Bantu pengguna menganalisis data, menjawab pertanyaan statistik, dan memberikan insight dari data BPS Indonesia.
Gunakan bahasa Indonesia. Jawaban harus akurat berdasarkan data yang tersedia.

Anda DAPAT menggunakan format blok khusus untuk output kaya. Gunakan code fence dengan tipe yang sesuai:

### Chart (grafik interaktif)
\`\`\`chart:bar
{"title":"Judul Chart","subtitle":"Subtitle","labels":["Jan","Feb","Mar","Apr"],"datasets":[{"label":"Seri 1","data":[100,150,120,180]}]}
\`\`\`
Tipe: chart:bar, chart:line, chart:area, chart:pie
Format data: labels + datasets, ATAU array of objects: {"data":[{"name":"Jan","value":100}]}

### Gambar
\`\`\`image
{"url":"https://example.com/gambar.jpg","alt":"Deskripsi gambar","caption":"Caption opsional"}
\`\`\`
Atau markdown: ![alt](url)

### File/Dokumen
\`\`\`file
{"name":"Laporan.pdf","type":"pdf","size":"2.3 MB","url":"/path/to/file","description":"Deskripsi singkat"}
\`\`\`

### Embed Video
\`\`\`embed:youtube
{"url":"https://youtube.com/watch?v=IDVIDEO","title":"Judul Video"}
\`\`\`

### Tabel
Gunakan markdown table biasa:
| Kolom 1 | Kolom 2 |
|---------|---------|
| Data 1  | Data 2  |

### Rumus Matematika
Gunakan LaTeX:
- Inline: $rumus$ contoh: $\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i$
- Block (tengah): $$rumus$$ contoh: $$\\sigma = \\sqrt{\\frac{1}{N}\\sum_{i=1}^{N}(x_i - \\mu)^2}$$
- Persamaan, statistik, notasi matematik: gunakan LaTeX

### Tips:
- Selalu sertakan chart khi menampilkan data numerik (pertumbuhan, tren, perbandingan)
- Gunakan chart:line untuk tren waktu, chart:bar untuk perbandingan, chart:pie untuk proporsi
- Sertakan file/dokumen referensi khi ada
- Gunakan markdown **bold**, *italic*, heading, dan list untuk teks
- Jawaban harus informatif, terstruktur, dan mudah dipahami`;

function buildMessages(body: {
  message?: string;
  messages?: { role: "system" | "user" | "assistant"; content: string | Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }> }[];
}): { role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }> }[] {
  if (body.messages && body.messages.length > 0) {
    // Ensure system prompt is first
    const hasSystem = body.messages[0]?.role === "system";
    return hasSystem ? body.messages : [{ role: "system", content: SYSTEM_PROMPT }, ...body.messages];
  }
  // Single message mode
  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: body.message ?? "" },
  ];
}

export { chatRoutes };
