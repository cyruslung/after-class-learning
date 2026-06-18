const STORAGE_KEY = "after-class-writing-best";

export interface SprintRecord {
  setId: string;
  seconds: number;
  mistakes: number;
  at: string;
}

type RecordMap = Record<string, SprintRecord>;

function readAll(): RecordMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as RecordMap;
  } catch {
    return {};
  }
}

export function getBestSprint(setId: string): SprintRecord | null {
  return readAll()[setId] ?? null;
}

export function saveBestSprint(record: SprintRecord) {
  const all = readAll();
  const prev = all[record.setId];
  if (!prev || record.seconds < prev.seconds) {
    all[record.setId] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  }
  return false;
}

export function formatSeconds(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m} 分 ${s} 秒` : `${s} 秒`;
}
