const STORAGE_KEY = "early-admission-progress";

export interface EarlyAdmissionProgress {
  checklistPassed: boolean;
  checklistParentAt?: string;
  checklistTeacherAt?: string;
  groupTestPassed: boolean;
  groupTestScore?: number;
  individualTestPassed: boolean;
  individualTestScore?: number;
}

const DEFAULT: EarlyAdmissionProgress = {
  checklistPassed: false,
  groupTestPassed: false,
  individualTestPassed: false,
};

export function getProgress(): EarlyAdmissionProgress {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function saveProgress(update: Partial<EarlyAdmissionProgress>): EarlyAdmissionProgress {
  const next = { ...getProgress(), ...update };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function resetProgress(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function canAccessGroupTest(p: EarlyAdmissionProgress): boolean {
  return p.checklistPassed;
}

export function canAccessIndividualTest(p: EarlyAdmissionProgress): boolean {
  return p.checklistPassed && p.groupTestPassed;
}
