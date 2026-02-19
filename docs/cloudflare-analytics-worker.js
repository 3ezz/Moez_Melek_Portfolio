/**
 * Cloudflare Worker: portfolio analytics collector
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
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
      return json({ ok: true, message: 'Use POST /track with analytics JSON payload.' });
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
    if (!valid.ok) return json({ error: valid.error }, 400);

    const nowIso = new Date().toISOString();
    const eventTimestamp = payload.timestamp || nowIso;
    const visitorId = payload.visitorId || `visitor_${crypto.randomUUID()}`;
    const sessionId = payload.sessionId || `session_${crypto.randomUUID()}`;
    const country = request.cf?.country || null;
    const userAgent = payload.userAgent || request.headers.get('user-agent') || null;

    try {
      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO analytics_visitors (
            visitor_id, first_seen_utc, last_seen_utc, first_referrer, first_user_agent, first_country
          ) VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(visitor_id) DO UPDATE SET
            last_seen_utc = excluded.last_seen_utc`
        ).bind(
          visitorId,
          eventTimestamp,
          eventTimestamp,
          payload.referrer || null,
          userAgent,
          country
        ),

        env.DB.prepare(
          `INSERT INTO analytics_sessions (
            session_id, visitor_id, started_at_utc, last_seen_utc, landing_path, landing_referrer, user_agent, country
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(session_id) DO UPDATE SET
            last_seen_utc = excluded.last_seen_utc`
        ).bind(
          sessionId,
          visitorId,
          eventTimestamp,
          eventTimestamp,
          payload.path || payload.fromPath || null,
          payload.referrer || null,
          userAgent,
          country
        ),

        env.DB.prepare(
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
          eventTimestamp,
          payload.path || null,
          payload.referrer || null,
          payload.title || null,
          payload.fromPath || null,
          payload.to || null,
          payload.text || null,
          Number(Boolean(payload.isExternal)),
          payload.percent ?? null,
          payload.secondsOnPage ?? null,
          visitorId,
          sessionId,
          userAgent,
          country
        )
      ]);
    } catch (error) {
      return json({ ok: false, error: 'DB write failed', details: String(error) }, 500);
    }

    return json({ ok: true, visitorId, sessionId });
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
