# Filename parsing shared by build_catalog.py and make_images.py
import re

# (filename prefix, series id) - order matters, longest/most specific first
SERIES_PREFIX = [
    ("Kunci_Jawaban_Dan_Pembahasan_Resmi_", "key-exam-100"),
    ("Kunci_Jawaban_Dan_Pembahasan_", "key-explained-100"),
    ("Kunci_Jawaban_HOTS_Advanced_", "hots-key-100"),
    ("Kunci_Jawaban_Pilihan_Ganda_", "mc-key-100"),
    ("Kunci_Jawaban_", "answer-key-1000"),
    ("Latihan_HOTS_Advanced_", "hots-practice-100"),
    ("Latihan_Pilihan_Ganda_", "mc-practice-100"),
    ("Latihan_", "worksheet-1000"),
    ("Paket_V2_HOTS_Advanced_", "hots-pack-100"),
    ("Paket_V2_Pilihan_Ganda_", "mc-pack-100"),
    ("Paket_V2_", "pack-1000"),
    ("Lembar_Kerja_Asesmen_Siswa_", "assessment-100"),
    ("Naskah_Soal_Ujian_", "exam-script-100"),
    ("Paket_Resmi_Lengkap_Soal_Kunci_Dan_Pembahasan_", "pack-exam-100"),
]

# subject token (after removing series prefix and level/count suffix) -> subject id
SUBJECT_TOKENS = {
    "Agama_Buddha": "buddhist", "Agama_Hindu": "hindu",
    "Agama_Islam_Menulis": "islam-writing", "Agama_Islam_Teori": "islam-theory",
    "Agama_Katolik": "catholic", "Agama_Konghucu": "confucian", "Agama_Kristen": "protestant",
    "Bahasa_Inggris": "english", "English_Dasar": "english", "English": "english",
    "Bahasa_Jepang": "japanese", "Jepang_Dasar": "japanese", "Jepang": "japanese",
    "Bahasa_Jerman": "german", "Jerman_Dasar": "german", "Jerman": "german",
    "Bahasa_Korea": "korean", "Korea_Dasar": "korean", "Korea": "korean",
    "Bahasa_Mandarin": "mandarin", "Mandarin_Dasar": "mandarin", "Mandarin": "mandarin",
    "Biologi_Dasar": "biology", "Kimia_Dasar": "chemistry", "Matematika_Dasar": "math",
    "PKn": "pkn", "Pendidikan_Kewarganegaraan": "pkn", "PPKn": "ppkn", "PPKN": "ppkn",
    "Pendidikan_Pancasila": "pancasila",
}

def parse(filename):
    base = filename[:-4] if filename.lower().endswith(".pdf") else filename
    series = None
    for pre, sid in SERIES_PREFIX:
        if base.startswith(pre):
            series, rest = sid, base[len(pre):]
            break
    if series is None:
        raise ValueError("unknown series: " + filename)
    m = re.search(r"_(\d+)_Soal(_Lengkap)?$", base)
    if not m:
        raise ValueError("no question count: " + filename)
    questions = int(m.group(1))
    rest = rest[:m.start() - len(base) if False else len(rest) - (len(base) - m.start())]
    level = "SD-SMP" if rest.endswith("_SD_SMP") else ("SD" if rest.endswith("_SD") else None)
    if rest.endswith("_SD_SMP"): rest = rest[:-7]
    elif rest.endswith("_SD"): rest = rest[:-3]
    if rest not in SUBJECT_TOKENS:
        raise ValueError("unknown subject %r in %s" % (rest, filename))
    return series, SUBJECT_TOKENS[rest], level, questions

def make_slug(series, subject):
    return "%s-%s" % (series, subject)
