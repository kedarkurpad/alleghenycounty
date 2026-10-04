/*
 * Shared loaders for every data module on this page.
 * loadIndicatorChart  -> multi-year line chart (one line per geography)
 * loadBarChart        -> single-year grouped bar chart (one bar per geography)
 * Both fetch their own data file, relative to /site/, into their own DOM ids.
 * Both show an explicit "no data loaded yet" state instead of a misleading
 * zero-filled chart when the data file is still a null placeholder.
 */

const ACCENTS = {
  "Allegheny County": "#E4E6DA",
  "Pennsylvania": "#4FA39A",
  "United States": "#C27A5F",
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function fetchIndicatorPayload(dataUrl, wrap) {
  try {
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    wrap.innerHTML = `<div class="chart-empty-state">Could not load the data file (${escapeHtml(
      String(err.message || err)
    )}). Check that ${escapeHtml(dataUrl)} exists relative to this page.</div>`;
    return null;
  }
}

async function loadIndicatorChart({ dataUrl, wrapId, labelId, stampId, sourceId }) {
  const wrap = document.getElementById(wrapId);
  const labelEl = document.getElementById(labelId);
  const stampEl = document.getElementById(stampId);
  const sourceEl = document.getElementById(sourceId);
  if (!wrap) return;

  const payload = await fetchIndicatorPayload(dataUrl, wrap);
  if (!payload) return;

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
    data: { labels: series.map((row) => row.year), datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { color: "#E4E6DA" } } },
      scales: {
        x: { ticks: { color: "#9B9E8F" }, grid: { color: "#32352A" } },
        y: {
          title: { display: true, text: payload.unit || "", color: "#9B9E8F" },
          ticks: { color: "#9B9E8F" },
          grid: { color: "#32352A" },
        },
      },
    },
  });
}

async function loadBarChart({ dataUrl, wrapId, labelId, stampId, sourceId }) {
  const wrap = document.getElementById(wrapId);
  const labelEl = document.getElementById(labelId);
  const stampEl = document.getElementById(stampId);
  const sourceEl = document.getElementById(sourceId);
  if (!wrap) return;

  const payload = await fetchIndicatorPayload(dataUrl, wrap);
  if (!payload) return;

  if (labelEl) labelEl.textContent = payload.indicator || "Indicator not set";
  if (stampEl) {
    const yearPart = payload.year ? `, ${payload.year}` : "";
    stampEl.textContent = `Snapshot as of ${payload.snapshot_as_of || "unknown"}${yearPart} - single year, not a trend`;
  }
  if (sourceEl) sourceEl.textContent = payload.source || "Source not set";

  const geographies = payload.geographies || [];
  const values = payload.values || {};
  const hasRealData = geographies.some((g) => values[g] !== null && values[g] !== undefined);

  if (!hasRealData) {
    wrap.innerHTML =
      '<div class="chart-empty-state">No data loaded yet. This module is wired up but the data file is a placeholder schema - run the matching notebook, then re-export.</div>';
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    `Bar chart: ${payload.indicator}, one value per geography, for ${geographies.join(", ")}`
  );
  wrap.innerHTML = "";
  wrap.appendChild(canvas);

  new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: geographies,
      datasets: [
        {
          label: payload.indicator || "",
          data: geographies.map((g) => values[g]),
          backgroundColor: geographies.map((g) => ACCENTS[g] || "#9B9E8F"),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#9B9E8F" }, grid: { display: false } },
        y: {
          title: { display: true, text: payload.unit || "", color: "#9B9E8F" },
          ticks: { color: "#9B9E8F" },
          grid: { color: "#32352A" },
        },
      },
    },
  });
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
  loadIndicatorChart({
    dataUrl: "../data/uninsured_rate.json",
    wrapId: "unins-chart-wrap",
    labelId: "unins-indicator-label",
    stampId: "unins-snapshot-stamp",
    sourceId: "unins-source",
  });
  loadIndicatorChart({
    dataUrl: "../data/housing_cost_burden.json",
    wrapId: "housing-chart-wrap",
    labelId: "housing-indicator-label",
    stampId: "housing-snapshot-stamp",
    sourceId: "housing-source",
  });
  loadBarChart({
    dataUrl: "../data/gini_index.json",
    wrapId: "gini-chart-wrap",
    labelId: "gini-indicator-label",
    stampId: "gini-snapshot-stamp",
    sourceId: "gini-source",
  });
});
