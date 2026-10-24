import { defineCopy } from "./copy";

/** Privacy notice. A legal page, so Indonesian uses "Anda". */
export const privacyCopy = defineCopy({
  en: {
    meta: {
      title: "Privacy",
      description:
        "What NNG Store keeps about you (email, name, optional WhatsApp, order records), why, and who else handles it. Payments go through Midtrans; card data never reaches NNG Store.",
    },
    eyebrow: "Policy",
    title: "Privacy",
    intro:
      "NNG Store keeps as little about you as it can and still deliver your files. This page lists what that is, why it is kept and who else is involved.",
    updated: "Last updated 17 October 2026",
    tocLabel: "On this page",
    sections: [
      {
        id: "what",
        title: "What we keep",
        body: [
          [
            "Your email address, entered at checkout.",
            "Your name, entered at checkout.",
            "Your WhatsApp number, only if you choose to enter it.",
            "Order records: the order number, the files bought, the amount, the time and the payment status.",
          ],
          "We do not ask for your address, date of birth, school or identity number.",
        ],
      },
      {
        id: "why",
        title: "Why we keep it",
        body: [
          [
            "To deliver your files and show them in your library.",
            "To stamp your copy with your name, part of your email and your order number, so a leaked copy can be traced. See [how files are protected](protection).",
            "To check a payment, handle a refund request or answer a question about an order.",
            "To keep the record of a sale.",
          ],
          "We do not sell your data, and we do not use it for advertising.",
        ],
      },
      {
        id: "payments",
        title: "Payments",
        body: [
          "Payments are handled by Midtrans. Card numbers, bank logins and e-wallet details are entered on Midtrans and never touch NNG Store. Midtrans tells us whether a payment succeeded and for which order.",
          "Midtrans processes your payment data under its own privacy policy.",
        ],
      },
      {
        id: "browser",
        title: "What is stored in your browser",
        body: [
          [
            "Your library: a signed cookie that lists the files you bought. It cannot be read by scripts on the page, and any change to it makes it invalid.",
            "Your cart and your light or dark theme choice, stored in your browser's local storage.",
            "A device identifier used by the reader to apply the limit of 2 devices per purchase.",
          ],
          "Clearing your browser data removes these. If your library disappears that way, contact us with your order number.",
        ],
      },
      {
        id: "others",
        title: "Who else handles your data",
        body: [
          [
            "Midtrans, for payments.",
            "Vercel, which hosts this website and processes requests to it.",
          ],
          "We share data with others only when the law requires it.",
        ],
      },
      {
        id: "keep",
        title: "How long we keep it",
        body: [
          "Order records are kept for as long as you may need to open your files and for as long as a record of the sale must be kept. Data that is no longer needed is deleted.",
        ],
      },
      {
        id: "rights",
        title: "Your choices",
        body: [
          "You can ask us what we hold about you, ask us to correct it, or ask us to delete it. Deleting your data also removes access to the files you bought, because the stamp and the device limit depend on it.",
          "Send these requests by direct message to @nngstoreofficial on [Instagram](ig), with the email you used at checkout.",
        ],
      },
      {
        id: "changes",
        title: "Changes",
        body: [
          "If this notice changes, the date at the top of the page changes with it.",
        ],
      },
    ],
  },
  id: {
    meta: {
      title: "Privasi",
      description:
        "Data yang disimpan NNG Store tentang Anda (email, nama, WhatsApp opsional, catatan pesanan), alasannya, dan pihak lain yang terlibat. Pembayaran lewat Midtrans; data kartu tidak pernah sampai ke NNG Store.",
    },
    eyebrow: "Kebijakan",
    title: "Privasi",
    intro:
      "NNG Store menyimpan data Anda sesedikit mungkin, cukup untuk mengirim file Anda. Halaman ini menjelaskan data apa saja itu, alasannya, dan siapa saja yang terlibat.",
    updated: "Terakhir diperbarui 17 Oktober 2026",
    tocLabel: "Di halaman ini",
    sections: [
      {
        id: "what",
        title: "Data yang kami simpan",
        body: [
          [
            "Alamat email Anda, diisi saat pembayaran.",
            "Nama Anda, diisi saat pembayaran.",
            "Nomor WhatsApp Anda, hanya jika Anda memilih untuk mengisinya.",
            "Catatan pesanan: nomor pesanan, file yang dibeli, jumlah pembayaran, waktu, dan status pembayaran.",
          ],
          "Kami tidak meminta alamat rumah, tanggal lahir, nama sekolah, atau nomor identitas Anda.",
        ],
      },
      {
        id: "why",
        title: "Alasan kami menyimpannya",
        body: [
          [
            "Untuk mengirim file Anda dan menampilkannya di koleksi Anda.",
            "Untuk membubuhkan nama, sebagian email, dan nomor pesanan Anda pada salinan Anda, supaya salinan yang bocor bisa dilacak. Lihat [cara file dilindungi](protection).",
            "Untuk memeriksa pembayaran, menangani permintaan pengembalian dana, atau menjawab pertanyaan tentang pesanan.",
            "Untuk menyimpan catatan penjualan.",
          ],
          "Kami tidak menjual data Anda dan tidak memakainya untuk iklan.",
        ],
      },
      {
        id: "payments",
        title: "Pembayaran",
        body: [
          "Pembayaran ditangani oleh Midtrans. Nomor kartu, data login bank, dan data dompet digital dimasukkan di Midtrans dan tidak pernah sampai ke NNG Store. Midtrans hanya memberi tahu kami apakah pembayaran berhasil dan untuk pesanan yang mana.",
          "Midtrans memproses data pembayaran Anda sesuai kebijakan privasinya sendiri.",
        ],
      },
      {
        id: "browser",
        title: "Yang disimpan di browser Anda",
        body: [
          [
            "Koleksi Anda: cookie bertanda tangan yang mencatat file yang Anda beli. Cookie ini tidak bisa dibaca skrip di halaman, dan perubahan apa pun membuatnya tidak berlaku.",
            "Keranjang serta pilihan tema terang atau gelap Anda, disimpan di penyimpanan lokal browser.",
            "Pengenal perangkat yang dipakai pembaca untuk menerapkan batas 2 perangkat per pembelian.",
          ],
          "Menghapus data browser akan menghapus semua ini. Jika koleksi Anda hilang karena hal itu, hubungi kami dengan nomor pesanan Anda.",
        ],
      },
      {
        id: "others",
        title: "Pihak lain yang menangani data Anda",
        body: [
          [
            "Midtrans, untuk pembayaran.",
            "Vercel, yang menjadi tempat situs ini berjalan dan memproses permintaan ke situs.",
          ],
          "Kami hanya membagikan data kepada pihak lain jika diwajibkan oleh hukum.",
        ],
      },
      {
        id: "keep",
        title: "Lama penyimpanan",
        body: [
          "Catatan pesanan disimpan selama Anda mungkin masih perlu membuka file Anda dan selama catatan penjualan wajib disimpan. Data yang tidak diperlukan lagi akan dihapus.",
        ],
      },
      {
        id: "rights",
        title: "Pilihan Anda",
        body: [
          "Anda dapat menanyakan data apa yang kami simpan tentang Anda, meminta kami memperbaikinya, atau meminta kami menghapusnya. Menghapus data Anda juga menghapus akses ke file yang Anda beli, karena cap dan batas perangkat bergantung pada data tersebut.",
          "Kirim permintaan tersebut lewat pesan langsung ke @nngstoreofficial di [Instagram](ig), dengan menyebutkan email yang Anda pakai saat membayar.",
        ],
      },
      {
        id: "changes",
        title: "Perubahan",
        body: [
          "Jika pemberitahuan ini berubah, tanggal di bagian atas halaman juga ikut berubah.",
        ],
      },
    ],
  },
});
