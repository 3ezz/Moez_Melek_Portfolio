# Cloudflare Browser-Only Setup (No Local CLI)

Use this if you are doing everything in the Cloudflare dashboard and your local environment is not ready yet.

## 0) Confirm you are on the latest code
If your local clone is behind, pull first:

```bash
git fetch origin
git pull
```

Required files in this repo:
- `docs/cloudflare-analytics-worker.js`
- `docs/cloudflare-d1-schema.sql`
- `main.js` (`getAnalyticsConfig` section)

## 1) Create Worker in Cloudflare dashboard
1. Open **Cloudflare Dashboard** → **Workers & Pages**.
2. Click **Create** → **Worker**.
3. Name it `portfolio-analytics` (or your preferred name).
4. Open the Worker editor and replace the default code with the full contents of:
   - `docs/cloudflare-analytics-worker.js`

Important routes implemented by the Worker:
- `POST /track` → receives analytics events
- `GET /health` → health check endpoint

## 2) Create and bind D1 database (dashboard)
1. Go to **D1** in Cloudflare.
2. Create database: `portfolio_analytics`.
3. Go back to Worker → **Settings** → **Bindings**.
4. Add a **D1 binding**:
   - Variable name: `DB`
   - Database: `portfolio_analytics`

## 3) Run SQL schema in D1 (dashboard query editor)
Open D1 query editor and paste/run all SQL from:
- `docs/cloudflare-d1-schema.sql`

This creates visitor/session/event tables and indexes.

If you already created the old single-table schema, run this script again so new `analytics_visitors` and `analytics_sessions` tables are created.

## 4) Deploy Worker
In Worker editor, click **Deploy**.

Your endpoint will look like:
`https://<worker-name>.<subdomain>.workers.dev/track`

Quick check after deploy:
- Open `https://<worker-name>.<subdomain>.workers.dev/` (should return a JSON "Worker is running" message)
- Open `https://<worker-name>.<subdomain>.workers.dev/health` (should return `{ ok: true }`)

## 5) Connect site frontend
In `main.js`, edit `getAnalyticsConfig()`:
- set `endpoint` to your Worker `/track` URL
- set `debug: true` temporarily while testing

Then redeploy your website.

## 6) Validate in browser
1. Open your site.
2. Navigate pages and click a few links.
3. In Worker logs, verify `POST /track` requests.
4. In D1 query editor run:

```sql
SELECT event, visitor_id, session_id, path, to_path, timestamp
FROM analytics_events
ORDER BY timestamp DESC
LIMIT 20;
```

You should see events like:
- `page_view`
- `navigation_click`
- `scroll_depth`
- `page_exit`

## 7) Final production toggle
After validation, set `debug: false` in `main.js` and redeploy.


## 8) Fix the "uploading a directory of assets" deploy error
If Wrangler shows this message:
- "If you are uploading a directory of assets..."
- then deploy fails

you are likely deploying with an assets config on a Worker that should be API-only.

### Fix A (recommended): remove assets config
In your Worker project's `wrangler.jsonc` (or `wrangler.toml`), remove any `assets` block.
For this analytics collector, you only need routes like `/track` and `/health`.

### Fix B: force a clean Worker-only config
Create/replace `wrangler.jsonc` with this minimal config (or copy from `docs/wrangler-worker-only.jsonc`):

```jsonc
{
  "name": "portfolio-analytics",
  "main": "src/index.js",
  "compatibility_date": "2026-02-17"
}
```

If using D1, keep/add your binding:

```jsonc
{
  "name": "portfolio-analytics",
  "main": "src/index.js",
  "compatibility_date": "2026-02-17",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "portfolio_analytics",
      "database_id": "<your-d1-id>"
    }
  ]
}
```

Then run deploy again:

```bash
npx wrangler deploy
```

If it still fails, ensure you are running deploy from the Worker project folder (where `wrangler.jsonc` lives).


## 9) Fix the "Missing entry-point to Worker script" error
If deploy logs show:
- `Missing entry-point to Worker script or to assets directory`

this means Wrangler cannot find a Worker entry (`main`) in your current folder.

### Quick fix
- Run deploy from the folder that contains your Worker `wrangler.jsonc` + `src/index.js`.
- Or deploy with explicit entry-point:

```bash
npx wrangler deploy src/index.js
```

### Repo-level fix included here
This repo now includes:
- `wrangler.jsonc` with `main: "src/index.js"`
- `src/index.js` that exports the collector from `docs/cloudflare-analytics-worker.js`

So `npx wrangler deploy` from repo root now has a valid entry-point.
