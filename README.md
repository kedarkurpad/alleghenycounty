# Allegheny County reference dashboard (working repo name)

Static site. No backend, no login, no scheduled updates.

## Structure

```
/data        -> JSON the site reads, output of the pipeline
/notebooks   -> pull/clean/export, run by hand a few times/year
/site        -> single page for now (index.html, /css, /js)
/raw         -> dated cache of raw pulls
```

`/index.html` at repo root redirects to `/site/index.html` (see "Pages setup" below for why).

## Current state

- Single page, nav collapsed to one category, not live yet.
- All visible copy in `site/index.html` is a `[PLACEHOLDER]` block. Replace and review before publishing
  anything; do not ship drafted copy without reading it first.
- `data/community_needs_index.json` has `null` values on purpose. The chart shows "no data loaded yet"
  until `notebooks/pull_clean_export.ipynb` is run against a real source.
- Additional pages (separate sections, full nav) come back when deliberately re-expanded. See `parked-ideas.md`.

## Local dev

```bash
cd site
python3 -m http.server 8000
```

`fetch()` of local JSON is blocked over `file://`, hence the server. `js/main.js` fetches
`../data/community_needs_index.json`, relative to `/site/`.

## Updating data

1. Set `SOURCE_URL` in `notebooks/pull_clean_export.ipynb` to a real WPRDC or Census/ACS endpoint.
2. Run it. Writes a dated raw cache to `/raw`, overwrites `/data/community_needs_index.json`.
3. Commit, push.

## Pages setup

1. Repo Settings -> Pages -> Source -> GitHub Actions.
2. `.github/workflows/pages.yml` deploys on every push to `main`. Not a cron job.
3. It uploads the whole repo (not just `/site`) so `../data/...` fetches resolve the same way locally and
   once published. That's also why `/site/index.html` is the real dashboard, not the repo root, hence
   the redirect at `/index.html`.
4. `/site/.nojekyll` stops GitHub Pages from running files through Jekyll.
