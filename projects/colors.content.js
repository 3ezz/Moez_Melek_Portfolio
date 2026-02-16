window.PROJECT_PAGE_DATA = {
  title: "Colors — Prototype FPS",
  metaDescription: "Prototype FPS inspired by color-based territory control: shoot paint balloons, reclaim space, and dynamically change the environment.",
  backHref: "../index.html#projects",
  backLabel: "← Back to Projects",

  heroPills: ["Unreal Engine 5", "FPS Prototype", "Gameplay Systems"],
  lead: "Colors is a prototype FPS inspired by Splatoon-style territory control. The core loop is simple: shoot color balloons, spread your color through space, and use that visual control of the map as a gameplay advantage.",

  demo: {
    title: "Prototype Demo",
    note: "Gameplay capture will be added here once the latest build recording is exported.",
    videoSrc: "../assets/media/roadkill/demo.mp4",
    poster: "",
    mimeType: "video/mp4",
    pills: ["Color Shooting", "Environment Shift", "Prototype"]
  },

  overviewTitle: "Overview",
  overview: "This project explores how color can directly drive FPS gameplay feedback. Instead of color being just visual polish, each shot modifies the world state and readability of the arena, which changes how players move, aim, and prioritize zones.",

  featuresTitle: "Key Features",
  features: [
    "FPS shooting mechanic focused on color balloons as projectiles",
    "Color spread logic that updates surfaces and environment state",
    "Immediate visual feedback loop to support player decision-making"
  ],

  roleTitle: "My Role",
  roles: [
    "Designed and prototyped the main gameplay loop",
    "Implemented core shooting and impact mechanics in UE5",
    "Built environment color-change behavior and tested game feel"
  ],

  toolsTitle: "Tools",
  tools: ["Unreal Engine 5", "Blueprint", "Gameplay Prototyping"],

  mediaTitle: "Media",
  mediaNote: "Current media uses placeholders until final gameplay captures are exported from the prototype build.",
  mediaItems: [
    {
      type: "image",
      title: "Gameplay Placeholder — Shooting Loop",
      note: "Will be replaced by an in-game shot showing balloon firing and hit feedback.",
      src: "../assets/icons/card-thumbnail-placeholder.svg",
      alt: "Colors prototype gameplay placeholder"
    },
    {
      type: "image",
      title: "Gameplay Placeholder — Environment Change",
      note: "Will be replaced by a before/after capture of the environment color transformation.",
      src: "../assets/icons/card-thumbnail-placeholder.svg",
      alt: "Colors prototype environment shift placeholder"
    },
    {
      type: "image",
      title: "Gameplay Placeholder — Prototype Arena",
      note: "Will be replaced by an arena readability screenshot used for iteration notes.",
      src: "../assets/icons/card-thumbnail-placeholder.svg",
      alt: "Colors prototype arena placeholder"
    }
  ]
};
