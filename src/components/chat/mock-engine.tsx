import { datasets, growthSeries, povertySeries, regionMovers } from "@/lib/mock-data";

export type Source = { kind: string; title: string; meta: string };

export type BlockKind = "kpi" | "line" | "area" | "bar" | "table" | "dataset" | "summary";

export type AiAnswer = {
  text: string;
  blocks: BlockKind[];
  insight?: string;
  sources: Source[];
};

const SOURCE_PDRB: Source[] = [
  {
    kind: "Official Dataset",
    title: "BPS Provinsi Kalimantan Tengah",
    meta: "Dataset PDRB · Statistical Table",
  },
  {
    kind: "BPS Publication",
    title: "Provinsi Kalimantan Tengah Dalam Angka",
    meta: "Publikasi tahunan · Tabel 9.1",
  },
];

const SOURCE_POVERTY: Source[] = [
  {
    kind: "Official Dataset",
    title: "Tingkat Kemiskinan Menurut Kabupaten/Kota",
    meta: "Dataset kemiskinan · Statistical Table",
  },
  {
    kind: "Official Document",
    title: "Pedoman Pengolahan Data",
    meta: "Halaman 14 · Metodologi penghitungan",
  },
];

export const suggestedQuestions = [
  "Cari data kemiskinan Kalimantan Tengah.",
  "Bandingkan kemiskinan 2020–2025.",
  "Wilayah mana yang mengalami perubahan terbesar?",
  "Buatkan ringkasan dari data ini.",
  "Bagaimana perkembangan pertumbuhan ekonomi Kalimantan Tengah selama 5 tahun terakhir?",
];

export function answerFor(question: string): AiAnswer {
  const q = question.toLowerCase();

  if (q.includes("cari") && q.includes("kemiskinan")) {
    return {
      text: "Saya menemukan 1 dataset yang paling relevan dengan permintaan Anda pada wilayah Kalimantan Tengah.",
      blocks: ["dataset"],
      insight:
        "Dataset ini mencakup 14 kabupaten/kota dengan periode 2020–2025 dan dapat langsung dianalisis.",
      sources: SOURCE_POVERTY,
    };
  }

  if (q.includes("banding") || (q.includes("kemiskinan") && q.includes("2020"))) {
    return {
      text: "Berikut perbandingan tingkat kemiskinan Kalimantan Tengah pada periode 2020–2025.",
      blocks: ["kpi", "area"],
      insight:
        "Tingkat kemiskinan menurun konsisten sepanjang periode, dengan penurunan tahunan terbesar terjadi pada 2023.",
      sources: SOURCE_POVERTY,
    };
  }

  if (q.includes("wilayah") || q.includes("terbesar") || q.includes("mover")) {
    return {
      text: "Berikut wilayah dengan perubahan terbesar pada periode yang dipilih.",
      blocks: ["table", "bar"],
      insight:
        "Kotawaringin Timur mencatat perubahan terbesar sebesar -1,23 poin dan ditandai pada visualisasi.",
      sources: SOURCE_POVERTY,
    };
  }

  if (q.includes("ringkas") || q.includes("summary") || q.includes("brief")) {
    return {
      text: "Berikut ringkasan yang saya susun dari data yang sedang Anda telaah.",
      blocks: ["summary"],
      sources: SOURCE_PDRB,
    };
  }

  if (q.includes("ekonomi") || q.includes("pdrb") || q.includes("pertumbuhan")) {
    return {
      text: "Berdasarkan data yang tersedia, berikut ringkasan perkembangan pertumbuhan ekonomi pada periode yang dipilih.",
      blocks: ["kpi", "line"],
      insight:
        "Pertumbuhan menunjukkan perubahan pada beberapa periode. Periode dengan perubahan terbesar ditandai pada visualisasi.",
      sources: SOURCE_PDRB,
    };
  }

  return {
    text: "I couldn't find sufficient information in the available sources.",
    blocks: [],
    insight:
      "Coba persempit pertanyaan Anda ke topik, wilayah, atau periode tertentu — misalnya “kemiskinan Kalimantan Tengah 2020–2025”.",
    sources: [],
  };
}

export const answerData = {
  growthSeries,
  povertySeries,
  regionMovers,
  povertyDataset: datasets.find((d) => d.id === "kemiskinan-kalteng")!,
};

export const loadingStages = ["Analyzing...", "Finding relevant data...", "Generating insight..."];
