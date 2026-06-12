import type { ZhuyinGalleryItem, ZhuyinWordCard } from "./zhuyin-types";

type Ex = [word: string, emoji: string, zhuyin: string, hint: string];

const COLORS = [
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-blue-400",
  "from-lime-400 to-green-500",
  "from-fuchsia-400 to-pink-500",
];

let colorIdx = 0;
function nextColor() {
  const c = COLORS[colorIdx % COLORS.length];
  colorIdx++;
  return c;
}

function ex(list: Ex[]): ZhuyinWordCard[] {
  return list.map(([word, emoji, zhuyin, hint]) => ({ word, emoji, zhuyin, hint }));
}

export function buildZhuyin(
  id: string,
  symbol: string,
  category: ZhuyinGalleryItem["category"],
  group: string,
  emoji: string,
  soundLike: string,
  airTip: string,
  mouthTip: string,
  examples: Ex[],
  funFact: string,
  color?: string
): ZhuyinGalleryItem {
  const kind = category === "consonant" ? "聲母" : category === "vowel" ? "韻母" : "介音";
  return {
    id,
    symbol,
    category,
    group,
    title: `${symbol} ${kind}`,
    emoji,
    color: color ?? nextColor(),
    soundLike,
    airTip,
    mouthTip,
    exampleWords: ex(examples),
    funFact,
  };
}
