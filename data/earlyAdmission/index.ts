export * from "./checklist";
export * from "./groupTest";
export * from "./individualTest";

export const EARLY_ADMISSION_INFO = {
  title: "提早入學鑑定模擬練習",
  disclaimer:
    "本模擬練習僅供家長與孩子熟悉流程，非官方鑑定試題。實際鑑定請依各縣市教育局公告為準。",
  eligibility: [
    "設籍本縣（各縣市規定略有不同）",
    "年滿五足歲、未滿六足歲",
    "身心發展良好，具資賦優異特質",
    "社會適應行為與國小一年級學童相當",
    "經家長評估提早入學對學習有助益",
  ],
  process: [
    {
      step: 1,
      id: "checklist",
      title: "報名檢核表",
      subtitle: "家長與教師填寫",
      description:
        "填寫智能表現與社會生活適應能力檢核表，兩者皆需達到一定程度方可報名參加測驗。",
      emoji: "📋",
      href: "/early-admission/checklist",
    },
    {
      step: 2,
      id: "group",
      title: "初選｜團體智力測驗",
      subtitle: "標準化智力測驗（團體）",
      description:
        "採團體方式施測，類似魏氏智力量表風格。通過標準：平均數正 2 個標準差以上或 PR 97 以上（部分縣市為 PR 93）。",
      emoji: "👥",
      href: "/early-admission/group-test",
      requires: "checklist",
    },
    {
      step: 3,
      id: "individual",
      title: "複選｜個別智力測驗",
      subtitle: "一對一施測",
      description:
        "通過初選後進行個別測驗，可能包含積木、七巧板、畫圖、圖形推理等項目，並評量社會適應能力。",
      emoji: "🧩",
      href: "/early-admission/individual-test",
      requires: "group",
    },
  ],
} as const;
