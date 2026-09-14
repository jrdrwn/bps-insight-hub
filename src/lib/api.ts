const BASE = "/api";

// ── Chat message types for the API ──
export type ApiContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: string } };

export type ApiMessage = {
  role: "system" | "user" | "assistant";
  content: string | ApiContentPart[];
};

export type ChatSendResult = {
  id: string;
  conversationId: string;
  text: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null;
  createdAt: string;
};

// ── Non-streaming request ──
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `API ${res.status}`);
  }
  return res.json();
}

// ── Streaming request (returns ReadableStream of SSE lines) ──
async function streamRequest(
  path: string,
  body: Record<string, unknown>,
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `API ${res.status}`);
  }
  if (!res.body) throw new Error("No response body");
  return res.body;
}

// ── API Client ──
export const api = {
  chat: {
    /** Non-streaming: send message, get full response */
    send: (
      message: string,
      opts?: { conversationId?: string; messages?: ApiMessage[]; model?: string },
    ) =>
      request<ChatSendResult>("/chat/send", {
        method: "POST",
        body: JSON.stringify({ message, ...opts }),
      }),

    /** Streaming: returns SSE stream. Parse with `parseSSEStream`. */
    stream: (
      message: string,
      opts?: { conversationId?: string; messages?: ApiMessage[]; model?: string },
    ) =>
      streamRequest("/chat/stream", { message, ...opts }),

    /** Upload file/image + optional message → streaming response */
    upload: async (
      file: File,
      opts?: { message?: string; conversationId?: string; model?: string },
    ) => {
      const form = new FormData();
      form.append("file", file);
      if (opts?.message) form.append("message", opts.message);
      if (opts?.conversationId) form.append("conversationId", opts.conversationId);
      if (opts?.model) form.append("model", opts.model);

      const res = await fetch(`${BASE}/chat/upload`, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `API ${res.status}`);
      }
      if (!res.body) throw new Error("No response body");
      return res.body;
    },
  },

  // ── Datasets ──
  datasets: {
    list: (q?: string) =>
      request<{ data: unknown[]; total: number }>(`/datasets${q ? `?q=${encodeURIComponent(q)}` : ""}`),
    get: (id: string) =>
      request<{ data: unknown }>(`/datasets/${id}`),
  },

  // ── Conversations ──
  conversations: {
    list: () => request<{ data: unknown[] }>("/conversations"),
    get: (id: string) => request<{ data: unknown }>(`/conversations/${id}`),
    create: (title: string) =>
      request<{ data: unknown }>("/conversations", {
        method: "POST",
        body: JSON.stringify({ title }),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/conversations/${id}`, { method: "DELETE" }),
  },
};

// ── SSE Stream Parser ──
// Usage: const stream = await api.chat.stream("hello");
//        const reader = stream.getReader();
//        // parseSSEStream(reader) yields { data: string } chunks
export async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
) {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          // If it's a chunk with conversationId (first event)
          if (parsed.conversationId) {
            yield { type: "meta" as const, conversationId: parsed.conversationId };
          }
          // OpenAI-style chunk
          else if (parsed.choices) {
            const delta = parsed.choices[0]?.delta;
            if (delta?.content) {
              yield { type: "token" as const, content: delta.content };
            }
          }
          // Plain text token
          else if (typeof parsed === "string") {
            yield { type: "token" as const, content: parsed };
          }
        } catch {
          // Not JSON, treat as plain text token
          yield { type: "token" as const, content: data };
        }
      }
    }
  }
}
