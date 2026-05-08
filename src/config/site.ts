/**
 * ─────────────────────────────────────────────────────────────
 *  LUXE PORTFOLIO — CENTRAL SITE CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 *
 *  Edit this file to update every piece of content on the site.
 *  Each section is independently editable. To hide a section,
 *  set its `enabled` flag to false.
 *
 *  This file is plain TypeScript with no framework lock-in:
 *   - Drop the same shape into a Laravel JSON endpoint
 *   - Or expose it via WordPress REST API
 *   - Or replace with a CMS fetch in `loadSiteConfig()`
 * ─────────────────────────────────────────────────────────────
 */

export type NavItem = { label: string; href: string };
export type SocialLink = { label: string; href: string; icon: string };

export const site = {
  /* ── Brand ─────────────────────────────────────────────── */
  brand: {
    name: "LUXE",
    // Replace with image path (e.g. "/images/logo.svg") or keep text logo
    logoText: "LUXE",
    logoImage: null as string | null,
    tagline: "Crafting digital experiences with intention.",
  },

  /* ── SEO defaults (overridable per route) ──────────────── */
  seo: {
    title: "LUXE — Premium Creative Portfolio",
    description:
      "An award-winning creative studio crafting refined digital experiences, brand systems and immersive 3D interfaces.",
    url: "https://luxe.example.com",
    twitter: "@luxe",
  },

  /* ── Header / Navigation ───────────────────────────────── */
  header: {
    sticky: true,
    cta: { label: "Start a Project", href: "/contact" },
    nav: [
      { label: "Home", href: "/" },
      { label: "Work", href: "/work" },
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Journal", href: "/journal" },
      { label: "Contact", href: "/contact" },
    ] as NavItem[],
  },

  /* ── Hero ──────────────────────────────────────────────── */
  hero: {
    enabled: true,
    eyebrow: "Independent Creative Studio · Est. 2018",
    titleLines: ["Designing the", "future, refined."],
    subtitle:
      "We partner with visionary brands to craft immersive websites, identity systems and interactive 3D experiences that feel inevitable.",
    primaryCta: { label: "View Selected Work", href: "/work" },
    secondaryCta: { label: "Book a Call", href: "/contact" },
  },

  /* ── About ─────────────────────────────────────────────── */
  about: {
    enabled: true,
    eyebrow: "About",
    title: "A studio of one, with the precision of ten.",
    body: [
      "I'm a multidisciplinary designer & developer with over a decade of experience translating ambitious brands into refined digital products.",
      "My practice sits at the intersection of typography, motion and engineering — every pixel is intentional, every interaction earns its place.",
    ],
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=80",
    stats: [
      { value: 120, suffix: "+", label: "Projects Shipped" },
      { value: 14, suffix: "", label: "Industry Awards" },
      { value: 42, suffix: "M", label: "Users Reached" },
      { value: 98, suffix: "%", label: "Client Retention" },
    ],
    skills: [
      "Brand Identity",
      "Web Design",
      "3D / WebGL",
      "Motion",
      "Art Direction",
      "Product Design",
      "React / Next",
      "Creative Code",
    ],
  },

  /* ── Services ──────────────────────────────────────────── */
  services: {
    enabled: true,
    eyebrow: "Services",
    title: "Crafted offerings, end-to-end.",
    items: [
      {
        title: "Brand Identity",
        description:
          "Marks, systems and guidelines designed to outlast trends and scale across every touchpoint.",
        icon: "✦",
      },
      {
        title: "Web Experiences",
        description:
          "Bespoke websites engineered with care — fast, accessible and impossibly smooth.",
        icon: "◇",
      },
      {
        title: "Interactive 3D",
        description:
          "Real-time WebGL scenes and product configurators that turn browsers into showrooms.",
        icon: "◎",
      },
      {
        title: "Art Direction",
        description:
          "Editorial direction for campaigns, films and launch moments that demand presence.",
        icon: "✺",
      },
    ],
  },

  /* ── Projects ──────────────────────────────────────────── */
  projects: {
    enabled: true,
    eyebrow: "Selected Work",
    title: "Recent collaborations.",
    filters: ["All", "Brand", "Web", "3D", "Motion"],
    items: [
      {
        title: "Aether Studio",
        category: "3D",
        year: "2025",
        cover:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
        tags: ["WebGL", "Brand"],
      },
      {
        title: "Maison Noir",
        category: "Brand",
        year: "2024",
        cover:
          "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&q=80",
        tags: ["Identity", "Print"],
      },
      {
        title: "Halcyon Labs",
        category: "Web",
        year: "2024",
        cover:
          "https://images.unsplash.com/photo-1620207418302-439b387441b0?w=1200&q=80",
        tags: ["Next.js", "Motion"],
      },
      {
        title: "Solace Audio",
        category: "Motion",
        year: "2024",
        cover:
          "https://images.unsplash.com/photo-1593697972646-2f348871bd56?w=1200&q=80",
        tags: ["Film", "Direction"],
      },
      {
        title: "Verdant Hotels",
        category: "Web",
        year: "2023",
        cover:
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
        tags: ["Hospitality", "CMS"],
      },
      {
        title: "Orbit Wearables",
        category: "3D",
        year: "2023",
        cover:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80",
        tags: ["Product", "Configurator"],
      },
    ],
  },

  /* ── Testimonials ──────────────────────────────────────── */
  testimonials: {
    enabled: true,
    eyebrow: "Kind Words",
    title: "Trusted by founders & creative directors.",
    items: [
      {
        quote:
          "The most considered design partner we've worked with. Every detail felt deliberate, every handoff effortless.",
        author: "Elena Marchetti",
        role: "Creative Director, Maison Noir",
      },
      {
        quote:
          "They translated an abstract vision into a launch that broke our traffic records. Twice.",
        author: "Daniel Okafor",
        role: "Founder, Halcyon Labs",
      },
      {
        quote:
          "Rare blend of taste and engineering rigor. The WebGL work is genuinely best-in-class.",
        author: "Mira Chen",
        role: "Head of Product, Orbit",
      },
    ],
  },

  /* ── Journal / Blog ────────────────────────────────────── */
  journal: {
    enabled: true,
    eyebrow: "Journal",
    title: "Notes on craft.",
    items: [
      {
        title: "On the slow web",
        excerpt:
          "Why restraint is the most under-used tool in modern interface design.",
        date: "May 2026",
        href: "#",
        cover:
          "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=900&q=80",
      },
      {
        title: "Designing for motion-first interfaces",
        excerpt:
          "A field guide to building experiences that feel alive without feeling busy.",
        date: "Apr 2026",
        href: "#",
        cover:
          "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=900&q=80",
      },
      {
        title: "The economics of taste",
        excerpt:
          "What luxury hospitality taught us about pricing creative work.",
        date: "Mar 2026",
        href: "#",
        cover:
          "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=900&q=80",
      },
    ],
  },

  /* ── Contact ───────────────────────────────────────────── */
  contact: {
    enabled: true,
    eyebrow: "Contact",
    title: "Let's build something rare.",
    body: "Currently accepting two new engagements per quarter. Tell us about your project and we'll be in touch within 48 hours.",
    email: "studio@luxe.example.com",
    phone: "+1 (415) 555 0142",
    address: "San Francisco · New York · Remote",
  },

  /* ── Footer ────────────────────────────────────────────── */
  footer: {
    columns: [
      {
        title: "Studio",
        links: [
          { label: "About", href: "/about" },
          { label: "Services", href: "/services" },
          { label: "Journal", href: "/journal" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Work",
        links: [
          { label: "All Projects", href: "/work" },
          { label: "Brand", href: "/work?cat=brand" },
          { label: "Web", href: "/work?cat=web" },
          { label: "3D", href: "/work?cat=3d" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Process", href: "#" },
          { label: "Press Kit", href: "#" },
          { label: "Careers", href: "#" },
          { label: "Privacy", href: "#" },
        ],
      },
    ],
    socials: [
      { label: "Instagram", href: "https://instagram.com", icon: "Instagram" },
      { label: "Twitter", href: "https://twitter.com", icon: "Twitter" },
      { label: "Dribbble", href: "https://dribbble.com", icon: "Dribbble" },
      { label: "LinkedIn", href: "https://linkedin.com", icon: "Linkedin" },
    ] as SocialLink[],
    newsletter: {
      enabled: true,
      title: "The Quarterly",
      description: "Four times a year. Field notes, new work, no noise.",
      placeholder: "you@studio.com",
      cta: "Subscribe",
    },
    copyright: `© ${new Date().getFullYear()} LUXE Studio. All rights reserved.`,
  },
};

export type SiteConfig = typeof site;
