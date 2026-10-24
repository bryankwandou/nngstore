import fitz,sys,re,glob,os,collections
sys.stdout.reconfigure(encoding='utf-8')
D=r"E:\Download\latihan 100 nomor untuk anak anak"
def series(n):
    r=[("Kunci_Jawaban_Dan_Pembahasan_Resmi_","off-key"),("Kunci_Jawaban_Dan_Pembahasan_","key-expl"),("Kunci_Jawaban_HOTS","hots-key"),("Kunci_Jawaban_Pilihan_Ganda","mc-key"),("Kunci_Jawaban_","key1000"),("Latihan_HOTS","hots-prac"),("Latihan_Pilihan_Ganda","mc-prac"),("Latihan_","ws1000"),("Paket_V2_HOTS","hots-pack"),("Paket_V2_Pilihan_Ganda","mc-pack"),("Paket_V2_","pack1000"),("Lembar_Kerja","assess"),("Naskah_Soal","exam"),("Paket_Resmi","off-pack")]
    for p,s in r:
        if n.startswith(p): return s
agg=collections.defaultdict(lambda: collections.Counter())
cnt=collections.Counter()
for g in sorted(glob.glob(os.path.join(D,"*.pdf"))):
    n=os.path.basename(g); s=series(n); cnt[s]+=1
    d=fitz.open(g); T=[p.get_text() for p in d]; A="\n".join(T)
    f={"KUNCI":bool(re.search("KUNCI",A)),"pembahasan":bool(re.search("Pembahasan|Ulasan",A)),"bubbles":bool(re.search(r"\[ ?A ?\] ?\[ ?B",A)),"dots":"........" in A,"[v]":"[v]" in A,
       "lastKunci":bool(re.search("KUNCI|Kunci",T[-1])),"p1Kunci":bool(re.search("KUNCI",T[0])), "blank_pages":sum(1 for t in T if len(t.strip())<20)}
    for k,v in f.items():
        if v: agg[s][k]+=int(v)
for s in cnt: print(s,cnt[s],dict(agg[s]))
print(sum(cnt.values()))
