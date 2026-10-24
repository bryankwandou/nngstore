import { defineCopy } from "./copy";

/** Terms of sale. A legal page, so Indonesian uses "Anda". */
export const termsCopy = defineCopy({
  en: {
    meta: {
      title: "Terms of sale",
      description:
        "The terms for buying and reading printable worksheet files at NNG Store: what you receive, how you may use it, payment, refunds and protection.",
    },
    eyebrow: "Policy",
    title: "Terms of sale",
    intro:
      "These terms apply when you buy a file from NNG Store. They are written to be read, not skimmed past. By paying for an order you agree to them.",
    updated: "Last updated 17 October 2026",
    tocLabel: "On this page",
    sections: [
      {
        id: "who",
        title: "Who we are",
        body: [
          "NNG Store sells digital school material for primary and junior high school (SD and SMP): practice sets, answer keys and packs, delivered as PDF files. In these terms, \"we\" means NNG Store and \"you\" means the person who places the order.",
          "You can reach us by direct message to @nngstoreofficial on [Instagram](ig). That is our only contact channel at the moment.",
        ],
      },
      {
        id: "what-you-buy",
        title: "What you buy",
        body: [
          "You buy a licence to read a digital file, not a physical product and not ownership of the content. Each product page lists the series, the subject, the level, the number of questions, the page count and the file size, and shows preview pages from the real file.",
          "A bundle is a set of individual files sold together at one price. Buying a bundle gives you the same licence for each file inside it.",
        ],
      },
      {
        id: "prices",
        title: "Prices and payment",
        body: [
          "Prices are shown in Indonesian rupiah and are the amount you pay for the files. Your payment is processed by Midtrans, which offers the payment methods available for your order. We never receive or store your card or bank details.",
          "An order is complete when Midtrans confirms the payment. If a payment is not confirmed, no files are delivered and nothing is charged by us.",
        ],
      },
      {
        id: "delivery",
        title: "Delivery and access",
        body: [
          "Files are delivered to My library in the browser you paid with, as soon as the payment is confirmed. They are read in a browser reader and are not provided as downloads.",
          [
            "Each purchase can be opened on up to 2 devices.",
            "Read access uses signed tokens that expire after 10 minutes and renew while you read.",
            "Printing, saving and copying are turned off in the reader.",
          ],
          "How this works, and what it cannot prevent, is explained on the [protection page](protection).",
        ],
      },
      {
        id: "licence",
        title: "Your licence",
        body: [
          "Your licence is personal to you. You may read the files for your own study or for teaching your own students.",
          "You may not:",
          [
            "share, upload, forward, resell or publish the files or any part of them",
            "give your library access to other people",
            "remove, cover or alter the stamp or watermark",
            "try to get around the reader's protection, the device limit or the read tokens",
          ],
        ],
      },
      {
        id: "stamp",
        title: "Stamping and tracing",
        body: [
          "Every copy is stamped with your name, part of your email address and your order number, and carries an invisible per-order mark. If a copy appears where it should not, we may use the stamp to identify the order it came from.",
          "If a copy from your order is shared in breach of these terms, we may remove access to that order without a refund.",
        ],
      },
      {
        id: "refunds",
        title: "Refunds",
        body: [
          "Refunds are possible within 48 hours of payment when a file will not open, the wrong file was delivered, you were charged twice, or the file is materially different from its preview. The full rules are in the [refund policy](refunds).",
        ],
      },
      {
        id: "content",
        title: "Content and accuracy",
        body: [
          "Every file is checked before it goes on sale. If you find a mistake in a question or an answer, tell us on Instagram and we will look at it.",
          "We describe each file only by what it contains. We do not claim that a file follows a particular curriculum unless its title says so.",
        ],
      },
      {
        id: "availability",
        title: "Availability",
        body: [
          "We aim to keep the site and your library available, but we cannot promise that it will never be interrupted, for example during maintenance or a problem with our hosting or payment provider.",
        ],
      },
      {
        id: "changes",
        title: "Changes to these terms",
        body: [
          "We may update these terms. The date at the top of this page shows the latest version. The terms that applied when you paid continue to apply to that order.",
        ],
      },
    ],
  },
  id: {
    meta: {
      title: "Syarat pembelian",
      description:
        "Syarat membeli dan membaca file lembar soal siap cetak di NNG Store: apa yang Anda terima, cara penggunaannya, pembayaran, pengembalian dana, dan perlindungan.",
    },
    eyebrow: "Kebijakan",
    title: "Syarat pembelian",
    intro:
      "Syarat ini berlaku saat Anda membeli file dari NNG Store. Dengan membayar pesanan, Anda menyetujuinya, jadi mohon dibaca sampai selesai.",
    updated: "Terakhir diperbarui 17 Oktober 2026",
    tocLabel: "Di halaman ini",
    sections: [
      {
        id: "who",
        title: "Tentang kami",
        body: [
          "NNG Store menjual bahan belajar digital untuk SD dan SMP: latihan soal, kunci jawaban, dan paket, dalam bentuk file PDF. Dalam syarat ini, \"kami\" berarti NNG Store dan \"Anda\" berarti orang yang melakukan pemesanan.",
          "Anda dapat menghubungi kami lewat pesan langsung ke @nngstoreofficial di [Instagram](ig). Saat ini itulah satu-satunya saluran kontak kami.",
        ],
      },
      {
        id: "what-you-buy",
        title: "Yang Anda beli",
        body: [
          "Anda membeli lisensi untuk membaca file digital, bukan produk fisik dan bukan kepemilikan atas isinya. Setiap halaman produk mencantumkan seri, mata pelajaran, jenjang, jumlah soal, jumlah halaman, dan ukuran file, serta menampilkan halaman contoh dari file aslinya.",
          "Paket adalah sekumpulan file satuan yang dijual bersama dengan satu harga. Membeli paket memberi Anda lisensi yang sama untuk setiap file di dalamnya.",
        ],
      },
      {
        id: "prices",
        title: "Harga dan pembayaran",
        body: [
          "Harga ditampilkan dalam rupiah dan merupakan jumlah yang Anda bayar untuk file tersebut. Pembayaran diproses oleh Midtrans, yang menyediakan metode pembayaran yang tersedia untuk pesanan Anda. Kami tidak pernah menerima atau menyimpan data kartu maupun rekening Anda.",
          "Pesanan selesai saat Midtrans mengonfirmasi pembayaran. Jika pembayaran tidak terkonfirmasi, file tidak dikirim dan kami tidak menagih apa pun.",
        ],
      },
      {
        id: "delivery",
        title: "Pengiriman dan akses",
        body: [
          "File dikirim ke Koleksi saya di browser yang Anda pakai saat membayar, segera setelah pembayaran terkonfirmasi. File dibaca di pembaca dalam browser dan tidak disediakan untuk diunduh.",
          [
            "Setiap pembelian dapat dibuka di maksimal 2 perangkat.",
            "Akses baca memakai token bertanda tangan yang kedaluwarsa setelah 10 menit dan diperbarui selama Anda membaca.",
            "Fungsi cetak, simpan, dan salin dimatikan di pembaca.",
          ],
          "Cara kerjanya, dan apa yang tidak bisa dicegahnya, dijelaskan di [halaman perlindungan](protection).",
        ],
      },
      {
        id: "licence",
        title: "Lisensi Anda",
        body: [
          "Lisensi Anda bersifat pribadi. Anda boleh membaca file untuk belajar sendiri atau untuk mengajar murid Anda sendiri.",
          "Anda tidak boleh:",
          [
            "membagikan, mengunggah, meneruskan, menjual kembali, atau menerbitkan file maupun bagiannya",
            "memberikan akses koleksi Anda kepada orang lain",
            "menghapus, menutupi, atau mengubah cap maupun tanda air",
            "mencoba mengakali perlindungan pembaca, batas perangkat, atau token baca",
          ],
        ],
      },
      {
        id: "stamp",
        title: "Cap dan pelacakan",
        body: [
          "Setiap salinan dibubuhi nama Anda, sebagian alamat email Anda, dan nomor pesanan Anda, serta membawa tanda tak terlihat per pesanan. Jika sebuah salinan muncul di tempat yang tidak semestinya, kami dapat memakai cap tersebut untuk mengenali pesanan asalnya.",
          "Jika salinan dari pesanan Anda disebarkan dengan melanggar syarat ini, kami dapat mencabut akses pesanan tersebut tanpa pengembalian dana.",
        ],
      },
      {
        id: "refunds",
        title: "Pengembalian dana",
        body: [
          "Pengembalian dana dapat diajukan dalam 48 jam setelah pembayaran jika file tidak bisa dibuka, file yang dikirim salah, Anda tertagih dua kali, atau isi file jauh berbeda dari pratinjaunya. Aturan lengkapnya ada di [kebijakan pengembalian dana](refunds).",
        ],
      },
      {
        id: "content",
        title: "Isi dan ketepatan",
        body: [
          "Setiap file kami periksa sebelum dijual. Jika Anda menemukan kesalahan pada soal atau jawaban, beri tahu kami lewat Instagram dan kami akan memeriksanya.",
          "Kami menjelaskan setiap file hanya berdasarkan isinya. Kami tidak mengklaim sebuah file mengikuti kurikulum tertentu kecuali judulnya menyebutkan demikian.",
        ],
      },
      {
        id: "availability",
        title: "Ketersediaan layanan",
        body: [
          "Kami berusaha menjaga situs dan koleksi Anda tetap bisa diakses, tetapi tidak dapat menjamin layanan tidak pernah terganggu, misalnya saat pemeliharaan atau ketika penyedia hosting atau pembayaran kami mengalami masalah.",
        ],
      },
      {
        id: "changes",
        title: "Perubahan syarat",
        body: [
          "Kami dapat memperbarui syarat ini. Tanggal di bagian atas halaman menunjukkan versi terbaru. Syarat yang berlaku saat Anda membayar tetap berlaku untuk pesanan tersebut.",
        ],
      },
    ],
  },
});
