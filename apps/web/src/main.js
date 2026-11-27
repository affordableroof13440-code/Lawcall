const apiStatus = document.querySelector("#api-status");
const badge = document.querySelector("#status");

try {
  const response = await fetch("/api/health");
  if (!response.ok) throw new Error("API unavailable");
  const data = await response.json();
  apiStatus.textContent = data.ok ? "Online" : "Unavailable";
  badge.textContent = "API connected";
  badge.style.color = "#18794e";
  badge.style.background = "#e8f7ef";
} catch {
  apiStatus.textContent = "Not reachable";
  badge.textContent = "API offline";
}
