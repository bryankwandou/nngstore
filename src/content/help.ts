import { defineCopy } from "./copy";

/**
 * Help page. Answers use a tiny inline link syntax rendered by
 * src/views/pages/rich.tsx: [label](target), where target is a route key
 * (shop, refunds, protection...), "ig" for the Instagram profile, or "demo"
 * for the stamped sample. A string is a paragraph; an array is a bullet list.
 */
export const helpCopy = defineCopy({
  en: {
    meta: {
      title: "Help",
      description:
        "Answers about buying worksheets at NNG Store, reading them in your library, how files are protected, refunds and how to reach us.",
    },
    eyebrow: "Help",
    title: "Questions and answers",
    intro:
      "Short answers about buying, reading and refunds. If yours is not here, send a DM to @nngstoreofficial on Instagram.",
    jumpLabel: "Jump to a topic",
    groups: [
      {
        id: "buying",
        title: "Buying",
        items: [
          {
            q: "How do I buy a worksheet?",
            a: [
              "Add one or more files to your cart, go to checkout and enter your email and name. WhatsApp is optional. You then pay through Midtrans, and the files appear in [My library](library) as soon as the payment is confirmed.",
            ],
          },
          {
            q: "Which payment methods can I use?",
            a: [
              "Payment runs through Midtrans, which shows the methods available for your order, such as QRIS, e-wallets and bank transfer. NNG Store never sees your card or bank details.",
            ],
          },
          {
            q: "Do I need an account?",
            a: [
              "No. Checkout asks only for an email address and a name. They are used to deliver your purchase and are printed on your copy of the file.",
            ],
          },
          {
            q: "What can I see before I pay?",
            a: [
              "Every product page shows preview pages of the real file, the number of questions, the page count and the file size. The preview rule is written under the pages, for example which page is blurred.",
            ],
          },
          {
            q: "Are bundles cheaper than single files?",
            a: [
              "Yes. Each bundle page shows the bundle price next to the total of the files inside it, so you can see the saving before you add it. See [all bundles](bundles).",
            ],
          },
        ],
      },
      {
        id: "reading",
        title: "Reading your files",
        items: [
          {
            q: "Where do my files go after payment?",
            a: [
              "To [My library](library) in the browser you paid with. Open a file there and it loads in the reader on the same page.",
            ],
          },
          {
            q: "Can I download the PDF?",
            a: [
              "No. Files are read in the browser reader and are never offered as a download link. This is how each copy stays tied to its buyer. [How files are protected](protection) explains the details.",
            ],
          },
          {
            q: "Can I print the worksheets?",
            a: [
              "Not from the reader. Print shortcuts are turned off and the page hides itself when sent to a printer. If printing matters for how you plan to use a file, ask us on [Instagram](ig) before you buy.",
            ],
          },
          {
            q: "How many devices can I use?",
            a: [
              "Each purchase opens on up to 2 devices. A third device is refused. If you replaced a phone or laptop and hit the limit, send us your order number on Instagram.",
            ],
          },
          {
            q: "Why did the page go blurry?",
            a: [
              "The reader pauses when its window loses focus, for example when you switch apps. Click the page to keep reading.",
            ],
          },
          {
            q: "My library is empty on this browser. What happened?",
            a: [
              "Your library is kept in this browser. If you cleared browser data, used a private window or changed device, send a DM with your order number and the email you paid with, and we will help you get back in.",
            ],
          },
        ],
      },
      {
        id: "protection",
        title: "Protection",
        items: [
          {
            q: "Why is my name on every page?",
            a: [
              "Each copy is stamped with the buyer's name, part of the email address and the order number when it is opened. If a copy is shared without permission, the stamp shows where it came from.",
            ],
          },
          {
            q: "Can someone take a screenshot?",
            a: [
              "A browser cannot block screenshots or a phone camera, so we do not claim it can. The watermark is there so that a leaked copy can be traced to its buyer.",
            ],
          },
          {
            q: "Can I see what a stamped page looks like?",
            a: [
              "Yes. The [protection page](protection) has a sample page and a link to a stamped sample file made for a demo buyer.",
            ],
          },
        ],
      },
      {
        id: "refunds",
        title: "Refunds",
        items: [
          {
            q: "Can I get my money back?",
            a: [
              "Within 48 hours of payment, we refund these cases:",
              [
                "the file will not open",
                "you received the wrong file",
                "you were charged twice for the same order",
                "the file is materially different from its preview",
              ],
              "The full rules are in the [refund policy](refunds).",
            ],
          },
          {
            q: "How do I ask for a refund?",
            a: [
              "Send a DM to @nngstoreofficial on Instagram with your order number, the email you used at checkout and a short note or screenshot of the problem.",
            ],
          },
          {
            q: "Can I return a file I no longer need?",
            a: [
              "A digital copy cannot be handed back once it has been opened, so a change of mind is not refunded. Check the preview pages and the product details before you pay.",
            ],
          },
        ],
      },
    ],
    contact: {
      title: "Still need help?",
      body: "NNG Store answers questions through Instagram direct messages. Include your order number if your question is about a purchase.",
      button: "Message @nngstoreofficial",
      note: "There is no email address or WhatsApp number for support yet.",
    },
  },
  id: {
    meta: {
      title: "Bantuan",
      description:
        "Jawaban seputar membeli lembar soal di NNG Store, membacanya di koleksi, cara file dilindungi, pengembalian dana, dan cara menghubungi kami.",
    },
    eyebrow: "Bantuan",
    title: "Tanya jawab",
    intro:
      "Jawaban singkat soal membeli, membaca, dan pengembalian dana. Kalau pertanyaanmu belum ada, kirim DM ke @nngstoreofficial di Instagram.",
    jumpLabel: "Pilih topik",
    groups: [
      {
        id: "buying",
        title: "Membeli",
        items: [
          {
            q: "Bagaimana cara membeli lembar soal?",
            a: [
              "Masukkan satu atau beberapa file ke keranjang, lanjut ke pembayaran, lalu isi email dan nama. WhatsApp boleh dikosongkan. Kamu membayar lewat Midtrans, dan file langsung muncul di [Koleksi saya](library) begitu pembayaran terkonfirmasi.",
            ],
          },
          {
            q: "Metode pembayaran apa saja yang bisa dipakai?",
            a: [
              "Pembayaran diproses Midtrans, yang menampilkan metode yang tersedia untuk pesananmu, misalnya QRIS, dompet digital, dan transfer bank. NNG Store tidak pernah melihat data kartu atau rekeningmu.",
            ],
          },
          {
            q: "Perlu bikin akun?",
            a: [
              "Tidak. Saat membayar kamu cukup mengisi email dan nama. Keduanya dipakai untuk mengirim pembelianmu dan dicetak di salinan file milikmu.",
            ],
          },
          {
            q: "Apa yang bisa dilihat sebelum membayar?",
            a: [
              "Setiap halaman produk menampilkan halaman contoh dari file aslinya, jumlah soal, jumlah halaman, dan ukuran file. Aturan pratinjau tertulis di bawah gambar, misalnya halaman mana yang diburamkan.",
            ],
          },
          {
            q: "Apakah paket lebih murah daripada beli satuan?",
            a: [
              "Ya. Setiap halaman paket menampilkan harga paket di samping total harga file di dalamnya, jadi hematnya terlihat sebelum kamu membeli. Lihat [semua paket](bundles).",
            ],
          },
        ],
      },
      {
        id: "reading",
        title: "Membaca file",
        items: [
          {
            q: "Ke mana file setelah dibayar?",
            a: [
              "Ke [Koleksi saya](library) di browser yang kamu pakai saat membayar. Buka file dari sana dan file langsung tampil di pembaca pada halaman yang sama.",
            ],
          },
          {
            q: "Bisakah PDF-nya diunduh?",
            a: [
              "Tidak. File dibaca di pembaca dalam browser dan tidak pernah diberikan sebagai tautan unduhan. Dengan cara ini setiap salinan tetap terikat ke pembelinya. Rinciannya ada di [Cara file dilindungi](protection).",
            ],
          },
          {
            q: "Bisakah lembar soalnya dicetak?",
            a: [
              "Tidak dari pembaca. Pintasan cetak dimatikan dan halaman menyembunyikan dirinya saat dikirim ke printer. Kalau kamu perlu mencetak, tanyakan dulu lewat [Instagram](ig) sebelum membeli.",
            ],
          },
          {
            q: "Bisa dibuka di berapa perangkat?",
            a: [
              "Setiap pembelian bisa dibuka di maksimal 2 perangkat. Perangkat ketiga akan ditolak. Kalau kamu baru ganti HP atau laptop lalu terkena batas ini, kirim nomor pesananmu lewat Instagram.",
            ],
          },
          {
            q: "Kenapa halamannya tiba-tiba buram?",
            a: [
              "Pembaca berhenti sementara saat jendelanya tidak aktif, misalnya ketika kamu pindah aplikasi. Klik halamannya untuk lanjut membaca.",
            ],
          },
          {
            q: "Koleksiku kosong di browser ini. Kenapa?",
            a: [
              "Koleksi disimpan di browser ini. Kalau data browser dihapus, kamu memakai jendela penyamaran, atau ganti perangkat, kirim DM berisi nomor pesanan dan email yang dipakai saat membayar. Kami bantu kamu masuk lagi.",
            ],
          },
        ],
      },
      {
        id: "protection",
        title: "Perlindungan",
        items: [
          {
            q: "Kenapa namaku ada di setiap halaman?",
            a: [
              "Setiap salinan dibubuhi nama pembeli, sebagian alamat email, dan nomor pesanan saat dibuka. Kalau salinan itu disebarkan tanpa izin, cap tersebut menunjukkan asalnya.",
            ],
          },
          {
            q: "Bisakah orang mengambil tangkapan layar?",
            a: [
              "Browser tidak bisa memblokir tangkapan layar atau kamera HP, jadi kami tidak mengklaim bisa. Tanda air dipasang supaya salinan yang bocor bisa dilacak ke pembelinya.",
            ],
          },
          {
            q: "Bisakah aku melihat contoh halaman yang sudah dicap?",
            a: [
              "Bisa. Di [halaman perlindungan](protection) ada contoh halaman dan tautan ke file contoh yang dicap untuk pembeli demo.",
            ],
          },
        ],
      },
      {
        id: "refunds",
        title: "Pengembalian dana",
        items: [
          {
            q: "Bisakah uangku dikembalikan?",
            a: [
              "Dalam 48 jam setelah pembayaran, kami mengembalikan dana untuk kasus berikut:",
              [
                "file tidak bisa dibuka",
                "file yang kamu terima salah",
                "kamu tertagih dua kali untuk pesanan yang sama",
                "isi file jauh berbeda dari pratinjaunya",
              ],
              "Aturan lengkapnya ada di [kebijakan pengembalian dana](refunds).",
            ],
          },
          {
            q: "Bagaimana cara mengajukan pengembalian dana?",
            a: [
              "Kirim DM ke @nngstoreofficial di Instagram berisi nomor pesanan, email yang dipakai saat membayar, dan catatan singkat atau tangkapan layar masalahnya.",
            ],
          },
          {
            q: "Bisakah file yang tidak jadi dipakai dikembalikan?",
            a: [
              "Salinan digital tidak bisa diserahkan kembali setelah dibuka, jadi berubah pikiran tidak termasuk alasan pengembalian dana. Periksa halaman contoh dan detail produk sebelum membayar.",
            ],
          },
        ],
      },
    ],
    contact: {
      title: "Masih butuh bantuan?",
      body: "NNG Store menjawab pertanyaan lewat DM Instagram. Sertakan nomor pesanan kalau pertanyaanmu soal pembelian.",
      button: "Kirim DM ke @nngstoreofficial",
      note: "Saat ini belum ada alamat email atau nomor WhatsApp untuk layanan pelanggan.",
    },
  },
});
