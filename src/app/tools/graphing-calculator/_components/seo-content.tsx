import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <div className="mt-16 space-y-12">
      <Separator />

      {/* Intro */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Free Online Graphing Calculator — TI-84 Alternative
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Free Tool Shed&apos;s graphing calculator brings TI-84 functionality
          to your browser with a modern, high-definition interface. Plot
          functions in crisp detail instead of on a 96&times;64 pixel screen.
          Run linear regressions, compute matrix operations, and evaluate
          distribution functions — all without buying a $100+ calculator or
          downloading a sketchy ROM emulator. Every calculation is verified
          against TI-84 reference outputs with over 200 automated tests,
          so you can trust the results for homework, exams, and research.
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Features</h2>
        <ul className="mt-4 grid max-w-3xl gap-3 sm:grid-cols-2">
          {[
            "Plot up to 10 functions simultaneously with individual colors",
            "Standard, parametric (X(t)/Y(t)), and polar (r=f(θ)) graphing modes",
            "Interactive pan, zoom, and trace with coordinate readout",
            "Auto-generated x/y value tables with configurable step size",
            "Degree and radian mode toggle for all trig functions",
            "1-Var Stats: mean, median, standard deviation, five-number summary",
            "Regression: LinReg, QuadReg, ExpReg, PwrReg with r and R² values",
            "Data entry in lists L1–L6 with scatter plot overlay",
            "Matrix operations: add, multiply, determinant, inverse, RREF, transpose",
            "Up to 10 named matrices [A]–[J] with resizable grid editor",
            "Normal distribution: normalcdf, invNorm, normalpdf",
            "t-distribution: tcdf, invT — with shaded area visualization",
            "Binomial: binompdf, binomcdf — matching TI-84 DISTR menu",
            "Chi-square and Poisson distribution functions",
            "Command palette (Ctrl+K) for quick function access",
            "localStorage persistence — your work survives page reload",
          ].map((feature) => (
            <li key={feature} className="flex gap-2 text-sm text-muted-foreground">
              <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {/* How to Use */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          How to Use the Graphing Calculator
        </h2>
        <ol className="mt-4 max-w-3xl list-inside list-decimal space-y-3 text-muted-foreground">
          <li>
            <strong className="text-foreground">Graph a function:</strong> In
            Graph mode, type an expression like{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              sin(x)
            </code>{" "}
            or{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              x^2 - 4
            </code>{" "}
            into a Y= slot and see it plotted instantly.
          </li>
          <li>
            <strong className="text-foreground">Run a regression:</strong>{" "}
            Switch to Stat mode, enter x-values in L1 and y-values in L2,
            then choose LinReg, QuadReg, ExpReg, or PwrReg from the
            regression menu.
          </li>
          <li>
            <strong className="text-foreground">Solve a system with RREF:</strong>{" "}
            In Matrix mode, enter the augmented matrix and click RREF. The
            reduced row echelon form gives you the solution directly.
          </li>
          <li>
            <strong className="text-foreground">
              Compute a normal probability:
            </strong>{" "}
            In Dist mode, select normalcdf, enter lower bound, upper bound,
            mean, and standard deviation — just like the TI-84 DISTR menu.
          </li>
          <li>
            <strong className="text-foreground">Generate a table:</strong>{" "}
            Switch to Table mode, set your start value and step size, and
            view computed y-values for all active functions.
          </li>
        </ol>
      </section>

      {/* Comparison Table */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Comparison: Free Tool Shed vs. TI-84 vs. Desmos
        </h2>
        <div className="mt-4 max-w-3xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-4 text-left font-semibold">Feature</th>
                <th className="pb-2 pr-4 text-left font-semibold">
                  Free Tool Shed
                </th>
                <th className="pb-2 pr-4 text-left font-semibold">TI-84</th>
                <th className="pb-2 text-left font-semibold">Desmos</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ["Price", "Free", "$100+", "Free"],
                ["Graph resolution", "HD canvas", "96×64 px", "HD canvas"],
                ["Function graphing", "✓", "✓", "✓"],
                ["Parametric/Polar", "✓", "✓", "✓"],
                ["Statistics (1-Var)", "✓", "✓", "Limited"],
                ["LinReg/QuadReg", "✓", "✓", "✗"],
                ["Matrix RREF", "✓", "✓", "✗"],
                ["normalcdf/invNorm", "✓", "✓", "✗"],
                ["Binomial/Poisson", "✓", "✓", "✗"],
                ["TI-84 menu structure", "Familiar", "Native", "Different"],
                ["Works in browser", "✓", "Emulators only", "✓"],
                ["No sign-up required", "✓", "N/A", "✓ (basic)"],
              ].map(([feature, fts, ti84, desmos]) => (
                <tr key={feature} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">
                    {feature}
                  </td>
                  <td className="py-2 pr-4">{fts}</td>
                  <td className="py-2 pr-4">{ti84}</td>
                  <td className="py-2">{desmos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="mt-4 max-w-3xl space-y-4">
          {[
            {
              q: "Is this accurate enough for my statistics class?",
              a: "Yes. All calculations are verified against TI-84 reference outputs with over 200 automated tests. Results match to at least 4 decimal places — the same precision your TI-84 displays.",
            },
            {
              q: "Can I use this on an exam?",
              a: "That depends on your instructor's policy. Many allow browser-based calculators for online exams. This tool runs entirely in your browser with no server communication, so it works offline after the initial load.",
            },
            {
              q: "Why not just use Desmos?",
              a: "Desmos is excellent for graphing but doesn't include statistics (regression, distributions) or matrix operations. If your textbook references TI-84 workflows (STAT > CALC > LinReg, DISTR > normalcdf), this tool follows those same workflows with a modern UI.",
            },
            {
              q: "Does it save my work?",
              a: "Yes. Your functions, data lists, matrices, and settings are automatically saved to your browser's localStorage and restored when you return.",
            },
            {
              q: "What functions does the expression parser support?",
              a: "Standard arithmetic (+, -, *, /, ^), trig (sin, cos, tan, asin, acos, atan), logarithms (log, ln, log10, log2), exponentials (exp, e^x), roots (sqrt, cbrt), and more. Constants pi and e are built in.",
            },
          ].map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-brand">
                {q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
