import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy",
  description: "Privacy policy for Free Tool Shed.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <div className="mt-6 space-y-6 text-muted-foreground">
        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Data Collection</h2>
          <p>
            Free Tool Shed processes your files entirely in your browser. We do not upload,
            store, or have access to any files you use with our tools unless explicitly stated.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Advertising</h2>
          <p>
            We use third-party advertising services (Google AdSense) to display ads. These
            services may use cookies and similar technologies to serve personalized ads based
            on your browsing history. You can opt out of personalized advertising through your
            browser settings or ad provider preferences.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Analytics</h2>
          <p>
            We may collect anonymous usage analytics to improve our tools and user experience.
            This data does not include personally identifiable information.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Contact</h2>
          <p>
            If you have questions about this privacy policy, please contact us at{" "}
            <a href="mailto:hello@freetoolshed.com" className="text-brand underline underline-offset-4">
              hello@freetoolshed.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
