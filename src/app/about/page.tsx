import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "About",
  description:
    "Free Tool Shed provides free online tools that replace paid software. No sign up required.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">About Free Tool Shed</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          Free Tool Shed is a collection of free online tools designed to replace expensive
          paid software. Every tool runs directly in your browser — no sign up, no downloads,
          no hidden fees.
        </p>
        <p>
          We believe essential software tools should be accessible to everyone. Our tools are
          ad-supported, which means they stay free for you while we keep the lights on.
        </p>
        <p>
          All processing happens client-side in your browser. Your files never leave your
          device unless you explicitly choose to share them.
        </p>
      </div>
    </main>
  );
}
