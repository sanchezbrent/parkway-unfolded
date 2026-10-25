# Parkway Unfolded

An interactive look at the Garden State Parkway through the shapes of its
entrances, exits and connecting roads. Find an exit, unfold the ramps, compare
two curves, or explore traffic counts, tolls and the Top 10s.

![Parkway Unfolded](assets/branding/Parkway_Unfolded_Wordmark.png)

[![Project checks](https://github.com/sanchezbrent/parkway-unfolded/actions/workflows/check.yml/badge.svg)](https://github.com/sanchezbrent/parkway-unfolded/actions/workflows/check.yml)
[![Code security](https://github.com/sanchezbrent/parkway-unfolded/actions/workflows/codeql.yml/badge.svg)](https://github.com/sanchezbrent/parkway-unfolded/actions/workflows/codeql.yml)
[![Pages deployment](https://github.com/sanchezbrent/parkway-unfolded/actions/workflows/pages.yml/badge.svg)](https://github.com/sanchezbrent/parkway-unfolded/actions/workflows/pages.yml)

## Find your way around

| Location | Contents |
| --- | --- |
| [`index.html`](index.html) | Current self-contained reader application, generated from source |
| [`source/`](source/) | Editable page template, interface modules, styles and build script |
| [`data/`](data/) | Canonical geometry, traffic and toll data with source references |
| [`assets/branding/`](assets/branding/) | Approved Parkway Unfolded wordmark |
| [`media/shapes/`](media/shapes/) | 359 transparent road PNGs and their index, grouped by exit |
| [`media/animations/`](media/animations/) | Completed vertical animations |
| [`media/social/`](media/social/) | Social graphics and the 30-post planning workbook |
| [`extras/`](extras/) | Supporting analytics, geometry tools and landscape media |
| [`docs/`](docs/README.md) | Development, data, editorial, media and maintenance guides |
| [`scripts/`](scripts/) | Build/data/media checks, PNG regeneration and Pages staging |
| [`verification/`](verification/) | Integrity baselines and dated validation records |
| [`archives/`](archives/) | Preserved earlier research and build material |
| [`.github/`](.github/) | Actions, Dependabot, issue forms, PR template and code ownership |

## Run locally

Open [index.html](index.html) directly in a browser. The main application works
offline and needs no installation, API key or external fonts.

For a local web server:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Included

- Full-Parkway map and county browsing: 359 drawings at 84 exit areas.
- Original road shapes, unfolding animation and two-ramp comparison.
- 15 Top 10 categories: 11 shape comparisons and 4 traffic comparisons.
- 2024 average daily traffic counts and 2026 toll rates, including eligible
  peak/off-peak plans. Regular passenger-car rates do not vary by time of day.
- All 359 isolated PNGs, landscape and vertical MP4s, overlay drawings,
  supporting visual tools and the evergreen social plan.
- Editable source, inspectable data, provenance, checks and Pages deployment.

## Work on the project

Python 3 and Node.js are needed for the build checks; the website needs neither.

```sh
python3 source/build.py
python3 scripts/check.py
```

Start with the [project guides](docs/README.md). See [Development](docs/DEVELOPMENT.md), [Data and methods](docs/DATA.md),
[Media](docs/MEDIA.md), [editorial conventions](docs/editorial-conventions.txt),
[maintenance](docs/MAINTENANCE.md), [security](SECURITY.md),
[contributing](CONTRIBUTING.md) and [reuse terms](NOTICE.md).

## Supporting tools

- [Shape analytics and similarity](extras/GSP_Parkway_Analytics.html)
- [Original-geometry overlays and unfolding player](extras/true-visuals/GSP_True_Visuals.html)
- [All isolated shapes and their index](media/shapes/)
- [Vertical videos](media/animations/) and [social assets](media/social/)

## Source snapshots

Road geometry: NJDOT, August 21, 2025. Traffic: FHWA HPMS, 2024.
Tolls: NJ Turnpike Authority, 2026. These are dated snapshots, not live traffic
or a trip-price calculator. Some drawings show only part of a connection;
missing traffic estimates remain unavailable. See [source references](data/Source_References.json).

The [historical county kit](archives/) preserves the earlier research/build
material. `index.html` is the current application.

## Project safeguards

The project check rebuilds the page, verifies the five retained datasets and
all original vertices, decodes every isolated PNG, checks media hashes and
checks JavaScript syntax. Pull requests run checks without publishing.
The Pages workflow publishes the checked reader application from `main`;
the deployment badge links to its actual status and returned site URL.

CodeQL and Dependabot cover JavaScript and workflow dependencies. Repository
protections and security options are separate GitHub settings; workflow files
alone do not establish that those settings are enabled. See
[maintenance and recovery](docs/MAINTENANCE.md).

Live camera integration is paused while reuse permissions are checked.
The project has no automatic traffic or toll-data refresh.
