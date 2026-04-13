import { AdSlot } from "@/components/layout/ad-slot";

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 hidden justify-center lg:flex">
        <AdSlot slot="leaderboard" />
      </div>
      <div className="flex gap-6">
        <main className="min-w-0 flex-1">{children}</main>
        <aside className="hidden w-[300px] shrink-0 lg:block">
          <div className="sticky top-20">
            <AdSlot slot="sidebar" />
            <div id="tool-guide-portal" />
          </div>
        </aside>
      </div>
    </div>
  );
}
