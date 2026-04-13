export const AUDIT_REGIONS = [
  { value: 'INDIA', label: 'India (BIS/FSSAI)' },
  { value: 'USA', label: 'USA (FDA)' },
  { value: 'EU', label: 'EU (EFSA)' },
] as const;

export type AuditRegion = (typeof AUDIT_REGIONS)[number]['value'];

export const DEFAULT_AUDIT_REGION: AuditRegion = 'INDIA';

export function formatRegionLabel(region?: string | null) {
  if (!region) return 'Global';

  const matched = AUDIT_REGIONS.find((item) => item.value === region);
  return matched?.label ?? region;
}
