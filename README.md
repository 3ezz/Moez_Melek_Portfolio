# Moez Melek Portfolio — Content Update Guide

This portfolio now uses a **single source of truth** for project cards so you can update content faster.

## Always sync before making/suggesting changes

Before any edits or change suggestions, pull latest updates first:

```bash
git checkout main
git pull origin main
git checkout <your-branch>
git rebase main
```

## Files you need

1. `projects-data.js` → all project card content (title, description, tags, links, labels, where cards appear).
2. `main.js` → renders cards automatically into the right sections.
3. `index.html` / `projects.html` → contain only card containers (no manual per-card HTML blocks).

---

## Step-by-step: add a new project card

### Step 1) Create your project page
Create a new file in `projects/`, for example:
- `projects/my-new-project.html`

Use `projects/new-project.html` as the base template for every new project page.
(`projects/_template.html` is deprecated and has been removed to avoid duplicate templates.)

### Step 1.1) Use the `content.js` template (recommended, no hardcoded sections)
If you want to keep the same Roadkill/Steam House layout and only fill content:

1. Copy `projects/new-project.html` to `projects/<your-slug>.html`.
2. Copy `projects/_project-content-template.js` to `projects/<your-slug>.content.js`.
3. Fill `window.PROJECT_PAGE_DATA` in `projects/<your-slug>.content.js` (hero, gameplay demo, overview, features, role, tools, media).
4. In `projects/<your-slug>.html`, update script include from `./new-project.content.js` to `./<your-slug>.content.js`.
5. Keep `../project-page-renderer.js` in the page so content is rendered automatically.

See detailed workflow in `docs/project-page-template.md`.

### Step 2) Add media assets (optional)
Put images/videos inside:
- `assets/media/<your-project-folder>/...`

### Step 3) Add one entry in `projects-data.js`
Copy an existing object and edit fields:

- `slug`: unique id
- `title`: card title
- `href`: link to the project page
- `description`: short card description
- `thumbnail`: thumbnail path (e.g. `assets/media/my-project/thumb.jpg`)
- `thumbLabel`: small badge text (e.g. `UNITY`, `UE5`)
- `status`: small status badge (e.g. `Prototype`, `Case Study`, `Published`)
- `category`: category keyword (e.g. `education`, `ui`, `systems`)
- `pills`: array of visible pills
- `tags`: array used by filters on `projects.html` (`unity`, `ue5`, `ar`, `ui`)
- `showFeaturedRow`: `true/false` (home featured row)
- `featuredOrder`: number order for featured row
- `showHomeUnity`: `true/false` (home Unity column)
- `homeUnityOrder`: number order for home Unity list
- `showHomeUe`: `true/false` (home UE column)
- `homeUeOrder`: number order for home UE list
- `showProjectsPage`: `true/false` (all projects page, defaults to visible if omitted)
- `projectsOrder`: number order for all projects page

#### Full object example
```js
{
  slug: "my-project",
  title: "My Project",
  href: "projects/my-project.html",
  description: "One-line value proposition.",
  thumbnail: "assets/media/my-project/thumb.jpg",
  thumbLabel: "UNITY",
  status: "Prototype",
  category: "education",
  pills: ["Unity", "AR", "UI/UX"],
  tags: ["unity", "ar", "ui"],
  showFeaturedRow: true,
  featuredOrder: 5,
  showHomeUnity: true,
  homeUnityOrder: 4,
  showHomeUe: false,
  homeUeOrder: 99,
  showProjectsPage: true,
  projectsOrder: 8
}
```

If `showProjectsPage` is not set, the project is shown by default on `projects.html`.

### Step 4) Save and reload
No extra HTML card editing is needed.
Cards are auto-rendered by `main.js`.

---

## Step-by-step: edit an existing project card

1. Open `projects-data.js`
2. Find the project object (by `slug` or `title`)
3. Update text/tags/pills/visibility flags
4. Save and refresh

---

## Visibility rules (important)

- Set `showFeaturedRow: true` to display in the home featured row.
- Set `showHomeUnity: true` to display in the Unity section on home.
- Set `showHomeUe: true` to display in the UE section on home.
- Set `showProjectsPage: true` to display in `projects.html` grid and be filterable.

You can enable multiple locations at once.

---

## Filters on `projects.html`

Filters work from the `tags` array in `projects-data.js`:

- `unity`
- `ue5`
- `ar`
- `ui`

If a card should appear under a filter, include that tag in `tags`.

Example:
```js
tags: ["unity", "ar", "ui"]
```

---

## Thumbnail behavior

Each generated card uses:
- `project.thumbnail` if provided
- fallback: `assets/icons/card-thumbnail-placeholder.svg`

So the fastest media flow is:
1. Add files in `assets/media/<project-slug>/`
2. Set `thumbnail` in that project object
3. Refresh the page

---


## Fast media implementation workflow (recommended)

1. Create project media folder:
   - `assets/media/<slug>/`
2. Add files with predictable names:
   - `thumb.jpg` (card thumbnail)
   - `cover.jpg` (hero image)
   - `shot-01.jpg`, `shot-02.jpg`, ...
   - `demo.mp4` (optional)
3. In `projects-data.js`, set:
   - `thumbnail: "assets/media/<slug>/thumb.jpg"`
4. In the project page (`projects/<slug>.html`), replace media placeholders with those files.

This keeps card updates data-driven and media assets organized by project.

---


## Detailed workflow: add a brand-new project (example: Roadkill)

Follow these exact steps in order:

1. **Create the page file**
   - Copy `projects/new-project.html`
   - Save as `projects/roadkill.html`
   - Replace `./new-project.content.js` with `./roadkill.content.js`
2. **Fill the page content**
   - Update `<title>`, meta description, hero summary, features, role, tools, media placeholders.
3. **Create media folder**
   - `assets/media/roadkill/`
4. **Prepare media files**
   - `thumb.jpg` (card thumbnail)
   - `cover.jpg` (optional hero/cover)
   - `shot-01.jpg`, `shot-02.jpg`, ...
   - `demo.mp4` (optional)
5. **Add the project object in `projects-data.js`**
   - Required keys: `slug`, `title`, `href`, `description`, `thumbnail`, `thumbLabel`, `status`, `pills`, `tags`
   - Placement keys: `showFeaturedRow`, `showHomeUnity/showHomeUe`, `showProjectsPage`
   - Ordering keys: `featuredOrder`, `homeUnityOrder/homeUeOrder`, `projectsOrder`
6. **Verify filters**
   - Ensure `tags` includes expected filter values (`ue5`, `ui`, `ar`, `unity`).
7. **Run local preview**
   - `python3 -m http.server 4173`
   - Check `index.html`, `projects.html`, and `projects/roadkill.html`
8. **Finalize**
   - Confirm card appears in correct sections and links to the new page.

---

## Quick checklist before publishing

1. Card appears in the correct sections (`index.html` / `projects.html`)
2. Filters work on `projects.html`
3. Card link opens correct `projects/<file>.html`
4. Pills and labels are correct
5. No console errors in browser

---

## Local preview

Run:

```bash
python3 -m http.server 4173
```

Then open:
- `http://127.0.0.1:4173/index.html`
- `http://127.0.0.1:4173/projects.html`

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
