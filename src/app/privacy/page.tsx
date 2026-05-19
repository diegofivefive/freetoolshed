import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy",
  description:
    "How Free Tool Shed handles your data: nothing is uploaded, your files stay in your browser, advertising is third-party. Plain-English privacy policy.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: 2026-05-18
      </p>

      <div className="mt-8 space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            The Short Version
          </h2>
          <p>
            Files you process with our tools never leave your browser. We
            don&apos;t require an account, we don&apos;t collect personal
            information, and we don&apos;t sell or share data. The only
            third-party services on the site are advertising networks (Google
            AdSense) and a basic ad-network fallback, both of which set their
            own cookies. The rest of this policy explains what that means in
            detail.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            What We Don&apos;t Collect
          </h2>
          <p>
            Every tool on Free Tool Shed runs entirely in your browser. The
            files you upload — invoices, resumes, pay stubs, audio clips,
            video, images, PDFs — are read into your browser&apos;s memory,
            processed there, and downloaded back to your device. There is no
            server-side processing step and no file storage on our
            infrastructure. We physically cannot see your files because the
            architecture doesn&apos;t send them anywhere.
          </p>
          <p className="mt-3">
            We also don&apos;t require an account, an email address, or any
            personal information to use the site. There is no sign-up form, no
            mailing list, and no &quot;create a profile&quot; flow.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Browser Storage (Local Only)
          </h2>
          <p>
            Some tools save drafts to your browser&apos;s local storage so you
            can come back later. For example, the invoice generator and resume
            builder auto-save your work as you type, and store an optional
            history of past invoices or resumes. This data sits in your
            browser&apos;s storage on your device — it is not sent to us, not
            synced across devices, and clears if you clear your browser data.
            You can export it as JSON for your own backup.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Advertising
          </h2>
          <p>
            The site is supported by third-party advertising. We use{" "}
            <span className="text-foreground">Google AdSense</span> and a
            secondary ad network as a fallback. These networks may use cookies
            and similar technologies to serve personalized ads based on your
            browsing history across the web — that&apos;s how the ad-supported
            model works.
          </p>
          <p className="mt-3">
            You can opt out of personalized advertising directly with the ad
            providers:{" "}
            <a
              href="https://adssettings.google.com"
              className="text-brand underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ad Settings
            </a>
            , the{" "}
            <a
              href="https://optout.aboutads.info/"
              className="text-brand underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Digital Advertising Alliance opt-out
            </a>
            , or your browser&apos;s privacy settings (or an ad blocker, which
            we don&apos;t actively work around).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Cookies
          </h2>
          <p>
            We don&apos;t set first-party tracking cookies. The only cookies
            associated with the site are those set by the advertising networks
            described above, and those used by Cloudflare for basic site
            security and bot detection (these are essential to keep the site
            online and don&apos;t track you across the web).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Children&apos;s Privacy
          </h2>
          <p>
            Free Tool Shed is a general-audience site and is not directed at
            children under 13. We do not knowingly collect personal information
            from children. If you believe a child has somehow provided personal
            information through our site, contact us and we will work to remove
            it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Your Rights (GDPR / CCPA)
          </h2>
          <p>
            Because we don&apos;t collect or store personal information on our
            servers, most data-subject requests (access, deletion, portability)
            don&apos;t apply to us — there is no data on file to act on. If
            you&apos;re a resident of the EEA, UK, California, or another
            jurisdiction with similar privacy laws and you believe you have a
            request that applies to us, email{" "}
            <a
              href="mailto:hello@freetoolshed.com"
              className="text-brand underline underline-offset-4"
            >
              hello@freetoolshed.com
            </a>{" "}
            and we&apos;ll respond within a reasonable time. For requests
            regarding the advertising networks, you&apos;ll need to contact
            them directly using the links above — they are independent data
            controllers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Changes to This Policy
          </h2>
          <p>
            We may update this policy as the site evolves. If we make a
            material change — for example, adding a new third-party service or
            a new type of data collection — we&apos;ll update the &quot;Last
            updated&quot; date above and, where appropriate, surface a notice
            on the affected tool. The previous version of this policy will
            remain available in the project&apos;s git history.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Contact
          </h2>
          <p>
            Questions about this policy go to{" "}
            <a
              href="mailto:hello@freetoolshed.com"
              className="text-brand underline underline-offset-4"
            >
              hello@freetoolshed.com
            </a>
            . The site is built and maintained by James Nicolaus — see the{" "}
            <a
              href="/about"
              className="text-brand underline underline-offset-4"
            >
              About page
            </a>{" "}
            for more.
          </p>
        </section>
      </div>
    </main>
  );
}
