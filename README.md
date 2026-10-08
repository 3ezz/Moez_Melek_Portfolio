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

## Visitor tracking

Visits are sent from `main.js` to a Cloudflare Worker (`docs/cloudflare-analytics-worker.js`,
entry point `src/index.js`) and stored in a D1 database (`portfolio_analytics`).

**What is recorded:** page views, clicks (including CV opens, email and LinkedIn), how far people
scroll (25/50/75/100 %) and time on page, with an anonymous random visitor id, country and device.
A *visit* (session) is one browser tab until 30 minutes without activity.
The visitor id expires after 13 months. No cookies, no third parties.

**Not recorded:** `localhost` previews, visitors with Global Privacy Control, bots, and any browser
where you opened the site once with `?notrack`. Do that on your own phone and laptop:
`https://3ezz.github.io/Moez_Melek_Portfolio/?notrack` (undo with `?track`).

### Your stats page

`https://moez-melek-portfolio.moezmaleksk.workers.dev/dashboard`

It asks for your stats key once per browser and shows visitors per day, top pages (views, time,
how many read to the end), contact actions (CV / email / LinkedIn), where visits come from,
countries, devices, and the most recent visits page by page.

### Deploying the worker

The GitHub build does **not** deploy the worker. After changing anything in `docs/cloudflare-*`,
`docs/analytics-dashboard.html` or `wrangler.jsonc`, deploy it one of two ways:

- **Command line**, from the repo folder: `npx wrangler deploy`
- **Cloudflare website**: open the Worker's editor, replace everything with the contents of
  `docs/cloudflare-worker-single-file.js` (the build keeps this file up to date), and click Deploy.

One-time setup for the stats page: pick a long random key, keep it in your password manager, and
save it as the secret `STATS_TOKEN`, either with `npx wrangler secret put STATS_TOKEN` or on the
Cloudflare website under Worker → Settings → Variables and Secrets.

Only `https://3ezz.github.io` may send events. If the site moves to another address, add it to
`ALLOWED_ORIGINS` in `wrangler.jsonc` (comma-separated) and deploy again.

Useful commands:

```bash
npx wrangler tail                       # live worker logs
npx wrangler d1 execute portfolio_analytics --remote --command \
  "SELECT event, path, to_path, timestamp FROM analytics_events ORDER BY timestamp DESC LIMIT 20;"
```

The database layout is in `docs/cloudflare-d1-schema.sql`. Dashboard-only setup and deploy
troubleshooting: `docs/cloudflare-browser-only-setup.md`.
