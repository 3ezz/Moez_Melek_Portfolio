window.PROJECT_PAGE_DATA = {
  title: "Steam House — Dialogue System & UI/UX",
  metaDescription: "Unreal Engine project: Behavior Tree-driven dialogue system with typewriter UI, choices, quest/blackboard updates, and full menu UX.",
  backHref: "../projects.html",
  backLabel: "← Back to Projects",
  heroThumbnail: "../assets/media/steamhouse/dialogue_06s.png",

  heroPills: ["Unreal Engine", "Blueprint", "Behavior Trees", "Blackboard", "UMG", "UI/UX"],
  lead: "Interactive adaptation inspired by Jules Verne’s La Maison à vapeur. I designed the dialogue architecture (Behavior Tree-driven), the typewriter presentation system, and implemented the UI + menu interactions across the game.",

  demo: {
    title: "Dialogue Demo",
    note: "NPC interaction → dialogue appears with typewriter effect → advance/skip → state updates (blackboard/quest).",
    videoSrc: "../assets/media/steamhouse/dialoguesystem.mp4",
    poster: "../assets/media/steamhouse/dialogue_06s.png",
    mimeType: "video/mp4",
    pills: ["Typewriter UI", "Choices", "Skip/Advance", "State-driven narrative"]
  },

  overviewTitle: "Overview",
  overview: "The challenge was turning a literary narrative into interactive dialogue that remains scalable. Instead of hardcoding lines in widgets, conversations are authored as Behavior Trees and rendered by a UI layer focused on readability, pacing, and feedback.",

  featuresTitle: "Key Features",
  features: [
    "Dialogue system design + implementation (Behavior Tree pipeline)",
    "Typewriter effect + skip/advance logic",
    "Dialogue UI (choices, transitions, animations)",
    "Main menu + pause menu implementation (mouse & keyboard)",
    "Quest/blackboard updates triggered by dialogue",
    "Modular dialogues per NPC with branching and quest gating"
  ],

  roleTitle: "UX & Technical Goals",
  roles: [
    "Readable cinematic UI with consistent timing and transition rules",
    "Consistent confirm/back behavior across all UI screens",
    "Dialogue locks movement while pause menu freezes gameplay and redirects input",
    "Clear hover states + click feedback (visual + timing)",
    "State-driven narrative flow powered by blackboard conditions"
  ],

  toolsTitle: "Tools",
  tools: ["Unreal Engine", "Blueprint", "Behavior Tree", "Blackboard", "UMG", "UI Animations"],

  mediaTitle: "Media",
  mediaNote: "Architecture proof, Blueprint implementation, and menu UX captures from the same project.",
  mediaItems: [
    {
      type: "image",
      title: "Dialogue System Architecture (Behavior Tree)",
      note: "Each NPC has a corresponding Behavior Tree; blackboard conditions gate branches and trigger UI tasks.",
      src: "../assets/media/steamhouse/bt.png",
      alt: "Behavior Tree dialogue structure"
    },
    {
      type: "image",
      title: "Blueprint Implementation — Dialogue Pipeline",
      note: "Event-driven widget creation, viewport injection, and 'Text Finished' binding to continue flow.",
      src: "../assets/media/steamhouse/bp_dialogue.png",
      alt: "Blueprint dialogue pipeline"
    },
    {
      type: "image",
      title: "Blueprint Implementation — Blackboard & Quest Updates",
      note: "Dialogue directly updates quest rewards and blackboard variables.",
      src: "../assets/media/steamhouse/bp_blackboard.png",
      alt: "Blueprint quest reward and blackboard update"
    },
    {
      type: "video",
      title: "Main Menu Demo",
      note: "Entry flow with animated transitions and clear navigation hierarchy (mouse & keyboard).",
      src: "../assets/media/steamhouse/mainmenu.mp4",
      mimeType: "video/mp4"
    },
    {
      type: "video",
      title: "Pause Menu Demo",
      note: "State-based pause system: gameplay freeze, input redirection, resume/settings/exit options.",
      src: "../assets/media/steamhouse/pausemenu.mp4",
      mimeType: "video/mp4"
    }
  ]
};
