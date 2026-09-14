import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// TODO: Replace with real DB (Prisma, Drizzle, etc.)
const conversations: Record<string, { id: string; title: string; messages: { role: string; text: string }[]; createdAt: string }> = {};

const conversationRoutes = new Hono();

// ── List conversations ──
conversationRoutes.get("/", (c) => {
  const list = Object.values(conversations).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return c.json({ data: list });
});

// ── Get conversation by ID ──
conversationRoutes.get("/:id", (c) => {
  const conv = conversations[c.req.param("id")];
  if (!conv) return c.json({ error: "Conversation not found" }, 404);
  return c.json({ data: conv });
});

// ── Create conversation ──
const createSchema = z.object({ title: z.string().min(1) });

conversationRoutes.post(
  "/",
  zValidator("json", createSchema),
  async (c) => {
    const { title } = c.req.valid("json");
    const id = crypto.randomUUID();
    const conv = { id, title, messages: [], createdAt: new Date().toISOString() };
    conversations[id] = conv;
    return c.json({ data: conv }, 201);
  },
);

// ── Add message to conversation ──
const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().min(1),
});

conversationRoutes.post(
  "/:id/messages",
  zValidator("json", messageSchema),
  async (c) => {
    const conv = conversations[c.req.param("id")];
    if (!conv) return c.json({ error: "Conversation not found" }, 404);
    const msg = c.req.valid("json");
    conv.messages.push(msg);
    return c.json({ data: conv });
  },
);

// ── Delete conversation ──
conversationRoutes.delete("/:id", (c) => {
  const id = c.req.param("id");
  if (!conversations[id]) return c.json({ error: "Conversation not found" }, 404);
  delete conversations[id];
  return c.json({ success: true });
});

export { conversationRoutes };
