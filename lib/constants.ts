export const DEMO_USER_ID = "demo-user";

export const GRADE_OPTIONS = {
  kindergarten: [
    { code: "K1", name: "小班" },
    { code: "K2", name: "中班" },
    { code: "K3", name: "大班" },
  ],
  elementary: [
    { code: "G1", name: "一年級" },
    { code: "G2", name: "二年級" },
    { code: "G3", name: "三年級" },
    { code: "G4", name: "四年級" },
    { code: "G5", name: "五年級" },
    { code: "G6", name: "六年級" },
  ],
} as const;

export const SEMESTER_OPTIONS = [
  { code: "S1", name: "上學期" },
  { code: "S2", name: "下學期" },
] as const;

export const SUBJECT_OPTIONS = [
  { code: "CHINESE", name: "國語", emoji: "📖", color: "bg-red-100 border-red-300 hover:bg-red-200" },
  { code: "ENGLISH", name: "英文", emoji: "🔤", color: "bg-blue-100 border-blue-300 hover:bg-blue-200" },
  { code: "MATH", name: "數學", emoji: "🔢", color: "bg-green-100 border-green-300 hover:bg-green-200" },
] as const;

export type SubjectCode = (typeof SUBJECT_OPTIONS)[number]["code"];
export type GradeCode = (typeof GRADE_OPTIONS.kindergarten)[number]["code"] | (typeof GRADE_OPTIONS.elementary)[number]["code"];
export type SemesterCode = (typeof SEMESTER_OPTIONS)[number]["code"];

export const EARLY_ADMISSION_ENTRY = {
  label: "提早入學模擬鑑定",
  emoji: "🌟",
  description: "檢核表 → 團體智力測驗 → 個別智力測驗，模擬真實鑑定流程",
} as const;
