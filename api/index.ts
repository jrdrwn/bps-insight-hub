import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { chatRoutes } from "./routes/chat";
import { conversationRoutes } from "./routes/conversations";
import { datasetRoutes } from "./routes/datasets";

const app = new Hono();

// ── Middleware ──
app.use("*", logger());
app.use("*", cors());

// ── Health check ──
app.get("/health", (c) => c.json({ status: "ok", timestamp: Date.now() }));

// ── Routes ──
app.route("/chat", chatRoutes);
app.route("/datasets", datasetRoutes);
app.route("/conversations", conversationRoutes);

export default app;
