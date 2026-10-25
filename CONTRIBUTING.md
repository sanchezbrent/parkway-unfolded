# Contributing

Use issues for bugs, data corrections and feature ideas. Include an exit number,
movement, browser/view and source link when relevant. Never include account
credentials or private information in reports.

Keep changes focused; stack dependent pull requests when practical. Preserve
original coordinates and meaningful uncertainty. Do not convert missing
traffic into zero, sum overlapping counts, infer toll-booth inventories, or
present the curves as engineering/safety findings.

Write for everyday New Jersey drivers. Keep technical evidence in optional
deeper-reading layers. Preserve the compact Traffic/Tolls controls, readable
type, flat surfaces, consistent themes and prominent Top 10s link.

Build and check before submitting:

```sh
python3 source/build.py
python3 scripts/check.py
```

For data changes, explain the source date, coverage, calculation and effect on
existing comparisons. For visual changes, check desktop/mobile and both themes.
