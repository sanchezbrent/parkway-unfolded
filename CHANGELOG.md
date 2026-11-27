# Changelog

## 2026-11-27 — Find exits with familiar search wording

- Accept “Exit 135,” lettered numbers such as 100B, and county names with “County.”
- Match connecting-road names and common Route / Rt. / NJ abbreviations against the original ramp records.
- Explain when a lettered exit belongs to a shared exit area, retaining all source data and geometry.

## 2026-11-27 — Retrace your exploration with Back and Forward

- Give each newly opened exit, workspace and county view a place in browser history.
- Restore the selected ramp, map/unfolded view, county scope and scroll position when returning.
- Update the current stop when selecting another ramp or folding the same exit, avoiding extra Back steps for each click.
- Preserve gallery filters and Top 10s selections across navigation, and retain all original source data and geometry.

## 2026-11-27 — Clearer selections and a next shape to explore

- Name the selected road beneath the drawing and remove the extra pick-a-shape prompt after selection.
- Replace the exit view's repeated shape guide with two ramps from other exits: one similar shape and one contrasting example.
- Update suggestions when the selected ramp or exit changes, and open the suggested ramp already selected and unfolded.
- Keep the gallery's optional shape guide and preserve every original road vertex, north-up orientation and all five datasets.

## 2026-11-27 — Share an exit or a ramp

- Add Share this exit beside the unfolding control and Share this ramp beside selected-ramp details.
- Preserve the exit, map/unfolded view and selected ramp in the shared link.
- Use the device share menu when available, otherwise copy the link with clear confirmation.
- Offer a selectable link when automatic copying is unavailable; leave canceled sharing alone.
- Retain all original road geometry and source data.

## 2026-11-26 — Follow the Parkway and connect the county views

- Add north/south controls below each exit drawing, following the original exit order.
- Keep the map or unfolded view when hopping to a neighboring exit, including across county lines.
- Disable further travel at either end of the Parkway.
- Link county-directory hover and keyboard focus to the matching map sign and county outline, in both directions.
- Preserve the source geometry and all five datasets.

## 2026-11-26 — Visible light and dark mode switching

- Add a labeled sun/moon theme button to the header on every view.
- Keep sign-button text dark against gold hover and focus backgrounds in both themes.
- Switch immediately between light and dark, remembering the choice in this browser.
- Keep the System setting in About & sources for following device appearance.
- Preserve the selected exit, drawings and source data.

## 2026-11-26 — A shared sign style and illustrated county directory

- Carry the map signs' green, cream keylines and rounded corners into action buttons.
- Keep gold Top 10s and clear hover, selected and keyboard-focus states in both themes.
- Add a real, north-up ramp preview and exit-range badge to each county entry.
- Show all ten county entries without a separate scrolling panel.
- Enlarge the road-range label, chooser and drawing count, with a stacked chooser on small phones.
- Keep the opening headline and all source geometry and data unchanged.

## 2026-11-26 — Parkway-inspired map labels

- Give county labels bold lettering, green sign faces and cream borders.
- Highlight the matching county on hover and keyboard focus.
- Carry the sign styling into county-level exit numbers, with keyboard access.
- Keep the road clear between sign columns on narrow phones, with traffic and toll layers aligned.
- Preserve original map geometry and all road and county data.

## 2026-11-26 — A clearer exit view

- Lead with the chosen exit and connecting road, removing the repeated introduction.
- Place selected-ramp details directly below its drawing, above the shape guide.
- Use plain labels for internal actions and improve supporting exit-view text sizes.
- Preserve road geometry, unfolding, adoption, toll information and comparison.

## 2026-11-25 — Find an exit from the introduction

- Put a visible exit search beside the unfolding example.
- Open a single match directly; show choices for broader searches by road or county.
- Shorten the introduction and phone spacing, with one search entry point on the opening view.
- Retain the header search when exploring exits, ramp shapes and rankings.

## 2026-11-25 — A live introduction and wider exit drawings

- Replace the three opening thumbnails with a live Exit 135 unfolding example.
- Play the example once when visible, with replay and reduced-motion still views.
- Give each selected exit the full content width and larger road drawings.
- Move the shape guide below the exit as a compact row of examples.
- Preserve all source geometry, county browsing, rankings and data controls.

## 2026-10-25 — A clearer introduction

- Replace the road-name subheader with a concise explanation of the project.
- Explain Parkway Unfolded, what its road drawings represent and where to begin.
- Give the About section readable paragraphs and a short guide to the main views.
- Add an About link in the footer and clearer opening instructions on the map.

## 2026-10-25 — Safer data rendering

- Escape data labels and SVG colors before inserting page markup in the atlas,
  rankings and supporting tools; treat selection identifiers as numbers.
- Serialize supporting SVG downloads from allowed drawing elements and attributes,
  escaping all text and attribute values; use an inert download file type.
- Escape markup characters in JSON downloads using lossless JSON Unicode escapes.
- Add regression checks using hostile labels, colors and source identifiers.
- Keep all five canonical datasets and all drawing coordinates unchanged.

## 2026-10-24 — GitHub project setup

- Prepared the complete source, data, repaired media and documentation for GitHub.
- Added a folder guide, editor settings, project instructions and feature issue form.
- Retained pinned Actions, build/media checks, CodeQL, Dependabot and Pages workflows.
- Removed raw source IDs from comparison artwork and simplified page descriptions
  and accessible drawing labels; machine-readable provenance remains intact.
- Camera integration remains paused pending reuse permissions.

## 2026-10-23 — Local media repair

- Regenerated 13 invalid isolated PNG exports from unchanged GIS vertices;
  retained the other 346 PNGs and all five canonical datasets byte for byte.
- Added PNG decoding, transparency and dimension checks, plus regression tests
  for corrupt checksums, truncated image data, blank files and invalid exports.
- Recorded deliberate replacement hashes while preserving original provenance.
- Completed fresh phone/tablet/desktop checks in System, Light and Dark themes.
- This local repair does not establish a GitHub upload or Pages deployment.

## 2026-10-23 — Initial repository edition

- Full Parkway Unfolded application, including the stylized P/U masthead.
- County browsing, unfolding, comparison, traffic, toll plans and 15 Top 10s.
- Reproducible source/data build, integrity checks and GitHub Pages workflow.
- Individual PNGs, vertical/landscape videos, overlays and social project assets.
- Original county research/build archive and explicit source/reuse notes.

The repository reorganizes the source files without changing the approved
application output, source coordinates, traffic counts, toll fares or rankings.
