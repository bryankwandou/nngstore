"""Render covers and blurred, watermarked previews. Source PDFs are opened read-only with PyMuPDF."""
import fitz, sys, os, glob, shutil, math
from PIL import Image, ImageFilter, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(__file__))
from taxonomy import parse, make_slug
sys.stdout.reconfigure(encoding='utf-8')

SRC = r"E:\Download\latihan 100 nomor untuk anak anak"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
COVERS = os.path.join(ROOT, "public", "covers")
PREV = os.path.join(ROOT, "public", "previews")
FONT = r"C:\Windows\Fonts\arialbd.ttf"
WM = "NNG STORE \u00b7 PREVIEW"

def render(page, width):
    z = width / page.rect.width
    pm = page.get_pixmap(matrix=fitz.Matrix(z, z), alpha=False)
    return Image.frombytes("RGB", (pm.width, pm.height), pm.samples)

def watermark(img):
    w, h = img.size
    size = max(18, w // 22)
    font = ImageFont.truetype(FONT, size)
    d = int(math.hypot(w, h)) + 40
    layer = Image.new("L", (d, d), 0)
    ld = ImageDraw.Draw(layer)
    tw = ld.textlength(WM, font=font)
    stepx, stepy = int(tw + size * 2.2), int(size * 3.6)
    row = 0
    for y in range(0, d, stepy):
        off = (row % 2) * stepx // 2
        for x in range(-stepx, d, stepx):
            ld.text((x + off, y), WM, font=font, fill=255)
        row += 1
    layer = layer.rotate(30, resample=Image.BICUBIC)
    left, top = (d - w) // 2, (d - h) // 2
    mask = layer.crop((left, top, left + w, top + h)).point(lambda v: int(v * 0.10))
    dark = Image.new("RGB", (w, h), (20, 30, 60))
    return Image.composite(dark, img, mask)

def heavy_blur(img):
    w, h = img.size
    small = img.resize((max(1, w // 6), max(1, h // 6)), Image.BILINEAR)
    small = small.filter(ImageFilter.GaussianBlur(3))
    up = small.resize((w, h), Image.BICUBIC)
    return up.filter(ImageFilter.GaussianBlur(10))

def cover(page):
    """Full A4 page 1, 400 px wide: top ~32% sharp, rest blurred like the preview. No watermark."""
    img = render(page, 900)
    band = int(img.height * 0.32)
    out = heavy_blur(img)
    out.paste(img.crop((0, 0, 900, band)), (0, 0))
    h = round(400 * page.rect.height / page.rect.width)
    return out.resize((400, h), Image.LANCZOS)

def preview1(page):
    img = render(page, 900)
    band = int(img.height * 0.35)
    blurred = heavy_blur(img)
    out = blurred.copy()
    out.paste(img.crop((0, 0, 900, band)), (0, 0))
    return watermark(out)

def preview_sharp(page):
    return watermark(render(page, 900))

def preview_n(page):
    return watermark(heavy_blur(render(page, 900)))

import json
_cat = json.load(open(os.path.join(ROOT, "src", "data", "catalog.json"), encoding="utf-8"))
SHARP = {p["slug"]: p["previewSharp"] for p in _cat["products"]}

def main():
    if os.path.isdir(PREV): shutil.rmtree(PREV)
    if os.path.isdir(COVERS): shutil.rmtree(COVERS)
    os.makedirs(COVERS); os.makedirs(PREV)
    files = sorted(glob.glob(os.path.join(SRC, "*.pdf")))
    for i, g in enumerate(files):
        s, sub, lv, q = parse(os.path.basename(g))
        slug = make_slug(s, sub)
        doc = fitz.open(g)
        cover(doc[0]).save(os.path.join(COVERS, slug + ".webp"), "WEBP", quality=78, method=6)
        od = os.path.join(PREV, slug); os.makedirs(od)
        (preview_sharp if SHARP[slug] >= 1 else preview1)(doc[0]).save(os.path.join(od, "1.webp"), "WEBP", quality=72, method=6)
        for n in (1, 2):
            if doc.page_count > n:
                (preview_sharp if (n < SHARP[slug]) else preview_n)(doc[n]).save(os.path.join(od, "%d.webp" % (n + 1)), "WEBP", quality=70, method=6)
        doc.close()
        if i % 20 == 0: print(i, slug, flush=True)
    print("done", len(files))
main()
