export interface ZhuyinWordCard {
  word: string;
  emoji: string;
  zhuyin: string;
  hint: string;
}

export interface ZhuyinGalleryItem {
  id: string;
  symbol: string;
  category: "consonant" | "vowel" | "medial";
  group: string;
  title: string;
  emoji: string;
  color: string;
  soundLike: string;
  airTip: string;
  mouthTip: string;
  exampleWords: ZhuyinWordCard[];
  funFact: string;
}

export interface ZhuyinCategory {
  id: "consonant" | "vowel" | "medial" | "all";
  label: string;
  emoji: string;
}

export const ZHUYIN_CATEGORIES: ZhuyinCategory[] = [
  { id: "all", label: "全部", emoji: "📚" },
  { id: "consonant", label: "聲母", emoji: "🔤" },
  { id: "vowel", label: "韻母", emoji: "🎵" },
  { id: "medial", label: "介音", emoji: "🧩" },
];
