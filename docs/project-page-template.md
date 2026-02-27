# Fillable Project Page Template (Low-Conflict Workflow)

This workflow avoids editing large existing files and keeps merge conflicts minimal.

## 1) Copy the page shell

Copy:
- `projects/new-project.html` → `projects/<your-slug>.html`

Then in the new HTML file, change:
- `<script src="./new-project.content.js" defer></script>`

to:
- `<script src="./<your-slug>.content.js" defer></script>`

## 2) Copy the fillable content file

Copy:
- `projects/_project-content-template.js` → `projects/<your-slug>.content.js`

Then fill `window.PROJECT_PAGE_DATA`:
- title/meta
- heroThumbnail (shown above the project title)
- hero pills + lead
- demo video block
- overview + features
- role + tools
- media items (each with title + note + src)

## 3) Add media files

Place assets in:
- `assets/media/<your-slug>/...`

Use those paths inside `projects/<your-slug>.content.js`.

## 4) Add card entry (single edit)

Edit only `projects-data.js` and add one object with:
- `slug`
- `title`
- `href: "projects/<your-slug>.html"`
- `thumbnail`
- visibility/order flags

## 5) Verify locally

```bash
node --check project-page-renderer.js
node --check projects/<your-slug>.content.js
python3 -m http.server 4173
```

Open:
- `http://localhost:4173/projects/<your-slug>.html`

---

## Why this reduces conflicts

- You do **not** edit shared section HTML repeatedly.
- New projects live in isolated files (`projects/<slug>.html` + `projects/<slug>.content.js`).
- Only one shared file is touched per new card (`projects-data.js`).
