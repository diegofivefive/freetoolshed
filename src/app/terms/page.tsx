import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export const metadata: Metadata = generatePageMetadata({
  title: "Terms of Service",
  description:
    "Plain-English terms for using Free Tool Shed: free for personal and commercial use, no warranty, ad-supported, no fraudulent use of generated documents.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Terms of Service" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: 2026-05-18
      </p>

      <div className="mt-8 space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Acceptance
          </h2>
          <p>
            By using Free Tool Shed (freetoolshed.com) you agree to these
            terms. If you don&apos;t agree with them, please don&apos;t use the
            site. We may update these terms over time — material changes will
            be reflected in the &quot;Last updated&quot; date above.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Permitted Use
          </h2>
          <p>
            The tools on this site are free for personal and commercial use.
            You don&apos;t need an account, and you don&apos;t need to
            attribute Free Tool Shed in your output. You can use the generated
            invoices, resumes, pay stubs, audio clips, video, images, and other
            output for any lawful purpose.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Prohibited Use
          </h2>
          <p>
            You may not use the site or its tools to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <span className="text-foreground">
                Create fraudulent financial documents.
              </span>{" "}
              The pay stub generator and invoice generator are intended for
              legitimate use cases — replacing a lost stub, paying a contractor,
              billing a real client. Using them to fabricate documents for loan
              applications, rental applications, tax returns, or any other
              purpose where you don&apos;t have records to back them up is loan
              fraud or rental fraud and is not a supported use case.
            </li>
            <li>
              Process content you don&apos;t have the legal right to
              process — copyrighted media without permission, leaked personal
              data, illegally obtained material.
            </li>
            <li>
              Attempt to scrape, mirror, automate, or load-test the site in a
              way that would degrade service for other users.
            </li>
            <li>
              Probe, scan, or exploit the site for vulnerabilities outside of a
              good-faith security disclosure (see Contact below).
            </li>
            <li>
              Use the site to distribute malware, phishing content, or other
              abusive material.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Tool Availability
          </h2>
          <p>
            We don&apos;t guarantee uptime, accuracy, or availability of any
            tool. Tools may be added, changed, removed, or temporarily offline
            without notice. The site is hosted on Cloudflare Pages and depends
            on third-party services (advertising networks, CDN) that have their
            own availability characteristics.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            &quot;As Is&quot; Disclaimer
          </h2>
          <p>
            The site and its tools are provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind, express or implied,
            including (but not limited to) warranties of merchantability,
            fitness for a particular purpose, accuracy, or non-infringement. We
            don&apos;t warrant that the tools will be error-free, that
            generated output is suitable for any specific purpose, or that the
            site will be free from interruptions.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, Free Tool Shed and its
            operator shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages — including loss of profits,
            data, or business — arising out of your use of the site or
            inability to use the site, even if advised of the possibility of
            such damages. Your sole remedy if you&apos;re dissatisfied with the
            site is to stop using it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Your Content
          </h2>
          <p>
            You retain all rights to the content you process with the tools.
            We don&apos;t claim ownership of your invoices, resumes, pay stubs,
            audio, video, images, or any other content you create or transform
            using the site. Because everything runs in your browser, we
            don&apos;t store, transmit, or access this content at all.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Our Content
          </h2>
          <p>
            The tools themselves — source code, design, layout, copy, schemas,
            and visual identity — are the property of Free Tool Shed. You may
            use the tools as intended through the website, but you may not
            copy, reproduce, or redistribute the site itself, scrape its
            content for republication, or use the &quot;Free Tool Shed&quot;
            name and branding to represent your own offering.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Advertising
          </h2>
          <p>
            The site is supported by third-party advertising (Google AdSense
            and a fallback network). By using the site you agree to the display
            of these ads. Ad blocking is permitted and won&apos;t break tool
            functionality, though it does reduce the revenue that keeps the
            tools free.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Changes to These Terms
          </h2>
          <p>
            We may revise these terms as the site evolves. Material changes
            will be reflected in the &quot;Last updated&quot; date above.
            Continued use of the site after a change means you accept the
            updated terms. Previous versions are preserved in the
            project&apos;s git history.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Contact
          </h2>
          <p>
            Questions about these terms, or security reports, go to{" "}
            <a
              href="mailto:hello@freetoolshed.com"
              className="text-brand underline underline-offset-4"
            >
              hello@freetoolshed.com
            </a>
            . For security issues, please include &quot;Security&quot; in the
            subject line.
          </p>
        </section>
      </div>
    </main>
  );
}
