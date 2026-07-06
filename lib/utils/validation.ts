/** GSTIN format: 2-digit state code + PAN + entity + Z + checksum */
export const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const PHONE_REGEX = /^[0-9]{10}$/;
