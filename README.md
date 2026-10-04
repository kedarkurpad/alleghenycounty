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

- Single page, nav collapsed to one category, not live yet. All five modules are stacked on this
  one page for now - revisit splitting into sections once this gets long enough to warrant it.
- All headline/intro/footer copy in `site/index.html` is a `[PLACEHOLDER]` block. Replace and review
  before publishing anything.
- Five live data modules, all Allegheny County vs. Pennsylvania vs. United States:
  - **Community Needs Indexing** - SNAP / food stamp receipt rate (line chart). Census ACS5 S2201.
  - **Unemployment Rate** - annual average (line chart). FRED series PAALLE3URN / PAUR / UNRATE.
  - **Uninsured Rate** (line chart). Census ACS5 Subject Table S2701.
  - **Housing Cost Burden** - renters paying 35%+ of income on rent (line chart). Census ACS5 Data Profile DP04.
  - **Income Inequality (Gini Index)** - single most-recent year (bar chart, not a time series - Gini
    moves too slowly for a multi-year trend to mean anything at this margin of error). Census ACS5 B19083.
- Additional pages (separate sections, full nav) come back when deliberately re-expanded. See `parked-ideas.md`.

## Local dev

```bash
cd site
python3 -m http.server 8000
```

`fetch()` of local JSON is blocked over `file://`, hence the server. `site/js/main.js` has two shared
loaders - `loadIndicatorChart` for line charts, `loadBarChart` for the Gini bar chart - each fetching
its own data file relative to `/site/`.

## Updating data

Two API keys, five notebooks, same pattern across all of them.

### Option A - run from GitHub, keys never touch your machine (recommended)

1. Repo Settings -> Secrets and variables -> **Actions** -> New repository secret for each:
   `CENSUS_API_KEY` and `FRED_API_KEY`.
2. Actions tab -> "Run data pipeline (manual)" -> **Run workflow**.
3. Runs all five notebooks, commits the updated `/data` and `/raw` files, pushes to `main` - which
   triggers the Pages deploy automatically.

### Option B - run locally in the Codespace

1. `pip install -r notebooks/requirements.txt`
2. `export CENSUS_API_KEY=your_key` and `export FRED_API_KEY=your_key` in the terminal - session-only,
   never written to disk or git. If running a notebook's kernel directly rather than the terminal, the
   kernel needs to already exist in an environment where these are set, or you paste the key into a
   throwaway cell and delete it before saving/committing.
3. Run whichever notebook(s) you need top to bottom:
   `pull_clean_export.ipynb`, `pull_uninsured.ipynb`, `pull_housing_cost_burden.ipynb`,
   `pull_gini.ipynb` (all four use `CENSUS_API_KEY`), `pull_unemployment.ipynb` (uses `FRED_API_KEY`).
4. Commit, push.

## Pages setup

1. Repo Settings -> Pages -> Source -> GitHub Actions.
2. `.github/workflows/pages.yml` deploys on every push to `main`. Not a cron job.
3. It uploads the whole repo (not just `/site`) so `../data/...` fetches resolve the same way locally and
   once published. That's also why `/site/index.html` is the real dashboard, not the repo root, hence
   the redirect at `/index.html`.
4. `/site/.nojekyll` stops GitHub Pages from running files through Jekyll.
