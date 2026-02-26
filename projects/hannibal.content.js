window.PROJECT_PAGE_DATA = {
  title: "Hannibal",
  metaDescription: "Solo-built Unity + Vuforia AR educational game for kids (6–12) about Carthage and Hannibal heritage.",
  backHref: "../index.html#projects",
  backLabel: "← Back to Projects",

  heroPills: ["Unity", "Vuforia", "AR", "Educational", "Kids 6–12"],
  lead: "Hannibal is a solo-built educational AR game for children aged 6–12, designed to teach Carthage and Hannibal heritage through guided scanning, mini-games, and story-based exploration.",

  demo: {
    title: "Gameplay Demo",
    note: "Show this complete flow: intro cover scan, voyage card sequence, 3D map interaction, first-person collection mission, and episode unlock in Videos.",
    videoSrc: "",
    pills: ["Scan Flow", "3D Map", "Story Progression"]
  },

  overviewTitle: "Overview",
  overview: "The experience starts in a menu containing mini-games such as crosswords and family tree activities. In the Intro section, the player scans the board-game cover and a miniature Hannibal appears to introduce the game. In the Voyage section, the player selects a level and scans cards in this order: character, place, time, environment, then map. After all scans are validated, the map appears in 3D with touch interaction. Players can inspect it or enter first-person exploration to collect required items. Completing each level unlocks a video in the Videos section, progressively revealing Hannibal's story in chronological order.",

  featuresTitle: "Key Features",
  features: [
    "Educational AR experience for kids aged 6–12",
    "Built solo in Unity with Vuforia marker verification",
    "Menu mini-games (including crosswords and family tree)",
    "Intro flow: scan board-game cover to spawn miniature Hannibal guide",
    "Voyage flow with required scan sequence: character → place → time → environment → map",
    "3D map interaction using touch controls (pinch/zoom/rotate)",
    "Two map options: closed-dome map view or first-person exploration mode",
    "Collect all required level items to unlock story videos",
    "Videos section unlocks episodes in chronological order"
  ],

  roleTitle: "My Role",
  roles: [
    "Built the entire app solo (end-to-end) as the only Unity developer/designer",
    "Designed and implemented UI/UX flows for menu, intro, voyage, and videos sections",
    "Implemented Vuforia scan-validation logic and progression gating",
    "Integrated 3D map interactions and first-person collectible gameplay",
    "Implemented unlock system linking level completion to chronological video episodes"
  ],

  toolsTitle: "Tools",
  tools: ["Unity", "C#", "Vuforia", "AR", "UI/UX Design", "3D Integration", "Game Progression Design"],

  mediaTitle: "Media",
  mediaNote: "Based on the slides you shared. Replace placeholder image paths with exported files (recommended folder: assets/media/hannibal/).",
  mediaItems: [
    { type: "image", title: "Project Intro & Role", note: "Hero slide with project description, genre, and role.", src: "../assets/icons/card-thumbnail-placeholder.svg", alt: "Hannibal intro slide" },
    { type: "image", title: "Onboarding & AR Activation", note: "Initial UI + AR character reveal from card scan.", src: "../assets/icons/card-thumbnail-placeholder.svg", alt: "Hannibal onboarding and AR" },
    { type: "image", title: "Main Menu & Games Screen", note: "Menu structure and mini-games entry points.", src: "../assets/icons/card-thumbnail-placeholder.svg", alt: "Hannibal menu and games" },
    { type: "image", title: "World Map & Mission Unlocks", note: "Progression map with lock/unlock node system.", src: "../assets/icons/card-thumbnail-placeholder.svg", alt: "Hannibal mission map" },
    { type: "image", title: "Chapter List & Story Popup", note: "Sequential chapter flow and in-context story panel.", src: "../assets/icons/card-thumbnail-placeholder.svg", alt: "Hannibal chapter screen" },
    { type: "image", title: "Character Scan Objective", note: "Task screen paired with in-game 3D objective view.", src: "../assets/icons/card-thumbnail-placeholder.svg", alt: "Hannibal objective interaction" },
    { type: "image", title: "Equipment / Object Interaction", note: "Object-focused educational interaction screens.", src: "../assets/icons/card-thumbnail-placeholder.svg", alt: "Hannibal object interaction" }
  ]
};
