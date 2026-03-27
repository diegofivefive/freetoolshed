import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { Mail, Bug, Lightbulb, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact",
  description:
    "Get in touch with the Free Tool Shed team. Report bugs, suggest new tools, or ask a question.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
      <p className="mt-4 text-muted-foreground">
        Have a question, suggestion, or found a bug? We&apos;d love to hear from you.
        Reach out at{" "}
        <a
          href="mailto:hello@freetoolshed.com"
          className="text-brand underline underline-offset-4"
        >
          hello@freetoolshed.com
        </a>{" "}
        and we&apos;ll get back to you as soon as we can.
      </p>

      <Separator className="my-8" />

      <h2 className="text-xl font-semibold">How Can We Help?</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card className="flex gap-3 p-4">
          <Bug className="mt-0.5 size-5 shrink-0 text-brand" />
          <div>
            <h3 className="text-sm font-semibold">Report a Bug</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Something not working right? Let us know which tool, what you
              expected to happen, and what happened instead. Screenshots help.
            </p>
          </div>
        </Card>
        <Card className="flex gap-3 p-4">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-brand" />
          <div>
            <h3 className="text-sm font-semibold">Suggest a Tool</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Is there a paid tool you wish was free? Tell us what it does and
              why you need it — the most requested tools get built first.
            </p>
          </div>
        </Card>
        <Card className="flex gap-3 p-4">
          <HelpCircle className="mt-0.5 size-5 shrink-0 text-brand" />
          <div>
            <h3 className="text-sm font-semibold">General Questions</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Questions about how the site works, our privacy practices, or
              anything else? We&apos;re happy to answer.
            </p>
          </div>
        </Card>
        <Card className="flex gap-3 p-4">
          <Mail className="mt-0.5 size-5 shrink-0 text-brand" />
          <div>
            <h3 className="text-sm font-semibold">Business Inquiries</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Partnership opportunities, advertising questions, or press
              inquiries — reach out and we&apos;ll point you in the right direction.
            </p>
          </div>
        </Card>
      </div>

      <Separator className="my-8" />

      <section>
        <h2 className="text-xl font-semibold">Frequently Asked</h2>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold">What&apos;s the typical response time?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We aim to respond within 1–2 business days. Bug reports for broken tools
              are prioritized.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Is there a community or forum?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Not yet, but it&apos;s on our radar. For now, email is the best way to reach us.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">I found a security issue. How do I report it?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Please email us directly at{" "}
              <a
                href="mailto:hello@freetoolshed.com"
                className="text-brand underline underline-offset-4"
              >
                hello@freetoolshed.com
              </a>{" "}
              with &quot;Security&quot; in the subject line. We take these reports seriously
              and will respond promptly.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
