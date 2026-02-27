window.PROJECT_PAGE_DATA = {
  title: "AR Memory",
  metaDescription: "AR Memory is a Unity + Vuforia AR companion app for printed postcards that reveals historical monuments in interactive 3D.",
  backHref: "../index.html#projects",
  backLabel: "← Back to Projects",
  heroThumbnail: "../assets/media/armemory/image_2026-02-26_224140994.png",


  heroPills: ["Unity", "AR", "Education", "Postcards", "Mobile UX"],
  lead: "AR Memory accompanies postcards sold separately: scan a postcard in the app to instantly reveal a 3D historical monument you can inspect and capture.",

  demo: {
    title: "Experience Demo",
    note: "Show the full flow: postcard scan, 3D monument appearance, pinch/rotate/zoom interaction, and photo capture to gallery.",
   videoSrc: "../assets/media/armemory/20260226-1157-02.1061775.mp4",
    poster: "../assets/media/armemory/20260226-1157-02.1061775.mp4",
    mimeType: "video/mp4",
    pills: ["Scan to AR", "Monument Stories", "Mobile Interaction"]
  },

  overviewTitle: "Overview",
  overview: "The experience turns physical postcards into interactive AR memories. After scanning a postcard marker, a 3D monument appears in real space. Users can pinch, scroll, and rotate to inspect the model from different angles, then capture photos they can revisit inside the in-app gallery or save directly to the phone gallery.",

  featuresTitle: "Key Features",
  features: [
    "Companion app flow for postcards sold separately",
    "Scan-to-AR activation using Vuforia marker verification",
    "Historical monuments appear as interactive 3D models",
    "Touch controls: pinch to zoom and scroll/drag to rotate",
    "In-app photo capture from AR view",
    "Saved photos available in app gallery and phone gallery"
  ],

  roleTitle: "My Role",
  roles: [
    "Built the entire app solo (end-to-end) as the only Unity developer/designer",
    "Designed and integrated the postcard-to-AR user journey",
    "Implemented Vuforia-based scan verification and AR activation",
    "Integrated 3D monument assets with touch interaction controls",
    "Built photo capture and gallery save/view workflows"
  ],

  toolsTitle: "Tools",
  tools: ["Unity", "C#", "Vuforia", "AR", "UI/UX Design", "3D Integration"],

  mediaTitle: "Media",
  mediaNote: "",
  mediaItems: [
    { type: "image", title: "Project Intro", note: "Brand + description overview slide.", src: "../assets/media/armemory/image_2026-02-27_125316631.png", alt: "AR Memory intro" },
    { type: "image", title: "Card Feed UI", note: "Scrollable card list with scan actions.", src: "../assets/media/armemory/image_2026-02-27_125708572.png", alt: "AR Memory card feed" },
    { type: "image", title: "AR Start + Monument View", note: "Scan entry, 3D overlay view, and contextual text screen.", src: "../assets/media/armemory/image_2026-02-27_125544454.png", alt: "AR Memory AR view" },
    { type: "image", title: "Gallery + Single Photo View", note: "Gallery grid and focused media screen.", src: "../assets/media/armemory/image_2026-02-27_125413672.png", alt: "AR Memory gallery" }
  ]
};
