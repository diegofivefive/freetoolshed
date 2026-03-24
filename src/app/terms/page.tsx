import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Terms of Service",
  description: "Terms of service for Free Tool Shed.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <div className="mt-6 space-y-6 text-muted-foreground">
        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Usage</h2>
          <p>
            Free Tool Shed provides free online tools on an &quot;as is&quot; basis. You may
            use our tools for personal and commercial purposes without creating an account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Limitations</h2>
          <p>
            We do not guarantee uptime, accuracy, or availability of any tool. Tools may be
            modified, removed, or temporarily unavailable without notice.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Intellectual Property</h2>
          <p>
            Files you process with our tools remain your property. We do not claim any rights
            to your content. The tools themselves, including their source code and design, are
            the property of Free Tool Shed.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Advertising</h2>
          <p>
            Our tools are supported by advertising. By using our tools, you agree to the
            display of ads during your session. Ad blocking may affect tool functionality.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Contact</h2>
          <p>
            Questions about these terms? Contact us at{" "}
            <a href="mailto:hello@freetoolshed.com" className="text-brand underline underline-offset-4">
              hello@freetoolshed.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
