interface ToolInsightsProps {
  tips: string[];
  mistakes: string[];
  takeaways: string[];
}

export function ToolInsights({ tips, mistakes, takeaways }: ToolInsightsProps) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold tracking-tight">
        Tips, Mistakes &amp; Takeaways
      </h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand">
            Tips
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-pink-400">
            Common Mistakes
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {mistakes.map((mistake, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-pink-400">!</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Key Takeaways
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {takeaways.map((takeaway, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-foreground">✓</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
