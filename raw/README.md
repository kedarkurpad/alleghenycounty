# /raw

Cached raw pulls from each pipeline run, dated, kept for reproducibility.

`notebooks/pull_clean_export.ipynb` writes files here named like:

```
community_needs_index_raw_2026-10-03.json
```

Nothing in this folder is read by the site directly - only `/data/*.json` is fetched at page load. This folder is just the audit trail for how `/data` was produced.
