import { createServer } from "node:http";

const port = Number(process.env.PORT || 8787);
const server = createServer(async (req, res) => {
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("access-control-allow-origin", process.env.CORS_ORIGIN || "http://localhost:3000");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }
  if (req.method === "GET" && req.url === "/api/health") {
    res.writeHead(200).end(JSON.stringify({ ok: true, service: "lawcall-api", mode: "development-scaffold" }));
    return;
  }
  if (req.method === "POST" && req.url === "/api/intake") {
    res.writeHead(501).end(JSON.stringify({
      error: "Intake storage is not configured yet.",
      message: "This starter intentionally does not store caller information. Configure authenticated tenant-aware persistence before accepting real client data."
    }));
    return;
  }
  res.writeHead(404).end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, () => {
  console.log(`Lawcall API listening on http://localhost:${port}`);
});
