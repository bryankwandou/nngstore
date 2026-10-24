"""Build src/data/catalog.json from the source PDFs' metadata (data/source-catalog.json) and taxonomy.
No PDF is opened here; page counts and byte sizes come from the earlier pass."""
import json, os, sys, datetime, collections
sys.path.insert(0, os.path.dirname(__file__))
from taxonomy import parse, make_slug
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def n_en(n): return f"{n:,}"
def n_id(n): return f"{n:,}".replace(",", ".")

# id: (en title, id title, contains, price, popularity weight, blurb en, blurb id)
SERIES = {
 "worksheet-1000": ("1,000-Question Worksheet", "Lembar Latihan 1.000 Soal", ["questions"], 29000, 9,
   "Large question sets for steady practice over weeks. Questions only; pair with the answer key.",
   "Kumpulan soal besar untuk latihan rutin selama berminggu-minggu. Hanya soal; pasangkan dengan kunci jawabannya."),
 "answer-key-1000": ("1,000-Question Answer Key", "Kunci Jawaban 1.000 Soal", ["answers"], 29000, 6,
   "Answers only, for marking the 1,000-question worksheets.",
   "Hanya jawaban, untuk memeriksa lembar latihan 1.000 soal."),
 "pack-1000": ("1,000-Question Pack with Key", "Paket 1.000 Soal dengan Kunci", ["questions", "answers"], 49000, 8,
   "One file holding 1,000 questions and their answers, so nothing has to be matched up.",
   "Satu berkas berisi 1.000 soal beserta jawabannya, jadi tidak perlu dicocokkan lagi."),
 "mc-practice-100": ("100 Multiple-Choice Questions", "100 Soal Pilihan Ganda", ["questions"], 9000, 8,
   "Short A-to-D practice sets, quick to print and quick to mark.",
   "Latihan pilihan ganda A sampai D yang singkat, mudah dicetak dan mudah diperiksa."),
 "mc-key-100": ("Multiple-Choice Key with Explanations", "Kunci Pilihan Ganda dengan Pembahasan", ["answers", "explanations"], 15000, 6,
   "Answers and short explanations for the 100-question multiple-choice sets.",
   "Jawaban dan pembahasan singkat untuk set pilihan ganda 100 soal."),
 "mc-pack-100": ("Multiple-Choice Pack: Questions, Key, Explanations", "Paket Pilihan Ganda: Soal, Kunci, Pembahasan", ["questions", "answers", "explanations"], 22000, 7,
   "The multiple-choice set and its key in one PDF.",
   "Soal pilihan ganda dan kuncinya dalam satu PDF."),
 "hots-practice-100": ("100 HOTS Questions", "100 Soal HOTS", ["questions"], 12000, 7,
   "Higher-order thinking questions that ask the student to read a situation and reason it through.",
   "Soal berpikir tingkat tinggi yang meminta siswa membaca sebuah situasi lalu bernalar."),
 "hots-key-100": ("HOTS Key with Explanations", "Kunci HOTS dengan Pembahasan", ["answers", "explanations"], 17000, 5,
   "Answers and written reasoning for the 100 HOTS questions.",
   "Jawaban dan penjelasan penalaran untuk 100 soal HOTS."),
 "hots-pack-100": ("HOTS Pack: Questions, Key, Explanations", "Paket HOTS: Soal, Kunci, Pembahasan", ["questions", "answers", "explanations"], 26000, 6,
   "The HOTS questions with the key and explanations in one PDF.",
   "Soal HOTS lengkap dengan kunci dan pembahasan dalam satu PDF."),
 "key-explained-100": ("Answer Key with Explanations", "Kunci Jawaban dan Pembahasan", ["answers", "explanations"], 17000, 8,
   "A 100-answer key where every answer comes with a written explanation.",
   "Kunci 100 jawaban yang setiap jawabannya disertai penjelasan tertulis."),
 "key-exam-100": ("Answer Key with Explanations, Exam Format", "Kunci Jawaban dan Pembahasan, Format Ujian", ["answers", "explanations"], 19000, 6,
   "A fuller key laid out like an assessment document, with explanations.",
   "Kunci yang lebih lengkap dengan tata letak dokumen asesmen, disertai pembahasan."),
 "assessment-100": ("Assessment Worksheet", "Lembar Kerja Asesmen", ["questions", "answers"], 10000, 7,
   "100 multiple-choice questions in an assessment layout. The answer matrix sits on the last page.",
   "100 soal pilihan ganda dengan tata letak asesmen. Matriks jawaban ada di halaman terakhir."),
 "exam-script-100": ("Exam Script", "Naskah Soal Ujian", ["questions"], 11000, 7,
   "A 100-question exam paper for a mock test at home or in class. No key inside.",
   "Naskah ujian 100 soal untuk uji coba di rumah atau di kelas. Tanpa kunci di dalamnya."),
 "pack-exam-100": ("Complete Exam Pack: Questions, Key, Explanations", "Paket Ujian Lengkap: Soal, Kunci, Pembahasan", ["questions", "answers", "explanations"], 29000, 8,
   "The exam questions, the key and the explanations together in one PDF.",
   "Soal ujian, kunci, dan pembahasan sekaligus dalam satu PDF."),
}
SERIES_ORDER = ["worksheet-1000","answer-key-1000","pack-1000","mc-practice-100","mc-key-100","mc-pack-100",
                "hots-practice-100","hots-key-100","hots-pack-100","assessment-100","exam-script-100","key-explained-100","key-exam-100","pack-exam-100"]
assert set(SERIES_ORDER) == set(SERIES)

# subject id: (en, id, category, popularity weight)
SUBJECTS = {
 "islam-theory": ("Islamic Education (Theory)", "Pendidikan Agama Islam (Teori)", "religion", 9),
 "islam-writing": ("Islamic Education (Arabic Writing)", "Pendidikan Agama Islam (Menulis Arab)", "religion", 7),
 "protestant": ("Christian Education (Protestant)", "Pendidikan Agama Kristen", "religion", 7),
 "catholic": ("Catholic Education", "Pendidikan Agama Katolik", "religion", 6),
 "hindu": ("Hindu Education", "Pendidikan Agama Hindu", "religion", 5),
 "buddhist": ("Buddhist Education", "Pendidikan Agama Buddha", "religion", 5),
 "confucian": ("Confucian Education", "Pendidikan Agama Konghucu", "religion", 4),
 "english": ("English", "Bahasa Inggris", "languages", 10),
 "mandarin": ("Mandarin", "Bahasa Mandarin", "languages", 7),
 "japanese": ("Japanese", "Bahasa Jepang", "languages", 7),
 "korean": ("Korean", "Bahasa Korea", "languages", 6),
 "german": ("German", "Bahasa Jerman", "languages", 5),
 "math": ("Mathematics", "Matematika", "science", 10),
 "biology": ("Biology (Natural Science)", "IPA Biologi", "science", 8),
 "chemistry": ("Chemistry", "Kimia", "science", 7),
 "pancasila": ("Pancasila Education", "Pendidikan Pancasila", "civics", 7),
 "ppkn": ("Pancasila and Civic Education (PPKn)", "PPKn", "civics", 7),
 "pkn": ("Civic Education (PKn)", "PKn", "civics", 6),
}
CATEGORIES = [("religion","Religion","Pendidikan Agama"),("languages","Languages","Bahasa"),
              ("science","Science and Mathematics","Sains dan Matematika"),("civics","Civics","Kewarganegaraan")]

LV = {"SD": ("elementary school (SD)", "SD"), "SD-SMP": ("upper SD to lower SMP", "SD kelas atas sampai SMP awal")}

def desc(sid, s_en, s_id, q, p, lv):
    lve, lvi = LV[lv]
    qe, qi = n_en(q), n_id(q)
    D = {
     "worksheet-1000": (f"A {p}-page worksheet of {qe} {s_en} questions, grouped into sections by topic. It holds questions only, so whoever marks it needs the matching answer key. Print a few sections at a time and work through them over several weeks; written for {lve}.",
                        f"Lembar latihan {p} halaman berisi {qi} soal {s_id}, disusun per bagian materi. Isinya hanya soal, jadi yang memeriksa perlu kunci jawaban yang sesuai. Cetak beberapa bagian sekaligus dan kerjakan bertahap selama beberapa minggu; untuk jenjang {lvi}."),
     "answer-key-1000": (f"The answers to all {qe} questions of the {s_en} worksheet, {p} pages, with a score box on the first page. It gives the answer itself, not the reasoning behind it. Keep it for the person who marks and use it with the worksheet for the same subject.",
                         f"Jawaban untuk seluruh {qi} soal lembar latihan {s_id}, {p} halaman, dengan kotak nilai di halaman pertama. Isinya jawaban saja, tanpa uraian cara mengerjakan. Simpan untuk yang memeriksa dan pakai bersama lembar latihan mata pelajaran yang sama."),
     "pack-1000": (f"{qe} {s_en} questions and their answers in one {p}-page PDF: part one is the question set, part two the key. Explanations are not written out. Handy when you want a single file to print and mark; written for {lve}.",
                   f"{qi} soal {s_id} beserta jawabannya dalam satu PDF {p} halaman: bagian pertama soal, bagian kedua kunci. Pembahasan tidak ditulis. Praktis kalau Anda ingin satu berkas untuk dicetak dan diperiksa; untuk jenjang {lvi}."),
     "mc-practice-100": (f"{qe} multiple-choice questions on {s_en}, each with options A to D, {p} pages. Questions only; the key is sold as a separate file. Good for a timed test or a homework set for {lve}.",
                         f"{qi} soal pilihan ganda {s_id} dengan pilihan A sampai D, {p} halaman. Isinya hanya soal; kuncinya dijual terpisah. Cocok untuk tes berwaktu atau PR siswa {lvi}."),
     "mc-key-100": (f"Answers and short explanations for the 100 multiple-choice {s_en} questions, {p} pages. The teacher or parent marks with it, then reads the explanation with the child where an answer was wrong. Made for the matching multiple-choice practice set.",
                    f"Jawaban dan pembahasan singkat untuk 100 soal pilihan ganda {s_id}, {p} halaman. Guru atau orang tua memeriksa dengan kunci ini, lalu membaca pembahasan bersama anak pada jawaban yang salah. Disusun untuk set latihan pilihan ganda yang sesuai."),
     "mc-pack-100": (f"The 100 multiple-choice {s_en} questions, the answer key and the explanations in one {p}-page PDF. Print the question pages for the student and keep the rest for marking. Written for {lve}.",
                     f"100 soal pilihan ganda {s_id}, kunci jawaban, dan pembahasannya dalam satu PDF {p} halaman. Cetak halaman soal untuk siswa dan simpan sisanya untuk memeriksa. Untuk jenjang {lvi}."),
     "hots-practice-100": (f"{qe} higher-order thinking (HOTS) questions on {s_en}, {p} pages. The questions are mostly built around a short passage or situation that the student reads and reasons about. Questions only; the key is a separate file. Written for {lve}.",
                           f"{qi} soal berpikir tingkat tinggi (HOTS) {s_id}, {p} halaman. Soalnya sebagian besar disusun dari wacana atau situasi singkat yang dibaca dan dinalar siswa. Isinya hanya soal; kuncinya berkas terpisah. Untuk jenjang {lvi}."),
     "hots-key-100": (f"Answers and written explanations for the 100 HOTS questions on {s_en}, {p} pages, with a short marking guide at the start. For the teacher or parent who marks and goes over mistakes. Made for the matching HOTS practice set.",
                      f"Jawaban dan pembahasan tertulis untuk 100 soal HOTS {s_id}, {p} halaman, dengan pedoman penilaian singkat di awal. Untuk guru atau orang tua yang memeriksa dan membahas kesalahan. Disusun untuk set latihan HOTS yang sesuai."),
     "hots-pack-100": (f"The 100 HOTS questions on {s_en} together with the answer key and explanations, {p} pages in one PDF. Print the questions for the student and keep the key for yourself. Written for {lve}.",
                       f"100 soal HOTS {s_id} lengkap dengan kunci jawaban dan pembahasan, {p} halaman dalam satu PDF. Cetak soalnya untuk siswa dan simpan kuncinya. Untuk jenjang {lvi}."),
     "key-explained-100": (f"The answer key for a 100-question {s_en} set, {p} pages, with a written explanation for each answer. Use it to mark the work and to talk through mistakes with the student. Written for {lve}.",
                           f"Kunci jawaban set 100 soal {s_id}, {p} halaman, dengan penjelasan tertulis untuk setiap jawaban. Pakai untuk memeriksa pekerjaan dan membahas kesalahan bersama siswa. Untuk jenjang {lvi}."),
     "key-exam-100": (f"Answers and explanations for the 100-question exam set on {s_en}, {p} pages, laid out like an assessment document with a scoring guide. For the teacher or parent who marks. It belongs with the exam script and assessment worksheet of the same subject.",
                      f"Jawaban dan pembahasan untuk set ujian 100 soal {s_id}, {p} halaman, dengan tata letak seperti dokumen asesmen dan pedoman penskoran. Untuk guru atau orang tua yang memeriksa. Dipakai bersama naskah ujian dan lembar asesmen mata pelajaran yang sama."),
     "assessment-100": (f"An assessment worksheet of 100 multiple-choice questions on {s_en}, {p} pages, in the style of a national assessment under the Merdeka curriculum. The answer matrix is on the last page, so take that page out before the student gets the sheet. Written for {lve}.",
                        f"Lembar kerja asesmen {p} halaman berisi 100 soal pilihan ganda {s_id}, bergaya asesmen nasional Kurikulum Merdeka. Matriks jawaban ada di halaman terakhir, jadi lepas halaman itu sebelum lembar diberikan ke siswa. Untuk jenjang {lvi}."),
     "exam-script-100": (f"An exam script with 100 multiple-choice (A to D) questions on {s_en}, {p} pages. Use it for a mock test at home or in class. There is no answer key in the file, so get the exam-format key if you need one.",
                         f"Naskah ujian {p} halaman berisi 100 soal pilihan ganda (A sampai D) {s_id}. Pakai untuk uji coba di rumah atau di kelas. Berkas ini tidak memuat kunci jawaban; kalau perlu, ambil kunci format ujian."),
     "pack-exam-100": (f"Exam questions on {s_en}, the answer key and the explanations in one {p}-page PDF. The student takes the question pages and the marker keeps the rest. A single file for a full mock test and the review after it.",
                       f"Soal ujian {s_id}, kunci jawaban, dan pembahasan dalam satu PDF {p} halaman. Siswa mengerjakan halaman soal dan pemeriksa menyimpan sisanya. Satu berkas untuk uji coba penuh sekaligus pembahasannya."),
    }
    return D[sid]

KIND = {
 "worksheet-1000": ("questions only", "soal saja"), "answer-key-1000": ("answers only", "jawaban saja"),
 "pack-1000": ("questions and key", "soal dan kunci"), "mc-practice-100": ("multiple choice, no key", "pilihan ganda, tanpa kunci"),
 "mc-key-100": ("key with explanations", "kunci dan pembahasan"), "mc-pack-100": ("questions, key, explanations", "soal, kunci, pembahasan"),
 "hots-practice-100": ("HOTS, no key", "HOTS, tanpa kunci"), "hots-key-100": ("key with explanations", "kunci dan pembahasan"),
 "hots-pack-100": ("questions, key, explanations", "soal, kunci, pembahasan"), "key-explained-100": ("key with explanations", "kunci dan pembahasan"),
 "key-exam-100": ("exam-format key, explained", "kunci format ujian, dengan pembahasan"), "assessment-100": ("questions, key on last page", "soal, kunci di halaman akhir"),
 "exam-script-100": ("questions only", "soal saja"), "pack-exam-100": ("questions, key, explanations", "soal, kunci, pembahasan"),
}

def short(sid, q, p, lv):
    k = KIND[sid]
    return (f"{n_en(q)} questions, {p} pages, {lv}: {k[0]}", f"{n_id(q)} soal, {p} halaman, {lv}: {k[1]}")

def main():
    src = json.load(open(os.path.join(ROOT, "data", "source-catalog.json"), encoding="utf-8"))
    products, bad = [], []
    for x in src:
        f = x["file"]
        try:
            sid, sub, lv, q = parse(f)
        except ValueError as e:
            bad.append(str(e)); continue
        lv = lv or "SD-SMP"
        slug = make_slug(sid, sub)
        S = SERIES[sid]; J = SUBJECTS[sub]
        pdir = os.path.join(ROOT, "public", "previews", slug)
        prev = ["/previews/%s/%d.webp" % (slug, n) for n in (1, 2, 3) if os.path.exists(os.path.join(pdir, "%d.webp" % n))]
        cover = "/covers/%s.webp" % slug
        assert os.path.exists(os.path.join(ROOT, "public", cover.lstrip("/"))), slug
        contains = S[2]
        sharp = 0 if ("answers" in contains or "explanations" in contains) else min(2, len(prev))
        de, di = desc(sid, J[0], J[1], q, x["pages"], lv)
        se, si = short(sid, q, x["pages"], lv)
        assert len(se) <= 90 and len(si) <= 90, (se, si)
        products.append({
            "id": slug, "slug": slug, "kind": "product", "sourceFile": f, "series": sid, "subject": sub,
            "category": J[2], "level": lv, "questions": q, "pages": x["pages"], "bytes": x["bytes"],
            "contains": contains,
            "title": {"en": f"{J[0]}: {S[0]}", "id": f"{J[1]}: {S[1]}"},
            "short": {"en": se, "id": si}, "description": {"en": de, "id": di},
            "priceIdr": S[3], "rank": 0, "previewSharp": sharp,
            "images": {"cover": cover, "previews": prev},
        })
    if bad:
        print("UNCLASSIFIED:", *bad, sep="\n"); sys.exit(1)
    assert len(set(p["slug"] for p in products)) == len(products)
    # editorial popularity order (not sales data)
    products.sort(key=lambda p: (-(SERIES[p["series"]][4] * 10 + SUBJECTS[p["subject"]][3]), p["slug"]))
    for i, p in enumerate(products): p["rank"] = i + 1
    products.sort(key=lambda p: (SERIES_ORDER.index(p["series"]), p["slug"]))

    bundles = []
    def mk(slug, te, ti, de, di, items, pct, extra, stack_src):
        total = sum(p["priceIdr"] for p in items)
        price = int(round(total * (1 - pct) / 1000.0)) * 1000
        assert price < total
        off = round((1 - price / total) * 100)
        b = {"id": slug, "slug": slug, "kind": "bundle", "title": {"en": te, "id": ti},
             "short": {"en": f"{len(items)} files, {off}% less than buying one by one",
                       "id": f"{len(items)} berkas, {off}% lebih hemat daripada beli satuan"},
             "description": {"en": de, "id": di}, "items": [p["slug"] for p in items],
             "priceIdr": price, "compareAtIdr": total, "images": {"stack": [p["images"]["cover"] for p in stack_src[:4]]}}
        b.update(extra); bundles.append(b)
    for sub, J in SUBJECTS.items():
        items = [p for p in products if p["subject"] == sub]
        pref = [p for p in items if p["series"] in ("pack-exam-100", "pack-1000", "worksheet-1000", "key-explained-100")]
        mk("bundle-subject-" + sub, f"{J[0]}: Complete Set", f"{J[1]}: Paket Lengkap",
           f"Every {J[0]} file in the shop in one purchase: {len(items)} PDFs, from practice sets and worksheets to answer keys, explanations and exam packs. Buying them together costs about 30% less than one by one. Good for a teacher or a family that wants the whole subject on hand.",
           f"Semua berkas {J[1]} di toko ini dalam satu pembelian: {len(items)} PDF, mulai dari lembar latihan, kunci jawaban, pembahasan, sampai paket ujian. Membeli sekaligus sekitar 30% lebih murah daripada satuan. Cocok untuk guru atau keluarga yang ingin satu mata pelajaran lengkap.",
           items, 0.30, {"subject": sub, "category": J[2]}, pref + [p for p in items if p not in pref])
    for sid in SERIES_ORDER:
        items = [p for p in products if p["series"] == sid]
        S = SERIES[sid]
        mk("bundle-series-" + sid, f"{S[0]}: All Subjects", f"{S[1]}: Semua Mata Pelajaran",
           f"The {S[0].lower()} for every subject we have it in: {len(items)} PDFs covering religion, languages, science and civics where available. Priced about 20% under buying each one separately. Made for schools, tutors and parents who teach several subjects.",
           f"{S[1]} untuk semua mata pelajaran yang tersedia: {len(items)} PDF yang mencakup agama, bahasa, sains, dan kewarganegaraan sesuai ketersediaan. Harganya sekitar 20% di bawah beli satuan. Untuk sekolah, bimbel, dan orang tua yang mengajar beberapa mata pelajaran.",
           items, 0.20, {}, items)

    series_out = [{"id": s, "title": {"en": SERIES[s][0], "id": SERIES[s][1]}, "blurb": {"en": SERIES[s][5], "id": SERIES[s][6]},
                   "contains": SERIES[s][2]} for s in SERIES_ORDER]
    subj_out = [{"id": k, "title": {"en": v[0], "id": v[1]}, "category": v[2]} for k, v in SUBJECTS.items()]
    cat_out = [{"id": c, "title": {"en": e, "id": i}} for c, e, i in CATEGORIES]
    out = {"generatedAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
           "series": series_out, "subjects": subj_out, "categories": cat_out, "products": products, "bundles": bundles}
    path = os.path.join(ROOT, "src", "data", "catalog.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("products", len(products), "bundles", len(bundles), "series", len(series_out), "subjects", len(subj_out))
    c = collections.Counter(p["series"] for p in products)
    for s in SERIES_ORDER: print(s, c[s], SERIES[s][3])
    for b in bundles: print(b["slug"], b["priceIdr"], b["compareAtIdr"])
main()
