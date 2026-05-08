# LUXE — Premium Creative Portfolio

A production-grade, fully responsive 3D portfolio built with **TanStack Start**, **React Three Fiber**, **Framer Motion** and **Tailwind CSS v4**. Designed to feel like a $10k creative-studio site — and engineered to be portable to any backend.

---

## ✨ Features

- Sticky glass header with mobile hamburger menu
- Interactive 3D hero (React Three Fiber + drei)
- Animated stats, project filters, glass cards, scroll reveals
- Journal / blog grid, testimonials, premium contact form
- Footer with editable columns, social links & newsletter capture
- Dark luxury theme (onyx + champagne gold) defined entirely with semantic design tokens
- SEO metadata per route, mobile-first, accessibility-friendly

---

## 🚀 Run locally

```bash
bun install   # or: npm install
bun dev       # or: npm run dev
```

Then open http://localhost:5173

Build for production:

```bash
bun run build
```

---

## 📝 Editing content

**All content lives in a single file:** [`src/config/site.ts`](./src/config/site.ts)

Each section has its own block — `hero`, `about`, `services`, `projects`, `testimonials`, `journal`, `contact`, `header`, `footer`. To **hide a section**, set `enabled: false`.

```ts
// Example: hide testimonials
testimonials: { enabled: false, ... }
```

To change the logo, set `brand.logoImage` to an image path (e.g. `"/images/logo.svg"`) — it overrides the text logo.

To add or reorder nav / footer links, just edit the arrays in `header.nav` and `footer.columns`.

---

## 🎨 Theming

All colors, gradients and shadows are tokens in [`src/styles.css`](./src/styles.css). Update `--primary`, `--gold`, `--background`, etc. to retheme the entire site.

```css
--primary: oklch(0.84 0.13 86); /* champagne gold */
--background: oklch(0.16 0.012 260); /* onyx */
```

---

## 📁 Folder structure

```
src/
  config/site.ts          ← single source of truth for content
  components/
    layout/               ← Header, Footer
    sections/             ← Hero, About, Services, Projects, Testimonials, Journal, Contact
    three/                ← React Three Fiber scene
    ui/                   ← shadcn primitives
  routes/                 ← file-based routes (TanStack Router)
  styles.css              ← design system tokens
```

Each section component is self-contained and reads from `site.ts` — perfect for swapping in CMS data later.

---

## 🔌 Backend integration (Laravel / WordPress / REST)

The site is intentionally **decoupled from any backend**. To wire in a CMS:

### Option A — Replace `site.ts` with a fetch

```ts
// src/config/site.ts
export async function loadSiteConfig() {
  const res = await fetch("https://your-backend.com/api/site");
  return res.json();
}
```

Then call it from a TanStack route loader and pass via context.

### Option B — Laravel Blade integration

Build the React app (`bun run build`), serve the static assets from Laravel's `public/` directory, and expose a JSON endpoint at `/api/site` returning the same shape as `site.ts`. Replace the static import with a fetch.

### Option C — WordPress (headless)

1. Create custom post types: `project`, `service`, `testimonial`, `journal_post`.
2. Expose them via the REST API (`/wp-json/wp/v2/...`) or a GraphQL plugin.
3. Map responses to the shape in `src/config/site.ts`.

---

## 📤 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — LUXE portfolio"
git branch -M main
git remote add origin git@github.com:YOU/luxe-portfolio.git
git push -u origin main
```

---

## ☁️ Deploy

This template is configured for **Cloudflare Workers** (`wrangler.jsonc`) but builds to static + SSR and works on:

- Vercel (`vercel deploy`)
- Netlify (`netlify deploy`)
- Cloudflare Pages / Workers
- Any Node host (`bun run build && bun run start`)

---

## ♿ Accessibility & performance

- Semantic landmarks (`<header>`, `<main>`, `<footer>`, `<section>`)
- Keyboard-accessible nav, visible focus states
- `loading="lazy"` on all imagery
- Reduced-motion friendly (Framer Motion respects `prefers-reduced-motion`)
- 3D canvas uses DPR clamping for smooth mobile performance

---

## License

MIT — use freely for client work and personal projects.
