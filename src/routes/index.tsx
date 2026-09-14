import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BpsMark } from "@/components/bps-logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Masuk — BPS AI Assistant" },
      {
        name: "description",
        content:
          "Masuk ke BPS AI Assistant, ruang kerja AI untuk pegawai BPS: cari dataset, analisis data, dan susun insight statistik.",
      },
      { property: "og:title", content: "Masuk — BPS AI Assistant" },
      {
        property: "og:description",
        content: "AI-powered workspace for statistical professionals.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => void navigate({ to: "/chat" }), 700);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between bg-bps-blue-deep p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(var(--bps-blue) 1px, transparent 1px), linear-gradient(90deg, var(--bps-blue) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <BpsMark className="h-10 w-10" />
          <span className="text-sm font-semibold text-primary-foreground">BPS AI Assistant</span>
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-balance-tight text-4xl font-semibold leading-tight tracking-tight text-primary-foreground">
            BPS AI Assistant
          </h1>
          <p className="mt-4 text-base leading-relaxed text-primary-foreground/70">
            AI-powered workspace for statistical professionals.
          </p>
          <div className="mt-10 grid gap-3 text-sm text-primary-foreground/70">
            {[
              "Cari dan telaah dataset statistik dalam satu tempat",
              "Ubah pertanyaan menjadi analisis dan visualisasi",
              "Susun executive brief dengan sumber yang tercatat",
            ].map((t) => (
              <div key={t} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-bps-orange" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-primary-foreground/50">
          <ShieldCheck className="h-4 w-4" />
          Prototipe UI — data dan respons AI disimulasikan.
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BpsMark className="h-9 w-9" />
            <span className="text-sm font-semibold">BPS AI Assistant</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Masuk ke BPS AI Assistant</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Gunakan email dinas atau NIP pegawai Anda.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email / Employee ID</Label>
              <Input
                id="email"
                placeholder="pegawai@bps.go.id"
                defaultValue="pegawai@bps.go.id"
                className="h-11 rounded-[10px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                defaultValue="demo-prototype"
                className="h-11 rounded-[10px]"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox defaultChecked /> Ingat saya
              </label>
              <span className="text-sm text-bps-blue">Lupa password?</span>
            </div>
            <Button type="submit" className="h-11 w-full rounded-[10px]" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk"}
              {!loading && <ArrowRight className="ml-1.5 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Prototipe frontend — tidak ada autentikasi nyata.
          </p>
        </div>
      </div>
    </div>
  );
}
