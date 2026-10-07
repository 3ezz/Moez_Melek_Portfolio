// NEW PROJECT: copy this file to projects/<your-slug>.content.js and fill it in.
// The page projects/<your-slug>.html is created for you when you push.
// Media paths: put files in assets/media/<your-slug>/ — any name/format is fine,
// they get compressed, renamed and given poster images automatically (paths here update too).
// Delete any optional block you don't need. Text in [brackets] is flagged until you replace it.
window.PROJECT_PAGE_DATA = {
  title: "[Project Title]",
  metaDescription: "[One sentence shown in Google and in LinkedIn link previews]",
  backHref: "../projects.html",
  heroThumbnail: "../assets/media/[your-slug]/[cover-image].png",  // also used for the link preview image

  heroPills: ["[Engine]", "[Genre]", "[Status]"],
  lead: "[2–3 lines: what the project is, what you built, why it matters.]",

  // Optional: main video at the top
  demo: {
    title: "Gameplay Demo",
    note: "[What this video shows.]",
    videoSrc: "../assets/media/[your-slug]/[demo-video].mp4"
  },

  overview: "[Context, challenge, goals.]",
  features: ["[Feature 1]", "[Feature 2]", "[Feature 3]"],
  roles: ["[What you did 1]", "[What you did 2]"],
  tools: ["[Tool 1]", "[Tool 2]"],

  // Optional extra cards after Overview / My Role (great for UX case studies).
  // sections: [{ eyebrow: "01 · Research", title: "...", note: "...", items: ["..."], wide: true }],

  mediaItems: [
    { type: "image", title: "[Screenshot title]", note: "[What it proves]", src: "../assets/media/[your-slug]/[screenshot].png", alt: "[Describe the image]" },
    { type: "video", title: "[Clip title]", note: "[What it shows]", src: "../assets/media/[your-slug]/[clip].mp4", alt: "[Describe the clip]" }
    // add layout: "wide" to an item for a full-width image (wireframes, journey maps)
  ]

  // Optional: closingSections: [ ...same format as sections, shown after the media... ]
};
