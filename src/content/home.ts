import { defineCopy } from "./copy";

/**
 * Home page copy. Every number is passed in from the catalog at build time;
 * nothing here is typed by hand.
 */
export const homeCopy = defineCopy({
  en: {
    meta: {
      title: "Worksheets and answer keys for SD and SMP",
      description: (files: number, subjects: number) =>
        `${files} PDF files across ${subjects} subjects: practice sets, answer keys with explanations and complete exam packs. Pay through Midtrans and read in your library right after payment.`,
    },
    hero: {
      eyebrow: (files: number) => `${files} worksheet files for SD and SMP`,
      headline: "School worksheets and answer keys, sorted by subject and type.",
      sub: (subjects: number, questions: string) =>
        `Practice sets, answer keys and full exam packs across ${subjects} subjects, ${questions} questions in all. Preview the first pages, pay once, and the file opens in your library.`,
      searchLabel: "Search the shop",
      searchPlaceholder: "Try “HOTS English” or “PKn key”",
      searchSubmit: "Search",
      searchHint: "Press / anywhere to search",
      primary: "Browse the shop",
      secondary: "See how files are protected",
      stackLabel: "Featured files. Select the top page or use the arrow keys to see the next one.",
      next: "Show next file",
      prev: "Show previous file",
      open: "Open",
      position: "{i} of {n}",
    },
    stats: {
      label: "The catalog in numbers",
      files: "PDF files",
      subjects: "subjects",
      questions: "questions in total",
      bundles: "bundles",
      pay: "Pay with QRIS, e-wallets, cards or bank transfer through Midtrans",
      read: "Read right after payment",
    },
    subjects: {
      eyebrow: "Browse by subject",
      title: "Find the subject, then pick the format.",
      body: "Each subject comes in several formats: question sets, answer keys and packs that hold both.",
      files: (n: number) => (n === 1 ? "1 file" : `${n} files`),
      from: (price: string) => `from ${price}`,
    },
    series: {
      eyebrow: "Browse by type",
      title: "Know what is inside before you open it.",
      body: "Every file belongs to one series. The columns show whether a file holds questions, answers, written explanations or all three.",
      cols: { name: "Series", questions: "Questions", answers: "Answers", explanations: "Explanations", files: "Files" },
      yes: "Included",
      no: "Not included",
      families: {
        big: "1,000-question sets",
        mc: "Multiple choice, 100 questions",
        hots: "HOTS, 100 questions",
        exam: "Exam and assessment, 100 questions",
      },
      files: (n: number) => (n === 1 ? "1 file" : `${n} files`),
      from: (price: string) => `from ${price}`,
    },
    featured: {
      eyebrow: "Featured",
      title: "A file from each of eight series.",
      viewAll: "View all files",
    },
    inside: {
      eyebrow: "Look inside",
      title: "See the pages before you pay.",
      body: "Every file shows its first pages right on the product page, watermarked and at reading size, so you can check the layout, the level and the kind of questions.",
      ruleSharp: (n: number) => `Pages 1 to ${n} are shown in full, later preview pages are blurred.`,
      ruleKey: "Answers are blurred in the preview.",
      facts: {
        questions: "questions",
        pages: "pages in the file",
        size: "file size",
        level: "level",
      },
      page: (i: number, n: number) => `Preview page ${i} of ${n}`,
      prev: "Previous page",
      next: "Next page",
      thumbs: "Preview pages",
      thumb: (i: number) => `Show preview page ${i}`,
      cta: "Open this file",
      viewerLabel: (title: string) => `Preview of ${title}`,
    },
    how: {
      eyebrow: "How it works",
      title: "Three steps, no account to set up first.",
      steps: [
        {
          title: "Choose",
          body: "Pick single files or a bundle. Each product page lists the question count, page count and file size.",
        },
        {
          title: "Pay with Midtrans",
          body: "Pay with QRIS, e-wallets, cards or bank transfer through Midtrans. The total is shown in rupiah before you confirm.",
        },
        {
          title: "Read in your library",
          body: "The file opens in your library right after payment, on a phone, tablet or laptop browser.",
        },
      ],
    },
    bundles: {
      eyebrow: "Bundles",
      title: "Buy a whole subject or a whole series at once.",
      body: "A bundle costs less than its files bought one by one. The saving below is the real difference.",
      save: (amount: string) => `Save ${amount} compared to buying each file`,
      files: (n: number) => `${n} files`,
      viewAll: "View all bundles",
      open: "View bundle",
    },
    faq: {
      eyebrow: "Questions",
      title: "Before you buy.",
      body: "Something not covered here? Send a DM on Instagram.",
      more: "All questions and answers",
      items: [
        {
          q: "What do I get after paying?",
          a: "The files you bought appear in your library as soon as Midtrans confirms the payment. Each one opens in the reader on this site.",
        },
        {
          q: "Can I download the PDF?",
          a: "Not in this version. Files open in the reader in your library, which you can come back to at any time. Each page carries a watermark with the buyer's details.",
        },
        {
          q: "Which devices can I read on?",
          a: "Any phone, tablet or laptop with a current browser. Nothing needs to be installed.",
        },
        {
          q: "How do I pay?",
          a: "Pay with QRIS, e-wallets, cards or bank transfer through Midtrans. Prices are in rupiah and the total is shown before you confirm.",
        },
        {
          q: "Can I get a refund?",
          a: "Yes, within 48 hours, when a file is broken, the wrong file was delivered, you paid and nothing arrived within 2 hours, or you were charged twice. The refund policy has the details.",
        },
        {
          q: "Do I get a receipt or invoice?",
          a: "Your order is tied to the email you enter at checkout. If a school needs a formal invoice, send the order number by Instagram DM.",
        },
        {
          q: "Can a school or a teacher buy for a class?",
          a: "Yes. For several teachers or a purchase that needs paperwork, message us on Instagram before paying so we can agree on the details.",
        },
        {
          q: "How do I contact you?",
          a: "Send a DM to @nngstoreofficial on Instagram. There is no phone line or email inbox yet.",
        },
      ],
    },
    closing: {
      title: (files: number, subjects: number) => `${files} files, ${subjects} subjects, one checkout.`,
      body: "Preview any file first. It opens in your library right after payment.",
      cta: "Browse the shop",
      bundles: "See bundles",
    },
  },
  id: {
    meta: {
      title: "Lembar soal dan kunci jawaban untuk SD dan SMP",
      description: (files: number, subjects: number) =>
        `${files} file PDF untuk ${subjects} mata pelajaran: latihan soal, kunci jawaban dengan pembahasan, dan paket ujian lengkap. Bayar lewat Midtrans dan baca di koleksi kamu begitu pembayaran selesai.`,
    },
    hero: {
      eyebrow: (files: number) => `${files} file lembar soal untuk SD dan SMP`,
      headline: "Lembar soal dan kunci jawaban, rapi per mata pelajaran.",
      sub: (subjects: number, questions: string) =>
        `Latihan soal, kunci jawaban, dan paket ujian lengkap untuk ${subjects} mata pelajaran, total ${questions} soal. Lihat halaman awalnya dulu, bayar sekali, lalu file langsung terbuka di koleksi kamu.`,
      searchLabel: "Cari di toko",
      searchPlaceholder: "Coba “HOTS inggris” atau “kunci PKn”",
      searchSubmit: "Cari",
      searchHint: "Tekan / di mana saja untuk mencari",
      primary: "Lihat toko",
      secondary: "Lihat cara file dilindungi",
      stackLabel: "File pilihan. Pilih halaman paling atas atau pakai tombol panah untuk melihat file berikutnya.",
      next: "Tampilkan file berikutnya",
      prev: "Tampilkan file sebelumnya",
      open: "Buka",
      position: "{i} dari {n}",
    },
    stats: {
      label: "Isi toko dalam angka",
      files: "file PDF",
      subjects: "mata pelajaran",
      questions: "soal seluruhnya",
      bundles: "paket hemat",
      pay: "Bayar pakai QRIS, e-wallet, kartu, atau transfer bank lewat Midtrans",
      read: "Langsung bisa dibaca setelah bayar",
    },
    subjects: {
      eyebrow: "Pilih mata pelajaran",
      title: "Cari mata pelajarannya, lalu pilih jenisnya.",
      body: "Setiap mata pelajaran punya beberapa jenis file: kumpulan soal, kunci jawaban, dan paket yang berisi keduanya.",
      files: (n: number) => `${n} file`,
      from: (price: string) => `mulai ${price}`,
    },
    series: {
      eyebrow: "Pilih jenis file",
      title: "Tahu isinya sebelum kamu buka.",
      body: "Setiap file masuk ke satu seri. Kolom di bawah menunjukkan apakah file berisi soal, jawaban, pembahasan tertulis, atau ketiganya.",
      cols: { name: "Seri", questions: "Soal", answers: "Jawaban", explanations: "Pembahasan", files: "File" },
      yes: "Ada",
      no: "Tidak ada",
      families: {
        big: "Set 1.000 soal",
        mc: "Pilihan ganda, 100 soal",
        hots: "HOTS, 100 soal",
        exam: "Ujian dan asesmen, 100 soal",
      },
      files: (n: number) => `${n} file`,
      from: (price: string) => `mulai ${price}`,
    },
    featured: {
      eyebrow: "Pilihan",
      title: "Satu file dari delapan seri berbeda.",
      viewAll: "Lihat semua file",
    },
    inside: {
      eyebrow: "Lihat isinya",
      title: "Lihat halamannya sebelum membayar.",
      body: "Setiap file menampilkan halaman awalnya langsung di halaman produk, dengan watermark dan ukuran yang enak dibaca, jadi kamu bisa cek tata letak, jenjang, dan bentuk soalnya.",
      ruleSharp: (n: number) => `Halaman 1 sampai ${n} tampil utuh, halaman contoh berikutnya diburamkan.`,
      ruleKey: "Jawaban diburamkan di halaman contoh.",
      facts: {
        questions: "soal",
        pages: "halaman di file",
        size: "ukuran file",
        level: "jenjang",
      },
      page: (i: number, n: number) => `Halaman contoh ${i} dari ${n}`,
      prev: "Halaman sebelumnya",
      next: "Halaman berikutnya",
      thumbs: "Halaman contoh",
      thumb: (i: number) => `Tampilkan halaman contoh ${i}`,
      cta: "Buka file ini",
      viewerLabel: (title: string) => `Contoh halaman ${title}`,
    },
    how: {
      eyebrow: "Cara belanja",
      title: "Tiga langkah, tanpa perlu bikin akun dulu.",
      steps: [
        {
          title: "Pilih",
          body: "Pilih file satuan atau paket hemat. Setiap halaman produk mencantumkan jumlah soal, jumlah halaman, dan ukuran file.",
        },
        {
          title: "Bayar lewat Midtrans",
          body: "Bayar pakai QRIS, e-wallet, kartu, atau transfer bank lewat Midtrans. Totalnya dalam rupiah dan tampil sebelum kamu konfirmasi.",
        },
        {
          title: "Baca di koleksi kamu",
          body: "File langsung terbuka di koleksi kamu setelah pembayaran, lewat browser di HP, tablet, atau laptop.",
        },
      ],
    },
    bundles: {
      eyebrow: "Paket hemat",
      title: "Ambil satu mata pelajaran atau satu seri sekaligus.",
      body: "Harga paket lebih murah daripada membeli filenya satu per satu. Angka hemat di bawah adalah selisih sebenarnya.",
      save: (amount: string) => `Hemat ${amount} dibanding beli satu per satu`,
      files: (n: number) => `${n} file`,
      viewAll: "Lihat semua paket",
      open: "Lihat paket",
    },
    faq: {
      eyebrow: "Tanya jawab",
      title: "Sebelum kamu membeli.",
      body: "Pertanyaanmu belum ada di sini? Kirim DM lewat Instagram.",
      more: "Semua tanya jawab",
      items: [
        {
          q: "Apa yang saya dapat setelah membayar?",
          a: "File yang kamu beli langsung muncul di koleksi kamu begitu Midtrans mengonfirmasi pembayaran. Setiap file dibuka lewat pembaca di situs ini.",
        },
        {
          q: "Apakah PDF-nya bisa diunduh?",
          a: "Belum untuk versi ini. File dibuka di pembaca dalam koleksi kamu, dan bisa kamu buka lagi kapan saja. Setiap halaman diberi watermark berisi data pembeli.",
        },
        {
          q: "Bisa dibaca di perangkat apa saja?",
          a: "HP, tablet, atau laptop apa pun dengan browser versi terbaru. Tidak perlu memasang aplikasi.",
        },
        {
          q: "Bayarnya pakai apa?",
          a: "Bayar pakai QRIS, e-wallet, kartu, atau transfer bank lewat Midtrans. Harga dalam rupiah dan totalnya tampil sebelum kamu konfirmasi.",
        },
        {
          q: "Apakah uang bisa dikembalikan?",
          a: "Bisa, dalam 48 jam, kalau file rusak, file yang dikirim salah, kamu sudah bayar tapi file tidak muncul dalam 2 jam, atau tertagih dua kali. Rinciannya ada di kebijakan pengembalian dana.",
        },
        {
          q: "Apakah ada bukti bayar atau invoice?",
          a: "Pesananmu tercatat atas email yang kamu isi saat checkout. Kalau sekolah butuh invoice resmi, kirim nomor pesanan lewat DM Instagram.",
        },
        {
          q: "Bisakah sekolah atau guru membeli untuk satu kelas?",
          a: "Bisa. Untuk beberapa guru sekaligus atau pembelian yang butuh dokumen, kirim pesan lewat Instagram sebelum membayar supaya rinciannya bisa disepakati.",
        },
        {
          q: "Bagaimana cara menghubungi NNG Store?",
          a: "Kirim DM ke @nngstoreofficial di Instagram. Saat ini belum ada nomor telepon atau email.",
        },
      ],
    },
    closing: {
      title: (files: number, subjects: number) => `${files} file, ${subjects} mata pelajaran, satu kali bayar.`,
      body: "Lihat contoh halamannya dulu. File langsung terbuka di koleksi kamu setelah pembayaran.",
      cta: "Lihat toko",
      bundles: "Lihat paket hemat",
    },
  },
});
