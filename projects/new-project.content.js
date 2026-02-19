window.PROJECT_PAGE_DATA = {
  title: "New Project Template",
  metaDescription: "Starter project page driven by a fillable data file so content can be updated without editing HTML structure.",
  backHref: "../index.html#projects",
  backLabel: "← Back to Projects",

  heroPills: ["Engine", "Prototype", "Status"],
  lead: "Use this file as the new default page template: update only this data object to build a complete project page with hero, gameplay demo, overview, role, tools, and separated media cards.",

  demo: {
    title: "Gameplay Demo",
    note: "Replace with your own captured gameplay clip.",
    videoSrc: "../assets/media/roadkill/demo.mp4",
    poster: "../assets/media/roadkill/shot-01.jpg",
    mimeType: "video/mp4",
    pills: ["Gameplay", "Prototype", "Iteration"]
  },

  overviewTitle: "Overview",
  overview: "Keep this section focused on what the project is, the core challenge, and your design/technical objective.",

  featuresTitle: "Key Features",
  features: [
    "Feature 1 — core mechanic or system",
    "Feature 2 — user-facing interaction or feedback loop",
    "Feature 3 — implementation detail or innovation"
  ],

  roleTitle: "My Role",
  roles: [
    "Responsibility 1 — design ownership",
    "Responsibility 2 — implementation work",
    "Responsibility 3 — testing and iteration"
  ],

  toolsTitle: "Tools",
  tools: ["Unreal Engine 5", "Blueprint", "UI/UX"],

  mediaTitle: "Media",
  mediaNote: "Each item below is rendered in its own separate panel card.",
  mediaItems: [
    {
      type: "image",
      title: "Screenshot 1",
      note: "Show a key gameplay moment.",
      src: "../assets/icons/card-thumbnail-placeholder.svg",
      alt: "Template screenshot 1"
    },
    {
      type: "image",
      title: "Screenshot 2",
      note: "Show another system/feature view.",
      src: "../assets/icons/card-thumbnail-placeholder.svg",
      alt: "Template screenshot 2"
    }
  ]
};
