import type { BankUnit } from "./types";
import { kindergartenUnits } from "./kindergarten";
import { elementaryKangHsuanUnits } from "./elementary";
import { expansionUnits } from "./expansion";
import { officialTcoolUnits } from "./official-tcool";
import { xinbeiCharacterUnits } from "./xinbei-characters";
import { xinbeiExamUnits } from "./xinbei-exams";

export * from "./types";
export { mc, tf, fb, match, order, serializeQuestion } from "./helpers";
export {
  kangDesc,
  xinbeiDesc,
  KANGHSUAN_SOURCE,
  XINBEI_EXAM_SOURCE,
  XINBEI_CHARACTER_SOURCE,
  TCOOL_OFFICIAL_SOURCE,
  JUNYI_K_SOURCE,
} from "./curriculumMeta";
export { kindergartenUnits } from "./kindergarten";
export { elementaryKangHsuanUnits } from "./elementary";
export { xinbeiCharacterUnits } from "./xinbei-characters";
export { xinbeiExamUnits } from "./xinbei-exams";
export { expansionUnits } from "./expansion";
export { officialTcoolUnits } from "./official-tcool";

export const ALL_CURRICULUM_UNITS: BankUnit[] = [
  ...kindergartenUnits,
  ...elementaryKangHsuanUnits,
  ...xinbeiCharacterUnits,
  ...xinbeiExamUnits,
  ...officialTcoolUnits,
  ...expansionUnits,
];

export const CURRICULUM_SOURCES = [
  {
    id: "kanghsuan-xinbei",
    name: "康軒版（新北市常用）",
    description: "依 108 課綱與均一教育平台「類康軒版」單元架構編排的原創練習題",
    referenceUrl: "https://www.junyiacademy.org/topics/k-m1a",
    grades: ["G1", "G2", "G3", "G4", "G5", "G6"],
  },
  {
    id: "early-admission",
    name: "提早入學鑑定模擬",
    description: "獨立三階段模擬流程（檢核表、團體測驗、個別測驗），非官方試題",
    referenceUrl: "/early-admission",
    grades: ["K3"],
  },
  {
    id: "kindergarten-general",
    name: "幼兒園啟蒙",
    description: "小班、中班、大班上下學期國語、數學、英文啟蒙練習",
    referenceUrl: "https://www.junyiacademy.org/",
    grades: ["K1", "K2", "K3"],
  },
  {
    id: "xinbei-characters",
    name: "新北市｜認識國字・練習國字",
    description: "部首、象形字、形聲字、成語拆字，含配對與排序互動遊戲題",
    referenceUrl: "https://www.tcool.cc/",
    grades: ["G1", "G2", "G3", "G4", "G5", "G6"],
  },
  {
    id: "xinbei-exams",
    name: "新北市段考風格應用題",
    description: "生活化應用題與閱讀測驗，模擬新北市學校段考題型",
    referenceUrl: "https://www.tcool.cc/",
    grades: ["G1", "G2", "G3", "G4", "G5", "G6"],
  },
  {
    id: "tcool-official",
    name: "tcool.cc 考古題（內建精選）",
    description:
      "對應 tcool.cc 考卷 ID 的段考風格精選題；完整 PDF 可於後台 /admin/import-tcool 上傳匯入",
    referenceUrl: "https://www.tcool.cc/",
    grades: ["G3", "G4", "G5", "G6"],
  },
  {
    id: "tcool",
    name: "中小學題庫網（手動匯入）",
    description:
      "可至 tcool.cc 下載新北市學校段考考古題（含解答），轉成 JSON/CSV 或上傳 PDF 於後台匯入",
    referenceUrl: "https://www.tcool.cc/",
    grades: ["G1", "G2", "G3", "G4", "G5", "G6"],
  },
] as const;
