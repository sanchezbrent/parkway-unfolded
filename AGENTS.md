# Project instructions

Parkway Unfolded is for everyday New Jersey drivers. Preserve its approved
design and original road geometry. Keep changes focused on the requested work.

- Edit `source/` and rebuild `index.html` with `python3 source/build.py`.
  Do not edit only the generated page. Run `python3 scripts/check.py` before
  submitting a change; Python 3 and Node.js are the only check requirements.
- Keep all five canonical datasets, 359 drawings and 12,877 source vertices
  intact for interface and editorial changes. Intentional data changes need
  reviewed official sources, a documented diff and deliberate baseline updates.
- Preserve north-up orientation, all vertices and uniform scaling. Do not
  rotate, smooth, invent bends or use generated imagery for road geometry.
- Write public copy in plain language. Put raw IDs, methods and formulas in
  optional data notes, research files or machine-readable export metadata.
- Preserve the looped P / hairpin U wordmark, full-Parkway opening view, county
  browsing, compact Traffic/Tolls controls, gold Top 10s and consistent themes.
- Keep missing traffic values unavailable; counts describe vehicles, not
  people, and overlapping counts must not be summed. Keep dates attached.
- Decode PNG exports as well as verifying hashes. Review deliberate asset
  replacements and record their old/new hashes in the integrity metadata.
- Camera integration is paused pending the owner's permissions research.
  Do not add camera feeds as part of unrelated maintenance.
- Do not select a reuse license or claim data rights for the owner. Retain
  `NOTICE.md` and source terms.
- Prefer a focused branch and pull request. Never rewrite remote history.
  Only report upload, checks, repository settings or publication as active
  after verifying the actual GitHub state.

See `docs/README.md`, `docs/editorial-conventions.txt` and
`docs/MAINTENANCE.md` for the established conventions.
