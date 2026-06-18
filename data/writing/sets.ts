export type WritingMode = "watch" | "trace" | "sprint";

export interface WritingCharacter {
  char: string;
  hint: string;
}

export interface WritingSet {
  id: string;
  title: string;
  description: string;
  emoji: string;
  grades: string[];
  characters: WritingCharacter[];
}

export const WRITING_SETS: WritingSet[] = [
  {
    id: "basic-strokes",
    title: "運筆入門",
    description: "從基本筆畫與簡單字開始，練習握筆與運筆穩定度",
    emoji: "✏️",
    grades: ["K2", "K3", "G1"],
    characters: [
      { char: "一", hint: "橫畫由左寫到右" },
      { char: "二", hint: "先上後下" },
      { char: "三", hint: "三條橫，上短下長" },
      { char: "十", hint: "先橫後豎" },
      { char: "人", hint: "撇捺要舒展" },
      { char: "八", hint: "撇低捺高" },
    ],
  },
  {
    id: "pictographs",
    title: "象形字入門",
    description: "日月水火山木 — 看圖記字，再練筆順",
    emoji: "🌞",
    grades: ["K3", "G1"],
    characters: [
      { char: "日", hint: "外框後填橫" },
      { char: "月", hint: "先外框再兩橫" },
      { char: "水", hint: "中豎為主，左右相對" },
      { char: "火", hint: "中間點，左右相對" },
      { char: "山", hint: "中豎最高" },
      { char: "木", hint: "橫豎撇捺" },
    ],
  },
  {
    id: "g1-common",
    title: "一年級常用字",
    description: "課本高頻字，練熟筆順可加快寫字速度",
    emoji: "📗",
    grades: ["G1"],
    characters: [
      { char: "大", hint: "先橫後撇捺" },
      { char: "小", hint: "豎鉤後兩點" },
      { char: "天", hint: "先橫後撇捺，再橫" },
      { char: "地", hint: "左窄右寬" },
      { char: "中", hint: "口後豎" },
      { char: "手", hint: "撇橫豎鉤" },
      { char: "口", hint: "先外框" },
      { char: "目", hint: "先外框再橫" },
    ],
  },
  {
    id: "g1-speed",
    title: "速度挑戰｜數字與方位",
    description: "連續書寫計時，訓練流暢度與正確筆順",
    emoji: "⚡",
    grades: ["G1", "G2"],
    characters: [
      { char: "一", hint: "穩穩橫過去" },
      { char: "二", hint: "兩橫平行" },
      { char: "三", hint: "上短下長" },
      { char: "四", hint: "先外框" },
      { char: "五", hint: "橫豎橫折橫" },
      { char: "六", hint: "點橫撇點" },
      { char: "七", hint: "橫豎彎鉤" },
      { char: "八", hint: "撇捺分開" },
      { char: "九", hint: "撇後橫折彎鉤" },
      { char: "十", hint: "橫豎交叉" },
    ],
  },
  {
    id: "g2-words",
    title: "二年級詞語字",
    description: "校園與生活常用字，加強書寫流暢度",
    emoji: "📝",
    grades: ["G2", "G3"],
    characters: [
      { char: "學", hint: "寶蓋頭下子" },
      { char: "校", hint: "木字旁" },
      { char: "友", hint: "又字旁" },
      { char: "愛", hint: "爪冖心友" },
      { char: "家", hint: "寶蓋豕" },
      { char: "國", hint: "囗字框" },
    ],
  },
];

export function getWritingSet(id: string): WritingSet | undefined {
  return WRITING_SETS.find((set) => set.id === id);
}
