// netlify/functions/supabase-keepalive.js
// Pings Supabase health endpoint every 12 hours to prevent project from pausing

exports.config = {
  // Runs at minute 0, every 12th hour (00:00 and 12:00 UTC)
  schedule: "0 */12 * * *",
};

exports.handler = async function () {
  const SUPABASE_URL = "https://teivymfqoldtsuelrjfe.supabase.co";
  const url = `${SUPABASE_URL}/health`;

  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    const ok = res.ok;
    const status = res.status;
    const text = await res.text().catch(() => "");

    console.log("Supabase keepalive:", { url, status, ok });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Keepalive ping sent",
        target: url,
        status,
        ok,
        body: text?.slice(0, 200),
      }),
    };
  } catch (err) {
    console.error("Supabase keepalive error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
