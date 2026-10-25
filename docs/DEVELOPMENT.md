# Development

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Generated, self-contained current application |
| `source/template.html` | Application markup and core map/explorer code |
| `source/*_module.js` | Toll, rankings, shared controls, editorial and theme code |
| `source/*_styles.css` | Interface styles |
| `data/` | Five canonical JSON blocks and tabular/GIS exports |
| `assets/branding/` | Stylized P/U wordmark |
| `media/` | Isolated shapes, vertical videos and social planning/assets |
| `extras/true-visuals/` | Source, exported drawings, landscape videos and player |
| `verification/` | Current release baseline and clearly historical checks |
| `archives/` | Original completed county-study package |

## Make a change

Edit `source/` or a reviewed data file. Run `python3 source/build.py`, followed
by `python3 scripts/check.py`. Commit the source and rebuilt `index.html`
together. Do not hand-edit only the generated page.

The initial repository build reproduces the approved October 23 page byte for
byte. JSON blocks have moved out of the large source template into `data/`;
that original import retained the generated page. Subsequent editorial changes remove technical source-record details from the reader interface while retaining the underlying data. The checks pin the five data blocks to the
release baseline. For an intentional data revision, review the change, retain
its provenance, then update the baseline hashes and relevant counts/checks.

## Visual verification

For interface edits, inspect the map, ramp gallery, detail dialog, comparison,
rankings and toll directory on desktop and mobile, in both themes. Confirm
keyboard access, readable labels and no page-wide horizontal overflow.
The main title must retain its accessible name, Parkway Unfolded.

Historical browser checks document prior runs; they are not a claim that a new
commit has passed a fresh browser review. The current repository check verifies
build/data/media integrity and JavaScript syntax.

## GitHub Pages

Select **GitHub Actions** in repository Settings → Pages. The Pages workflow
checks the build, stages `_site/`, and deploys it from `main`. Pull requests run
checks without publishing. No backend, secrets or custom domain are required.
The deployment URL is returned by the Pages job; do not assume publication
has succeeded until that job and its URL have been verified.

Official workflow reference:
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Media regeneration

For individual transparent road PNGs, see `docs/MEDIA.md` and
`scripts/regenerate_shapes.py`. Regeneration is optional and requires Pillow;
the normal build and PNG validation remain dependency-free apart from Node for
JavaScript syntax checking. Repairing exports must not alter canonical GIS data.

See the original instructions under `extras/true-visuals/README.md`.
That optional renderer needs Python Playwright, Chromium and ffmpeg.
Its `build.py --atlas ../../index.html` uses the current source drawings.
The existing vertical MP4s are preserved as completed exports; the archived
movie renderer describes the original landscape capture.

## Ongoing maintenance

See [MAINTENANCE.md](MAINTENANCE.md) and [SECURITY.md](../SECURITY.md). Pages stages only the reader-facing app, branding and media; source data and research tools remain available in the repository.
