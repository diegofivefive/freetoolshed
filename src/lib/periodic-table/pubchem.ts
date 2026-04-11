const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound";

export interface MolecularData {
  sdfData: string;
  compoundName: string;
  cid: number;
  is2d: boolean;
}

/** Hardcoded CIDs for preset formulas — skips the formula lookup step */
const PRESET_CIDS: Record<string, number> = {
  H2O: 962,
  NaCl: 5234,
  H2SO4: 1118,
  C6H12O6: 5793,
  CaCO3: 10112,
  NH3: 222,
  C2H5OH: 702,
  "Ca(OH)2": 6093208,
  Fe2O3: 14833,
  "Mg3(PO4)2": 24456,
  C8H10N4O2: 2519,
  C9H8O4: 2244,
};

const cache = new Map<string, MolecularData>();

async function fetchCidForFormula(
  formula: string,
  signal?: AbortSignal
): Promise<number | null> {
  // Check presets first
  if (PRESET_CIDS[formula] !== undefined) {
    return PRESET_CIDS[formula];
  }

  try {
    const res = await fetch(
      `${PUBCHEM_BASE}/fastformula/${encodeURIComponent(formula)}/cids/JSON`,
      { signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const cids = data?.IdentifierList?.CID;
    if (!Array.isArray(cids) || cids.length === 0) return null;
    return cids[0];
  } catch {
    return null;
  }
}

async function fetchSdf(
  cid: number,
  recordType: "3d" | "2d",
  signal?: AbortSignal
): Promise<string | null> {
  try {
    const res = await fetch(
      `${PUBCHEM_BASE}/cid/${cid}/SDF?record_type=${recordType}`,
      { signal }
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchCompoundName(
  cid: number,
  signal?: AbortSignal
): Promise<string> {
  try {
    const res = await fetch(
      `${PUBCHEM_BASE}/cid/${cid}/property/IUPACName/JSON`,
      { signal }
    );
    if (!res.ok) return "Unknown compound";
    const data = await res.json();
    const name =
      data?.PropertyTable?.Properties?.[0]?.IUPACName ?? "Unknown compound";
    return name;
  } catch {
    return "Unknown compound";
  }
}

export async function fetchMolecularData(
  formula: string,
  signal?: AbortSignal
): Promise<MolecularData | null> {
  // Check cache
  const cached = cache.get(formula);
  if (cached) return cached;

  const cid = await fetchCidForFormula(formula, signal);
  if (!cid) return null;

  // Fetch 3D SDF and name in parallel
  const [sdfData3d, compoundName] = await Promise.all([
    fetchSdf(cid, "3d", signal),
    fetchCompoundName(cid, signal),
  ]);

  if (sdfData3d) {
    const result: MolecularData = { sdfData: sdfData3d, compoundName, cid, is2d: false };
    cache.set(formula, result);
    return result;
  }

  // Fallback to 2D structure
  const sdfData2d = await fetchSdf(cid, "2d", signal);
  if (!sdfData2d) return null;

  const result: MolecularData = { sdfData: sdfData2d, compoundName, cid, is2d: true };
  cache.set(formula, result);
  return result;
}
