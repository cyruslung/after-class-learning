export const TRACK_EARLY_ADMISSION = "early-admission";

export const EARLY_ADMISSION_UNIT_PREFIX = "提早入學";

export function isEarlyAdmissionUnit(unitName: string): boolean {
  return unitName.startsWith(EARLY_ADMISSION_UNIT_PREFIX);
}

export function filterUnitsByTrack<T extends { name: string }>(
  units: T[],
  track?: string | null
): T[] {
  if (track === TRACK_EARLY_ADMISSION) {
    return units.filter((u) => isEarlyAdmissionUnit(u.name));
  }
  return units.filter((u) => !isEarlyAdmissionUnit(u.name));
}

export function appendTrack(
  params: Record<string, string | undefined>,
  track?: string | null
): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) q.set(key, value);
  }
  if (track === TRACK_EARLY_ADMISSION) {
    q.set("track", TRACK_EARLY_ADMISSION);
  }
  return q.toString();
}

export function getTrackLabel(track?: string | null): string | null {
  if (track === TRACK_EARLY_ADMISSION) return "提早入學練習";
  return null;
}
