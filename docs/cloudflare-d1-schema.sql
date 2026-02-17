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
  ip_country TEXT
);

CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_path ON analytics_events(path);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON analytics_events(visitor_id);
