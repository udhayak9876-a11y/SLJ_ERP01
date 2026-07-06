export interface GSTBreakdown {
  cgst: number;
  sgst: number;
  igst: number;
}

export function calculateGST(
  taxableAmount: number,
  customerState: string
): GSTBreakdown {
  if (customerState === "Tamil Nadu") {
    return {
      cgst: round2(taxableAmount * 0.015),
      sgst: round2(taxableAmount * 0.015),
      igst: 0,
    };
  }
  return {
    cgst: 0,
    sgst: 0,
    igst: round2(taxableAmount * 0.03),
  };
}

export function calculateLineGST(taxableAmount: number, gstRate = 3): number {
  return round2(taxableAmount * (gstRate / 100));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
