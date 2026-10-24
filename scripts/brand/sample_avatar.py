"""Sample the real colours of the current @nngstoreofficial avatar.

Usage: python -P -E scripts/brand/sample_avatar.py <path-to-avatar>
Prints image size, a k-means style palette (median cut), and hue buckets of the
saturated pixels, so the brand palette is derived from the avatar, not guessed.
"""
import sys
import colorsys
from collections import Counter
from PIL import Image

path = sys.argv[1]
im = Image.open(path).convert("RGB")
print("size", im.size)
small = im.resize((200, 200))

# Median-cut palette of the whole image.
q = small.quantize(colors=12, method=Image.Quantize.MEDIANCUT)
pal = q.getpalette()[: 12 * 3]
counts = sorted(q.getcolors(), reverse=True)
print("median-cut palette (share, hex, HSV):")
total = sum(c for c, _ in counts)
for c, idx in counts:
    r, g, b = pal[idx * 3 : idx * 3 + 3]
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    print(f"  {c/total:6.1%}  #{r:02X}{g:02X}{b:02X}  h={h*360:5.1f} s={s:.2f} v={v:.2f}")

# Hue buckets of saturated pixels only.
hues = Counter()
sat_px = []
for r, g, b in small.getdata():
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    if s > 0.35 and v > 0.25:
        hues[int(h * 360) // 15 * 15] += 1
        sat_px.append((h, s, v, (r, g, b)))
print("saturated pixel share:", f"{len(sat_px)/40000:.1%}")
print("hue buckets (15 deg):")
for hb, n in sorted(hues.items(), key=lambda x: -x[1])[:10]:
    print(f"  {hb:3d}-{hb+14:3d}: {n}")

# Most vivid colours per dominant hue bucket.
for hb, _ in sorted(hues.items(), key=lambda x: -x[1])[:4]:
    px = [p for p in sat_px if int(p[0] * 360) // 15 * 15 == hb]
    px.sort(key=lambda p: -(p[1] * p[2]))
    mid = px[len(px) // 2][3]
    top = px[0][3]
    print(f"  bucket {hb}: most vivid #{top[0]:02X}{top[1]:02X}{top[2]:02X}, median #{mid[0]:02X}{mid[1]:02X}{mid[2]:02X}")

# Corner and centre samples.
w, h = im.size
for name, (x, y) in {"tl": (5, 5), "tr": (w - 6, 5), "bl": (5, h - 6), "br": (w - 6, h - 6), "c": (w // 2, h // 2)}.items():
    r, g, b = im.getpixel((x, y))
    print(f"  {name}: #{r:02X}{g:02X}{b:02X}")
