# Media assets

- `media/shapes/`: all 359 isolated transparent PNGs, grouped by exit, plus
  `Shape_Index.csv` with identifiers, dimensions, scale and original hashes.
- `media/animations/`: all-path and featured 39-path **9:16 vertical MP4s**.
- `extras/true-visuals/`: landscape MP4s, GIF preview, SVG/PNG overlays,
  full/featured shape grids, capture scripts and original verification notes.
- `media/social/`: five graphic concepts, contact sheet and 30-post workbook.
- `assets/branding/`: the current wordmark as SVG and white-background PNG.

The P is a looped ramp; the U is a hairpin. These are decorative letterforms,
not added GIS records. Site versions adapt their amber and teal to the theme.

Some completed media predates the current title and editorial design. It is
preserved as source project material. Check framing, copy, snapshot dates and
branding before using it in a new public post.

These assets show the source geometry. Fit-to-panel drawings have different
scales; the common-scale overlays preserve relative sizes. Animation speed is
illustrative, not a traffic or driving-speed measurement.

The original shape index is retained verbatim as export provenance. The received
archive contained 12 empty PNGs and one damaged PNG. On October 23, 2026, these
13 files were regenerated from the unchanged GIS vertices, using the index's
canvas dimensions, uniform scales and stroke colors. The other 346 PNGs retain
their received bytes. No application source or canonical dataset was changed.

`verification/media-integrity.json` records current hashes, historical index
discrepancies, and the received/replacement hashes for each repair. The original
index hashes are historical; use the integrity file for current file hashes.
`scripts/check.py` now validates PNG chunk checksums, the complete compressed
pixel stream, dimensions, visible content and transparent margins. A hash match
alone is no longer sufficient. The decoder and its regression tests need only
Python's standard library.

Optional regeneration needs Pillow (the repair used Pillow 12.3.0). Run
`python3 scripts/regenerate_shapes.py --ids 5622,5625` with explicitly selected
application IDs, then independently inspect the files and deliberately record
their new hashes. The script does not update integrity metadata. It preserves
all source vertices and applies translation and uniform scaling only, with
north up; round stroke joins and antialiasing do not change the centerline.
