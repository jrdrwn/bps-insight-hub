import { useMemo, useSyncExternalStore, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileText, LoaderCircle, Search, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common";
import { ragDocumentStore } from "@/lib/rag-document-store";

export const Route = createFileRoute("/_shell/rag-documents/collection")({
  component: RagDocumentCollection,
});

export function RagDocumentCollection() {
  const documents = useSyncExternalStore(
    ragDocumentStore.subscribe,
    ragDocumentStore.getSnapshot,
    ragDocumentStore.getSnapshot,
  );
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      documents.filter((document) =>
        `${document.name} ${document.category}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [documents, search],
  );
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 overflow-y-auto px-6 py-8">
      <PageHeader
        title="Koleksi Dokumen"
        subtitle="Kelola dokumen yang digunakan sebagai konteks jawaban AI."
        action={
          <Button asChild>
            <Link to="/rag-documents">
              <UploadCloud className="mr-2 h-4 w-4" />
              Unggah dokumen
            </Link>
          </Button>
        }
      />
      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Semua dokumen</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {documents.length} dokumen tersimpan di basis pengetahuan.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari dokumen..."
              className="h-9 pl-9"
            />
          </div>
        </div>
        <div className="divide-y">
          {filtered.length ? (
            filtered.map((document) => (
              <div
                key={document.id}
                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bps-blue-soft text-bps-blue">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{document.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {document.size} · {document.pages} halaman · Diunggah {document.uploadedAt}
                  </p>
                  {document.status !== "Siap digunakan" && (
                    <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-bps-blue transition-all"
                        style={{ width: `${document.progress ?? 0}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <Badge variant="secondary" className="rounded-md">
                    {document.category}
                  </Badge>
                  {document.status === "Siap digunakan" ? (
                    <span className="flex items-center gap-1 text-xs text-bps-green">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Siap digunakan
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-bps-blue">
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      {document.status} {document.progress}%
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground"
                  aria-label={`Hapus ${document.name}`}
                  onClick={() => {
                    ragDocumentStore.remove(document.id);
                    toast.success("Dokumen dihapus dari koleksi.");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Dokumen tidak ditemukan.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
