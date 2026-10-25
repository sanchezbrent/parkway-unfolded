# Maintenance and recovery

## Routine checks

Review Actions failures, Security alerts and Dependabot pull requests each week.
Read release notes before merging action updates. This project has no npm or
Python runtime package dependencies; the optional archived movie renderer has
its own separate requirements.

Once a quarter, review the official source links in `docs/DATA.md`. Check for
new traffic releases and changes to road names or ramp coverage. Before each
January, check NJTA's next-year toll schedules, including vehicle classes,
payment methods, peak/off-peak definitions and eligibility rules. Check again
when NJTA announces a change. A passing build does not mean prices are current.

## Updating the project

1. Create a branch and make a focused change.
2. Retain original source files and record the source URL, publication date,
   effective date and retrieval date for a data update.
3. Compare changed records, missing records and totals. Do not turn missing
   traffic counts into zero or describe vehicle counts as people.
4. Rebuild, run `python3 scripts/check.py`, and inspect affected views on desktop
   and mobile. Update pinned data hashes only after reviewing intentional changes.
5. Open a pull request, review the diff and passing checks, then merge.
6. Verify the Pages deployment succeeds and inspect the published result.

Data is never refreshed or published automatically. Dependabot opens reviewable
pull requests for workflow actions; it does not merge them.

## Repository settings

Keep the repository public for this public project. Enable private vulnerability
reporting, dependency alerts, secret scanning and push protection when available.
Keep the default Actions token read-only. Pages deployment receives its write
permissions only in the deployment job.

Protect `main` with pull requests, the `check` status, and blocked force pushes
and deletion. Use zero mandatory approving reviewers while there is one
maintainer, so the owner can merge their own reviewed changes. Do not make a
deployment itself a required check for a pull request. Keep auto-merge off.

## Recovery

For a bad published change, use GitHub's **Revert** on its merged pull request,
review the resulting pull request, and merge after checks pass. For a direct
commit, create a branch and use `git revert <commit>`; do not rewrite `main`.
The normal Pages workflow republishes the restored version.

After a credential leak, revoke or rotate the credential at its provider first,
then remove it from the source and follow GitHub's sensitive-data removal
guidance. Removing a file alone does not remove it from Git history.

Keep a separate occasional local `git clone --mirror` backup and preserve any
new original media. GitHub's commit history and the source archives help with
recovery but do not replace an independent backup.
