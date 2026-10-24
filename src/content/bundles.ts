import { defineCopy } from "./copy";

/** Copy for /bundles. Counts and savings come from the catalog at build time. */
export const bundlesCopy = defineCopy({
  en: {
    metaTitle: "Bundles",
    metaDescription: (bundles: number) =>
      `${bundles} bundles of printable worksheets and answer keys for SD and SMP, each priced below buying the files one by one.`,
    eyebrow: "Bundles",
    title: "Bundles",
    intro: (bundles: number) =>
      `${bundles} bundles. Each one costs less than buying its files one by one, and the saving is shown on every card.`,
    jump: "Jump to",
    bySubject: "By subject",
    bySubjectLine: "Every file for one subject: practice sets, answer keys, HOTS sets and exam packs.",
    byType: "By type",
    byTypeLine: "One type of file across every subject that has it.",
    saving: (saving: string) => `Save ${saving} compared to buying each file`,
    count: (n: number) => (n === 1 ? "1 bundle" : `${n} bundles`),
    browse: "Prefer single files?",
    browseLink: "Browse the shop",
  },
  id: {
    metaTitle: "Paket hemat",
    metaDescription: (bundles: number) =>
      `${bundles} paket lembar soal dan kunci jawaban siap cetak untuk SD dan SMP, masing-masing lebih murah daripada beli satuan.`,
    eyebrow: "Paket hemat",
    title: "Paket hemat",
    intro: (bundles: number) =>
      `${bundles} paket. Setiap paket lebih murah daripada membeli file-filenya satu per satu, dan besar hematnya tertulis di tiap kartu.`,
    jump: "Langsung ke",
    bySubject: "Per mata pelajaran",
    bySubjectLine: "Semua file untuk satu mata pelajaran: lembar latihan, kunci jawaban, soal HOTS, dan paket ujian.",
    byType: "Per jenis",
    byTypeLine: "Satu jenis file untuk semua mata pelajaran yang memilikinya.",
    saving: (saving: string) => `Hemat ${saving} dibanding beli satuan`,
    count: (n: number) => `${n} paket`,
    browse: "Lebih suka beli satuan?",
    browseLink: "Lihat toko",
  },
});
