import { AdSlot } from "@/components/layout/ad-slot";

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full min-w-[840px] max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <main className="min-w-0 flex-1">{children}</main>
      <aside className="w-[300px] shrink-0">
        <div className="sticky top-20">
          <AdSlot slot="sidebar" />
        </div>
      </aside>
    </div>
  );
}
