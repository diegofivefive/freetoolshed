import { describe, it, expect } from "vitest";
import {
  gamma,
  factorial,
  erf,
  normalpdf,
  normalcdf,
  invNorm,
  tpdf,
  tcdf,
  invT,
  chi2pdf,
  chi2cdf,
  binompdf,
  binomcdf,
  poissonpdf,
  poissoncdf,
} from "@/lib/graphing-calculator/distributions";

// ─── Gamma & Factorial ───────────────────────────────────────────────────────

describe("gamma and factorial", () => {
  it("Gamma(1) = 1", () => {
    expect(gamma(1)).toBeCloseTo(1, 8);
  });

  it("Gamma(2) = 1", () => {
    expect(gamma(2)).toBeCloseTo(1, 8);
  });

  it("Gamma(5) = 24 = 4!", () => {
    expect(gamma(5)).toBeCloseTo(24, 6);
  });

  it("Gamma(0.5) = sqrt(pi)", () => {
    expect(gamma(0.5)).toBeCloseTo(Math.sqrt(Math.PI), 6);
  });

  it("factorial(0) = 1", () => {
    expect(factorial(0)).toBe(1);
  });

  it("factorial(5) = 120", () => {
    expect(factorial(5)).toBe(120);
  });

  it("factorial(10) = 3628800", () => {
    expect(factorial(10)).toBe(3628800);
  });

  it("factorial throws on negative", () => {
    expect(() => factorial(-1)).toThrow();
  });
});

// ─── Error Function ──────────────────────────────────────────────────────────

describe("erf", () => {
  it("erf(0) = 0", () => {
    expect(erf(0)).toBeCloseTo(0, 8);
  });

  it("erf(1) ≈ 0.8427", () => {
    expect(erf(1)).toBeCloseTo(0.8427, 4);
  });

  it("erf(-1) ≈ -0.8427", () => {
    expect(erf(-1)).toBeCloseTo(-0.8427, 4);
  });

  it("erf(3) ≈ 0.99998", () => {
    expect(erf(3)).toBeCloseTo(0.99998, 4);
  });
});

// ─── Normal Distribution ─────────────────────────────────────────────────────
// All values verified against TI-84 and standard z-tables

describe("normalpdf", () => {
  it("standard normal at x=0: 1/sqrt(2pi) ≈ 0.3989", () => {
    expect(normalpdf(0)).toBeCloseTo(0.3989, 4);
  });

  it("standard normal at x=1 ≈ 0.2420", () => {
    expect(normalpdf(1)).toBeCloseTo(0.2420, 4);
  });

  it("non-standard: normalpdf(100, 100, 15) = peak", () => {
    expect(normalpdf(100, 100, 15)).toBeCloseTo(1 / (15 * Math.sqrt(2 * Math.PI)), 6);
  });
});

describe("normalcdf", () => {
  // TI-84: normalcdf(-1E99, 0, 0, 1) = 0.5
  it("P(Z <= 0) = 0.5", () => {
    expect(normalcdf(-1e99, 0, 0, 1)).toBeCloseTo(0.5, 4);
  });

  // TI-84: normalcdf(-1, 1, 0, 1) ≈ 0.6827 (68-95-99.7 rule)
  it("P(-1 < Z < 1) ≈ 0.6827", () => {
    expect(normalcdf(-1, 1, 0, 1)).toBeCloseTo(0.6827, 4);
  });

  // TI-84: normalcdf(-2, 2, 0, 1) ≈ 0.9545
  it("P(-2 < Z < 2) ≈ 0.9545", () => {
    expect(normalcdf(-2, 2, 0, 1)).toBeCloseTo(0.9545, 4);
  });

  // TI-84: normalcdf(-3, 3, 0, 1) ≈ 0.9973
  it("P(-3 < Z < 3) ≈ 0.9973", () => {
    expect(normalcdf(-3, 3, 0, 1)).toBeCloseTo(0.9973, 4);
  });

  // TI-84: normalcdf(1.96, 1E99, 0, 1) ≈ 0.025
  it("right tail at z=1.96 ≈ 0.025", () => {
    expect(normalcdf(1.96, 1e99, 0, 1)).toBeCloseTo(0.025, 3);
  });

  // Non-standard normal: IQ score P(90 < X < 110), mean=100, sd=15
  // TI-84: normalcdf(90, 110, 100, 15) ≈ 0.4950
  it("IQ P(90 < X < 110) ≈ 0.4950", () => {
    expect(normalcdf(90, 110, 100, 15)).toBeCloseTo(0.4950, 3);
  });

  // Full range should be ~1
  it("P(-1E99 < Z < 1E99) ≈ 1", () => {
    expect(normalcdf(-1e99, 1e99, 0, 1)).toBeCloseTo(1, 4);
  });
});

describe("invNorm", () => {
  // TI-84: invNorm(0.5, 0, 1) = 0
  it("invNorm(0.5) = 0", () => {
    expect(invNorm(0.5)).toBeCloseTo(0, 4);
  });

  // TI-84: invNorm(0.975, 0, 1) ≈ 1.96
  it("invNorm(0.975) ≈ 1.96", () => {
    expect(invNorm(0.975)).toBeCloseTo(1.96, 2);
  });

  // TI-84: invNorm(0.025, 0, 1) ≈ -1.96
  it("invNorm(0.025) ≈ -1.96", () => {
    expect(invNorm(0.025)).toBeCloseTo(-1.96, 2);
  });

  // TI-84: invNorm(0.8413, 0, 1) ≈ 1.00
  it("invNorm(0.8413) ≈ 1.0", () => {
    expect(invNorm(0.8413)).toBeCloseTo(1.0, 1);
  });

  // Non-standard: invNorm(0.9, 100, 15) ≈ 119.22
  it("invNorm(0.9, 100, 15) ≈ 119.22", () => {
    expect(invNorm(0.9, 100, 15)).toBeCloseTo(119.22, 1);
  });

  it("throws on area=0", () => {
    expect(() => invNorm(0)).toThrow();
  });

  it("throws on area=1", () => {
    expect(() => invNorm(1)).toThrow();
  });
});

// ─── t-Distribution ──────────────────────────────────────────────────────────
// Values verified against t-tables and TI-84

describe("tcdf", () => {
  // TI-84: tcdf(-1E99, 0, 10) = 0.5 (symmetric)
  it("P(T <= 0, df=10) = 0.5", () => {
    expect(tcdf(-1e99, 0, 10)).toBeCloseTo(0.5, 4);
  });

  // TI-84: tcdf(-2.228, 2.228, 10) ≈ 0.95 (t-critical for 95% CI, df=10)
  it("P(-2.228 < T < 2.228, df=10) ≈ 0.95", () => {
    expect(tcdf(-2.228, 2.228, 10)).toBeCloseTo(0.95, 2);
  });

  // t-table: P(T > 2.576, df=30) ≈ 0.0076
  it("right tail P(T > 2.576, df=30) ≈ 0.0076", () => {
    expect(tcdf(2.576, 1e99, 30)).toBeCloseTo(0.0076, 2);
  });

  // For large df, t approaches normal: tcdf(-1.96, 1.96, 1000) ≈ 0.95
  it("large df approaches normal: tcdf(-1.96, 1.96, 1000) ≈ 0.95", () => {
    expect(tcdf(-1.96, 1.96, 1000)).toBeCloseTo(0.95, 2);
  });
});

describe("invT", () => {
  // TI-84: invT(0.5, 10) = 0
  it("invT(0.5, df=10) = 0", () => {
    expect(invT(0.5, 10)).toBeCloseTo(0, 2);
  });

  // TI-84: invT(0.975, 10) ≈ 2.228
  it("invT(0.975, df=10) ≈ 2.228", () => {
    expect(invT(0.975, 10)).toBeCloseTo(2.228, 2);
  });

  // TI-84: invT(0.025, 10) ≈ -2.228
  it("invT(0.025, df=10) ≈ -2.228", () => {
    expect(invT(0.025, 10)).toBeCloseTo(-2.228, 2);
  });
});

// ─── Chi-Square Distribution ─────────────────────────────────────────────────

describe("chi2cdf", () => {
  // TI-84: chi2cdf(0, 3.841, 1) ≈ 0.95 (critical value at alpha=0.05, df=1)
  it("chi2cdf(0, 3.841, df=1) ≈ 0.95", () => {
    expect(chi2cdf(0, 3.841, 1)).toBeCloseTo(0.95, 2);
  });

  // TI-84: chi2cdf(0, 5.991, 2) ≈ 0.95
  it("chi2cdf(0, 5.991, df=2) ≈ 0.95", () => {
    expect(chi2cdf(0, 5.991, 2)).toBeCloseTo(0.95, 2);
  });

  // TI-84: chi2cdf(0, 7.815, 3) ≈ 0.95
  it("chi2cdf(0, 7.815, df=3) ≈ 0.95", () => {
    expect(chi2cdf(0, 7.815, 3)).toBeCloseTo(0.95, 2);
  });

  // Full range
  it("chi2cdf(0, 1E99, df=5) ≈ 1", () => {
    expect(chi2cdf(0, 1e99, 5)).toBeCloseTo(1, 4);
  });

  // P(X <= 0) = 0
  it("chi2cdf(0, 0, df=5) = 0", () => {
    expect(chi2cdf(0, 0, 5)).toBeCloseTo(0, 4);
  });
});

// ─── Binomial Distribution ───────────────────────────────────────────────────
// All values verified against TI-84

describe("binompdf", () => {
  // TI-84: binompdf(10, 0.5, 5) ≈ 0.2461
  it("binompdf(10, 0.5, 5) ≈ 0.2461", () => {
    expect(binompdf(10, 0.5, 5)).toBeCloseTo(0.2461, 4);
  });

  // TI-84: binompdf(20, 0.3, 6) ≈ 0.1916
  it("binompdf(20, 0.3, 6) ≈ 0.1916", () => {
    expect(binompdf(20, 0.3, 6)).toBeCloseTo(0.1916, 4);
  });

  // TI-84: binompdf(20, 0.3, 0) ≈ 0.000798
  it("binompdf(20, 0.3, 0) ≈ 0.000798", () => {
    expect(binompdf(20, 0.3, 0)).toBeCloseTo(0.000798, 4);
  });

  it("binompdf(n, p, k) with k > n = 0", () => {
    expect(binompdf(5, 0.5, 6)).toBe(0);
  });

  it("binompdf(5, 0, 0) = 1", () => {
    expect(binompdf(5, 0, 0)).toBe(1);
  });

  it("binompdf(5, 1, 5) = 1", () => {
    expect(binompdf(5, 1, 5)).toBe(1);
  });

  it("binompdf(5, 0, 3) = 0", () => {
    expect(binompdf(5, 0, 3)).toBe(0);
  });
});

describe("binomcdf", () => {
  // TI-84: binomcdf(10, 0.5, 5) ≈ 0.6230
  it("binomcdf(10, 0.5, 5) ≈ 0.6230", () => {
    expect(binomcdf(10, 0.5, 5)).toBeCloseTo(0.6230, 4);
  });

  // TI-84: binomcdf(10, 0.5, 10) = 1
  it("binomcdf(10, 0.5, 10) = 1", () => {
    expect(binomcdf(10, 0.5, 10)).toBeCloseTo(1, 8);
  });

  // TI-84: binomcdf(10, 0.5, 0) ≈ 0.000977
  it("binomcdf(10, 0.5, 0) ≈ 0.000977", () => {
    expect(binomcdf(10, 0.5, 0)).toBeCloseTo(0.000977, 4);
  });

  it("binomcdf(n, p, k) with k < 0 = 0", () => {
    expect(binomcdf(10, 0.5, -1)).toBe(0);
  });
});

// ─── Poisson Distribution ────────────────────────────────────────────────────

describe("poissonpdf", () => {
  // TI-84: poissonpdf(5, 5) ≈ 0.1755
  it("poissonpdf(5, 5) ≈ 0.1755", () => {
    expect(poissonpdf(5, 5)).toBeCloseTo(0.1755, 4);
  });

  // TI-84: poissonpdf(3, 0) ≈ 0.0498
  it("poissonpdf(3, 0) ≈ 0.0498", () => {
    expect(poissonpdf(3, 0)).toBeCloseTo(0.0498, 4);
  });

  // TI-84: poissonpdf(10, 10) ≈ 0.1251
  it("poissonpdf(10, 10) ≈ 0.1251", () => {
    expect(poissonpdf(10, 10)).toBeCloseTo(0.1251, 4);
  });

  it("poissonpdf(0, 0) = 1 (degenerate)", () => {
    expect(poissonpdf(0, 0)).toBe(1);
  });
});

describe("poissoncdf", () => {
  // TI-84: poissoncdf(5, 5) ≈ 0.6160
  it("poissoncdf(5, 5) ≈ 0.6160", () => {
    expect(poissoncdf(5, 5)).toBeCloseTo(0.6160, 4);
  });

  // TI-84: poissoncdf(5, 3) ≈ 0.2650
  it("poissoncdf(5, 3) ≈ 0.2650", () => {
    expect(poissoncdf(5, 3)).toBeCloseTo(0.2650, 4);
  });

  // Large k should approach 1
  it("poissoncdf(5, 20) ≈ 1", () => {
    expect(poissoncdf(5, 20)).toBeCloseTo(1, 4);
  });

  it("poissoncdf(lambda, k) with k < 0 = 0", () => {
    expect(poissoncdf(5, -1)).toBe(0);
  });
});

// ─── Round-Trip Consistency ──────────────────────────────────────────────────

describe("round-trip consistency", () => {
  it("normalcdf then invNorm round-trips", () => {
    const area = normalcdf(-1e99, 1.5, 0, 1);
    expect(invNorm(area, 0, 1)).toBeCloseTo(1.5, 2);
  });

  it("invNorm then normalcdf round-trips", () => {
    const x = invNorm(0.9, 0, 1);
    expect(normalcdf(-1e99, x, 0, 1)).toBeCloseTo(0.9, 2);
  });

  it("invT then tcdf round-trips", () => {
    const t = invT(0.95, 15);
    expect(tcdf(-1e99, t, 15)).toBeCloseTo(0.95, 2);
  });

  it("binomial pmf sums to cdf", () => {
    let manualCdf = 0;
    for (let k = 0; k <= 7; k++) {
      manualCdf += binompdf(15, 0.4, k);
    }
    expect(manualCdf).toBeCloseTo(binomcdf(15, 0.4, 7), 8);
  });

  it("poisson pmf sums to cdf", () => {
    let manualCdf = 0;
    for (let k = 0; k <= 4; k++) {
      manualCdf += poissonpdf(3, k);
    }
    expect(manualCdf).toBeCloseTo(poissoncdf(3, 4), 8);
  });
});
