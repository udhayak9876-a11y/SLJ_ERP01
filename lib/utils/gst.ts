/**
 * GST calculation for gold jewellery (3% total).
 * Intra-state (Tamil Nadu): CGST 1.5% + SGST 1.5%
 * Inter-state: IGST 3%
 */

export const HOME_STATE = "Tamil Nadu";
export const GST_RATE = 3.0;
export const CGST_RATE = 1.5;
export const SGST_RATE = 1.5;
export const IGST_RATE = 3.0;

export interface GSTBreakup {
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export function isIntraState(customerState: string | null | undefined): boolean {
  // Walk-in / unknown customers are treated as local (Tamil Nadu).
  if (!customerState) return true;
  return customerState.trim().toLowerCase() === HOME_STATE.toLowerCase();
}

export function calculateGST(
  taxableAmount: number,
  customerState: string | null | undefined
): GSTBreakup {
  if (isIntraState(customerState)) {
    const cgst = round2(taxableAmount * (CGST_RATE / 100));
    const sgst = round2(taxableAmount * (SGST_RATE / 100));
    return { cgst, sgst, igst: 0, total: round2(cgst + sgst) };
  }
  const igst = round2(taxableAmount * (IGST_RATE / 100));
  return { cgst: 0, sgst: 0, igst, total: igst };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function round3(n: number): number {
  return Math.round((n + Number.EPSILON) * 1000) / 1000;
}
