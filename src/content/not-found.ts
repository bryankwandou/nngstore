import { defineCopy } from "./copy";

/** 404 page, one per language group. */
export const notFoundCopy = defineCopy({
  en: {
    meta: {
      title: "Page not found",
      description: "This page does not exist at NNG Store. Search the worksheets or go to a popular page.",
    },
    eyebrow: "Error 404",
    title: "This page is not here",
    body: "The link may be old or mistyped. Search the shop, or start from one of the pages below.",
    searchLabel: "Search worksheets",
    searchPlaceholder: "Subject, grade or type, e.g. fractions",
    searchButton: "Search",
    popularTitle: "Popular pages",
    links: [
      { key: "shop", label: "Shop", hint: "Every worksheet, answer key and pack" },
      { key: "bundles", label: "Bundles", hint: "Files sold together for less" },
      { key: "library", label: "My library", hint: "Files you have bought" },
      { key: "protection", label: "How files are protected", hint: "Stamps, reader and limits" },
      { key: "help", label: "Help", hint: "Buying, reading and refunds" },
    ],
    home: "Back to the home page",
  },
  id: {
    meta: {
      title: "Halaman tidak ditemukan",
      description: "Halaman ini tidak ada di NNG Store. Cari lembar soal atau buka halaman yang sering dikunjungi.",
    },
    eyebrow: "Galat 404",
    title: "Halaman ini tidak ada",
    body: "Tautannya mungkin sudah lama atau salah ketik. Cari di toko, atau mulai dari salah satu halaman di bawah.",
    searchLabel: "Cari lembar soal",
    searchPlaceholder: "Mapel, kelas, atau jenis, misalnya pecahan",
    searchButton: "Cari",
    popularTitle: "Halaman yang sering dibuka",
    links: [
      { key: "shop", label: "Toko", hint: "Semua lembar soal, kunci jawaban, dan paket" },
      { key: "bundles", label: "Paket hemat", hint: "File yang dijual bersama dengan harga lebih murah" },
      { key: "library", label: "Koleksi saya", hint: "File yang sudah kamu beli" },
      { key: "protection", label: "Cara file dilindungi", hint: "Cap, pembaca, dan batasannya" },
      { key: "help", label: "Bantuan", hint: "Membeli, membaca, dan pengembalian dana" },
    ],
    home: "Kembali ke beranda",
  },
});
