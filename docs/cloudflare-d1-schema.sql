PRAGMA foreign_keys = ON;

-- One row per unique browser-level visitor ID.
CREATE TABLE IF NOT EXISTS analytics_visitors (
  visitor_id TEXT PRIMARY KEY,
  first_seen_utc TEXT NOT NULL,
  last_seen_utc TEXT NOT NULL,
  first_referrer TEXT,
  first_user_agent TEXT,
  first_country TEXT
);

-- One row per session ID.
CREATE TABLE IF NOT EXISTS analytics_sessions (
  session_id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  started_at_utc TEXT NOT NULL,
  last_seen_utc TEXT NOT NULL,
  landing_path TEXT,
  landing_referrer TEXT,
  user_agent TEXT,
  country TEXT,
  FOREIGN KEY (visitor_id) REFERENCES analytics_visitors(visitor_id)
);

-- One row per tracked interaction/action.
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  site TEXT,
  timestamp TEXT NOT NULL,
  path TEXT,
  referrer TEXT,
  title TEXT,
  from_path TEXT,
  to_path TEXT,
  link_text TEXT,
  is_external INTEGER,
  percent INTEGER,
  seconds_on_page INTEGER,
  visitor_id TEXT,
  session_id TEXT,
  user_agent TEXT,
  ip_country TEXT,
  FOREIGN KEY (visitor_id) REFERENCES analytics_visitors(visitor_id),
  FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id)
);

CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON analytics_visitors(last_seen_utc);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor ON analytics_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON analytics_sessions(last_seen_utc);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_path ON analytics_events(path);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);
/*views:*/
Top visitors (most active)
CREATE VIEW IF NOT EXISTS v_session_summary AS
SELECT
  s.visitor_id,
  s.session_id,
  s.started_at_utc,
  s.last_seen_utc,
  s.landing_path,
  s.landing_referrer,
  COUNT(e.id) AS event_count,
  SUM(CASE WHEN e.event = 'page_view' THEN 1 ELSE 0 END) AS page_views,
  SUM(CASE WHEN e.event = 'navigation_click' THEN 1 ELSE 0 END) AS clicks,
  SUM(CASE WHEN e.event = 'scroll_depth' THEN 1 ELSE 0 END) AS scroll_events,
  SUM(CASE WHEN e.event = 'page_exit' THEN 1 ELSE 0 END) AS exits
FROM analytics_sessions s
LEFT JOIN analytics_events e ON e.session_id = s.session_id
GROUP BY
  s.visitor_id, s.session_id, s.started_at_utc, s.last_seen_utc, s.landing_path, s.landing_referrer;

/*views:*/
SELECT
  COUNT(*) AS total_sessions,
  ROUND(AVG(session_event_count), 2) AS avg_events_per_session,
  ROUND(AVG(session_seconds), 2) AS avg_seconds_on_page_exit
FROM (
  SELECT
    s.session_id,
    COUNT(e.id) AS session_event_count,
    COALESCE(SUM(CASE WHEN e.event = 'page_exit' THEN e.seconds_on_page ELSE 0 END), 0) AS session_seconds
  FROM analytics_sessions s
  LEFT JOIN analytics_events e ON e.session_id = s.session_id
  GROUP BY s.session_id
) t;

/*views:*/
SELECT
  e.from_path,
  e.to_path,
  COUNT(*) AS transitions
FROM analytics_events e
WHERE e.event = 'navigation_click'
  AND e.from_path IS NOT NULL
  AND e.to_path IS NOT NULL
GROUP BY e.from_path, e.to_path
ORDER BY transitions DESC
LIMIT 30;

/*views:*/
SELECT
  v.visitor_id,
  v.first_seen_utc        AS visitor_first_seen_utc,
  v.last_seen_utc         AS visitor_last_seen_utc,
  v.first_referrer,
  v.first_country,

  s.session_id,
  s.started_at_utc        AS session_started_at_utc,
  s.last_seen_utc         AS session_last_seen_utc,
  s.landing_path,
  s.landing_referrer,

  e.timestamp             AS event_timestamp_utc,
  e.event,
  COALESCE(e.path, e.from_path) AS from_path,
  e.to_path,
  e.link_text,
  e.percent,
  e.seconds_on_page,
  e.ip_country
FROM analytics_visitors v
LEFT JOIN analytics_sessions s
  ON s.visitor_id = v.visitor_id
LEFT JOIN analytics_events e
  ON e.session_id = s.session_id
WHERE v.visitor_id = 'visitor_xxx'
ORDER BY s.started_at_utc ASC, e.timestamp ASC;

/*views 360:*/

SELECT
  v.visitor_id,
  v.first_seen_utc AS visitor_first_seen_utc,
  v.last_seen_utc  AS visitor_last_seen_utc,
  v.first_referrer,
  v.first_country,
  s.session_id,
  s.started_at_utc AS session_started_at_utc,
  s.last_seen_utc  AS session_last_seen_utc,
  s.landing_path,
  s.landing_referrer,
  e.timestamp      AS event_timestamp_utc,
  e.event,
  COALESCE(e.path, e.from_path) AS from_path,
  e.to_path,
  e.link_text,
  e.percent,
  e.seconds_on_page,
  e.ip_country
FROM analytics_visitors v
LEFT JOIN analytics_sessions s ON s.visitor_id = v.visitor_id
LEFT JOIN analytics_events e   ON e.session_id = s.session_id
WHERE v.visitor_id = 'PASTE_REAL_VISITOR_ID_HERE'
ORDER BY s.started_at_utc ASC, e.timestamp ASC;

