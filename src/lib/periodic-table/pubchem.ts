const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound";

export interface MolecularData {
  sdfData: string;
  compoundName: string;
  cid: number;
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

async function fetch3dSdf(
  cid: number,
  signal?: AbortSignal
): Promise<string | null> {
  try {
    const res = await fetch(
      `${PUBCHEM_BASE}/cid/${cid}/SDF?record_type=3d`,
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

  // Fetch SDF and name in parallel
  const [sdfData, compoundName] = await Promise.all([
    fetch3dSdf(cid, signal),
    fetchCompoundName(cid, signal),
  ]);

  if (!sdfData) return null;

  const result: MolecularData = { sdfData, compoundName, cid };
  cache.set(formula, result);
  return result;
}
