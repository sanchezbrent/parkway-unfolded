# Security

The supported version is the current `main` branch and its GitHub Pages build.
This is a static, browser-local application. It has no accounts, backend service,
analytics service or runtime API keys.

## Report a vulnerability privately

Use **Security → Advisories → Report a vulnerability** on this repository.
Do not post exploitable details, passwords, tokens or private information in a
public issue. If private reporting is unavailable, open an issue asking the
maintainer for a private reporting channel without including sensitive details.

For incorrect tolls, traffic counts or labels, use the public **Data correction**
issue template and link the official source. Those are editorial corrections
unless they expose a security vulnerability.

## Maintenance

GitHub Actions verify the reproducible build, preserved source data and media.
CodeQL scans JavaScript on changes and weekly. Dependabot proposes updates to
pinned workflow actions; updates require review. Workflows use restricted tokens
and never deploy pull-request code. Main-branch protections and repository
security settings are administered in GitHub, outside the source files.

See [the maintenance guide](docs/MAINTENANCE.md) for updates and recovery.
