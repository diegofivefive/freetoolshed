import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";
import { generatePersonJsonLd, author, organization } from "@/lib/author";

export const metadata: Metadata = generatePageMetadata({
  title: "About",
  description:
    "Free Tool Shed builds free, browser-based alternatives to paid software. Built and maintained by James Nicolaus.",
  path: "/about",
});

const SITE_URL = "https://freetoolshed.com";

export default function AboutPage() {
  const personJsonLd = generatePersonJsonLd();
  const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Free Tool Shed",
    url: `${SITE_URL}/about`,
    about: { "@id": organization.id },
    mainEntity: { "@id": author.id },
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />

      <h1 className="text-3xl font-bold tracking-tight">About Free Tool Shed</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Free Tool Shed is a growing collection of browser-based tools that
        replace paid software. No sign-up, no downloads, no subscription — just
        open a tool and use it.
      </p>

      <section className="mt-10" id="mission">
        <h2 className="text-xl font-semibold text-foreground">Our Mission</h2>
        <p className="mt-3 text-muted-foreground">
          Too many essential tools sit behind paywalls, mandatory sign-ups, and
          freemium limits that exist only to push you toward a $15/month
          subscription. Need a one-off invoice? A pay stub? A quick audio trim
          before sending a clip to a friend? You shouldn&apos;t need to create
          an account and hand over an email to do it.
        </p>
        <p className="mt-3 text-muted-foreground">
          We build the free, ad-supported alternative. Each tool on this site
          targets a specific paid product — FreshBooks, Resume.io, Adobe
          Audition, Loom, TI-84, and others — and replaces the most common
          workflows with a desktop-quality browser version. The ads are how the
          tools stay free; the tools themselves never ask you for anything else.
        </p>
      </section>

      <section className="mt-10" id="james-nicolaus">
        <h2 className="text-xl font-semibold text-foreground">
          Who Runs This
        </h2>
        <p className="mt-3 text-muted-foreground">
          Free Tool Shed is built and maintained by{" "}
          <span className="text-foreground">{author.name}</span>. Every tool on
          the site is designed, written, tested, and shipped by one person.
          That keeps the scope honest: we ship tools we&apos;d use ourselves,
          and we don&apos;t pretend the catalog is bigger than it is.
        </p>
        <p className="mt-3 text-muted-foreground">
          If something breaks, if a feature feels half-finished, or if you want
          a tool we haven&apos;t built yet, the fastest path is{" "}
          <Link href="/contact" className="text-brand underline underline-offset-4">
            the contact page
          </Link>
          . Reports go to a real human inbox, not a queue.
        </p>
      </section>

      <section className="mt-10" id="how-its-built">
        <h2 className="text-xl font-semibold text-foreground">
          How the Site Is Built
        </h2>
        <p className="mt-3 text-muted-foreground">
          Every tool runs entirely in your browser. That&apos;s a deliberate
          architectural choice, not a marketing line. Heavy work — PDF
          generation, audio decoding, OCR, video transcoding — runs on your
          machine using WebAssembly, the Web Audio API, Canvas, and similar
          browser-native technology. There is no upload step, no server-side
          job queue, and no storage bucket holding your files.
        </p>
        <p className="mt-3 text-muted-foreground">
          The practical result is that your data does not leave your device.
          Invoices, resumes, pay stubs, audio clips, screenshots — whatever you
          process stays local. We can&apos;t see it because the architecture
          doesn&apos;t let us. Drafts auto-save to your browser&apos;s local
          storage so you can come back later; export to PDF or your format of
          choice when you&apos;re done.
        </p>
      </section>

      <section className="mt-10" id="editorial-standards">
        <h2 className="text-xl font-semibold text-foreground">
          Editorial Standards
        </h2>
        <p className="mt-3 text-muted-foreground">
          Content on this site is written firsthand, based on building and
          using the tools we publish. When we describe what a tool does, what
          to expect, or where it stops short of a paid product, that comes from
          designing and testing the workflow ourselves — not from
          rephrasing competitor marketing pages.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            <span className="text-foreground">No fabricated benchmarks.</span>{" "}
            If we don&apos;t have a real measurement, we don&apos;t cite one.
          </li>
          <li>
            <span className="text-foreground">Honest limits.</span> If a tool
            doesn&apos;t do something the paid alternative does, we say so on
            the page.
          </li>
          <li>
            <span className="text-foreground">Real corrections.</span> When we
            ship a bug or get something wrong, the fix and the note land in
            public git history, not a silent edit.
          </li>
          <li>
            <span className="text-foreground">Author accountability.</span>{" "}
            Every tool page carries a byline back to this page. One person is
            responsible.
          </li>
        </ul>
      </section>

      <section className="mt-10" id="ads-and-money">
        <h2 className="text-xl font-semibold text-foreground">
          How We Stay Free
        </h2>
        <p className="mt-3 text-muted-foreground">
          The site is supported by display advertising. Ads appear in fixed
          slots — a top banner, a sidebar unit, and one mid-page placement
          below the tool workspace. We don&apos;t use interstitials, autoplay
          video, or pop-ups, and we keep ads out of the tool itself so the
          workspace stays clean. If ads ever stop covering hosting and
          bandwidth, we&apos;ll talk about it on this page before we change the
          model.
        </p>
      </section>

      <section className="mt-10" id="contact">
        <h2 className="text-xl font-semibold text-foreground">Get in Touch</h2>
        <p className="mt-3 text-muted-foreground">
          Bug reports, tool requests, partnership questions, or anything else
          — email{" "}
          <a
            href="mailto:hello@freetoolshed.com"
            className="text-brand underline underline-offset-4"
          >
            hello@freetoolshed.com
          </a>{" "}
          or use the{" "}
          <Link href="/contact" className="text-brand underline underline-offset-4">
            contact page
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
