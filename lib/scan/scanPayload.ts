// Centralized QR/barcode payload format so generators and the scan resolver never drift.
//
// Format: "<type>:<uuid>" (compact prefix keeps QR density low).
// Unprefixed input (e.g. legacy lot labels that encode a bare UUID) defaults to "lot".

export const SCAN_TYPES = {
  sample: "sample",
  lot: "lot",
} as const;

export type ScanType = (typeof SCAN_TYPES)[keyof typeof SCAN_TYPES];

const KNOWN_TYPES = Object.values(SCAN_TYPES) as string[];

export type ParsedScan = {
  type: ScanType;
  id: string;
};

export const buildScanPayload = (type: ScanType, id: string): string =>
  `${type}:${id}`;

export const parseScanPayload = (raw: string): ParsedScan => {
  const value = raw.trim();
  const separatorIndex = value.indexOf(":");

  if (separatorIndex > 0) {
    const prefix = value.slice(0, separatorIndex);
    const id = value.slice(separatorIndex + 1).trim();
    if (KNOWN_TYPES.includes(prefix) && id) {
      return { type: prefix as ScanType, id };
    }
  }

  // Bare UUID (no known prefix) — treat as a legacy lot label.
  return { type: SCAN_TYPES.lot, id: value };
};
