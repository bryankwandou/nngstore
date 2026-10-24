"""Single source for the NNG Store color tokens.

Run:  python -P -E scripts/brand/tokens.py
  - checks every contrast pair listed in CHECKS and exits non-zero on a failure
  - writes src/styles/tokens.css (light, [data-theme="dark"], and the
    prefers-color-scheme fallback, all from the same table so they never drift)
  - rewrites the block between the token markers in brand.md, if present

Brand hues are not picked by eye. They start from colors sampled out of the
current @nngstoreofficial avatar (scripts/brand/sample_avatar.py) and are moved
only in OKLCH lightness, keeping hue, until the contrast targets pass.
"""
from __future__ import annotations

import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# ---------------------------------------------------------------- color math


def hex_to_rgb(h: str) -> tuple[float, float, float, float]:
    h = h.lstrip("#")
    a = 1.0
    if len(h) == 8:
        a = int(h[6:8], 16) / 255
        h = h[:6]
    return (int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255, a)


def rgb_to_hex(r: float, g: float, b: float) -> str:
    c = lambda v: max(0, min(255, round(v * 255)))
    return f"#{c(r):02x}{c(g):02x}{c(b):02x}"


def lin(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def delin(c: float) -> float:
    return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055


def composite(fg: str, bg: str) -> str:
    """Flatten a color with alpha onto an opaque background."""
    fr, fg_, fb, fa = hex_to_rgb(fg)
    br, bg_, bb, _ = hex_to_rgb(bg)
    return rgb_to_hex(fr * fa + br * (1 - fa), fg_ * fa + bg_ * (1 - fa), fb * fa + bb * (1 - fa))


def mix(a: str, b: str, t: float) -> str:
    """t of color a over b, like color-mix(in srgb, a t, b)."""
    ar, ag, ab, _ = hex_to_rgb(a)
    br, bg_, bb, _ = hex_to_rgb(b)
    return rgb_to_hex(ar * t + br * (1 - t), ag * t + bg_ * (1 - t), ab * t + bb * (1 - t))


def luminance(h: str) -> float:
    r, g, b, _ = hex_to_rgb(h)
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def contrast(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def to_oklch(h: str) -> tuple[float, float, float]:
    r, g, b, _ = hex_to_rgb(h)
    r, g, b = lin(r), lin(g), lin(b)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = l ** (1 / 3), m ** (1 / 3), s ** (1 / 3)
    L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    C = math.hypot(A, B)
    H = math.degrees(math.atan2(B, A)) % 360
    return L, C, H


def _oklch_to_rgb(L: float, C: float, H: float) -> tuple[float, float, float]:
    A, B = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    l_ = L + 0.3963377774 * A + 0.2158037573 * B
    m_ = L - 0.1055613458 * A - 0.0638541728 * B
    s_ = L - 0.0894841775 * A - 1.2914855480 * B
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return r, g, b


def from_oklch(L: float, C: float, H: float) -> str:
    """OKLCH to hex, reducing chroma until the color fits in sRGB."""
    lo, hi = 0.0, C
    r, g, b = _oklch_to_rgb(L, C, H)
    if all(-1e-6 <= v <= 1 + 1e-6 for v in (r, g, b)):
        return rgb_to_hex(delin(max(0, r)), delin(max(0, g)), delin(max(0, b)))
    for _ in range(40):
        mid = (lo + hi) / 2
        r, g, b = _oklch_to_rgb(L, mid, H)
        if all(-1e-6 <= v <= 1 + 1e-6 for v in (r, g, b)):
            lo = mid
        else:
            hi = mid
    r, g, b = _oklch_to_rgb(L, lo, H)
    return rgb_to_hex(delin(max(0, min(1, r))), delin(max(0, min(1, g))), delin(max(0, min(1, b))))


def fmt_oklch(h: str) -> str:
    L, C, H = to_oklch(h[:7])
    return f"oklch({L:.3f} {C:.3f} {H:.1f})"


# ----------------------------------------------------------- source samples
# Sampled from nngesport/public/img/nng-store-avatar.jpg (1080 x 1080).
AVATAR_VIOLET = "#8e59fd"  # most vivid pixel in the 255-269 deg HSV bucket, the shield's lower rim
AVATAR_BLUE = "#2786f0"  # most vivid pixel in the 210-224 deg bucket, the shield's upper rim
AVATAR_NAVY = "#090e1f"  # darkest large cluster, the night sky
ESPORT_RED = "#d10f28"  # flare-600 from nngesport/brand.md
ESPORT_RED_LIGHT = "#ff5765"  # flare-400
ESPORT_BLUE_LIGHT = "#3aa5ff"  # volt-400

_, VC, VH = to_oklch(AVATAR_VIOLET)
_, BC, BH = to_oklch(AVATAR_BLUE)


def violet(L: float, C: float | None = None) -> str:
    return from_oklch(L, VC if C is None else C, VH)


def blue(L: float, C: float | None = None) -> str:
    return from_oklch(L, BC if C is None else C, BH)


# ------------------------------------------------------------------- tokens
INK = "#17161b"

LIGHT = {
    "bg": "#fbfaf7",  # warm paper, research 1.10
    "bg-elev": "#ffffff",
    "surface": "#ffffff",
    "surface-2": "#f4f2ee",
    "line": INK + "14",  # ink at 8 percent
    "line-strong": INK + "29",  # ink at 16 percent
    "text": INK,
    "text-muted": "#5c5a64",
    "text-subtle": "#86848d",
    "brand": violet(0.50),
    "brand-strong": violet(0.44),
    "brand-soft": violet(0.955, 0.032),
    "brand-contrast": "#ffffff",
    "accent": blue(0.53),
    "accent-soft": blue(0.955, 0.025),
    "success": "#147a4a",
    "warning": "#a14c06",
    "danger": ESPORT_RED,
    "ring": AVATAR_VIOLET,
}

DARK = {
    "bg": "#0f1012",  # research 1.10
    "bg-elev": "#1b1c20",
    "surface": "#16171a",
    "surface-2": "#202125",
    "line": "#ffffff1a",  # white at 10 percent
    "line-strong": "#ffffff2e",  # white at 18 percent
    "text": "#ececea",
    "text-muted": "#a4a3aa",
    "text-subtle": "#76757c",
    "brand": violet(0.74, 0.16),
    "brand-strong": violet(0.82, 0.12),
    "brand-soft": violet(0.28, 0.075),
    "brand-contrast": violet(0.17, 0.06),
    "accent": ESPORT_BLUE_LIGHT,
    "accent-soft": blue(0.27, 0.06),
    "success": "#43c98b",
    "warning": "#f0b23e",
    "danger": ESPORT_RED_LIGHT,
    "ring": violet(0.74, 0.16),
}

ORDER = list(LIGHT.keys())

# (foreground, background, minimum, note). Backgrounds may be "wash:<token>",
# meaning a 12 percent wash of that token over --bg, the way a status badge is drawn.
CHECKS = [
    ("text", "bg", 4.5, "body text on page"),
    ("text", "surface", 4.5, "body text on card"),
    ("text", "surface-2", 4.5, "text on hover and wells"),
    ("text", "bg-elev", 4.5, "text in drawers and menus"),
    ("text-muted", "bg", 4.5, "secondary text on page"),
    ("text-muted", "surface", 4.5, "secondary text on card"),
    ("text-muted", "surface-2", 4.5, "secondary text on wells"),
    ("text-subtle", "bg", 3.0, "captions, placeholders, icons"),
    ("text-subtle", "surface", 3.0, "same, on card"),
    ("brand-contrast", "brand", 4.5, "label on primary button"),
    ("brand-contrast", "brand-strong", 4.5, "label on pressed button"),
    ("brand", "bg", 4.5, "link text on page"),
    ("brand", "surface", 4.5, "link text on card"),
    ("brand", "brand-soft", 4.5, "active filter chip"),
    ("text", "brand-soft", 4.5, "text on selection"),
    ("accent", "bg", 4.5, "info text on page"),
    ("accent", "accent-soft", 4.5, "info note on its wash"),
    ("success", "surface", 4.5, "paid status on card"),
    ("success", "wash:success", 4.5, "paid badge on its wash"),
    ("warning", "surface", 4.5, "pending status on card"),
    ("warning", "wash:warning", 4.5, "pending badge on its wash"),
    ("danger", "surface", 4.5, "error text on card"),
    ("danger", "wash:danger", 4.5, "failed badge on its wash"),
    ("ring", "bg", 3.0, "focus ring on page"),
    ("ring", "surface", 3.0, "focus ring on card"),
    ("line-strong", "bg", 1.3, "visible divider (non-text)"),
]


def resolve(theme: dict, name: str) -> str:
    if name.startswith("wash:"):
        return mix(theme[name[5:]][:7], theme["bg"], 0.12)
    v = theme[name]
    return composite(v, theme["bg"]) if len(v) == 9 else v


def run_checks() -> tuple[list[tuple], bool]:
    rows, ok = [], True
    for fg, bg, need, note in CHECKS:
        rl = contrast(resolve(LIGHT, fg), resolve(LIGHT, bg))
        rd = contrast(resolve(DARK, fg), resolve(DARK, bg))
        passed = rl >= need and rd >= need
        ok &= passed
        rows.append((fg, bg, need, note, rl, rd, passed))
    return rows, ok


# ------------------------------------------------------------------- output


def block(theme: dict, indent: str) -> str:
    return "\n".join(f"{indent}--{k}: {theme[k]};" for k in ORDER)


STATIC = """  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --shadow-sm: 0 1px 3px rgba(16, 24, 40, 0.08);
  --shadow-md: 0 8px 24px rgba(16, 24, 40, 0.08), 0 2px 6px rgba(16, 24, 40, 0.04);
  --shadow-lg: 0 20px 48px rgba(16, 24, 40, 0.12), 0 4px 12px rgba(16, 24, 40, 0.06);

  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-1: 100ms;
  --dur-2: 200ms;
  --dur-3: 300ms;
  --dur-4: 600ms;"""


def write_css() -> str:
    css = f"""/*
  NNG Store design tokens. Generated by scripts/brand/tokens.py; edit the
  script, not this file, then run: python -P -E scripts/brand/tokens.py
  brand.md explains every value and lists the measured contrast ratios.

  Every color is a complete CSS color (hex, 8-digit hex for the hairlines), so
  globals.css can map them onto Tailwind utilities with @theme inline.
*/

:root {{
{block(LIGHT, "  ")}

{STATIC}
}}

[data-theme="dark"] {{
{block(DARK, "  ")}
}}

@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
{block(DARK, "    ")}
  }}
}}
"""
    out = ROOT / "src" / "styles" / "tokens.css"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(css, encoding="utf-8", newline="\n")
    return str(out)


ROLE = {
    "bg": "Page canvas",
    "bg-elev": "Header on scroll, drawers, menus",
    "surface": "Cards, product covers' frame, inputs",
    "surface-2": "Hover fill, wells, skeletons",
    "line": "Hairline borders and dividers",
    "line-strong": "Hover borders, input borders",
    "text": "Headings and body",
    "text-muted": "Secondary text, metadata",
    "text-subtle": "Captions, placeholders, idle icons",
    "brand": "Primary button, links, active filter",
    "brand-strong": "Primary hover and pressed",
    "brand-soft": "Active chip fill, text selection",
    "brand-contrast": "Label on a brand fill",
    "accent": "Info notes only, never an action",
    "accent-soft": "Info note fill",
    "success": "Paid, saved, done",
    "warning": "Pending payment",
    "danger": "Failed, expired, destructive",
    "ring": "Focus outline",
}


def markdown(rows: list[tuple]) -> str:
    out = ["| Token | Light | Dark | Role |", "| --- | --- | --- | --- |"]
    for k in ORDER:
        out.append(f"| `--{k}` | `{LIGHT[k]}` | `{DARK[k]}` | {ROLE[k]} |")
    out += ["", "Measured contrast (WCAG 2.x relative luminance; alpha hairlines flattened onto `--bg`; a \"wash\" is 12 percent of the color over `--bg`):", ""]
    out += ["| Foreground | Background | Use | Light | Dark | Target |", "| --- | --- | --- | --- | --- | --- |"]
    for fg, bg, need, note, rl, rd, passed in rows:
        bgname = f"12% wash of `--{bg[5:]}`" if bg.startswith("wash:") else f"`--{bg}`"
        out.append(f"| `--{fg}` | {bgname} | {note} | {rl:.2f} | {rd:.2f} | {need:g}:1 |")
    return "\n".join(out)


def update_brand_md(table: str) -> bool:
    p = ROOT / "brand.md"
    if not p.exists():
        return False
    s = p.read_text(encoding="utf-8")
    new, n = re.subn(
        r"(<!-- tokens:start -->\n).*?(\n<!-- tokens:end -->)",
        lambda m: m.group(1) + table + m.group(2),
        s,
        flags=re.S,
    )
    if n:
        p.write_text(new, encoding="utf-8", newline="\n")
    return bool(n)


def main() -> int:
    rows, ok = run_checks()
    print(f"avatar violet {AVATAR_VIOLET} = {fmt_oklch(AVATAR_VIOLET)}; avatar blue {AVATAR_BLUE} = {fmt_oklch(AVATAR_BLUE)}")
    for k in ORDER:
        print(f"  --{k:<15} light {LIGHT[k]:<10} {fmt_oklch(LIGHT[k]):<28} dark {DARK[k]:<10} {fmt_oklch(DARK[k])}")
    print()
    for fg, bg, need, note, rl, rd, passed in rows:
        flag = "ok  " if passed else "FAIL"
        print(f"  {flag} {fg:>14} on {bg:<14} light {rl:5.2f}  dark {rd:5.2f}  (need {need})  {note}")
    if not ok:
        print("\nContrast check failed; tokens.css not written.")
        return 1
    print("\nwrote", write_css())
    print("brand.md table updated" if update_brand_md(markdown(rows)) else "brand.md has no token markers yet")
    (ROOT / "scripts" / "brand" / "token-table.md").write_text(markdown(rows) + "\n", encoding="utf-8", newline="\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
