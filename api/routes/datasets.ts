import { Hono } from "hono";

// TODO: Replace with real DB query
const MOCK_DATASETS = [
  { id: "pdrb-kalteng", code: "PRODUK DOMESTIK REGIONAL BRUTO", title: "Produk Domestik Regional Bruto Menurut Lapangan Usaha", period: "2020–2025", region: "Kalimantan Tengah", variables: 18, rows: "12.450", updated: "12 Agu 2026", topic: "Ekonomi", type: "Tabel Statistik" },
  { id: "kemiskinan-kalteng", code: "TINGKAT KEMISKINAN", title: "Tingkat Kemiskinan Menurut Kabupaten/Kota", period: "2020–2025", region: "Kalimantan Tengah", variables: 9, rows: "3.180", updated: "04 Agu 2026", topic: "Sosial", type: "Tabel Statistik" },
  { id: "ipm-kalteng", code: "INDEKS PEMBANGUNAN MANUSIA", title: "Indeks Pembangunan Manusia Kabupaten/Kota", period: "2019–2025", region: "Kalimantan Tengah", variables: 6, rows: "1.960", updated: "28 Jul 2026", topic: "Sosial", type: "Indikator" },
  { id: "penduduk-kalteng", code: "JUMLAH PENDUDUK", title: "Jumlah Penduduk Menurut Kabupaten/Kota", period: "2020–2025", region: "Kalimantan Tengah", variables: 12, rows: "8.420", updated: "19 Jul 2026", topic: "Demografi", type: "Tabel Statistik" },
  { id: "inflasi-kalteng", code: "INFLASI", title: "Inflasi Menurut Kelompok Pengeluaran", period: "2020–2025", region: "Kalimantan Tengah", variables: 15, rows: "6.300", updated: "01 Agu 2026", topic: "Ekonomi", type: "Tabel Statistik" },
];

const datasetRoutes = new Hono();

// ── List all datasets ──
datasetRoutes.get("/", (c) => {
  const q = c.req.query("q")?.toLowerCase();
  let results = MOCK_DATASETS;
  if (q) {
    results = results.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.topic.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q),
    );
  }
  return c.json({ data: results, total: results.length });
});

// ── Get single dataset ──
datasetRoutes.get("/:id", (c) => {
  const dataset = MOCK_DATASETS.find((d) => d.id === c.req.param("id"));
  if (!dataset) return c.json({ error: "Dataset not found" }, 404);
  return c.json({ data: dataset });
});

export { datasetRoutes };
