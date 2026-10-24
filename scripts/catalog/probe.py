import fitz,sys,re,glob,os
sys.stdout.reconfigure(encoding='utf-8')
D=r"E:\Download\latihan 100 nomor untuk anak anak"
pats=["Kunci_Jawaban_Agama_Hindu_SD_1000","Latihan_Agama_Hindu_SD_1000","Kunci_Jawaban_Dan_Pembahasan_Agama_Hindu_SD_SMP","Kunci_Jawaban_Dan_Pembahasan_Resmi_Agama_Hindu","Kunci_Jawaban_HOTS_Advanced_Agama_Hindu","Latihan_HOTS_Advanced_Agama_Hindu","Paket_V2_HOTS_Advanced_Agama_Hindu","Kunci_Jawaban_Pilihan_Ganda_Agama_Hindu","Latihan_Pilihan_Ganda_Agama_Hindu","Paket_V2_Pilihan_Ganda_Agama_Hindu","Paket_V2_Agama_Hindu_SD_1000","Lembar_Kerja_Asesmen_Siswa_Agama_Hindu","Naskah_Soal_Ujian_Agama_Hindu","Paket_Resmi_Lengkap_Soal_Kunci_Dan_Pembahasan_Agama_Hindu"]
for p in pats:
    f=os.path.join(D,p+("_100_Soal.pdf" if "1000" not in p and "V2" not in p else "")) 
    g=glob.glob(os.path.join(D,p+"*.pdf"))[0]
    d=fitz.open(g)
    print("=====",os.path.basename(g),len(d))
    for i in (0,1,d.page_count//2,d.page_count-1):
        t=d[i].get_text().replace("\n"," | ")
        print(" p%d: %s"%(i+1,t[:420]))
