#!/usr/bin/env python3
"""Regenerate explicitly selected PNGs from immutable GIS vertices (needs Pillow)."""
from pathlib import Path
import argparse
import csv
import json
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ids', required=True, help='Comma-separated application selection IDs')
    args = parser.parse_args()
    requested = set(args.ids.split(','))
    with (ROOT / 'media/shapes/Shape_Index.csv').open(encoding='utf-8-sig', newline='') as f:
        rows = {r['selection_id']: r for r in csv.DictReader(f)}
    records = {str(r['fid']): r for r in json.loads((ROOT / 'data/study-data.json').read_text())['records']}
    if not requested <= rows.keys() or not requested <= records.keys():
        parser.error('Unknown selection ID; no images were changed')
    for selection_id in sorted(requested, key=int):
        row, record = rows[selection_id], records[selection_id]
        width, height = int(row['png_width_px']), int(row['png_height_px'])
        scale = float(row['scale_px_per_us_survey_ft'])
        points = record['source_xy']
        min_x, max_x = min(p[0] for p in points), max(p[0] for p in points)
        min_y, max_y = min(p[1] for p in points), max(p[1] for p in points)
        center_x, center_y = (min_x + max_x) / 2, (min_y + max_y) / 2
        # Same 64px centerline margins and 24px round stroke as retained exports.
        # Only translation, one uniform scale and north-up screen Y inversion.
        supersample = 4
        projected = [((width / 2 + (x - center_x) * scale) * supersample,
                      (height / 2 - (y - center_y) * scale) * supersample) for x, y in points]
        mask = Image.new('L', (width * supersample, height * supersample), 0)
        draw = ImageDraw.Draw(mask)
        stroke = 24 * supersample
        draw.line(projected, fill=255, width=stroke, joint='curve')
        radius = stroke / 2
        for x, y in projected:
            draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=255)
        mask = mask.resize((width, height), Image.Resampling.LANCZOS)
        image = Image.new('RGBA', (width, height), row['stroke_color'])
        image.putalpha(mask)
        destination = ROOT / 'media/shapes' / row['filename']
        image.save(destination, compress_level=9)
        print(row['filename'])


if __name__ == '__main__':
    main()
