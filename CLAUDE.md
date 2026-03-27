# CLAUDE.md — Free Tool Shed

## Project Overview
**Free Tool Shed** (freetoolshed.com) — a desktop-focused free tool/software hub website. Each tool replaces paid SaaS with a free, ad-supported alternative. Separate brand from thefreefix.com. Tools are individually indexable and SEO-optimized. UI/UX targets desktop power users.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Components**: shadcn/ui (`@base-ui/react` primitives, `base-nova` style — NOT Radix) + Tailwind CSS v4
- **Theming**: `next-themes` — dark/light toggle, CSS custom properties
- **Heavy Processing**: Client-side WASM (ffmpeg.wasm, tesseract.js, jsPDF, Web Audio API)
- **Deployment**: Cloudflare Pages via `@cloudflare/next-on-pages`
- **Storage**: Cloudflare R2 (temp file uploads), D1 (templates/saved data)
- **Version Control**: GitHub → Cloudflare Pages auto-deploy (push to `main` = live)
- **Package Manager**: pnpm
- **Installed deps**: jspdf, jspdf-autotable, zod (shared across tools)

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
│   │   ├── resume-builder/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   └── ... (one folder per tool)
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── privacy/page.tsx
│   └── terms/page.tsx
├── components/
│   ├── ui/                     → shadcn/ui components (button, card, badge, dropdown-menu,
│   │                             input, select, label, textarea, tabs, separator, sheet, tooltip)
│   ├── layout/                 → Nav, sidebar, footer, ad slots, adsense-script
│   └── shared/                 → Reusable: FileUpload, ExportButton, AdSlot
├── lib/
│   ├── utils.ts
│   ├── seo.ts                  → generateToolMetadata, generateToolJsonLd, generatePageMetadata
│   ├── invoice/                → Invoice generator lib (types, templates, schema)
│   └── resume/                 → Resume builder lib (types, templates, schema, storage, ats-checker)
├── styles/
│   └── globals.css             → Tailwind + oklch CSS custom properties (color tokens)
└── types/
```

### Key Patterns
- **Server Components by default** — tool pages render SEO content server-side
- **Client Components for tools** — interactive tool UI loads via `"use client"` + dynamic import with `ssr: false`
- **Loader wrapper required** — Next.js 16: `ssr: false` dynamic imports MUST be in a `"use client"` wrapper component (`tool-name-loader.tsx`), NOT directly in a server component page
- **Lazy loading** — heavy tool bundles load only when the user navigates to that tool
- **Shared tool shell** — consistent sidebar, toolbar, and export patterns across all tools
- **Polymorphic buttons** — use `render` prop (not `asChild`): `<Button render={<Link href="/" />}>`

## Design System Rules

### Desktop-First
- Primary target: 1024px+ viewports
- Use `min-width` breakpoints (mobile styles are the exception, not the base)
- Tool workspaces assume mouse + keyboard input

### Theme
- Dark and light modes via `next-themes` + CSS custom properties
- Neutral base palette (zinc) with brand accent: emerald green (`--brand` CSS variable)
- All colors via oklch CSS custom properties in `globals.css`
- No hardcoded colors — always use CSS variables or Tailwind theme tokens

### Typography
- Primary: Geist Sans (`--font-geist-sans`)
- Monospace: Geist Mono (`--font-geist-mono`)
- Scale: use Tailwind's default type scale consistently

### Color Rules
- **Errors/warnings**: Use `pink-400`/`pink-500` palette — NEVER use `red` or `rose`
- **Success/positive**: Use `emerald` palette
- **Caution/medium**: Use `amber` palette
- **Brand accent**: Use `text-brand` / `border-brand` (emerald green)

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
5. FAQPage JSON-LD — 5–10 Q&A pairs relevant to the tool
6. Semantic HTML — proper `<main>`, `<nav>`, `<h1>`-`<h3>` hierarchy
7. Content below the tool — intro paragraph, feature list, FAQ, comparison
8. Auto-generated `sitemap.xml` and `robots.txt` via Next.js config

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
- AdSense publisher ID: `ca-pub-7700405385978151`

## Code Standards
- TypeScript strict mode — no `any` types
- Named exports only (no default exports except Next.js pages)
- File naming: kebab-case for files, PascalCase for components
- Imports: absolute paths via `@/` alias
- No `console.log` in production code
- Prefer server components; only use `"use client"` when needed
- Keep tool-specific code inside the tool's `_components/` folder

---

## Building New Tools — Staged Workflow

### IMPORTANT: Build tools in stages. Stop after each stage and wait for user approval before continuing.

When the user asks to build a new tool, create a plan (use EnterPlanMode) that breaks the work into sequential stages. Each stage should be a meaningful, testable milestone. **After completing each stage, STOP and report what was done. Do NOT continue to the next stage until the user says to proceed.**

### Recommended Stages (adjust per tool complexity)
1. **Scaffold** — Create folder structure, page.tsx (SEO shell with metadata, JSON-LD, feature cards), loader component, empty main component, seo-content.tsx placeholder
2. **Types & Schema** — Define TypeScript types, Zod validation schemas, constants
3. **Core State & Layout** — Main component shell with state management (useReducer), layout structure, tab/panel organization
4. **Primary Feature** — The tool's main functionality (e.g., form inputs, editor, canvas)
5. **Secondary Features** — Supporting features (e.g., templates, settings, customization)
6. **Export/Output** — PDF generation, file download, print, copy-to-clipboard
7. **Persistence** — localStorage auto-save, history/versioning, JSON import/export
8. **SEO Content** — Full seo-content.tsx (intro, features list, how-to steps, comparison table, FAQ)
9. **Integration** — Add to TOOLS array in `page.tsx`, add to `sitemap.ts`, verify build passes
10. **Review & Polish** — Final check: no `any` types, no `console.log`, pink for errors, all patterns followed

### Tool Page Structure (follow for ALL tools)
```
page.tsx renders in this order:
1. <h1> — tool title ("Free [Tool Name]")
2. <p>  — one-line subtitle mentioning the paid alternative
3. 2×2 feature card grid — pushes tool below sidebar ad (300×250)
   Each card: rounded-lg border border-border bg-card p-4
   <h2 className="text-sm font-semibold"> + <p className="mt-1 text-sm text-muted-foreground">
4. Tool component (dynamic import, ssr: false, via loader)
5. Mid-content <AdSlot slot="mid-content" />
6. <SeoContent /> — features, how-to, comparison table, FAQ
```

### File Structure
```
src/app/tools/[tool-slug]/
├── page.tsx                → SEO shell: metadata, JSON-LD, feature cards, tool loader, mid-content ad, SEO content
└── _components/
    ├── [tool-name].tsx         → Main "use client" tool component (state, logic, UI)
    ├── [tool-name]-loader.tsx  → "use client" dynamic import wrapper (ssr: false)
    ├── seo-content.tsx         → Below-fold: intro, features, how-to, comparison table, FAQ
    └── ...                     → Tool-specific sub-components
```

If the tool needs shared lib code:
```
src/lib/[tool-slug]/
├── types.ts       → TypeScript interfaces and type unions
├── schema.ts      → Zod validation schemas
├── constants.ts   → Labels, defaults, presets
├── storage.ts     → localStorage persistence helpers
└── ...            → Tool-specific utilities
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
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      // 5-10 Q&A objects
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <h1 className="text-3xl font-bold tracking-tight">Free Tool Name</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Description — a free alternative to [Paid App]. No sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* 4 feature cards */}
      </div>

      <div className="mt-8"><ToolNameLoader /></div>
      <div className="my-8 flex justify-center"><AdSlot slot="mid-content" /></div>
      <SeoContent />
    </>
  );
}
```

### Loader Template
```tsx
"use client";

import dynamic from "next/dynamic";

const ToolName = dynamic(
  () => import("./tool-name").then((mod) => mod.ToolName),
  { ssr: false }
);

export function ToolNameLoader() {
  return <ToolName />;
}
```

### Integration Checklist (Stage 9)
1. Add entry to `TOOLS` array in `src/app/page.tsx` (name, slug, description, category, icon, paidAlternative)
2. Add entry to `toolPages` in `src/app/sitemap.ts` (priority 0.8, weekly changeFrequency)
3. Ensure `page.tsx` includes mid-content `<AdSlot>` between tool and SEO content
4. Ensure `seo-content.tsx` has: intro paragraph, feature list, how-to steps, comparison table, FAQ
5. Run `pnpm build` — must pass with zero errors
6. Verify in dev preview: tool loads, ad placeholders visible, no console errors

---

## Create Brief Command

When the user says **"create brief"**, generate a standalone markdown document that can be pasted into another Claude session or machine to continue or review the work. The brief should contain:

```markdown
# [Tool Name] — Build Brief

## What Was Built
[1-2 sentence summary of the tool and what it does]

## Current Status
[Which stages are complete, which remain]

## Files Created/Modified
[List all files with one-line descriptions]

## Architecture Decisions
[Key decisions: state management approach, data model, templates, etc.]

## Dependencies
[Any new packages added]

## Remaining Work
[What still needs to be done, if anything]

## Integration Status
- [ ] Added to TOOLS array in page.tsx
- [ ] Added to sitemap.ts
- [ ] page.tsx has mid-content AdSlot
- [ ] seo-content.tsx complete
- [ ] Build passes (pnpm build)
- [ ] Preview verified

## Key Patterns to Follow
- Pink for errors (pink-400/500), never red/rose
- Geist Sans/Mono fonts
- oklch CSS custom properties via --brand
- "use client" loader wrapper for ssr: false dynamic imports
- 2×2 feature card grid above the tool component
- useReducer for complex state, localStorage for persistence
```

Output the brief as a fenced markdown code block so the user can copy-paste it directly.

## Deployment
- **Branch strategy**: `main` = production, feature branches for each tool
- **Preview deployments**: every PR gets a Cloudflare preview URL
- **Scaling path**: free tier → Workers paid ($5/mo) → add VPS if needed
