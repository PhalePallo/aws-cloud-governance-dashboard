import { fetchAuditLogs } from "./api.js";

const loadBtn = document.getElementById("loadLogsBtn");
const statusEl = document.getElementById("status");
const logsEl = document.getElementById("logs");

const searchInput = document.getElementById("searchInput");
const actionFilter = document.getElementById("actionFilter");
const sortSelect = document.getElementById("sortSelect");
const resultCountEl = document.getElementById("resultCount");
const healthEl = document.getElementById("health");

const sumTotalEl = document.getElementById("sumTotal");
const sumCreateEl = document.getElementById("sumCreate");
const sumUpdateEl = document.getElementById("sumUpdate");
const sumDeleteEl = document.getElementById("sumDelete");

let allLogs = []; // raw logs from API

function setStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

function clearLogs() {
  logsEl.innerHTML = "";
}

function safeStr(v) {
  return (v === null || v === undefined) ? "" : String(v);
}

function parseTimestamp(ts) {
  const t = Date.parse(ts ?? "");
  return Number.isFinite(t) ? t : 0;
}

function formatLocal(ts) {
  const d = new Date(ts);
  return Number.isNaN(d.valueOf()) ? "—" : d.toLocaleString();
}

function computeSummary(logs) {
  const counts = { total: logs.length, CREATE: 0, UPDATE: 0, DELETE: 0 };

  for (const l of logs) {
    const a = safeStr(l?.action).toUpperCase();
    if (a === "CREATE") counts.CREATE++;
    else if (a === "UPDATE") counts.UPDATE++;
    else if (a === "DELETE") counts.DELETE++;
  }

  sumTotalEl.textContent = String(counts.total);
  sumCreateEl.textContent = String(counts.CREATE);
  sumUpdateEl.textContent = String(counts.UPDATE);
  sumDeleteEl.textContent = String(counts.DELETE);
}

function computeHealth(logs) {
  if (!Array.isArray(logs) || logs.length === 0) {
    healthEl.textContent = "No data";
    healthEl.dataset.state = "unknown";
    return;
  }

  const latest = Math.max(...logs.map(l => parseTimestamp(l?.timestamp)));
  if (!latest) {
    healthEl.textContent = "Timestamp missing";
    healthEl.dataset.state = "unknown";
    return;
  }

  const minutesAgo = Math.floor((Date.now() - latest) / 60000);

  if (minutesAgo <= 10) {
    healthEl.textContent = `Healthy (last event ${minutesAgo}m ago)`;
    healthEl.dataset.state = "good";
  } else if (minutesAgo <= 60) {
    healthEl.textContent = `Delayed (last event ${minutesAgo}m ago)`;
    healthEl.dataset.state = "warn";
  } else {
    healthEl.textContent = `Stale (last event ${minutesAgo}m ago)`;
    healthEl.dataset.state = "bad";
  }
}

function applyView() {
  const q = safeStr(searchInput.value).trim().toLowerCase();
  const action = safeStr(actionFilter.value).toUpperCase();
  const sort = safeStr(sortSelect.value).toUpperCase();

  let view = Array.isArray(allLogs) ? [...allLogs] : [];

  // Filter by action
  if (action !== "ALL") {
    view = view.filter(l => safeStr(l?.action).toUpperCase() === action);
  }

  // Search across action/resource/id
  if (q) {
    view = view.filter(l => {
      const hay = [
        safeStr(l?.action),
        safeStr(l?.resource),
        safeStr(l?.id),
      ].join(" ").toLowerCase();

      return hay.includes(q);
    });
  }

  // Sort by timestamp
  view.sort((a, b) => {
    const ta = parseTimestamp(a?.timestamp);
    const tb = parseTimestamp(b?.timestamp);
    return sort === "OLDEST" ? (ta - tb) : (tb - ta);
  });

  // Update counters
  resultCountEl.textContent = String(view.length);
  computeSummary(view);
  computeHealth(view);

  // Render
  renderLogs(view);
}

function renderLogs(logs) {
  clearLogs();

  if (!Array.isArray(logs) || logs.length === 0) {
    setStatus("No audit logs match the current filters.", "info");
    return;
  }

  const frag = document.createDocumentFragment();

  for (const log of logs) {
    const li = document.createElement("li");
    li.className = "log-item";

    const action = safeStr(log?.action).toUpperCase() || "UNKNOWN";
    const resource = safeStr(log?.resource) || "Unknown resource";
    const id = safeStr(log?.id) || "—";
    const ts = parseTimestamp(log?.timestamp);
    const tsText = ts ? formatLocal(ts) : "—";

    li.innerHTML = `
      <div class="log-row">
        <span class="pill" data-action="${action}">${action}</span>
        <span class="log-title">${escapeHtml(resource)}</span>
      </div>
      <div class="log-meta">
        <span><strong>ID:</strong> ${escapeHtml(id)}</span>
        <span><strong>Time:</strong> ${escapeHtml(tsText)}</span>
      </div>
    `;

    frag.appendChild(li);
  }

  logsEl.appendChild(frag);
  setStatus(`Loaded ${logs.length} audit log(s).`, "success");
}

function escapeHtml(value) {
  return safeStr(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadLogs() {
  setStatus("Loading audit logs...", "info");
  loadBtn.disabled = true;

  try {
    const logs = await fetchAuditLogs();

    // Support both shapes:
    // - array (current)
    // - { items: [], nextToken: "..." } (future upgrade)
    allLogs = Array.isArray(logs) ? logs : (logs?.items ?? []);

    if (!Array.isArray(allLogs)) allLogs = [];
    setStatus(`Fetched ${allLogs.length} log(s).`, "success");

    // Apply current filters/search/sort
    applyView();
  } catch (err) {
    console.error(err);
    allLogs = [];
    clearLogs();
    resultCountEl.textContent = "0";
    computeSummary([]);
    computeHealth([]);
    setStatus(`Failed to load logs. ${err?.message ?? ""}`.trim(), "error");
  } finally {
    loadBtn.disabled = false;
  }
}

// Hook up UI controls
loadBtn.addEventListener("click", loadLogs);
searchInput.addEventListener("input", () => applyView());
actionFilter.addEventListener("change", () => applyView());
sortSelect.addEventListener("change", () => applyView());

// Initial state
computeSummary([]);
computeHealth([]);
setStatus("Ready. Click “Load Audit Logs”.", "info");
