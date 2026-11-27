function json(data, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function authorized(request, env) {
  const expected = env.LAWCALL_INTERNAL_API_TOKEN;
  const supplied = request.headers.get("Authorization") || "";
  if (typeof expected !== "string" || expected.length < 32) return false;
  const actual = supplied.startsWith("Bearer ") ? supplied.slice(7) : "";
  if (actual.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  }
  return mismatch === 0;
}

async function groqSpeech(request, env) {
  if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
  if (!env.GROQ_API_KEY) return json({ error: "Groq is not configured. Add GROQ_API_KEY as a Worker secret." }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Send valid JSON." }, 400); }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const voices = new Set(["autumn", "diana", "hannah", "austin", "daniel", "troy"]);
  const voice = voices.has(body.voice) ? body.voice : "autumn";
  if (!text || text.length > 2000) return json({ error: "Text must contain 1 to 2,000 characters." }, 400);

  const upstream = await fetch("https://api.groq.com/openai/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "canopylabs/orpheus-v1-english",
      input: text,
      voice,
      response_format: "wav"
    })
  });
  if (!upstream.ok) {
    return json({ error: "Groq speech request failed.", provider_status: upstream.status }, 502);
  }
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

async function groqTranscribe(request, env) {
  if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
  if (!env.GROQ_API_KEY) return json({ error: "Groq is not configured. Add GROQ_API_KEY as a Worker secret." }, 503);
  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > 25 * 1024 * 1024) return json({ error: "Audio upload exceeds 25 MB." }, 413);
  if (!request.headers.get("Content-Type")?.includes("multipart/form-data")) {
    return json({ error: "Send audio as multipart/form-data using the field named file." }, 415);
  }

  let form;
  try { form = await request.formData(); } catch { return json({ error: "Invalid audio upload." }, 400); }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return json({ error: "An audio file is required in the file field." }, 400);
  if (file.size > 25 * 1024 * 1024) return json({ error: "Audio upload exceeds 25 MB." }, 413);

  const upstreamForm = new FormData();
  upstreamForm.append("file", file, file.name || "recording.wav");
  upstreamForm.append("model", "whisper-large-v3-turbo");
  upstreamForm.append("response_format", "json");
  const upstream = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.GROQ_API_KEY}` },
    body: upstreamForm
  });
  if (!upstream.ok) return json({ error: "Groq transcription request failed.", provider_status: upstream.status }, 502);
  const result = await upstream.json();
  return json({ text: typeof result.text === "string" ? result.text : "" });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, service: "lawcall", mode: "groq-voice-adapter-ready" });
    }

    if (url.pathname === "/api/voice/speech" && request.method === "POST") {
      return groqSpeech(request, env);
    }

    if (url.pathname === "/api/voice/transcribe" && request.method === "POST") {
      return groqTranscribe(request, env);
    }

    // Demo-only persistence: accepts no caller-supplied personal information.
    // Real client intake remains disabled until authentication and tenant isolation ship.
    if (url.pathname === "/api/demo/inquiries" && request.method === "POST") {
      if (!env.DB) return json({ error: "D1 binding DB is missing." }, 503);
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS demo_inquiries (
            id TEXT PRIMARY KEY,
            contact_name TEXT NOT NULL,
            matter_type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'New',
            created_at TEXT NOT NULL
          )
        `).run();
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        await env.DB.prepare(
          "INSERT INTO demo_inquiries (id, contact_name, matter_type, status, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(id, "Taylor Demo (TEST)", "Demo matter — not a real client", "New", createdAt).run();
        return json({ ok: true, inquiry: { id, contact_name: "Taylor Demo (TEST)", matter_type: "Demo matter — not a real client", status: "New", created_at: createdAt } }, 201);
      } catch (error) {
        return json({ error: "Could not save demo inquiry.", detail: String(error?.message || error) }, 500);
      }
    }

    if (url.pathname === "/api/demo/inquiries" && request.method === "GET") {
      if (!env.DB) return json({ error: "D1 binding DB is missing." }, 503);
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS demo_inquiries (
            id TEXT PRIMARY KEY,
            contact_name TEXT NOT NULL,
            matter_type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'New',
            created_at TEXT NOT NULL
          )
        `).run();
        const result = await env.DB.prepare(
          "SELECT id, contact_name, matter_type, status, created_at FROM demo_inquiries ORDER BY created_at DESC LIMIT 25"
        ).all();
        return json({ ok: true, inquiries: result.results || [] });
      } catch (error) {
        return json({ error: "Could not load demo inquiries.", detail: String(error?.message || error) }, 500);
      }
    }

    if (url.pathname === "/api/intake" && request.method === "POST") {
      return json({
        error: "Real client intake is not enabled yet.",
        message: "Authenticated firm accounts, tenant isolation, and protected document access must be completed before real client data can be accepted."
      }, 501);
    }

    return env.ASSETS.fetch(request);
  }
};
