// frontend/src/app.js
import { fetchAuditLogs } from "./api.js";

const loadBtn = document.getElementById("loadLogsBtn");
const statusEl = document.getElementById("status");
const logsEl = document.getElementById("logs");

function setStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.dataset.type = type; // used by CSS
}

function clearLogs() {
  logsEl.innerHTML = "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderLogs(logs) {
  clearLogs();

  if (!Array.isArray(logs) || logs.length === 0) {
    setStatus("No audit logs found.", "info");
    return;
  }

  // Sort newest first if timestamp exists
  const sorted = [...logs].sort((a, b) => {
    const ta = Date.parse(a?.timestamp ?? "") || 0;
    const tb = Date.parse(b?.timestamp ?? "") || 0;
    return tb - ta;
  });

  const frag = document.createDocumentFragment();

  for (const log of sorted) {
    const li = document.createElement("li");
    li.className = "log-item";

    const action = escapeHtml(log?.action ?? "UNKNOWN");
    const resource = escapeHtml(log?.resource ?? "Unknown resource");
    const id = escapeHtml(log?.id ?? "");
    const tsRaw = log?.timestamp ? new Date(log.timestamp) : null;
    const ts = tsRaw && !Number.isNaN(tsRaw.valueOf()) ? tsRaw.toLocaleString() : "—";

    li.innerHTML = `
      <div class="log-row">
        <span class="pill">${action}</span>
        <span class="log-title">${resource}</span>
      </div>
      <div class="log-meta">
        <span><strong>ID:</strong> ${id || "—"}</span>
        <span><strong>Time:</strong> ${escapeHtml(ts)}</span>
      </div>
    `;

    frag.appendChild(li);
  }

  logsEl.appendChild(frag);
  setStatus(`Loaded ${sorted.length} audit log(s).`, "success");
}

async function loadLogs() {
  setStatus("Loading audit logs...", "info");
  loadBtn.disabled = true;

  try {
    const logs = await fetchAuditLogs();
    renderLogs(logs);
  } catch (err) {
    console.error(err);
    clearLogs();
    setStatus(`Backend not reachable or returned an error. ${err?.message ?? ""}`, "error");
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadLogs);
