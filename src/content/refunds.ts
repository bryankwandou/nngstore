import { defineCopy } from "./copy";

/** Refund policy. A legal page, so Indonesian uses "Anda". */
export const refundsCopy = defineCopy({
  en: {
    meta: {
      title: "Refund policy",
      description:
        "NNG Store refunds within 48 hours of payment when a file will not open, the wrong file was delivered, you were charged twice, or the file is materially different from its preview.",
    },
    eyebrow: "Policy",
    title: "Refund policy",
    intro:
      "Digital files cannot be returned once opened, so refunds cover the cases where we got something wrong. You have 48 hours from payment to ask.",
    updated: "Last updated 17 October 2026",
    tocLabel: "On this page",
    summary: {
      window: "48 hours",
      windowLabel: "from payment to request a refund",
      casesTitle: "We refund when",
      cases: [
        { title: "The file will not open", body: "It fails to load in the reader on a supported, up-to-date browser." },
        { title: "The wrong file was delivered", body: "Your library shows a different file from the one you paid for." },
        { title: "You were charged twice", body: "The same order was paid more than once." },
        {
          title: "It differs from the preview",
          body: "The content is materially different from the preview pages and product details.",
        },
      ],
    },
    sections: [
      {
        id: "window",
        title: "The 48-hour window",
        body: [
          "A refund request must reach us within 48 hours of the moment your payment was confirmed. Requests after that are not accepted, except for a duplicate charge, which we correct whenever it is found.",
        ],
      },
      {
        id: "cases",
        title: "Cases we refund",
        body: [
          "We refund the price of the affected file in these cases:",
          [
            "The file will not open in the reader, and the problem is on our side rather than your connection or device.",
            "The file in your library is not the one you paid for.",
            "You were charged more than once for the same order.",
            "The file is materially different from its preview pages and product details, for example missing pages or a different subject.",
          ],
          "For a wrong or broken file we may first offer the correct file. You can still choose a refund if the request is inside the 48-hour window.",
        ],
      },
      {
        id: "not-covered",
        title: "Cases we do not refund",
        body: [
          [
            "A change of mind after the file has been opened.",
            "Buying a file you already own, when the product page and preview showed what it contained.",
            "Not being able to print or download. Files are read in the browser reader, as the [protection page](protection) explains.",
            "Access removed because a copy was shared, which breaks the [terms of sale](terms).",
          ],
        ],
      },
      {
        id: "how",
        title: "How to ask for a refund",
        body: [
          "Send a direct message to @nngstoreofficial on [Instagram](ig) with:",
          [
            "your order number (shown in your library and on every page of your file)",
            "the email address you used at checkout",
            "what went wrong, with a screenshot if you can",
          ],
          "NNG Store has no email or WhatsApp support yet. Instagram DM is the only contact channel.",
        ],
      },
      {
        id: "after",
        title: "After a refund is approved",
        body: [
          "The money is returned through Midtrans, normally to the payment method you used. How long it takes to appear depends on that method and your bank or e-wallet provider.",
          "Access to the refunded file is removed from your library.",
        ],
      },
    ],
  },
  id: {
    meta: {
      title: "Kebijakan pengembalian dana",
      description:
        "NNG Store mengembalikan dana dalam 48 jam setelah pembayaran jika file tidak bisa dibuka, file yang dikirim salah, terjadi tagihan ganda, atau isi file jauh berbeda dari pratinjaunya.",
    },
    eyebrow: "Kebijakan",
    title: "Kebijakan pengembalian dana",
    intro:
      "File digital tidak bisa dikembalikan setelah dibuka, jadi pengembalian dana berlaku untuk kasus ketika kesalahan ada di pihak kami. Anda punya waktu 48 jam sejak pembayaran untuk mengajukannya.",
    updated: "Terakhir diperbarui 17 Oktober 2026",
    tocLabel: "Di halaman ini",
    summary: {
      window: "48 jam",
      windowLabel: "sejak pembayaran untuk mengajukan pengembalian dana",
      casesTitle: "Dana dikembalikan jika",
      cases: [
        {
          title: "File tidak bisa dibuka",
          body: "File gagal dimuat di pembaca pada browser yang didukung dan sudah diperbarui.",
        },
        { title: "File yang dikirim salah", body: "Koleksi Anda menampilkan file yang berbeda dari yang Anda bayar." },
        { title: "Tertagih dua kali", body: "Pesanan yang sama terbayar lebih dari sekali." },
        {
          title: "Berbeda dari pratinjau",
          body: "Isinya jauh berbeda dari halaman contoh dan detail produk.",
        },
      ],
    },
    sections: [
      {
        id: "window",
        title: "Batas waktu 48 jam",
        body: [
          "Permintaan pengembalian dana harus kami terima dalam 48 jam sejak pembayaran Anda terkonfirmasi. Permintaan setelah itu tidak dapat diterima, kecuali tagihan ganda, yang kami perbaiki kapan pun ditemukan.",
        ],
      },
      {
        id: "cases",
        title: "Kasus yang dananya dikembalikan",
        body: [
          "Kami mengembalikan harga file yang bermasalah dalam kasus berikut:",
          [
            "File tidak bisa dibuka di pembaca, dan masalahnya ada di pihak kami, bukan pada koneksi atau perangkat Anda.",
            "File di koleksi Anda bukan file yang Anda bayar.",
            "Anda tertagih lebih dari sekali untuk pesanan yang sama.",
            "Isi file jauh berbeda dari halaman contoh dan detail produknya, misalnya ada halaman yang hilang atau mata pelajarannya berbeda.",
          ],
          "Untuk file yang salah atau rusak, kami mungkin menawarkan file yang benar terlebih dahulu. Anda tetap boleh memilih pengembalian dana selama permintaan masih dalam batas 48 jam.",
        ],
      },
      {
        id: "not-covered",
        title: "Kasus yang dananya tidak dikembalikan",
        body: [
          [
            "Berubah pikiran setelah file dibuka.",
            "Membeli file yang sudah Anda miliki, padahal halaman produk dan pratinjaunya sudah menunjukkan isinya.",
            "Tidak bisa mencetak atau mengunduh. File dibaca di pembaca dalam browser, seperti dijelaskan di [halaman perlindungan](protection).",
            "Akses dicabut karena salinan disebarkan, yang melanggar [syarat pembelian](terms).",
          ],
        ],
      },
      {
        id: "how",
        title: "Cara mengajukan pengembalian dana",
        body: [
          "Kirim pesan langsung ke @nngstoreofficial di [Instagram](ig) berisi:",
          [
            "nomor pesanan Anda (tertera di koleksi dan di setiap halaman file Anda)",
            "alamat email yang Anda pakai saat membayar",
            "masalah yang terjadi, dengan tangkapan layar jika ada",
          ],
          "NNG Store belum memiliki layanan lewat email atau WhatsApp. DM Instagram adalah satu-satunya saluran kontak.",
        ],
      },
      {
        id: "after",
        title: "Setelah pengembalian dana disetujui",
        body: [
          "Dana dikembalikan melalui Midtrans, umumnya ke metode pembayaran yang Anda pakai. Lama dana masuk bergantung pada metode tersebut serta bank atau penyedia dompet digital Anda.",
          "Akses ke file yang dananya dikembalikan dihapus dari koleksi Anda.",
        ],
      },
    ],
  },
});
