# Moez Melek Portfolio

Live site: https://3ezz.github.io/Moez_Melek_Portfolio/

## Add a new project (3 steps)

1. **Media**: create `assets/media/<slug>/` and drop your files in, as they come out of
   OBS / Unreal / Figma. Any name and format is fine (`My Clip (1).mov`, 2 MB PNGs…).
2. **Page**: copy `projects/_template.content.js` to `projects/<slug>.content.js` and fill it in.
   Point `src` / `videoSrc` / `heroThumbnail` at the files from step 1.
3. **Card**: copy an existing entry in `projects-data.js`, set `href: "projects/<slug>.html"`
   and choose where it shows (see the fields below).

Push to `main`. Within a few minutes the **Build portfolio** job on GitHub (Actions tab) will:

- compress the videos (and convert `.mov`/`.mkv`/`.webm` to `.mp4`), turn big screenshots into WebP,
  rename files with spaces or capitals, and make a poster still for every video,
- update the file names inside your content files to match,
- create `projects/<slug>.html` with its title, description and LinkedIn/Discord preview image,
- refresh the `?v=` cache numbers on CSS/JS and rebuild `sitemap.xml`,
- list anything to fix in the run summary: leftover `[placeholder]` text, missing files,
  a page without a card, unused media.

It commits these changes back to `main`, so **run `git pull` before your next edit**.
Nothing is ever deleted automatically.

> Don't edit `projects/<slug>.html` by hand: it is regenerated on every build.
> Change `projects/<slug>.content.js` (content) or `tools/page-shell.html` (layout for all pages) instead.

### Card fields (`projects-data.js`)

| Field | What it does |
|---|---|
| `slug`, `title`, `href`, `description` | Basics. `href` is `projects/<slug>.html` |
| `thumbnail` | Card image, ideally a ~960 px `card-thumb.webp` |
| `thumbFit: "contain"`, `thumbBg` | Show the whole image (logos) on a background colour |
| `thumbLabel`, `status`, `pills` | Small badges and pills on the card |
| `tags` | Filters on the Projects page: `unity`, `ue5`, `ar`, `ui` |
| `showProjectsPage`, `projectsOrder` | Projects page (shown unless set to `false`) |
| `showFeaturedRow`, `featuredOrder` | Home: Featured Projects row |
| `showHomeUnity`, `homeUnityOrder` / `showHomeUe`, `homeUeOrder` | Home: Unity / Unreal columns |
| `showCarousel`, `carouselOrder` | Home: hero carousel |
| `carouselLabel`, `carouselTitle`, `carouselText`, `carouselImage` | Optional carousel overrides (default to `status`, `title`, `description`, `thumbnail`) |

### Page content options (`projects/<slug>.content.js`)

See `projects/_template.content.js`; `projects/coffre-fort.content.js` is a full UX case-study example.

- `demo` (optional): main video at the top.
- `sections` / `closingSections` (optional): extra cards before / after the media,
  `{ eyebrow, title, note, items, wide }`.
- `mediaItems`: images and videos. `layout: "wide"` gives a full-width image.
  Posters are automatic (`<video>-poster.webp`); add `poster:` only to override.

## Run the build yourself (optional)

Needs Python 3, `pip install Pillow`, ffmpeg and Node.

```bash
python3 tools/build.py
```

## Local preview

```bash
python3 -m http.server 4173
```

Open http://127.0.0.1:4173/index.html

## Caching

GitHub Pages caches files for about 10 minutes. The build adds a content hash to every CSS/JS link
(`main.js?v=29d14b78`), so visitors get new code as soon as it changes. If you replace an image or
video, give it a new file name instead of overwriting it.
`_headers` only applies if the site is ever served from Cloudflare.

---

## Visitor tracking (who visits + what they open)

A built-in tracking system is now available in `main.js`.

It records:
- `page_view` (page path, title, referrer)
- `navigation_click` (where a visitor clicked next)
- `scroll_depth` (25/50/75/100)
- `page_exit` (time spent before leaving)

### 1) Turn it on
Open `main.js` and set the analytics config in `getAnalyticsConfig()`:

```js
function getAnalyticsConfig(){
  return {
    endpoint: "https://YOUR-ENDPOINT.example.com/track",
    debug: false,
    site: "Moez_Melek_Portfolio"
  };
}
```

- `endpoint` must accept `POST` JSON.
- Keep `debug: true` while testing to print events in the browser console.

### 2) Create a receiver
Use any webhook/data pipeline you like (for example: n8n webhook, Supabase Edge Function, Cloudflare Worker, custom backend).

Expected payload shape:

```json
{
  "event": "page_view",
  "site": "Moez_Melek_Portfolio",
  "timestamp": "2026-02-17T12:00:00.000Z",
  "userAgent": "...",
  "path": "/projects/colors.html",
  "title": "Colors — Moez Melek",
  "referrer": "direct",
  "visitorId": "visitor_...",
  "sessionId": "session_..."
}
```


### Data model (coherent visitor journey)
The Cloudflare schema is now split into 3 tables:
- `analytics_visitors`: one row per unique `visitor_id` (first seen / last seen)
- `analytics_sessions`: one row per `session_id` tied to a visitor
- `analytics_events`: one row per tracked action (`page_view`, click, scroll, exit)

This lets you answer: "which visitor did what, in which session, and in what order?"

Example query: full journey for one visitor
```sql
SELECT
  e.timestamp,
  e.event,
  COALESCE(e.path, e.from_path) AS from_path,
  e.to_path,
  e.percent,
  e.seconds_on_page,
  e.session_id
FROM analytics_events e
WHERE e.visitor_id = 'visitor_xxx'
ORDER BY e.timestamp ASC;
```

### 3) View flow/journey
Once your endpoint stores events, you can build tables/charts for:
- Top pages (`page_view`)
- Entry pages (`referrer = direct`)
- Visitor journey (`navigation_click.fromPath -> navigation_click.to`)
- Engagement (`scroll_depth`, `page_exit.secondsOnPage`)

### Notes
- Visitor IDs are anonymous IDs stored in browser localStorage.
- This is basic analytics, not user authentication/identity tracking.
- Add a privacy notice/cookie notice if required for your region.



### Why you may need to relink the Cloudflare database every time

If you deploy the Worker from CLI (`npx wrangler deploy`) but your `wrangler.jsonc` does **not** include a `d1_databases` binding, Cloudflare can deploy a version without the DB binding. This makes it look like you must relink the DB manually after each deploy.

Fix it once by storing the binding in `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "portfolio_analytics",
      "database_id": "<your-d1-id>"
    }
  ]
}
```

Then deploy again. Your binding will persist across deploys.

### Cloudflare setup (recommended)

If you're using Cloudflare, follow this exact flow:

**Important:** you can manage this in **either** of these ways:
- **Git-based workflow**: edit code locally, commit/push to GitHub, then deploy Worker with Wrangler.
- **Cloudflare Dashboard workflow**: edit Worker directly in Cloudflare dashboard and run D1 commands via Wrangler/console.

Use whichever is easier for you — both are valid.

If you are using only the browser/dashboard (no local CLI), follow:
- `docs/cloudflare-browser-only-setup.md`

If you think you are one push behind, run:
```bash
git fetch origin
git pull
```

### Avoid merge conflicts (quick routine)

If conflicts keep happening, it usually means your branch has local commits while `main` moved forward.
Use this routine before starting new edits:

```bash
git checkout main
git pull origin main
git checkout <your-branch>
git rebase main
```

If this repository has no remote configured yet, add it first:

```bash
git remote add origin <your-github-repo-url>
git fetch origin
```

Then continue with the rebase flow above.

1. **Create a Worker**
   - `npm create cloudflare@latest portfolio-analytics`
   - Choose **Worker only** + **JavaScript**.
2. **Paste collector code**
   - Replace your Worker file with `docs/cloudflare-analytics-worker.js`.
3. **Create D1 database**
   - `npx wrangler d1 create portfolio_analytics`
   - Add the DB binding in `wrangler.toml` as shown in `docs/cloudflare-analytics-worker.js` comments.
4. **Create analytics table**
   - `npx wrangler d1 execute portfolio_analytics --remote --file=docs/cloudflare-d1-schema.sql`
5. **Deploy Worker**
   - `npx wrangler deploy`
   - Your endpoint will be: `https://<worker-name>.<subdomain>.workers.dev/track`
6. **Connect portfolio frontend**
   - In `main.js` → `getAnalyticsConfig()`, set:
     - `endpoint` to your `/track` URL
     - `debug: true` for first tests, then `false`
7. **Test events**
   - Open your portfolio and click through pages.
   - Check Worker logs: `npx wrangler tail`
   - Query D1 for latest events:
     - `npx wrangler d1 execute portfolio_analytics --remote --command "SELECT event, visitor_id, session_id, path, to_path, timestamp FROM analytics_events ORDER BY timestamp DESC LIMIT 20;"`

This gives you visitor flow (entry page → pages viewed → clicked destination), plus time-on-page and scroll depth.

If deploy fails with "uploading a directory of assets", use the troubleshooting steps in `docs/cloudflare-browser-only-setup.md` (section 8) and remove `assets` from Wrangler config for this API-only Worker.
If deploy fails with `Missing entry-point to Worker script or to assets directory`, use `docs/cloudflare-browser-only-setup.md` (section 9), or run `npx wrangler deploy src/index.js`.
