import { QuestionType } from "@prisma/client";
import type { GameQuestion } from "@/components/game/QuestionRenderer";

/** 複選｜個別智力測驗 — 積木、七巧板、畫圖、圖形推理 */
export const INDIVIDUAL_TEST_INTRO = {
  title: "複選｜個別智力測驗",
  tips: [
    "這是一對一的測驗，老師會慢慢說明題目。",
    "可能會用到積木、七巧板或畫圖，好好表現！",
    "沒有對錯的壓力，展現平常的能力就好。",
    "可以想一想再回答，不用搶快。",
  ],
  passScore: 70,
};

export const INDIVIDUAL_TEST_QUESTIONS: GameQuestion[] = [
  {
    id: "i1",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "🧱 積木塔：紅-藍-紅-藍-紅，下一塊積木顏色？",
    options: JSON.stringify({ choices: ["藍色", "紅色", "黃色", "綠色"] }),
    answer: JSON.stringify("藍色"),
    explanation: "紅藍交替，紅色後面是藍色。",
  },
  {
    id: "i2",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "🧩 七巧板：「正方形」可以用幾塊三角形拼成？（提示：2 塊小三角可拼正方形）",
    options: JSON.stringify({ choices: ["2 塊", "5 塊", "7 塊", "1 塊"] }),
    answer: JSON.stringify("2 塊"),
    explanation: "兩塊相同的直角三角形可以拼成一個正方形。",
  },
  {
    id: "i3",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "🎨 畫圖：缺少的部分應該畫什麼？（一張臉有眼睛、鼻子，缺 ___）",
    options: JSON.stringify({ choices: ["嘴巴", "耳朵", "頭髮", "手"] }),
    answer: JSON.stringify("嘴巴"),
    explanation: "完整的臉通常有眼睛、鼻子和嘴巴。",
  },
  {
    id: "i4",
    type: QuestionType.TRUE_FALSE,
    prompt: "把兩個一樣的三角形拼在一起，可以變成一個正方形。",
    options: null,
    answer: JSON.stringify(true),
    explanation: "兩個直角三角形可以拼成正方形。",
  },
  {
    id: "i5",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "🔺 哪個圖形可以疊在另一個上面，形狀完全重合？（兩個一樣大的圓）",
    options: JSON.stringify({ choices: ["可以", "不可以", "變成方形", "變成三角"] }),
    answer: JSON.stringify("可以"),
    explanation: "相同大小的圓形可以完全重合。",
  },
  {
    id: "i6",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "🖍️ 畫圖順序：先畫頭，再畫身體，最後通常畫什麼？",
    options: JSON.stringify({ choices: ["手腳", "眼睛", "耳朵", "頭髮"] }),
    answer: JSON.stringify("手腳"),
    explanation: "畫人時常見順序：頭→身體→手腳。",
  },
  {
    id: "i7",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "🧱 3 塊積木疊起來，拿走最上面 1 塊，還剩幾塊？",
    options: JSON.stringify({ choices: ["2 塊", "3 塊", "1 塊", "0 塊"] }),
    answer: JSON.stringify("2 塊"),
    explanation: "3 減 1 等於 2。",
  },
  {
    id: "i8",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "🧩 哪個形狀是七巧板裡的？（三角形、長方形、圓形、星形）",
    options: JSON.stringify({ choices: ["三角形", "圓形", "星形", "橢圓"] }),
    answer: JSON.stringify("三角形"),
    explanation: "七巧板由三角形、正方形、平行四邊形組成，沒有圓形。",
  },
  {
    id: "i9",
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: "🎨 把半圓和半圓拼在一起，可以變成什麼？",
    options: JSON.stringify({ choices: ["圓形", "正方形", "三角形", "長方形"] }),
    answer: JSON.stringify("圓形"),
    explanation: "兩個一樣的半圓可以拼成一個完整的圓。",
  },
  {
    id: "i10",
    type: QuestionType.FILL_BLANK,
    prompt: "🧱 用積木蓋房子：先鋪地基，再疊牆壁，最後放___。",
    options: null,
    answer: JSON.stringify("屋頂"),
    explanation: "蓋房子常見順序：地基→牆壁→屋頂。",
  },
];
