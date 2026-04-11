import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { GraphingCalculatorLoader } from "./_components/graphing-calculator-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Graphing Calculator",
  description:
    "A powerful online graphing calculator with TI-84 style statistics, matrix operations, and distribution functions. Plot functions, run regressions, and compute probabilities — all free in your browser.",
  slug: "graphing-calculator",
  paidAlternative: "TI-84 Online Emulators",
};

export const metadata = generateToolMetadata(toolConfig);

export default function GraphingCalculatorPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this graphing calculator really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free with no sign-up, no downloads, and no hidden fees. It's ad-supported so it can remain free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "Can this replace a TI-84 calculator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. This tool provides the same core functionality as a TI-84 — graphing functions, statistical analysis (LinReg, QuadReg), matrix operations (RREF, inverse, determinant), and distribution functions (normalcdf, invNorm, tcdf, binompdf) — with a modern, HD interface.",
        },
      },
      {
        "@type": "Question",
        name: "What types of functions can I graph?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can graph standard functions (polynomial, trigonometric, logarithmic, exponential), parametric equations (X(t)/Y(t) pairs), and polar functions (r = f(θ)). Plot up to 10 functions simultaneously with individual color coding.",
        },
      },
      {
        "@type": "Question",
        name: "How do I perform a linear regression?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Switch to Stat mode, enter your data into lists L1 and L2, then select LinReg from the regression menu. You'll get the slope (a), intercept (b), correlation coefficient (r), and R² value — just like the TI-84 STAT > CALC > LinReg(ax+b) workflow.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support normalcdf and invNorm like a TI-84?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The Distribution mode includes normalcdf, invNorm, normalpdf, tcdf, invT, chi-square CDF, binomial PDF/CDF, and Poisson PDF/CDF — all matching TI-84 output to 4 decimal places.",
        },
      },
      {
        "@type": "Question",
        name: "Can I do matrix operations like RREF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The Matrix mode supports addition, multiplication, scalar multiplication, transpose, determinant, inverse, and RREF (Reduced Row Echelon Form) for up to 10 named matrices [A] through [J].",
        },
      },
      {
        "@type": "Question",
        name: "Does it support degree and radian mode?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Toggle between degree and radian mode for all trigonometric calculations, just like the MODE button on a TI-84. The current angle mode is always visible in the toolbar.",
        },
      },
      {
        "@type": "Question",
        name: "Is this tool accurate for homework and exams?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All calculations are verified against TI-84 reference outputs and published statistical tables with over 200 automated tests ensuring accuracy to at least 4 decimal places.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Graphing Calculator
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        A powerful graphing calculator with TI-84 style statistics, matrices,
        and distributions — a free alternative to TI-84 online emulators. No
        sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">HD Function Graphing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Plot up to 10 functions simultaneously — standard, parametric, and
            polar. Pan, zoom, and trace with a modern canvas renderer that makes
            TI-84&apos;s 96&times;64 pixel screen look ancient.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">
            Statistics &amp; Regression
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter data into lists L1–L6, compute 1-Var Stats, and run
            LinReg, QuadReg, ExpReg, and PwrReg — with correlation
            coefficients and scatter plots.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Matrix Operations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Work with up to 10 matrices [A]–[J]. Add, multiply, find
            determinants, compute inverses, and row-reduce to RREF — all
            with a proper grid editor.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Distribution Functions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            normalcdf, invNorm, tcdf, binompdf, chi-square, and Poisson — the
            same distribution functions from the TI-84 DISTR menu, with shaded
            area visualizations.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <GraphingCalculatorLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
