import Link from "next/link";
import type { LevelMapNode } from "@/lib/levelProgress";
import { renderStars } from "@/lib/game";

interface LevelMapProps {
  levels: LevelMapNode[];
}

export function LevelMap({ levels }: LevelMapProps) {
  if (levels.length === 0) {
    return <p className="text-sm text-muted">尚無關卡</p>;
  }

  return (
    <div className="mt-6">
      <p className="mb-4 text-center text-sm font-semibold text-muted">🗺️ 闖關地圖</p>
      <div className="relative flex flex-col items-center gap-0 py-4">
        {levels.map((level, idx) => (
          <div key={level.id} className="flex flex-col items-center">
            <LevelNode level={level} />
            {idx < levels.length - 1 && (
              <div
                className={`my-1 h-10 w-1 rounded-full ${
                  level.completed ? "bg-secondary" : "bg-orange-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LevelNode({ level }: { level: LevelMapNode }) {
  const nodeContent = (
    <div
      className={`relative flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 shadow-md transition sm:h-24 sm:w-24 ${
        level.unlocked
          ? level.completed
            ? "border-yellow-400 bg-yellow-50 hover:scale-105"
            : "border-primary bg-white hover:scale-105 hover:bg-orange-50"
          : "cursor-not-allowed border-gray-300 bg-gray-100 opacity-70"
      }`}
      title={level.name}
    >
      <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
        {level.index + 1}
      </span>

      {!level.unlocked ? (
        <span className="text-2xl sm:text-3xl">🔒</span>
      ) : level.completed ? (
        <span className="text-lg sm:text-xl">{renderStars(Math.min(level.stars, 3))}</span>
      ) : (
        <span className="text-2xl sm:text-3xl">▶️</span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1">
      {level.unlocked ? (
        <Link href={`/game/${level.id}`} className="group flex flex-col items-center">
          {nodeContent}
          <span className="mt-2 max-w-[8rem] text-center text-sm font-bold text-foreground group-hover:text-primary">
            {level.name}
          </span>
          {!level.completed && (
            <span className="text-xs font-semibold text-primary">開始闖關</span>
          )}
        </Link>
      ) : (
        <div className="flex flex-col items-center">
          {nodeContent}
          <span className="mt-2 max-w-[8rem] text-center text-sm font-semibold text-muted">
            {level.name}
          </span>
          <span className="text-xs text-muted">完成前一關解鎖</span>
        </div>
      )}
    </div>
  );
}
