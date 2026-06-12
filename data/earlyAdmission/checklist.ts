export interface ChecklistItem {
  id: string;
  label: string;
  hint: string;
  emoji: string;
}

export interface ChecklistSection {
  id: "intelligence" | "social";
  title: string;
  subtitle: string;
  emoji: string;
  minChecked: number;
  items: ChecklistItem[];
}

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: "intelligence",
    title: "智能表現",
    subtitle: "觀察孩子在語文、邏輯、空間等方面的表現",
    emoji: "🧠",
    minChecked: 6,
    items: [
      { id: "i1", emoji: "📖", label: "能清楚說出完整句子，表達自己的想法", hint: "例如能描述今天發生的事" },
      { id: "i2", emoji: "🔤", label: "認識許多字詞，喜歡聽故事或說故事", hint: "對書本、繪本有興趣" },
      { id: "i3", emoji: "🔢", label: "能比較數字大小，理解「多、少、一樣多」", hint: "數感發展良好" },
      { id: "i4", emoji: "➕", label: "會做 10 以內的簡單加減或推理", hint: "不一定要筆算，口算也可" },
      { id: "i5", emoji: "🧩", label: "喜歡拼圖、積木、七巧板等空間遊戲", hint: "能完成適齡難度的拼圖" },
      { id: "i6", emoji: "🔍", label: "能找出圖形或圖案的規律", hint: "例如紅藍紅藍…下一個是？" },
      { id: "i7", emoji: "🎵", label: "對節奏、旋律敏感，能跟著拍子律動", hint: "音樂智能表現" },
      { id: "i8", emoji: "💡", label: "遇到問題會想辦法，不只哭或放棄", hint: "有問題解決的嘗試" },
      { id: "i9", emoji: "🤔", label: "會問「為什麼」，對事物充滿好奇", hint: "主動學習動機" },
      { id: "i10", emoji: "🧸", label: "學習新事物速度快，記憶力好", hint: "教過幾次就能記住" },
    ],
  },
  {
    id: "social",
    title: "社會生活適應能力",
    subtitle: "觀察孩子在團體中的行為與情緒",
    emoji: "🤝",
    minChecked: 6,
    items: [
      { id: "s1", emoji: "👋", label: "能向老師、同學打招呼，有基本禮貌", hint: "會說請、謝謝、對不起" },
      { id: "s2", emoji: "🏫", label: "能遵守教室規則，聽從指令", hint: "例如坐好、輪流、安靜" },
      { id: "s3", emoji: "👫", label: "能與其他孩子一起玩，願意分享", hint: "不是只自己玩" },
      { id: "s4", emoji: "😊", label: "分離時不會過度焦慮，能適應新環境", hint: "爸媽離開後能安定" },
      { id: "s5", emoji: "🍱", label: "能自己用餐、收拾餐具", hint: "基本生活自理" },
      { id: "s6", emoji: "🚽", label: "能自己上廁所、洗手", hint: "不需全程協助" },
      { id: "s7", emoji: "👕", label: "能穿脫外套、鞋子（在協助下也可）", hint: "逐步獨立" },
      { id: "s8", emoji: "😢", label: "受挫時能調節情緒，不會長時間大哭", hint: "情緒恢復力" },
      { id: "s9", emoji: "⏰", label: "能配合作息，知道「等一下」「輪到了」", hint: "時間與等待概念" },
      { id: "s10", emoji: "🎯", label: "對團體活動有參與感，不會完全拒絕", hint: "願意加入大家" },
    ],
  },
];

export const CHECKLIST_ROLES = [
  { id: "parent", label: "家長檢核", emoji: "👨‍👩‍👧" },
  { id: "teacher", label: "教師檢核", emoji: "👩‍🏫" },
] as const;
