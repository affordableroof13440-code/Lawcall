export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return Response.json({
        ok: true,
        service: "lawcall",
        mode: "cloudflare-worker-scaffold"
      });
    }

    if (url.pathname === "/api/intake" && request.method === "POST") {
      return Response.json(
        {
          error: "Intake storage is not configured yet.",
          message: "Do not submit real client information until authenticated, tenant-aware storage and access controls are implemented."
        },
        { status: 501 }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
