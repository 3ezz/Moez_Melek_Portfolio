/**
 * Cloudflare Worker: portfolio analytics collector + private stats dashboard.
 *
 *   POST /track      events from the portfolio (main.js)
 *   GET  /dashboard  private stats page (asks for your STATS_TOKEN)
 *   GET  /stats      JSON used by the dashboard (needs "Authorization: Bearer <STATS_TOKEN>")
 *   GET  /health     quick "is it running" check
 *
 * Settings (wrangler.jsonc "vars", or Cloudflare dashboard → Worker → Settings → Variables):
 *   ALLOWED_ORIGINS  comma-separated sites allowed to send events
 *                    (default: https://3ezz.github.io)
 * Secret (never commit it):  npx wrangler secret put STATS_TOKEN
 */
import DASHBOARD_HTML from './analytics-dashboard.html'; // bundled as text by wrangler

const DEFAULT_ORIGINS = ['https://3ezz.github.io'];
const EVENTS = new Set(['page_view', 'navigation_click', 'scroll_depth', 'page_exit']);
const MAX_BODY_BYTES = 8 * 1024;
const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|python-requests|curl|wget|httpclient|phantom|puppeteer|playwright/i;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin') || '';
    const allowed = allowedOrigins(env);
    const cors = corsHeaders(allowed.includes(origin) ? origin : allowed[0]);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/health' || (url.pathname === '/' && request.method === 'GET')) {
      return json({ ok: true, service: 'portfolio-analytics' }, 200, cors);
    }

    if (url.pathname === '/dashboard' && request.method === 'GET') {
      return new Response(DASHBOARD_HTML, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
          'x-robots-tag': 'noindex, nofollow',
          'referrer-policy': 'no-referrer'
        }
      });
    }

    if (url.pathname === '/stats' && request.method === 'GET') {
      return stats(request, env, url);
    }

    if (url.pathname !== '/track' || request.method !== 'POST') {
      return json({ error: 'Not found' }, 404, cors);
    }

    // ---- collect an event --------------------------------------------------
    // Only accept events sent from the portfolio itself (browsers always send Origin on POST).
    if (!allowed.includes(origin)) {
      return json({ error: 'Origin not allowed' }, 403, cors);
    }

    const userAgent = (request.headers.get('user-agent') || '').slice(0, 300);
    if (BOT_UA.test(userAgent)) {
      return new Response(null, { status: 204, headers: cors }); // ignore bots silently
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ error: 'Payload too large' }, 413, cors);
    }

    let payload;
    try {
      payload = JSON.parse(raw); // main.js sends JSON as text/plain (no CORS preflight)
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, cors);
    }
    if (!payload || typeof payload !== 'object' || !EVENTS.has(payload.event)) {
      return json({ error: 'Invalid event' }, 400, cors);
    }

    const str = (v, max) => (typeof v === 'string' && v ? v.slice(0, max) : null);
    const int = (v, min, max) => (Number.isFinite(Number(v)) ? Math.min(max, Math.max(min, Math.round(Number(v)))) : null);
    const id = (v, prefix) => (typeof v === 'string' && /^[\w-]{6,80}$/.test(v) ? v : `${prefix}_${crypto.randomUUID()}`);

    const nowIso = new Date().toISOString();
    // Trust the client clock only if it is roughly right (±1 day); otherwise use server time.
    const clientTs = Date.parse(payload.timestamp);
    const ts = Number.isFinite(clientTs) && Math.abs(clientTs - Date.now()) < 864e5 ? new Date(clientTs).toISOString() : nowIso;
    const visitorId = id(payload.visitorId, 'visitor');
    const sessionId = id(payload.sessionId, 'session');
    const country = request.cf?.country || null;
    const path = str(payload.path, 500);
    const referrer = str(payload.referrer, 500);

    try {
      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO analytics_visitors (
            visitor_id, first_seen_utc, last_seen_utc, first_referrer, first_user_agent, first_country
          ) VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(visitor_id) DO UPDATE SET last_seen_utc = excluded.last_seen_utc`
        ).bind(visitorId, ts, ts, referrer, userAgent, country),

        env.DB.prepare(
          `INSERT INTO analytics_sessions (
            session_id, visitor_id, started_at_utc, last_seen_utc, landing_path, landing_referrer, user_agent, country
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(session_id) DO UPDATE SET last_seen_utc = excluded.last_seen_utc`
        ).bind(sessionId, visitorId, ts, ts, path || str(payload.fromPath, 500), referrer, userAgent, country),

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
          str(payload.site, 60) || 'Moez_Melek_Portfolio',
          ts,
          path,
          referrer,
          str(payload.title, 200),
          str(payload.fromPath, 500),
          str(payload.to, 500),
          str(payload.text, 120),
          Number(Boolean(payload.isExternal)),
          int(payload.percent, 0, 100),
          int(payload.secondsOnPage, 0, 86400),
          visitorId,
          sessionId,
          userAgent,
          country
        )
      ]);
    } catch (error) {
      console.error('DB write failed', error); // visible in `npx wrangler tail`, not to visitors
      return json({ ok: false, error: 'Could not save event' }, 500, cors);
    }

    return json({ ok: true }, 200, cors);
  }
};

// ---------------------------------------------------------------------------
// GET /stats?days=30  → everything the dashboard shows, in one response
// ---------------------------------------------------------------------------
async function stats(request, env, url) {
  const headers = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' };
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.STATS_TOKEN) {
    return json({ error: 'STATS_TOKEN is not set. Run: npx wrangler secret put STATS_TOKEN' }, 503, headers);
  }
  if (!token || !(await sameSecret(token, env.STATS_TOKEN))) {
    return json({ error: 'Wrong key' }, 401, headers);
  }

  const days = Math.min(365, Math.max(1, parseInt(url.searchParams.get('days') || '30', 10) || 30));
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const q = (sql) => env.DB.prepare(sql).bind(since);
  // Strip the GitHub Pages prefix and query/hash so pages group nicely.
  const cut = (expr, ch) => `CASE WHEN INSTR(${expr}, '${ch}') > 0 THEN SUBSTR(${expr}, 1, INSTR(${expr}, '${ch}') - 1) ELSE ${expr} END`;
  const PAGE = `REPLACE(REPLACE(${cut(cut('path', '#'), '?')}, '/Moez_Melek_Portfolio', ''), 'index.html', '')`;
  const MOBILE = `(user_agent LIKE '%Mobi%' OR user_agent LIKE '%Android%' OR user_agent LIKE '%iPhone%')`;

  const [totals, daily, pages, contacts, referrers, countries, devices, recent] = await env.DB.batch([
    q(`SELECT COUNT(DISTINCT visitor_id) AS visitors, COUNT(DISTINCT session_id) AS sessions,
              SUM(event = 'page_view') AS pageViews
         FROM analytics_events WHERE timestamp >= ?1`),
    q(`SELECT SUBSTR(timestamp, 1, 10) AS day, COUNT(DISTINCT visitor_id) AS visitors, SUM(event = 'page_view') AS pageViews
         FROM analytics_events WHERE timestamp >= ?1 GROUP BY day ORDER BY day`),
    q(`SELECT ${PAGE} AS page,
              MAX(title) AS title,
              SUM(event = 'page_view') AS views,
              COUNT(DISTINCT CASE WHEN event = 'page_view' THEN visitor_id END) AS visitors,
              ROUND(AVG(CASE WHEN event = 'page_exit' AND seconds_on_page BETWEEN 1 AND 3600 THEN seconds_on_page END)) AS avgSeconds,
              ROUND(100.0 * COUNT(DISTINCT CASE WHEN event = 'scroll_depth' AND percent >= 75 THEN session_id END)
                    / MAX(1, COUNT(DISTINCT CASE WHEN event = 'page_view' THEN session_id END))) AS readPct
         FROM analytics_events WHERE timestamp >= ?1 AND path IS NOT NULL
        GROUP BY page HAVING views > 0 ORDER BY views DESC LIMIT 30`),
    q(`SELECT CASE
                WHEN to_path LIKE 'mailto:%' THEN 'Email'
                WHEN to_path LIKE '%CV_MOEZ_MELEK_EN%' THEN 'CV (English)'
                WHEN to_path LIKE '%CV_MOEZ_MELEK_FR%' THEN 'CV (French)'
                WHEN to_path LIKE '%linkedin.com%' THEN 'LinkedIn'
                ELSE 'Other external link'
              END AS action,
              COUNT(*) AS clicks, COUNT(DISTINCT visitor_id) AS visitors
         FROM analytics_events
        WHERE timestamp >= ?1 AND event = 'navigation_click'
          AND (is_external = 1 OR to_path LIKE '%.pdf%' OR to_path LIKE 'mailto:%')
        GROUP BY action ORDER BY clicks DESC`),
    q(`SELECT CASE
                WHEN landing_referrer IS NULL OR landing_referrer IN ('', 'direct') THEN 'Direct / unknown'
                WHEN landing_referrer LIKE '%linkedin%' OR landing_referrer LIKE '%lnkd.in%' THEN 'LinkedIn'
                WHEN landing_referrer LIKE '%google.%' THEN 'Google'
                WHEN landing_referrer LIKE '%github%' THEN 'GitHub'
                WHEN landing_referrer LIKE '%3ezz.github.io%' THEN 'Direct / unknown'
                ELSE SUBSTR(REPLACE(REPLACE(landing_referrer, 'https://', ''), 'http://', ''), 1,
                            INSTR(REPLACE(REPLACE(landing_referrer, 'https://', ''), 'http://', '') || '/', '/') - 1)
              END AS source,
              COUNT(*) AS sessions
         FROM analytics_sessions WHERE started_at_utc >= ?1
        GROUP BY source ORDER BY sessions DESC LIMIT 15`),
    q(`SELECT COALESCE(country, '??') AS country, COUNT(DISTINCT visitor_id) AS visitors
         FROM analytics_sessions WHERE started_at_utc >= ?1
        GROUP BY country ORDER BY visitors DESC LIMIT 15`),
    q(`SELECT CASE WHEN ${MOBILE} THEN 'Mobile' ELSE 'Desktop' END AS device, COUNT(*) AS sessions
         FROM analytics_sessions WHERE started_at_utc >= ?1 GROUP BY device ORDER BY sessions DESC`),
    q(`SELECT s.session_id AS id, s.started_at_utc AS started, s.country, s.landing_referrer AS referrer,
              CASE WHEN ${MOBILE.replaceAll('user_agent', 's.user_agent')} THEN 'Mobile' ELSE 'Desktop' END AS device,
              (SELECT GROUP_CONCAT(p, ' → ') FROM (
                  SELECT ${PAGE} AS p FROM analytics_events e
                   WHERE e.session_id = s.session_id AND e.event = 'page_view' ORDER BY e.timestamp LIMIT 12)) AS pages,
              (SELECT GROUP_CONCAT(DISTINCT CASE
                        WHEN to_path LIKE 'mailto:%' THEN 'Email'
                        WHEN to_path LIKE '%.pdf%' THEN 'CV'
                        WHEN to_path LIKE '%linkedin.com%' THEN 'LinkedIn' END)
                 FROM analytics_events e WHERE e.session_id = s.session_id AND e.event = 'navigation_click') AS actions,
              CAST((JULIANDAY(s.last_seen_utc) - JULIANDAY(s.started_at_utc)) * 86400 AS INTEGER) AS seconds
         FROM analytics_sessions s WHERE s.started_at_utc >= ?1
        ORDER BY s.started_at_utc DESC LIMIT 40`)
  ]);

  return json({
    days,
    since,
    totals: totals.results[0] || {},
    daily: daily.results,
    pages: pages.results,
    contacts: contacts.results,
    referrers: referrers.results,
    countries: countries.results,
    devices: devices.results,
    recent: recent.results
  }, 200, headers);
}

// ---------------------------------------------------------------------------
function allowedOrigins(env) {
  const list = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return list.length ? list : DEFAULT_ORIGINS;
}

async function sameSecret(a, b) {
  // Constant-time compare via hashes, so the key can't be guessed by timing.
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  const x = new Uint8Array(ha), y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders }
  });
}

function corsHeaders(origin) {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'Origin'
  };
}
