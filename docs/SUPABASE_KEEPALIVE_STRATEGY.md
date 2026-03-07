# Supabase Free Plan Anti-Pause Strategy

Last reviewed: 2026-03-07

## Problem

On Supabase Free plan, low-activity projects can be paused automatically.  
If the app depends on Supabase Auth/Storage/API, unexpected pauses can break user flows.

## Research Summary

### Official sources

- Supabase Production Checklist says Free plan apps with very low activity in a 7-day period may be paused, and Pro avoids inactivity pause.
- Supabase Billing docs state paid organizations do not have inactivity pausing.
- Supabase HTTP status docs define `540 project paused`.
- Supabase Management API provides `POST /v1/projects/{ref}/restore` to restore a paused project.

### Community signals

- Supabase GitHub Discussion #27497 confirms free projects are paused after 1 week of inactivity.
- Supabase GitHub Discussion #30576 indicates API or dashboard activity contributes to keeping a project active.
- Community repos and scripts commonly use scheduled keepalive requests.
- GitHub docs warn scheduled workflows are best-effort and can be delayed, and can be auto-disabled after 60 days of no repo activity.

## Selected Solution for This Repo

This repo now includes a 2-layer mitigation:

1. Daily keepalive request from GitHub Actions to the Supabase REST endpoint.
2. If probe returns paused signal (`540` or paused message), call Supabase Management API restore endpoint automatically.

Implemented files:

- `.github/workflows/supabase-keepalive.yml`
- `scripts/supabase-keepalive.mjs`
- `package.json` script: `npm run supabase:keepalive`

## Setup

Add these GitHub repository secrets:

- `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_PROJECT_REF`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `SUPABASE_ANON_KEY`)
- `SUPABASE_ACCESS_TOKEN` (recommended for auto-restore)

Notes:

- `SUPABASE_ACCESS_TOKEN` should be a Supabase Personal Access Token with access to the target project.
- Without `SUPABASE_ACCESS_TOKEN`, keepalive still runs, but auto-restore cannot run.

## Operations

- Manual run: Actions tab -> `Supabase Keepalive` -> `Run workflow`.
- Local run:
  - Export required env vars.
  - Run `npm run supabase:keepalive`.

## Limits and Tradeoffs

- This is a mitigation, not a contractual guarantee against inactivity pause.
- For production SLA needs, moving organization to Pro/Team is still the reliable option.
- Scheduled GitHub workflows are not hard real-time and may be delayed.
- In public repos, schedule workflows may auto-disable after long inactivity and must be re-enabled.

## Sources

- https://supabase.com/docs/guides/deployment/going-into-prod
- https://supabase.com/docs/guides/platform/billing-on-supabase
- https://supabase.com/docs/guides/troubleshooting/http-status-codes
- https://supabase.com/docs/reference/api/v1-restore-a-project
- https://github.com/orgs/supabase/discussions/27497
- https://github.com/orgs/supabase/discussions/30576
- https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule
