"""WCAG 2.x contrast check for the hybrid palette. Run: python contrast_check.py
Edit PALETTE / PAIRS and rerun whenever a colour changes."""

PALETTE = {
    # grisaille (UI chrome, closed altarpiece)
    "gesso": "#EEE9DF", "stone-200": "#CFC8BA", "stone-500": "#857F75",
    "stone-700": "#4A4740", "ink": "#1F1D1A",
    # glazes (panel accents)
    "ultramarine": "#24407A", "vermilion": "#B03F2C", "verdigris": "#2F6A53",
    "umber": "#5A3E2B", "ochre": "#C29545", "gold": "#C8A24A",
}

# (foreground, background, use, required ratio)
PAIRS = [
    ("ink", "gesso", "body text", 4.5),
    ("stone-700", "gesso", "secondary text, captions", 4.5),
    ("stone-500", "gesso", "large display text only", 3.0),
    ("gesso", "ink", "text on dark (closed exterior)", 4.5),
    ("gold", "ink", "gold headings on dark", 4.5),
    ("gold", "gesso", "gold on light: decoration only, never text or meaningful icons", None),
    ("gesso", "ultramarine", "button text", 4.5),
    ("gesso", "vermilion", "button / tag text", 4.5),
    ("gesso", "verdigris", "tag text", 4.5),
    ("gesso", "umber", "tag text", 4.5),
    ("ultramarine", "gesso", "links, focus ring (3:1 non-text)", 4.5),
    ("ochre", "ink", "focus ring on dark (3:1 non-text)", 3.0),
    ("gesso", "stone-700", "labels on grisaille panels", 4.5),
]


def luminance(hex_colour):
    channels = [int(hex_colour[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a, b):
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


assert round(ratio("#000000", "#FFFFFF"), 1) == 21.0  # self-check: WCAG maximum
assert round(ratio("#777777", "#FFFFFF"), 2) == 4.48  # known reference value

if __name__ == "__main__":
    for fg, bg, use, need in PAIRS:
        r = ratio(PALETTE[fg], PALETTE[bg])
        verdict = "INFO" if need is None else ("PASS" if r >= need else "FAIL")
        print(f"{fg:>12} on {bg:<12} {r:5.2f}:1  need {need or '-'}:1  {verdict}  ({use})")
