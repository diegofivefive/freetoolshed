import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact",
  description: "Get in touch with the Free Tool Shed team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          Have a question, suggestion, or found a bug? We&apos;d love to hear from you.
        </p>
        <p>
          Email us at{" "}
          <a href="mailto:hello@freetoolshed.com" className="text-brand underline underline-offset-4">
            hello@freetoolshed.com
          </a>
        </p>
      </div>
    </main>
  );
}
