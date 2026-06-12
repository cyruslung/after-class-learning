export interface LevelInfo {
  id: string;
  name: string;
  sortOrder: number;
}

export interface LevelSessionInfo {
  levelId: string;
  stars: number;
}

export interface LevelMapNode {
  id: string;
  name: string;
  sortOrder: number;
  index: number;
  completed: boolean;
  unlocked: boolean;
  stars: number;
}

export function buildLevelMap(
  levels: LevelInfo[],
  sessions: LevelSessionInfo[]
): LevelMapNode[] {
  const sessionByLevel = new Map<string, { completed: boolean; bestStars: number }>();

  for (const s of sessions) {
    const existing = sessionByLevel.get(s.levelId);
    if (existing) {
      existing.bestStars = Math.max(existing.bestStars, s.stars);
    } else {
      sessionByLevel.set(s.levelId, { completed: true, bestStars: s.stars });
    }
  }

  return levels.map((level, index) => {
    const session = sessionByLevel.get(level.id);
    const prevCompleted =
      index === 0 || sessionByLevel.has(levels[index - 1].id);

    return {
      id: level.id,
      name: level.name,
      sortOrder: level.sortOrder,
      index,
      completed: !!session?.completed,
      unlocked: index === 0 || prevCompleted,
      stars: session?.bestStars ?? 0,
    };
  });
}
