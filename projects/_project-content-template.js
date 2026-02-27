window.PROJECT_PAGE_DATA = {
  title: "[Project Title]",
  metaDescription: "[One-sentence SEO description of the project]",
  backHref: "../index.html#projects",
  backLabel: "← Back to Projects",
  heroThumbnail: "../assets/icons/card-thumbnail-placeholder.svg",

  heroPills: ["[Engine]", "[Genre/Type]", "[Status]"],
  lead: "[2-3 lines that summarize what the project is, what you built, and why it matters.]",

  demo: {
    title: "Gameplay Demo",
    note: "[Short explanation of what this gameplay video showcases.]",
    videoSrc: "../assets/media/[project-slug]/demo.mp4",
    poster: "../assets/media/[project-slug]/demo-poster.jpg",
    mimeType: "video/mp4",
    pills: ["[Keyword 1]", "[Keyword 2]", "[Keyword 3]"]
  },

  overviewTitle: "Overview",
  overview: "[Project context, challenge, and design/technical goals.]",

  featuresTitle: "Key Features",
  features: [
    "[Feature 1]",
    "[Feature 2]",
    "[Feature 3]"
  ],

  roleTitle: "My Role",
  roles: [
    "[Responsibility 1]",
    "[Responsibility 2]",
    "[Responsibility 3]"
  ],

  toolsTitle: "Tools",
  tools: ["[Tool 1]", "[Tool 2]", "[Tool 3]"],

  mediaTitle: "Media",
  mediaNote: "[Optional note about the screenshots/videos section. Each media item is rendered in a separate card.]",
  mediaItems: [
    {
      type: "image",
      title: "Screenshot 1",
      note: "[Describe what this screenshot proves.]",
      src: "../assets/media/[project-slug]/screenshot-01.jpg",
      alt: "[Alt text for screenshot 1]"
    },
    {
      type: "image",
      title: "Screenshot 2",
      note: "[Describe what this screenshot proves.]",
      src: "../assets/media/[project-slug]/screenshot-02.jpg",
      alt: "[Alt text for screenshot 2]"
    },
    {
      type: "video",
      title: "Secondary Demo",
      note: "[Optional extra clip explanation.]",
      src: "../assets/media/[project-slug]/secondary-demo.mp4",
      poster: "../assets/media/[project-slug]/secondary-demo-poster.jpg",
      mimeType: "video/mp4"
    }
  ]
};
