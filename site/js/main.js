/*
 * Community Needs Indexing - the single working v1 module.
 * Fetches /data/community_needs_index.json (path is relative to
 * /site/, since the notebook always writes into the repo-level
 * /data folder, not a copy inside /site) and renders a Chart.js
 * line chart: Allegheny County vs. Pennsylvania vs. United States.
 *
 * If the file's series values are still null (placeholder, not yet
 * pulled), this shows an explicit "no data loaded yet" state rather
 * than a chart full of zeros - a zero-filled chart would misread as
 * a real indicator value of zero, not as missing data.
 */

const DATA_URL = "../data/community_needs_index.json";
const ACCENTS = {
  "Allegheny County": "#E4E6DA",
  "Pennsylvania": "#4FA39A",
  "United States": "#C27A5F",
};

async function loadCommunityNeedsIndex() {
  const wrap = document.getElementById("cni-chart-wrap");
  const labelEl = document.getElementById("cni-indicator-label");
  const stampEl = document.getElementById("cni-snapshot-stamp");
  const sourceEl = document.getElementById("cni-source");
  if (!wrap) return;

  let payload;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    payload = await res.json();
  } catch (err) {
    wrap.innerHTML = `<div class="chart-empty-state">Could not load the data file (${escapeHtml(
      String(err.message || err)
    )}). Check that /data/community_needs_index.json exists relative to this page.</div>`;
    return;
  }

  if (labelEl) labelEl.textContent = payload.indicator || "Indicator not set";
  if (stampEl) {
    stampEl.textContent = `Snapshot as of ${payload.snapshot_as_of || "unknown"} - not continuously updated`;
  }
  if (sourceEl) sourceEl.textContent = payload.source || "Source not set";

  const series = Array.isArray(payload.series) ? payload.series : [];
  const geographies = payload.geographies || [];
  const hasRealData = series.some((row) =>
    geographies.some((g) => row[g] !== null && row[g] !== undefined)
  );

  if (!hasRealData) {
    wrap.innerHTML =
      '<div class="chart-empty-state">No data loaded yet. This module is wired up but the data file is a placeholder schema - run notebooks/pull_clean_export.ipynb against a real WPRDC or Census/ACS source, then re-export to /data/community_needs_index.json.</div>';
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    `Line chart: ${payload.indicator}, by year, for ${geographies.join(", ")}`
  );
  wrap.innerHTML = "";
  wrap.appendChild(canvas);

  const datasets = geographies.map((geo) => ({
    label: geo,
    data: series.map((row) => row[geo]),
    borderColor: ACCENTS[geo] || "#9B9E8F",
    backgroundColor: "transparent",
    tension: 0.15,
    spanGaps: true,
  }));

  new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: series.map((row) => row.year),
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { color: "#E4E6DA" } },
      },
      scales: {
        x: {
          ticks: { color: "#9B9E8F" },
          grid: { color: "#32352A" },
        },
        y: {
          title: { display: true, text: payload.unit || "", color: "#9B9E8F" },
          ticks: { color: "#9B9E8F" },
          grid: { color: "#32352A" },
        },
      },
    },
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", loadCommunityNeedsIndex);
