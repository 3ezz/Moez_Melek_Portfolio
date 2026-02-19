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
