import { defineCopy } from "./copy";

/** "How files are protected". Store copy, so Indonesian uses "kamu". */
export const protectionCopy = defineCopy({
  en: {
    meta: {
      title: "How files are protected",
      description:
        "Every NNG Store file is stamped with its buyer's name and order number and read in a protected browser reader. What that stops, and what no website can stop.",
    },
    eyebrow: "File protection",
    title: "Every copy carries its buyer's name",
    intro:
      "Worksheets take a long time to write and seconds to forward. So files are never handed out as public links. Each copy is stamped for the person who bought it and read in a protected reader, similar to how creator platforms protect paid posts.",
    ctaDemo: "See a stamped sample",
    ctaHow: "How it works",
    flow: {
      title: "From payment to the page you read",
      label: "Diagram: the path a file takes from storage to your screen",
      steps: [
        {
          title: "Kept private",
          body: "The original PDF sits in private storage. It has no public URL, so there is no link to share.",
        },
        {
          title: "Stamped for you",
          body: "When you open it, the server makes a new copy with your name, part of your email and your order number on every page.",
        },
        {
          title: "Short-lived pass",
          body: "Your browser gets a signed read token that expires after 10 minutes. An old or copied link stops working.",
        },
        {
          title: "Protected reader",
          body: "The copy opens in the reader inside your library, on at most 2 devices per purchase.",
        },
      ],
    },
    measures: {
      title: "What the reader does",
      items: [
        {
          title: "A stamp on every page",
          body: "Name, masked email and order number are written into the file on the server, plus an invisible per-order mark. The original bytes are never sent.",
        },
        {
          title: "A live watermark on screen",
          body: "Over the page, the reader shows your name with the current date and time, updated while you read.",
        },
        {
          title: "Tokens that expire",
          body: "Each read pass is signed and lasts 10 minutes, then the reader asks for a fresh one.",
        },
        {
          title: "Two devices per purchase",
          body: "A purchase can be opened on 2 devices. A third device is refused.",
        },
        {
          title: "Copy, save and print turned off",
          body: "Right-click, text selection and the save and print shortcuts are blocked. If the page is sent to a printer anyway, print styles hide it.",
        },
        {
          title: "Pauses in the background",
          body: "When the reader window loses focus, the pages blur until you come back.",
        },
      ],
    },
    limits: {
      title: "What no website can stop",
      body: [
        "A browser cannot block screenshots, screen recording or a phone camera pointed at the screen. Any shop that says otherwise is overstating it.",
        "That is why the stamp matters most. A photo or screenshot of a page still shows the buyer's name and order number, so a leaked copy can be traced back to the purchase it came from.",
      ],
    },
    demo: {
      eyebrow: "Live demo",
      title: "What a stamped page looks like",
      body: "On the left is a mock of a page as a buyer sees it. The button opens a real sample file stamped on the server just now for a demo buyer.",
      button: "Open the stamped sample",
      newTab: "opens in a new tab",
      note: "The sample opens in your browser's own PDF viewer so you can inspect the stamp. Purchased files open only in the protected reader.",
      mockLabel: "Mock of a stamped worksheet page",
      mock: {
        subject: "Mathematics, grade 4",
        heading: "Fractions practice",
        name: "Name:",
        cls: "Class:",
        questions: [
          "1. Write 3/4 as a decimal.",
          "2. Which is larger, 2/3 or 3/5?",
          "3. Add 1/4 and 2/4.",
          "4. Shade 5/8 of the rectangle.",
          "5. Simplify 6/9.",
        ],
        buyer: "Demo Buyer",
        email: "d***@e***.com",
        order: "NNG-DEMO-0001",
        licensed: "Licensed to",
        orderLabel: "Order",
      },
      legend: [
        { key: "diagonal", text: "Diagonal mark: order number and name, repeated across the page" },
        { key: "footer", text: "Footer: name, masked email and order number" },
        { key: "live", text: "Live watermark: name with date and time, drawn by the reader" },
      ],
    },
    closing: {
      title: "Questions about a copy you bought?",
      body: "Read the help page or send a DM to @nngstoreofficial on Instagram.",
      help: "Read the help page",
      refunds: "Refund policy",
    },
  },
  id: {
    meta: {
      title: "Cara file dilindungi",
      description:
        "Setiap file NNG Store dibubuhi nama pembeli dan nomor pesanan, lalu dibaca di pembaca terlindungi dalam browser. Apa yang bisa dicegah, dan apa yang tidak bisa dicegah situs mana pun.",
    },
    eyebrow: "Perlindungan file",
    title: "Setiap salinan membawa nama pembelinya",
    intro:
      "Menyusun lembar soal butuh waktu lama, menyebarkannya cuma beberapa detik. Karena itu file tidak pernah dibagikan sebagai tautan publik. Setiap salinan dicap untuk orang yang membelinya dan dibaca di pembaca terlindungi, mirip cara platform kreator melindungi konten berbayar.",
    ctaDemo: "Lihat contoh yang sudah dicap",
    ctaHow: "Cara kerjanya",
    flow: {
      title: "Dari pembayaran sampai halaman yang kamu baca",
      label: "Diagram: perjalanan file dari penyimpanan ke layarmu",
      steps: [
        {
          title: "Disimpan tertutup",
          body: "PDF asli ada di penyimpanan privat. Tidak ada URL publik, jadi tidak ada tautan yang bisa dibagikan.",
        },
        {
          title: "Dicap untukmu",
          body: "Saat kamu membukanya, server membuat salinan baru dengan nama, sebagian email, dan nomor pesananmu di setiap halaman.",
        },
        {
          title: "Izin baca singkat",
          body: "Browser-mu menerima token baca bertanda tangan yang kedaluwarsa setelah 10 menit. Tautan lama atau hasil salinan tidak akan jalan.",
        },
        {
          title: "Pembaca terlindungi",
          body: "Salinan dibuka di pembaca dalam koleksimu, di maksimal 2 perangkat per pembelian.",
        },
      ],
    },
    measures: {
      title: "Yang dilakukan pembaca",
      items: [
        {
          title: "Cap di setiap halaman",
          body: "Nama, email yang disamarkan, dan nomor pesanan ditulis ke dalam file di server, ditambah tanda tak terlihat per pesanan. Berkas aslinya tidak pernah dikirim.",
        },
        {
          title: "Tanda air langsung di layar",
          body: "Di atas halaman, pembaca menampilkan namamu beserta tanggal dan jam saat ini, diperbarui selama kamu membaca.",
        },
        {
          title: "Token yang kedaluwarsa",
          body: "Setiap izin baca bertanda tangan dan berlaku 10 menit, lalu pembaca meminta izin baru.",
        },
        {
          title: "Dua perangkat per pembelian",
          body: "Satu pembelian bisa dibuka di 2 perangkat. Perangkat ketiga ditolak.",
        },
        {
          title: "Salin, simpan, dan cetak dimatikan",
          body: "Klik kanan, memilih teks, serta pintasan simpan dan cetak diblokir. Kalau halaman tetap dikirim ke printer, gaya cetak menyembunyikannya.",
        },
        {
          title: "Berhenti saat di latar belakang",
          body: "Saat jendela pembaca tidak aktif, halaman diburamkan sampai kamu kembali.",
        },
      ],
    },
    limits: {
      title: "Yang tidak bisa dicegah situs mana pun",
      body: [
        "Browser tidak bisa memblokir tangkapan layar, rekaman layar, atau kamera HP yang diarahkan ke layar. Toko yang mengaku bisa sedang melebih-lebihkan.",
        "Karena itulah cap paling penting. Foto atau tangkapan layar sebuah halaman tetap memperlihatkan nama pembeli dan nomor pesanan, jadi salinan yang bocor bisa dilacak ke pembelian asalnya.",
      ],
    },
    demo: {
      eyebrow: "Demo langsung",
      title: "Seperti apa halaman yang sudah dicap",
      body: "Di sebelah kiri ada tiruan halaman seperti yang dilihat pembeli. Tombolnya membuka file contoh asli yang baru saja dicap di server untuk pembeli demo.",
      button: "Buka contoh yang sudah dicap",
      newTab: "terbuka di tab baru",
      note: "Contoh ini terbuka di penampil PDF bawaan browser supaya kamu bisa memeriksa capnya. File yang dibeli hanya terbuka di pembaca terlindungi.",
      mockLabel: "Tiruan halaman lembar soal yang sudah dicap",
      mock: {
        subject: "Matematika, kelas 4",
        heading: "Latihan pecahan",
        name: "Nama:",
        cls: "Kelas:",
        questions: [
          "1. Tulis 3/4 dalam bentuk desimal.",
          "2. Mana yang lebih besar, 2/3 atau 3/5?",
          "3. Jumlahkan 1/4 dan 2/4.",
          "4. Arsir 5/8 bagian persegi panjang.",
          "5. Sederhanakan 6/9.",
        ],
        buyer: "Demo Buyer",
        email: "d***@e***.com",
        order: "NNG-DEMO-0001",
        licensed: "Licensed to",
        orderLabel: "Order",
      },
      legend: [
        { key: "diagonal", text: "Tanda diagonal: nomor pesanan dan nama, diulang di seluruh halaman" },
        { key: "footer", text: "Kaki halaman: nama, email yang disamarkan, dan nomor pesanan" },
        { key: "live", text: "Tanda air langsung: nama beserta tanggal dan jam, digambar oleh pembaca" },
      ],
    },
    closing: {
      title: "Ada pertanyaan soal salinan yang kamu beli?",
      body: "Baca halaman bantuan atau kirim DM ke @nngstoreofficial di Instagram.",
      help: "Baca halaman bantuan",
      refunds: "Kebijakan pengembalian dana",
    },
  },
});
