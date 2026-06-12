import { QuestionType } from "@prisma/client";
import type { GameQuestion } from "@/components/game/QuestionRenderer";

/** 初選｜團體智力測驗 — 模擬魏氏風格題型 */
export const GROUP_TEST_INTRO = {
  title: "初選｜團體智力測驗",
  tips: [
    "測驗開始前，老師會說明作答方式，請仔細聽喔！",
    "如果不確定，可以再看一次題目，不用緊張～",
    "教室裡可能有助教協助，有問題可以舉手。",
    "沒有標準答案的壓力，盡力就好！",
  ],
  passScore: 70,
};

export const GROUP_TEST_QUESTIONS: GameQuestion[] = [
  {
    id: "g1",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "▲ ■ ▲ ■ ▲ ？ 下一個圖形是？",
    options: JSON.stringify({ choices: ["■", "▲", "●", "★"] }),
    answer: JSON.stringify("■"),
    explanation: "圖形按照 ▲、■ 交替出現，下一個是 ■。",
  },
  {
    id: "g2",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "蘋果和香蕉有什麼相同？",
    options: JSON.stringify({ choices: ["都是水果", "都是紅色", "都是圓形", "都會飛"] }),
    answer: JSON.stringify("都是水果"),
    explanation: "蘋果和香蕉都可以吃，都是水果。",
  },
  {
    id: "g3",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "1、3、5、7、？ 下一個數字是？",
    options: JSON.stringify({ choices: ["8", "9", "10", "6"] }),
    answer: JSON.stringify("9"),
    explanation: "奇數序列，下一個是 9。",
  },
  {
    id: "g4",
    type: QuestionType.TRUE_FALSE,
    prompt: "所有的狗都會汪汪叫。",
    options: null,
    answer: JSON.stringify(true),
    explanation: "狗通常會汪汪叫，這是常見的特徵。",
  },
  {
    id: "g5",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "哪一個和其他三個不一樣？（汽車、腳踏車、飛機、桌子）",
    options: JSON.stringify({ choices: ["桌子", "汽車", "腳踏車", "飛機"] }),
    answer: JSON.stringify("桌子"),
    explanation: "桌子不是交通工具，其他都可以移動載人。",
  },
  {
    id: "g6",
    type: QuestionType.FILL_BLANK,
    prompt: "紅、黃、紅、黃、紅、？ 下一個顏色是___。",
    options: null,
    answer: JSON.stringify("黃"),
    explanation: "顏色紅黃交替，下一個是黃。",
  },
  {
    id: "g7",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "把正方形切一刀，哪個形狀不可能出現？",
    options: JSON.stringify({ choices: ["圓形", "長方形", "三角形", "兩個長方形"] }),
    answer: JSON.stringify("圓形"),
    explanation: "直線切割正方形不會出現圓形。",
  },
  {
    id: "g8",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "「高興」和哪個詞意思最接近？",
    options: JSON.stringify({ choices: ["開心", "生氣", "難過", "害怕"] }),
    answer: JSON.stringify("開心"),
    explanation: "高興和開心都表示心情愉快。",
  },
  {
    id: "g9",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "🐱🐶🐱🐶🐱 下一個圖案是？",
    options: JSON.stringify({ choices: ["🐶", "🐱", "🐰", "🐻"] }),
    answer: JSON.stringify("🐶"),
    explanation: "貓狗貓狗交替，下一個是狗。",
  },
  {
    id: "g10",
    type: QuestionType.TRUE_FALSE,
    prompt: "冬天通常比夏天冷。",
    options: null,
    answer: JSON.stringify(true),
    explanation: "在台灣，冬天氣溫通常比夏天低。",
  },
];
