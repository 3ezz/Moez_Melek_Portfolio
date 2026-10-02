window.PROJECT_PAGE_DATA = {
  title: "Coffre Fort — Secure Document Portal",
  metaDescription: "UX/UI case study by Moez Melek: a secure portal that lets a lawyer collect documents from clients without email, from research and personas to wireframes, UI kit and high-fidelity screens.",
  backHref: "../projects.html",
  backLabel: "← Back to Projects",
  heroThumbnail: "../assets/media/coffre-fort/cover.webp",
  heroThumbnailAlt: "Coffre Fort lawyer dashboard shown on a laptop",

  heroPills: ["UX/UI Case Study", "Figma", "Desktop + Mobile", "Design System"],
  lead: "A secure document portal that lets a lawyer collect files from a client without endless email threads. I designed the complete experience for two very different users: a desktop dashboard for the lawyer, and a no-account mobile upload flow for the client.",

  overviewTitle: "Context",
  overview: "A lawyer building a case has to collect documents from the client: contracts, invoices, ID… Today this happens through scattered emails, with no tracking and no proof that anything was received. The challenge was to make that exchange traceable for the lawyer and effortless for the client.",

  featuresTitle: "Project Goals",
  features: [
    "Give the lawyer reliable tracking, without email",
    "A frictionless upload for the client, with no account to create",
    "Let the lawyer reject a non-compliant document",
    "A consistent, reusable visual system"
  ],

  roleTitle: "What I Did",
  roles: [
    "Framed the problem and the two user profiles",
    "Built proto-personas, user journey maps and task flows",
    "Wireframed every screen of both journeys",
    "Designed the high-fidelity UI and a reusable UI kit (colour, radius and spacing tokens)",
    "Planned testing, design QA and iteration"
  ],

  toolsTitle: "Tools & Methods",
  tools: ["Figma", "Proto-personas", "Journey mapping", "Wireframing", "Design tokens"],

  sections: [
    {
      eyebrow: "Research",
      title: "The lawyer: a daily user",
      note: "Comes back every day and learns the tool. Manages several cases in parallel, mostly on desktop, and wants reliable tracking without having to do support.",
      items: [
        "Persona: Maître Dupont, 38, partner in business and real-estate law, 3–8 person firm",
        "Needs to collect client documents in a traceable way, without relying on email",
        "Needs to see at a glance what is missing",
        "Needs to reject a non-compliant document without restarting an email exchange",
        "Mindset: pragmatic, adopts a tool only if it saves time from the first use, and protective of her clients"
      ]
    },
    {
      eyebrow: "Research",
      title: "The client: a one-time visitor",
      note: "Visits once, with no learning curve. Opens the link on mobile, often on the go, and will never call a generic support line. Wants to understand and act in just a few taps.",
      items: [
        "Persona: 54, runs a small shop, renegotiating a commercial lease, little experience with professional digital tools",
        "Needs to understand immediately what is being asked, without jargon",
        "Needs to upload documents in a few taps, with no account or password",
        "Needs reassurance that documents go securely and only to her lawyer",
        "Mindset: wary of links received by SMS or email, anxious about doing it wrong"
      ]
    },
    {
      eyebrow: "Task flow",
      title: "Lawyer journey",
      items: [
        "Create: builds the request in 3 steps and ticks the expected documents",
        "Send: shares the link and the code through two separate channels",
        "Track: reads every request's status at a glance on the dashboard",
        "Reject: flags an unreadable, expired or wrong document with a reason",
        "Close: the request switches to \"Complete\" automatically"
      ]
    },
    {
      eyebrow: "Task flow",
      title: "Client journey",
      items: [
        "Open: taps the link on mobile and sees the lawyer's name before doing anything",
        "Enter: types the code received by SMS, in a single field",
        "Discover: reads the checklist and sees progress (0 of 4)",
        "Upload: one action at a time, can stop and come back without losing progress",
        "Finish: fixes a rejected document if needed, then gets an explicit confirmation"
      ]
    },
    {
      eyebrow: "Key insights",
      title: "What the research told me",
      wide: true,
      items: [
        "Traceability is the real problem: not sending files, but knowing what was received and validated.",
        "Two opposite journeys need two distinct interfaces: an expert desktop tool vs. an occasional mobile flow.",
        "A rejection must stay understandable without a call: the reason is shown on the document itself.",
        "Zero support expected on the client side: every screen has to make sense on its own."
      ]
    }
  ],

  mediaTitle: "From research to high-fidelity",
  mediaNote: "Interface designed in French for a French legal context.",
  mediaItems: [
    {
      type: "image",
      layout: "wide",
      title: "User journey map — Lawyer",
      note: "Macro view of the lawyer's journey, from first use to long-term adoption: actions, goals, feelings, pain points and opportunities at each stage.",
      src: "../assets/media/coffre-fort/journey-avocat.webp",
      alt: "User journey map for the lawyer"
    },
    {
      type: "image",
      layout: "wide",
      title: "User journey map — Client",
      note: "The same framework for the client, whose whole journey fits into a single visit.",
      src: "../assets/media/coffre-fort/journey-client.webp",
      alt: "User journey map for the client"
    },
    {
      type: "image",
      layout: "wide",
      title: "Wireframes — Lawyer (desktop)",
      note: "Dashboard, request detail overlay, and the 4-step request creation flow.",
      src: "../assets/media/coffre-fort/wireframes-avocat.webp",
      alt: "Wireframes of the lawyer dashboard, detail overlay and creation steps"
    },
    {
      type: "image",
      layout: "wide",
      title: "Wireframes — Client (mobile)",
      note: "Code entry, checklist, upload sheet, success, and an expired-link state so the client is never stuck.",
      src: "../assets/media/coffre-fort/wireframes-client.webp",
      alt: "Wireframes of the five client mobile screens"
    },
    {
      type: "image",
      layout: "wide",
      title: "UI kit & design tokens",
      note: "Buttons, status badges, document rows (pending, received, rejected), rejection reasons, inputs and selectors, built on shared colour, radius and spacing tokens so both interfaces stay consistent.",
      src: "../assets/media/coffre-fort/ui-kit.webp",
      alt: "UI kit with buttons, badges, document states and design token tables"
    },
    {
      type: "image",
      layout: "wide",
      title: "High-fi — Lawyer dashboard & request detail",
      note: "Every request with a colour-coded status (in progress, complete, expired, sent) so the lawyer sees what needs attention at a glance. The detail view shows the link and code with copy actions, the state of each document, and a \"Report a problem\" action to reject a document with a reason.",
      src: "../assets/media/coffre-fort/hifi-avocat-dashboard.webp",
      alt: "High-fidelity lawyer dashboard and request detail"
    },
    {
      type: "image",
      layout: "wide",
      title: "High-fi — Creating a request",
      note: "Recipient, documents to request, link expiry, then a confirmation that reminds the lawyer to send the link and the code through two separate channels.",
      src: "../assets/media/coffre-fort/hifi-avocat-creation.webp",
      alt: "Four-step request creation flow"
    },
    {
      type: "image",
      layout: "wide",
      title: "High-fi — Client mobile journey",
      note: "The lawyer's name up front for trust, a single code field, a checklist with progress and a flagged rejection, a simple upload sheet (photo or file), a clear confirmation, and an expired-link screen that points straight back to the lawyer.",
      src: "../assets/media/coffre-fort/hifi-client.webp",
      alt: "Five high-fidelity mobile screens of the client journey"
    }
  ],

  closingSections: [
    {
      eyebrow: "Testing",
      title: "Next steps",
      wide: true,
      items: [
        "User testing: have real lawyers and clients go through the journeys to challenge the design choices (quantitative and/or qualitative, depending on users and time available).",
        "Design QA: check every screen and state against the design system specifications with the developers.",
        "Iteration: adjust the screens based on feedback, prioritising ease of use for the client."
      ]
    }
  ]
};
