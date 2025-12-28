#!/usr/bin/env python3
"""
Generate a favicon.ico from a source image using Pillow.
Produces a multi-size ICO containing 16,32,48,64,128 sizes.
Run: python3 tools/make_favicon.py
"""
from PIL import Image
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / 'photos' / 'les-cottages-du-lac.jpg'
DST = Path(__file__).resolve().parents[1] / 'favicon.ico'
SIZES = [(16,16),(32,32),(48,48),(64,64),(128,128)]

if not SRC.exists():
    raise SystemExit(f"Source image not found: {SRC}")

img = Image.open(SRC).convert('RGBA')
icons = [img.resize(sz, Image.LANCZOS) for sz in SIZES]
# Save as multi-icon ICO
icons[0].save(DST, format='ICO', sizes=SIZES)
print(f"Wrote {DST}")
