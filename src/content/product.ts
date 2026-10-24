import { defineCopy } from "./copy";

/**
 * Copy for /shop/[slug], both single files and bundles. Numbers and prices are
 * passed in already formatted, so this file never holds a figure of its own.
 */
export const productCopy = defineCopy({
  en: {
    breadcrumb: "Breadcrumb",
    shop: "Shop",
    bundles: "Bundles",

    gallery: {
      label: "Preview pages",
      roledesc: "page viewer",
      page: (n: number, total: number) => `Page ${n} of ${total}`,
      prev: "Previous page",
      next: "Next page",
      zoom: "Zoom in",
      zoomTitle: (title: string) => `Preview of ${title}`,
      close: "Close preview",
      thumbs: "Choose a preview page",
      show: (n: number) => `Show page ${n}`,
      blurred: "Blurred in preview",
      answersBlurred: "Answers blurred",
      keys: "Use the arrow keys to turn pages.",
      alt: (title: string, n: number) => `${title}, page ${n}`,
      rule: (sharp: number, shown: number) =>
        sharp <= 0
          ? "Answers are blurred in the preview."
          : sharp >= shown
            ? `Pages 1-${shown} shown in full.`
            : `${sharp === 1 ? "Page 1" : `Pages 1-${sharp}`} shown in full, ${
                sharp + 1 === shown ? `page ${shown}` : `pages ${sharp + 1}-${shown}`
              } blurred.`,
      full: (pages: string) => `The full file has ${pages} pages.`,
    },

    meta: {
      questions: (n: string) => `${n} questions`,
      pages: (n: string) => `${n} pages`,
      files: (n: string) => `${n} files`,
      pdf: "PDF",
      level: "Level",
    },

    note: "Opens in your library right after payment.",
    payment: "Pay with QRIS, e-wallets or bank transfer through Midtrans.",

    facts: {
      getTitle: "What you get",
      get: (contents: string, pages: string) => `${contents}, ${pages} pages, as one PDF in your library.`,
      getBundle: (files: string, pages: string) => `${files} PDF files with ${pages} pages in total, all in your library.`,
      readTitle: "How you read it",
      read: "In the browser on a phone, tablet or computer. Each copy carries a watermark with your order details.",
      refundTitle: "If something is wrong",
      refund: "If the file will not open or the wrong file arrives, tell us within 48 hours and we fix it or refund you.",
      refundLink: "Refund policy",
    },

    contents: {
      questions: "Questions only",
      answers: "Answers only",
      "questions+answers": "Questions and answers",
      "answers+explanations": "Answers with explanations",
      "questions+answers+explanations": "Questions, answers and explanations",
    } as Record<string, string>,

    containsWord: {
      questions: "Questions",
      answers: "Answers",
      explanations: "Explanations",
    } as Record<string, string>,

    insideTitle: "What is inside",
    insideList: "In this file",
    seriesTitle: "About this type",

    whoTitle: "Who it is for",
    who: {
      practice:
        "Students who need steady practice, and the parents or teachers who set the work. It holds questions only, so pick up the matching answer key if you want to mark it.",
      key: "The person who marks: a teacher, a tutor or a parent. It is written to match the question set of the same subject and type.",
      full: "Anyone who wants the questions and the answers in one file: home practice, tutoring or a class set.",
    },
    levelLine: (level: string) => `Written for ${level}.`,

    deliveryTitle: "How delivery works",
    delivery: [
      "Pay with QRIS, an e-wallet or a bank transfer. Midtrans handles the payment.",
      "The file appears in your library as soon as the payment is confirmed.",
      "Read it in the browser. Each copy carries your order details as a watermark.",
    ],
    deliveryLink: "How files are protected",

    upsellTitle: "Save with a bundle",
    upsellIncludes: "Includes this file",
    notIncluded: "not included",
    upsellMath: (files: number, price: string, sum: string, saving: string) =>
      `${files} files for ${price} instead of ${sum} one by one. You save ${saving}.`,
    upsellExtra: (more: number, extra: string) =>
      `That is ${more} more files for ${extra} on top of this one.`,
    upsellView: "See the bundle",

    relatedTitle: (subject: string) => `More for ${subject}`,
    relatedAll: "View all",

    bundle: {
      chip: "Bundle",
      includedTitle: (n: number) => `The ${n} files in this bundle`,
      includedHint: "Each file has its own page with preview pages.",
      saving: (sum: string, price: string, saving: string) =>
        `Bought one by one, these files cost ${sum}. The bundle is ${price}, so you save ${saving}.`,
      previewRule: "Open any file below to see its preview pages.",
      who: "Teachers, tutors and families who want a whole subject or a whole type on hand without buying file by file.",
      eachPrice: "Bought alone",
      youSave: "You save",
      othersTitle: "Other bundles",
    },

    sticky: {
      label: "Purchase",
    },
  },
  id: {
    breadcrumb: "Navigasi",
    shop: "Toko",
    bundles: "Paket hemat",

    gallery: {
      label: "Contoh halaman",
      roledesc: "penampil halaman",
      page: (n: number, total: number) => `Halaman ${n} dari ${total}`,
      prev: "Halaman sebelumnya",
      next: "Halaman berikutnya",
      zoom: "Perbesar",
      zoomTitle: (title: string) => `Contoh halaman ${title}`,
      close: "Tutup contoh",
      thumbs: "Pilih contoh halaman",
      show: (n: number) => `Tampilkan halaman ${n}`,
      blurred: "Diburamkan di contoh",
      answersBlurred: "Jawaban diburamkan",
      keys: "Pakai tombol panah untuk membalik halaman.",
      alt: (title: string, n: number) => `${title}, halaman ${n}`,
      rule: (sharp: number, shown: number) =>
        sharp <= 0
          ? "Jawaban diburamkan di contoh halaman."
          : sharp >= shown
            ? `Halaman 1-${shown} tampil utuh.`
            : `${sharp === 1 ? "Halaman 1" : `Halaman 1-${sharp}`} tampil utuh, ${
                sharp + 1 === shown ? `halaman ${shown}` : `halaman ${sharp + 1}-${shown}`
              } diburamkan.`,
      full: (pages: string) => `File lengkapnya berisi ${pages} halaman.`,
    },

    meta: {
      questions: (n: string) => `${n} soal`,
      pages: (n: string) => `${n} halaman`,
      files: (n: string) => `${n} file`,
      pdf: "PDF",
      level: "Jenjang",
    },

    note: "Langsung bisa dibuka di koleksimu setelah pembayaran.",
    payment: "Bayar lewat QRIS, dompet digital, atau transfer bank melalui Midtrans.",

    facts: {
      getTitle: "Yang kamu dapat",
      get: (contents: string, pages: string) => `${contents}, ${pages} halaman, dalam satu PDF di koleksimu.`,
      getBundle: (files: string, pages: string) => `${files} file PDF dengan total ${pages} halaman, semuanya di koleksimu.`,
      readTitle: "Cara membacanya",
      read: "Lewat browser di HP, tablet, atau komputer. Setiap salinan diberi watermark berisi detail pesananmu.",
      refundTitle: "Kalau ada masalah",
      refund: "Kalau file tidak bisa dibuka atau yang terkirim salah, kabari kami dalam 48 jam; kami perbaiki atau kembalikan dananya.",
      refundLink: "Kebijakan pengembalian dana",
    },

    contents: {
      questions: "Soal saja",
      answers: "Kunci jawaban saja",
      "questions+answers": "Soal dan kunci jawaban",
      "answers+explanations": "Kunci jawaban dengan pembahasan",
      "questions+answers+explanations": "Soal, kunci jawaban, dan pembahasan",
    } as Record<string, string>,

    containsWord: {
      questions: "Soal",
      answers: "Kunci jawaban",
      explanations: "Pembahasan",
    } as Record<string, string>,

    insideTitle: "Isi file",
    insideList: "Yang ada di file ini",
    seriesTitle: "Tentang jenis ini",

    whoTitle: "Cocok untuk siapa",
    who: {
      practice:
        "Siswa yang butuh latihan rutin, juga orang tua atau guru yang memberi tugas. Isinya hanya soal, jadi ambil juga kunci jawaban yang sesuai kalau kamu ingin memeriksanya.",
      key: "Yang memeriksa jawaban: guru, guru les, atau orang tua. Disusun untuk set soal dengan pelajaran dan jenis yang sama.",
      full: "Siapa saja yang ingin soal dan jawabannya dalam satu file: latihan di rumah, les, atau satu kelas.",
    },
    levelLine: (level: string) => `Disusun untuk jenjang ${level}.`,

    deliveryTitle: "Cara pengirimannya",
    delivery: [
      "Bayar lewat QRIS, dompet digital, atau transfer bank. Pembayaran diproses Midtrans.",
      "File muncul di koleksimu begitu pembayaran terkonfirmasi.",
      "Baca lewat browser. Setiap salinan diberi watermark berisi detail pesananmu.",
    ],
    deliveryLink: "Cara file dilindungi",

    upsellTitle: "Lebih hemat dengan paket",
    upsellIncludes: "Termasuk file ini",
    notIncluded: "tidak termasuk",
    upsellMath: (files: number, price: string, sum: string, saving: string) =>
      `${files} file seharga ${price}, bukan ${sum} kalau beli satuan. Kamu hemat ${saving}.`,
    upsellExtra: (more: number, extra: string) =>
      `Artinya kamu mendapat ${more} file lagi dengan tambahan ${extra} dari harga file ini.`,
    upsellView: "Lihat paketnya",

    relatedTitle: (subject: string) => `Lainnya untuk ${subject}`,
    relatedAll: "Lihat semua",

    bundle: {
      chip: "Paket",
      includedTitle: (n: number) => `${n} file dalam paket ini`,
      includedHint: "Setiap file punya halaman sendiri lengkap dengan contoh halamannya.",
      saving: (sum: string, price: string, saving: string) =>
        `Kalau dibeli satuan, file-file ini seharga ${sum}. Harga paketnya ${price}, jadi kamu hemat ${saving}.`,
      previewRule: "Buka salah satu file di bawah untuk melihat contoh halamannya.",
      who: "Guru, guru les, dan keluarga yang ingin satu mata pelajaran atau satu jenis lengkap tanpa membeli satu per satu.",
      eachPrice: "Harga satuan",
      youSave: "Kamu hemat",
      othersTitle: "Paket lainnya",
    },

    sticky: {
      label: "Pembelian",
    },
  },
});
