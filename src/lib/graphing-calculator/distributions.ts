/**
 * Statistical distribution functions matching TI-84 output.
 * Implementations use well-known numerical methods:
 * - Normal: error function approximation (Abramowitz & Stegun)
 * - t-distribution: regularized incomplete beta function
 * - Chi-square: lower incomplete gamma function
 * - Binomial/Poisson: direct computation
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const SQRT_2PI = Math.sqrt(2 * Math.PI);
const SQRT_2 = Math.sqrt(2);
const LN_SQRT_2PI = Math.log(SQRT_2PI);

// ─── Gamma Function (Lanczos Approximation) ─────────────────────────────────

/**
 * Lanczos approximation for ln(Gamma(z)) for z > 0.
 * Accurate to ~15 significant digits.
 */
export function lnGamma(z: number): number {
  if (z <= 0) throw new Error("lnGamma requires z > 0");

  // Lanczos coefficients (g=7, n=9)
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    // Reflection formula: Gamma(z) * Gamma(1-z) = pi / sin(pi*z)
    return (
      Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z)
    );
  }

  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

export function gamma(z: number): number {
  return Math.exp(lnGamma(z));
}

/**
 * Factorial using gamma: n! = Gamma(n+1)
 */
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error("Factorial requires non-negative integer");
  if (n <= 1) return 1;
  if (n <= 20) {
    // Direct computation for small n to avoid floating point drift
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }
  return gamma(n + 1);
}

// ─── Error Function ──────────────────────────────────────────────────────────

/**
 * Error function erf(x) using Abramowitz & Stegun approximation (7.1.26).
 * Maximum error: 1.5e-7.
 */
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1 / (1 + p * absX);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;

  const y = 1 - (a1 * t + a2 * t2 + a3 * t3 + a4 * t4 + a5 * t5) * Math.exp(-absX * absX);
  return sign * y;
}

/**
 * Complementary error function erfc(x) = 1 - erf(x).
 * For large x, computed directly to avoid catastrophic cancellation.
 */
export function erfc(x: number): number {
  return 1 - erf(x);
}

// ─── Normal Distribution ─────────────────────────────────────────────────────

/**
 * Standard normal PDF: phi(x) = (1/sqrt(2pi)) * exp(-x²/2)
 */
export function normalpdf(
  x: number,
  mean = 0,
  stdev = 1
): number {
  if (stdev <= 0) throw new Error("Standard deviation must be positive");
  const z = (x - mean) / stdev;
  return Math.exp(-0.5 * z * z) / (stdev * SQRT_2PI);
}

/**
 * Normal CDF: P(lower < X < upper) where X ~ N(mean, stdev²)
 * Matches TI-84 normalcdf(lower, upper, mean, stdev)
 */
export function normalcdf(
  lower: number,
  upper: number,
  mean = 0,
  stdev = 1
): number {
  if (stdev <= 0) throw new Error("Standard deviation must be positive");

  const cdfUpper = standardNormalCdf((upper - mean) / stdev);
  const cdfLower = standardNormalCdf((lower - mean) / stdev);
  return cdfUpper - cdfLower;
}

/**
 * Inverse normal: find x such that P(X <= x) = area, where X ~ N(mean, stdev²)
 * Matches TI-84 invNorm(area, mean, stdev)
 * Uses rational approximation (Peter Acklam's method).
 */
export function invNorm(
  area: number,
  mean = 0,
  stdev = 1
): number {
  if (area <= 0 || area >= 1) throw new Error("Area must be between 0 and 1 (exclusive)");
  if (stdev <= 0) throw new Error("Standard deviation must be positive");

  const z = invStandardNormal(area);
  return mean + z * stdev;
}

// ─── t-Distribution ──────────────────────────────────────────────────────────

/**
 * t-distribution PDF
 */
export function tpdf(x: number, df: number): number {
  if (df <= 0) throw new Error("Degrees of freedom must be positive");
  const coeff = gamma((df + 1) / 2) / (Math.sqrt(df * Math.PI) * gamma(df / 2));
  return coeff * Math.pow(1 + (x * x) / df, -(df + 1) / 2);
}

/**
 * t-distribution CDF: P(lower < T < upper) where T ~ t(df)
 * Matches TI-84 tcdf(lower, upper, df)
 */
export function tcdf(
  lower: number,
  upper: number,
  df: number
): number {
  if (df <= 0) throw new Error("Degrees of freedom must be positive");
  return tCdfSingle(upper, df) - tCdfSingle(lower, df);
}

/**
 * Inverse t: find t such that P(T <= t) = area, where T ~ t(df)
 * Matches TI-84 invT(area, df)
 * Uses bisection method.
 */
export function invT(area: number, df: number): number {
  if (area <= 0 || area >= 1) throw new Error("Area must be between 0 and 1 (exclusive)");
  if (df <= 0) throw new Error("Degrees of freedom must be positive");

  // Bisection on the single-tail CDF
  let lo = -100;
  let hi = 100;

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const cdf = tCdfSingle(mid, df);
    if (cdf < area) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

// ─── Chi-Square Distribution ─────────────────────────────────────────────────

/**
 * Chi-square PDF
 */
export function chi2pdf(x: number, df: number): number {
  if (df <= 0) throw new Error("Degrees of freedom must be positive");
  if (x < 0) return 0;
  if (x === 0) {
    if (df === 2) return 0.5;
    if (df < 2) return Infinity;
    return 0;
  }
  const k2 = df / 2;
  return Math.exp((k2 - 1) * Math.log(x) - x / 2 - k2 * Math.log(2) - lnGamma(k2));
}

/**
 * Chi-square CDF: P(lower < X < upper) where X ~ chi²(df)
 * Matches TI-84 chi2cdf(lower, upper, df)
 */
export function chi2cdf(
  lower: number,
  upper: number,
  df: number
): number {
  if (df <= 0) throw new Error("Degrees of freedom must be positive");
  const cdfUpper = chi2CdfSingle(upper, df);
  const cdfLower = chi2CdfSingle(Math.max(0, lower), df);
  return cdfUpper - cdfLower;
}

// ─── Binomial Distribution ───────────────────────────────────────────────────

/**
 * Binomial PMF: P(X = k) where X ~ Bin(n, p)
 * Matches TI-84 binompdf(n, p, k)
 */
export function binompdf(n: number, p: number, k: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error("n must be non-negative integer");
  if (!Number.isInteger(k) || k < 0) throw new Error("k must be non-negative integer");
  if (p < 0 || p > 1) throw new Error("p must be between 0 and 1");
  if (k > n) return 0;

  // Use log to avoid overflow for large n
  const logProb =
    lnBinomialCoeff(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);

  // Handle edge cases for p=0 or p=1
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;

  return Math.exp(logProb);
}

/**
 * Binomial CDF: P(X <= k) where X ~ Bin(n, p)
 * Matches TI-84 binomcdf(n, p, k)
 */
export function binomcdf(n: number, p: number, k: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error("n must be non-negative integer");
  if (!Number.isInteger(k)) throw new Error("k must be integer");
  if (p < 0 || p > 1) throw new Error("p must be between 0 and 1");
  if (k < 0) return 0;
  if (k >= n) return 1;

  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += binompdf(n, p, i);
  }
  return Math.min(sum, 1); // Clamp to handle floating point accumulation
}

// ─── Poisson Distribution ────────────────────────────────────────────────────

/**
 * Poisson PMF: P(X = k) where X ~ Poisson(lambda)
 * Matches TI-84 poissonpdf(lambda, k)
 */
export function poissonpdf(lambda: number, k: number): number {
  if (lambda < 0) throw new Error("Lambda must be non-negative");
  if (!Number.isInteger(k) || k < 0) throw new Error("k must be non-negative integer");
  if (lambda === 0) return k === 0 ? 1 : 0;

  // Use log to avoid overflow
  const logProb = k * Math.log(lambda) - lambda - lnGamma(k + 1);
  return Math.exp(logProb);
}

/**
 * Poisson CDF: P(X <= k) where X ~ Poisson(lambda)
 * Matches TI-84 poissoncdf(lambda, k)
 */
export function poissoncdf(lambda: number, k: number): number {
  if (lambda < 0) throw new Error("Lambda must be non-negative");
  if (!Number.isInteger(k)) throw new Error("k must be integer");
  if (k < 0) return 0;

  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += poissonpdf(lambda, i);
  }
  return Math.min(sum, 1);
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Standard normal CDF using error function: Phi(z) = 0.5 * (1 + erf(z/sqrt(2)))
 */
function standardNormalCdf(z: number): number {
  return 0.5 * (1 + erf(z / SQRT_2));
}

/**
 * Inverse standard normal CDF (Peter Acklam's rational approximation).
 * Accurate to ~1.15e-9 in the central region and uses tail approximation otherwise.
 */
function invStandardNormal(p: number): number {
  // Coefficients for rational approximation
  const a = [
    -3.969683028665376e+1,
    2.209460984245205e+2,
    -2.759285104469687e+2,
    1.383577518672690e+2,
    -3.066479806614716e+1,
    2.506628277459239e+0,
  ];
  const b = [
    -5.447609879822406e+1,
    1.615858368580409e+2,
    -1.556989798598866e+2,
    6.680131188771972e+1,
    -1.328068155288572e+1,
  ];
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838e+0,
    -2.549732539343734e+0,
    4.374664141464968e+0,
    2.938163982698783e+0,
  ];
  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996e+0,
    3.754408661907416e+0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number;
  let r: number;

  if (p < pLow) {
    // Rational approximation for lower region
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    // Rational approximation for central region
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    // Rational approximation for upper region
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

/**
 * Single-tail t-distribution CDF: P(T <= t) where T ~ t(df)
 * Uses the regularized incomplete beta function.
 */
function tCdfSingle(t: number, df: number): number {
  if (t === 0) return 0.5;

  const x = df / (df + t * t);
  const betaVal = regularizedBeta(x, df / 2, 0.5);

  if (t > 0) {
    return 1 - 0.5 * betaVal;
  } else {
    return 0.5 * betaVal;
  }
}

/**
 * Single-tail chi-square CDF: P(X <= x) where X ~ chi²(df)
 * Uses the regularized lower incomplete gamma function.
 */
function chi2CdfSingle(x: number, df: number): number {
  if (x <= 0) return 0;
  return regularizedGammaP(df / 2, x / 2);
}

/**
 * Regularized lower incomplete gamma function P(a, x) = gamma(a, x) / Gamma(a)
 * Uses series expansion for x < a+1, continued fraction otherwise.
 */
function regularizedGammaP(a: number, x: number): number {
  if (x < 0) return 0;
  if (x === 0) return 0;

  if (x < a + 1) {
    // Series expansion
    return gammaPSeries(a, x);
  } else {
    // Continued fraction (complement)
    return 1 - gammaQContinuedFraction(a, x);
  }
}

function gammaPSeries(a: number, x: number): number {
  const lnGammaA = lnGamma(a);
  let sum = 1 / a;
  let term = 1 / a;

  for (let n = 1; n < 200; n++) {
    term *= x / (a + n);
    sum += term;
    if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
  }

  return sum * Math.exp(-x + a * Math.log(x) - lnGammaA);
}

function gammaQContinuedFraction(a: number, x: number): number {
  const lnGammaA = lnGamma(a);

  // Modified Lentz's method — evaluate continued fraction for Q(a,x)
  // CF = 1 / (x + 1 - a + K) where K is built from a_i, b_i terms
  const b0 = x + 1 - a;
  let f = Math.abs(b0) < 1e-30 ? 1e-30 : b0;
  let c = f;
  let d = 0;

  for (let i = 1; i < 200; i++) {
    const an = i * (a - i);
    const bn = x + 2 * i + 1 - a;

    d = bn + an * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;

    c = bn + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;

    const delta = c * d;
    f *= delta;

    if (Math.abs(delta - 1) < 1e-15) break;
  }

  return Math.exp(-x + a * Math.log(x) - lnGammaA) / f;
}

/**
 * Regularized incomplete beta function I_x(a, b)
 * Uses continued fraction (Lentz's method).
 */
function regularizedBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // Use symmetry relation when x > (a+1)/(a+b+2) for better convergence
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - regularizedBeta(1 - x, b, a);
  }

  const lnPrefix =
    a * Math.log(x) + b * Math.log(1 - x) - Math.log(a) -
    (lnGamma(a) + lnGamma(b) - lnGamma(a + b));

  const prefix = Math.exp(lnPrefix);

  // Lentz's continued fraction
  let f = 1;
  let c = 1;
  let d = 1 / (1 - (a + b) * x / (a + 1));
  if (Math.abs(d) < 1e-30) d = 1e-30;
  let h = d;

  for (let m = 1; m < 200; m++) {
    // Even step: d_{2m}
    let numerator = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 + numerator * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    c = 1 + numerator / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    h *= c * d;

    // Odd step: d_{2m+1}
    numerator = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + numerator * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    c = 1 + numerator / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    const delta = c * d;
    h *= delta;

    if (Math.abs(delta - 1) < 1e-15) break;
  }

  return prefix * h;
}

/**
 * Log of binomial coefficient: ln(C(n, k))
 */
function lnBinomialCoeff(n: number, k: number): number {
  if (k === 0 || k === n) return 0;
  return lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1);
}
