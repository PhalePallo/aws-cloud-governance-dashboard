// frontend/src/api.js
const API_BASE_URL = "https://quyd2gaji3.execute-api.us-east-1.amazonaws.com/dev";

export async function fetchAuditLogs() {
  const url = `${API_BASE_URL}/audit`;

  // Do NOT set Content-Type on a GET; it can trigger CORS preflight
  const response = await fetch(url, { method: "GET" });

  // Try to capture a useful error message
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`API request failed (${response.status}). ${text}`);
  }

  return response.json();
}
