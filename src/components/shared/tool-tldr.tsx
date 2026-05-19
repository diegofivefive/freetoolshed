interface ToolTldrProps {
  children: React.ReactNode;
}

export function ToolTldr({ children }: ToolTldrProps) {
  return (
    <section
      aria-label="Summary"
      className="mt-6 rounded-lg border border-brand/30 bg-brand/5 p-4"
    >
      <p className="text-sm leading-relaxed text-foreground">{children}</p>
    </section>
  );
}
