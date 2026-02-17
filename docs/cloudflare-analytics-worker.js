/**
 * Cloudflare Worker: portfolio analytics collector
 *
 * Deploy with:
 *   npm create cloudflare@latest portfolio-analytics
 *   (choose Worker only, JavaScript)
 *   replace src/index.js with this file content
 *   npx wrangler d1 create portfolio_analytics
 *   npx wrangler deploy
 *
 * In wrangler.toml, bind D1:
 * [[d1_databases]]
 * binding = "DB"
 * database_name = "portfolio_analytics"
 * database_id = "<your-d1-id>"
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (url.pathname === '/health') {
      return json({ ok: true, service: 'portfolio-analytics' });
    }


    if (url.pathname === '/' && request.method === 'GET') {
      return json({
        ok: true,
        service: 'portfolio-analytics',
        message: 'Worker is running. Send POST requests to /track and GET /health for status.'
      });
    }

    if (url.pathname === '/track' && request.method === 'GET') {
      return json({
        ok: true,
        message: 'Use POST /track with analytics JSON payload.'
      });
    }

    if (url.pathname !== '/track' || request.method !== 'POST') {
      return json({ error: 'Not found' }, 404);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const valid = validatePayload(payload);
    if (!valid.ok) {
      return json({ error: valid.error }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO analytics_events (
        id, event, site, timestamp, path, referrer, title,
        from_path, to_path, link_text, is_external,
        percent, seconds_on_page,
        visitor_id, session_id, user_agent, ip_country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      payload.event,
      payload.site || 'Moez_Melek_Portfolio',
      payload.timestamp || new Date().toISOString(),
      payload.path || null,
      payload.referrer || null,
      payload.title || null,
      payload.fromPath || null,
      payload.to || null,
      payload.text || null,
      Number(Boolean(payload.isExternal)),
      payload.percent ?? null,
      payload.secondsOnPage ?? null,
      payload.visitorId || null,
      payload.sessionId || null,
      payload.userAgent || request.headers.get('user-agent') || null,
      request.cf?.country || null
    ).run();

    return json({ ok: true });
  }
};

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Body must be an object' };
  }

  const allowed = new Set(['page_view', 'navigation_click', 'scroll_depth', 'page_exit']);
  if (!allowed.has(payload.event)) {
    return { ok: false, error: 'Invalid event type' };
  }

  return { ok: true };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders()
    }
  });
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type'
  };
}
