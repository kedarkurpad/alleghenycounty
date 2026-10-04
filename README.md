# Allegheny County reference dashboard (working repo name)

Static site. No backend, no login, no scheduled updates.

## Structure

```
/data        -> JSON the site reads, output of the pipeline
/notebooks   -> pull/clean/export notebooks, run by hand
/site        -> single page for now (index.html, /css, /js)
/raw         -> dated cache of raw pulls
```

`/index.html` at repo root redirects to `/site/index.html` (see "Pages setup" below for why).

## Current state

- Single page, nav collapsed to one category, not live yet.
- All headline/intro/footer copy in `site/index.html` is a `[PLACEHOLDER]` block. Replace and review
  before publishing anything.
- Two live data modules, both Allegheny County vs. Pennsylvania vs. United States:
  - **Community Needs Indexing** - SNAP / food stamp receipt rate, Census ACS5 Subject Table S2201.
  - **Unemployment Rate** - annual average, FRED series `PAALLE3URN` / `PAUR` / `UNRATE`.
- Additional pages (separate sections, full nav) come back when deliberately re-expanded. See `parked-ideas.md`.

## Local dev

```bash
cd site
python3 -m http.server 8000
```

`fetch()` of local JSON is blocked over `file://`, hence the server. `site/js/main.js` fetches both data
files with one shared loader function, each relative to `/site/`.

## Updating data

Two independent pipelines, two API keys, same pattern for both.

### Option A - run from GitHub, keys never touch your machine (recommended)

1. Repo Settings -> Secrets and variables -> **Actions** -> New repository secret for each:
   `CENSUS_API_KEY` and `FRED_API_KEY`.
2. Actions tab -> "Run data pipeline (manual)" -> **Run workflow**.
3. Runs both notebooks, commits the updated `/data` and `/raw` files, pushes to `main` - which triggers
   the Pages deploy automatically.

### Option B - run locally in the Codespace

1. `pip install -r notebooks/requirements.txt`
2. `export CENSUS_API_KEY=your_key` and `export FRED_API_KEY=your_key` in the terminal - session-only,
   never written to disk or git. If running the notebook (not the terminal) directly, the kernel needs to
   already exist in an environment where these are set, or you paste the key into a throwaway cell and
   delete it before saving/committing.
3. Run `notebooks/pull_clean_export.ipynb` and/or `notebooks/pull_unemployment.ipynb` top to bottom.
4. Commit, push.

## Pages setup

1. Repo Settings -> Pages -> Source -> GitHub Actions.
2. `.github/workflows/pages.yml` deploys on every push to `main`. Not a cron job.
3. It uploads the whole repo (not just `/site`) so `../data/...` fetches resolve the same way locally and
   once published. That's also why `/site/index.html` is the real dashboard, not the repo root, hence
   the redirect at `/index.html`.
4. `/site/.nojekyll` stops GitHub Pages from running files through Jekyll.
