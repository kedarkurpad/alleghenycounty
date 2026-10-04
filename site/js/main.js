/*
 * Shared loader for every "line chart by geography" module on this page.
 * Each module fetches its own data file, relative to /site/, and renders
 * into its own set of DOM ids. If a data file's series values are still
 * null (placeholder, not yet pulled), shows an explicit "no data loaded
 * yet" state instead of a misleading zero-filled chart.
 */

const ACCENTS = {
  "Allegheny County": "#E4E6DA",
  "Pennsylvania": "#4FA39A",
  "United States": "#C27A5F",
};

async function loadIndicatorChart({ dataUrl, wrapId, labelId, stampId, sourceId }) {
  const wrap = document.getElementById(wrapId);
  const labelEl = document.getElementById(labelId);
  const stampEl = document.getElementById(stampId);
  const sourceEl = document.getElementById(sourceId);
  if (!wrap) return;

  let payload;
  try {
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    payload = await res.json();
  } catch (err) {
    wrap.innerHTML = `<div class="chart-empty-state">Could not load the data file (${escapeHtml(
      String(err.message || err)
    )}). Check that ${escapeHtml(dataUrl)} exists relative to this page.</div>`;
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
      '<div class="chart-empty-state">No data loaded yet. This module is wired up but the data file is a placeholder schema - run the matching notebook, then re-export.</div>';
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

document.addEventListener("DOMContentLoaded", () => {
  loadIndicatorChart({
    dataUrl: "../data/community_needs_index.json",
    wrapId: "cni-chart-wrap",
    labelId: "cni-indicator-label",
    stampId: "cni-snapshot-stamp",
    sourceId: "cni-source",
  });
  loadIndicatorChart({
    dataUrl: "../data/unemployment_rate.json",
    wrapId: "unemp-chart-wrap",
    labelId: "unemp-indicator-label",
    stampId: "unemp-snapshot-stamp",
    sourceId: "unemp-source",
  });
});
