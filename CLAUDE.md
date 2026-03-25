# CLAUDE.md — Free Tool Shed

## Project Overview
**Free Tool Shed** (freetoolshed.com) — a desktop-focused free tool/software hub website. Each tool replaces paid SaaS with a free, ad-supported alternative. Separate brand from thefreefix.com. Tools are individually indexable and SEO-optimized. UI/UX targets desktop power users.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Components**: shadcn/ui (Radix primitives) + Tailwind CSS v4
- **Theming**: `next-themes` — dark/light toggle, CSS custom properties
- **Heavy Processing**: Client-side WASM (ffmpeg.wasm, tesseract.js, jsPDF, Web Audio API)
- **Deployment**: Cloudflare Pages via `@cloudflare/next-on-pages`
- **Storage**: Cloudflare R2 (temp file uploads), D1 (templates/saved data)
- **Version Control**: GitHub → Cloudflare Pages auto-deploy (push to `main` = live)
- **Package Manager**: pnpm

## Architecture

### Routing
```
/                         → Homepage / tool directory
/tools/[tool-slug]        → Individual tool page
/about                    → About page (AdSense requirement)
/contact                  → Contact page (AdSense requirement)
/privacy                  → Privacy policy (AdSense requirement)
/terms                    → Terms of service (AdSense requirement)
```

### Folder Structure
```
src/
├── app/
│   ├── layout.tsx              → Root layout (nav, theme provider, ad shell)
│   ├── page.tsx                → Homepage / tool directory
│   ├── tools/
│   │   ├── layout.tsx          → Shared tool layout (sidebar, ad placements)
│   │   ├── invoice-generator/
│   │   │   ├── page.tsx        → SEO shell (metadata, content, lazy-loads tool)
│   │   │   └── _components/    → Tool-specific components
│   │   └── ... (one folder per tool)
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── privacy/page.tsx
│   └── terms/page.tsx
├── components/
│   ├── ui/                     → shadcn/ui components
│   ├── layout/                 → Nav, sidebar, footer, ad slots
│   └── shared/                 → Reusable tool components (file upload, export buttons, etc.)
├── lib/
│   ├── utils.ts
│   └── seo.ts                  → Metadata helpers, JSON-LD generators
├── styles/
│   └── globals.css             → Tailwind + CSS custom properties (color tokens)
└── types/
```

### Key Patterns
- **Server Components by default** — tool pages render SEO content server-side
- **Client Components for tools** — interactive tool UI loads via `"use client"` + dynamic import with `ssr: false` where WASM is involved
- **Lazy loading** — heavy tool bundles load only when the user navigates to that tool
- **Shared tool shell** — consistent sidebar, toolbar, and export patterns across all tools

## Design System Rules

### Desktop-First
- Primary target: 1024px+ viewports
- Use `min-width` breakpoints (mobile styles are the exception, not the base)
- Tool workspaces assume mouse + keyboard input

### Theme
- Dark and light modes via `next-themes` + CSS custom properties
- Neutral base palette (zinc) with a single brand accent color
- No hardcoded colors — always use CSS variables or Tailwind theme tokens

### Typography
- Primary: Inter (or system sans-serif fallback)
- Monospace: JetBrains Mono (for code/data tools)
- Scale: use Tailwind's default type scale consistently

### Component Standards
- Use shadcn/ui components as the base — do not install competing UI libraries
- Extend via composition, not by forking shadcn components
- All interactive elements must have visible focus indicators
- Consistent icon set: Lucide icons (ships with shadcn)

## SEO Requirements (Non-Negotiable)
Every tool page MUST include:
1. Unique `<title>` — format: `Free [Tool Name] Online — No Sign Up | Free Tool Shed`
2. Unique `<meta name="description">` — include "free alternative to [Paid Software]"
3. Open Graph tags — title, description, image
4. JSON-LD structured data — `SoftwareApplication` schema with `offers.price: "0"`
5. Semantic HTML — proper `<main>`, `<nav>`, `<h1>`-`<h3>` hierarchy
6. Content below the tool — intro paragraph, feature list, FAQ, comparison
7. Auto-generated `sitemap.xml` and `robots.txt` via Next.js config

## Ad Placements
1. **Top leaderboard** (728x90) — in root `layout.tsx`, below site nav, above content. Desktop only (`hidden lg:flex`).
2. **Right sidebar** (300x250) — in `tools/layout.tsx`, sticky, outside tool workspace. Desktop only (`hidden lg:block`).
3. **Mid-content** (728x90) — in each tool's `page.tsx`, between tool workspace and SEO content below.
4. **In-feed** — homepage tool directory only (future).

Rules:
- Tool workspace area is always ad-free
- No interstitials, popups, overlays, or auto-play video ads
- Ad containers use fixed dimensions to prevent layout shift
- Use `<AdSlot slot="..." />` from `@/components/layout/ad-slot`
- Placeholder divs render server-side with dashed border + "Ad" label for dev visibility

## Code Standards
- TypeScript strict mode — no `any` types
- Named exports only (no default exports except Next.js pages)
- File naming: kebab-case for files, PascalCase for components
- Imports: absolute paths via `@/` alias
- No `console.log` in production code
- Prefer server components; only use `"use client"` when needed
- Keep tool-specific code inside the tool's `_components/` folder

## New Tool Build Template

Every new tool MUST follow this structure and checklist:

### File Structure
```
src/app/tools/[tool-slug]/
├── page.tsx                → SEO shell: metadata, JSON-LD, tool loader, mid-content ad, SEO content
└── _components/
    ├── [tool-name].tsx         → Main "use client" tool component (state, logic, UI)
    ├── [tool-name]-loader.tsx  → Dynamic import wrapper (ssr: false if WASM)
    ├── seo-content.tsx         → Below-fold: intro, features, how-to, comparison table, FAQ
    └── ...                     → Tool-specific sub-components
```

### page.tsx Template
```tsx
import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { ToolNameLoader } from "./_components/tool-name-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Tool Name",
  description: "Short description.",
  slug: "tool-slug",
  paidAlternative: "Paid App",
};

export const metadata = generateToolMetadata(toolConfig);

export default function ToolNamePage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  // Optional: add FAQPage JSON-LD

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl font-bold tracking-tight">Free Tool Name</h1>
      <p className="mt-2 text-muted-foreground">Description. No sign-up required.</p>
      <div className="mt-6"><ToolNameLoader /></div>
      <div className="my-8 flex justify-center"><AdSlot slot="mid-content" /></div>
      <SeoContent />
    </>
  );
}
```

### Integration Checklist (after building the tool)
1. Add entry to `TOOLS` array in `src/app/page.tsx` (name, slug, description, category, icon, paidAlternative)
2. Add entry to `toolPages` in `src/app/sitemap.ts` (priority 0.8, weekly)
3. Ensure `page.tsx` includes mid-content `<AdSlot>` between tool and SEO content
4. Ensure `seo-content.tsx` has: intro paragraph, feature list, how-to steps, comparison table, FAQ
5. Run `pnpm build` — must pass with zero errors
6. Verify in dev preview: tool loads, ad placeholders visible, no console errors

## Deployment
- **Branch strategy**: `main` = production, feature branches for each tool
- **Preview deployments**: every PR gets a Cloudflare preview URL
- **Scaling path**: free tier → Workers paid ($5/mo) → add VPS if needed
