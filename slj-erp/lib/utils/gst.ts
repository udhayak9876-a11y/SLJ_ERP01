export function calculateGST(taxableAmount: number, customerState: string) {
  if (customerState === "Tamil Nadu") {
    return {
      cgst: taxableAmount * 0.015,
      sgst: taxableAmount * 0.015,
      igst: 0,
    };
  }

  return {
    cgst: 0,
    sgst: 0,
    igst: taxableAmount * 0.03,
  };
}
