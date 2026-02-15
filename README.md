# Moez Melek Portfolio — Content Update Guide

This portfolio now uses a **single source of truth** for project cards so you can update content faster.

## Files you need

1. `projects-data.js` → all project card content (title, description, tags, links, labels, where cards appear).
2. `main.js` → renders cards automatically into the right sections.
3. `index.html` / `projects.html` → contain only card containers (no manual per-card HTML blocks).

---

## Step-by-step: add a new project card

### Step 1) Create your project page
Create a new file in `projects/`, for example:
- `projects/my-new-project.html`

Use `projects/_template.html` as the base template for every new project page.

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
- `showProjectsPage`: `true/false` (all projects page)
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
