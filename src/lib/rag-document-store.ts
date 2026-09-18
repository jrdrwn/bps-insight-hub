export type RagDocumentStatus = "Mengunggah" | "Mengindeks" | "Siap digunakan";

export type RagDocument = {
  id: string;
  name: string;
  category: string;
  size: string;
  pages: number;
  uploadedAt: string;
  status: RagDocumentStatus;
  progress?: number;
};

let documents: RagDocument[] = [
  {
    id: "sop-pelayanan-data",
    name: "SOP Pelayanan Statistik Terpadu 2025.pdf",
    category: "SOP",
    size: "2,4 MB",
    pages: 42,
    uploadedAt: "12 Sep 2026",
    status: "Siap digunakan",
  },
  {
    id: "pedoman-sakip",
    name: "Pedoman Penyusunan SAKIP.pdf",
    category: "Pedoman",
    size: "1,8 MB",
    pages: 28,
    uploadedAt: "08 Sep 2026",
    status: "Siap digunakan",
  },
  {
    id: "peraturan-kepegawaian",
    name: "Peraturan Kepegawaian Internal.pdf",
    category: "SDM",
    size: "934 KB",
    pages: 16,
    uploadedAt: "29 Agu 2026",
    status: "Siap digunakan",
  },
];

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export const ragDocumentStore = {
  getSnapshot: () => documents,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  add(items: RagDocument[]) {
    documents = [...items, ...documents];
    notify();
  },
  update(id: string, changes: Partial<RagDocument>) {
    documents = documents.map((document) =>
      document.id === id ? { ...document, ...changes } : document,
    );
    notify();
  },
  remove(id: string) {
    documents = documents.filter((document) => document.id !== id);
    notify();
  },
};

export function categoryFromTitle(title: string) {
  const value = title.toLowerCase();
  if (value.includes("sop") || value.includes("prosedur")) return "SOP";
  if (value.includes("keuangan") || value.includes("anggaran") || value.includes("spj"))
    return "Keuangan";
  if (value.includes("pegawai") || value.includes("kepegawaian") || value.includes("sdm"))
    return "SDM";
  if (value.includes("statistik") || value.includes("sensus") || value.includes("survei"))
    return "Statistik";
  if (value.includes("pedoman") || value.includes("panduan")) return "Pedoman";
  return "Dokumen Umum";
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}
