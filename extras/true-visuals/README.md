# Parkway shape studies — actual GIS polylines

## Open

Open `GSP_True_Visuals.html` in a browser. Everything needed to draw the two visual studies is embedded. No network connection, font download, map service, or installation is required. The source links require a connection. This standalone work does not modify or deploy the main atlas.

The default is the full 359-path, first-recorded-vertex overlay at one common scale. The **Corridor ↔ shapes** tab contains the actual interactive animation. Use Play, pause, scrub, reverse by scrubbing, jump to either endpoint, or Loop. Exports can be saved as SVG or PNG directly from the player. These are source drawings, not generative-image interpretations.

## Primary deliverables

- `GSP_Overlay_Common_Scale.png` / `.svg`: all 359 selected paths, first original vertex aligned to one origin, with a single common geographic scale. Relative lengths and north-up orientation are preserved.
- `GSP_Unfold_All_359.mp4`: all 359 source paths, geographic corridor → individual shape tiles → original geographic positions. 24 seconds, 1920 × 1080, 30 fps, H.264, no audio.
- `GSP_Unfold_Featured_39.mp4`: the 39 existing featured selections, using larger tiles so individual curves are easier to see. Same duration, frame size and frame rate. This is clearly a subset, not all 359 paths.
- `GSP_Unfold_Featured_Preview.gif`: a 960 × 540, 10 fps preview of the featured animation.
- `GSP_All_359_Shapes.png` / `.svg`: full grid, individual uniform scales.
- `GSP_Featured_39_Shapes.png` / `.svg`: larger featured grid, individual uniform scales.

## Overlay variations

`GSP_Overlay_Parkway_End.*` aligns each exit selection’s first point and each entrance selection’s last point. These are the source study’s designated Parkway-side ends. Some are on collectors or other ramps, not directly on the mainline. The source record boundaries are retained.

`GSP_Overlay_Individual_Scales.*` uses each path’s first vertex as the shared anchor and scales each complete polyline uniformly so its farthest original vertex has the same displayed radius. The curves and compass orientations are retained, but relative lengths are not. Its circular outside envelope is an effect of normalization, not a mapped road feature. This is optional; it is not the default or the quantitative comparison.

The player also supports the last recorded vertex or the recorded vertex nearest half the along-line length. That halfway anchor is an existing vertex, not an interpolated new point. There is no rotation or tangent alignment in any mode.

## What is exact, and what is not

The source is `GSP_Parkway_County_Refined.html`, provided earlier in this conversation. All 359 record objects and all 12,877 selected XY coordinates are copied unchanged. Coordinates are NAD83 / New Jersey (EPSG:3424), in US survey feet. SVG geometry has only M and L commands, passing through all recorded vertices; curved SVG or spline commands are not used. Display Y is inverted to put grid north up. Rounded stroke joins are a rendering treatment, not additional geometry.

The overlay changes translation and (in its explicitly optional normalized mode) uniform scale. The unfold animation leaves each complete source polyline immutable and animates only its translation and uniform scale. Final tiles have different scales; geographic positions share one common scale. The north-to-south wave staggers the timing, not the source shapes. It is not a driving simulation.

This is the atlas’s selection of ramps, forks, shared connectors and approaches. It is not every physical Parkway ramp. Of 359 selections, 355 are complete features and four are explicitly indexed consecutive excerpts; there are 358 distinct raw FIDs because two disjoint excerpts use the same US 9 source record. Source identifiers, excerpts, notes and warnings remain in the JSON and SVG metadata.

Geometry is an August 21, 2025 snapshot. No present-day survey, lane width, pavement width, bridge level, sign accuracy, or turn permission is implied. Sparse source point sequences remain sparse; missing bends are not invented.

County context and memberships are inherited from the completed county-refined atlas: a previously generalized NJOGIS-derived display copy, not fresh survey boundaries. Interchanges can appear under more than one county, but a full-collection selection is drawn once. No additional geographic research was performed for these visual studies.

## Checks included

- `verification.json`: independent standard-library SHP/SHX/DBF check against the original uploaded NJDOT ZIP; all 359 identifiers and 12,877 coordinates match exactly.
- `browser-verification.json`: the 359 SVG source paths reconstruct all original coordinates with zero measured reconstruction error; shared anchors coincide; common-scale factors are identical; transform endpoints return to the original map positions; all 359 selectors, 10 county filters, featured/representative collections, playback, themes and 320/390/768/1512-pixel layouts were exercised.
- `export-verification.json`: direct SVG-to-PNG download, 12,877 source-point markers, reset recovery and absence of rotation transforms.
- `movie-verification.json`: recorded browser export settings. MP4s are actual Chromium frames of these SVGs, not generated imagery. Both streams were decoded by FFmpeg without errors and confirmed as 720 frames at 30 fps / 24 seconds.

## Editing and rebuilding

`app.js`, `styles.css` and `template.html` are the editable source. `source-data.json` preserves the selected records plus source mainlines; `county-display.json` contains inherited display context. No font files are bundled.

```sh
python build.py --atlas /path/to/GSP_Parkway_County_Refined.html
python verify_source.py --html GSP_True_Visuals.html --roads-zip /path/to/NJ_Roads_shp.zip
python test_visuals.py
python render_movies.py --fps 30
```

The build and source verification use the Python standard library. Browser checks and video rendering need Playwright, Chromium and FFmpeg. On systems without Chromium on the normal PATH, pass `--chromium /path/to/browser` to the movie renderer. Viewing the finished HTML has no such dependencies.

The `window.LAB` interface exposes `configure`, `seek`, `svgString`, and `info` for deterministic rendering. `seek(0)` gives the geographic start, `seek(0.5)` the complete grid, and `seek(1)` the restored corridor. Use `configure({mode:'unfold', collection:'all'})` to select the full animation or `collection:'featured'` for the larger 39-path version.
