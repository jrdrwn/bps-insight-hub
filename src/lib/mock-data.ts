/**
 * ALL DATA IN THIS FILE IS FICTIONAL DEMO DATA.
 * Not official BPS statistics. Frontend prototype only.
 */

export type Dataset = {
  id: string;
  code: string;
  title: string;
  description: string;
  period: string;
  region: string;
  variables: number;
  rows: string;
  updated: string;
  topic: string;
  type: string;
};

export const datasets: Dataset[] = [
  {
    id: "pdrb-kalteng",
    code: "PRODUK DOMESTIK REGIONAL BRUTO",
    title: "Produk Domestik Regional Bruto Menurut Lapangan Usaha",
    description:
      "Nilai tambah bruto seluruh lapangan usaha di wilayah Kalimantan Tengah, disajikan atas dasar harga berlaku dan harga konstan.",
    period: "2020–2025",
    region: "Kalimantan Tengah",
    variables: 18,
    rows: "12.450",
    updated: "12 Agu 2026",
    topic: "Ekonomi",
    type: "Tabel Statistik",
  },
  {
    id: "kemiskinan-kalteng",
    code: "TINGKAT KEMISKINAN",
    title: "Tingkat Kemiskinan Menurut Kabupaten/Kota",
    description:
      "Persentase penduduk miskin, jumlah penduduk miskin, dan garis kemiskinan menurut kabupaten/kota.",
    period: "2020–2025",
    region: "Kalimantan Tengah",
    variables: 9,
    rows: "3.180",
    updated: "04 Agu 2026",
    topic: "Sosial",
    type: "Tabel Statistik",
  },
  {
    id: "ipm-kalteng",
    code: "INDEKS PEMBANGUNAN MANUSIA",
    title: "Indeks Pembangunan Manusia Kabupaten/Kota",
    description:
      "IPM beserta komponen penyusunnya: umur harapan hidup, rata-rata lama sekolah, dan pengeluaran per kapita.",
    period: "2019–2025",
    region: "Kalimantan Tengah",
    variables: 6,
    rows: "1.960",
    updated: "28 Jul 2026",
    topic: "Sosial",
    type: "Indikator",
  },
  {
    id: "penduduk-kalteng",
    code: "JUMLAH PENDUDUK",
    title: "Jumlah Penduduk Menurut Kabupaten/Kota",
    description: "Proyeksi jumlah penduduk menurut kelompok umur dan jenis kelamin.",
    period: "2020–2025",
    region: "Kalimantan Tengah",
    variables: 12,
    rows: "8.420",
    updated: "19 Jul 2026",
    topic: "Demografi",
    type: "Tabel Statistik",
  },
  {
    id: "inflasi-kalteng",
    code: "INFLASI",
    title: "Inflasi Menurut Kelompok Pengeluaran",
    description: "Indeks harga konsumen dan laju inflasi bulanan menurut kelompok pengeluaran.",
    period: "2022–2026",
    region: "Kalimantan Tengah",
    variables: 11,
    rows: "5.640",
    updated: "01 Sep 2026",
    topic: "Ekonomi",
    type: "Seri Waktu",
  },
];

export const datasetTopics = ["Semua Topik", "Ekonomi", "Sosial", "Demografi"];
export const datasetRegions = [
  "Semua Wilayah",
  "Kalimantan Tengah",
  "Palangka Raya",
  "Kotawaringin Timur",
];
export const datasetYears = ["Semua Tahun", "2026", "2025", "2024", "2023", "2022"];
export const datasetTypes = ["Semua Tipe", "Tabel Statistik", "Indikator", "Seri Waktu"];

export const growthSeries = [
  { year: "2020", value: -1.4, national: -2.1 },
  { year: "2021", value: 3.4, national: 3.7 },
  { year: "2022", value: 6.1, national: 5.3 },
  { year: "2023", value: 4.1, national: 5.0 },
  { year: "2024", value: 4.8, national: 5.1 },
  { year: "2025", value: 5.42, national: 5.2 },
];

export const povertySeries = [
  { year: "2020", value: 5.26, target: 5.0 },
  { year: "2021", value: 5.16, target: 4.9 },
  { year: "2022", value: 5.08, target: 4.8 },
  { year: "2023", value: 4.87, target: 4.7 },
  { year: "2024", value: 4.71, target: 4.6 },
  { year: "2025", value: 4.52, target: 4.5 },
];

export const regionMovers = [
  { region: "Kotawaringin Timur", y2020: 6.21, y2025: 4.98, delta: -1.23 },
  { region: "Kapuas", y2020: 5.94, y2025: 4.92, delta: -1.02 },
  { region: "Barito Utara", y2020: 5.44, y2025: 4.66, delta: -0.78 },
  { region: "Palangka Raya", y2020: 3.62, y2025: 3.11, delta: -0.51 },
  { region: "Seruyan", y2020: 6.02, y2025: 5.61, delta: -0.41 },
  { region: "Murung Raya", y2020: 5.71, y2025: 5.4, delta: -0.31 },
];

export const sectorShare = [
  { name: "Pertanian", value: 22.4 },
  { name: "Industri", value: 17.1 },
  { name: "Perdagangan", value: 14.6 },
  { name: "Konstruksi", value: 11.8 },
  { name: "Lainnya", value: 34.1 },
];

export const pdrbTable = [
  { kode: "6201", wilayah: "Kotawaringin Barat", y2023: 18.42, y2024: 19.31, y2025: 20.44 },
  { kode: "6202", wilayah: "Kotawaringin Timur", y2023: 26.11, y2024: 27.4, y2025: 29.02 },
  { kode: "6203", wilayah: "Kapuas", y2023: 15.86, y2024: 16.52, y2025: 17.38 },
  { kode: "6204", wilayah: "Barito Selatan", y2023: 7.94, y2024: 8.21, y2025: 8.6 },
  { kode: "6205", wilayah: "Barito Utara", y2023: 9.12, y2024: 9.48, y2025: 9.95 },
  { kode: "6206", wilayah: "Sukamara", y2023: 4.31, y2024: 4.52, y2025: 4.74 },
  { kode: "6207", wilayah: "Lamandau", y2023: 5.66, y2024: 5.93, y2025: 6.22 },
  { kode: "6208", wilayah: "Seruyan", y2023: 10.02, y2024: 10.44, y2025: 10.98 },
  { kode: "6271", wilayah: "Palangka Raya", y2023: 17.35, y2024: 18.29, y2025: 19.41 },
];

export type DemoDocument = {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  pages: number;
};

export const documents: DemoDocument[] = [
  {
    id: "pedoman-survei-2026",
    name: "Pedoman Survei 2026",
    type: "PDF",
    size: "4,2 MB",
    date: "02 Sep 2026",
    pages: 86,
  },
  {
    id: "pedoman-pengolahan-data",
    name: "Pedoman Pengolahan Data",
    type: "PDF",
    size: "2,8 MB",
    date: "18 Agu 2026",
    pages: 54,
  },
  {
    id: "metodologi-statistik",
    name: "Metodologi Statistik",
    type: "PDF",
    size: "6,1 MB",
    date: "30 Jul 2026",
    pages: 132,
  },
  {
    id: "laporan-kegiatan",
    name: "Laporan Kegiatan",
    type: "DOCX",
    size: "1,4 MB",
    date: "11 Jul 2026",
    pages: 28,
  },
];

export const conversations = [
  {
    id: "pdrb-kalteng",
    title: "Analisis PDRB Kalteng",
    snippet: "Pertumbuhan ekonomi 2020–2025 dan kontribusi lapangan usaha.",
    date: "Hari ini",
  },
  {
    id: "pertumbuhan-ekonomi",
    title: "Pertumbuhan ekonomi 2020–2025",
    snippet: "Perbandingan laju pertumbuhan provinsi dan nasional.",
    date: "Hari ini",
  },
  {
    id: "ringkasan-survei",
    title: "Ringkasan survei sosial",
    snippet: "Ringkasan otomatis dokumen pedoman survei sosial ekonomi.",
    date: "Kemarin",
  },
  {
    id: "dataset-kemiskinan",
    title: "Dataset kemiskinan",
    snippet: "Pencarian dataset kemiskinan menurut kabupaten/kota.",
    date: "3 hari lalu",
  },
  {
    id: "draft-laporan",
    title: "Draft laporan Agustus",
    snippet: "Draft executive brief indikator strategis Agustus.",
    date: "5 hari lalu",
  },
];

export const recentActivity = [
  { title: "Analisis PDRB Kalimantan Tengah", meta: "Analisis · 12 menit lalu" },
  { title: "Pertumbuhan ekonomi 2020–2025", meta: "Visualisasi · 1 jam lalu" },
  { title: "Ringkasan dokumen survei", meta: "Dokumen · 3 jam lalu" },
  { title: "Analisis data kemiskinan", meta: "Analisis · Kemarin" },
  { title: "Visualisasi IPM kabupaten/kota", meta: "Visualisasi · Kemarin" },
];

export const kpis = [
  { label: "Dataset Aktif", value: "1.248", delta: "+34", tone: "green" as const },
  { label: "Dokumen", value: "326", delta: "+12", tone: "blue" as const },
  { label: "Analisis Minggu Ini", value: "42", delta: "+8", tone: "orange" as const },
  { label: "Insight", value: "18", delta: "+3", tone: "green" as const },
];

export const savedItems = {
  datasets: datasets.slice(0, 3),
  documents: documents.slice(0, 2),
  insights: [
    { title: "Tren penurunan kemiskinan berlanjut", meta: "Insight · 2025" },
    { title: "Anomali inflasi kelompok makanan", meta: "Insight · Q2 2026" },
  ],
  conversations: conversations.slice(0, 3),
};
